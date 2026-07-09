import Image from "next/image";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, Snowflake } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggalWaktu } from "@/lib/utils";
import { StatusBadge } from "@/components/shop/status-badge";
import type { Pesanan, StatusPesanan } from "@/types/database";

const URUTAN_TIMELINE: { status: StatusPesanan; label: string }[] = [
  { status: "menunggu_pembayaran", label: "Pesanan Dibuat" },
  { status: "dibayar", label: "Pembayaran Diterima" },
  { status: "diproses", label: "Pesanan Diproses" },
  { status: "dikirim", label: "Dikirim" },
  { status: "selesai", label: "Selesai" },
];

function getTimelineIndex(status: StatusPesanan): number {
  if (status === "dibatalkan" || status === "gagal") return -1;
  return URUTAN_TIMELINE.findIndex((t) => t.status === status);
}

async function getPesananDetail(id: string) {
  const supabase = createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  const { data } = await supabase
    .from("pesanan")
    .select("*, items:item_pesanan(*)")
    .eq("id", id)
    .eq("user_id", authData.user.id)
    .single();

  return data as Pesanan | null;
}

export default async function DetailPesananPage({
  params,
}: {
  params: { id: string };
}) {
  const pesanan = await getPesananDetail(params.id);
  if (!pesanan) notFound();

  const timelineIndex = getTimelineIndex(pesanan.status);
  const dibatalkan = pesanan.status === "dibatalkan" || pesanan.status === "gagal";

  return (
    <div className="container-app max-w-3xl py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ocean-900">
            {pesanan.nomor_pesanan}
          </h1>
          <p className="text-sm text-ocean-400">{formatTanggalWaktu(pesanan.created_at)}</p>
        </div>
        <StatusBadge status={pesanan.status} />
      </div>

      {/* Timeline */}
      {!dibatalkan ? (
        <div className="card mt-6 p-5">
          <div className="flex items-center justify-between">
            {URUTAN_TIMELINE.map((step, idx) => (
              <div key={step.status} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  {idx > 0 && (
                    <div
                      className={`h-0.5 flex-1 ${idx <= timelineIndex ? "bg-ocean-600" : "bg-ocean-100"}`}
                    />
                  )}
                  {idx === 0 && <div className="flex-1" />}
                </div>
                {idx <= timelineIndex ? (
                  <CheckCircle2 className="h-6 w-6 text-ocean-600" />
                ) : (
                  <Circle className="h-6 w-6 text-ocean-200" />
                )}
                <p className="mt-1 max-w-[70px] text-[11px] leading-tight text-ocean-600">
                  {step.label}
                </p>
              </div>
            ))}
          </div>
          {pesanan.resi_pengiriman && (
            <p className="mt-4 text-center text-sm text-ocean-600">
              No. Resi: <span className="font-semibold">{pesanan.resi_pengiriman}</span>
              {pesanan.kurir && ` (${pesanan.kurir})`}
            </p>
          )}
        </div>
      ) : (
        <div className="card mt-6 p-5 text-center text-sm text-coral-600">
          Pesanan ini {pesanan.status === "dibatalkan" ? "telah dibatalkan" : "gagal diproses"}.
        </div>
      )}

      {/* Item pesanan */}
      <div className="card mt-6 p-5">
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
                <p className="text-xs text-ocean-400">
                  {item.jumlah} x {formatRupiah(item.harga_satuan)}
                </p>
              </div>
              <span className="font-semibold text-ocean-900">{formatRupiah(item.subtotal)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Alamat & ringkasan */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-semibold text-ocean-900">Alamat Pengiriman</h2>
          <p className="mt-2 text-sm text-ocean-600">{pesanan.nama_penerima}</p>
          <p className="text-sm text-ocean-600">{pesanan.telepon}</p>
          <p className="mt-1 text-sm text-ocean-600">
            {pesanan.alamat_pengiriman}, {pesanan.kota}, {pesanan.provinsi} {pesanan.kode_pos}
          </p>
        </div>

        <div className="card p-5">
          <h2 className="font-semibold text-ocean-900">Ringkasan Pembayaran</h2>
          <div className="mt-2 space-y-1 text-sm text-ocean-600">
            <div className="flex justify-between"><span>Subtotal</span><span>{formatRupiah(pesanan.subtotal)}</span></div>
            <div className="flex justify-between"><span>Ongkir</span><span>{formatRupiah(pesanan.ongkir)}</span></div>
            {pesanan.diskon > 0 && (
              <div className="flex justify-between"><span>Diskon</span><span>-{formatRupiah(pesanan.diskon)}</span></div>
            )}
          </div>
          <div className="my-2 h-px bg-ocean-100" />
          <div className="flex justify-between font-display font-bold text-ocean-900">
            <span>Total</span><span>{formatRupiah(pesanan.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
