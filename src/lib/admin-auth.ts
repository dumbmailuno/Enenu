import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "jade-admin";
export const ADMIN_MAX_AGE = 60 * 60 * 24; // 24 hours

function secret(): string | null {
  const s = process.env.PRIVATE_SESSION_SECRET;
  return s && s.length >= 16 ? s : null;
}

const mac = (key: string, data: string) =>
  crypto.createHmac("sha256", key).update(`admin:${data}`).digest("base64url");

/** Creates a signed, expiring admin token. Returns null if the session secret is missing. */
export function makeAdminToken(): string | null {
  const key = secret();
  if (!key) return null;
  const exp = String(Math.floor(Date.now() / 1000) + ADMIN_MAX_AGE);
  return `${exp}.${mac(key, exp)}`;
}

/** True only when the request carries a valid, unexpired admin token signed by this server. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const key = secret();
  if (!key) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const [exp, given] = token.split(".");
  if (!exp || !given || !/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000)
    return false;
  const a = Buffer.from(given);
  const b = Buffer.from(mac(key, exp));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Sets the admin cookie on the response. */
export async function setAdminCookie(token: string) {
  (await cookies()).set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_MAX_AGE,
  });
}

/** Clears the admin cookie. */
export async function clearAdminCookie() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/" });
}
