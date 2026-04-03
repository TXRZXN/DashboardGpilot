/**
 * Crypto utility for AES-256-GCM encryption
 * Compatible with Python's cryptography.hazmat.primitives.ciphers.aead.AESGCM
 */
export class CryptoUtils {
  /**
   * Encrypts plaintext using AES-256-GCM
   * @param plaintext Standard string to encrypt
   * @param keyHex 32-byte (64 chars) hex string for AES-256
   * @returns Base64 string of (nonce + ciphertext + tag)
   */
  static async encrypt(plaintext: string, keyHex: string): Promise<string> {
    try {
      // 1. Convert hex key to CryptoKey
      const keyBuffer = Uint8Array.from(
        keyHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
      );
      
      const key = await crypto.subtle.importKey(
        'raw',
        keyBuffer,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );

      // 2. Prepare nonce (IV) - 12 bytes is standard for GCM
      const nonce = crypto.getRandomValues(new Uint8Array(12));
      
      // 3. Encrypt
      const encodedPlaintext = new TextEncoder().encode(plaintext);
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: nonce,
        },
        key,
        encodedPlaintext
      );

      // 4. Combine nonce + ciphertext (which includes the tag in Web Crypto)
      const combined = new Uint8Array(nonce.length + encryptedBuffer.byteLength);
      combined.set(nonce);
      combined.set(new Uint8Array(encryptedBuffer), nonce.length);

      // 5. Convert to Base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      throw new Error('Failed to encrypt data');
    }
  }
}
