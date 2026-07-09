"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Snowflake } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatRupiah } from "@/lib/utils";
import { ONGKIR_FLAT, GRATIS_ONGKIR_MINIMAL } from "@/lib/constants";

export default function KeranjangPage() {
  const { items, updateJumlah, hapusItem, totalHarga } = useCartStore();
  const router = useRouter();

  const subtotal = totalHarga();
  const ongkir = items.length === 0 ? 0 : subtotal >= GRATIS_ONGKIR_MINIMAL ? 0 : ONGKIR_FLAT;
  const total = subtotal + ongkir;

  if (items.length === 0) {
    return (
      <div className="container-app flex flex-col items-center justify-center gap-4 py-24 text-center">
        <ShoppingBag className="h-16 w-16 text-ocean-200" />
        <h1 className="font-display text-xl font-bold text-ocean-900">
          Keranjang Anda masih kosong
        </h1>
        <p className="max-w-sm text-sm text-ocean-500">
          Yuk, mulai belanja seafood segar beku pilihan untuk dapur Anda.
        </p>
        <Link href="/produk" className="btn-primary mt-2">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8">
      <h1 className="font-display text-2xl font-bold text-ocean-900">
        Keranjang Belanja
      </h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.produk_id} className="card flex gap-4 p-4">
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ocean-50">
                {item.gambar_url ? (
                  <Image
                    src={item.gambar_url}
                    alt={item.nama}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-ocean-200">
                    <Snowflake className="h-8 w-8" />
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-2">
                  <Link
                    href={`/produk/${item.slug}`}
                    className="text-sm font-semibold text-ocean-900 hover:text-ocean-700"
                  >
                    {item.nama}
                  </Link>
                  <button
                    onClick={() => hapusItem(item.produk_id)}
                    className="text-ocean-300 hover:text-coral-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center rounded-full border border-ocean-200">
                    <button
                      onClick={() => updateJumlah(item.produk_id, item.jumlah - 1)}
                      className="flex h-8 w-8 items-center justify-center text-ocean-600"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">
                      {item.jumlah}
                    </span>
                    <button
                      onClick={() => updateJumlah(item.produk_id, item.jumlah + 1)}
                      disabled={item.jumlah >= item.stok}
                      className="flex h-8 w-8 items-center justify-center text-ocean-600 disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <span className="font-display font-bold text-ocean-900">
                    {formatRupiah(item.harga * item.jumlah)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ringkasan */}
        <div className="card h-fit p-5">
          <h2 className="font-semibold text-ocean-900">Ringkasan Belanja</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-ocean-600">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ocean-600">
              <span>Ongkos Kirim</span>
              <span>{ongkir === 0 ? "Gratis" : formatRupiah(ongkir)}</span>
            </div>
            {subtotal < GRATIS_ONGKIR_MINIMAL && (
              <p className="text-xs text-coral-600">
                Belanja {formatRupiah(GRATIS_ONGKIR_MINIMAL - subtotal)} lagi untuk gratis ongkir!
              </p>
            )}
          </div>
          <div className="my-4 h-px bg-ocean-100" />
          <div className="flex justify-between font-display text-lg font-bold text-ocean-900">
            <span>Total</span>
            <span>{formatRupiah(total)}</span>
          </div>
          <button
            onClick={() => router.push("/checkout")}
            className="btn-coral mt-5 w-full"
          >
            Lanjut ke Checkout <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
