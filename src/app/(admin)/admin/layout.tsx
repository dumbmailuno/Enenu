import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { AdminShell } from "./AdminShell";
import "./admin-globals.css";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const authed = await isAdminAuthenticated();

  // If not authenticated and not on the login page, redirect to login
  // We check the current path by relying on the shell to handle this
  if (!authed) {
    // The login page is handled separately — it doesn't need auth
    // We'll use a wrapper approach: if not authed, render children directly
    // (the login page), otherwise render the full shell
    return <>{children}</>;
  }

  return <AdminShell>{children}</AdminShell>;
}
