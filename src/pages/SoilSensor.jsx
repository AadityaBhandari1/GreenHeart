// Phone.jsx
import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Link } from "react-router-dom";

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Phone.jsx
 * Full-screen landscape dashboard for soil NPK monitoring.
 * - TailwindCSS required
 * - Polls: http://192.168.217.196:5000/api/dashboard
 *
 * Paste into your project as Phone.jsx and import/render it.
 */

const API_URL = "http://192.168.1.17:5000/api/dashboard";
const POLL_MS = 6000;

const DUMMY_DATA = {
  "Nitrogen (N)": 150,
  "Phosphorus (P)": 160,
  "Potassium (K)": 190,
  EC: 1200,
  Temperature: 26,
  Moisture: 48,
};

// helper: convert "296 mg/kg" or "0.0 %" -> numeric
function parseNumberFromString(s) {
  if (!s && s !== 0) return 0;
  const m = String(s).match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

// Convert absolute NPK values to % for donut visualization.
// You can adjust maxima to suit your soil/scales.
function valueToPercent(val, max = 500) {
  const p = Math.max(0, Math.min(100, Math.round((val / max) * 100)));
  return p;
}

function formatSafe(v) {
  return v === undefined || v === null ? "—" : String(v);
}

export default function SoilSensor() {
  const [sensorData, setSensorData] = useState(null);
  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState(null);
  const [wifi, setWifi] = useState("Home_WiFi"); // retained but not displayed (SSID is not available to web apps)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLandscape, setIsLandscape] = useState(() => {
    if (typeof window === "undefined") return true;
    return (
      window.matchMedia && window.matchMedia("(orientation: landscape)").matches
    );
  });
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1280
  );
  const [wifiLevel, setWifiLevel] = useState(3); // 0-4 bars

  const rootRef = useRef(null);

  // fetch sensor data
  useEffect(() => {
    let mounted = true;

    const fetchSensor = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
      try {
        const res = await fetch(API_URL, {
          cache: "no-store",
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        const json = await res.json();
        if (!mounted) return;
        if (
          json &&
          json.success &&
          json.soil_sensors &&
          json.soil_sensors["1"] &&
          json.soil_sensors["1"].success &&
          json.soil_sensors["1"].data
        ) {
          setSensorData(json.soil_sensors["1"].data);
          setError(null);
        } else {
          setSensorData(DUMMY_DATA);
          setError(null);
        }
      } catch (e) {
        if (!mounted) return;
        setSensorData(DUMMY_DATA);
        setError(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchSensor();
    const id = setInterval(fetchSensor, POLL_MS);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  // clock
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // window + orientation listeners
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    const m =
      window.matchMedia && window.matchMedia("(orientation: landscape)");
    const onOrient = (e) => setIsLandscape(e.matches);
    window.addEventListener("resize", onResize);
    if (m) {
      // set initial
      setIsLandscape(m.matches);
      m.addEventListener
        ? m.addEventListener("change", onOrient)
        : m.addListener(onOrient);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      if (m) {
        m.removeEventListener
          ? m.removeEventListener("change", onOrient)
          : m.removeListener(onOrient);
      }
    };
  }, []);

  // Wi-Fi signal estimation using Network Information API (fallback to mid strength)
  useEffect(() => {
    const nav = navigator;
    const conn =
      nav && (nav.connection || nav.mozConnection || nav.webkitConnection);
    const calcLevel = () => {
      // Map downlink (Mbps) to bars: 0-4
      let level = 3;
      const down = conn?.downlink; // Mbps
      const eff = conn?.effectiveType; // 'slow-2g','2g','3g','4g'
      if (typeof down === "number") {
        if (down < 0.5) level = 1;
        else if (down < 2) level = 2;
        else if (down < 10) level = 3;
        else level = 4;
      } else if (eff) {
        level = eff.includes("slow") || eff === "2g" ? 1 : eff === "3g" ? 2 : 3;
      }
      setWifiLevel(level);
    };
    calcLevel();
    if (conn) {
      conn.addEventListener
        ? conn.addEventListener("change", calcLevel)
        : (conn.onchange = calcLevel);
      return () => {
        conn.removeEventListener &&
          conn.removeEventListener("change", calcLevel);
      };
    }
  }, []);

  // fullscreen listeners
  useEffect(() => {
    const onFsChange = () => {
      const fsEl =
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
      setIsFullscreen(Boolean(fsEl));
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    document.addEventListener("mozfullscreenchange", onFsChange);
    document.addEventListener("MSFullscreenChange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
      document.removeEventListener("mozfullscreenchange", onFsChange);
      document.removeEventListener("MSFullscreenChange", onFsChange);
    };
  }, []);

  const enterFullscreen = useCallback(() => {
    const el = rootRef.current || document.documentElement;
    if (!el) return;
    const req =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;
    if (req) req.call(el);
  }, []);

  const exitFullscreen = useCallback(() => {
    const exit =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen;
    if (exit) exit.call(document);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) exitFullscreen();
    else enterFullscreen();
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  // Battery API (works on some browsers)
  useEffect(() => {
    if (navigator.getBattery) {
      navigator.getBattery().then((b) => {
        const update = () => setBattery(Math.round(b.level * 100));
        update();
        b.addEventListener("levelchange", update);
      });
    } else {
      setBattery(null);
    }
  }, []);

  // parse numeric values from sensorData
  const parsed = useMemo(() => {
    if (!sensorData) return null;
    const N = parseNumberFromString(sensorData["Nitrogen (N)"]);
    const P = parseNumberFromString(sensorData["Phosphorus (P)"]);
    const K = parseNumberFromString(sensorData["Potassium (K)"]);
    const EC = parseNumberFromString(
      sensorData["EC (raw)"] || sensorData["EC"]
    );
    const Temp = parseNumberFromString(sensorData["Temperature"]);
    const Moist = parseNumberFromString(sensorData["Moisture"]);
    return { N, P, K, EC, Temp, Moist };
  }, [sensorData]);

  // compute donut percents (tune max values if you want different scale)
  const donut = useMemo(() => {
    if (!parsed) return { nP: 0, pP: 0, kP: 0 };
    const nP = valueToPercent(parsed.N, 200); // assume 200 mg/kg good N max
    const pP = valueToPercent(parsed.P, 500); // P often larger absolute
    const kP = valueToPercent(parsed.K, 200);
    return { nP, pP, kP };
  }, [parsed]);

  // recommendation rules
  const recommendations = useMemo(() => {
    if (!parsed) return ["Waiting for sensor..."];
    const rec = [];
    // thresholds can be adjusted to your agronomy standards
    if (parsed.N < 40)
      rec.push("Nitrogen low — consider nitrogen-rich fertilizer.");
    if (parsed.P < 50) rec.push("Phosphorus low — add phosphate fertilizer.");
    if (parsed.K < 40) rec.push("Potassium low — apply potassium fertilizer.");
    if (parsed.Moist < 10) rec.push("Soil dry — irrigate soon.");
    if (parsed.EC > 2000) rec.push("EC high — watch salinity.");
    if (rec.length === 0) rec.push("Soil nutrients look balanced. ✅");
    return rec;
  }, [parsed]);

  // Donut helper using react-chartjs-2 (no animations)
  const DonutBase = ({ n, p, k, size = 260 }) => {
    const bgTrack = "rgba(255,255,255,0.08)";

    const data = useMemo(
      () => ({
        // three concentric rings: N, P, K (filled + track)
        datasets: [
          {
            id: "N",
            data: [
              Math.max(0, Math.min(100, n)),
              100 - Math.max(0, Math.min(100, n)),
            ],
            backgroundColor: ["#5FD068", bgTrack],
            borderWidth: 0,
            hoverOffset: 0,
          },
          {
            id: "P",
            data: [
              Math.max(0, Math.min(100, p)),
              100 - Math.max(0, Math.min(100, p)),
            ],
            backgroundColor: ["#FFB84D", bgTrack],
            borderWidth: 0,
            hoverOffset: 0,
          },
          {
            id: "K",
            data: [
              Math.max(0, Math.min(100, k)),
              100 - Math.max(0, Math.min(100, k)),
            ],
            backgroundColor: ["#6E9BFF", bgTrack],
            borderWidth: 0,
            hoverOffset: 0,
          },
        ],
      }),
      [n, p, k]
    );

    const options = useMemo(
      () => ({
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        animation: false,
        animations: {
          colors: false,
          numbers: false,
          tension: false,
        },
        transitions: {
          active: { animation: { duration: 0 } },
          resize: { animation: { duration: 0 } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ctx.dataIndex === 0 ? `${ctx.dataset.data[0]}%` : null,
            },
            filter: (item) => item.dataIndex === 0,
            animation: { duration: 0 },
          },
        },
        rotation: -90,
        circumference: 360,
      }),
      []
    );

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <Doughnut
          datasetIdKey="id"
          data={data}
          options={options}
          redraw={false}
          updateMode="none"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <div className="text-center">
            <div className="text-slate-400 text-sm">NPK Balance</div>
            <div className="text-white font-bold text-lg mt-1">
              {n ?? 0}% / {p ?? 0}% / {k ?? 0}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Memoized wrapper to keep chart stable unless values/size actually change
  const Donut = React.memo(
    DonutBase,
    (prev, next) =>
      prev.n === next.n &&
      prev.p === next.p &&
      prev.k === next.k &&
      prev.size === next.size
  );

  const donutSize = useMemo(() => {
    if (windowWidth < 640) return 180; // phones
    if (windowWidth < 1024) return 220; // tablets / small screens
    return 260; // desktop
  }, [windowWidth]);

  // Simple Wi-Fi icon component (0-4 bars)
  const WifiIcon = ({ level = 3 }) => {
    const bars = [0, 1, 2, 3, 4];
    return (
      <div
        className="flex items-end gap-[2px]"
        aria-label={`Wi-Fi signal ${level} of 4`}
        title={`Wi-Fi ${level}/4`}
      >
        {bars.map((b) => {
          const active = b <= level;
          const h = 6 + b * 4; // incremental height
          return (
            <span
              key={b}
              className={`inline-block w-[4px] rounded-sm ${
                active ? "bg-emerald-400" : "bg-slate-600"
              }`}
              style={{ height: h }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      className="w-screen h-screen bg-gradient-to-br from-gray-900 via-neutral-900 to-black text-white overflow-hidden"
    >
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 px-3 sm:px-6 py-2.5 sm:py-3 border-b border-slate-800">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:block text-xs text-slate-400">Device</div>
          <div className="text-sm font-semibold">GreenHeart Monitor</div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-end">
            <div className="hidden sm:block text-xs text-slate-400">
              Network
            </div>
            <div className="flex items-center justify-end h-5">
              <WifiIcon size={7} level={wifiLevel} />
            </div>
          </div>

          <div className="text-right">
            <div className="hidden sm:block text-xs text-slate-400">Time</div>
            <div className="text-xs sm:text-sm font-medium leading-none">
              {time.toLocaleTimeString()}
            </div>
          </div>

          <div className="text-right">
            <div className="hidden sm:block text-xs text-slate-400">
              Battery
            </div>
            <div className="text-xs sm:text-sm font-medium leading-none">
              {battery !== null ? `${battery}%` : "71%"}
            </div>
          </div>
        </div>
      </div>

      {/* Main landscape layout */}
      <div
        className={`flex gap-4 ${
          isLandscape ? "flex-row" : "flex-col"
        } h-full px-4 lg:px-8 py-4 lg:py-6  lg:gap-8`}
      >
        {/* Left panel */}
        {/* <aside
          className={`${
            isLandscape ? "w-full lg:w-1/4" : "w-full"
          } bg-slate-800/30 rounded-2xl p-4 lg:p-6 flex flex-col gap-6`}
        >
          <h3 className="text-xl font-semibold">Parameters</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">Nitrogen (N)</div>
                <div className="text-lg font-bold">
                  {formatSafe(parsed?.N)} mg/kg
                </div>
              </div>
              <div className="text-sm text-amber-400 font-medium">
                {donut.nP}%
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">Phosphorus (P)</div>
                <div className="text-lg font-bold">
                  {formatSafe(parsed?.P)} mg/kg
                </div>
              </div>
              <div className="text-sm text-emerald-400 font-medium">
                {donut.pP}%
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-slate-300">Potassium (K)</div>
                <div className="text-lg font-bold">
                  {formatSafe(parsed?.K)} mg/kg
                </div>
              </div>
              <div className="text-sm text-sky-300 font-medium">
                {donut.kP}%
              </div>
            </div>

            <div className="pt-2">
              <div className="text-sm text-slate-300">EC</div>
              <div className="text-lg font-bold">{formatSafe(parsed?.EC)}</div>
            </div>

            <div className="pt-2">
              <div className="text-sm text-slate-300">Temperature</div>
              <div className="text-lg font-bold">
                {formatSafe(parsed?.Temp)} °C
              </div>
            </div>

            <div className="pt-2">
              <div className="text-sm text-slate-300">Moisture</div>
              <div className="text-lg font-bold">
                {formatSafe(parsed?.Moist)} %
              </div>
            </div>
          </div>

          <div className="mt-auto">
            <button
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black py-2 rounded-lg font-semibold shadow"
              onClick={() => {
                // manual refresh
                setLoading(true);
                fetch(API_URL)
                  .then((r) => r.json())
                  .then((j) => {
                    const d = j?.soil_sensors?.["1"]?.data;
                    if (j?.success && d) setSensorData(d);
                  })
                  .catch(() => {})
                  .finally(() => setLoading(false));
              }}
            >
              Refresh Now
            </button>
          </div>
        </aside> */}
        {/* Center: Donut + big values */}
        <main className="flex-1 w-full h-full bg-gradient-to-b from-slate-900/30 to-transparent rounded-2xl  pt-0 lg:p-6 flex items-center justify-center">
          <div
            className={`flex items-center w-full h-full ${
              isLandscape ? "flex-row gap-6 lg:gap-10 h-full" : "flex-col gap-6"
            }`}
          >
            <div className="w-full h-full"> 
              <div className="bg-slate-800/40 p-4 h-[80%] lg:p-6 rounded-3xl flex items-center justify-center">
                <Donut
                  n={donut.nP}
                  p={donut.pP}
                  k={donut.kP}
                  size={donutSize}
                />
              </div>

            </div>

            <div
              className={`${
                isLandscape ? "w-full lg:w-[420px] h-full" : "w-full h-full"
              }`}
            >
              <div className="bg-slate-800/20 rounded-2xl w-full h-[80%] p-4 lg:p-6">
                <h4 className="text-xl font-semibold mb-2">
                  Soil Nutrient Levels
                </h4>

                {loading && (
                  <div className="text-sm text-slate-400">
                    Loading sensor data...
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-400 mb-2">
                    Error: {error}
                  </div>
                )}

                <div className=" space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="text-base text-slate-300">Nitrogen</div>
                    <div className="font-medium">
                      {formatSafe(parsed?.N)} mg/kg
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-base text-slate-300">Phosphorus</div>
                    <div className="font-medium">
                      {formatSafe(parsed?.P)} mg/kg
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-base text-slate-300">Potassium</div>
                    <div className="font-medium">
                      {formatSafe(parsed?.K)} mg/kg
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-base text-slate-300">EC</div>
                    <div className="font-medium">{formatSafe(parsed?.EC)}</div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-base text-slate-300">Temp</div>
                    <div className="font-medium">
                      {formatSafe(parsed?.Temp)} °C
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-base text-slate-300">Moisture</div>
                    <div className="font-medium">
                      {formatSafe(parsed?.Moist)} %
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right panel: recent events / status */}
        <aside
          className={`${
            isLandscape ? "w-1/3 lg:w-1/4" : "w-full"
          } flex flex-col gap-2`}
        >
          <div className="mt-2 bg-gradient-to-r from-emerald-700/20 to-amber-700/12 p-4 rounded-xl">
            <div className="text-sm text-emerald-200 font-semibold">
              Quick Recommendation
            </div>
            <div className="mt-2 text-white/90 text-sm font-medium">
              {recommendations[0]}
            </div>
            {recommendations.length > 1 && (
              <ul className="mt-2 ml-4 list-disc text-sm text-slate-300">
                {recommendations.slice(1).map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-slate-800/20 rounded-2xl p-4">
            <div className="text-sm text-slate-400">Controls</div>
            <div className="mt-3 flex gap-2">
              <button
                className="flex-1 py-2 rounded-lg bg-slate-700/60 hover:bg-slate-700/80 text-white transition-colors"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? "Exit Full Screen" : "Full Screen"}
              </button>
              <button
                className="py-2 px-4 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold transition-colors"
                onClick={() => {
                  // manual refresh
                  setLoading(true);
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 2000);
                  fetch(API_URL, { signal: controller.signal })
                    .then((r) => r.json())
                    .then((j) => {
                      clearTimeout(timeoutId);
                      const d = j?.soil_sensors?.["1"]?.data;
                      if (j?.success && d) {
                        setSensorData(d);
                      } else {
                        setSensorData(DUMMY_DATA);
                      }
                    })
                    .catch(() => setSensorData(DUMMY_DATA))
                    .finally(() => setLoading(false));
                }}
              >
                Refresh
              </button>
            </div>
            <div className="mt-2">
              <Link
                to="/floater" 
                className="block w-full py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-black font-semibold text-center transition-colors"
              >
                Floater Dashboard
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
