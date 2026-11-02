/** 倒计时纯逻辑(引擎负责 rAF 与音频)。 */
export type CountdownParts = { hours: number; minutes: number; seconds: number };

export function totalSeconds(p: CountdownParts): number {
  const valid = [p.hours, p.minutes, p.seconds].every(
    (n) => Number.isInteger(n) && n >= 0,
  );
  if (!valid) return NaN;
  return p.hours * 3600 + p.minutes * 60 + p.seconds;
}

/** 剩余秒 → 显示分段(向上取整到秒)。 */
export function remainingParts(totalSecondsLeft: number): CountdownParts {
  if (!Number.isFinite(totalSecondsLeft) || totalSecondsLeft < 0) {
    return { hours: 0, minutes: 0, seconds: 0 };
  }
  const s = Math.ceil(totalSecondsLeft);
  return {
    hours: Math.floor(s / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/** SVG 进度环参数:周长与偏移(0..1 进度)。 */
export function ringGeometry(fractionElapsed: number, radius: number): { circumference: number; dashOffset: number } {
  const clamped = Math.min(1, Math.max(0, fractionElapsed));
  const circumference = 2 * Math.PI * radius;
  return { circumference, dashOffset: circumference * clamped };
}

/** WebAudio 提示音(引擎调用,返回清理函数)。 */
export function beepPattern(): { freq: number; durationsMs: number[] } {
  return { freq: 880, durationsMs: [180, 120, 180, 120, 320] };
}
