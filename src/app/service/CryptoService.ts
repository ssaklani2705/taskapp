import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment'; // adjust path

@Injectable({ providedIn: 'root' })
export class CryptoService {
  // Same 8-character key as SECRET_KEY in Java
  private readonly SECRET_KEY: string = environment.secretKey;

  // Java: toHex(byte[])  -> bytes to uppercase hex
  private toHex(wordArray: CryptoJS.lib.WordArray): string {
    return CryptoJS.enc.Hex.stringify(wordArray).toUpperCase();
  }

  // Java: toByte(String) -> hex string to bytes
  private toByte(hexString: string): CryptoJS.lib.WordArray {
    return CryptoJS.enc.Hex.parse(hexString);
  }

  // Java: cipher(String data)
  cipher(data: string): string {
    if (!this.SECRET_KEY || this.SECRET_KEY.length !== 8) {
      throw new Error('Invalid key length - 8 bytes key needed!');
    }

    const key = CryptoJS.enc.Utf8.parse(this.SECRET_KEY);

    const encrypted = CryptoJS.DES.encrypt(data, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7, // = PKCS5Padding in Java
    });

    return this.toHex(encrypted.ciphertext);
  }

  // Reverse (only if the backend sends encrypted data back)
  decipher(hex: string): string {
    const key = CryptoJS.enc.Utf8.parse(this.SECRET_KEY);

    const decrypted = CryptoJS.DES.decrypt(
      CryptoJS.lib.CipherParams.create({ ciphertext: this.toByte(hex) }),
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );

    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}