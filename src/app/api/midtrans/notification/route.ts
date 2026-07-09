import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  verifyMidtransSignature,
  mapMidtransStatusToOrderStatus,
  type MidtransNotification,
} from "@/lib/midtrans";

/**
 * Endpoint ini didaftarkan sebagai "Payment Notification URL" di
 * Midtrans Dashboard > Settings > Configuration:
 *
 *   https://domainmu.com/api/midtrans/notification
 *
 * Midtrans akan mengirim POST request ke sini setiap kali status
 * transaksi berubah (pending -> settlement, dll).
 */
export async function POST(request: NextRequest) {
   console.log("========== WEBHOOK MASUK ==========");
  try {
    const notif = (await request.json()) as MidtransNotification;
    console.log(notif);

    // 1. Verifikasi signature — WAJIB, supaya tidak ada yang bisa
    //    memalsukan notifikasi pembayaran dari luar.
    const isValid = await verifyMidtransSignature(notif);
    if (!isValid) {
      console.warn("[midtrans-webhook] Signature tidak valid", notif.order_id);
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const admin = createSupabaseAdminClient();

    // 2. Cari pesanan terkait
    const { data: pesanan, error: findError } = await admin
      .from("pesanan")
      .select("*, item_pesanan(*)")
      .eq("midtrans_order_id", notif.order_id)
      .single();

    if (findError || !pesanan) {
      console.warn("[midtrans-webhook] Pesanan tidak ditemukan", notif.order_id);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const statusBaru = mapMidtransStatusToOrderStatus(
      notif.transaction_status,
      notif.fraud_status
    );

    // Hindari proses ganda kalau status sudah sama (notifikasi duplikat)
    if (pesanan.status === statusBaru) {
      return NextResponse.json({ message: "OK (status sudah sama)" });
    }

    const updateData: Record<string, unknown> = {
      status: statusBaru,
      midtrans_transaction_id: notif.transaction_id,
      midtrans_payment_type: notif.payment_type,
      midtrans_raw_response: notif,
    };

    if (statusBaru === "dibayar" && pesanan.status !== "dibayar") {
      updateData.dibayar_at = new Date().toISOString();
    }

    await admin.from("pesanan").update(updateData).eq("id", pesanan.id);

    // 3. Kalau baru saja dibayar (dan sebelumnya belum), kurangi stok
    //    & catat di riwayat_stok + tambah jumlah terjual.
    if (statusBaru === "dibayar" && pesanan.status !== "dibayar") {
      const items = pesanan.item_pesanan as Array<{
        produk_id: string | null;
        jumlah: number;
      }>;

      for (const item of items) {
        if (!item.produk_id) continue;

        const { data: produk } = await admin
          .from("produk")
          .select("stok, terjual")
          .eq("id", item.produk_id)
          .single();

        if (!produk) continue;

        const stokSesudah = Math.max(0, produk.stok - item.jumlah);

        await admin
          .from("produk")
          .update({
            stok: stokSesudah,
            terjual: produk.terjual + item.jumlah,
          })
          .eq("id", item.produk_id);

        await admin.from("riwayat_stok").insert({
          produk_id: item.produk_id,
          tipe: "penjualan",
          jumlah: -item.jumlah,
          stok_sebelum: produk.stok,
          stok_sesudah: stokSesudah,
          catatan: `Penjualan otomatis - pesanan ${pesanan.nomor_pesanan}`,
          dibuat_oleh: "system",
        });
      }
    }

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    console.error("[midtrans-webhook] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
