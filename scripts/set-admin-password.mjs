// Sets (or changes) the admin CMS password.
// Run: npm run set-admin-password
import readline from "node:readline";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !secret) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    const write = rl._writeToOutput;
    rl._writeToOutput = (s) => { if (s.includes(question)) write.call(rl, s); };
    rl.question(question, (answer) => { rl.close(); process.stdout.write("\n"); resolve(answer); });
  });
}

const pw = await askHidden("New admin password: ");
const again = await askHidden("Type it again: ");
if (pw.length < 6) { console.error("Use at least 6 characters."); process.exit(1); }
if (pw !== again) { console.error("They did not match."); process.exit(1); }

const hash = await bcrypt.hash(pw, 12);
const db = createClient(url, secret, { auth: { persistSession: false } });
const { error } = await db.from("admin_gate").upsert({ id: 1, password_hash: hash });
if (error) { console.error("Could not save:", error.message); process.exit(1); }
console.log("Admin password saved. You can now log in at /admin/login");
