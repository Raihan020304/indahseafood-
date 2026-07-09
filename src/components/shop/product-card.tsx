"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, Snowflake } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";
import type { Produk } from "@/types/database";

export function ProductCard({ produk }: { produk: Produk }) {
  const tambahItem = useCartStore((s) => s.tambahItem);
  const habis = produk.stok <= 0;

  function handleTambahKeranjang(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (habis) return;

    tambahItem({
      produk_id: produk.id,
      nama: produk.nama,
      slug: produk.slug,
      harga: produk.harga,
      gambar_url: produk.gambar_url,
      jumlah: 1,
      stok: produk.stok,
      satuan: produk.satuan,
    });
    toast.success(`${produk.nama} ditambahkan ke keranjang`);
  }

  const diskonPersen =
    produk.harga_coret && produk.harga_coret > produk.harga
      ? Math.round(((produk.harga_coret - produk.harga) / produk.harga_coret) * 100)
      : null;

  return (
    <Link href={`/produk/${produk.slug}`} className="card group flex flex-col overflow-hidden">
      <div className="relative aspect-square overflow-hidden bg-ocean-50">
        {produk.gambar_url ? (
          <Image
            src={produk.gambar_url}
            alt={produk.nama}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ocean-200">
            <Snowflake className="h-12 w-12" />
          </div>
        )}

        {diskonPersen && (
          <span className="absolute left-2 top-2 rounded-full bg-coral-500 px-2 py-0.5 text-[11px] font-bold text-white">
            -{diskonPersen}%
          </span>
        )}

        {habis && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <span className="rounded-full bg-ocean-900 px-3 py-1 text-xs font-semibold text-white">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-ocean-900">
          {produk.nama}
        </h3>
        <p className="text-xs text-ocean-400">
          {produk.berat_gram ? `${produk.berat_gram}gr / ${produk.satuan}` : produk.satuan}
        </p>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            {produk.harga_coret && (
              <p className="text-xs text-ocean-300 line-through">
                {formatRupiah(produk.harga_coret)}
              </p>
            )}
            <p className="font-display font-bold text-ocean-900">
              {formatRupiah(produk.harga)}
            </p>
          </div>

          <button
            onClick={handleTambahKeranjang}
            disabled={habis}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full bg-ocean-600 text-white transition hover:bg-ocean-700",
              habis && "cursor-not-allowed bg-ocean-200"
            )}
            aria-label="Tambah ke keranjang"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Link>
  );
}
