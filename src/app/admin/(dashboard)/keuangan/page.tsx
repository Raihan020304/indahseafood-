"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, TrendingDown, TrendingUp, FileSpreadsheet, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/admin/stat-card";
import { FinanceChart } from "@/components/admin/finance-chart";
import { formatRupiah } from "@/lib/utils";
import { LABEL_KATEGORI_PENGELUARAN, type KategoriPengeluaran } from "@/types/database";

interface KeuanganStats {
  bulan: string;
  total_pemasukan: number;
  total_pengeluaran: number;
  laba: number;
  rekap_kategori: Record<string, number>;
  grafik_harian: { tanggal: string; pemasukan: number; pengeluaran: number }[];
  jumlah_pesanan: number;
  jumlah_pengeluaran: number;
}

function getBulanIni() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function AdminKeuanganPage() {
  const [bulan, setBulan] = useState(getBulanIni());
  const [stats, setStats] = useState<KeuanganStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/keuangan/stats?bulan=${bulan}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, [bulan]);

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch(`/api/admin/keuangan/export?bulan=${bulan}`);
      if (!res.ok) {
        toast.error("Gagal membuat file Excel");
        setExporting(false);
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan-Keuangan-IndahSeafood-${bulan}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Laporan Excel berhasil diunduh");
    } catch {
      toast.error("Terjadi kesalahan saat mengunduh laporan");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ocean-900">Keuangan</h1>
          <p className="text-sm text-ocean-500">Pantau pemasukan, pengeluaran, dan laba</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={bulan}
            onChange={(e) => setBulan(e.target.value)}
            className="input-field !w-auto"
          />
          <button onClick={handleExport} disabled={exporting} className="btn-secondary">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
            Export Excel
          </button>
          <Link href="/admin/keuangan/pengeluaran" className="btn-primary">
            <Plus className="h-4 w-4" /> Catat Pengeluaran
          </Link>
        </div>
      </div>

      {loading || !stats ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-ocean-400" />
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Pemasukan"
              value={formatRupiah(stats.total_pemasukan)}
              icon={TrendingUp}
              trend={`${stats.jumlah_pesanan} pesanan`}
              colorClass="bg-emerald-100 text-emerald-600"
            />
            <StatCard
              label="Total Pengeluaran"
              value={formatRupiah(stats.total_pengeluaran)}
              icon={TrendingDown}
              trend={`${stats.jumlah_pengeluaran} transaksi`}
              colorClass="bg-coral-100 text-coral-600"
            />
            <StatCard
              label="Laba / Rugi"
              value={formatRupiah(stats.laba)}
              icon={Wallet}
              colorClass={stats.laba >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-coral-100 text-coral-600"}
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="card p-5 lg:col-span-2">
              <h2 className="font-semibold text-ocean-900">Pemasukan vs Pengeluaran Harian</h2>
              <div className="mt-4">
                <FinanceChart data={stats.grafik_harian} />
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-semibold text-ocean-900">Pengeluaran per Kategori</h2>
              <div className="mt-4 space-y-3">
                {Object.keys(stats.rekap_kategori).length === 0 ? (
                  <p className="text-sm text-ocean-400">Belum ada pengeluaran bulan ini.</p>
                ) : (
                  Object.entries(stats.rekap_kategori)
                    .sort((a, b) => b[1] - a[1])
                    .map(([kategori, jumlah]) => (
                      <div key={kategori} className="flex items-center justify-between text-sm">
                        <span className="text-ocean-600">
                          {LABEL_KATEGORI_PENGELUARAN[kategori as KategoriPengeluaran] ?? kategori}
                        </span>
                        <span className="font-semibold text-ocean-900">{formatRupiah(jumlah)}</span>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
