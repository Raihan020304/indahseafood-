import { notFound } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { ProdukForm } from "@/components/admin/produk-form";
import { StokPanel } from "@/components/admin/stok-panel";
import type { Produk, RiwayatStok } from "@/types/database";

async function getProdukDetail(id: string) {
  const admin = createSupabaseAdminClient();
  const { data: produk } = await admin
    .from("produk")
    .select("*, kategori(*)")
    .eq("id", id)
    .single();

  const { data: riwayat } = await admin
    .from("riwayat_stok")
    .select("*")
    .eq("produk_id", id)
    .order("created_at", { ascending: false })
    .limit(20);

  return {
    produk: produk as Produk | null,
    riwayat: (riwayat ?? []) as RiwayatStok[],
  };
}

export default async function EditProdukPage({
  params,
}: {
  params: { id: string };
}) {
  const { produk, riwayat } = await getProdukDetail(params.id);
  if (!produk) notFound();

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-2xl font-bold text-ocean-900">{produk.nama}</h1>
      <p className="text-sm text-ocean-500">Kelola detail produk dan stok</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProdukForm produkAwal={produk} />
        </div>
        <div>
          <StokPanel produkId={produk.id} stokSaatIni={produk.stok} riwayatAwal={riwayat} />
        </div>
      </div>
    </div>
  );
}
