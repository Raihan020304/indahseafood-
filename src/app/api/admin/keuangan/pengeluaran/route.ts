import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/auth/admin-session";

const pengeluaranSchema = z.object({
  tanggal: z.string(),
  kategori: z.enum([
    "bahan_baku",
    "operasional",
    "gaji",
    "transportasi",
    "sewa",
    "listrik_air",
    "marketing",
    "lainnya",
  ]),
  deskripsi: z.string().min(3),
  jumlah: z.number().nonnegative(),
  bukti_url: z.string().nullable().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { searchParams } = new URL(request.url);
  const bulan = searchParams.get("bulan"); // format: YYYY-MM
  const kategori = searchParams.get("kategori");

  let query = admin.from("pengeluaran").select("*").order("tanggal", { ascending: false });

  if (bulan) {
    const [year, month] = bulan.split("-");
    const start = `${year}-${month}-01`;
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const end = `${year}-${month}-${lastDay}`;
    query = query.gte("tanggal", start).lte("tanggal", end);
  }

  if (kategori) {
    query = query.eq("kategori", kategori);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const total = data?.reduce((sum, p) => sum + Number(p.jumlah), 0) ?? 0;

  return NextResponse.json({ data, total });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = pengeluaranSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from("pengeluaran")
      .insert({ ...parsed.data, dicatat_oleh: session.email })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message ?? "Gagal menyimpan pengeluaran" }, { status: 500 });
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[admin-pengeluaran-create]", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
