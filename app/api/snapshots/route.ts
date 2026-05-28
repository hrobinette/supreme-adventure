import { NextRequest, NextResponse } from "next/server";
import { getSupabase, SNAPSHOTS_TABLE } from "@/lib/supabaseServer";
import { Deal } from "@/lib/types";

export const runtime = "nodejs";

function makeId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export async function POST(req: NextRequest) {
  // Only signed-in users can create shared snapshots.
  if (req.cookies.get("ops_session")?.value !== "1") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    // Supabase not configured — tell the client to fall back to local storage.
    return NextResponse.json({ error: "Supabase not configured." }, {
      status: 501,
    });
  }

  let label = "";
  let deals: Deal[] = [];
  try {
    const body = await req.json();
    label = typeof body?.label === "string" ? body.label : "Untitled snapshot";
    deals = Array.isArray(body?.deals) ? body.deals : [];
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, {
      status: 400,
    });
  }

  if (deals.length === 0) {
    return NextResponse.json({ error: "No deals to save." }, { status: 400 });
  }

  const id = makeId();
  const created_at = new Date().toISOString();
  const { error } = await supabase
    .from(SNAPSHOTS_TABLE)
    .insert({ id, created_at, label, deals });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id, created_at, label });
}
