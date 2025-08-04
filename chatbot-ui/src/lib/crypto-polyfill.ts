/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-namespace */
// Crypto polyfill for Node.js environment
// This ensures the Web Crypto API is available in both browser and Node.js environments

declare global {
  namespace globalThis {
    var crypto: Crypto;
  }
}

if (typeof globalThis.crypto === 'undefined') {
  if (typeof window === 'undefined') {
    // Node.js environment
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { webcrypto } = require('node:crypto');
      globalThis.crypto = webcrypto as Crypto;
    } catch (error) {
      console.warn('WebCrypto API is not available in this Node.js version');
    }
  }
}

export {};
