/**
 * 秒表纯逻辑:分段计时(lap)数学与显示格式化,全部 Node 可测。
 * cumulative 为每次按表时刻的累计毫秒数(含最后一次);非法输入(非有限、负数)
 * 返回空表 / "—",不抛异常。
 */

export type LapRow = {
  /** 第几段,从 1 开始(按时间升序) */
  index: number;
  /** 本段用时(毫秒)= 该次累计 − 上一次累计 */
  lap: number;
  /** 自开始累计(毫秒) */
  total: number;
};

/**
 * 由累计时刻序列求每段用时。先按升序排序(容忍乱序输入),
 * 第 n 段 = cumulative[n] − cumulative[n−1](第 1 段从 0 起)。
 * 空表 / 非有限或负数元素 → [](空表,不抛异常);允许重复值(段用时为 0)。
 */
export function lapRows(cumulative: number[]): LapRow[] {
  if (!Array.isArray(cumulative) || cumulative.length === 0) return [];
  if (!cumulative.every((t) => Number.isFinite(t) && t >= 0)) return [];
  const sorted = [...cumulative].sort((a, b) => a - b);
  const rows: LapRow[] = [];
  let prev = 0;
  sorted.forEach((total, i) => {
    rows.push({ index: i + 1, lap: total - prev, total });
    prev = total;
  });
  return rows;
}

/** 毫秒 → 秒表显示:"M:SS.cc"(不足 1 小时)或 "H:MM:SS.cc";非有限/负 → "—" */
export function formatStopwatch(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return "—";
  const total = Math.floor(ms / 10); // 百分之一秒
  const cs = total % 100;
  const s = Math.floor(total / 100);
  const sec = s % 60;
  const min = Math.floor(s / 60) % 60;
  const h = Math.floor(s / 3600);
  const two = (n: number) => String(n).padStart(2, "0");
  const body = `${min}:${two(sec)}.${two(cs)}`;
  return h > 0 ? `${h}:${body}` : body;
}
