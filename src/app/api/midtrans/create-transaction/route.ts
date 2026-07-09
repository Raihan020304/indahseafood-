import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getMidtransSnap } from "@/lib/midtrans";
import { generateNomorPesanan } from "@/lib/utils";
import { ONGKIR_FLAT, GRATIS_ONGKIR_MINIMAL } from "@/lib/constants";

const checkoutSchema = z.object({
  nama_penerima: z.string().min(3, "Nama penerima wajib diisi"),
  telepon: z.string().min(8, "Nomor telepon tidak valid"),
  alamat_lengkap: z.string().min(10, "Alamat lengkap wajib diisi"),
  kota: z.string().min(2),
  provinsi: z.string().min(2),
  kode_pos: z.string().min(4),
  catatan: z.string().optional(),
  items: z
    .array(
      z.object({
        produk_id: z.string().uuid(),
        jumlah: z.number().int().positive(),
      })
    )
    .min(1, "Keranjang tidak boleh kosong"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const supabase = createSupabaseServerClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      return NextResponse.json(
        { error: "Anda harus login untuk checkout" },
        { status: 401 }
      );
    }

    const admin = createSupabaseAdminClient();

    // Ambil data produk terbaru dari DB (jangan percaya harga dari client!)
    const produkIds = data.items.map((i) => i.produk_id);
    const { data: produkList, error: produkError } = await admin
      .from("produk")
      .select("id, nama, harga, stok, gambar_url, is_aktif")
      .in("id", produkIds);

    if (produkError || !produkList) {
      return NextResponse.json(
        { error: "Gagal mengambil data produk" },
        { status: 500 }
      );
    }

    // Validasi stok & susun item pesanan
    const itemPesananData: {
      produk_id: string;
      nama_produk: string;
      gambar_url: string | null;
      harga_satuan: number;
      jumlah: number;
      subtotal: number;
    }[] = [];

    let subtotal = 0;

    for (const item of data.items) {
      const produk = produkList.find((p) => p.id === item.produk_id);
      if (!produk || !produk.is_aktif) {
        return NextResponse.json(
          { error: `Produk tidak ditemukan atau sudah tidak tersedia` },
          { status: 400 }
        );
      }
      if (produk.stok < item.jumlah) {
        return NextResponse.json(
          { error: `Stok "${produk.nama}" tidak cukup (tersisa ${produk.stok})` },
          { status: 400 }
        );
      }

      const itemSubtotal = produk.harga * item.jumlah;
      subtotal += itemSubtotal;

      itemPesananData.push({
        produk_id: produk.id,
        nama_produk: produk.nama,
        gambar_url: produk.gambar_url,
        harga_satuan: produk.harga,
        jumlah: item.jumlah,
        subtotal: itemSubtotal,
      });
    }

    const ongkir = subtotal >= GRATIS_ONGKIR_MINIMAL ? 0 : ONGKIR_FLAT;
    const total = subtotal + ongkir;
    const nomorPesanan = generateNomorPesanan();

    // Buat record pesanan (status awal: menunggu_pembayaran)
    const { data: pesananBaru, error: pesananError } = await admin
      .from("pesanan")
      .insert({
        nomor_pesanan: nomorPesanan,
        user_id: authData.user.id,
        nama_penerima: data.nama_penerima,
        telepon: data.telepon,
        alamat_pengiriman: data.alamat_lengkap,
        kota: data.kota,
        provinsi: data.provinsi,
        kode_pos: data.kode_pos,
        catatan: data.catatan ?? null,
        subtotal,
        ongkir,
        diskon: 0,
        total,
        status: "menunggu_pembayaran",
        midtrans_order_id: nomorPesanan,
      })
      .select()
      .single();

    if (pesananError || !pesananBaru) {
      return NextResponse.json(
        { error: "Gagal membuat pesanan" },
        { status: 500 }
      );
    }

    // Insert item-item pesanan
    const itemsToInsert = itemPesananData.map((item) => ({
      ...item,
      pesanan_id: pesananBaru.id,
    }));
    const { error: itemError } = await admin
      .from("item_pesanan")
      .insert(itemsToInsert);

    if (itemError) {
      return NextResponse.json(
        { error: "Gagal menyimpan item pesanan" },
        { status: 500 }
      );
    }

    // Buat transaksi Midtrans (Snap)
    const snap = getMidtransSnap();
    const snapTransaction = await snap.createTransaction({
      transaction_details: {
        order_id: nomorPesanan,
        gross_amount: total,
      },
      customer_details: {
        first_name: data.nama_penerima,
        phone: data.telepon,
        email: authData.user.email ?? "",
      },
      item_details: [
        ...itemPesananData.map((item) => ({
          id: item.produk_id,
          price: item.harga_satuan,
          quantity: item.jumlah,
          name: item.nama_produk.substring(0, 50),
        })),
        ...(ongkir > 0
          ? [{ id: "ongkir", price: ongkir, quantity: 1, name: "Ongkos Kirim" }]
          : []),
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/sukses?order_id=${nomorPesanan}`,
      },
    });

    // Simpan snap token ke pesanan
    await admin
      .from("pesanan")
      .update({ midtrans_snap_token: snapTransaction.token })
      .eq("id", pesananBaru.id);

    return NextResponse.json({
      snap_token: snapTransaction.token,
      redirect_url: snapTransaction.redirect_url,
      order_id: nomorPesanan,
      pesanan_id: pesananBaru.id,
    });
  } catch (error) {
    console.error("[create-transaction]", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
