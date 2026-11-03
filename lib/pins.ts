/** 星标收藏:localStorage 持久化,跨语言只存 slug。多个页面(工作台/目录/详情)共用。 */
const PIN_KEY = "zoyku-pinned";

export function readPins(): string[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(PIN_KEY) ?? "[]");
    return Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writePins(slugs: string[]) {
  try {
    localStorage.setItem(PIN_KEY, JSON.stringify(slugs));
  } catch {
    /* 隐私模式静默 */
  }
}

export function togglePin(slug: string, current: string[]): string[] {
  const next = current.includes(slug) ? current.filter((s) => s !== slug) : [slug, ...current];
  writePins(next);
  return next;
}
