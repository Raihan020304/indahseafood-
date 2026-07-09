import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/auth/admin-session";
import { slugify } from "@/lib/utils";

const produkSchema = z.object({
  nama: z.string().min(3),
  deskripsi: z.string().optional(),
  kategori_id: z.string().uuid().nullable().optional(),
  harga: z.number().nonnegative(),
  harga_coret: z.number().nonnegative().nullable().optional(),
  satuan: z.string().min(1),
  berat_gram: z.number().int().nonnegative().nullable().optional(),
  stok: z.number().int().nonnegative(),
  stok_minimum: z.number().int().nonnegative().optional(),
  gambar_url: z.string().nullable().optional(),
  is_aktif: z.boolean().optional(),
  is_unggulan: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q");

  let query = admin
    .from("produk")
    .select("*, kategori(*)")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("nama", `%${q}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = produkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const admin = createSupabaseAdminClient();

    let slug = slugify(data.nama);
    const { data: existing } = await admin.from("produk").select("id").eq("slug", slug);
    if (existing && existing.length > 0) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const { data: produkBaru, error } = await admin
      .from("produk")
      .insert({
        nama: data.nama,
        slug,
        deskripsi: data.deskripsi ?? null,
        kategori_id: data.kategori_id ?? null,
        harga: data.harga,
        harga_coret: data.harga_coret ?? null,
        satuan: data.satuan,
        berat_gram: data.berat_gram ?? null,
        stok: data.stok,
        stok_minimum: data.stok_minimum ?? 5,
        gambar_url: data.gambar_url ?? null,
        is_aktif: data.is_aktif ?? true,
        is_unggulan: data.is_unggulan ?? false,
      })
      .select()
      .single();

    if (error || !produkBaru) {
      return NextResponse.json({ error: error?.message ?? "Gagal membuat produk" }, { status: 500 });
    }

    // Catat stok awal di riwayat
    if (data.stok > 0) {
      await admin.from("riwayat_stok").insert({
        produk_id: produkBaru.id,
        tipe: "masuk",
        jumlah: data.stok,
        stok_sebelum: 0,
        stok_sesudah: data.stok,
        catatan: "Stok awal saat produk dibuat",
        dibuat_oleh: session.email,
      });
    }

    return NextResponse.json({ data: produkBaru }, { status: 201 });
  } catch (error) {
    console.error("[admin-produk-create]", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
