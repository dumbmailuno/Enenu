"use client";

import { useActionState } from "react";
import { unlock, type GateState } from "@/app/just-between-us/actions";

export function Gate() {
  const [state, action, pending] = useActionState<GateState, FormData>(unlock, { error: null });
  return (
    <form action={action} className="gate">
      <label className="soft" htmlFor="pw">Type the password.</label>
      <input id="pw" name="password" type="password" autoComplete="off" autoCapitalize="none" spellCheck={false} required maxLength={200} />
      <div className="actions">
        <button type="submit" className="act" disabled={pending}>{pending ? "checking…" : "open"}</button>
      </div>
      <p className="soft err" role="status" aria-live="polite">{state.error ?? " "}</p>
    </form>
  );
}
