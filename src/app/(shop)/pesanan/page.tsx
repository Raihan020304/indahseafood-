import Link from "next/link";
import { PackageX, ChevronRight } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { formatRupiah, formatTanggalWaktu } from "@/lib/utils";
import { StatusBadge } from "@/components/shop/status-badge";
import type { Pesanan } from "@/types/database";

export const dynamic = "force-dynamic";

async function getPesananUser() {
  const supabase = createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return [];

  const { data } = await supabase
    .from("pesanan")
    .select("*, items:item_pesanan(*)")
    .eq("user_id", authData.user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as Pesanan[];
}

export default async function PesananPage() {
  const pesananList = await getPesananUser();

  return (
    <div className="container-app py-8">
      <h1 className="font-display text-2xl font-bold text-ocean-900">Pesanan Saya</h1>

      {pesananList.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <PackageX className="h-12 w-12 text-ocean-300" />
          <p className="font-medium text-ocean-700">Belum ada pesanan</p>
          <Link href="/produk" className="btn-primary mt-2">Mulai Belanja</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {pesananList.map((pesanan) => (
            <Link
              key={pesanan.id}
              href={`/pesanan/${pesanan.id}`}
              className="card flex items-center justify-between gap-4 p-4"
            >
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-ocean-900">{pesanan.nomor_pesanan}</p>
                  <StatusBadge status={pesanan.status} />
                </div>
                <p className="mt-1 text-xs text-ocean-400">
                  {formatTanggalWaktu(pesanan.created_at)} ·{" "}
                  {pesanan.items?.length ?? 0} produk
                </p>
                <p className="mt-1 font-display font-bold text-ocean-900">
                  {formatRupiah(pesanan.total)}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-ocean-300" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
