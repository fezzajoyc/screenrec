/**
 * 心率训练区纯逻辑:Tanaka 一族回归式估算最大心率 + Karvonen 储备心率法分区。
 * 非法输入(非有限数、年龄越界、静息 ≥ 最大)一律返回 NaN / 空表,不抛异常。
 */

/**
 * 最大心率(次/分钟):HRmax = 206.9 − 0.67 × age。
 * 来自对实测实验室最大心率的线性回归(Tanaka/Gellish 一族),比老经验式
 * "220 − 年龄" 在中高年龄段偏差更小。估算并非个体实测,引擎提供手输覆盖。
 * 有效域:10 ≤ age ≤ 100(成年人区间;儿童青少年的公式不同),越界 → NaN。
 */
export const HRMAX_AGE_MIN = 10;
export const HRMAX_AGE_MAX = 100;
export const HRMAX_INTERCEPT = 206.9;
export const HRMAX_SLOPE = 0.67;

export function maxHeartRate(age: number): number {
  if (
    !Number.isFinite(age) ||
    age < HRMAX_AGE_MIN ||
    age > HRMAX_AGE_MAX
  ) {
    return NaN;
  }
  return HRMAX_INTERCEPT - HRMAX_SLOPE * age;
}

/** 五个训练区占储备心率(HRR)的百分比区间:Z1 热身 … Z5 最大摄氧量 */
export const HR_ZONE_PCTS: ReadonlyArray<readonly [number, number]> = [
  [50, 60],
  [60, 70],
  [70, 80],
  [80, 90],
  [90, 100],
];

export type HrZoneId = "Z1" | "Z2" | "Z3" | "Z4" | "Z5";

export type HrZone = {
  /** 区号 Z1–Z5(引擎按 id 取本地化名称) */
  id: HrZoneId;
  /** 区间下限,占储备心率 % */
  pctLow: number;
  /** 区间上限,占储备心率 % */
  pctHigh: number;
  /** 区间下限,次/分钟 = 静息 + pctLow × (最大 − 静息) */
  low: number;
  /** 区间上限,次/分钟 = 静息 + pctHigh × (最大 − 静息) */
  high: number;
};

/**
 * Karvonen 储备心率法:target = rest + pct × (max − rest)。
 * HRR(max − rest)> 0 才有意义;静息 ≥ 最大 / 非有限输入 → [](空表,不抛异常)。
 * 区间连续:上一区上限 = 下一区下限,Z5 上限恰为最大心率。
 */
export function hrZones(maxHr: number, restingHr: number): HrZone[] {
  const ok =
    Number.isFinite(maxHr) &&
    Number.isFinite(restingHr) &&
    restingHr >= 0 &&
    maxHr > restingHr;
  if (!ok) return [];
  const hrr = maxHr - restingHr;
  return HR_ZONE_PCTS.map(([pctLow, pctHigh], i) => ({
    id: `Z${i + 1}` as HrZoneId,
    pctLow,
    pctHigh,
    low: restingHr + (pctLow / 100) * hrr,
    high: restingHr + (pctHigh / 100) * hrr,
  }));
}
