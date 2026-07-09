import Image from "next/image";
import { notFound } from "next/navigation";
import { Snowflake, Truck, ShieldCheck } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatRupiah } from "@/lib/utils";
import { ProductActions } from "@/components/shop/product-actions";
import { ProductCard } from "@/components/shop/product-card";
import type { Produk } from "@/types/database";

export const revalidate = 30;

async function getProduk(slug: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("produk")
    .select("*, kategori(*)")
    .eq("slug", slug)
    .eq("is_aktif", true)
    .single();
  return data as Produk | null;
}

async function getProdukTerkait(kategoriId: string | null, excludeId: string) {
  if (!kategoriId) return [];
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("produk")
    .select("*")
    .eq("kategori_id", kategoriId)
    .eq("is_aktif", true)
    .neq("id", excludeId)
    .limit(4);
  return (data ?? []) as Produk[];
}

export default async function DetailProdukPage({
  params,
}: {
  params: { slug: string };
}) {
  const produk = await getProduk(params.slug);
  if (!produk) notFound();

  const terkait = await getProdukTerkait(produk.kategori_id, produk.id);

  return (
    <div className="container-app py-8">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gambar */}
        <div className="aspect-square overflow-hidden rounded-xl2 bg-ocean-50">
          {produk.gambar_url ? (
            <Image
              src={produk.gambar_url}
              alt={produk.nama}
              width={600}
              height={600}
              className="h-full w-full object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-ocean-200">
              <Snowflake className="h-20 w-20" />
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {produk.kategori && (
            <p className="text-sm font-medium text-ocean-500">
              {produk.kategori.nama}
            </p>
          )}
          <h1 className="mt-1 font-display text-2xl font-bold text-ocean-900 sm:text-3xl">
            {produk.nama}
          </h1>

          <div className="mt-4 flex items-baseline gap-3">
            {produk.harga_coret && (
              <span className="text-lg text-ocean-300 line-through">
                {formatRupiah(produk.harga_coret)}
              </span>
            )}
            <span className="font-display text-3xl font-bold text-ocean-900">
              {formatRupiah(produk.harga)}
            </span>
            <span className="text-sm text-ocean-400">/ {produk.satuan}</span>
          </div>

          {produk.berat_gram && (
            <p className="mt-1 text-sm text-ocean-500">Berat: {produk.berat_gram} gram</p>
          )}

          <div className="my-6 h-px bg-ocean-100" />

          <ProductActions produk={produk} />

          <div className="my-6 h-px bg-ocean-100" />

          <div>
            <h2 className="font-semibold text-ocean-900">Deskripsi Produk</h2>
            <p className="mt-2 text-sm leading-relaxed text-ocean-600">
              {produk.deskripsi || "Tidak ada deskripsi untuk produk ini."}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-ocean-50 p-3 text-xs text-ocean-700">
              <Snowflake className="h-4 w-4 shrink-0 text-ocean-500" />
              Dibekukan & dikemas higienis
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-ocean-50 p-3 text-xs text-ocean-700">
              <Truck className="h-4 w-4 shrink-0 text-ocean-500" />
              Pengiriman cold-chain
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-ocean-50 p-3 text-xs text-ocean-700 col-span-2">
              <ShieldCheck className="h-4 w-4 shrink-0 text-ocean-500" />
              100% seafood asli, tanpa pengawet berbahaya
            </div>
          </div>
        </div>
      </div>

      {terkait.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-xl font-bold text-ocean-900">
            Produk Terkait
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {terkait.map((p) => (
              <ProductCard key={p.id} produk={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
