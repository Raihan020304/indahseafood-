import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getAdminSession } from "@/lib/auth/admin-session";
import { LABEL_KATEGORI_PENGELUARAN, type KategoriPengeluaran } from "@/types/database";

export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const bulan = searchParams.get("bulan"); // format YYYY-MM, default bulan ini

  const now = new Date();
  const targetBulan = bulan ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [year, month] = targetBulan.split("-");
  const startDate = `${year}-${month}-01`;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const endDate = `${year}-${month}-${lastDay}`;

  const admin = createSupabaseAdminClient();

  // --- Ambil data pemasukan (dari pesanan yang sudah dibayar dst) ---
  const { data: pesananData } = await admin
    .from("pesanan")
    .select("nomor_pesanan, nama_penerima, subtotal, ongkir, diskon, total, status, dibayar_at, created_at")
    .gte("created_at", `${startDate}T00:00:00`)
    .lte("created_at", `${endDate}T23:59:59`)
    .in("status", ["dibayar", "diproses", "dikirim", "selesai"])
    .order("created_at", { ascending: true });

  // --- Ambil data pengeluaran ---
  const { data: pengeluaranData } = await admin
    .from("pengeluaran")
    .select("*")
    .gte("tanggal", startDate)
    .lte("tanggal", endDate)
    .order("tanggal", { ascending: true });

  const totalPemasukan = pesananData?.reduce((sum, p) => sum + Number(p.total), 0) ?? 0;
  const totalPengeluaran = pengeluaranData?.reduce((sum, p) => sum + Number(p.jumlah), 0) ?? 0;

  // ================== BUAT WORKBOOK EXCEL ==================
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "IndahSeafood Admin";
  workbook.created = new Date();

  const headerFill: ExcelJS.Fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1A82D1" },
  };
  const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: "FFFFFFFF" } };

  // ---------- SHEET 1: RINGKASAN ----------
  const sheetRingkasan = workbook.addWorksheet("Ringkasan");
  sheetRingkasan.columns = [{ width: 30 }, { width: 20 }];

  sheetRingkasan.mergeCells("A1:B1");
  sheetRingkasan.getCell("A1").value = `Laporan Keuangan IndahSeafood - ${targetBulan}`;
  sheetRingkasan.getCell("A1").font = { bold: true, size: 14 };

  const ringkasanRows = [
    ["Total Pemasukan", totalPemasukan],
    ["Total Pengeluaran", totalPengeluaran],
    ["Laba / Rugi", totalPemasukan - totalPengeluaran],
    ["Jumlah Pesanan", pesananData?.length ?? 0],
    ["Jumlah Transaksi Pengeluaran", pengeluaranData?.length ?? 0],
  ];

  sheetRingkasan.addRow([]);
  ringkasanRows.forEach((row) => {
    const r = sheetRingkasan.addRow(row);
    if (typeof row[1] === "number" && row[0] !== "Jumlah Pesanan" && row[0] !== "Jumlah Transaksi Pengeluaran") {
      r.getCell(2).numFmt = '"Rp"#,##0';
    }
    r.getCell(1).font = { bold: true };
  });

  // ---------- SHEET 2: PEMASUKAN ----------
  const sheetPemasukan = workbook.addWorksheet("Pemasukan");
  sheetPemasukan.columns = [
    { header: "No. Pesanan", key: "nomor", width: 22 },
    { header: "Nama Pelanggan", key: "nama", width: 25 },
    { header: "Tanggal", key: "tanggal", width: 18 },
    { header: "Subtotal", key: "subtotal", width: 16 },
    { header: "Ongkir", key: "ongkir", width: 14 },
    { header: "Diskon", key: "diskon", width: 14 },
    { header: "Total", key: "total", width: 16 },
    { header: "Status", key: "status", width: 16 },
  ];

  sheetPemasukan.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
  });

  pesananData?.forEach((p) => {
    sheetPemasukan.addRow({
      nomor: p.nomor_pesanan,
      nama: p.nama_penerima,
      tanggal: new Date(p.created_at).toLocaleDateString("id-ID"),
      subtotal: Number(p.subtotal),
      ongkir: Number(p.ongkir),
      diskon: Number(p.diskon),
      total: Number(p.total),
      status: p.status,
    });
  });

  ["D", "E", "F", "G"].forEach((col) => {
    sheetPemasukan.getColumn(col).numFmt = '"Rp"#,##0';
  });

  const totalRowPemasukan = sheetPemasukan.addRow({
    nomor: "",
    nama: "",
    tanggal: "",
    subtotal: "",
    ongkir: "",
    diskon: "TOTAL",
    total: totalPemasukan,
    status: "",
  });
  totalRowPemasukan.font = { bold: true };
  totalRowPemasukan.getCell("G").numFmt = '"Rp"#,##0';

  // ---------- SHEET 3: PENGELUARAN ----------
  const sheetPengeluaran = workbook.addWorksheet("Pengeluaran");
  sheetPengeluaran.columns = [
    { header: "Tanggal", key: "tanggal", width: 16 },
    { header: "Kategori", key: "kategori", width: 22 },
    { header: "Deskripsi", key: "deskripsi", width: 35 },
    { header: "Jumlah", key: "jumlah", width: 18 },
    { header: "Dicatat Oleh", key: "dicatat_oleh", width: 25 },
  ];

  sheetPengeluaran.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
  });

  pengeluaranData?.forEach((p) => {
    sheetPengeluaran.addRow({
      tanggal: new Date(p.tanggal).toLocaleDateString("id-ID"),
      kategori: LABEL_KATEGORI_PENGELUARAN[p.kategori as KategoriPengeluaran] ?? p.kategori,
      deskripsi: p.deskripsi,
      jumlah: Number(p.jumlah),
      dicatat_oleh: p.dicatat_oleh ?? "-",
    });
  });

  sheetPengeluaran.getColumn("D").numFmt = '"Rp"#,##0';

  const totalRowPengeluaran = sheetPengeluaran.addRow({
    tanggal: "",
    kategori: "",
    deskripsi: "TOTAL",
    jumlah: totalPengeluaran,
    dicatat_oleh: "",
  });
  totalRowPengeluaran.font = { bold: true };
  totalRowPengeluaran.getCell("D").numFmt = '"Rp"#,##0';

  // ---------- SHEET 4: PENGELUARAN PER KATEGORI ----------
  const sheetKategori = workbook.addWorksheet("Rekap per Kategori");
  sheetKategori.columns = [
    { header: "Kategori", key: "kategori", width: 25 },
    { header: "Total Pengeluaran", key: "total", width: 20 },
  ];
  sheetKategori.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
  });

  const rekapKategori = new Map<string, number>();
  pengeluaranData?.forEach((p) => {
    const label = LABEL_KATEGORI_PENGELUARAN[p.kategori as KategoriPengeluaran] ?? p.kategori;
    rekapKategori.set(label, (rekapKategori.get(label) ?? 0) + Number(p.jumlah));
  });

  rekapKategori.forEach((total, kategori) => {
    sheetKategori.addRow({ kategori, total });
  });
  sheetKategori.getColumn("B").numFmt = '"Rp"#,##0';

  // Generate buffer & response
  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="Laporan-Keuangan-IndahSeafood-${targetBulan}.xlsx"`,
    },
  });
}
