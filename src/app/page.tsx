"use client";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { ScrollCinema } from "@/components/ScrollCinema";
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
  Plus,
  Trash2,
  Sparkles,
} from "lucide-react";

const destinations = [
  {
    id: "explore",
    number: "01",
    title: "Explore o desconhecido.",
    label: "EXPLORAR",
    text: "Um novo horizonte. Infinitas possibilidades.",
    icon: Map,
    color: "#b8edcf",
  },
  {
    id: "tracker",
    number: "02",
    title: "Cada conquista conta.",
    label: "SEUS OBJETIVOS",
    text: "Grandes histórias começam com pequenos passos.",
    icon: Check,
    color: "#c3b3ed",
  },
  {
    id: "planner",
    number: "03",
    title: "A noite é sua.",
    label: "SESSION PLANNER",
    text: "Menos tempo planejando. Mais tempo vivendo.",
    icon: Clock3,
    color: "#f3ad8e",
  },
  {
    id: "garage",
    number: "04",
    title: "Encontre seu próximo ícone.",
    label: "GARAGEM",
    text: "Uma coleção com a sua personalidade.",
    icon: Car,
    color: "#a9cbef",
  },
];
function Tilt({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      style={style}
      onPointerMove={(e) => {
        if (
          e.pointerType === "touch" ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5,
          y = (e.clientY - r.top) / r.height - 0.5;
        e.currentTarget.style.setProperty("--rx", `${-y * 9}deg`);
        e.currentTarget.style.setProperty("--ry", `${x * 11}deg`);
        e.currentTarget.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
        e.currentTarget.style.setProperty("--my", `${(y + 0.5) * 100}%`);
      }}
      onPointerLeave={() => {
        ref.current?.style.setProperty("--rx", "0deg");
        ref.current?.style.setProperty("--ry", "0deg");
      }}
    >
      {children}
    </div>
  );
}
function Skyline() {
  return (
    <div className="city" aria-hidden="true">
      <div className="sun" />
      <div className="cloud cloud-one" />
      <div className="cloud cloud-two" />
      <div className="skyline">
        {Array.from({ length: 24 }, (_, i) => (
          <i
            key={i}
            style={
              {
                "--h": `${35 + ((i * 47) % 130)}px`,
                "--w": `${18 + ((i * 13) % 32)}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="water" />
      <div className="road" />
      {[0, 1, 2].map((i) => (
        <div className={`palm palm-${i}`} key={i}>
          <div className="trunk" />
          {Array.from({ length: 7 }, (_, j) => (
            <i
              key={j}
              style={{ "--a": `${j * 28 - 85}deg` } as CSSProperties}
            />
          ))}
        </div>
      ))}
      <div className="city-grain" />
    </div>
  );
}
export default function Home() {
  const [panel, setPanel] = useState<string | null>(null),
    [menu, setMenu] = useState(false),
    [motion, setMotion] = useState(true),
    [ready, setReady] = useState(false);
  const [tasks, setTasks] = useState<{ text: string; done: boolean }[]>([]),
    [draft, setDraft] = useState(""),
    [cars, setCars] = useState<string[]>([]),
    [minutes, setMinutes] = useState(60),
    [focus, setFocus] = useState("Exploração");
  const closeRef = useRef<HTMLButtonElement>(null);
  const priorFocus = useRef<HTMLElement | null>(null);
  useEffect(() => {
    setMotion(!matchMedia("(prefers-reduced-motion: reduce)").matches);
    try {
      const saved = JSON.parse(localStorage.getItem("vi-companion") || "{}");
      if (Array.isArray(saved.tasks))
        setTasks(
          saved.tasks.filter(
            (t: { text?: unknown; done?: unknown }) =>
              typeof t?.text === "string" && typeof t?.done === "boolean",
          ),
        );
      if (Array.isArray(saved.cars))
        setCars(saved.cars.filter((c: unknown) => typeof c === "string"));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready)
      try {
        localStorage.setItem("vi-companion", JSON.stringify({ tasks, cars }));
      } catch {}
  }, [tasks, cars, ready]);
  useEffect(() => {
    if (!panel) return;
    priorFocus.current = document.activeElement as HTMLElement;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
      if (e.key === "Tab") {
        const items = Array.from(
          document.querySelectorAll<HTMLElement>(
            ".modal button,.modal input,.modal select",
          ),
        );
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", key);
      priorFocus.current?.focus();
    };
  }, [panel]);
  const open = (id: string) => {
    setDraft("");
    setPanel(id);
    setMenu(false);
  };
  return (
    <div className={`app ${motion ? "" : "motion-off"}`}>
      <a className="skip" href="#main">
        Pular para o conteúdo
      </a>
      <header className="header">
        <a href="#" className="brand" aria-label="VI Companion início">
          <span className="brand-mark">
            VI<span>✦</span>
          </span>
          <span>
            COMPANION<small>WELCOME TO LEONIDA</small>
          </span>
        </a>
        <nav
          className={menu ? "nav nav-open" : "nav"}
          aria-label="Navegação principal"
        >
          <a href="#discover" onClick={() => setMenu(false)}>
            Descobrir
          </a>
          <button onClick={() => open("explore")}>Explorar Leonida</button>
          <button onClick={() => open("tracker")}>Meu progresso</button>
        </nav>
        <div className="header-actions">
          <span className="fan-tag">FEITO POR FÃS</span>
          <button
            className="icon-button mobile-menu"
            aria-label="Alternar menu"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
          <button
            className="profile"
            onClick={() => open("tracker")}
            aria-label="Abrir meus objetivos"
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
              <span /> UM NOVO ESTADO DE ESPÍRITO
            </div>
            <h1>
              O próximo capítulo.
              <br />
              <em>O seu mundo.</em>
            </h1>
            <p>
              Das luzes de Vice City aos horizontes de Leonida.
              <br />
              Prepare sua jornada. Deixe sua marca.
            </p>
            <div className="hero-buttons">
              <button className="primary" onClick={() => open("explore")}>
                Explore Leonida <ArrowUpRight size={19} />
              </button>
              <a className="secondary" href="#discover">
                Seu próximo objetivo <ArrowRight size={18} />
              </a>
            </div>
            <div className="hero-tags">
              <span>
                <Compass size={13} /> EXPLORE SEM LIMITES
              </span>
              <span>
                <Layers3 size={13} /> PLANEJE DO SEU JEITO
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
            <span>CONCEITO VISUAL · CENÁRIO ILUSTRADO</span>
            <button onClick={() => setMotion(!motion)} aria-pressed={motion}>
              {motion ? <Sparkles size={14} /> : <Layers3 size={14} />} MOTION{" "}
              {motion ? "ON" : "OFF"}
            </button>
          </div>
        </section>
        <ScrollCinema motion={motion} />
        <section className="discovery" id="discover">
          <div className="section-heading">
            <div>
              <div className="eyebrow muted">SEU COMPANION. SUAS REGRAS.</div>
              <h2>
                Toda grande jornada tem um começo<span>.</span>
              </h2>
            </div>
            <span className="section-note">
              ESCOLHA SEU PRÓXIMO PASSO <ArrowUpRight size={16} />
            </span>
          </div>
          <div className="cards">
            {destinations.map((d) => (
              <Tilt
                key={d.id}
                className={`feature-card card-${d.id}`}
                style={{ "--accent": d.color } as CSSProperties}
              >
                <button onClick={() => open(d.id)} className="card-button">
                  <div className="card-top">
                    <span>{d.label}</span>
                    <span>{d.number}</span>
                  </div>
                  <div className="card-art">
                    <div className="orbit orbit-one" />
                    <div className="orbit orbit-two" />
                    <div className="icon-cube">
                      <d.icon strokeWidth={1.1} />
                    </div>
                    <span className="floating-chip">
                      {d.id === "tracker"
                        ? `${tasks.filter((t) => t.done).length} CONQUISTAS`
                        : d.id === "planner"
                          ? "MAKE IT A NIGHT"
                          : d.id === "garage"
                            ? `${cars.length} NA COLEÇÃO`
                            : "25.76° N / 80.19° W"}
                    </span>
                  </div>
                  <div className="card-copy">
                    <h3>{d.title}</h3>
                    <p>{d.text}</p>
                    <span className="card-link">
                      {d.id === "explore"
                        ? "Conhecer o conceito"
                        : "Abrir ferramenta"}{" "}
                      <ArrowUpRight size={17} />
                    </span>
                  </div>
                </button>
              </Tilt>
            ))}
          </div>
        </section>
        <section className="journey">
          <div className="journey-symbol">
            <Sparkles size={30} />
          </div>
          <div>
            <span className="eyebrow muted">A SUA HISTÓRIA COMEÇA AQUI</span>
            <h2>Um plano para cada possibilidade.</h2>
            <p>Seus objetivos e sua garagem ficam salvos neste navegador.</p>
          </div>
          <button className="secondary" onClick={() => open("planner")}>
            Planejar minha sessão <ArrowUpRight size={18} />
          </button>
        </section>
      </main>
      <footer>
        <a className="footer-logo" href="#">
          VI <span>COMPANION</span>
        </a>
        <p>
          Projeto independente de fãs. Sem afiliação com a Rockstar Games.
          <br />
          Ferramentas de planejamento pessoal; sem dados oficiais de gameplay.
        </p>
        <span>SEE YOU IN LEONIDA ↗</span>
      </footer>
      {panel && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPanel(null);
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="dialog-title"
          >
            <button
              ref={closeRef}
              className="icon-button modal-close"
              onClick={() => setPanel(null)}
              aria-label="Fechar"
            >
              <X />
            </button>
            <span className="eyebrow muted">SEU ESPAÇO EM LEONIDA</span>
            <h2 id="dialog-title">
              {panel === "explore"
                ? "Um horizonte de possibilidades."
                : panel === "tracker"
                  ? "Seus próximos objetivos."
                  : panel === "planner"
                    ? "Faça cada minuto valer."
                    : "Sua garagem dos sonhos."}
            </h2>
            {panel === "explore" ? (
              <>
                <div className="explore-preview">
                  <Skyline />
                  <span>LEONIDA / CONCEITO VISUAL</span>
                </div>
                <p>
                  Uma atmosfera inspirada em praias, luzes neon e estradas
                  abertas. Este cenário é uma ilustração conceitual, não um mapa
                  oficial do jogo.
                </p>
                <p>
                  Enquanto sua próxima aventura não começa, monte seus próprios
                  objetivos e planeje sua sessão.
                </p>
                <button className="primary" onClick={() => open("planner")}>
                  Preparar minha jornada <ArrowRight size={17} />
                </button>
              </>
            ) : panel === "planner" ? (
              <>
                <p>Monte uma divisão de tempo para a sua próxima sessão.</p>
                <label>
                  Tempo disponível: <strong>{minutes} minutos</strong>
                  <input
                    type="range"
                    min="15"
                    max="180"
                    step="15"
                    value={minutes}
                    onChange={(e) => setMinutes(Number(e.target.value))}
                  />
                </label>
                <label>
                  Foco da sessão
                  <select
                    value={focus}
                    onChange={(e) => setFocus(e.target.value)}
                  >
                    <option>Exploração</option>
                    <option>Objetivos pessoais</option>
                    <option>Passeio e coleção</option>
                  </select>
                </label>
                <div className="schedule">
                  {[
                    ["Preparação", Math.round(minutes * 0.15)],
                    [focus, Math.round(minutes * 0.7)],
                    [
                      "Revisar suas conquistas",
                      minutes -
                        Math.round(minutes * 0.15) -
                        Math.round(minutes * 0.7),
                    ],
                  ].map(([label, time], i) => (
                    <div key={label}>
                      <span>0{i + 1}</span>
                      <strong>{label}</strong>
                      <span>{time} min</span>
                    </div>
                  ))}
                </div>
                <button
                  className="primary"
                  onClick={() => {
                    setTasks((t) => [
                      ...t,
                      {
                        text: `Sessão de ${minutes} min: ${focus}`,
                        done: false,
                      },
                    ]);
                    open("tracker");
                  }}
                >
                  Salvar como objetivo <Plus size={17} />
                </button>
              </>
            ) : (
              <>
                <p>
                  {panel === "tracker"
                    ? "Crie sua lista pessoal. Marque cada conquista no seu ritmo."
                    : "Adicione os veículos que você quer colecionar. Sua lista é pessoal."}
                </p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!draft.trim()) return;
                    if (panel === "tracker")
                      setTasks((t) => [
                        ...t,
                        { text: draft.trim(), done: false },
                      ]);
                    else setCars((c) => [...c, draft.trim()]);
                    setDraft("");
                  }}
                  className="add-form"
                >
                  <input
                    aria-label={
                      panel === "tracker" ? "Novo objetivo" : "Nome do veículo"
                    }
                    placeholder={
                      panel === "tracker"
                        ? "Qual é seu próximo objetivo?"
                        : "Nome do veículo"
                    }
                    maxLength={120}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                  />
                  <button
                    className="primary"
                    aria-label="Adicionar"
                    disabled={!ready || !draft.trim()}
                  >
                    <Plus />
                  </button>
                </form>
                <div className="saved-list">
                  {panel === "tracker"
                    ? tasks.map((t, i) => (
                        <div key={i}>
                          <button
                            className={`task-check ${t.done ? "done" : ""}`}
                            onClick={() =>
                              setTasks((ts) =>
                                ts.map((a, j) =>
                                  j === i ? { ...a, done: !a.done } : a,
                                ),
                              )
                            }
                            aria-label={`${t.done ? "Desmarcar" : "Concluir"} ${t.text}`}
                            aria-pressed={t.done}
                          >
                            {t.done && <Check size={14} />}
                          </button>
                          <span className={t.done ? "completed" : ""}>
                            {t.text}
                          </span>
                          <button
                            className="icon-button"
                            aria-label={`Excluir ${t.text}`}
                            onClick={() =>
                              setTasks((ts) => ts.filter((_, j) => i !== j))
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    : cars.map((c, i) => (
                        <div key={i}>
                          <Car size={20} />
                          <span>{c}</span>
                          <button
                            className="icon-button"
                            aria-label={`Excluir ${c}`}
                            onClick={() =>
                              setCars((cs) => cs.filter((_, j) => i !== j))
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                  {(panel === "tracker" ? tasks : cars).length === 0 && (
                    <p className="empty">
                      Tudo começa com uma ideia. Adicione a primeira acima.
                    </p>
                  )}
                </div>
                <small className="storage-note">
                  Salvo neste navegador quando o armazenamento está disponível.
                  Sem sincronização entre dispositivos.
                </small>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
