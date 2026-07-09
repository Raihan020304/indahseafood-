-- ============================================================
-- INDAHSEAFOOD - SEED DATA
-- Jalankan SETELAH 001_schema.sql dan 002_rls_policies.sql
-- ============================================================

-- ============================================================
-- AKUN ADMIN
-- Email: raihangp020304@gmail.com
-- Password: raihan234  (sudah di-hash dengan scrypt, lihat src/lib/auth/password.ts)
-- PENTING: ganti password ini setelah login pertama kali demi keamanan.
-- ============================================================
insert into admins (email, password_hash, nama)
values (
  'raihangp020304@gmail.com',
  'scrypt$16384$8$1$0724e3c82041db0c58ef1281c3c1ab15$cdbc7cdc7478637578fb3bb4b79cd2826ce0736c3443b89fe99d83a4f9924b4354741c9770a76d8db2896a946855f16713b4893d00b9d3c6861be6b39b8fa953',
  'Raihan'
)
on conflict (email) do nothing;

-- ============================================================
-- KATEGORI
-- ============================================================
insert into kategori (nama, slug, icon) values
  ('Udang', 'udang', 'shrimp'),
  ('Ikan', 'ikan', 'fish'),
  ('Cumi-cumi & Sotong', 'cumi-sotong', 'squid'),
  ('Kepiting & Rajungan', 'kepiting-rajungan', 'crab'),
  ('Bakso & Olahan Seafood', 'olahan-seafood', 'package'),
  ('Kerang', 'kerang', 'shell')
on conflict (slug) do nothing;

-- ============================================================
-- PRODUK CONTOH
-- ============================================================
insert into produk (nama, slug, deskripsi, kategori_id, harga, harga_coret, satuan, berat_gram, stok, stok_minimum, gambar_url, is_aktif, is_unggulan)
select
  v.nama, v.slug, v.deskripsi, k.id, v.harga, v.harga_coret, v.satuan, v.berat_gram, v.stok, v.stok_minimum, v.gambar_url, true, v.unggulan
from (values
  ('Udang Vannamei Size 30', 'udang-vannamei-size-30', 'Udang vannamei segar beku, size 30, sudah dikupas, siap olah.', 'udang', 85000, 95000, 'pack', 500, 50, 10, '/images/udang-vannamei.jpg', true),
  ('Udang Windu Premium', 'udang-windu-premium', 'Udang windu kualitas premium, ukuran besar, cocok untuk acara spesial.', 'udang', 120000, null, 'pack', 500, 30, 5, '/images/udang-windu.jpg', true),
  ('Ikan Salmon Fillet Norwegia', 'ikan-salmon-fillet-norwegia', 'Salmon fillet import langsung dari Norwegia, tanpa duri, segar beku.', 'ikan', 145000, 165000, 'pack', 400, 25, 5, '/images/salmon-fillet.jpg', true),
  ('Ikan Dori Fillet', 'ikan-dori-fillet', 'Fillet ikan dori tanpa tulang, cocok untuk fish and chips atau digoreng.', 'ikan', 55000, null, 'pack', 500, 60, 10, '/images/dori-fillet.jpg', false),
  ('Ikan Kakap Merah Utuh', 'ikan-kakap-merah-utuh', 'Ikan kakap merah segar beku ukuran sedang, ideal untuk dibakar.', 'ikan', 75000, null, 'kg', 1000, 40, 8, '/images/kakap-merah.jpg', false),
  ('Cumi-cumi Sedang', 'cumi-cumi-sedang', 'Cumi-cumi segar beku ukuran sedang, sudah dibersihkan.', 'cumi-sotong', 65000, 70000, 'pack', 500, 35, 8, '/images/cumi-cumi.jpg', true),
  ('Sotong Bersih Frozen', 'sotong-bersih-frozen', 'Sotong yang sudah dibersihkan dan dibekukan, praktis siap olah.', 'cumi-sotong', 70000, null, 'pack', 500, 28, 6, '/images/sotong.jpg', false),
  ('Kepiting Soka', 'kepiting-soka', 'Kepiting soka (cangkang lunak) segar beku, bisa digoreng utuh.', 'kepiting-rajungan', 95000, null, 'pack', 500, 20, 5, '/images/kepiting-soka.jpg', false),
  ('Daging Rajungan Kupas', 'daging-rajungan-kupas', 'Daging rajungan yang sudah dikupas, siap untuk sup atau salad.', 'kepiting-rajungan', 110000, 125000, 'pack', 250, 15, 5, '/images/rajungan-kupas.jpg', true),
  ('Bakso Ikan Premium', 'bakso-ikan-premium', 'Bakso ikan homemade dengan daging ikan asli, tanpa pengawet.', 'olahan-seafood', 35000, null, 'pack', 500, 80, 15, '/images/bakso-ikan.jpg', false),
  ('Nugget Udang', 'nugget-udang', 'Nugget udang renyah, cocok untuk camilan keluarga.', 'olahan-seafood', 40000, 45000, 'pack', 500, 70, 15, '/images/nugget-udang.jpg', true),
  ('Kerang Hijau Bersih', 'kerang-hijau-bersih', 'Kerang hijau yang sudah dibersihkan, siap dimasak.', 'kerang', 30000, null, 'pack', 500, 45, 10, '/images/kerang-hijau.jpg', false)
) as v(nama, slug, deskripsi, kategori_slug, harga, harga_coret, satuan, berat_gram, stok, stok_minimum, gambar_url, unggulan)
join kategori k on k.slug = v.kategori_slug
on conflict (slug) do nothing;
