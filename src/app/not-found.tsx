import Link from "next/link";
import { Snowflake } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ocean-50 px-4 text-center">
      <Snowflake className="h-16 w-16 text-ocean-300" />
      <h1 className="font-display text-3xl font-bold text-ocean-900">404</h1>
      <p className="text-ocean-500">Halaman yang Anda cari tidak ditemukan.</p>
      <Link href="/" className="btn-primary mt-2">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
