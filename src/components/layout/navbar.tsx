"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Menu, X, Search, User, LogOut, Package } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useUser } from "@/hooks/use-user";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const totalItem = useCartStore((s) => s.totalItem());
  const { user } = useUser();
  const router = useRouter();

  // Zustand persist membaca localStorage setelah mount, jadi badge jumlah
  // item baru ditampilkan setelah client benar-benar siap (hindari hydration mismatch).
  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/produk?q=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ocean-100 bg-white/95 backdrop-blur">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ocean-600 font-display text-base font-bold text-white">
            IS
          </span>
          <span className="font-display text-lg font-bold text-ocean-900 hidden sm:inline">
            {APP_NAME}
          </span>
        </Link>

        {/* Search - desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md items-center gap-2 rounded-full border border-ocean-200 bg-ocean-50 px-4 py-2"
        >
          <Search className="h-4 w-4 text-ocean-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari udang, ikan, cumi..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-ocean-400"
          />
        </form>

        {/* Nav links - desktop */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-ocean-700">
          <Link href="/produk" className="hover:text-ocean-900">
            Semua Produk
          </Link>
          <Link href="/produk?kategori=udang" className="hover:text-ocean-900">
            Udang
          </Link>
          <Link href="/produk?kategori=ikan" className="hover:text-ocean-900">
            Ikan
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/keranjang"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-ocean-700 hover:bg-ocean-50"
          >
            <ShoppingCart className="h-5 w-5" />
            {mounted && totalItem > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-coral-500 text-[10px] font-bold text-white">
                {totalItem > 9 ? "9+" : totalItem}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/pesanan"
                className="flex h-10 w-10 items-center justify-center rounded-full text-ocean-700 hover:bg-ocean-50"
                title="Pesanan Saya"
              >
                <Package className="h-5 w-5" />
              </Link>
              <Link
                href="/akun"
                className="flex h-10 w-10 items-center justify-center rounded-full text-ocean-700 hover:bg-ocean-50"
                title="Akun Saya"
              >
                <User className="h-5 w-5" />
              </Link>
              <button
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-full text-ocean-700 hover:bg-ocean-50"
                title="Keluar"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-primary hidden sm:inline-flex">
              Masuk
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-ocean-700 hover:bg-ocean-50 lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-ocean-100 bg-white px-4 py-4 lg:hidden">
          <form onSubmit={handleSearch} className="mb-4 flex items-center gap-2 rounded-full border border-ocean-200 bg-ocean-50 px-4 py-2">
            <Search className="h-4 w-4 text-ocean-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari produk..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </form>
          <nav className="flex flex-col gap-3 text-sm font-medium text-ocean-700">
            <Link href="/produk" onClick={() => setMenuOpen(false)}>Semua Produk</Link>
            <Link href="/produk?kategori=udang" onClick={() => setMenuOpen(false)}>Udang</Link>
            <Link href="/produk?kategori=ikan" onClick={() => setMenuOpen(false)}>Ikan</Link>
            {user ? (
              <>
                <Link href="/pesanan" onClick={() => setMenuOpen(false)}>Pesanan Saya</Link>
                <Link href="/akun" onClick={() => setMenuOpen(false)}>Akun Saya</Link>
                <button onClick={handleLogout} className="text-left text-coral-600">Keluar</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="font-semibold text-ocean-900">
                Masuk / Daftar
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
