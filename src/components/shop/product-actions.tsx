"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/cart-store";
import type { Produk } from "@/types/database";

export function ProductActions({ produk }: { produk: Produk }) {
  const [jumlah, setJumlah] = useState(1);
  const tambahItem = useCartStore((s) => s.tambahItem);
  const router = useRouter();
  const habis = produk.stok <= 0;

  function ubahJumlah(delta: number) {
    setJumlah((j) => Math.min(Math.max(1, j + delta), produk.stok));
  }

  function tambahKeKeranjang() {
    if (habis) return;
    tambahItem({
      produk_id: produk.id,
      nama: produk.nama,
      slug: produk.slug,
      harga: produk.harga,
      gambar_url: produk.gambar_url,
      jumlah,
      stok: produk.stok,
      satuan: produk.satuan,
    });
    toast.success(`${jumlah}x ${produk.nama} ditambahkan ke keranjang`);
  }

  function belisekarang() {
    tambahKeKeranjang();
    router.push("/keranjang");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-ocean-700">Jumlah</span>
        <div className="flex items-center rounded-full border border-ocean-200">
          <button
            onClick={() => ubahJumlah(-1)}
            disabled={habis}
            className="flex h-10 w-10 items-center justify-center text-ocean-600 disabled:opacity-40"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{jumlah}</span>
          <button
            onClick={() => ubahJumlah(1)}
            disabled={habis}
            className="flex h-10 w-10 items-center justify-center text-ocean-600 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-xs text-ocean-400">Stok: {produk.stok}</span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={tambahKeKeranjang}
          disabled={habis}
          className="btn-secondary flex-1"
        >
          <ShoppingCart className="h-4 w-4" /> Tambah Keranjang
        </button>
        <button onClick={belisekarang} disabled={habis} className="btn-coral flex-1">
          <Zap className="h-4 w-4" /> Beli Sekarang
        </button>
      </div>
    </div>
  );
}
