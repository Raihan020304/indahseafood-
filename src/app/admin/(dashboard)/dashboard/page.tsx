"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Loader2,
  PackageCheck,
} from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { IncomeChart } from "@/components/admin/income-chart";
import { formatRupiah } from "@/lib/utils";

interface StatsResponse {
  pemasukan_hari_ini: number;
  pemasukan_bulan_ini: number;
  pengeluaran_bulan_ini: number;
  laba_bulan_ini: number;
  pesanan_menunggu_proses: number;
  pesanan_menunggu_bayar: number;
  total_pesanan: number;
  produk_stok_rendah: { id: string; nama: string; stok: number; stok_minimum: number }[];
  grafik_harian: { tanggal: string; pemasukan: number }[];
  produk_terlaris: { id: string; nama: string; terjual: number }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ocean-400" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-2xl font-bold text-ocean-900">Dashboard</h1>
      <p className="text-sm text-ocean-500">Ringkasan kinerja toko Anda</p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pemasukan Hari Ini"
          value={formatRupiah(stats.pemasukan_hari_ini)}
          icon={TrendingUp}
          colorClass="bg-emerald-100 text-emerald-600"
        />
        <StatCard
          label="Pemasukan Bulan Ini"
          value={formatRupiah(stats.pemasukan_bulan_ini)}
          icon={Wallet}
          colorClass="bg-ocean-100 text-ocean-600"
        />
        <StatCard
          label="Pengeluaran Bulan Ini"
          value={formatRupiah(stats.pengeluaran_bulan_ini)}
          icon={TrendingDown}
          colorClass="bg-coral-100 text-coral-600"
        />
        <StatCard
          label="Estimasi Laba Bulan Ini"
          value={formatRupiah(stats.laba_bulan_ini)}
          icon={PackageCheck}
          colorClass={
            stats.laba_bulan_ini >= 0
              ? "bg-emerald-100 text-emerald-600"
              : "bg-coral-100 text-coral-600"
          }
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-ocean-900">Tren Pemasukan 7 Hari Terakhir</h2>
          <div className="mt-4">
            <IncomeChart data={stats.grafik_harian} />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-ocean-900">Perlu Perhatian</h2>
          <div className="mt-4 space-y-3">
            <Link
              href="/admin/pesanan?status=dibayar"
              className="flex items-center justify-between rounded-lg bg-blue-50 p-3 text-sm"
            >
              <span className="flex items-center gap-2 text-blue-700">
                <ShoppingBag className="h-4 w-4" /> Pesanan perlu diproses
              </span>
              <span className="font-bold text-blue-700">{stats.pesanan_menunggu_proses}</span>
            </Link>
            <Link
              href="/admin/pesanan?status=menunggu_pembayaran"
              className="flex items-center justify-between rounded-lg bg-amber-50 p-3 text-sm"
            >
              <span className="flex items-center gap-2 text-amber-700">
                <ShoppingBag className="h-4 w-4" /> Menunggu pembayaran
              </span>
              <span className="font-bold text-amber-700">{stats.pesanan_menunggu_bayar}</span>
            </Link>
            <Link
              href="/admin/produk"
              className="flex items-center justify-between rounded-lg bg-coral-50 p-3 text-sm"
            >
              <span className="flex items-center gap-2 text-coral-700">
                <AlertTriangle className="h-4 w-4" /> Stok menipis
              </span>
              <span className="font-bold text-coral-700">{stats.produk_stok_rendah.length}</span>
            </Link>
          </div>

          {stats.produk_stok_rendah.length > 0 && (
            <div className="mt-4 border-t border-ocean-100 pt-3">
              <p className="text-xs font-medium text-ocean-500">Produk stok menipis:</p>
              <ul className="mt-2 space-y-1.5">
                {stats.produk_stok_rendah.slice(0, 5).map((p) => (
                  <li key={p.id} className="flex justify-between text-xs text-ocean-700">
                    <span className="line-clamp-1">{p.nama}</span>
                    <span className="font-semibold text-coral-600">{p.stok} tersisa</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 card p-5">
        <h2 className="font-semibold text-ocean-900">Produk Terlaris</h2>
        <div className="mt-4 space-y-2">
          {stats.produk_terlaris.map((p, idx) => (
            <div key={p.id} className="flex items-center justify-between border-b border-ocean-50 py-2 text-sm last:border-0">
              <span className="flex items-center gap-3 text-ocean-700">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ocean-100 text-xs font-bold text-ocean-600">
                  {idx + 1}
                </span>
                {p.nama}
              </span>
              <span className="font-semibold text-ocean-900">{p.terjual} terjual</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
