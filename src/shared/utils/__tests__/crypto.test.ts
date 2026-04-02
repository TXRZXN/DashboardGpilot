import { describe, it, expect } from "vitest";
import { CryptoUtils } from "../crypto";

describe("CryptoUtils", () => {
  const mockKeyHex = "00".repeat(32); // 32-byte key
  const mockPlaintext = "Hello World";

  describe("encrypt", () => {
    it("should encrypt plaintext into a valid base64 string", async () => {
      const encrypted = await CryptoUtils.encrypt(mockPlaintext, mockKeyHex);
      
      expect(typeof encrypted).toBe("string");
      expect(encrypted.length).toBeGreaterThan(0);
      
      // Check if it's base64 (roughly)
      expect(() => atob(encrypted)).not.toThrow();
    });

    it("should produce different ciphertexts for the same plaintext due to random nonce", async () => {
      const encrypted1 = await CryptoUtils.encrypt(mockPlaintext, mockKeyHex);
      const encrypted2 = await CryptoUtils.encrypt(mockPlaintext, mockKeyHex);
      
      expect(encrypted1).not.toBe(encrypted2);
    });

    it("should throw error if key is invalid", async () => {
      const invalidKey = "too-short";
      await expect(CryptoUtils.encrypt(mockPlaintext, invalidKey)).rejects.toThrow("Failed to encrypt data");
    });
  });
});
