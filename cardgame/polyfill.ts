// polyfill.ts - REQUIRED FOR WALLETCONNECT
// This file MUST be imported FIRST in _layout.tsx

// Polyfill for crypto.getRandomValues
import 'react-native-get-random-values';

// Polyfill for TextEncoder/TextDecoder
// Using a simple polyfill to avoid type issues
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = class TextEncoder {
    encode(str: string) {
      const buf = new ArrayBuffer(str.length);
      const bufView = new Uint8Array(buf);
      for (let i = 0; i < str.length; i++) {
        bufView[i] = str.charCodeAt(i);
      }
      return bufView;
    }
  } as any;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = class TextDecoder {
    decode(arr: Uint8Array) {
      return String.fromCharCode.apply(null, Array.from(arr));
    }
  } as any;
}

// Polyfill for crypto
import { getRandomValues } from 'expo-crypto';

if (typeof global.crypto === 'undefined') {
  global.crypto = {
    getRandomValues,
  } as any;
}

// Polyfill for Buffer
import { Buffer } from 'buffer';
global.Buffer = Buffer;

console.log('✅ Polyfills loaded successfully');