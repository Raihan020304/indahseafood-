"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Wallet,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const MENU = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produk", label: "Produk & Stok", icon: Package },
  { href: "/admin/pesanan", label: "Pesanan", icon: ShoppingBag },
  { href: "/admin/keuangan", label: "Keuangan", icon: Wallet },
  { href: "/admin/pelanggan", label: "Pelanggan", icon: Users },
];

export function AdminSidebar({ nama }: { nama: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const SidebarContent = (
    <>
      <div className="flex items-center gap-2 px-5 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ocean-600 font-display text-sm font-bold text-white">
          IS
        </span>
        <div>
          <p className="font-display text-sm font-bold text-white">{APP_NAME}</p>
          <p className="text-xs text-ocean-400">Admin Dashboard</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {MENU.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "bg-ocean-600 text-white"
                  : "text-ocean-300 hover:bg-ocean-800 hover:text-white"
              )}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ocean-800 p-3">
        <div className="px-3 py-2 text-xs text-ocean-400">
          Masuk sebagai <span className="font-semibold text-ocean-200">{nama}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-coral-400 hover:bg-ocean-800"
        >
          <LogOut className="h-[18px] w-[18px]" /> Keluar
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="flex items-center justify-between bg-ocean-950 px-4 py-3 lg:hidden">
        <span className="font-display text-sm font-bold text-white">{APP_NAME} Admin</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="text-white">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="flex flex-col bg-ocean-950 pb-4 lg:hidden">{SidebarContent}</div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col bg-ocean-950 lg:flex">
        {SidebarContent}
      </aside>
    </>
  );
}
