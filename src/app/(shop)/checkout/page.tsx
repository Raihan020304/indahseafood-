"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { formatRupiah } from "@/lib/utils";
import { ONGKIR_FLAT, GRATIS_ONGKIR_MINIMAL } from "@/lib/constants";
import { MidtransScript } from "@/components/shop/midtrans-script";

const checkoutFormSchema = z.object({
  nama_penerima: z.string().min(3, "Nama minimal 3 karakter"),
  telepon: z.string().min(8, "Nomor telepon tidak valid"),
  alamat_lengkap: z.string().min(10, "Alamat terlalu singkat"),
  kota: z.string().min(2, "Kota wajib diisi"),
  provinsi: z.string().min(2, "Provinsi wajib diisi"),
  kode_pos: z.string().min(4, "Kode pos tidak valid"),
  catatan: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export default function CheckoutPage() {
  const { items, totalHarga, kosongkanKeranjang } = useCartStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
  });

  useEffect(() => {
    if (items.length === 0) {
      router.replace("/keranjang");
    }
  }, [items.length, router]);

  const subtotal = totalHarga();
  const ongkir = subtotal >= GRATIS_ONGKIR_MINIMAL ? 0 : ONGKIR_FLAT;
  const total = subtotal + ongkir;

  async function onSubmit(values: CheckoutFormValues) {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/midtrans/create-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          items: items.map((i) => ({
            produk_id: i.produk_id,
            jumlah: i.jumlah,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Gagal membuat pesanan");
        setIsSubmitting(false);
        return;
      }

      // Buka Midtrans Snap popup
      if (window.snap) {
        window.snap.pay(data.snap_token, {
          onSuccess: () => {
            kosongkanKeranjang();
            router.push(`/checkout/sukses?order_id=${data.order_id}`);
          },
          onPending: () => {
            kosongkanKeranjang();
            router.push(`/checkout/sukses?order_id=${data.order_id}`);
          },
          onError: () => {
            toast.error("Pembayaran gagal. Silakan coba lagi.");
            setIsSubmitting(false);
          },
          onClose: () => {
            toast.info("Pembayaran belum diselesaikan. Pesanan tersimpan, Anda bisa membayar dari halaman Pesanan Saya.");
            setIsSubmitting(false);
          },
        });
      } else {
        toast.error("Sistem pembayaran belum siap, coba lagi sebentar.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan. Coba lagi.");
      setIsSubmitting(false);
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="container-app py-8">
      <MidtransScript />
      <h1 className="font-display text-2xl font-bold text-ocean-900">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 grid gap-8 lg:grid-cols-3">
        <div className="card space-y-4 p-5 lg:col-span-2">
          <h2 className="font-semibold text-ocean-900">Alamat Pengiriman</h2>

          <div>
            <label className="text-sm font-medium text-ocean-700">Nama Penerima</label>
            <input {...register("nama_penerima")} className="input-field mt-1" placeholder="Nama lengkap penerima" />
            {errors.nama_penerima && (
              <p className="mt-1 text-xs text-coral-600">{errors.nama_penerima.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-ocean-700">Nomor Telepon</label>
            <input {...register("telepon")} className="input-field mt-1" placeholder="08xxxxxxxxxx" />
            {errors.telepon && (
              <p className="mt-1 text-xs text-coral-600">{errors.telepon.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-ocean-700">Alamat Lengkap</label>
            <textarea
              {...register("alamat_lengkap")}
              className="input-field mt-1 min-h-[90px]"
              placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan"
            />
            {errors.alamat_lengkap && (
              <p className="mt-1 text-xs text-coral-600">{errors.alamat_lengkap.message}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-ocean-700">Kota</label>
              <input {...register("kota")} className="input-field mt-1" placeholder="Jakarta" />
              {errors.kota && <p className="mt-1 text-xs text-coral-600">{errors.kota.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-ocean-700">Provinsi</label>
              <input {...register("provinsi")} className="input-field mt-1" placeholder="DKI Jakarta" />
              {errors.provinsi && <p className="mt-1 text-xs text-coral-600">{errors.provinsi.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-ocean-700">Kode Pos</label>
              <input {...register("kode_pos")} className="input-field mt-1" placeholder="12345" />
              {errors.kode_pos && <p className="mt-1 text-xs text-coral-600">{errors.kode_pos.message}</p>}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-ocean-700">Catatan (opsional)</label>
            <input {...register("catatan")} className="input-field mt-1" placeholder="Contoh: titip ke satpam" />
          </div>
        </div>

        {/* Ringkasan */}
        <div className="card h-fit p-5">
          <h2 className="font-semibold text-ocean-900">Ringkasan Pesanan</h2>
          <div className="mt-4 max-h-48 space-y-2 overflow-y-auto text-sm">
            {items.map((item) => (
              <div key={item.produk_id} className="flex justify-between text-ocean-600">
                <span className="line-clamp-1">{item.jumlah}x {item.nama}</span>
                <span className="shrink-0">{formatRupiah(item.harga * item.jumlah)}</span>
              </div>
            ))}
          </div>
          <div className="my-4 h-px bg-ocean-100" />
          <div className="space-y-2 text-sm text-ocean-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkos Kirim</span>
              <span>{ongkir === 0 ? "Gratis" : formatRupiah(ongkir)}</span>
            </div>
          </div>
          <div className="my-4 h-px bg-ocean-100" />
          <div className="flex justify-between font-display text-lg font-bold text-ocean-900">
            <span>Total</span>
            <span>{formatRupiah(total)}</span>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-coral mt-5 w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Memproses...
              </>
            ) : (
              "Bayar Sekarang"
            )}
          </button>
          <p className="mt-3 text-center text-xs text-ocean-400">
            Pembayaran aman & terenkripsi melalui Midtrans
          </p>
        </div>
      </form>
    </div>
  );
}
