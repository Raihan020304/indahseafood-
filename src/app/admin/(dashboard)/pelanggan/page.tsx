"use client";

import { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { formatRupiah, formatTanggal } from "@/lib/utils";

interface Pelanggan {
  id: string;
  email: string;
  nama: string;
  telepon: string;
  created_at: string;
  jumlah_pesanan: number;
  total_belanja: number;
}

export default function AdminPelangganPage() {
  const [list, setList] = useState<Pelanggan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/pelanggan")
      .then((res) => res.json())
      .then((data) => {
        setList(data.data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-2xl font-bold text-ocean-900">Pelanggan</h1>
      <p className="text-sm text-ocean-500">Daftar pelanggan terdaftar dan riwayat belanja mereka</p>

      <div className="mt-6 overflow-x-auto rounded-xl2 border border-ocean-100 bg-white">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-ocean-400" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Users className="h-10 w-10 text-ocean-300" />
            <p className="text-sm text-ocean-400">Belum ada pelanggan terdaftar.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-ocean-100 bg-ocean-50 text-left text-xs uppercase text-ocean-500">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Telepon</th>
                <th className="px-4 py-3">Bergabung</th>
                <th className="px-4 py-3">Jumlah Pesanan</th>
                <th className="px-4 py-3">Total Belanja</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-ocean-50 last:border-0 hover:bg-ocean-50/50">
                  <td className="px-4 py-3 font-medium text-ocean-900">{p.nama}</td>
                  <td className="px-4 py-3 text-ocean-600">{p.email}</td>
                  <td className="px-4 py-3 text-ocean-600">{p.telepon}</td>
                  <td className="px-4 py-3 text-ocean-500">{formatTanggal(p.created_at)}</td>
                  <td className="px-4 py-3 text-ocean-700">{p.jumlah_pesanan}</td>
                  <td className="px-4 py-3 font-semibold text-ocean-900">{formatRupiah(p.total_belanja)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
