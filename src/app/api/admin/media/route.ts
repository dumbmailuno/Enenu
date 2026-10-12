import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { adminClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const bucket = url.searchParams.get("bucket") || "jade-media";

  try {
    const { data, error } = await adminClient().storage.from(bucket).list("", {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Recursively list files in subdirectories
    const files: Array<{ name: string; id: string; metadata: Record<string, unknown>; created_at: string }> = [];

    for (const item of data ?? []) {
      if (item.id) {
        // It's a file
        files.push({
          name: item.name,
          id: item.id,
          metadata: (item.metadata as Record<string, unknown>) ?? {},
          created_at: item.created_at ?? "",
        });
      } else {
        // It's a folder — list its contents
        const { data: subFiles } = await adminClient().storage.from(bucket).list(item.name, {
          limit: 100,
          sortBy: { column: "created_at", order: "desc" },
        });
        for (const sub of subFiles ?? []) {
          if (sub.id) {
            files.push({
              name: `${item.name}/${sub.name}`,
              id: sub.id,
              metadata: (sub.metadata as Record<string, unknown>) ?? {},
              created_at: sub.created_at ?? "",
            });
          }
        }
      }
    }

    return NextResponse.json({ files });
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed" }, { status: 500 });
  }
}
