"use client";
import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import {
  X,
  Plus,
  Check,
  Trash2,
  Pencil,
  Star,
  Search,
  Car,
  Compass,
  Clock3,
  ArrowUpRight,
  Download,
  Upload,
  RotateCcw,
  Play,
  Pause,
  CheckCheck,
} from "lucide-react";
import type { Messages, Locale } from "@/lib/i18n";
import {
  categories,
  vehicleTypes,
  splitSession,
  normalizeText,
  taskTitle,
  readData,
  type Data,
  type Category,
  type VehicleType,
  type Task,
  type Vehicle,
} from "@/lib/model";
export type Panel = "explore" | "tracker" | "planner" | "garage";
export type Timer = { remaining: number; running: boolean; started: boolean };
type Props = {
  panel: Panel;
  open: (p: Panel) => void;
  close: () => void;
  t: Messages;
  locale: Locale;
  data: Data;
  setData: Dispatch<SetStateAction<Data>>;
  storageOk: boolean;
  timer: Timer;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setLocale: (v: Locale) => void;
  notify: (s: string) => void;
};
export function Workspace({
  panel,
  open,
  close,
  t,
  locale,
  data,
  setData,
  storageOk,
  timer,
  start,
  pause,
  reset,
  setLocale,
  notify,
}: Props) {
  const [draft, setDraft] = useState(""),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [category, setCategory] = useState<Category>("personalGoal"),
    [vehicleType, setVehicleType] = useState<VehicleType>("sports"),
    [editing, setEditing] = useState<string | null>(null),
    [editText, setEditText] = useState(""),
    [error, setError] = useState(""),
    [undo, setUndo] = useState<
      | { kind: "tasks"; item: Task; index: number }
      | { kind: "cars"; item: Vehicle; index: number }
      | null
    >(null);
  const dialog = useRef<HTMLElement>(null),
    closeButton = useRef<HTMLButtonElement>(null),
    file = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    closeButton.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const content = document.getElementById("site-content");
    if (content) content.inert = true;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        const nodes = Array.from(
          dialog.current?.querySelectorAll<HTMLElement>(
            'summary,button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]',
          ) || [],
        ).filter((n) => n.getClientRects().length > 0);
        const first = nodes[0],
          last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      if (content) content.inert = false;
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, []); // The workspace keeps one focus scope while switching tools.
  useEffect(() => {
    setDraft("");
    setSearch("");
    setFilter("all");
    setEditing(null);
    setError("");
    setUndo(null);
  }, [panel]);
  const title = {
    explore: t.exploreTitle,
    tracker: t.trackerTitle,
    garage: t.garageTitle,
    planner: t.plannerTitle,
  };
  const names = {
    explore: t.explore,
    tracker: t.objectives,
    garage: t.garage,
    planner: t.planner,
  };
  const icons = {
    explore: Compass,
    tracker: CheckCheck,
    garage: Car,
    planner: Clock3,
  };
  const completed = data.tasks.filter((x) => x.done).length;
  const add = () => {
    const text = draft.trim();
    if (!text) return;
    const list = panel === "tracker" ? data.tasks : data.cars;
    if (list.length >= 500) {
      setError(t.itemLimit);
      return;
    }
    if (
      panel === "tracker"
        ? data.tasks.some(
            (a) => normalizeText(taskTitle(a, t)) === normalizeText(text),
          )
        : data.cars.some((a) => normalizeText(a.name) === normalizeText(text))
    ) {
      setError(t.duplicate);
      return;
    }
    const id = crypto.randomUUID();
    setData((d) =>
      panel === "tracker"
        ? { ...d, tasks: [...d.tasks, { id, text, done: false, category }] }
        : {
            ...d,
            cars: [
              ...d.cars,
              {
                id,
                name: text,
                type: vehicleType,
                status: "wishlist",
                favorite: false,
              },
            ],
          },
    );
    setDraft("");
    setError("");
    notify(t.added);
  };
  const remove = (id: string) => {
    if (panel === "tracker") {
      const index = data.tasks.findIndex((a) => a.id === id);
      setUndo({ kind: "tasks", item: data.tasks[index], index });
      setData((d) => ({ ...d, tasks: d.tasks.filter((a) => a.id !== id) }));
    } else {
      const index = data.cars.findIndex((a) => a.id === id);
      setUndo({ kind: "cars", item: data.cars[index], index });
      setData((d) => ({ ...d, cars: d.cars.filter((a) => a.id !== id) }));
    }
  };
  const restore = () => {
    if (!undo) return;
    if (data[undo.kind].length >= 500) {
      setError(t.itemLimit);
      return;
    }
    setData((d) => {
      if (undo.kind === "tasks") {
        const tasks = [...d.tasks];
        tasks.splice(undo.index, 0, undo.item);
        return { ...d, tasks };
      }
      const cars = [...d.cars];
      cars.splice(undo.index, 0, undo.item);
      return { ...d, cars };
    });
    setUndo(null);
  };
  const saveEdit = (id: string) => {
    const text = editText.trim();
    if (!text) return;
    const duplicate =
      panel === "tracker"
        ? data.tasks.some(
            (a) =>
              a.id !== id &&
              normalizeText(taskTitle(a, t)) === normalizeText(text),
          )
        : data.cars.some(
            (a) => a.id !== id && normalizeText(a.name) === normalizeText(text),
          );
    if (duplicate) {
      setError(t.duplicate);
      return;
    }
    setData((d) =>
      panel === "tracker"
        ? {
            ...d,
            tasks: d.tasks.map((a) =>
              a.id === id ? { ...a, text, plan: undefined } : a,
            ),
          }
        : {
            ...d,
            cars: d.cars.map((a) => (a.id === id ? { ...a, name: text } : a)),
          },
    );
    setEditing(null);
    setError("");
    notify(t.updated);
  };
  const tasks = data.tasks.filter(
    (a) =>
      (filter === "all" || (filter === "done" ? a.done : !a.done)) &&
      normalizeText(taskTitle(a, t)).includes(normalizeText(search)),
  );
  const cars = data.cars.filter(
    (a) =>
      (filter === "all" ||
        (filter === "favorites" ? a.favorite : a.status === filter)) &&
      normalizeText(a.name).includes(normalizeText(search)),
  );
  const exportData = () => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify({ ...data, locale }, null, 2)], {
        type: "application/json",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "vi-companion-backup.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify(t.exported);
  };
  const editForm = (id: string) => (
    <form
      className="inline-edit"
      onSubmit={(e) => {
        e.preventDefault();
        saveEdit(id);
      }}
    >
      <input
        autoFocus
        aria-label={t.rename}
        value={editText}
        maxLength={120}
        onChange={(e) => setEditText(e.target.value)}
      />
      <button
        className="icon-button"
        aria-label={t.save}
        disabled={!editText.trim()}
      >
        <Check size={18} />
      </button>
      <button
        type="button"
        className="icon-button"
        aria-label={t.cancel}
        onClick={() => setEditing(null)}
      >
        <X size={18} />
      </button>
    </form>
  );
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <section
        ref={dialog}
        className="modal workspace"
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-title"
      >
        <aside className="workspace-side">
          <span className="workspace-brand">
            VI<span>COMPANION</span>
          </span>
          <nav aria-label={t.nav}>
            {(["explore", "tracker", "planner", "garage"] as Panel[]).map(
              (id) => {
                const Icon = icons[id];
                return (
                  <button
                    key={id}
                    className={panel === id ? "selected" : ""}
                    aria-current={panel === id ? "page" : undefined}
                    onClick={() => open(id)}
                  >
                    <Icon size={18} />
                    <span>{names[id]}</span>
                  </button>
                );
              },
            )}
          </nav>
          <div className="workspace-side-note">
            <Sparkle />
            <p>{t.themeNote}</p>
          </div>
        </aside>
        <div className="workspace-body">
          <button
            ref={closeButton}
            className="icon-button modal-close"
            onClick={close}
            aria-label={t.close}
          >
            <X />
          </button>
          <span className="eyebrow muted">{t.workspace}</span>
          <h2 id="workspace-title">{title[panel]}</h2>
          <p>
            {panel === "tracker"
              ? t.trackerIntro
              : panel === "garage"
                ? t.garageIntro
                : panel === "planner"
                  ? t.plannerIntro
                  : t.exploreIntro}
          </p>
          {panel === "explore" ? (
            <>
              <div className="mood-grid">
                {(["coastal", "neon", "wild"] as const).map((m, i) => (
                  <button
                    className={`mood-card mood-${m}`}
                    key={m}
                    onClick={() => {
                      setData((d) => ({
                        ...d,
                        focus: i === 1 ? "collection" : "exploration",
                      }));
                      open("planner");
                    }}
                  >
                    <div className="mood-landscape">
                      <i />
                      <b />
                      <span>0{i + 1}</span>
                    </div>
                    <strong>{t[m]}</strong>
                    <p>{t[`${m}Text`]}</p>
                    <span>
                      {t.useMood}
                      <ArrowUpRight size={17} />
                    </span>
                  </button>
                ))}
              </div>
              <p className="storage-note">{t.conceptual}</p>
            </>
          ) : panel === "planner" ? (
            <>
              <div className="planner-layout">
                <div>
                  <label>
                    {t.time}:{" "}
                    <strong>
                      {data.minutes} {t.minutes}
                    </strong>
                    <input
                      type="range"
                      aria-label={t.time}
                      min="15"
                      max="180"
                      step="15"
                      value={data.minutes}
                      disabled={timer.started}
                      onChange={(e) =>
                        setData((d) => ({
                          ...d,
                          minutes: Number(e.target.value),
                        }))
                      }
                    />
                  </label>
                  <div className="duration-presets">
                    {[30, 60, 90, 120].map((n) => (
                      <button
                        key={n}
                        disabled={timer.started}
                        aria-pressed={data.minutes === n}
                        onClick={() => setData((d) => ({ ...d, minutes: n }))}
                      >
                        {n} min
                      </button>
                    ))}
                  </div>
                  {timer.started && (
                    <p className="storage-note">{t.changePlanHint}</p>
                  )}
                  <label>
                    {t.focus}
                    <select
                      value={data.focus}
                      onChange={(e) =>
                        setData((d) => ({
                          ...d,
                          focus: e.target.value as Category,
                        }))
                      }
                    >
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {t[c]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="schedule">
                    {splitSession(data.minutes).map((n, i) => (
                      <div key={i}>
                        <span>0{i + 1}</span>
                        <strong>
                          {[t.prepare, t[data.focus], t.review][i]}
                        </strong>
                        <span>{n} min</span>
                      </div>
                    ))}
                  </div>
                  <button
                    className="primary"
                    onClick={() => {
                      if (data.tasks.length >= 500) {
                        setError(t.itemLimit);
                        return;
                      }
                      if (
                        data.tasks.some(
                          (a) =>
                            !a.done &&
                            a.plan?.minutes === data.minutes &&
                            a.plan?.focus === data.focus,
                        )
                      ) {
                        setError(t.planSaved);
                        return;
                      }
                      setData((d) => ({
                        ...d,
                        tasks: [
                          ...d.tasks,
                          {
                            id: crypto.randomUUID(),
                            text: `Session ${d.minutes}`,
                            done: false,
                            category: d.focus,
                            plan: { minutes: d.minutes, focus: d.focus },
                          },
                        ],
                      }));
                      notify(t.added);
                      open("tracker");
                    }}
                  >
                    {t.savePlan}
                    <Plus size={17} />
                  </button>
                </div>
                <div className="timer-card">
                  <span className="eyebrow">
                    {!timer.started
                      ? t.timerReady
                      : timer.remaining === 0
                        ? t.timerDone
                        : timer.running
                          ? t.timerRunning
                          : t.timerPaused}
                  </span>
                  <div
                    className="timer-dial"
                    style={
                      {
                        "--timer-progress": `${(1 - timer.remaining / (data.minutes * 60)) * 360}deg`,
                      } as React.CSSProperties
                    }
                  >
                    <strong
                      aria-label={`${Math.floor(timer.remaining / 60)} ${t.minutes}`}
                    >
                      {String(Math.floor(timer.remaining / 60)).padStart(
                        2,
                        "0",
                      )}
                      <span>
                        :{String(timer.remaining % 60).padStart(2, "0")}
                      </span>
                    </strong>
                  </div>
                  <div className="timer-actions">
                    <button
                      className="primary"
                      disabled={timer.remaining === 0}
                      onClick={timer.running ? pause : start}
                    >
                      {timer.running ? <Pause size={17} /> : <Play size={17} />}{" "}
                      {timer.running
                        ? t.pause
                        : timer.started
                          ? t.resume
                          : t.start}
                    </button>
                    <button
                      className="icon-button"
                      onClick={reset}
                      aria-label={t.reset}
                    >
                      <RotateCcw size={19} />
                    </button>
                  </div>
                  <p role={timer.remaining === 0 ? "status" : undefined}>
                    {timer.remaining === 0 ? t.timerFinish : t.timerHint}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {panel === "tracker" && (
                <div className="progress-summary">
                  <div>
                    <strong>
                      {completed}
                      <span> / {data.tasks.length}</span>
                    </strong>
                    <span>{t.completed}</span>
                  </div>
                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-label={t.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={
                      data.tasks.length
                        ? Math.round((completed / data.tasks.length) * 100)
                        : 0
                    }
                  >
                    <i
                      style={{
                        width: `${data.tasks.length ? (completed / data.tasks.length) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              )}
              <form
                className="add-form enhanced-add"
                onSubmit={(e) => {
                  e.preventDefault();
                  add();
                }}
              >
                <input
                  aria-label={
                    panel === "tracker" ? t.newObjective : t.vehicleName
                  }
                  placeholder={
                    panel === "tracker"
                      ? t.objectivePlaceholder
                      : t.vehiclePlaceholder
                  }
                  maxLength={120}
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    setError("");
                  }}
                />
                <select
                  aria-label={panel === "tracker" ? t.category : t.vehicleType}
                  value={panel === "tracker" ? category : vehicleType}
                  onChange={(e) =>
                    panel === "tracker"
                      ? setCategory(e.target.value as Category)
                      : setVehicleType(e.target.value as VehicleType)
                  }
                >
                  {(panel === "tracker" ? categories : vehicleTypes).map(
                    (c) => (
                      <option key={c} value={c}>
                        {t[c]}
                      </option>
                    ),
                  )}
                </select>
                <button className="primary" disabled={!draft.trim()}>
                  <Plus size={17} />
                  <span>{t.add}</span>
                </button>
              </form>
              <div className="list-toolbar">
                <div className="filter-tabs">
                  {(panel === "tracker"
                    ? (["all", "todo", "done"] as const)
                    : (["all", "wishlist", "owned", "favorites"] as const)
                  ).map((f) => (
                    <button
                      key={f}
                      aria-pressed={filter === f}
                      onClick={() => setFilter(f)}
                    >
                      {t[f]}
                    </button>
                  ))}
                </div>
                <label className="search-field">
                  <Search size={16} />
                  <input
                    aria-label={t.search}
                    placeholder={t.search}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
              </div>
              <div className="items-list">
                {panel === "tracker"
                  ? tasks.map((a) => (
                      <article
                        className={a.done ? "item-row is-complete" : "item-row"}
                        key={a.id}
                      >
                        <button
                          className={`task-check ${a.done ? "done" : ""}`}
                          aria-label={`${a.done ? t.markTodo : t.markDone}: ${taskTitle(a, t)}`}
                          aria-pressed={a.done}
                          onClick={() =>
                            setData((d) => ({
                              ...d,
                              tasks: d.tasks.map((x) =>
                                x.id === a.id ? { ...x, done: !x.done } : x,
                              ),
                            }))
                          }
                        >
                          {a.done && <Check size={16} />}
                        </button>
                        <div className="item-main">
                          {editing === a.id ? (
                            editForm(a.id)
                          ) : (
                            <>
                              <strong>{taskTitle(a, t)}</strong>
                              <span className="item-badge">
                                {t[a.category]}
                              </span>
                            </>
                          )}
                        </div>
                        <button
                          className="icon-button"
                          aria-label={`${t.edit}: ${taskTitle(a, t)}`}
                          onClick={() => {
                            setEditing(a.id);
                            setEditText(taskTitle(a, t));
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`${t.remove}: ${taskTitle(a, t)}`}
                          onClick={() => remove(a.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </article>
                    ))
                  : cars.map((a) => (
                      <article className="item-row vehicle-row" key={a.id}>
                        <div className={`vehicle-icon type-${a.type}`}>
                          <Car size={24} />
                        </div>
                        <div className="item-main">
                          {editing === a.id ? (
                            editForm(a.id)
                          ) : (
                            <>
                              <strong>{a.name}</strong>
                              <span className="item-badge">{t[a.type]}</span>
                            </>
                          )}
                        </div>
                        <select
                          className="status-select"
                          aria-label={`${t.status}: ${a.name}`}
                          value={a.status}
                          onChange={(e) =>
                            setData((d) => ({
                              ...d,
                              cars: d.cars.map((x) =>
                                x.id === a.id
                                  ? {
                                      ...x,
                                      status: e.target
                                        .value as Vehicle["status"],
                                    }
                                  : x,
                              ),
                            }))
                          }
                        >
                          <option value="wishlist">{t.wishlist}</option>
                          <option value="owned">{t.owned}</option>
                        </select>
                        <button
                          className={`icon-button ${a.favorite ? "is-favorite" : ""}`}
                          aria-label={`${a.favorite ? t.unfavorite : t.favorite}: ${a.name}`}
                          aria-pressed={a.favorite}
                          onClick={() =>
                            setData((d) => ({
                              ...d,
                              cars: d.cars.map((x) =>
                                x.id === a.id
                                  ? { ...x, favorite: !x.favorite }
                                  : x,
                              ),
                            }))
                          }
                        >
                          <Star
                            size={17}
                            fill={a.favorite ? "currentColor" : "none"}
                          />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`${t.edit}: ${a.name}`}
                          onClick={() => {
                            setEditing(a.id);
                            setEditText(a.name);
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label={`${t.remove}: ${a.name}`}
                          onClick={() => remove(a.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </article>
                    ))}
                {(panel === "tracker" ? tasks : cars).length === 0 && (
                  <div className="empty-state">
                    <Compass size={32} />
                    <h3>{t.empty}</h3>
                    <p>{t.emptyText}</p>
                  </div>
                )}
              </div>
              {undo && (
                <div className="undo-bar" role="status">
                  {t.deleted}
                  <button onClick={restore}>
                    {t.undo}
                    <RotateCcw size={14} />
                  </button>
                </div>
              )}
            </>
          )}
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="workspace-footer">
            <span className={`save-status ${storageOk ? "" : "storage-error"}`}>
              {storageOk ? t.local : t.storageError}
            </span>
            <details>
              <summary>{t.backup}</summary>
              <p>{t.backupHint}</p>
              <div className="backup-actions">
                <button className="secondary" onClick={exportData}>
                  <Download size={16} />
                  {t.export}
                </button>
                <button
                  className="secondary"
                  onClick={() => file.current?.click()}
                >
                  <Upload size={16} />
                  {t.import}
                </button>
              </div>
            </details>
            <input
              type="file"
              hidden
              ref={file}
              accept=".json,application/json"
              onChange={async (e) => {
                const chosen = e.target.files?.[0];
                e.target.value = "";
                if (!chosen) return;
                try {
                  if (chosen.size > 1000000) throw Error();
                  const raw = JSON.parse(await chosen.text());
                  const restored = readData(raw);
                  if (!window.confirm(t.importConfirm)) return;
                  reset();
                  setData(restored);
                  if (
                    raw.locale === "en" ||
                    raw.locale === "es" ||
                    raw.locale === "pt-BR"
                  )
                    setLocale(raw.locale);
                  setUndo(null);
                  setError("");
                  notify(t.restored);
                } catch {
                  setError(t.invalidBackup);
                }
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
function Sparkle() {
  return (
    <span className="workspace-sparkle" aria-hidden="true">
      ✦
    </span>
  );
}
