import midtransClient from "midtrans-client";

/**
 * Snap API client — dipakai untuk membuat transaksi (generate Snap Token).
 */
export function getMidtransSnap() {
  return new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
  });
}

/**
 * Core API client — dipakai untuk cek status transaksi secara manual
 * (misal saat user balik dari halaman pembayaran tapi webhook belum sampai).
 */
export function getMidtransCore() {
  return new midtransClient.CoreApi({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
    serverKey: process.env.MIDTRANS_SERVER_KEY!,
    clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY!,
  });
}

export interface MidtransNotification {
  transaction_time: string;
  transaction_status: string;
  transaction_id: string;
  status_message: string;
  status_code: string;
  signature_key: string;
  payment_type: string;
  order_id: string;
  merchant_id: string;
  gross_amount: string;
  fraud_status?: string;
  settlement_time?: string;
}

/**
 * Verifikasi signature key dari notifikasi webhook Midtrans, supaya kita
 * yakin request benar-benar datang dari Midtrans, bukan pihak luar yang
 * menyamar mengirim notifikasi palsu (misal langsung set status "settlement").
 *
 * Formula resmi Midtrans:
 *   SHA512(order_id + status_code + gross_amount + ServerKey)
 */
export async function verifyMidtransSignature(
  notif: MidtransNotification
): Promise<boolean> {
  const { createHash } = await import("crypto");
  const serverKey = process.env.MIDTRANS_SERVER_KEY!;
  const raw = `${notif.order_id}${notif.status_code}${notif.gross_amount}${serverKey}`;
  const expectedSignature = createHash("sha512").update(raw).digest("hex");
  return expectedSignature === notif.signature_key;
}

/**
 * Mapping status transaksi Midtrans -> status pesanan internal kita.
 */
export function mapMidtransStatusToOrderStatus(
  transactionStatus: string,
  fraudStatus?: string
): "dibayar" | "menunggu_pembayaran" | "dibatalkan" | "gagal" {
  if (transactionStatus === "capture") {
    if (fraudStatus === "accept") return "dibayar";
    if (fraudStatus === "challenge") return "menunggu_pembayaran";
    return "gagal";
  }
  if (transactionStatus === "settlement") return "dibayar";
  if (transactionStatus === "pending") return "menunggu_pembayaran";
  if (transactionStatus === "deny") return "gagal";
  if (transactionStatus === "cancel") return "dibatalkan";
  if (transactionStatus === "expire") return "dibatalkan";
  if (transactionStatus === "refund") return "dibatalkan";
  return "menunggu_pembayaran";
}
