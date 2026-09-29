export const panels = ["explore", "tracker", "planner", "garage"] as const;
export function safePanel(value: unknown): typeof panels[number] {
  return panels.includes(value as typeof panels[number]) ? value as typeof panels[number] : "tracker";
}
export function workspacePath(panel: unknown) {
  return `/workspace?panel=${safePanel(panel)}`;
}
export function safeDestination(next: unknown, panel: unknown) {
  if (next === "arcade") return "/arcade";
  if (next === "creator-lab") return "/creator-lab";
  return workspacePath(panel);
}
export function hasActiveSubscription(value: unknown, now = Date.now()): boolean {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  if (record.status !== "active" && record.status !== "trialing") return false;
  if (typeof record.current_period_end !== "string") return false;
  const end = Date.parse(record.current_period_end);
  return Number.isFinite(end) && end > now;
}
