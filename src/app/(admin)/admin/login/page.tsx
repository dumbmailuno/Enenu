"use client";

import { useActionState } from "react";
import { adminLogin, type LoginState } from "@/lib/admin-actions";
import "../admin-globals.css";

const initialState: LoginState = { error: null };

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(adminLogin, initialState);

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <div className="admin-sidebar-brand-icon">J</div>
          <div>
            <div className="admin-sidebar-brand-text">Jade CMS</div>
            <div className="admin-sidebar-brand-sub">Admin Access</div>
          </div>
        </div>

        <form action={formAction} className="admin-login-form">
          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              name="password"
              type="password"
              className="admin-input"
              placeholder="Enter admin password…"
              autoFocus
              autoComplete="current-password"
              required
            />
          </div>

          <div className="admin-login-error">{state.error ?? ""}</div>

          <button type="submit" className="admin-btn admin-btn-primary" disabled={pending} style={{ width: "100%", justifyContent: "center" }}>
            {pending ? "Checking…" : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 12, color: "var(--a-text-dim)", textAlign: "center" }}>
          First time? Run <code style={{ color: "var(--a-gold)" }}>npm run set-admin-password</code>
        </p>
      </div>
    </div>
  );
}
