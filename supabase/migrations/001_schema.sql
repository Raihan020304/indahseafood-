-- ============================================================
-- INDAHSEAFOOD - DATABASE SCHEMA
-- Jalankan file ini di Supabase Dashboard > SQL Editor
-- Urutan: 001 -> 002 -> 003
-- ============================================================

-- Extension untuk UUID
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. ADMIN
-- ============================================================
create table if not exists admins (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password_hash text not null,
  nama text not null default 'Admin',
  created_at timestamptz not null default now()
);

-- ============================================================
-- 2. KATEGORI PRODUK
-- ============================================================
create table if not exists kategori (
  id uuid primary key default uuid_generate_v4(),
  nama text not null,
  slug text unique not null,
  icon text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3. PRODUK
-- ============================================================
create table if not exists produk (
  id uuid primary key default uuid_generate_v4(),
  nama text not null,
  slug text unique not null,
  deskripsi text,
  kategori_id uuid references kategori(id) on delete set null,
  harga numeric(12,2) not null check (harga >= 0),
  harga_coret numeric(12,2),
  satuan text not null default 'pack',
  berat_gram integer,
  stok integer not null default 0 check (stok >= 0),
  stok_minimum integer not null default 5,
  gambar_url text,
  gambar_urls text[] default array[]::text[],
  is_aktif boolean not null default true,
  is_unggulan boolean not null default false,
  terjual integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_produk_kategori on produk(kategori_id);
create index if not exists idx_produk_slug on produk(slug);
create index if not exists idx_produk_aktif on produk(is_aktif);

-- ============================================================
-- 4. RIWAYAT STOK (audit trail setiap perubahan stok)
-- ============================================================
create table if not exists riwayat_stok (
  id uuid primary key default uuid_generate_v4(),
  produk_id uuid not null references produk(id) on delete cascade,
  tipe text not null check (tipe in ('masuk', 'keluar', 'penyesuaian', 'penjualan')),
  jumlah integer not null,
  stok_sebelum integer not null,
  stok_sesudah integer not null,
  catatan text,
  dibuat_oleh text,
  created_at timestamptz not null default now()
);

create index if not exists idx_riwayat_stok_produk on riwayat_stok(produk_id);

-- ============================================================
-- 5. ALAMAT PELANGGAN
-- ============================================================
create table if not exists alamat (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null default 'Rumah',
  nama_penerima text not null,
  telepon text not null,
  alamat_lengkap text not null,
  kota text not null,
  provinsi text not null,
  kode_pos text not null,
  catatan text,
  is_utama boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_alamat_user on alamat(user_id);

-- ============================================================
-- 6. PESANAN (ORDERS)
-- ============================================================
create table if not exists pesanan (
  id uuid primary key default uuid_generate_v4(),
  nomor_pesanan text unique not null,
  user_id uuid references auth.users(id) on delete set null,

  -- snapshot data pelanggan (jaga-jaga alamat berubah)
  nama_penerima text not null,
  telepon text not null,
  alamat_pengiriman text not null,
  kota text not null,
  provinsi text not null,
  kode_pos text not null,
  catatan text,

  subtotal numeric(12,2) not null default 0,
  ongkir numeric(12,2) not null default 0,
  diskon numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,

  status text not null default 'menunggu_pembayaran'
    check (status in (
      'menunggu_pembayaran', 'dibayar', 'diproses',
      'dikirim', 'selesai', 'dibatalkan', 'gagal'
    )),

  metode_pembayaran text default 'midtrans',
  midtrans_order_id text unique,
  midtrans_transaction_id text,
  midtrans_payment_type text,
  midtrans_snap_token text,
  midtrans_raw_response jsonb,

  resi_pengiriman text,
  kurir text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  dibayar_at timestamptz,
  dikirim_at timestamptz,
  selesai_at timestamptz
);

create index if not exists idx_pesanan_user on pesanan(user_id);
create index if not exists idx_pesanan_status on pesanan(status);
create index if not exists idx_pesanan_nomor on pesanan(nomor_pesanan);
create index if not exists idx_pesanan_midtrans_order on pesanan(midtrans_order_id);

-- ============================================================
-- 7. ITEM PESANAN
-- ============================================================
create table if not exists item_pesanan (
  id uuid primary key default uuid_generate_v4(),
  pesanan_id uuid not null references pesanan(id) on delete cascade,
  produk_id uuid references produk(id) on delete set null,
  nama_produk text not null,
  gambar_url text,
  harga_satuan numeric(12,2) not null,
  jumlah integer not null check (jumlah > 0),
  subtotal numeric(12,2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_item_pesanan_pesanan on item_pesanan(pesanan_id);

-- ============================================================
-- 8. KERANJANG (cart tersimpan per user, opsional - bisa juga full client-side)
-- ============================================================
create table if not exists keranjang_item (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  produk_id uuid not null references produk(id) on delete cascade,
  jumlah integer not null default 1 check (jumlah > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, produk_id)
);

-- ============================================================
-- 9. PENGELUARAN (manual expense entries oleh admin)
-- ============================================================
create table if not exists pengeluaran (
  id uuid primary key default uuid_generate_v4(),
  tanggal date not null default current_date,
  kategori text not null
    check (kategori in (
      'bahan_baku', 'operasional', 'gaji', 'transportasi',
      'sewa', 'listrik_air', 'marketing', 'lainnya'
    )),
  deskripsi text not null,
  jumlah numeric(12,2) not null check (jumlah >= 0),
  bukti_url text,
  dicatat_oleh text,
  created_at timestamptz not null default now()
);

create index if not exists idx_pengeluaran_tanggal on pengeluaran(tanggal);

-- ============================================================
-- 10. TRIGGER: updated_at otomatis
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_produk_updated_at on produk;
create trigger trg_produk_updated_at before update on produk
  for each row execute function set_updated_at();

drop trigger if exists trg_pesanan_updated_at on pesanan;
create trigger trg_pesanan_updated_at before update on pesanan
  for each row execute function set_updated_at();

drop trigger if exists trg_keranjang_updated_at on keranjang_item;
create trigger trg_keranjang_updated_at before update on keranjang_item
  for each row execute function set_updated_at();

-- ============================================================
-- 11. FUNCTION: generate nomor pesanan otomatis (INV-20260625-XXXX)
-- ============================================================
create or replace function generate_nomor_pesanan()
returns text as $$
declare
  tanggal_str text;
  random_str text;
begin
  tanggal_str := to_char(now(), 'YYYYMMDD');
  random_str := upper(substr(md5(random()::text), 1, 4));
  return 'INV-' || tanggal_str || '-' || random_str;
end;
$$ language plpgsql;
