import { NextRequest, NextResponse } from "next/server";
import { getSupabase, SNAPSHOTS_TABLE } from "@/lib/supabaseServer";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, {
      status: 501,
    });
  }

  const { data, error } = await supabase
    .from(SNAPSHOTS_TABLE)
    .select("id, created_at, label, deals")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  return NextResponse.json(data);
}
