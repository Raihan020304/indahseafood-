import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/auth/admin-session";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createSupabaseAdminClient();

  const { data: usersData, error } = await admin.auth.admin.listUsers({ perPage: 200 });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: pesananData } = await admin
    .from("pesanan")
    .select("user_id, total, status")
    .in("status", ["dibayar", "diproses", "dikirim", "selesai"]);

  const pelanggan = usersData.users.map((u) => {
    const ordersUser = pesananData?.filter((p) => p.user_id === u.id) ?? [];
    const totalBelanja = ordersUser.reduce((sum, p) => sum + Number(p.total), 0);

    return {
      id: u.id,
      email: u.email,
      nama: (u.user_metadata?.nama as string) ?? "-",
      telepon: (u.user_metadata?.telepon as string) ?? "-",
      created_at: u.created_at,
      jumlah_pesanan: ordersUser.length,
      total_belanja: totalBelanja,
    };
  });

  pelanggan.sort((a, b) => b.total_belanja - a.total_belanja);

  return NextResponse.json({ data: pelanggan });
}
