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
 * Floater.jsx
 * Full-screen landscape dashboard for water quality (floater) monitoring.
 * - TailwindCSS required
 * - Polls: http://192.168.217.196:5000/api/dashboard
 */

const API_URL = "http://10.187.236.196:5000/api/dashboard";
const POLL_MS = 6000;

const DUMMY_DATA = {
  tds: 850,
  ntu: 25,
  temp: 24.5,
  vTDS: 2.1,
  vTURB: 3.4,
};

function parseNumberFromAny(v) {
  if (v === null || v === undefined) return 0;
  const m = String(v).match(/-?\d+(\.\d+)?/);
  return m ? Number(m[0]) : 0;
}

function valueToPercent(val, max = 100) {
  const p = Math.max(0, Math.min(100, Math.round((val / max) * 100)));
  return p;
}

function formatSafe(v) {
  return v === undefined || v === null ? "—" : String(v);
}

export default function Floater() {
  const [floater, setFloater] = useState(null);
  const [time, setTime] = useState(new Date());
  const [battery, setBattery] = useState(null);
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
  const [wifiLevel, setWifiLevel] = useState(3);

  const rootRef = useRef(null);

  // fetch floater data
  useEffect(() => {
    let mounted = true;

    const fetchFloater = async () => {
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
        if (json && json.success && json.floater) {
          setFloater(json.floater);
          setError(null);
        } else {
          setFloater(DUMMY_DATA);
          setError(null);
        }
      } catch (e) {
        if (!mounted) return;
        setFloater(DUMMY_DATA);
        setError(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetchFloater();
    const id = setInterval(fetchFloater, POLL_MS);
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

  // Wi-Fi signal estimation
  useEffect(() => {
    const nav = navigator;
    const conn =
      nav && (nav.connection || nav.mozConnection || nav.webkitConnection);
    const calcLevel = () => {
      let level = 3;
      const down = conn?.downlink;
      const eff = conn?.effectiveType;
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

  // Battery API (optional)
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

  // parse values
  const parsed = useMemo(() => {
    if (!floater) return null;
    const TDS = parseNumberFromAny(floater.tds ?? floater.rawTDS);
    const NTU = parseNumberFromAny(floater.ntu ?? floater.rawTURB);
    const Temp = parseNumberFromAny(floater.temp);
    const vTDS = parseNumberFromAny(floater.vTDS);
    const vTURB = parseNumberFromAny(floater.vTURB);
    return { TDS, NTU, Temp, vTDS, vTURB };
  }, [floater]);

  // donut values: TDS, NTU, Temp
  const donut = useMemo(() => {
    if (!parsed) return { tdsP: 0, ntuP: 0, tempP: 0 };
    const tdsP = valueToPercent(parsed.TDS, 2000); // scale to 2000 ppm
    const ntuP = valueToPercent(parsed.NTU, 300); // scale to 300 NTU
    const tempP = valueToPercent(parsed.Temp, 50); // scale to 50 C
    return { tdsP, ntuP, tempP };
  }, [parsed]);

  // recommendations
  const recommendations = useMemo(() => {
    if (!parsed) return ["Waiting for floater data..."];
    const rec = [];
    if (parsed.TDS > 1200)
      rec.push("High TDS — consider dilution or filtration.");
    if (parsed.NTU > 50)
      rec.push("High turbidity — water is cloudy; filter before use.");
    if (parsed.Temp > 35)
      rec.push("Water temperature high — monitor for dissolved oxygen issues.");
    if (rec.length === 0)
      rec.push("Water quality looks within normal range. ✅");
    return rec;
  }, [parsed]);

  // Donut component (3 rings: TDS, NTU, Temp)
  const DonutBase = ({ tds, ntu, temp, size = 260 }) => {
    const bgTrack = "rgba(255,255,255,0.08)";
    const data = useMemo(
      () => ({
        datasets: [
          {
            id: "TDS",
            data: [
              Math.max(0, Math.min(100, tds)),
              100 - Math.max(0, Math.min(100, tds)),
            ],
            backgroundColor: ["#22d3ee", bgTrack], // cyan
            borderWidth: 0,
            hoverOffset: 0,
          },
          {
            id: "NTU",
            data: [
              Math.max(0, Math.min(100, ntu)),
              100 - Math.max(0, Math.min(100, ntu)),
            ],
            backgroundColor: ["#f59e0b", bgTrack], // amber
            borderWidth: 0,
            hoverOffset: 0,
          },
          {
            id: "Temp",
            data: [
              Math.max(0, Math.min(100, temp)),
              100 - Math.max(0, Math.min(100, temp)),
            ],
            backgroundColor: ["#ef4444", bgTrack], // red
            borderWidth: 0,
            hoverOffset: 0,
          },
        ],
      }),
      [tds, ntu, temp]
    );

    const options = useMemo(
      () => ({
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        animation: false,
        animations: { colors: false, numbers: false, tension: false },
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
            <div className="text-slate-400 text-sm">Water Quality</div>
            <div className="text-white font-bold text-lg mt-1">
              {tds ?? 0}% / {ntu ?? 0}% / {temp ?? 0}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Donut = React.memo(
    DonutBase,
    (prev, next) =>
      prev.tds === next.tds &&
      prev.ntu === next.ntu &&
      prev.temp === next.temp &&
      prev.size === next.size
  );

  const donutSize = useMemo(() => {
    if (windowWidth < 640) return 180;
    if (windowWidth < 1024) return 220;
    return 260;
  }, [windowWidth]);

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
          const h = 6 + b * 4;
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
          <div className="text-sm font-semibold">Floater Monitor</div>
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
              {battery !== null ? `${battery}%` : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div
        className={`flex gap-4 ${
          isLandscape ? "flex-row" : "flex-col"
        } h-full px-4 lg:px-8 py-4 lg:py-6  lg:gap-8`}
      >
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
                  tds={donut.tdsP}
                  ntu={donut.ntuP}
                  temp={donut.tempP}
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
                <h4 className="text-xl font-semibold mb-2">Water Quality</h4>

                {loading && (
                  <div className="text-sm text-slate-400">
                    Loading floater data...
                  </div>
                )}

                {error && (
                  <div className="text-sm text-red-400 mb-2">
                    Error: {error}
                  </div>
                )}

                <div className=" space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="text-base text-slate-300">Temperature</div>
                    <div className="font-medium">
                      {formatSafe(parsed?.Temp)} °C
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-base text-slate-300">TDS</div>
                    <div className="font-medium">
                      {formatSafe(parsed?.TDS)} ppm
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-base text-slate-300">
                      Turbidity (NTU)
                    </div>
                    <div className="font-medium">
                      {formatSafe(parsed?.NTU)} NTU
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-base text-slate-300">vTDS</div>
                    <div className="font-medium">
                      {formatSafe(parsed?.vTDS)} V
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-base text-slate-300">vTURB</div>
                    <div className="font-medium">
                      {formatSafe(parsed?.vTURB)} V
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right panel: recommendations and controls */}
        <aside
          className={`${
            isLandscape ? "w-1/3 lg:w-1/4" : "w-full"
          } flex flex-col gap-`}
        >
          <div className="mt- bg-gradient-to-r from-cyan-700/20 to-amber-700/12 p-4 rounded-xl">
            <div className="text-sm text-cyan-200 font-semibold">
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
            <div className="mt- flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  className="w-full py-2 px-1 rounded-lg bg-slate-700/60 hover:bg-slate-700/80 text-white font-medium transition-colors"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? "Exit Full Screen" : "Full Screen"}
                </button>
                <button
                  className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-semibold transition-colors"
                  onClick={() => {
                    setLoading(true);
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 2000);
                    fetch(API_URL, { signal: controller.signal })
                      .then((r) => r.json())
                      .then((j) => {
                        clearTimeout(timeoutId);
                        const d = j?.floater;
                        if (j?.success && d) {
                          setFloater(d);
                        } else {
                          setFloater(DUMMY_DATA);
                        }
                      })
                      .catch(() => setFloater(DUMMY_DATA))
                      .finally(() => setLoading(false));
                  }}
                >
                  Refresh
                </button>
              </div>
              <Link
                to="/soil"
                className="w-full py-2 rounded-lg bg-teal-500 hover:bg-teal-600 text-black font-semibold text-center transition-colors"
              >
                Soil Dashboard
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
