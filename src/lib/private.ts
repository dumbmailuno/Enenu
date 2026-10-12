import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

export const PRIVATE_COOKIE = "jade-private";
export const PRIVATE_PATH = "/just-between-us";
export const PRIVATE_MAX_AGE = 60 * 60 * 12; // stays unlocked for 12 hours on this device

function secret(): string | null {
  const s = process.env.PRIVATE_SESSION_SECRET;
  return s && s.length >= 16 ? s : null;
}

const mac = (key: string, exp: string) => crypto.createHmac("sha256", key).update(exp).digest("base64url");

/** A signed, expiring token for the "unlocked" cookie. Returns null if PRIVATE_SESSION_SECRET is missing or too short. */
export function makeToken(): string | null {
  const key = secret();
  if (!key) return null;
  const exp = String(Math.floor(Date.now() / 1000) + PRIVATE_MAX_AGE);
  return `${exp}.${mac(key, exp)}`;
}

/** True only when the request carries a valid, unexpired token that this server signed. */
export async function isUnlocked(): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  const token = (await cookies()).get(PRIVATE_COOKIE)?.value;
  if (!token) return false;
  const [exp, given] = token.split(".");
  if (!exp || !given || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(mac(key, exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
