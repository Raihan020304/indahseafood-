"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Loader2, Snowflake, Truck } from "lucide-react";
import { toast } from "sonner";
import { formatRupiah, formatTanggalWaktu } from "@/lib/utils";
import { StatusBadge } from "@/components/shop/status-badge";
import type { Pesanan, StatusPesanan } from "@/types/database";

const STATUS_LANJUTAN: Record<StatusPesanan, StatusPesanan[]> = {
  menunggu_pembayaran: [],
  dibayar: ["diproses", "dibatalkan"],
  diproses: ["dikirim", "dibatalkan"],
  dikirim: ["selesai"],
  selesai: [],
  dibatalkan: [],
  gagal: [],
};

const LABEL_AKSI: Record<StatusPesanan, string> = {
  menunggu_pembayaran: "",
  dibayar: "",
  diproses: "Proses Pesanan",
  dikirim: "Kirim Pesanan",
  selesai: "Tandai Selesai",
  dibatalkan: "Batalkan Pesanan",
  gagal: "",
};

export default function DetailPesananAdminPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [pesanan, setPesanan] = useState<Pesanan | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [resi, setResi] = useState("");
  const [kurir, setKurir] = useState("");

  useEffect(() => {
    fetch(`/api/admin/pesanan/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setPesanan(data.data ?? null);
        setResi(data.data?.resi_pengiriman ?? "");
        setKurir(data.data?.kurir ?? "");
        setLoading(false);
      });
  }, [params.id]);

  async function updateStatus(status: StatusPesanan) {
    setUpdating(true);
    try {
      const payload: Record<string, unknown> = { status };
      if (status === "dikirim") {
        if (!resi.trim()) {
          toast.error("Isi nomor resi sebelum mengirim pesanan");
          setUpdating(false);
          return;
        }
        payload.resi_pengiriman = resi;
        payload.kurir = kurir;
      }

      const res = await fetch(`/api/admin/pesanan/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Gagal memperbarui pesanan");
        setUpdating(false);
        return;
      }

      setPesanan(data.data);
      toast.success("Status pesanan berhasil diperbarui");
      router.refresh();
    } catch {
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-ocean-400" />
      </div>
    );
  }

  if (!pesanan) {
    return <div className="p-8 text-center text-ocean-400">Pesanan tidak ditemukan.</div>;
  }

  const aksiTersedia = STATUS_LANJUTAN[pesanan.status];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ocean-900">{pesanan.nomor_pesanan}</h1>
          <p className="text-sm text-ocean-400">{formatTanggalWaktu(pesanan.created_at)}</p>
        </div>
        <StatusBadge status={pesanan.status} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card p-5">
            <h2 className="font-semibold text-ocean-900">Produk Dipesan</h2>
            <div className="mt-4 space-y-3">
              {pesanan.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-ocean-50">
                    {item.gambar_url ? (
                      <Image src={item.gambar_url} alt={item.nama_produk} width={56} height={56} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-ocean-200">
                        <Snowflake className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ocean-900">{item.nama_produk}</p>
                    <p className="text-xs text-ocean-400">{item.jumlah} x {formatRupiah(item.harga_satuan)}</p>
                  </div>
                  <span className="font-semibold text-ocean-900">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 border-t border-ocean-100 pt-3 text-sm text-ocean-600">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(pesanan.subtotal)}</span></div>
              <div className="flex justify-between"><span>Ongkir</span><span>{formatRupiah(pesanan.ongkir)}</span></div>
              <div className="flex justify-between font-display text-base font-bold text-ocean-900">
                <span>Total</span><span>{formatRupiah(pesanan.total)}</span>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-ocean-900">Alamat Pengiriman</h2>
            <p className="mt-2 text-sm text-ocean-600">{pesanan.nama_penerima} · {pesanan.telepon}</p>
            <p className="text-sm text-ocean-600">
              {pesanan.alamat_pengiriman}, {pesanan.kota}, {pesanan.provinsi} {pesanan.kode_pos}
            </p>
            {pesanan.catatan && (
              <p className="mt-2 text-sm italic text-ocean-500">Catatan: {pesanan.catatan}</p>
            )}
          </div>
        </div>

        {/* Panel aksi */}
        <div className="card h-fit p-5">
          <h2 className="font-semibold text-ocean-900">Kelola Pesanan</h2>

          {pesanan.status === "diproses" && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-ocean-700">Nomor Resi</label>
                <input
                  value={resi}
                  onChange={(e) => setResi(e.target.value)}
                  className="input-field mt-1"
                  placeholder="Masukkan nomor resi"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-ocean-700">Kurir</label>
                <input
                  value={kurir}
                  onChange={(e) => setKurir(e.target.value)}
                  className="input-field mt-1"
                  placeholder="Contoh: JNE, J&T, SiCepat"
                />
              </div>
            </div>
          )}

          {pesanan.resi_pengiriman && pesanan.status !== "diproses" && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-ocean-50 p-3 text-sm text-ocean-700">
              <Truck className="h-4 w-4" /> {pesanan.resi_pengiriman} ({pesanan.kurir})
            </div>
          )}

          <div className="mt-4 space-y-2">
            {aksiTersedia.length === 0 ? (
              <p className="text-sm text-ocean-400">
                {pesanan.status === "menunggu_pembayaran"
                  ? "Menunggu konfirmasi pembayaran dari Midtrans."
                  : "Tidak ada aksi lebih lanjut untuk pesanan ini."}
              </p>
            ) : (
              aksiTersedia.map((status) => (
                <button
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={updating}
                  className={status === "dibatalkan" ? "btn-secondary w-full !text-coral-600" : "btn-primary w-full"}
                >
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : LABEL_AKSI[status]}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
