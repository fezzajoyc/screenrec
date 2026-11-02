/**
 * 复利计算纯逻辑(从 calc-engine-compound 抽出,引擎只做 UI)。
 * 语义:期初计入当期投入(annuity-due),再计息:
 *   FV ← (FV + contribution_per_period) × (1 + r),r = annual / periods_per_year
 */

export type Freq = "monthly" | "quarterly" | "annually";

export const PERIODS_PER_YEAR: Record<Freq, number> = { monthly: 12, quarterly: 4, annually: 1 };

export type ScheduleRow = { year: number; contrib: number; interest: number; balance: number };

export type CompoundResult = {
  total: number;
  contributed: number;
  schedule: ScheduleRow[];
};

export function compound(
  principal: number,
  monthlyContribution: number,
  annualRatePct: number,
  years: number,
  freq: Freq,
): CompoundResult {
  const valid =
    Number.isFinite(principal) && principal >= 0 &&
    Number.isFinite(monthlyContribution) && monthlyContribution >= 0 &&
    Number.isFinite(annualRatePct) && annualRatePct >= 0 &&
    Number.isFinite(years) && years > 0 && years <= 100;
  if (!valid) return { total: NaN, contributed: NaN, schedule: [] };

  const ppy = PERIODS_PER_YEAR[freq];
  const r = annualRatePct / 100 / ppy;
  const perPeriod = monthlyContribution * (12 / ppy);
  const n = Math.round(years * ppy);

  let fv = principal;
  const rows: ScheduleRow[] = [];
  for (let k = 1; k <= n; k++) {
    fv = (fv + perPeriod) * (1 + r);
    const isYearEnd = k % ppy === 0;
    if (isYearEnd || k === n) {
      const deposited = principal + monthlyContribution * (k * (12 / ppy));
      rows.push({
        year: Math.ceil(k / ppy),
        contrib: deposited,
        interest: fv - deposited,
        balance: fv,
      });
    }
  }
  const totalContrib = principal + monthlyContribution * n * (12 / ppy);
  return { total: fv, contributed: totalContrib, schedule: rows };
}

// ─────────────────────────── 抵押贷款(Mortgage) ───────────────────────────
// 标准摊销公式:M = L·r·(1+r)ⁿ / ((1+r)ⁿ − 1),r = 年利率/1200,n = 月数。
// r = 0 时退化为 M = L / n。非法输入返回 NaN(与 compound 的约定一致)。

export type MortgageRow = { year: number; principal: number; interest: number; balance: number };

export type MortgageResult = {
  monthlyPI: number;
  totalInterest: number;
  totalPaid: number;
  schedule: MortgageRow[];
};

/** 每月本息还款额(P&I)。参数非法(负数/NaN/Inf/年限越界)时返回 NaN。 */
export function mortgagePayment(loanAmount: number, annualRatePct: number, years: number): number {
  const valid =
    Number.isFinite(loanAmount) && loanAmount > 0 &&
    Number.isFinite(annualRatePct) && annualRatePct >= 0 &&
    Number.isFinite(years) && years > 0 && years <= 100;
  if (!valid) return NaN;
  const n = Math.round(years * 12);
  if (n < 1) return NaN;
  const r = annualRatePct / 1200;
  if (r === 0) return loanAmount / n;
  const f = Math.pow(1 + r, n);
  return (loanAmount * r * f) / (f - 1);
}

/** 完整抵押贷款结果:月供、总利息与按年汇总的摊销表(模拟逐月复算,期末余额归零)。 */
export function mortgage(loanAmount: number, annualRatePct: number, years: number): MortgageResult {
  const monthlyPI = mortgagePayment(loanAmount, annualRatePct, years);
  if (!Number.isFinite(monthlyPI)) {
    return { monthlyPI: NaN, totalInterest: NaN, totalPaid: NaN, schedule: [] };
  }
  const n = Math.round(years * 12);
  const r = annualRatePct / 1200;
  let bal = loanAmount;
  let yPrin = 0;
  let yInt = 0;
  let sumInt = 0;
  const rows: MortgageRow[] = [];
  for (let m = 1; m <= n; m++) {
    const interest = bal * r;
    let prin = monthlyPI - interest;
    if (prin > bal) prin = bal;
    bal -= prin;
    yPrin += prin;
    yInt += interest;
    sumInt += interest;
    if (m % 12 === 0 || m === n) {
      rows.push({ year: Math.ceil(m / 12), principal: yPrin, interest: yInt, balance: Math.max(bal, 0) });
      yPrin = 0;
      yInt = 0;
    }
  }
  return { monthlyPI, totalInterest: sumInt, totalPaid: loanAmount + sumInt, schedule: rows };
}

// ─────────────────────────── 年薪 ↔ 时薪(Salary) ───────────────────────────
// 基准:hourly = 年薪 ÷ (每周小时 × 每年周数);日薪按每周 5 个工作日。
// 无薪休假按天扣减工作周:有效周数 = 周数 − 天数/5;"调整后时薪" 是把同一年薪
// 摊到实际工作小时上的时薪(休假越多越高;天数为 0 时与基准时薪相等)。

export type SalaryBreakdown = {
  hourly: number;
  daily: number;
  weekly: number;
  biweekly: number;
  monthly: number;
  effectiveWeeks: number;
  adjustedHourly: number;
};

const SALARY_NAN: SalaryBreakdown = {
  hourly: NaN, daily: NaN, weekly: NaN, biweekly: NaN, monthly: NaN, effectiveWeeks: NaN, adjustedHourly: NaN,
};

/**
 * 年薪拆解。annual > 0;hoursPerWeek ∈ (0, 168];weeksPerYear ∈ (0, 52];
 * unpaidDaysOff ≥ 0 且有效周数 > 0,否则所有字段为 NaN。
 */
export function salaryBreakdown(
  annual: number,
  hoursPerWeek: number,
  weeksPerYear: number,
  unpaidDaysOff = 0,
): SalaryBreakdown {
  const valid =
    Number.isFinite(annual) && annual > 0 &&
    Number.isFinite(hoursPerWeek) && hoursPerWeek > 0 && hoursPerWeek <= 168 &&
    Number.isFinite(weeksPerYear) && weeksPerYear > 0 && weeksPerYear <= 52 &&
    Number.isFinite(unpaidDaysOff) && unpaidDaysOff >= 0;
  if (!valid) return SALARY_NAN;
  const effectiveWeeks = weeksPerYear - unpaidDaysOff / 5;
  if (!(effectiveWeeks > 0)) return SALARY_NAN;
  const hourly = annual / (hoursPerWeek * weeksPerYear);
  return {
    hourly,
    daily: (hourly * hoursPerWeek) / 5,
    weekly: annual / weeksPerYear,
    biweekly: (annual / weeksPerYear) * 2,
    monthly: annual / 12,
    effectiveWeeks,
    adjustedHourly: annual / (hoursPerWeek * effectiveWeeks),
  };
}

export type HourlyBreakdown = {
  daily: number;
  weekly: number;
  biweekly: number;
  monthly: number;
  annual: number;
};

const HOURLY_NAN: HourlyBreakdown = { daily: NaN, weekly: NaN, biweekly: NaN, monthly: NaN, annual: NaN };

/** 时薪折算年薪。hourlyRate ≥ 0;hoursPerWeek ∈ (0, 168];weeksPerYear ∈ (0, 52]。 */
export function hourlyToSalary(hourlyRate: number, hoursPerWeek: number, weeksPerYear: number): HourlyBreakdown {
  const valid =
    Number.isFinite(hourlyRate) && hourlyRate >= 0 &&
    Number.isFinite(hoursPerWeek) && hoursPerWeek > 0 && hoursPerWeek <= 168 &&
    Number.isFinite(weeksPerYear) && weeksPerYear > 0 && weeksPerYear <= 52;
  if (!valid) return HOURLY_NAN;
  const annual = hourlyRate * hoursPerWeek * weeksPerYear;
  const weekly = annual / weeksPerYear;
  return {
    daily: (hourlyRate * hoursPerWeek) / 5,
    weekly,
    biweekly: weekly * 2,
    monthly: annual / 12,
    annual,
  };
}

// ─────────────────────────── 盈亏平衡(Break-even) ───────────────────────────
// 边际贡献 = 单价 − 单位变动成本;BE 单位 = 固定成本 ÷ 边际贡献。
// 边际贡献 ≤ 0 时永远无法回本,返回 NaN(诚实表达"无解",而不是 0)。

export type BreakEvenPoint = { scale: number; units: number; revenue: number; profit: number };

export type BreakEvenResult = {
  units: number;
  revenue: number;
  contributionMargin: number;
  marginPct: number;
  points: BreakEvenPoint[];
};

const BREAKEVEN_NAN: BreakEvenResult = { units: NaN, revenue: NaN, contributionMargin: NaN, marginPct: NaN, points: [] };

/** 固定成本 ≥ 0;单价 > 0;单位变动成本 ≥ 0 且 < 单价,否则全部 NaN、points 为空。 */
export function breakEven(fixedCosts: number, pricePerUnit: number, variableCostPerUnit: number): BreakEvenResult {
  const valid =
    Number.isFinite(fixedCosts) && fixedCosts >= 0 &&
    Number.isFinite(pricePerUnit) && pricePerUnit > 0 &&
    Number.isFinite(variableCostPerUnit) && variableCostPerUnit >= 0;
  const margin = pricePerUnit - variableCostPerUnit;
  if (!valid || !(margin > 0)) return BREAKEVEN_NAN;
  const units = fixedCosts / margin;
  const point = (scale: number): BreakEvenPoint => {
    const u = scale * units;
    return { scale, units: u, revenue: u * pricePerUnit, profit: u * margin - fixedCosts };
  };
  return {
    units,
    revenue: units * pricePerUnit,
    contributionMargin: margin,
    marginPct: (margin / pricePerUnit) * 100,
    points: [point(0.5), point(1), point(1.5), point(2)],
  };
}

// ─────────────────────────── 加班费(Overtime pay) ───────────────────────────
// FLSA 口径:非豁免员工每周超过 40 小时的部分按 1.5 倍时薪计(个别雇主节日按 2 倍)。
// regularPay = rate × regularHours;overtimePay = rate × multiplier × overtimeHours;
// totalWeekly = 两者之和;annual = totalWeekly × weeksPerYear(周数上限 52,与 salaryBreakdown 一致)。
// 薪水制入参先经 salaryBreakdown() 折成时薪再进本函数。

export type OvertimeResult = {
  otRate: number;
  regularPay: number;
  overtimePay: number;
  totalWeekly: number;
  annual: number;
};

const OVERTIME_NAN: OvertimeResult = { otRate: NaN, regularPay: NaN, overtimePay: NaN, totalWeekly: NaN, annual: NaN };

/**
 * 加班费拆解。hourlyRate ≥ 0;overtimeHours ≥ 0;multiplier > 0;
 * regularHoursPerWeek ∈ [0, 168](0 = 没有常规工时,全部按加班计);
 * weeksPerYear ∈ (0, 52]。任一参数非法时所有字段为 NaN。
 */
export function overtimePay(
  hourlyRate: number,
  overtimeHours: number,
  multiplier = 1.5,
  regularHoursPerWeek = 40,
  weeksPerYear = 52,
): OvertimeResult {
  const valid =
    Number.isFinite(hourlyRate) && hourlyRate >= 0 &&
    Number.isFinite(overtimeHours) && overtimeHours >= 0 &&
    Number.isFinite(multiplier) && multiplier > 0 &&
    Number.isFinite(regularHoursPerWeek) && regularHoursPerWeek >= 0 && regularHoursPerWeek <= 168 &&
    Number.isFinite(weeksPerYear) && weeksPerYear > 0 && weeksPerYear <= 52;
  if (!valid) return OVERTIME_NAN;
  const otRate = hourlyRate * multiplier;
  const regularPay = hourlyRate * regularHoursPerWeek;
  const otPay = otRate * overtimeHours;
  const totalWeekly = regularPay + otPay;
  return { otRate, regularPay, overtimePay: otPay, totalWeekly, annual: totalWeekly * weeksPerYear };
}

// ─────────────────────────── 租房负担能力(Rent affordability) ───────────────────────────
// "30% 规则":房租不超过收入的 30%(HUD 的成本负担标准,源自 1969 年 Brooke 修正案)。
// maxRent 只由收入 × 比例决定(不含债务);remainingBudget = 收入 − maxRent − 其他债务 − 租客保险,
// 可为负(超支,如实显示);dtiPct = (maxRent + 债务 + 保险) ÷ 收入,即顶格租房时的后端债务收入比。

export type RentAffordabilityResult = {
  maxRent: number;
  annualRent: number;
  remainingBudget: number;
  dtiPct: number;
};

const RENT_NAN: RentAffordabilityResult = { maxRent: NaN, annualRent: NaN, remainingBudget: NaN, dtiPct: NaN };

/**
 * 租房负担能力。monthlyIncome > 0;ratioPct ∈ (0, 100](30/33/40 等预设);
 * otherDebtMonthly ≥ 0;renterInsuranceMonthly ≥ 0。任一参数非法时所有字段为 NaN。
 */
export function rentAffordability(
  monthlyIncome: number,
  ratioPct: number,
  otherDebtMonthly = 0,
  renterInsuranceMonthly = 0,
): RentAffordabilityResult {
  const valid =
    Number.isFinite(monthlyIncome) && monthlyIncome > 0 &&
    Number.isFinite(ratioPct) && ratioPct > 0 && ratioPct <= 100 &&
    Number.isFinite(otherDebtMonthly) && otherDebtMonthly >= 0 &&
    Number.isFinite(renterInsuranceMonthly) && renterInsuranceMonthly >= 0;
  if (!valid) return RENT_NAN;
  const maxRent = monthlyIncome * (ratioPct / 100);
  const committed = maxRent + otherDebtMonthly + renterInsuranceMonthly;
  return {
    maxRent,
    annualRent: maxRent * 12,
    remainingBudget: monthlyIncome - committed,
    dtiPct: (committed / monthlyIncome) * 100,
  };
}

// ─────────────────────────── APR ↔ APY(名义利率 ↔ 实际年利率) ───────────────────────────
// APY = (1 + r/n)ⁿ − 1(r = 名义年利率,n = 每年复利期数,daily 按 365 天);
// 反推 APR = n × ((1 + APY)^(1/n) − 1)。同一名义利率下 n > 1 时 APY 严格大于 APR,
// 差额随 n 增大而增大(12% 月复利 → 12.6825%)。负利率超出本工具语义,返回 NaN。

export type CompoundingFreq = "daily" | "monthly" | "quarterly" | "annually";

export const COMPOUNDING_PER_YEAR: Record<CompoundingFreq, number> = {
  daily: 365, monthly: 12, quarterly: 4, annually: 1,
};

/** 名义年利率(%)→ APY(%),按指定复利频率。rate < 0 或非有限或频率未知时返回 NaN。 */
export function apy(nominalRatePct: number, freq: CompoundingFreq): number {
  const n = COMPOUNDING_PER_YEAR[freq];
  if (!Number.isFinite(n) || !Number.isFinite(nominalRatePct) || nominalRatePct < 0) return NaN;
  return (Math.pow(1 + nominalRatePct / 100 / n, n) - 1) * 100;
}

/** APY(%)→ 名义年利率 APR(%),反推复利频率一致。apy < 0 或非有限或频率未知时返回 NaN。 */
export function aprFromApy(apyPct: number, freq: CompoundingFreq): number {
  const n = COMPOUNDING_PER_YEAR[freq];
  if (!Number.isFinite(n) || !Number.isFinite(apyPct) || apyPct < 0) return NaN;
  return (Math.pow(1 + apyPct / 100, 1 / n) - 1) * n * 100;
}

/**
 * 本金按 APY 增长 years 年后的余额:(1 + APY)^years 与 (1 + r/n)^(n·years) 代数恒等,
 * 因此可以直接吃 apy() 的输出。principal ≥ 0;apyPct ≥ 0;years ∈ (0, 100](与 compound 一致)。
 */
export function apyBalance(principal: number, apyPct: number, years: number): number {
  const valid =
    Number.isFinite(principal) && principal >= 0 &&
    Number.isFinite(apyPct) && apyPct >= 0 &&
    Number.isFinite(years) && years > 0 && years <= 100;
  if (!valid) return NaN;
  return principal * Math.pow(1 + apyPct / 100, years);
}
