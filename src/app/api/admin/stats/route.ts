import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/auth/admin-session";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdminClient();

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).toISOString();

  // Pemasukan bulan ini (dari pesanan yang sudah dibayar/diproses/dikirim/selesai)
  const { data: pesananBulanIni } = await admin
    .from("pesanan")
    .select("total, status, created_at")
    .gte("created_at", startOfMonth)
    .in("status", ["dibayar", "diproses", "dikirim", "selesai"]);

  const pemasukanBulanIni =
    pesananBulanIni?.reduce((sum, p) => sum + Number(p.total), 0) ?? 0;

  // Pemasukan hari ini
  const { data: pesananHariIni } = await admin
    .from("pesanan")
    .select("total")
    .gte("created_at", startOfToday)
    .in("status", ["dibayar", "diproses", "dikirim", "selesai"]);

  const pemasukanHariIni =
    pesananHariIni?.reduce((sum, p) => sum + Number(p.total), 0) ?? 0;

  // Pengeluaran bulan ini
  const { data: pengeluaranBulanIni } = await admin
    .from("pengeluaran")
    .select("jumlah")
    .gte("tanggal", startOfMonth.split("T")[0]);

  const totalPengeluaranBulanIni =
    pengeluaranBulanIni?.reduce((sum, p) => sum + Number(p.jumlah), 0) ?? 0;

  // Pesanan menunggu diproses
  const { count: pesananMenungguProses } = await admin
    .from("pesanan")
    .select("id", { count: "exact", head: true })
    .eq("status", "dibayar");

  // Pesanan menunggu pembayaran
  const { count: pesananMenungguBayar } = await admin
    .from("pesanan")
    .select("id", { count: "exact", head: true })
    .eq("status", "menunggu_pembayaran");

  // Total pesanan
  const { count: totalPesanan } = await admin
    .from("pesanan")
    .select("id", { count: "exact", head: true });

  // Produk dengan stok rendah/menipis
  const { data: semuaProduk } = await admin
    .from("produk")
    .select("id, nama, stok, stok_minimum")
    .eq("is_aktif", true);

  const produkStokRendah =
    semuaProduk?.filter((p) => p.stok <= p.stok_minimum) ?? [];

  // Grafik pemasukan 7 hari terakhir
  const tujuhHariLalu = new Date(today);
  tujuhHariLalu.setDate(today.getDate() - 6);
  tujuhHariLalu.setHours(0, 0, 0, 0);

  const { data: pesanan7Hari } = await admin
    .from("pesanan")
    .select("total, created_at")
    .gte("created_at", tujuhHariLalu.toISOString())
    .in("status", ["dibayar", "diproses", "dikirim", "selesai"]);

  const grafikHarian: { tanggal: string; pemasukan: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const total =
      pesanan7Hari
        ?.filter((p) => p.created_at.startsWith(dateStr))
        .reduce((sum, p) => sum + Number(p.total), 0) ?? 0;
    grafikHarian.push({
      tanggal: d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric" }),
      pemasukan: total,
    });
  }

  // Produk terlaris
  const { data: produkTerlaris } = await admin
    .from("produk")
    .select("id, nama, terjual, gambar_url")
    .order("terjual", { ascending: false })
    .limit(5);

  return NextResponse.json({
    pemasukan_hari_ini: pemasukanHariIni,
    pemasukan_bulan_ini: pemasukanBulanIni,
    pengeluaran_bulan_ini: totalPengeluaranBulanIni,
    laba_bulan_ini: pemasukanBulanIni - totalPengeluaranBulanIni,
    pesanan_menunggu_proses: pesananMenungguProses ?? 0,
    pesanan_menunggu_bayar: pesananMenungguBayar ?? 0,
    total_pesanan: totalPesanan ?? 0,
    produk_stok_rendah: produkStokRendah,
    grafik_harian: grafikHarian,
    produk_terlaris: produkTerlaris ?? [],
  });
}
