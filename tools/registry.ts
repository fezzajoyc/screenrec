import type { CategoryId } from "@/lib/site";
import type { ToolDef } from "./_lib/types";
import { RECORDER_TOOLS } from "./recorder";

export const ALL_TOOLS: ToolDef[] = [...RECORDER_TOOLS];

export const TOOL_BY_SLUG = new Map<string, ToolDef>(ALL_TOOLS.map((t) => [t.slug, t]));

export function toolsByCategory(cat: CategoryId): ToolDef[] {
  return ALL_TOOLS.filter((t) => t.category === cat);
}

export function relatedTools(t: ToolDef): ToolDef[] {
  return t.related
    .map((s) => TOOL_BY_SLUG.get(s))
    .filter((x): x is ToolDef => Boolean(x) && x!.slug !== t.slug);
}
