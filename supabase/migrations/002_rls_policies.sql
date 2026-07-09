-- ============================================================
-- INDAHSEAFOOD - ROW LEVEL SECURITY (RLS)
-- Jalankan SETELAH 001_schema.sql
-- ============================================================

-- Aktifkan RLS di semua tabel
alter table produk enable row level security;
alter table kategori enable row level security;
alter table riwayat_stok enable row level security;
alter table alamat enable row level security;
alter table pesanan enable row level security;
alter table item_pesanan enable row level security;
alter table keranjang_item enable row level security;
alter table pengeluaran enable row level security;
alter table admins enable row level security;

-- ============================================================
-- PRODUK & KATEGORI: publik bisa baca, hanya service_role yang bisa tulis
-- (operasi tulis dari admin dashboard lewat API route pakai service role key)
-- ============================================================
create policy "produk_publik_select" on produk
  for select using (is_aktif = true or auth.role() = 'service_role');

create policy "produk_service_role_all" on produk
  for all using (auth.role() = 'service_role');

create policy "kategori_publik_select" on kategori
  for select using (true);

create policy "kategori_service_role_all" on kategori
  for all using (auth.role() = 'service_role');

-- ============================================================
-- RIWAYAT STOK: hanya admin (service role) yang akses
-- ============================================================
create policy "riwayat_stok_service_role_all" on riwayat_stok
  for all using (auth.role() = 'service_role');

-- ============================================================
-- ALAMAT: user hanya bisa lihat/kelola alamat miliknya sendiri
-- ============================================================
create policy "alamat_select_own" on alamat
  for select using (auth.uid() = user_id or auth.role() = 'service_role');

create policy "alamat_insert_own" on alamat
  for insert with check (auth.uid() = user_id);

create policy "alamat_update_own" on alamat
  for update using (auth.uid() = user_id);

create policy "alamat_delete_own" on alamat
  for delete using (auth.uid() = user_id);

-- ============================================================
-- PESANAN: user hanya bisa lihat pesanan miliknya, admin (service role) lihat semua
-- ============================================================
create policy "pesanan_select_own" on pesanan
  for select using (auth.uid() = user_id or auth.role() = 'service_role');

create policy "pesanan_insert_own" on pesanan
  for insert with check (auth.uid() = user_id or auth.role() = 'service_role');

create policy "pesanan_update_service_role" on pesanan
  for update using (auth.role() = 'service_role');

-- ============================================================
-- ITEM PESANAN: ikut akses pesanan induknya
-- ============================================================
create policy "item_pesanan_select_own" on item_pesanan
  for select using (
    auth.role() = 'service_role' or
    exists (
      select 1 from pesanan p
      where p.id = item_pesanan.pesanan_id and p.user_id = auth.uid()
    )
  );

create policy "item_pesanan_insert" on item_pesanan
  for insert with check (true);

-- ============================================================
-- KERANJANG: user hanya kelola keranjang miliknya
-- ============================================================
create policy "keranjang_select_own" on keranjang_item
  for select using (auth.uid() = user_id);

create policy "keranjang_insert_own" on keranjang_item
  for insert with check (auth.uid() = user_id);

create policy "keranjang_update_own" on keranjang_item
  for update using (auth.uid() = user_id);

create policy "keranjang_delete_own" on keranjang_item
  for delete using (auth.uid() = user_id);

-- ============================================================
-- PENGELUARAN: hanya admin (service role)
-- ============================================================
create policy "pengeluaran_service_role_all" on pengeluaran
  for all using (auth.role() = 'service_role');

-- ============================================================
-- ADMINS: hanya service role yang bisa baca (untuk proses login custom)
-- ============================================================
create policy "admins_service_role_all" on admins
  for all using (auth.role() = 'service_role');
