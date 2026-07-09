import Link from "next/link";
import { Phone, Mail, MapPin, Instagram } from "lucide-react";
import { APP_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-ocean-100 bg-ocean-950 text-ocean-100">
      <div className="container-app grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ocean-600 font-display text-base font-bold text-white">
              IS
            </span>
            <span className="font-display text-lg font-bold text-white">
              {APP_NAME}
            </span>
          </div>
          <p className="mt-3 text-sm text-ocean-300">
            Frozen food seafood berkualitas, segar dari laut, beku terjaga,
            sampai langsung ke dapur Anda.
          </p>
        </div>

        <div>
          <h3 className="font-display font-semibold text-white">Belanja</h3>
          <ul className="mt-3 space-y-2 text-sm text-ocean-300">
            <li><Link href="/produk" className="hover:text-white">Semua Produk</Link></li>
            <li><Link href="/produk?kategori=udang" className="hover:text-white">Udang</Link></li>
            <li><Link href="/produk?kategori=ikan" className="hover:text-white">Ikan</Link></li>
            <li><Link href="/produk?kategori=cumi-sotong" className="hover:text-white">Cumi & Sotong</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold text-white">Akun</h3>
          <ul className="mt-3 space-y-2 text-sm text-ocean-300">
            <li><Link href="/pesanan" className="hover:text-white">Lacak Pesanan</Link></li>
            <li><Link href="/akun" className="hover:text-white">Akun Saya</Link></li>
            <li><Link href="/login" className="hover:text-white">Masuk / Daftar</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold text-white">Kontak Kami</h3>
          <ul className="mt-3 space-y-3 text-sm text-ocean-300">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0" /> 0852-1060-3757
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0" /> halo@indahseafood.id
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
              Jl. Perdamaian No.1, Tanah Baru, Kota Depok 
            </li>
            <li className="flex items-center gap-2">
              <Instagram className="h-4 w-4 shrink-0" /> @indahseafood.id
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ocean-800 py-5 text-center text-xs text-ocean-400">
        © {new Date().getFullYear()} {APP_NAME}. Semua hak cipta dilindungi.
      </div>
    </footer>
  );
}
