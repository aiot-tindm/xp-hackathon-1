import 'src/lib/crypto-polyfill';

// Ensure crypto is available before importing jose
if (typeof globalThis.crypto === 'undefined' && typeof window !== 'undefined' && window.crypto) {
  globalThis.crypto = window.crypto;
}

import { SignJWT, jwtVerify } from 'jose';

// ----------------------------------------------------------------------

type Token = {
  userId?: string;
  iat?: number;
  exp?: number;
};

/**
 * SignJWT
 * https://github.com/panva/jose/blob/main/docs/classes/jwt_sign.SignJWT.md
 */
export async function sign(
  payload: Token,
  secret: string,
  options: { expiresIn: string | number }
): Promise<string> {
  // Ensure crypto is available at runtime
  if (typeof globalThis.crypto === 'undefined') {
    if (typeof window !== 'undefined' && window.crypto) {
      globalThis.crypto = window.crypto;
    } else {
      throw new Error('Web Crypto API is not available');
    }
  }

  const iat = Math.floor(Date.now() / 1000);

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt(iat)
    .setExpirationTime(options.expiresIn)
    .sign(new TextEncoder().encode(secret));
}

/**
 * jwtVerify
 * https://github.com/panva/jose/blob/HEAD/docs/functions/jwt_verify.jwtVerify.md
 */
export async function verify(token: string, secret: string): Promise<Token> {
  // Ensure crypto is available at runtime
  if (typeof globalThis.crypto === 'undefined') {
    if (typeof window !== 'undefined' && window.crypto) {
      globalThis.crypto = window.crypto;
    } else {
      throw new Error('Web Crypto API is not available');
    }
  }

  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));

  return payload;
}
