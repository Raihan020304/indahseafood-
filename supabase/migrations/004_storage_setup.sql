-- ============================================================
-- INDAHSEAFOOD - SETUP STORAGE BUCKET
-- ============================================================
-- Cara 1 (lebih mudah): Buat manual lewat Supabase Dashboard
--   1. Buka Storage > Create a new bucket
--   2. Nama bucket: indahseafood
--   3. Set "Public bucket" = ON (supaya gambar produk bisa diakses publik)
--
-- Cara 2: Jalankan SQL ini di SQL Editor (jika ingin otomatis)
-- ============================================================

insert into storage.buckets (id, name, public)
values ('indahseafood', 'indahseafood', true)
on conflict (id) do nothing;

-- Policy: siapa saja bisa baca (publik), hanya service_role yang bisa upload/hapus
create policy "indahseafood_public_read"
on storage.objects for select
using (bucket_id = 'indahseafood');

create policy "indahseafood_service_role_write"
on storage.objects for insert
with check (bucket_id = 'indahseafood' and auth.role() = 'service_role');

create policy "indahseafood_service_role_update"
on storage.objects for update
using (bucket_id = 'indahseafood' and auth.role() = 'service_role');

create policy "indahseafood_service_role_delete"
on storage.objects for delete
using (bucket_id = 'indahseafood' and auth.role() = 'service_role');
