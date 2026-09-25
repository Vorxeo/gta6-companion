export type Category = "exploration" | "collection" | "personalGoal";
export type VehicleType = "sports" | "classic" | "offroad" | "other";
export type Task = {
  id: string;
  text: string;
  done: boolean;
  category: Category;
  plan?: { minutes: number; focus: Category };
};
export type Vehicle = {
  id: string;
  name: string;
  type: VehicleType;
  status: "wishlist" | "owned";
  favorite: boolean;
};
export type Data = {
  version: 2;
  tasks: Task[];
  cars: Vehicle[];
  minutes: number;
  focus: Category;
};
export const initialData: Data = {
  version: 2,
  tasks: [],
  cars: [],
  minutes: 60,
  focus: "exploration",
};
export const categories: Category[] = [
  "exploration",
  "collection",
  "personalGoal",
];
export const vehicleTypes: VehicleType[] = [
  "sports",
  "classic",
  "offroad",
  "other",
];
export function splitSession(minutes: number) {
  const prepare = Math.round(minutes * 0.15),
    main = Math.round(minutes * 0.7);
  return [prepare, main, minutes - prepare - main];
}
export function normalizeText(text: string) {
  return text.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase();
}
export function taskTitle(
  task: Task,
  t: {
    session: string;
    exploration: string;
    collection: string;
    personalGoal: string;
  },
) {
  return task.plan
    ? `${t.session} · ${task.plan.minutes} min · ${t[task.plan.focus]}`
    : task.text;
}
const record = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const category = (v: unknown): v is Category =>
  categories.includes(v as Category);
const duration = (v: unknown): v is number =>
  typeof v === "number" &&
  Number.isInteger(v) &&
  v >= 15 &&
  v <= 180 &&
  v % 15 === 0;
const name = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= 120;
/** Strict on current backups; migrates the original site's lists without losing user text. */
export function readData(value: unknown): Data {
  if (
    !record(value) ||
    !Array.isArray(value.tasks) ||
    !Array.isArray(value.cars) ||
    value.tasks.length > 500 ||
    value.cars.length > 500
  )
    throw Error("Invalid data");
  if (value.version !== undefined && value.version !== 2)
    throw Error("Unsupported version");
  const legacy = value.version === undefined;
  const ids = new Set<string>();
  const id = (v: unknown, prefix: string, index: number) => {
    const result =
      typeof v === "string" && v.length > 0 && v.length < 150
        ? v
        : `${prefix}-${index}`;
    if (ids.has(result)) throw Error("Duplicate id");
    ids.add(result);
    return result;
  };
  const tasks: Task[] = value.tasks.map((v, i) => {
    if (
      !record(v) ||
      !name(v.text) ||
      typeof v.done !== "boolean" ||
      (!legacy && !category(v.category))
    )
      throw Error("Invalid task");
    const task: Task = {
      id: id(v.id, "task", i),
      text: v.text.trim(),
      done: v.done,
      category: category(v.category) ? v.category : "personalGoal",
    };
    if (v.plan !== undefined) {
      if (
        !record(v.plan) ||
        !duration(v.plan.minutes) ||
        !category(v.plan.focus)
      )
        throw Error("Invalid plan");
      task.plan = { minutes: v.plan.minutes, focus: v.plan.focus };
    }
    return task;
  });
  const cars: Vehicle[] = value.cars.map((v, i) => {
    if (legacy && name(v))
      return {
        id: id(undefined, "car", i),
        name: v.trim(),
        type: "other",
        status: "wishlist",
        favorite: false,
      };
    if (
      !record(v) ||
      !name(v.name) ||
      !vehicleTypes.includes(v.type as VehicleType) ||
      (v.status !== "wishlist" && v.status !== "owned") ||
      typeof v.favorite !== "boolean"
    )
      throw Error("Invalid car");
    return {
      id: id(v.id, "car", i),
      name: v.name.trim(),
      type: v.type as VehicleType,
      status: v.status,
      favorite: v.favorite,
    };
  });
  if (!legacy && (!duration(value.minutes) || !category(value.focus)))
    throw Error("Invalid preferences");
  return {
    version: 2,
    tasks,
    cars,
    minutes: duration(value.minutes) ? value.minutes : 60,
    focus: category(value.focus) ? value.focus : "exploration",
  };
}
