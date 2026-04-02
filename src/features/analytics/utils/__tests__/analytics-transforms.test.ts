import { describe, it, expect } from "vitest";
import { computePLDistribution, computeAssetExposure } from "../analytics-transforms";
import type { GroupedDeal } from "@/shared/types/api";

describe("analytics-transforms", () => {
  describe("computePLDistribution", () => {
    it("should return empty array when input is empty", () => {
      expect(computePLDistribution([])).toEqual([]);
    });

    it("should correctly bin profit values", () => {
      const mockDeals: Partial<GroupedDeal>[] = [
        { profit: -600 }, // <-500
        { profit: -450 }, // -500 to -400
        { profit: 50 },   // 0 to 100
        { profit: 550 },  // >500
      ];
      
      const result = computePLDistribution(mockDeals as GroupedDeal[]);
      
      const lt500 = result.find(r => r.range === "<-500");
      const gt500 = result.find(r => r.range === ">500");
      const bin0to100 = result.find(r => r.range === "0 to 100");
      const binM500toM400 = result.find(r => r.range === "-500 to -400");

      expect(lt500?.count).toBe(1);
      expect(gt500?.count).toBe(1);
      expect(bin0to100?.count).toBe(1);
      expect(binM500toM400?.count).toBe(1);
    });
  });

  describe("computeAssetExposure", () => {
    it("should return empty array when input is empty", () => {
      expect(computeAssetExposure([])).toEqual([]);
    });

    it("should correctly calculate exposure and profit per symbol", () => {
      const mockDeals: Partial<GroupedDeal>[] = [
        { symbol: "EURUSD", volume: 1.0, profit: 100 },
        { symbol: "EURUSD", volume: 1.0, profit: -50 },
        { symbol: "GBPUSD", volume: 2.0, profit: 200 },
      ];
      
      const result = computeAssetExposure(mockDeals as GroupedDeal[]);
      
      expect(result).toHaveLength(2);
      
      const eurusd = result.find(r => r.symbol === "EURUSD");
      const gbpusd = result.find(r => r.symbol === "GBPUSD");

      // Total volume = 1 + 1 + 2 = 4
      // EURUSD volume = 2 -> 50%
      // GBPUSD volume = 2 -> 50%
      expect(eurusd?.exposure).toBe(50);
      expect(eurusd?.profit).toBe(50);
      expect(gbpusd?.exposure).toBe(50);
      expect(gbpusd?.profit).toBe(200);
      expect(gbpusd?.direction).toBe("long");
    });

    it("should handle missing symbols as 'Unknown'", () => {
      const mockDeals: Partial<GroupedDeal>[] = [
        { symbol: undefined, volume: 1.0, profit: 100 },
      ];
      const result = computeAssetExposure(mockDeals as GroupedDeal[]);
      expect(result[0].symbol).toBe("Unknown");
    });
    
    it("should sort by exposure descending", () => {
       const mockDeals: Partial<GroupedDeal>[] = [
        { symbol: "A", volume: 1.0, profit: 10 },
        { symbol: "B", volume: 9.0, profit: 10 },
      ];
      const result = computeAssetExposure(mockDeals as GroupedDeal[]);
      expect(result[0].symbol).toBe("B");
      expect(result[1].symbol).toBe("A");
    });
  });
});
