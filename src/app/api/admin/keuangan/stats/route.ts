import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/auth/admin-session";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const bulan = searchParams.get("bulan");
  const now = new Date();
  const targetBulan = bulan ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [year, month] = targetBulan.split("-");
  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const endDate = `${year}-${month}-${lastDay}`;

  const admin = createSupabaseAdminClient();

  const { data: pesananData } = await admin
    .from("pesanan")
    .select("total, created_at")
    .gte("created_at", `${startDate}T00:00:00`)
    .lte("created_at", `${endDate}T23:59:59`)
    .in("status", ["dibayar", "diproses", "dikirim", "selesai"]);

  const { data: pengeluaranData } = await admin
    .from("pengeluaran")
    .select("jumlah, kategori, tanggal")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate);

  const totalPemasukan = pesananData?.reduce((sum, p) => sum + Number(p.total), 0) ?? 0;
  const totalPengeluaran = pengeluaranData?.reduce((sum, p) => sum + Number(p.jumlah), 0) ?? 0;

  // Rekap per kategori pengeluaran
  const rekapKategori: Record<string, number> = {};
  pengeluaranData?.forEach((p) => {
    rekapKategori[p.kategori] = (rekapKategori[p.kategori] ?? 0) + Number(p.jumlah);
  });

  // Grafik harian pemasukan vs pengeluaran dalam bulan ini
  const grafikHarian: { tanggal: string; pemasukan: number; pengeluaran: number }[] = [];
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = `${year}-${month}-${String(d).padStart(2, "0")}`;
    const pemasukanHari =
      pesananData
        ?.filter((p) => p.created_at.startsWith(dateStr))
        .reduce((sum, p) => sum + Number(p.total), 0) ?? 0;
    const pengeluaranHari =
      pengeluaranData
        ?.filter((p) => p.tanggal === dateStr)
        .reduce((sum, p) => sum + Number(p.jumlah), 0) ?? 0;

    if (pemasukanHari > 0 || pengeluaranHari > 0) {
      grafikHarian.push({ tanggal: `${d}`, pemasukan: pemasukanHari, pengeluaran: pengeluaranHari });
    }
  }

  return NextResponse.json({
    bulan: targetBulan,
    total_pemasukan: totalPemasukan,
    total_pengeluaran: totalPengeluaran,
    laba: totalPemasukan - totalPengeluaran,
    rekap_kategori: rekapKategori,
    grafik_harian: grafikHarian,
    jumlah_pesanan: pesananData?.length ?? 0,
    jumlah_pengeluaran: pengeluaranData?.length ?? 0,
  });
}
