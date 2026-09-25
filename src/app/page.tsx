"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Map,
  Check,
  Compass,
  Clock3,
  Car,
  Layers3,
  Menu,
  X,
  Sparkles,
  Globe2,
  CheckCheck,
  ArrowDown,
  ShieldCheck,
} from "lucide-react";
import { ScrollCinema } from "@/components/ScrollCinema";
import { Tilt, Skyline } from "@/components/Atmosphere";
import { Workspace, type Panel, type Timer } from "@/components/Workspace";
import { messages, browserLocale, isLocale, type Locale } from "@/lib/i18n";
import { initialData, readData, type Data } from "@/lib/model";
export default function Home() {
  const [locale, setLocale] = useState<Locale>("en"),
    [ready, setReady] = useState(false),
    [storageOk, setStorageOk] = useState(true),
    [data, setData] = useState<Data>(initialData),
    [panel, setPanel] = useState<Panel | null>(null),
    [menu, setMenu] = useState(false),
    [motion, setMotion] = useState(false),
    [toast, setToast] = useState("");
  const [timer, setTimer] = useState<Timer>({
    remaining: 3600,
    running: false,
    started: false,
  });
  const deadline = useRef(0);
  const t = messages[locale];
  useEffect(() => {
    let preferred = browserLocale(navigator.language);
    let motionPreference = !matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    try {
      const stored = localStorage.getItem("vi-companion");
      if (stored) setData(readData(JSON.parse(stored)));
      const language = localStorage.getItem("vi-language");
      if (isLocale(language)) preferred = language;
      const m = localStorage.getItem("vi-motion");
      if (m === "true" || m === "false") motionPreference = m === "true";
    } catch {
      setStorageOk(false);
    }
    setLocale(preferred);
    setMotion(motionPreference);
    setReady(true);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
    if (ready)
      try {
        localStorage.setItem("vi-language", locale);
      } catch {
        setStorageOk(false);
      }
  }, [locale, ready, t.hero2]);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("vi-companion", JSON.stringify(data));
        localStorage.setItem("vi-motion", String(motion));
        setStorageOk(true);
      } catch {
        setStorageOk(false);
      }
  }, [data, motion, ready]);
  useEffect(() => {
    if (!timer.started)
      setTimer((s) => ({ ...s, remaining: data.minutes * 60 }));
  }, [data.minutes, timer.started]);
  useEffect(() => {
    if (!timer.running) return;
    const tick = () => {
      const left = Math.max(
        0,
        Math.ceil((deadline.current - Date.now()) / 1000),
      );
      setTimer((s) => s.remaining === left && s.running === (left > 0) ? s : ({ ...s, remaining: left, running: left > 0 }));
    };
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [timer.running]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  const start = () => {
    deadline.current = Date.now() + timer.remaining * 1000;
    setTimer((s) => ({ ...s, running: true, started: true }));
  };
  const pause = () =>
    setTimer((s) => ({
      ...s,
      running: false,
      remaining: Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000)),
    }));
  const reset = () =>
    setTimer({ remaining: data.minutes * 60, running: false, started: false });
  const open = (id: Panel) => {
    setPanel(id);
    setMenu(false);
  };
  const done = data.tasks.filter((x) => x.done).length,
    percent = data.tasks.length
      ? Math.round((done / data.tasks.length) * 100)
      : 0;
  const features = [
    {
      id: "explore" as const,
      label: t.explore,
      title: t.cardExplore,
      text: t.cardExploreText,
      icon: Map,
      color: "#8affe0",
    },
    {
      id: "tracker" as const,
      label: t.objectives,
      title: t.cardTracker,
      text: t.cardTrackerText,
      icon: CheckCheck,
      color: "#e2b5ff",
    },
    {
      id: "planner" as const,
      label: t.planner,
      title: t.cardPlanner,
      text: t.cardPlannerText,
      icon: Clock3,
      color: "#ffbdab",
    },
    {
      id: "garage" as const,
      label: t.garage,
      title: t.cardGarage,
      text: t.cardGarageText,
      icon: Car,
      color: "#a7d7ff",
    },
  ];
  return (
    <div className={`app ${motion ? "motion-enabled" : "motion-off"}`}>
      <title>{`VI Companion — ${t.hero2}`}</title>
      <div id="site-content">
        <a className="skip" href="#main">
          {t.skip}
        </a>
        <header className="header">
          <a href="#" className="brand" aria-label={t.home}>
            <span className="brand-mark">
              VI<span>✦</span>
            </span>
            <span>
              COMPANION<small>{t.welcome}</small>
            </span>
          </a>
          <nav className={menu ? "nav nav-open" : "nav"} aria-label={t.nav}>
            <a href="#discover" onClick={() => setMenu(false)}>
              {t.discover}
            </a>
            <button onClick={() => open("explore")}>{t.explore}</button>
            <button onClick={() => open("tracker")}>{t.progress}</button>
          </nav>
          <div className="header-actions">
            <label className="language-switch">
              <Globe2 size={15} />
              <select
                aria-label={t.language}
                value={locale}
                onChange={(e) => setLocale(e.target.value as Locale)}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="pt-BR">Português (BR)</option>
              </select>
            </label>
            <button
              className="icon-button mobile-menu"
              aria-label={t.menu}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
            <button
              className="profile"
              onClick={() => open("tracker")}
              aria-label={t.progress}
            >
              VC
            </button>
          </div>
        </header>
        <main id="main">
          <section className="hero">
            <Skyline />
            <div className="hero-content">
              <div className="eyebrow">
                <span />
                {t.eyebrow}
              </div>
              <h1>
                {t.hero1}
                <br />
                <em>{t.hero2}</em>
              </h1>
              <p>
                {t.intro}
                <br />
                {t.intro2}
              </p>
              <div className="hero-buttons">
                <button
                  className="primary"
                  disabled={!ready}
                  onClick={() => open("planner")}
                >
                  {t.primary}
                  <ArrowUpRight size={19} />
                </button>
                <a className="secondary" href="#cinema">
                  {t.secondary}
                  <ArrowDown size={18} />
                </a>
              </div>
              <div className="hero-tags">
                <span>
                  <Compass size={13} />
                  {t.tag1}
                </span>
                <span>
                  <Layers3 size={13} />
                  {t.tag2}
                </span>
              </div>
            </div>
            <div className="hero-stamp">
              <span>EST. 2026</span>
              <strong>VI</strong>
              <span>LEONIDA / USA</span>
            </div>
            <div className="hero-bottom">
              <span>
                <i /> VICE CITY, LEONIDA
              </span>
              <span>{t.concept}</span>
              <button onClick={() => setMotion(!motion)} aria-pressed={motion}>
                {motion ? <Sparkles size={14} /> : <Layers3 size={14} />}{" "}
                {t.motion}: {motion ? t.on : t.off}
              </button>
            </div>
          </section>
          <section
            className="personal-dashboard"
            aria-labelledby="dashboard-title"
          >
            <div className="dashboard-intro">
              <span className="eyebrow muted">{t.personal}</span>
              <h2 id="dashboard-title">{t.dashboardTitle}</h2>
              <span className="save-status">
                <ShieldCheck size={13} />
                {storageOk ? t.local : t.storageError}
              </span>
            </div>
            <div className="dashboard-stats">
              <button onClick={() => open("tracker")}>
                <span className="stat-icon purple">
                  <CheckCheck size={19} />
                </span>
                <strong>
                  {new Intl.NumberFormat(locale).format(done)}
                  <small> / {data.tasks.length}</small>
                </strong>
                <span>{t.completed}</span>
              </button>
              <button onClick={() => open("garage")}>
                <span className="stat-icon blue">
                  <Car size={19} />
                </span>
                <strong>
                  {new Intl.NumberFormat(locale).format(data.cars.length)}
                </strong>
                <span>{t.savedVehicles}</span>
              </button>
              <button onClick={() => open("planner")}>
                <span className="stat-icon coral">
                  <Clock3 size={19} />
                </span>
                <strong>
                  {data.minutes}
                  <small> min</small>
                </strong>
                <span>{t.plannedMinutes}</span>
              </button>
            </div>
          </section>
          <section className="discovery" id="discover">
            <div className="section-heading">
              <div>
                <div className="eyebrow muted">{t.toolsEyebrow}</div>
                <h2>{t.toolsTitle}</h2>
              </div>
              <span className="section-note">
                {t.toolsNote}
                <ArrowUpRight size={16} />
              </span>
            </div>
            <div className="cards">
              {features.map((d, i) => (
                <Tilt
                  key={d.id}
                  className={`feature-card card-${d.id}`}
                  style={{ "--accent": d.color } as CSSProperties}
                >
                  <button
                    disabled={!ready}
                    onClick={() => open(d.id)}
                    className="card-button"
                  >
                    <div className="card-top">
                      <span>{d.label}</span>
                      <span>0{i + 1}</span>
                    </div>
                    <div className="card-art">
                      <div className="orbit orbit-one" />
                      <div className="orbit orbit-two" />
                      <div className="icon-cube">
                        <d.icon strokeWidth={1.3} />
                      </div>
                      <span className="floating-chip">
                        {d.id === "tracker"
                          ? `${percent}% · ${t.complete}`
                          : d.id === "planner"
                            ? `${data.minutes} MIN`
                            : d.id === "garage"
                              ? `${data.cars.length} · ${t.collected}`
                              : "25.76° N / 80.19° W"}
                      </span>
                    </div>
                    <div className="card-copy">
                      <h3>{d.title}</h3>
                      <p>{d.text}</p>
                      <span className="card-link">
                        {d.id === "explore" ? t.exploreConcept : t.openTool}
                        <ArrowUpRight size={17} />
                      </span>
                    </div>
                  </button>
                </Tilt>
              ))}
            </div>
          </section>
          <ScrollCinema motion={motion} t={t} />
          <section className="journey">
            <div className="journey-symbol">
              <Sparkles size={30} />
            </div>
            <div>
              <span className="eyebrow muted">{t.journeyEyebrow}</span>
              <h2>{t.journeyTitle}</h2>
              <p>{t.journeyText}</p>
            </div>
            <button className="secondary" onClick={() => open("planner")}>
              {t.planCta}
              <ArrowUpRight size={18} />
            </button>
          </section>
        </main>
        <footer>
          <a className="footer-logo" href="#">
            VI <span>COMPANION</span>
          </a>
          <p>
            {t.footer}
            <br />
            {t.disclaimer}
          </p>
          <span>{t.farewell} ↗</span>
        </footer>
        {timer.started && !panel && (
          <button className="timer-floating" onClick={() => open("planner")}>
            <Clock3 size={17} />
            {String(Math.floor(timer.remaining / 60)).padStart(2, "0")}:
            {String(timer.remaining % 60).padStart(2, "0")}
            <span>
              {timer.remaining === 0
                ? t.timerDone
                : timer.running
                  ? t.timerRunning
                  : t.timerPaused}
            </span>
          </button>
        )}
      </div>
      {panel && (
        <Workspace
          panel={panel}
          open={open}
          close={() => setPanel(null)}
          t={t}
          locale={locale}
          data={data}
          setData={setData}
          storageOk={storageOk}
          timer={timer}
          start={start}
          pause={pause}
          reset={reset}
          setLocale={setLocale}
          notify={setToast}
        />
      )}
      <div
        className={`toast ${toast ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {toast && (
          <>
            <Check size={16} />
            {toast}
          </>
        )}
      </div>
    </div>
  );
}
