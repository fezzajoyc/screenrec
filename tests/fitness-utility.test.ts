import { describe, expect, it } from "vitest";
import { maxHeartRate, hrZones } from "@/tools/_lib/heart-rate";
import { SHOE_TABLE, shoeConvert } from "@/tools/_lib/shoe-size";
import { formatStopwatch, lapRows } from "@/tools/_lib/stopwatch";
import { overtimePay, rentAffordability, apy, aprFromApy } from "@/tools/_lib/finance";
import { gpaFromCourses, blendGpa } from "@/tools/_lib/grade";

describe("heart-rate zones (Tanaka + Karvonen)", () => {
  it("max HR uses the Tanaka formula 206.9 − 0.67 × age", () => {
    expect(maxHeartRate(30)).toBeCloseTo(206.9 - 0.67 * 30, 6);
    expect(maxHeartRate(60)).toBeCloseTo(206.9 - 0.67 * 60, 6);
  });

  it("zones use Karvonen HRR percentages with resting HR", () => {
    const max = maxHeartRate(30); // 186.8
    const zones = hrZones(max, 60);
    expect(zones.length).toBe(5);
    // 每区:bpm = 静息 + pct × (最大 − 静息)
    for (const z of zones) {
      expect(z.low).toBeCloseTo(60 + (z.pctLow / 100) * (max - 60), 6);
      expect(z.high).toBeCloseTo(60 + (z.pctHigh / 100) * (max - 60), 6);
    }
    // Z1 从 50% 储备开始,Z5 到 100%
    expect(zones[0].pctLow).toBeCloseTo(50, 6);
    expect(zones[4].pctHigh).toBeCloseTo(100, 6);
  });

  it("boundary ages and resting HR ≥ max HR are handled honestly", () => {
    expect(Number.isFinite(maxHeartRate(10))).toBe(true);
    expect(Number.isFinite(maxHeartRate(100))).toBe(true);
    // 静息 ≥ 最大在生理上不可能 → 返回空数组(诚实空态,不造假区间)
    expect(hrZones(maxHeartRate(30), 200)).toEqual([]);
  });
});

describe("shoe size conversion", () => {
  it("table is complete and monotonic in foot length", () => {
    expect(SHOE_TABLE.length).toBeGreaterThanOrEqual(15);
    for (let i = 1; i < SHOE_TABLE.length; i++) {
      expect(SHOE_TABLE[i].cm).toBeGreaterThan(SHOE_TABLE[i - 1].cm);
    }
  });

  it("converts bidirectionally within the table", () => {
    const first = SHOE_TABLE[3];
    const row = shoeConvert(first.eu, "eu", "men");
    expect(row).toBeTruthy();
    expect(row!.cm).toBe(first.cm);
    const back = shoeConvert(row!.usMen, "us", "men");
    expect(back!.cm).toBe(first.cm);
  });

  it("unknown sizes return null", () => {
    expect(shoeConvert(99, "eu", "men")).toBeNull();
    expect(shoeConvert(NaN, "us", "women")).toBeNull();
  });
});

describe("stopwatch lap math", () => {
  it("derives lap splits from cumulative times", () => {
    const rows = lapRows([10, 25, 40]);
    expect(rows.map((r) => r.lap)).toEqual([10, 15, 15]);
    expect(rows.map((r) => r.total)).toEqual([10, 25, 40]);
  });

  it("is robust to empty, single and unsorted input", () => {
    expect(lapRows([])).toEqual([]);
    expect(lapRows([7]).map((r) => r.lap)).toEqual([7]);
    // 无序输入按时间排序处理(秒表累计必然递增,这里宽容)
    expect(lapRows([30, 10, 20]).every((r) => r.lap >= 0)).toBe(true);
  });
});

describe("overtime pay", () => {
  it("computes regular + overtime at the multiplier", () => {
    // overtimePay(rate, otHours, multiplier, regHours/week, weeks/year)
    const r = overtimePay(25, 5, 1.5, 40, 52);
    expect(r.otRate).toBe(37.5);
    expect(r.regularPay).toBe(1000);
    expect(r.overtimePay).toBe(187.5);
    expect(r.totalWeekly).toBe(1187.5);
    expect(r.annual).toBe(1187.5 * 52);
  });

  it("rejects negative or invalid inputs with NaN", () => {
    expect(Number.isNaN(overtimePay(-1, 5, 1.5).otRate)).toBe(true);
    expect(Number.isNaN(overtimePay(25, -5, 1.5).overtimePay)).toBe(true);
    expect(Number.isNaN(overtimePay(NaN, 5, 1.5).totalWeekly)).toBe(true);
  });
});

describe("rent affordability", () => {
  it("applies the ratio to income and reports committed share", () => {
    // 实现:maxRent = income × pct;committed = maxRent + 债务 + 保险;dti = committed/income
    const r = rentAffordability(5000, 30, 300);
    expect(r.maxRent).toBe(1500);
    expect(r.remainingBudget).toBe(3200);
    expect(r.dtiPct).toBeCloseTo(36, 6);
  });

  it("supports arbitrary ratio percentages", () => {
    expect(rentAffordability(5000, 33).maxRent).toBeCloseTo(1650, 6);
    expect(rentAffordability(5000, 40).maxRent).toBe(2000);
  });

  it("debts pushing committed over income still report honestly", () => {
    // 100% 以上负担不崩溃,dti 反映真实比例,负余额可见
    const r = rentAffordability(1000, 30, 2000);
    expect(r.maxRent).toBe(300);
    expect(r.remainingBudget).toBe(-1300);
    expect(r.dtiPct).toBeCloseTo(230, 6);
  });
});

describe("APY ↔ APR", () => {
  it("12% nominal monthly compounding → 12.6825% APY", () => {
    expect(apy(12, "monthly")).toBeCloseTo(12.6825, 3);
  });
  it("roundtrips APR → APY → APR", () => {
    const apr = aprFromApy(12.6825, "monthly");
    expect(apr).toBeCloseTo(12, 2);
  });
  it("annually compounded APY equals the nominal rate", () => {
    expect(apy(5, "annually")).toBeCloseTo(5, 10);
  });
  it("rejects invalid inputs", () => {
    expect(Number.isNaN(apy(-1, "monthly"))).toBe(true);
    expect(Number.isNaN(aprFromApy(NaN, "monthly"))).toBe(true);
  });
});

describe("GPA (4.0 scale)", () => {
  it("computes quality points per credit", () => {
    const r = gpaFromCourses([
      { credits: 3, letter: "A" },
      { credits: 4, letter: "B+" },
    ]);
    expect(r.gpa).toBeCloseTo((12 + 13.2) / 7, 6);
    expect(r.credits).toBe(7);
  });

  it("drops invalid courses and reports the count", () => {
    const r = gpaFromCourses([
      { credits: 3, letter: "A" },
      { credits: -1, letter: "B" },
      { credits: 2, letter: "Z" },
    ]);
    expect(r.gpa).toBe(4);
    expect(r.dropped).toBe(2);
  });

  it("blends cumulative GPA weighted by credits", () => {
    const blended = blendGpa(3.0, 30, 4.0, 10);
    expect(blended).toBeCloseTo((3.0 * 30 + 4.0 * 10) / 40, 10);
  });

  it("no valid courses → NaN", () => {
    expect(Number.isNaN(gpaFromCourses([{ credits: 0, letter: "A" }]).gpa)).toBe(true);
  });
});
