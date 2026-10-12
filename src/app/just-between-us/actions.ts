"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { adminClient } from "@/lib/supabase";
import { makeToken, PRIVATE_COOKIE, PRIVATE_MAX_AGE, PRIVATE_PATH } from "@/lib/private";

export interface GateState { error: string | null }

const NOT_READY = "This part is not set up yet.";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Checks the password on the server against the stored hash. Nothing private is sent to the browser unless it matches. */
export async function unlock(_prev: GateState, form: FormData): Promise<GateState> {
  const pw = String(form.get("password") ?? "");
  if (!pw || pw.length > 200) { await sleep(600); return { error: "That is not it. Try again." }; }

  const token = makeToken();
  if (!token) return { error: NOT_READY };

  let hash: string | null = null;
  try {
    const { data } = await adminClient().from("private_gate").select("password_hash").eq("id", 1).maybeSingle();
    hash = (data as { password_hash?: string } | null)?.password_hash ?? null;
  } catch {
    return { error: NOT_READY };
  }
  if (!hash) return { error: NOT_READY };

  const ok = await bcrypt.compare(pw, hash);
  if (!ok) { await sleep(900); return { error: "That is not it. Try again." }; }

  (await cookies()).set(PRIVATE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: PRIVATE_PATH,
    maxAge: PRIVATE_MAX_AGE,
  });
  redirect(PRIVATE_PATH);
}

export async function lock() {
  (await cookies()).delete({ name: PRIVATE_COOKIE, path: PRIVATE_PATH });
  redirect(PRIVATE_PATH);
}
