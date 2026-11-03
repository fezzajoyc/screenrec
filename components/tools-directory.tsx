"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "./icons";
import { tileStyle } from "@/lib/tool-colors";

type Item = {
  slug: string;
  category: string;
  icon: string;
  name: string;
  tagline: string;
};

export function ToolsDirectory({
  tools,
  labels,
}: {
  tools: Item[];
  labels: {
    filterPlaceholder: string;
    empty: string;
    clearSearch?: string;
    backHome?: string;
    categoryNames: Record<string, string>;
    hrefLang: string;
  };
}) {
  const [query, setQuery] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("q") ?? "";
  });
  const q = query.trim().toLowerCase();

  const filtered = useMemo(
    () =>
      q
        ? tools.filter(
            (tool) =>
              tool.name.toLowerCase().includes(q) || tool.tagline.toLowerCase().includes(q),
          )
        : tools,
    [tools, q],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const tool of filtered) {
      const arr = map.get(tool.category) ?? [];
      arr.push(tool);
      map.set(tool.category, arr);
    }
    return map;
  }, [filtered]);

  return (
    <div>
      <input
        type="search"
        className="field mb-6 max-w-md"
        placeholder={labels.filterPlaceholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label={labels.filterPlaceholder}
      />

      {filtered.length === 0 && (
        <div className="rounded-2xl border hairline bg-[var(--color-card)] p-8 text-center">
          <p className="text-[15px] text-[var(--color-sub)]">
            {labels.empty.replace("{query}", query)}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-full border hairline px-4 py-2 text-[13.5px] font-medium transition-colors hover:bg-[var(--color-surface)]"
            >
              ✕ {labels.clearSearch}
            </button>
            <Link
              href={`/${labels.hrefLang}`}
              className="rounded-full bg-[var(--color-accent)] px-4 py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-[var(--color-accent-strong)]"
            >
              {labels.backHome}
            </Link>
          </div>
        </div>
      )}

      {[...grouped.entries()].map(([cat, items]) => (
        <section key={cat} className="mb-10">
          <h2 className="section-title mb-4">
            {labels.categoryNames[cat] ?? cat}
            <span className="ml-2 text-[14px] font-normal text-[var(--color-sub)]">
              {items.length}
            </span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((tool) => (
              <Link
                key={tool.slug}
                href={`/${labels.hrefLang}/tools/${tool.slug}`}
                className="group flex items-start gap-3 rounded-xl border hairline bg-white p-4 transition-colors hover:bg-[var(--color-surface)]"
              >
                <span className="mt-0.5 inline-flex flex-none rounded-lg p-2 transition-transform group-hover:scale-105"
                  style={tileStyle(tool.slug, tool.category)}>
                  <Icon name={tool.icon} size={18} />
                </span>
                <span>
                  <span className="block font-medium leading-tight">{tool.name}</span>
                  <span className="mt-1 line-clamp-2 block text-[13px] leading-5 text-[var(--color-sub)]">
                    {tool.tagline}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
