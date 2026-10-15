#!/usr/bin/env python3
# app.py - Flask server: Modbus soil sensor endpoints + floater ingestion & dashboard

from flask import Flask, jsonify, request
from flask_cors import CORS
import minimalmodbus, serial
import threading, os, logging, time, sqlite3, json
from datetime import datetime

# ----- config -----
SERIAL_PORT = os.environ.get("SERIAL_PORT", "/dev/ttyUSB0")
BAUD = int(os.environ.get("BAUD", "9600"))
TIMEOUT = float(os.environ.get("TIMEOUT", "1.0"))
SENSOR_IDS = [1]   # list of soil sensor Modbus IDs
READ_REG_COUNT = 20

DB_PATH = os.environ.get("DB_PATH", "telemetry.db")
# ------------------

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
app = Flask(__name__)
CORS(app)

serial_lock = threading.Lock()
db_lock = threading.Lock()

# --- DB init ---
def init_db():
    with db_lock:
        conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS floater (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                dev TEXT,
                ts INTEGER,
                temp REAL,
                rawTDS INTEGER,
                vTDS REAL,
                tds REAL,
                rawTURB INTEGER,
                vTURB REAL,
                ntu REAL,
                received_at TEXT,
                raw_payload TEXT
            )
        """)
        conn.commit()
        conn.close()

init_db()

# --- Modbus read functions (unchanged logic, but fixed some issues) ---
def read_registers(sensor_id, start=0, count=READ_REG_COUNT):
    with serial_lock:
        instrument = minimalmodbus.Instrument(SERIAL_PORT, sensor_id, debug=False)
        instrument.serial.baudrate = BAUD
        instrument.serial.bytesize = 8
        instrument.serial.parity   = serial.PARITY_NONE
        instrument.serial.stopbits = 1
        instrument.serial.timeout  = TIMEOUT
        instrument.mode = minimalmodbus.MODE_RTU

        try:
            regs = instrument.read_registers(start, count, functioncode=3)
            return regs
        except Exception as e:
            logging.warning(f"Primary read failed for ID {sensor_id}: {e}. Trying smaller reads...")
            for c in (10, 6, 4, 1):
                try:
                    regs = instrument.read_registers(start, c, functioncode=3)
                    return regs
                except Exception:
                    continue
            raise
        finally:
            try:
                instrument.serial.close()
            except Exception:
                pass

def parse_registers(regs):
    r = lambda i, default=0: regs[i] if i < len(regs) else default
    nitrogen    = r(0)
    phosphorus  = r(1)
    potassium   = r(2)
    ec_raw      = r(3)
    temperature = r(12) / 100.0
    moisture    = r(13) / 10.0
    return {
        "Nitrogen (N)": f"{nitrogen} mg/kg",
        "Phosphorus (P)": f"{phosphorus} mg/kg",
        "Potassium (K)": f"{potassium} mg/kg",
        "EC (raw)": f"{ec_raw}",
        "Temperature": f"{temperature:.2f} °C",
        "Moisture": f"{moisture:.1f} %"
    }

# --- Flask endpoints for soil sensors ---
@app.route("/sensor/<int:sensor_id>", methods=["GET"])
def get_sensor(sensor_id):
    logging.info(f"Request: read sensor {sensor_id}")
    try:
        regs = read_registers(sensor_id, 0, READ_REG_COUNT)
        logging.info(f"Raw registers (ID {sensor_id}): {regs}")
        data = parse_registers(regs)
        logging.info(f"Parsed (ID {sensor_id}): {data}")
        return jsonify(sensorId=sensor_id, success=True, data=data)
    except Exception as e:
        logging.error(f"Error reading sensor {sensor_id}: {e}")
        return jsonify(sensorId=sensor_id, success=False, error=str(e)), 500

@app.route("/sensors", methods=["GET"])
def get_all_sensors():
    results = {}
    for sid in SENSOR_IDS:
        try:
            regs = read_registers(sid, 0, READ_REG_COUNT)
            data = parse_registers(regs)
            results[sid] = {"success": True, "data": data}
        except Exception as e:
            results[sid] = {"success": False, "error": str(e)}
    return jsonify(results)

# --- Floater telemetry ingestion (robust: accepts raw as string or object) ---
@app.route("/api/telemetry", methods=["POST"])
def ingest_telemetry():
    """
    Accepts JSON body like:
      {"raw": "<json-string>"}   OR   {"raw": { ... nested JSON object ... }}
    Normalizes to a Python dict obj, stores a JSON string raw_payload in DB,
    and extracts known fields safely.
    """
    payload = request.get_json(force=True, silent=True)
    if not payload or "raw" not in payload:
        return jsonify({"success": False, "error": "missing 'raw' field"}), 400

    raw_field = payload["raw"]

    # If the client sent nested object (dict), use it directly.
    # If it's a string, attempt to parse it as JSON.
    if isinstance(raw_field, dict):
        obj = raw_field
        # produce canonical JSON string for storage
        try:
            raw_str = json.dumps(raw_field, separators=(",", ":"), ensure_ascii=False)
        except Exception:
            # fallback: convert with str()
            raw_str = str(raw_field)
    elif isinstance(raw_field, str):
        raw_str = raw_field
        try:
            obj = json.loads(raw_str)
        except Exception as e:
            return jsonify({"success": False, "error": f"invalid raw JSON: {e}"}), 400
    else:
        return jsonify({"success": False, "error": "unsupported 'raw' field type"}), 400

    # safe extraction with defaults
    dev = obj.get("dev", "unknown")
    ts = obj.get("ts", None)
    temp = obj.get("temp", None)
    rawTDS = obj.get("rawTDS", None)
    vTDS = obj.get("vTDS", None)
    tds = obj.get("tds", None)
    rawTURB = obj.get("rawTURB", None)
    vTURB = obj.get("vTURB", None)
    ntu = obj.get("ntu", None)

    rec_time = datetime.utcnow().isoformat()
    with db_lock:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("""INSERT INTO floater
                       (dev, ts, temp, rawTDS, vTDS, tds, rawTURB, vTURB, ntu, received_at, raw_payload)
                       VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                    (dev, ts, temp, rawTDS, vTDS, tds, rawTURB, vTURB, ntu, rec_time, raw_str))
        conn.commit()
        conn.close()

    logging.info(f"Stored floater data from {dev} at {rec_time} (raw len={len(raw_str)})")
    return jsonify({"success": True, "stored_at": rec_time})
    
# --- Floater read endpoints ---
@app.route("/api/floater/latest/<dev>", methods=["GET"])
def floater_latest(dev):
    with db_lock:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM floater WHERE dev=? ORDER BY id DESC LIMIT 1", (dev,))
        row = cur.fetchone()
        conn.close()
    if not row:
        return jsonify({"success": False, "error": "no data"}), 404
    return jsonify({"success": True, "data": dict(row)})

@app.route("/api/floater/history/<dev>", methods=["GET"])
def floater_history(dev):
    limit = int(request.args.get("limit", 50))
    with db_lock:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT * FROM floater WHERE dev=? ORDER BY id DESC LIMIT ?", (dev, limit))
        rows = cur.fetchall()
        conn.close()
    data = [dict(r) for r in rows]
    return jsonify({"success": True, "count": len(data), "data": data})

# --- Combined dashboard endpoint ---
@app.route("/api/dashboard", methods=["GET"])
def dashboard():
    # latest floater (first dev found)
    with db_lock:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        cur.execute("SELECT dev FROM floater ORDER BY id DESC LIMIT 1")
        row = cur.fetchone()
        floater_dev = row["dev"] if row else None
        floater_latest = None
        if floater_dev:
            cur.execute("SELECT * FROM floater WHERE dev=? ORDER BY id DESC LIMIT 1", (floater_dev,))
            r = cur.fetchone()
            floater_latest = dict(r) if r else None
        conn.close()

    # read soil sensors quickly
    sensors = {}
    for sid in SENSOR_IDS:
        try:
            regs = read_registers(sid, 0, READ_REG_COUNT)
            sensors[sid] = {"success": True, "data": parse_registers(regs)}
        except Exception as e:
            sensors[sid] = {"success": False, "error": str(e)}

    return jsonify({
        "success": True,
        "floater": floater_latest,
        "soil_sensors": sensors
    })

@app.route("/")
def health():
    return "Soil & Floater Flask server is running"

if __name__ == "__main__":
    # Run on LAN
    app.run(host="0.0.0.0", port=5000, debug=False)
