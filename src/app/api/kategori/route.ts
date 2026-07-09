import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/auth/admin-session";
import { slugify } from "@/lib/utils";

export async function GET() {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.from("kategori").select("*").order("nama");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const nama = String(body.nama ?? "").trim();

  if (nama.length < 2) {
    return NextResponse.json({ error: "Nama kategori minimal 2 karakter" }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("kategori")
    .insert({ nama, slug: slugify(nama), icon: body.icon ?? null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
