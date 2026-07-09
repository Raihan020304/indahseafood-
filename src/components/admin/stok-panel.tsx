"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PackagePlus, PackageMinus } from "lucide-react";
import { toast } from "sonner";
import { formatTanggalWaktu, cn } from "@/lib/utils";
import type { RiwayatStok } from "@/types/database";

interface StokPanelProps {
  produkId: string;
  stokSaatIni: number;
  riwayatAwal: RiwayatStok[];
}

export function StokPanel({ produkId, stokSaatIni, riwayatAwal }: StokPanelProps) {
  const router = useRouter();
  const [tipe, setTipe] = useState<"masuk" | "keluar">("masuk");
  const [jumlah, setJumlah] = useState(1);
  const [catatan, setCatatan] = useState("");
  const [saving, setSaving] = useState(false);
  const [riwayat, setRiwayat] = useState(riwayatAwal);
  const [stok, setStok] = useState(stokSaatIni);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (jumlah <= 0) {
      toast.error("Jumlah harus lebih dari 0");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/produk/${produkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          penyesuaian_stok: { tipe, jumlah, catatan: catatan || undefined },
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Gagal memperbarui stok");
        setSaving(false);
        return;
      }

      setStok(data.data.stok);
      toast.success("Stok berhasil diperbarui");
      setJumlah(1);
      setCatatan("");
      router.refresh();

      // refresh riwayat
      const detailRes = await fetch(`/api/admin/produk/${produkId}`);
      const detailData = await detailRes.json();
      setRiwayat(detailData.riwayat_stok ?? []);
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ocean-900">Manajemen Stok</h2>
        <span className="rounded-full bg-ocean-100 px-3 py-1 text-sm font-bold text-ocean-700">
          {stok} tersisa
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTipe("masuk")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
              tipe === "masuk"
                ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                : "border-ocean-200 text-ocean-500"
            )}
          >
            <PackagePlus className="h-4 w-4" /> Stok Masuk
          </button>
          <button
            type="button"
            onClick={() => setTipe("keluar")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium",
              tipe === "keluar"
                ? "border-coral-500 bg-coral-50 text-coral-700"
                : "border-ocean-200 text-ocean-500"
            )}
          >
            <PackageMinus className="h-4 w-4" /> Stok Keluar
          </button>
        </div>

        <div>
          <label className="text-sm font-medium text-ocean-700">Jumlah</label>
          <input
            type="number"
            min={1}
            value={jumlah}
            onChange={(e) => setJumlah(Number(e.target.value))}
            className="input-field mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ocean-700">Catatan (opsional)</label>
          <input
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            className="input-field mt-1"
            placeholder="Contoh: Restock dari supplier A"
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Catat Perubahan Stok"}
        </button>
      </form>

      <div className="mt-5 border-t border-ocean-100 pt-4">
        <p className="text-xs font-medium text-ocean-500">Riwayat Stok Terbaru</p>
        <div className="mt-2 max-h-64 space-y-2 overflow-y-auto">
          {riwayat.length === 0 ? (
            <p className="text-xs text-ocean-400">Belum ada riwayat.</p>
          ) : (
            riwayat.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs">
                <div>
                  <span
                    className={cn(
                      "font-medium",
                      r.jumlah >= 0 ? "text-emerald-600" : "text-coral-600"
                    )}
                  >
                    {r.jumlah >= 0 ? "+" : ""}{r.jumlah}
                  </span>
                  <span className="ml-2 text-ocean-500">{r.catatan ?? r.tipe}</span>
                </div>
                <span className="text-ocean-400">{formatTanggalWaktu(r.created_at)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
