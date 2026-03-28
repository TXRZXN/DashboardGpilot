import type { Deal } from "@/shared/types/api";

/**
 * ตรวจสอบว่าเป็นรายการ Profit Sharing หรือไม่ (Global Rules #10)
 */
export const isProfitSharing = (deal: Deal): boolean => {
  return (deal.comment || "").startsWith("-PF");
};

/**
 * คำนวณกำไรรวมของ Deal (Profit + Commission + Swap)
 */
export const getNetProfit = (deal: Deal): number => {
  // ใช้ net_profit จากข้อมูลโดยตรงถ้ามี
  if (deal.net_profit !== undefined && deal.net_profit !== null) return deal.net_profit;
  return (deal.profit || 0) + (deal.commission || 0) + (deal.swap || 0) + (deal.fee || 0);
};

/**
 * กรองเฉพาะรายการเทรด ไม่รวม BALANCE และ Profit Sharing (Global Rules #10)
 */
export const getTradeDeals = (deals: readonly Deal[]): Deal[] => {
  return deals.filter((d) => d.type !== "BALANCE" && !isProfitSharing(d));
};

/**
 * จัดกลุ่มรายการเทรด (IN/OUT) ให้เป็น 1 Trade (Round Turn)
 * เลียนแบบ Logic ในหน้า History เพื่อให้จำนวนเทรดตรงกัน
 */
export const getGroupedTrades = (deals: readonly Deal[]): Deal[] => {
  if (!deals || !Array.isArray(deals)) return [];
  // กรองเฉพาะรายการเทรดที่มี Symbol ชัดเจน (Global Rules #10)
  // รายการที่ไม่มี Symbol หรือเป็น BALANCE จะไม่ถูกนับเป็นการเทรด
  const tradingDeals = deals.filter((d) => 
    d.symbol && 
    d.symbol !== "" && 
    d.type !== "BALANCE" && 
    d.position_id > 0 && 
    !isProfitSharing(d)
  );

  // แยกรายการ BALANCE ออกมาเพื่อใช้ใน Equity Curve (แต่ไม่นับเป็นเทรด)
  const balanceDeals = deals.filter((d) => d.type === "BALANCE" || !d.symbol || d.symbol === "");

  // ใช้ Map ในการ Group ตาม position_id
  const positionMap = new Map<number, Deal[]>();

  tradingDeals.forEach((deal) => {
    // ถ้า position_id เป็น 0 (อาจจะเกิดกับข้อมูลบางประเภท) ให้ใช้ ticket แทนเพื่อให้ไม่พยายามรวมกันมั่วๆ
    const pid = deal.position_id || deal.ticket;
    if (!positionMap.has(pid)) {
      positionMap.set(pid, []);
    }
    positionMap.get(pid)?.push(deal);
  });

  const groupedTrades: Deal[] = [];

  positionMap.forEach((pDeals) => {
    if (pDeals.length === 0) return;

    // เรียงตามเวลา msc (ถ้าไม่มีให้ใช้กาลเวลามิลลิวินาที)
    const sorted = [...pDeals].sort((a, b) => (a.time_msc || 0) - (b.time_msc || 0));
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    // คำนวณยอดรวม (Aggregated Stats)
    let totalProfit = 0;
    let totalCommission = 0;
    let totalSwap = 0;
    let totalFee = 0;
    let totalNetProfit = 0;
    let maxVolume = 0;

    sorted.forEach((d) => {
      totalProfit += d.profit || 0;
      totalCommission += d.commission || 0;
      totalSwap += d.swap || 0;
      totalFee += d.fee || 0;
      totalNetProfit += (d.net_profit !== undefined && d.net_profit !== null) 
        ? d.net_profit 
        : (d.profit || 0) + (d.commission || 0) + (d.swap || 0) + (d.fee || 0);
      
      if (d.volume > maxVolume) maxVolume = d.volume;
    });

    // สร้าง Deal ที่เป็นตัวแทนของ Position นี้
    groupedTrades.push({
      ...first,
      profit: totalProfit,
      commission: totalCommission,
      swap: totalSwap,
      fee: totalFee,
      net_profit: totalNetProfit,
      volume: maxVolume,
      // ใช้ Reason จากไม้ปิดสุดท้าย (เช่น SL, TP)
      reason: last.reason || first.reason || "",
      // เก็บเวลาปิด
      time: last.time,
      time_msc: last.time_msc || first.time_msc || 0,
      // เก็บราคาปิด
      price: last.price,
      // ระบุว่านี่คือไม้ที่ปิดแล้ว (ถ้ามี OUT)
      entry: sorted.some(d => d.entry === "OUT") ? "OUT" : first.entry,
    });
  });

  // รวมรายการ BALANCE กลับเข้าไป
  const result = [...groupedTrades, ...balanceDeals];

  // เรียงลำดับสุดท้ายตามเวลา (จากใหม่ไปเก่า)
  return result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
};

/**
 * คำนวณ Equity Curve โดยเริ่มจากรายการฝากเงินครั้งแรก
 */
export const calculateEquityCurve = (deals: readonly Deal[]) => {
  if (!deals || !Array.isArray(deals)) return [];
  // เรียงลำดับตามเวลา
  const sortedDeals = [...deals].sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
  );

  let currentEquity = 0;
  const curve = sortedDeals.map((deal) => {
    currentEquity += getNetProfit(deal);
    return {
      time: deal.time, // ISO String
      equity: currentEquity,
      ticket: deal.ticket,
    };
  });

  return curve;
};

/**
 * คำนวณ Sharpe Ratio จากทุกเทรด (ไม่ใช่ Daily)
 * สูตร: Average Net Profit / StdDev of Net Profit
 */
export const calculateSharpeRatio = (deals: readonly Deal[]) => {
  const tradeDeals = getGroupedTrades(deals).filter(d => d.symbol); // กรองเฉพาะรายการเทรดจริง
  if (tradeDeals.length < 5) return 0; // ต้องมีจำนวณเทรดพอสมควรเพื่อให้ Sharpe มีความหมาย

  const profits = tradeDeals.map(d => getNetProfit(d));
  const mean = profits.reduce((a, b) => a + b, 0) / profits.length;
  
  // คำนวณ Standard Deviation
  const variance =
    profits.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
    (profits.length - 1);
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  // ปรับจูน Sharpe ให้เหมาะสมกับการเทรด (ปกติ Sharpe 1.0+ คือดี)
  // เนื่องจากเราคำนวณต่อเทรด ไม่ใช่ต่อปี เราอาจจะใส่ Scaling Factor เล็กน้อย 
  // หรือแสดงผลเป็นอัตราส่วนความคุ้มเสี่ยง (Risk-Adjusted Return)
  return mean / stdDev;
};

/**
 * คำนวณ Risk/Reward Ratio
 * สูตร: Average Win / Average Loss
 */
export const calculateRiskRewardRatio = (deals: readonly Deal[]) => {
  const { ratio } = calculateRiskRewardDetails(deals);
  return ratio;
};

/**
 * คำนวณรายละเอียด Risk/Reward Ratio
 * คืนค่า { ratio, avgWin, avgLoss }
 */
export const calculateRiskRewardDetails = (deals: readonly Deal[]) => {
  const tradeDeals = getGroupedTrades(deals).filter(d => d.symbol); // กรองเฉพาะรายการเทรดจริง
  
  // กรองไม้ที่ได้กำไร และไม้ที่ขาดทุน (สุทธิหลังหักค่าธรรมเนียม)
  const winningTrades = tradeDeals.filter(d => getNetProfit(d) > 0);
  const losingTrades = tradeDeals.filter(d => getNetProfit(d) < 0);

  if (winningTrades.length === 0 || losingTrades.length === 0) {
    return { ratio: 0, avgWin: 0, avgLoss: 0 };
  }

  // คำนวณค่าเฉลี่ยของกำไร และค่าเฉลี่ยของขาดทุน (เป็นตัวเลขบวก)
  const avgWin = winningTrades.reduce((sum, d) => sum + getNetProfit(d), 0) / winningTrades.length;
  const avgLoss = Math.abs(losingTrades.reduce((sum, d) => sum + getNetProfit(d), 0) / losingTrades.length);

  // อัตราส่วน Reward : Risk (Risk เป็น 1 เสมอ)
  const ratio = avgLoss === 0 ? 0 : avgWin / avgLoss;
  
  return { ratio, avgWin, avgLoss };
};

/**
 * คำนวณรายละเอียด Profit Factor
 * คืนค่า { profitFactor, grossProfit, grossLoss }
 */
export const calculateProfitFactorDetails = (deals: readonly Deal[]) => {
  const tradeDeals = getGroupedTrades(deals).filter(d => d.symbol); // กรองเฉพาะรายการเทรดจริง
  
  const winningTrades = tradeDeals.filter(d => getNetProfit(d) > 0);
  const losingTrades = tradeDeals.filter(d => getNetProfit(d) < 0);

  const grossProfit = winningTrades.reduce((sum, d) => sum + getNetProfit(d), 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, d) => sum + getNetProfit(d), 0));

  const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? 99.99 : 0) : grossProfit / grossLoss;
  
  return { profitFactor, grossProfit, grossLoss };
};

export const calculateMaxDrawdown = (equityCurve: { equity: number }[]) => {
  if (equityCurve.length === 0) return { percentage: 0, amount: 0 };

  let maxEquity = -Infinity;
  let maxDD = 0;

  equityCurve.forEach((point) => {
    if (point.equity > maxEquity) {
      maxEquity = point.equity;
    }
    const dd = maxEquity - point.equity;
    if (dd > maxDD) {
      maxDD = dd;
    }
  });

  const peakEquity = Math.max(...equityCurve.map((p) => p.equity), 0);
  return {
    percentage: peakEquity === 0 ? 0 : (maxDD / peakEquity) * 100,
    amount: maxDD
  };
};

/**
 * คำนวณ Recovery Factor
 * สูตร: Net Profit / Max Drawdown Amount
 */
export const calculateRecoveryFactor = (deals: readonly Deal[], maxDrawdownAmount: number) => {
  const tradeDeals = getGroupedTrades(deals).filter(d => d.symbol);
  if (tradeDeals.length === 0 || maxDrawdownAmount <= 0) return 0;

  const totalNetProfit = tradeDeals.reduce((sum, d) => sum + getNetProfit(d), 0);
  return totalNetProfit / maxDrawdownAmount;
};

/**
 * คำนวณ Portfolio Health Score (0-100)
 * Weights: Win Rate (40%), Profit Factor (40%), Max Drawdown (20%)
 */
export const calculateHealthScore = (winRate: number, profitFactor: number, maxDrawdown: number) => {
  // 1. Win Rate Score (0-100% -> 0-1.0)
  const wrScore = winRate / 100;

  // 2. Profit Factor Score (Map 0.0-3.0 -> 0.0-1.0, Cap at 3.0)
  const pfScore = Math.min(profitFactor / 3.0, 1.0);

  // 3. Drawdown Score (0-50% -> 1.0-0.0, If DD >= 50% score is 0)
  // พอร์ตที่ DD ต่ำจะได้คะแนนส่วนนี้สูง
  const ddScore = Math.max(0, 1.0 - (maxDrawdown / 50.0));

  const totalScore = (wrScore * 0.4) + (pfScore * 0.4) + (ddScore * 0.2);
  return Math.round(totalScore * 100);
};

/**
 * คำนวณ Win Rate
 */
export const calculateWinRate = (deals: readonly Deal[]) => {
  if (!deals || !Array.isArray(deals)) return 0;
  const tradeDeals = getGroupedTrades(deals).filter(d => d.symbol); // กรองเฉพาะรายการเทรดจริง
  if (tradeDeals.length === 0) return 0;

  const wins = tradeDeals.filter((d) => getNetProfit(d) > 0).length;
  return (wins / tradeDeals.length) * 100;
};

/**
 * จัดกลุ่มข้อมูล P/L Distribution (Histogram)
 */
export const calculatePLDistribution = (deals: readonly Deal[]) => {
  const tradeDeals = getGroupedTrades(deals).filter(d => d.symbol); // กรองเฉพาะรายการเทรดจริง
  if (tradeDeals.length === 0) return [];

  // Define bins (ranges)
  const ranges = [-500, -400, -300, -200, -100, 0, 100, 200, 300, 400, 500];
  const bins: Record<string, number> = {};

  // Initialize bins
  bins["<-500"] = 0;
  for (let i = 0; i < ranges.length - 1; i++) {
    bins[`${ranges[i]} to ${ranges[i + 1]}`] = 0;
  }
  bins[">500"] = 0;

  tradeDeals.forEach((deal) => {
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
  });

  return Object.entries(bins).map(([range, count]) => ({ range, count }));
};

/**
 * คำนวณ Asset Exposure
 */
export const calculateAssetExposure = (deals: readonly Deal[]) => {
  const tradeDeals = getGroupedTrades(deals).filter(d => d.symbol); // กรองเฉพาะรายการเทรดจริง
  const totalVolume = tradeDeals.reduce((sum, d) => sum + d.volume, 0);

  const stats: Record<
    string,
    { volume: number; profit: number; wins: number; trades: number }
  > = {};

  tradeDeals.forEach((deal) => {
    const symbol = deal.symbol || "Unknown";
    if (!stats[symbol]) {
      stats[symbol] = { volume: 0, profit: 0, wins: 0, trades: 0 };
    }
    stats[symbol].volume += deal.volume;
    stats[symbol].profit += deal.profit;
    stats[symbol].trades += 1;
    if (deal.profit > 0) stats[symbol].wins += 1;
  });

  return Object.entries(stats)
    .map(([symbol, data]) => ({
      symbol,
      exposure: totalVolume > 0 ? (data.volume / totalVolume) * 100 : 0,
      profit: data.profit,
      winRate: (data.wins / data.trades) * 100,
      direction: data.profit >= 0 ? "long" : "short", // Simplified for mock
    }))
    .sort((a, b) => b.exposure - a.exposure);
};
