"use client";

import { useEffect, useState, useCallback } from "react";
import { Loader2, Trash2, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah, formatTanggal } from "@/lib/utils";
import { LABEL_KATEGORI_PENGELUARAN, type KategoriPengeluaran, type Pengeluaran } from "@/types/database";

const KATEGORI_OPTIONS: KategoriPengeluaran[] = [
  "bahan_baku",
  "operasional",
  "gaji",
  "transportasi",
  "sewa",
  "listrik_air",
  "marketing",
  "lainnya",
];

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function PengeluaranPage() {
  const [list, setList] = useState<Pengeluaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);

  const [form, setForm] = useState({
    tanggal: todayStr(),
    kategori: "bahan_baku" as KategoriPengeluaran,
    deskripsi: "",
    jumlah: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/keuangan/pengeluaran");
    const data = await res.json();
    setList(data.data ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.deskripsi.trim().length < 3) {
      toast.error("Deskripsi minimal 3 karakter");
      return;
    }
    if (form.jumlah <= 0) {
      toast.error("Jumlah harus lebih dari 0");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/keuangan/pengeluaran", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Gagal menyimpan pengeluaran");
        setSaving(false);
        return;
      }

      toast.success("Pengeluaran berhasil dicatat");
      setForm({ tanggal: todayStr(), kategori: "bahan_baku", deskripsi: "", jumlah: 0 });
      fetchData();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus catatan pengeluaran ini?")) return;
    const res = await fetch(`/api/admin/keuangan/pengeluaran/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Pengeluaran dihapus");
      fetchData();
    } else {
      toast.error("Gagal menghapus pengeluaran");
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-2xl font-bold text-ocean-900">Catatan Pengeluaran</h1>
      <p className="text-sm text-ocean-500">Catat semua pengeluaran operasional toko</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Form input */}
        <form onSubmit={handleSubmit} className="card space-y-4 p-5">
          <h2 className="font-semibold text-ocean-900">Tambah Pengeluaran</h2>

          <div>
            <label className="text-sm font-medium text-ocean-700">Tanggal</label>
            <input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
              className="input-field mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ocean-700">Kategori</label>
            <select
              value={form.kategori}
              onChange={(e) => setForm({ ...form, kategori: e.target.value as KategoriPengeluaran })}
              className="input-field mt-1"
            >
              {KATEGORI_OPTIONS.map((k) => (
                <option key={k} value={k}>{LABEL_KATEGORI_PENGELUARAN[k]}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-ocean-700">Deskripsi</label>
            <input
              value={form.deskripsi}
              onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
              className="input-field mt-1"
              placeholder="Contoh: Beli es batu & kardus packing"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-ocean-700">Jumlah (Rp)</label>
            <input
              type="number"
              min={0}
              value={form.jumlah}
              onChange={(e) => setForm({ ...form, jumlah: Number(e.target.value) })}
              className="input-field mt-1"
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Pengeluaran"}
          </button>
        </form>

        {/* List */}
        <div className="lg:col-span-2">
          <div className="card mb-4 flex items-center justify-between p-4">
            <span className="text-sm text-ocean-600">Total Pengeluaran (semua data)</span>
            <span className="font-display text-lg font-bold text-coral-600">{formatRupiah(total)}</span>
          </div>

          <div className="overflow-x-auto rounded-xl2 border border-ocean-100 bg-white">
            {loading ? (
              <div className="flex h-48 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-ocean-400" />
              </div>
            ) : list.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <FileSpreadsheet className="h-10 w-10 text-ocean-300" />
                <p className="text-sm text-ocean-400">Belum ada catatan pengeluaran.</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="border-b border-ocean-100 bg-ocean-50 text-left text-xs uppercase text-ocean-500">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3">Deskripsi</th>
                    <th className="px-4 py-3">Jumlah</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id} className="border-b border-ocean-50 last:border-0">
                      <td className="px-4 py-3 text-ocean-500">{formatTanggal(p.tanggal)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-ocean-100 px-2 py-1 text-xs font-medium text-ocean-700">
                          {LABEL_KATEGORI_PENGELUARAN[p.kategori]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-ocean-700">{p.deskripsi}</td>
                      <td className="px-4 py-3 font-medium text-coral-600">{formatRupiah(p.jumlah)}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(p.id)} className="text-ocean-300 hover:text-coral-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
