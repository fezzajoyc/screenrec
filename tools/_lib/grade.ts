/**
 * 成绩计算纯数学,Node 可测、手算向量可核。
 * weighted:按权重加权得分率;points:总得分 / 总满分。
 * required-final:在剩余权重 / 剩余分数上反推达标所需分数,可为负(已稳过)
 * 或超过 100(理论上不可能),由 UI 如实呈现。
 */

export type GradeMode = "weighted" | "points";

export type GradeItem = {
  name?: string;
  score: number;
  max: number;
  weight?: number;
};

/** 等级表:按 min 降序排列的门槛;percent ≥ min 即命中。 */
export type LetterScale = { min: number; letter: string }[];

/** 美国 10 分制 A–F。 */
export const US_SCALE: LetterScale = [
  { min: 90, letter: "A" },
  { min: 80, letter: "B" },
  { min: 70, letter: "C" },
  { min: 60, letter: "D" },
  { min: 0, letter: "F" },
];

/** 带正负号的 13 级制。 */
export const PLUS_MINUS_SCALE: LetterScale = [
  { min: 93, letter: "A" },
  { min: 90, letter: "A-" },
  { min: 87, letter: "B+" },
  { min: 83, letter: "B" },
  { min: 80, letter: "B-" },
  { min: 77, letter: "C+" },
  { min: 73, letter: "C" },
  { min: 70, letter: "C-" },
  { min: 67, letter: "D+" },
  { min: 63, letter: "D" },
  { min: 60, letter: "D-" },
  { min: 0, letter: "F" },
];

/** 及格制。 */
export const PASS_FAIL_SCALE: LetterScale = [
  { min: 70, letter: "Pass" },
  { min: 0, letter: "Fail" },
];

/** 单条成绩是否可参与计算:分数非负有限、满分有限且 > 0。超满分合法(附加分)。 */
export function isValidItem(it: GradeItem): boolean {
  return (
    Number.isFinite(it.score) &&
    it.score >= 0 &&
    Number.isFinite(it.max) &&
    it.max > 0
  );
}

/**
 * 当前总评百分比。无效条目整条剔除;没有任何有效条目,或 weighted 模式下
 * 有效权重之和为 0,返回 NaN。结果可超过 100(附加分)。
 */
export function gradePercent(items: GradeItem[], mode: GradeMode): number {
  const valid = items.filter(isValidItem);
  if (valid.length === 0) return NaN;
  if (mode === "points") {
    const earned = valid.reduce((s, it) => s + it.score, 0);
    const possible = valid.reduce((s, it) => s + it.max, 0);
    return possible > 0 ? (earned / possible) * 100 : NaN;
  }
  let num = 0;
  let den = 0;
  for (const it of valid) {
    const w = it.weight;
    if (!Number.isFinite(w) || (w as number) < 0) continue;
    num += (w as number) * (it.score / it.max);
    den += w as number;
  }
  return den > 0 ? (num / den) * 100 : NaN;
}

/** 百分比 → 等级字母。NaN 或低于所有门槛时返回空串。 */
export function letterFor(percent: number, scale: LetterScale = US_SCALE): string {
  if (!Number.isFinite(percent)) return "";
  let best: string = "";
  let bestMin = -Infinity;
  for (const e of scale) {
    if (percent >= e.min && e.min > bestMin) {
      best = e.letter;
      bestMin = e.min;
    }
  }
  return best;
}

export type RequiredFinalWeightedOpts = {
  items: GradeItem[];
  /** 期末考试权重(百分比),必须 > 0,否则 NaN —— 零剩余权重无从反推。 */
  finalWeight: number;
  /** 目标总评百分比(0–100+,允许附加分目标)。 */
  targetPercent: number;
};

/**
 * 加权制下:期末要考多少分(百分比)才能达到目标总评。
 * f = (target% × (Σw_current + W) − Σ(w_i × s_i/m_i)) ÷ W × 100。
 * 结果 ≤ 0 表示已稳达目标,> 100 表示该目标已不可能。无有效当前条目时,
 * 等价于"期末须达到 target%"。
 */
export function requiredFinalWeighted({ items, finalWeight, targetPercent }: RequiredFinalWeightedOpts): number {
  if (!Number.isFinite(finalWeight) || finalWeight <= 0) return NaN;
  if (!Number.isFinite(targetPercent) || targetPercent < 0) return NaN;
  let current = 0;
  let currentWeight = 0;
  for (const it of items) {
    if (!isValidItem(it)) continue;
    const w = it.weight;
    if (!Number.isFinite(w) || (w as number) < 0) continue;
    current += (w as number) * (it.score / it.max);
    currentWeight += w as number;
  }
  const total = currentWeight + finalWeight;
  const need = (targetPercent / 100) * total - current;
  return (need / finalWeight) * 100;
}

export type RequiredFinalPointsOpts = {
  /** 已获总分(不含期末)。 */
  earned: number;
  /** 目前已开放的满分合计(不含期末),必须 > 0。 */
  possible: number;
  /** 期末满分,必须 > 0。 */
  finalPoints: number;
  /** 目标总评百分比,按 (possible + finalPoints) 计。 */
  targetPercent: number;
};

/**
 * 分数制下:期末要考的百分比。needed = target% × (possible + finalPoints) − earned,
 * 返回 needed ÷ finalPoints × 100;≤ 0 已稳过,> 100 不可能。
 */
export function requiredFinalPoints({ earned, possible, finalPoints, targetPercent }: RequiredFinalPointsOpts): number {
  if (!Number.isFinite(possible) || possible <= 0) return NaN;
  if (!Number.isFinite(finalPoints) || finalPoints <= 0) return NaN;
  if (!Number.isFinite(earned) || earned < 0) return NaN;
  if (!Number.isFinite(targetPercent) || targetPercent < 0) return NaN;
  const need = (targetPercent / 100) * (possible + finalPoints) - earned;
  return (need / finalPoints) * 100;
}

// ─────────────────────────── GPA(4.0 绩点) ───────────────────────────
// 美制 4.0 质量点表(A+/A = 4,A- = 3.7,B+ = 3.3,B = 3,B- = 2.7,C+ = 2.3,
// C = 2,C- = 1.7,D+ = 1.3,D = 1,D- = 0.7,F = 0)。
// GPA = Σ(质量点 × 学分) ÷ Σ学分;无效课程(学分 ≤ 0 / 非有限 / 字母不在表内)整条剔除。

/** 字母等级 → 质量点(4.0 制)。查找前先 trim + 大写,含 A+ 与 D- 两个标准扩展档。 */
export const GPA_POINTS: Record<string, number> = {
  "A+": 4, "A": 4, "A-": 3.7,
  "B+": 3.3, "B": 3, "B-": 2.7,
  "C+": 2.3, "C": 2, "C-": 1.7,
  "D+": 1.3, "D": 1, "D-": 0.7,
  "F": 0,
};

/** GPA 选择器里可点的字母(固定顺序,供引擎下拉使用)。 */
export const GPA_LETTERS = Object.keys(GPA_POINTS);

export type GpaCourse = {
  name?: string;
  credits: number;
  letter: string;
};

export type GpaResult = {
  gpa: number;
  /** 计入学分合计(无效课程不计)。 */
  credits: number;
  /** 质量点合计 Σ(点 × 学分)。 */
  qualityPoints: number;
  /** 被剔除的无效课程条数。 */
  dropped: number;
};

/** 学期 GPA。没有任何有效课程(学分合计为 0)时 gpa 为 NaN,credits 0、qualityPoints 0。 */
export function gpaFromCourses(courses: GpaCourse[]): GpaResult {
  let qp = 0;
  let cr = 0;
  let dropped = 0;
  for (const c of courses) {
    const pts = GPA_POINTS[String(c.letter ?? "").trim().toUpperCase()];
    if (!Number.isFinite(c.credits) || c.credits <= 0 || pts === undefined) {
      dropped++;
      continue;
    }
    qp += pts * c.credits;
    cr += c.credits;
  }
  if (cr <= 0) return { gpa: NaN, credits: 0, qualityPoints: 0, dropped };
  return { gpa: qp / cr, credits: cr, qualityPoints: qp, dropped };
}

/**
 * 学期 GPA 与既往 GPA 的加权混合(累计 GPA):
 * (学期GPA × 学期学分 + 既往GPA × 既往学分) ÷ (学期学分 + 既往学分)。
 * 学期学分必须 > 0;既往两项都有效时才计入混合,否则直接返回学期 GPA
 * (第一学期没有既往记录,累计 = 学期)。任一学期参数非法返回 NaN。
 */
export function blendGpa(semesterGpa: number, semesterCredits: number, priorGpa: number, priorCredits: number): number {
  const sOk =
    Number.isFinite(semesterGpa) && semesterGpa >= 0 &&
    Number.isFinite(semesterCredits) && semesterCredits > 0;
  if (!sOk) return NaN;
  const hasPrior =
    Number.isFinite(priorGpa) && priorGpa >= 0 &&
    Number.isFinite(priorCredits) && priorCredits > 0;
  if (!hasPrior) return semesterGpa;
  return (semesterGpa * semesterCredits + priorGpa * priorCredits) / (semesterCredits + priorCredits);
}
