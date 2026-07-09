import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

export default function CheckoutSuksesPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  return (
    <div className="container-app flex flex-col items-center justify-center gap-4 py-24 text-center">
      <CheckCircle2 className="h-16 w-16 text-ocean-600" />
      <h1 className="font-display text-2xl font-bold text-ocean-900">
        Terima kasih atas pesanan Anda!
      </h1>
      {searchParams.order_id && (
        <p className="text-sm text-ocean-500">
          Nomor Pesanan: <span className="font-semibold text-ocean-700">{searchParams.order_id}</span>
        </p>
      )}
      <p className="max-w-sm text-sm text-ocean-500">
        Kami akan memproses pesanan Anda setelah pembayaran terkonfirmasi. Anda
        bisa memantau status pesanan di halaman Pesanan Saya.
      </p>
      <div className="mt-2 flex gap-3">
        <Link href="/pesanan" className="btn-primary">Lihat Pesanan Saya</Link>
        <Link href="/produk" className="btn-secondary">Lanjut Belanja</Link>
      </div>
    </div>
  );
}
