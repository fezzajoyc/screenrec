/**
 * 成人鞋码换算纯逻辑:以内置对照表为准(表驱动,双向精确查找)。
 * 表锚定常见运动品牌(Nike/adidas 系)公布的对照族:
 *   脚长(cm)= 日本码;US 男 = 脚长 − 18;US 女 = US 男 + 1.5;UK = US 男 − 1;
 *   EU 为现实中不规则的阶梯值(0.5 / 1 交替)。品牌间普遍相差 ±半码,见工具 FAQ。
 * 未知码数 / 非有限输入 → null,不抛异常。
 */

export type ShoeGender = "men" | "women";
export type ShoeSystem = "us" | "uk" | "eu" | "jp";

export type ShoeRow = {
  /** 脚长 / 日本码(cm) */
  cm: number;
  /** 美码(男) */
  usMen: number;
  /** 美码(女) */
  usWomen: number;
  /** 英码(UK) */
  uk: number;
  /** 欧码(EU) */
  eu: number;
};

/**
 * 成人鞋码对照表:脚长 22–32 cm,每 0.5 cm 一档,共 21 行。
 * 数值族取自主流品牌公布对照表的一致区间;US 男 9 = 27 cm、US 男 10 = 28 cm。
 */
export const SHOE_TABLE: ShoeRow[] = [
  { cm: 22, usMen: 4, usWomen: 5.5, uk: 3, eu: 36 },
  { cm: 22.5, usMen: 4.5, usWomen: 6, uk: 3.5, eu: 36.5 },
  { cm: 23, usMen: 5, usWomen: 6.5, uk: 4, eu: 37.5 },
  { cm: 23.5, usMen: 5.5, usWomen: 7, uk: 4.5, eu: 38 },
  { cm: 24, usMen: 6, usWomen: 7.5, uk: 5, eu: 38.5 },
  { cm: 24.5, usMen: 6.5, usWomen: 8, uk: 5.5, eu: 39 },
  { cm: 25, usMen: 7, usWomen: 8.5, uk: 6, eu: 40 },
  { cm: 25.5, usMen: 7.5, usWomen: 9, uk: 6.5, eu: 40.5 },
  { cm: 26, usMen: 8, usWomen: 9.5, uk: 7, eu: 41 },
  { cm: 26.5, usMen: 8.5, usWomen: 10, uk: 7.5, eu: 42 },
  { cm: 27, usMen: 9, usWomen: 10.5, uk: 8, eu: 42.5 },
  { cm: 27.5, usMen: 9.5, usWomen: 11, uk: 8.5, eu: 43 },
  { cm: 28, usMen: 10, usWomen: 11.5, uk: 9, eu: 44 },
  { cm: 28.5, usMen: 10.5, usWomen: 12, uk: 9.5, eu: 44.5 },
  { cm: 29, usMen: 11, usWomen: 12.5, uk: 10, eu: 45 },
  { cm: 29.5, usMen: 11.5, usWomen: 13, uk: 10.5, eu: 45.5 },
  { cm: 30, usMen: 12, usWomen: 13.5, uk: 11, eu: 46 },
  { cm: 30.5, usMen: 12.5, usWomen: 14, uk: 11.5, eu: 47 },
  { cm: 31, usMen: 13, usWomen: 14.5, uk: 12, eu: 47.5 },
  { cm: 31.5, usMen: 13.5, usWomen: 15, uk: 12.5, eu: 48 },
  { cm: 32, usMen: 14, usWomen: 15.5, uk: 13, eu: 48.5 },
];

/** 任一系统在该性别下取行的列键:US 分男女,日本码即脚长 cm */
function columnOf(row: ShoeRow, system: ShoeSystem, gender: ShoeGender): number {
  switch (system) {
    case "us":
      return gender === "men" ? row.usMen : row.usWomen;
    case "uk":
      return row.uk;
    case "eu":
      return row.eu;
    case "jp":
      return row.cm;
  }
}

/**
 * 由「系统 + 码数」查出整行(即其余全部系统)。
 * 精确匹配表内档位(0.5 步进;EU 阶梯不规则);未知码数、越界、非有限 → null。
 * 同一行内的往返换算精确一致(纯查表,无浮点换算)。
 */
export function shoeConvert(
  value: number,
  system: ShoeSystem,
  gender: ShoeGender,
): ShoeRow | null {
  if (!Number.isFinite(value)) return null;
  for (const row of SHOE_TABLE) {
    if (columnOf(row, system, gender) === value) return row;
  }
  return null;
}
