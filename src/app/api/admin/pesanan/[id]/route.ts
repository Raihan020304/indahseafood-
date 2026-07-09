import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/auth/admin-session";

const updateSchema = z.object({
  status: z
    .enum(["diproses", "dikirim", "selesai", "dibatalkan"])
    .optional(),
  resi_pengiriman: z.string().optional(),
  kurir: z.string().optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("pesanan")
    .select("*, items:item_pesanan(*)")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdminClient();
    const updateData: Record<string, unknown> = { ...parsed.data };

    if (parsed.data.status === "dikirim") {
      updateData.dikirim_at = new Date().toISOString();
    }
    if (parsed.data.status === "selesai") {
      updateData.selesai_at = new Date().toISOString();
    }

    const { data, error } = await admin
      .from("pesanan")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Gagal memperbarui pesanan" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("[admin-pesanan-update]", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
