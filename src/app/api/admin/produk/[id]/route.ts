import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/auth/admin-session";

const updateProdukSchema = z.object({
  nama: z.string().min(3).optional(),
  deskripsi: z.string().nullable().optional(),
  kategori_id: z.string().uuid().nullable().optional(),
  harga: z.number().nonnegative().optional(),
  harga_coret: z.number().nonnegative().nullable().optional(),
  satuan: z.string().min(1).optional(),
  berat_gram: z.number().int().nonnegative().nullable().optional(),
  stok_minimum: z.number().int().nonnegative().optional(),
  gambar_url: z.string().nullable().optional(),
  is_aktif: z.boolean().optional(),
  is_unggulan: z.boolean().optional(),
  // Penyesuaian stok dilakukan lewat field terpisah agar tercatat di riwayat
  penyesuaian_stok: z
    .object({
      tipe: z.enum(["masuk", "keluar", "penyesuaian"]),
      jumlah: z.number().int(),
      catatan: z.string().optional(),
    })
    .optional(),
});

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("produk")
    .select("*, kategori(*)")
    .eq("id", params.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  const { data: riwayat } = await admin
    .from("riwayat_stok")
    .select("*")
    .eq("produk_id", params.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return NextResponse.json({ data, riwayat_stok: riwayat ?? [] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = updateProdukSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const admin = createSupabaseAdminClient();

    const { data: produkSaatIni, error: findError } = await admin
      .from("produk")
      .select("stok")
      .eq("id", params.id)
      .single();

    if (findError || !produkSaatIni) {
      return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { ...data };
    delete updateData.penyesuaian_stok;

    // Proses penyesuaian stok jika ada
    if (data.penyesuaian_stok) {
      const { tipe, jumlah, catatan } = data.penyesuaian_stok;
      const stokSebelum = produkSaatIni.stok;
      let stokSesudah = stokSebelum;

      if (tipe === "masuk") {
        stokSesudah = stokSebelum + Math.abs(jumlah);
      } else if (tipe === "keluar") {
        stokSesudah = Math.max(0, stokSebelum - Math.abs(jumlah));
      } else {
        // penyesuaian: set langsung ke nilai jumlah
        stokSesudah = Math.max(0, jumlah);
      }

      updateData.stok = stokSesudah;

      await admin.from("riwayat_stok").insert({
        produk_id: params.id,
        tipe,
        jumlah: stokSesudah - stokSebelum,
        stok_sebelum: stokSebelum,
        stok_sesudah: stokSesudah,
        catatan: catatan ?? null,
        dibuat_oleh: session.email,
      });
    }

    const { data: updated, error } = await admin
      .from("produk")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: error?.message ?? "Gagal memperbarui produk" }, { status: 500 });
    }

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("[admin-produk-update]", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();

  // Soft delete: nonaktifkan saja, supaya histori pesanan lama tidak rusak
  const { error } = await admin
    .from("produk")
    .update({ is_aktif: false })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Produk dinonaktifkan" });
}
