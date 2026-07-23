import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "session";

function expectedToken(password: string) {
  return createHmac("sha256", password).update("authenticated").digest("hex");
}

export function isAuthEnabled() {
  return Boolean(process.env.APP_PASSWORD);
}

export function checkPassword(password: string) {
  return process.env.APP_PASSWORD !== undefined && password === process.env.APP_PASSWORD;
}

export function sessionCookieValue() {
  return expectedToken(process.env.APP_PASSWORD!);
}

export function isValidSessionToken(token: string | undefined) {
  const password = process.env.APP_PASSWORD;
  if (!password || !token) return false;

  const expected = Buffer.from(expectedToken(password));
  const actual = Buffer.from(token);
  if (actual.length !== expected.length) return false;
  return timingSafeEqual(actual, expected);
}
