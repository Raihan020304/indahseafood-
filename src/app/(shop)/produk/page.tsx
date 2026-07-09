import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/shop/product-card";
import type { Produk, Kategori } from "@/types/database";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PackageSearch } from "lucide-react";

export const revalidate = 30;

interface PageProps {
  searchParams: { kategori?: string; q?: string };
}

async function getProdukData(kategoriSlug?: string, query?: string) {
  const supabase = createSupabaseServerClient();

  let request = supabase
    .from("produk")
    .select("*, kategori(*)")
    .eq("is_aktif", true)
    .order("created_at", { ascending: false });

  if (kategoriSlug) {
    const { data: kat } = await supabase
      .from("kategori")
      .select("id")
      .eq("slug", kategoriSlug)
      .single();
    if (kat) {
      request = request.eq("kategori_id", kat.id);
    }
  }

  if (query) {
    request = request.ilike("nama", `%${query}%`);
  }

  const { data } = await request;

  const { data: kategoriList } = await supabase
    .from("kategori")
    .select("*")
    .order("nama");

  return {
    produk: (data ?? []) as Produk[],
    kategoriList: (kategoriList ?? []) as Kategori[],
  };
}

export default async function ProdukPage({ searchParams }: PageProps) {
  const { kategori, q } = searchParams;
  const { produk, kategoriList } = await getProdukData(kategori, q);

  return (
    <div className="container-app py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ocean-900">
          {q ? `Hasil pencarian "${q}"` : "Semua Produk"}
        </h1>
        <p className="mt-1 text-sm text-ocean-500">
          {produk.length} produk ditemukan
        </p>
      </div>

      {/* Filter kategori */}
      <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/produk"
          className={cn(
            "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
            !kategori
              ? "border-ocean-600 bg-ocean-600 text-white"
              : "border-ocean-200 bg-white text-ocean-700 hover:bg-ocean-50"
          )}
        >
          Semua
        </Link>
        {kategoriList.map((k) => (
          <Link
            key={k.id}
            href={`/produk?kategori=${k.slug}`}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
              kategori === k.slug
                ? "border-ocean-600 bg-ocean-600 text-white"
                : "border-ocean-200 bg-white text-ocean-700 hover:bg-ocean-50"
            )}
          >
            {k.nama}
          </Link>
        ))}
      </div>

      {produk.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <PackageSearch className="h-12 w-12 text-ocean-300" />
          <p className="font-medium text-ocean-700">Produk tidak ditemukan</p>
          <p className="text-sm text-ocean-400">
            Coba kata kunci lain atau lihat kategori berbeda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {produk.map((p) => (
            <ProductCard key={p.id} produk={p} />
          ))}
        </div>
      )}
    </div>
  );
}
