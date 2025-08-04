/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-namespace */
// Crypto polyfill for Node.js and browser environments
// This ensures the Web Crypto API is available in both environments

declare global {
  namespace globalThis {
    var crypto: Crypto;
  }
  interface Window {
    crypto: Crypto;
  }
}

// Ensure crypto is available globally
if (typeof globalThis !== 'undefined' && typeof globalThis.crypto === 'undefined') {
  if (typeof window === 'undefined') {
    // Node.js environment
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { webcrypto } = require('node:crypto');
      globalThis.crypto = webcrypto as Crypto;
    } catch (error) {
      console.warn('WebCrypto API is not available in this Node.js version');
    }
  } else if (typeof window !== 'undefined' && typeof window.crypto !== 'undefined') {
    // Browser environment - ensure crypto is available on globalThis
    globalThis.crypto = window.crypto;
  }
}

// Additional polyfill for browser environments that might not have crypto properly set up
if (typeof window !== 'undefined' && typeof window.crypto !== 'undefined' && !globalThis.crypto) {
  globalThis.crypto = window.crypto;
}

export {};
