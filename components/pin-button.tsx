"use client";

import { useEffect, useState } from "react";
import { readPins, togglePin } from "@/lib/pins";

/** 工具详情页标题旁的星标收藏按钮(SSR 首屏未激活态,挂载后同步本地)。 */
export function PinButton({
  slug,
  labels,
}: {
  slug: string;
  labels: { pin: string; unpin: string };
}) {
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    setPinned(readPins().includes(slug));
  }, [slug]);

  const onToggle = () => {
    const next = togglePin(slug, readPins());
    setPinned(next.includes(slug));
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={pinned ? labels.unpin : labels.pin}
      aria-pressed={pinned}
      title={pinned ? labels.unpin : labels.pin}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13.5px] font-medium transition-colors ${
        pinned
          ? "border-[#f59e0b]/40 bg-[#f59e0b]/10 text-[#b45309] dark:text-[#fbbf24]"
          : "hairline text-[var(--color-sub)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]"
      }`}
    >
      <span className={pinned ? "text-[#f59e0b]" : ""}>{pinned ? "★" : "☆"}</span>
      {pinned ? labels.unpin : labels.pin}
    </button>
  );
}
