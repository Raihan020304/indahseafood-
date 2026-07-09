import { redirect } from "next/navigation";
import { User, Mail, Phone, Package, LogOut } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Link from "next/link";
import { LogoutButton } from "@/components/shop/logout-button";

export default async function AkunPage() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  const nama = (data.user.user_metadata?.nama as string) ?? "Pelanggan";
  const telepon = (data.user.user_metadata?.telepon as string) ?? "-";

  return (
    <div className="container-app max-w-2xl py-8">
      <h1 className="font-display text-2xl font-bold text-ocean-900">Akun Saya</h1>

      <div className="card mt-6 p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ocean-100 text-ocean-600">
            <User className="h-8 w-8" />
          </div>
          <div>
            <p className="font-display text-lg font-bold text-ocean-900">{nama}</p>
            <p className="text-sm text-ocean-500">Pelanggan IndahSeafood</p>
          </div>
        </div>

        <div className="mt-6 space-y-3 border-t border-ocean-100 pt-4 text-sm">
          <div className="flex items-center gap-3 text-ocean-700">
            <Mail className="h-4 w-4 text-ocean-400" /> {data.user.email}
          </div>
          <div className="flex items-center gap-3 text-ocean-700">
            <Phone className="h-4 w-4 text-ocean-400" /> {telepon}
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <Link href="/pesanan" className="card flex items-center gap-3 p-4 text-sm font-medium text-ocean-700">
          <Package className="h-5 w-5 text-ocean-500" /> Pesanan Saya
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
}
