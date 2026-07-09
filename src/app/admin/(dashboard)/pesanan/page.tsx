"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, Loader2, PackageX } from "lucide-react";
import { formatRupiah, formatTanggalWaktu, cn } from "@/lib/utils";
import { StatusBadge } from "@/components/shop/status-badge";
import type { Pesanan, StatusPesanan } from "@/types/database";

const FILTER_STATUS: { value: StatusPesanan | ""; label: string }[] = [
  { value: "", label: "Semua" },
  { value: "menunggu_pembayaran", label: "Menunggu Bayar" },
  { value: "dibayar", label: "Dibayar" },
  { value: "diproses", label: "Diproses" },
  { value: "dikirim", label: "Dikirim" },
  { value: "selesai", label: "Selesai" },
  { value: "dibatalkan", label: "Dibatalkan" },
];

function AdminPesananContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get("status") ?? "";

  const [pesananList, setPesananList] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchPesanan = useCallback(async (status?: string, q?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q) params.set("q", q);

    const res = await fetch(`/api/admin/pesanan?${params.toString()}`);
    const data = await res.json();
    setPesananList(data.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPesanan(statusFilter, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchPesanan(statusFilter, search);
  }

  function setStatusFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("status", value);
    else params.delete("status");
    router.push(`/admin/pesanan?${params.toString()}`);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-2xl font-bold text-ocean-900">Pesanan</h1>
      <p className="text-sm text-ocean-500">Kelola dan proses pesanan pelanggan</p>

      <form onSubmit={handleSearch} className="mt-6 flex max-w-md items-center gap-2 rounded-full border border-ocean-200 bg-white px-4 py-2">
        <Search className="h-4 w-4 text-ocean-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nomor pesanan / nama..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </form>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {FILTER_STATUS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition",
              statusFilter === f.value
                ? "border-ocean-600 bg-ocean-600 text-white"
                : "border-ocean-200 bg-white text-ocean-700 hover:bg-ocean-50"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl2 border border-ocean-100 bg-white">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-ocean-400" />
          </div>
        ) : pesananList.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <PackageX className="h-10 w-10 text-ocean-300" />
            <p className="text-sm text-ocean-400">Tidak ada pesanan ditemukan.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-ocean-100 bg-ocean-50 text-left text-xs uppercase text-ocean-500">
              <tr>
                <th className="px-4 py-3">No. Pesanan</th>
                <th className="px-4 py-3">Pelanggan</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pesananList.map((p) => (
                <tr key={p.id} className="border-b border-ocean-50 last:border-0 hover:bg-ocean-50/50">
                  <td className="px-4 py-3 font-medium text-ocean-900">{p.nomor_pesanan}</td>
                  <td className="px-4 py-3 text-ocean-600">{p.nama_penerima}</td>
                  <td className="px-4 py-3 text-ocean-500">{formatTanggalWaktu(p.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-ocean-900">{formatRupiah(p.total)}</td>
                  <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/pesanan/${p.id}`} className="font-medium text-ocean-600 hover:text-ocean-800">
                      Kelola
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

export default function AdminPesananPage() {
  return (
    <Suspense fallback={<div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-ocean-400" /></div>}>
      <AdminPesananContent />
    </Suspense>
  );
}
