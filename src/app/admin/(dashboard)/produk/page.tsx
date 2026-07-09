"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Loader2, Snowflake, Pencil, AlertTriangle } from "lucide-react";
import { formatRupiah, cn } from "@/lib/utils";
import type { Produk } from "@/types/database";

export default function AdminProdukPage() {
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProduk = useCallback(async (q?: string) => {
    setLoading(true);
    const url = q ? `/api/admin/produk?q=${encodeURIComponent(q)}` : "/api/admin/produk";
    const res = await fetch(url);
    const data = await res.json();
    setProdukList(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProduk();
  }, [fetchProduk]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchProduk(search);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ocean-900">Produk & Stok</h1>
          <p className="text-sm text-ocean-500">Kelola katalog dan stok barang</p>
        </div>
        <Link href="/admin/produk/baru" className="btn-primary">
          <Plus className="h-4 w-4" /> Tambah Produk
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mt-6 flex max-w-md items-center gap-2 rounded-full border border-ocean-200 bg-white px-4 py-2">
        <Search className="h-4 w-4 text-ocean-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama produk..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl2 border border-ocean-100 bg-white">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-ocean-400" />
          </div>
        ) : produkList.length === 0 ? (
          <p className="py-16 text-center text-sm text-ocean-400">Belum ada produk.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-ocean-100 bg-ocean-50 text-left text-xs uppercase text-ocean-500">
              <tr>
                <th className="px-4 py-3">Produk</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3">Stok</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {produkList.map((p) => (
                <tr key={p.id} className="border-b border-ocean-50 last:border-0 hover:bg-ocean-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-ocean-50">
                        {p.gambar_url ? (
                          <Image src={p.gambar_url} alt={p.nama} width={48} height={48} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-ocean-200">
                            <Snowflake className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="line-clamp-1 font-medium text-ocean-900">{p.nama}</p>
                        <p className="text-xs text-ocean-400">{p.satuan}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ocean-600">{p.kategori?.nama ?? "-"}</td>
                  <td className="px-4 py-3 font-medium text-ocean-900">{formatRupiah(p.harga)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 font-medium",
                        p.stok <= p.stok_minimum ? "text-coral-600" : "text-ocean-700"
                      )}
                    >
                      {p.stok <= p.stok_minimum && <AlertTriangle className="h-3.5 w-3.5" />}
                      {p.stok}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs font-medium",
                        p.is_aktif ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {p.is_aktif ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/produk/${p.id}`}
                      className="inline-flex items-center gap-1 text-ocean-600 hover:text-ocean-800"
                    >
                      <Pencil className="h-4 w-4" /> Kelola
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
