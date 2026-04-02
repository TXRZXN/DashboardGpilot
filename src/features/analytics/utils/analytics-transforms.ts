import type { GroupedDeal } from "@/shared/types/api";

export interface PLData {
  range: string;
  count: number;
}

export interface AssetData {
  symbol: string;
  exposure: number;
  profit: number;
  direction: string;
}

/**
 * คำนวณ PL Distribution จากรายการเทรด
 * @param grouped รายการเทรดที่กลุ่มมาแล้ว
 * @returns ข้อมูลสำหรับวาดกราฟ Distribution
 */
export function computePLDistribution(grouped: GroupedDeal[]): PLData[] {
  if (grouped.length === 0) return [];
  const ranges = [-500, -400, -300, -200, -100, 0, 100, 200, 300, 400, 500];
  const bins: Record<string, number> = { "<-500": 0, ">500": 0 };
  
  for (let i = 0; i < ranges.length - 1; i++) {
    bins[`${ranges[i]} to ${ranges[i + 1]}`] = 0;
  }
  
  for (const deal of grouped) {
    const p = deal.profit;
    if (p < -500) bins["<-500"]++;
    else if (p >= 500) bins[">500"]++;
    else {
      for (let i = 0; i < ranges.length - 1; i++) {
        if (p >= ranges[i] && p < ranges[i + 1]) {
          bins[`${ranges[i]} to ${ranges[i + 1]}`]++;
          break;
        }
      }
    }
  }
  
  return Object.entries(bins).map(([range, count]) => ({ range, count }));
}

/**
 * คำนวณ Asset Exposure จากรายการเทรด
 * @param grouped รายการเทรดที่กลุ่มมาแล้ว
 * @returns ข้อมูล Exposure แยกตาม Symbol
 */
export function computeAssetExposure(grouped: GroupedDeal[]): AssetData[] {
  const totalVolume = grouped.reduce((s, d) => s + d.volume, 0);
  const stats: Record<string, { volume: number; profit: number; wins: number; trades: number }> = {};
  
  for (const deal of grouped) {
    const sym = deal.symbol || "Unknown";
    if (!stats[sym]) stats[sym] = { volume: 0, profit: 0, wins: 0, trades: 0 };
    stats[sym].volume += deal.volume;
    stats[sym].profit += deal.profit;
    stats[sym].trades += 1;
    if (deal.profit > 0) stats[sym].wins += 1;
  }
  
  return Object.entries(stats)
    .map(([symbol, data]) => ({
      symbol,
      exposure: totalVolume > 0 ? (data.volume / totalVolume) * 100 : 0,
      profit: data.profit,
      direction: data.profit >= 0 ? "long" : "short",
    }))
    .sort((a, b) => b.exposure - a.exposure);
}
