import { describe, it, expect } from "vitest";
import { getMostRecentMonday, toISODateString, toFullISOString } from "../date-utils";

describe("date-utils", () => {
  describe("getMostRecentMonday", () => {
    it("should return the same day if it is Monday", () => {
      // 2024-03-25 is Monday
      const monday = new Date("2024-03-25T12:00:00");
      const result = getMostRecentMonday(monday);
      expect(result.getDay()).toBe(1);
      expect(result.getDate()).toBe(25);
      expect(result.getHours()).toBe(0);
    });

    it("should return the previous Monday if it is Sunday", () => {
      // 2024-03-24 is Sunday
      const sunday = new Date("2024-03-24T12:00:00");
      const result = getMostRecentMonday(sunday);
      expect(result.getDay()).toBe(1);
      expect(result.getDate()).toBe(18); // Previous Monday
    });

    it("should return the previous Monday if it is Wednesday", () => {
      // 2024-03-27 is Wednesday
      const wednesday = new Date("2024-03-27T12:00:00");
      const result = getMostRecentMonday(wednesday);
      expect(result.getDay()).toBe(1);
      expect(result.getDate()).toBe(25);
    });
  });

  describe("toISODateString", () => {
    it("should format date correctly as YYYY-MM-DD", () => {
      const date = new Date("2024-03-25T12:00:00Z");
      expect(toISODateString(date)).toBe("2024-03-25");
    });
  });

  describe("toFullISOString", () => {
    it("should return full ISO string", () => {
      const date = new Date("2024-03-25T12:00:00Z");
      expect(toFullISOString(date)).toBe("2024-03-25T12:00:00.000Z");
    });
  });
});
