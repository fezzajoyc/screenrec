"use client";

import type { ReactNode } from "react";
import type { Locale } from "@/lib/site";

/** ScreenRec 三个录制引擎共用的轻量 UI 原语与取词助手(全部客户端组件)。 */

/** 引擎内的每语言短文案:按 locale 取,缺省回退英文。 */
export function pick(locale: Locale, rec: Record<string, string>): string {
  return rec[locale] ?? rec.en;
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="block text-[13px] font-medium text-[var(--color-sub)]">{label}</span>
      {children}
    </div>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <p className="text-[13px] leading-5 text-[var(--color-sub)]">{children}</p>;
}

/** 原生下拉(quality / fps / duration / width 这类小选项)。 */
export function Select({
  value,
  onChange,
  options,
  aria,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  aria: string;
}) {
  return (
    <select
      className="field"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={aria}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Check({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13.5px] font-medium text-[var(--color-ink)]">
      <input
        type="checkbox"
        className="h-4 w-4 rounded border hairline accent-[var(--color-ink)]"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

/** 计时 / 体积这类实时数字位。 */
export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border hairline px-3.5 py-3">
      <div className="text-[12.5px] font-medium text-[var(--color-sub)]">{label}</div>
      <div className="mono mt-1 text-[17px] font-semibold leading-6 text-[var(--color-ink)]" aria-live="polite">
        {value}
      </div>
    </div>
  );
}

/** 主操作按钮(开始 / 停止 / 下载)。 */
export function ActionButton({
  onClick,
  children,
  tone = "ink",
  aria,
}: {
  onClick: () => void;
  children: ReactNode;
  tone?: "ink" | "stop" | "ghost";
  aria?: string;
}) {
  const cls =
    tone === "stop"
      ? "bg-[#b3261e] text-white hover:opacity-90"
      : tone === "ghost"
        ? "hairline text-[var(--color-ink)] hover:bg-[var(--color-surface)]"
        : "bg-[var(--color-ink)] text-white hover:opacity-90";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-[14px] font-semibold transition-all ${cls}`}
    >
      {children}
    </button>
  );
}

/** 录制中的红点徽标。 */
export function RecDot() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#b3261e]/10 px-2.5 py-1 text-[12px] font-semibold text-[#b3261e]">
      <span className="h-2 w-2 animate-pulse rounded-full bg-[#b3261e]" aria-hidden="true" />
      REC
    </span>
  );
}

/** 错误 / 提示条。 */
export function Alert({ kind = "warn", children }: { kind?: "warn" | "error"; children: ReactNode }) {
  const cls =
    kind === "error"
      ? "border-[#b3261e]/30 bg-[#b3261e]/5 text-[#8c1d18]"
      : "border-[color:var(--color-border,#e5e7eb)] bg-[var(--color-surface)] text-[var(--color-sub)]";
  return <div className={`rounded-xl border px-4 py-3 text-[13px] leading-5 ${cls}`}>{children}</div>;
}
