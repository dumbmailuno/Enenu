"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { adminClient } from "./supabase";
import {
  makeAdminToken,
  setAdminCookie,
  clearAdminCookie,
} from "./admin-auth";

// ─── Auth Actions ───

export interface LoginState { error: string | null }

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function adminLogin(_prev: LoginState, form: FormData): Promise<LoginState> {
  const pw = String(form.get("password") ?? "");
  if (!pw || pw.length > 200) { await sleep(600); return { error: "Invalid password." }; }

  const token = makeAdminToken();
  if (!token) return { error: "Server not configured (missing session secret)." };

  let hash: string | null = null;
  try {
    const { data } = await adminClient().from("admin_gate").select("password_hash").eq("id", 1).maybeSingle();
    hash = (data as { password_hash?: string } | null)?.password_hash ?? null;
  } catch {
    return { error: "Cannot reach the database." };
  }
  if (!hash) return { error: "Admin password not set. Run: npm run set-admin-password" };

  const ok = await bcrypt.compare(pw, hash);
  if (!ok) { await sleep(900); return { error: "Wrong password. Try again." }; }

  await setAdminCookie(token);
  redirect("/admin/dashboard");
}

export async function adminLogout() {
  await clearAdminCookie();
  redirect("/admin/login");
}

// ─── Generic CRUD Actions ───

export async function getTableRows<T = Record<string, unknown>>(table: string): Promise<T[]> {
  const { data, error } = await adminClient()
    .from(table)
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as T[];
}

export async function getTableStats(table: string): Promise<{ total: number; published: number }> {
  const { data } = await adminClient().from(table).select("id, published");
  if (!data) return { total: 0, published: 0 };
  return {
    total: data.length,
    published: data.filter((r: Record<string, unknown>) => r.published !== false).length,
  };
}

export async function getSingletonRow<T = Record<string, unknown>>(table: string, id: number = 1): Promise<T | null> {
  const { data, error } = await adminClient().from(table).select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data ?? null) as T | null;
}

export async function upsertRow<T extends object>(table: string, row: T) {
  const { error } = await adminClient().from(table).upsert(row as Record<string, unknown>);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function insertRow<T extends object>(table: string, row: T) {
  const { error } = await adminClient().from(table).insert(row as Record<string, unknown>);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateRow<T extends object>(table: string, id: string, updates: T) {
  const { error } = await adminClient().from(table).update(updates as Record<string, unknown>).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteRow(table: string, id: string) {
  const { error } = await adminClient().from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function togglePublished(table: string, id: string, published: boolean) {
  return updateRow(table, id, { published });
}

export async function updateSortOrder(table: string, id: string, sort_order: number) {
  return updateRow(table, id, { sort_order });
}
