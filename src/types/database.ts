export type StatusPesanan =
  | "menunggu_pembayaran"
  | "dibayar"
  | "diproses"
  | "dikirim"
  | "selesai"
  | "dibatalkan"
  | "gagal";

export type KategoriPengeluaran =
  | "bahan_baku"
  | "operasional"
  | "gaji"
  | "transportasi"
  | "sewa"
  | "listrik_air"
  | "marketing"
  | "lainnya";

export interface Kategori {
  id: string;
  nama: string;
  slug: string;
  icon: string | null;
  created_at: string;
}

export interface Produk {
  id: string;
  nama: string;
  slug: string;
  deskripsi: string | null;
  kategori_id: string | null;
  kategori?: Kategori | null;
  harga: number;
  harga_coret: number | null;
  satuan: string;
  berat_gram: number | null;
  stok: number;
  stok_minimum: number;
  gambar_url: string | null;
  gambar_urls: string[];
  is_aktif: boolean;
  is_unggulan: boolean;
  terjual: number;
  created_at: string;
  updated_at: string;
}

export interface RiwayatStok {
  id: string;
  produk_id: string;
  tipe: "masuk" | "keluar" | "penyesuaian" | "penjualan";
  jumlah: number;
  stok_sebelum: number;
  stok_sesudah: number;
  catatan: string | null;
  dibuat_oleh: string | null;
  created_at: string;
}

export interface Alamat {
  id: string;
  user_id: string;
  label: string;
  nama_penerima: string;
  telepon: string;
  alamat_lengkap: string;
  kota: string;
  provinsi: string;
  kode_pos: string;
  catatan: string | null;
  is_utama: boolean;
  created_at: string;
}

export interface ItemPesanan {
  id: string;
  pesanan_id: string;
  produk_id: string | null;
  nama_produk: string;
  gambar_url: string | null;
  harga_satuan: number;
  jumlah: number;
  subtotal: number;
  created_at: string;
}

export interface Pesanan {
  id: string;
  nomor_pesanan: string;
  user_id: string | null;
  nama_penerima: string;
  telepon: string;
  alamat_pengiriman: string;
  kota: string;
  provinsi: string;
  kode_pos: string;
  catatan: string | null;
  subtotal: number;
  ongkir: number;
  diskon: number;
  total: number;
  status: StatusPesanan;
  metode_pembayaran: string;
  midtrans_order_id: string | null;
  midtrans_transaction_id: string | null;
  midtrans_payment_type: string | null;
  midtrans_snap_token: string | null;
  resi_pengiriman: string | null;
  kurir: string | null;
  created_at: string;
  updated_at: string;
  dibayar_at: string | null;
  dikirim_at: string | null;
  selesai_at: string | null;
  items?: ItemPesanan[];
}

export interface KeranjangItem {
  id: string;
  user_id: string;
  produk_id: string;
  jumlah: number;
  produk?: Produk;
  created_at: string;
  updated_at: string;
}

export interface Pengeluaran {
  id: string;
  tanggal: string;
  kategori: KategoriPengeluaran;
  deskripsi: string;
  jumlah: number;
  bukti_url: string | null;
  dicatat_oleh: string | null;
  created_at: string;
}

export interface Admin {
  id: string;
  email: string;
  password_hash: string;
  nama: string;
  created_at: string;
}

export interface CartItemClient {
  produk_id: string;
  nama: string;
  slug: string;
  harga: number;
  gambar_url: string | null;
  jumlah: number;
  stok: number;
  satuan: string;
}

export const LABEL_STATUS_PESANAN: Record<StatusPesanan, string> = {
  menunggu_pembayaran: "Menunggu Pembayaran",
  dibayar: "Dibayar",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
  gagal: "Gagal",
};

export const LABEL_KATEGORI_PENGELUARAN: Record<KategoriPengeluaran, string> = {
  bahan_baku: "Bahan Baku",
  operasional: "Operasional",
  gaji: "Gaji Karyawan",
  transportasi: "Transportasi",
  sewa: "Sewa Tempat",
  listrik_air: "Listrik & Air",
  marketing: "Marketing & Iklan",
  lainnya: "Lainnya",
};
