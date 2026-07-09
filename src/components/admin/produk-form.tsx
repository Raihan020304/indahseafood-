"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Upload, Snowflake } from "lucide-react";
import { toast } from "sonner";
import type { Kategori, Produk } from "@/types/database";

interface ProdukFormProps {
  produkAwal?: Produk;
}

export function ProdukForm({ produkAwal }: ProdukFormProps) {
  const router = useRouter();
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nama: produkAwal?.nama ?? "",
    deskripsi: produkAwal?.deskripsi ?? "",
    kategori_id: produkAwal?.kategori_id ?? "",
    harga: produkAwal?.harga ?? 0,
    harga_coret: produkAwal?.harga_coret ?? 0,
    satuan: produkAwal?.satuan ?? "pack",
    berat_gram: produkAwal?.berat_gram ?? 0,
    stok: produkAwal?.stok ?? 0,
    stok_minimum: produkAwal?.stok_minimum ?? 5,
    gambar_url: produkAwal?.gambar_url ?? "",
    is_aktif: produkAwal?.is_aktif ?? true,
    is_unggulan: produkAwal?.is_unggulan ?? false,
  });

  useEffect(() => {
    fetch("/api/kategori")
      .then((res) => res.json())
      .then((data) => setKategoriList(data.data ?? []));
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengunggah gambar");
        return;
      }

      setForm((f) => ({ ...f, gambar_url: data.url }));
      toast.success("Gambar berhasil diunggah");
    } catch {
      toast.error("Gagal mengunggah gambar");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      kategori_id: form.kategori_id || null,
      harga_coret: form.harga_coret > 0 ? form.harga_coret : null,
      berat_gram: form.berat_gram > 0 ? form.berat_gram : null,
      gambar_url: form.gambar_url || null,
    };

    try {
      const url = produkAwal ? `/api/admin/produk/${produkAwal.id}` : "/api/admin/produk";
      const method = produkAwal ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Gagal menyimpan produk");
        setSaving(false);
        return;
      }

      toast.success(produkAwal ? "Produk berhasil diperbarui" : "Produk berhasil ditambahkan");
      router.push("/admin/produk");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card grid gap-4 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-ocean-700">Nama Produk</label>
          <input
            required
            value={form.nama}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
            className="input-field mt-1"
            placeholder="Contoh: Udang Vannamei Size 30"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-ocean-700">Deskripsi</label>
          <textarea
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
            className="input-field mt-1 min-h-[90px]"
            placeholder="Deskripsikan produk ini..."
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ocean-700">Kategori</label>
          <select
            value={form.kategori_id}
            onChange={(e) => setForm({ ...form, kategori_id: e.target.value })}
            className="input-field mt-1"
          >
            <option value="">Pilih kategori</option>
            {kategoriList.map((k) => (
              <option key={k.id} value={k.id}>{k.nama}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-ocean-700">Satuan</label>
          <select
            value={form.satuan}
            onChange={(e) => setForm({ ...form, satuan: e.target.value })}
            className="input-field mt-1"
          >
            <option value="pack">Pack</option>
            <option value="kg">Kg</option>
            <option value="ekor">Ekor</option>
            <option value="box">Box</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-ocean-700">Harga Jual (Rp)</label>
          <input
            type="number"
            required
            min={0}
            value={form.harga}
            onChange={(e) => setForm({ ...form, harga: Number(e.target.value) })}
            className="input-field mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ocean-700">Harga Coret (opsional)</label>
          <input
            type="number"
            min={0}
            value={form.harga_coret}
            onChange={(e) => setForm({ ...form, harga_coret: Number(e.target.value) })}
            className="input-field mt-1"
            placeholder="Harga sebelum diskon"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-ocean-700">Berat (gram, opsional)</label>
          <input
            type="number"
            min={0}
            value={form.berat_gram}
            onChange={(e) => setForm({ ...form, berat_gram: Number(e.target.value) })}
            className="input-field mt-1"
          />
        </div>

        {!produkAwal && (
          <div>
            <label className="text-sm font-medium text-ocean-700">Stok Awal</label>
            <input
              type="number"
              min={0}
              value={form.stok}
              onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })}
              className="input-field mt-1"
            />
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-ocean-700">Stok Minimum (alert)</label>
          <input
            type="number"
            min={0}
            value={form.stok_minimum}
            onChange={(e) => setForm({ ...form, stok_minimum: Number(e.target.value) })}
            className="input-field mt-1"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="text-sm font-medium text-ocean-700">Foto Produk</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-ocean-50">
              {form.gambar_url ? (
                <Image src={form.gambar_url} alt="Preview" width={96} height={96} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-ocean-200">
                  <Snowflake className="h-8 w-8" />
                </div>
              )}
            </div>
            <label className="btn-secondary cursor-pointer">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Mengunggah..." : "Pilih Gambar"}
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm text-ocean-700">
            <input
              type="checkbox"
              checked={form.is_aktif}
              onChange={(e) => setForm({ ...form, is_aktif: e.target.checked })}
              className="h-4 w-4 rounded border-ocean-300"
            />
            Tampilkan di toko (aktif)
          </label>
          <label className="flex items-center gap-2 text-sm text-ocean-700">
            <input
              type="checkbox"
              checked={form.is_unggulan}
              onChange={(e) => setForm({ ...form, is_unggulan: e.target.checked })}
              className="h-4 w-4 rounded border-ocean-300"
            />
            Jadikan produk unggulan
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Batal
        </button>
        <button type="submit" disabled={saving || uploading} className="btn-primary">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan Produk"}
        </button>
      </div>
    </form>
  );
}
