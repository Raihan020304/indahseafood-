# 🦐 IndahSeafood — E-Commerce Frozen Food Seafood

Website e-commerce lengkap untuk jualan frozen food seafood, dibangun dengan
**Next.js 14 (App Router)**, **Supabase** (database, auth, storage), dan
**Midtrans** (payment gateway).

## ✨ Fitur

### Storefront (Pelanggan)
- Beranda dengan produk unggulan & kategori
- Katalog produk dengan filter kategori & pencarian
- Detail produk + produk terkait
- Keranjang belanja (persisten di browser)
- Checkout dengan pembayaran Midtrans Snap (QRIS, kartu, e-wallet, dll)
- Lacak status pesanan (timeline: dibayar → diproses → dikirim → selesai)
- Login & registrasi pelanggan (Supabase Auth)
- Halaman akun

### Admin Dashboard
- Login admin terpisah (sudah disiapkan akun: lihat bagian **Akun Admin**)
- Dashboard: grafik pemasukan, pesanan perlu diproses, stok menipis, produk terlaris
- **Manajemen Produk & Stok**: tambah/edit produk, upload gambar, riwayat stok masuk/keluar
- **Manajemen Pesanan**: ubah status, input resi pengiriman
- **Keuangan**: ringkasan pemasukan vs pengeluaran, grafik harian, **export laporan ke Excel (.xlsx)**
- **Catatan Pengeluaran**: input manual pengeluaran (bahan baku, gaji, sewa, dll)
- Daftar pelanggan dengan total belanja

---

## 🚀 Setup dari Awal

### 1. Install dependencies

```bash
npm install
```

### 2. Setup Supabase

> 📷 **Catatan gambar produk:** data contoh di `003_seed.sql` mereferensikan
> path seperti `/images/udang-vannamei.jpg`, tapi folder `public/images/`
> masih kosong (belum ada foto asli). Setelah jalan, upload foto produk asli
> lewat **Admin > Produk & Stok > Kelola** (otomatis tersimpan ke Supabase
> Storage), lalu update field gambar di tiap produk. Atau isi manual folder
> `public/images/` sebelum build kalau mau pakai gambar lokal.


1. Buat project baru di [supabase.com](https://supabase.com)
2. Buka **SQL Editor**, jalankan file migration secara berurutan:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed.sql` (data contoh + akun admin)
   - `supabase/migrations/004_storage_setup.sql` (atau buat bucket manual, lihat isi file)
3. Buka **Project Settings > API**, catat:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ rahasia, jangan expose ke client!)
4. Buka **Authentication > Settings**, pastikan **Email provider** aktif (untuk login pelanggan)

### 3. Setup Midtrans

1. Daftar di [midtrans.com](https://midtrans.com) (gunakan mode **Sandbox** dulu untuk testing)
2. Buka **Settings > Access Keys**, catat:
   - `Server Key` → `MIDTRANS_SERVER_KEY`
   - `Client Key` → `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`
3. Buka **Settings > Configuration**, isi **Payment Notification URL** dengan:
   ```
   https://domainmu.com/api/midtrans/notification
   ```
   (Saat masih development lokal, gunakan tool seperti `ngrok` agar Midtrans bisa mengakses localhost-mu)

### 4. Setup environment variables

```bash
cp .env.local.example .env.local
```

Isi semua nilai di `.env.local` sesuai data dari Supabase & Midtrans di atas.

Untuk `JWT_SECRET`, generate string acak panjang, contoh:
```bash
openssl rand -base64 32
```

### 5. Jalankan project

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) untuk toko, dan
[http://localhost:3000/admin/login](http://localhost:3000/admin/login) untuk dashboard admin.

---

## 🔑 Akun Admin

Akun admin sudah disiapkan lewat seed SQL (`003_seed.sql`):

- **Email:** `raihangp020304@gmail.com`
- **Password:** `raihan234`

> ⚠️ **Penting:** Password di atas disimpan dalam bentuk hash terenkripsi
> (algoritma `scrypt`, bukan plain text) di database. Setelah login pertama
> kali, sangat disarankan untuk mengganti password ini.
>
> Untuk generate hash password baru, jalankan:
> ```bash
> node scripts/generate-admin-hash.js password_baru_kamu
> ```
> Script ini akan mencetak hash beserta query SQL siap-pakai untuk
> mengupdate password admin langsung di Supabase SQL Editor.

---

## 📂 Struktur Folder Penting

```
src/
├── app/
│   ├── (shop)/          # Halaman toko: home, produk, keranjang, checkout, pesanan, akun
│   ├── (auth)/          # Login & register pelanggan
│   ├── admin/
│   │   ├── (auth)/login # Login admin
│   │   └── (dashboard)/ # Dashboard, produk, pesanan, keuangan, pelanggan
│   └── api/              # Semua API routes (admin, midtrans, dll)
├── components/           # Komponen React (shop, admin, layout, ui)
├── lib/
│   ├── supabase/         # Client Supabase (browser, server, admin/service-role)
│   ├── midtrans/         # Integrasi Midtrans (create transaction, verify webhook)
│   └── auth/             # Hash password & session admin (JWT)
├── store/                # Zustand store (keranjang belanja)
└── types/                # TypeScript types (database, midtrans-client, global)

supabase/migrations/      # SQL schema, RLS policies, seed data, storage setup
```

---

## 🛒 Cara Kerja Pembayaran (Midtrans)

1. Pelanggan checkout → API `/api/midtrans/create-transaction` membuat record
   `pesanan` (status `menunggu_pembayaran`) dan generate **Snap Token**.
2. Snap popup muncul di browser pelanggan untuk memilih metode pembayaran.
3. Setelah pelanggan bayar, **Midtrans mengirim webhook** ke
   `/api/midtrans/notification` — di sinilah status pesanan benar-benar
   diupdate jadi `dibayar`, stok produk otomatis dikurangi, dan dicatat di
   `riwayat_stok`.
4. Signature webhook diverifikasi (SHA512) supaya tidak ada yang bisa
   memalsukan notifikasi pembayaran.

> 💡 Saat testing di Sandbox, gunakan [simulator Midtrans](https://simulator.sandbox.midtrans.com)
> untuk mensimulasikan pembayaran berhasil/gagal.

---

## 📊 Export Laporan Keuangan ke Excel

Di halaman **Admin > Keuangan**, klik tombol **"Export Excel"**. File `.xlsx`
yang dihasilkan punya 4 sheet:
1. **Ringkasan** — total pemasukan, pengeluaran, laba
2. **Pemasukan** — daftar semua pesanan yang sudah dibayar bulan tersebut
3. **Pengeluaran** — daftar semua pengeluaran manual bulan tersebut
4. **Rekap per Kategori** — total pengeluaran dikelompokkan per kategori

---

## ⚠️ Catatan Keamanan Sebelum Production

- [ ] Ganti password admin default setelah login pertama
- [ ] Pastikan `.env.local` tidak pernah di-commit ke Git (sudah ada di `.gitignore`)
- [ ] Ubah `MIDTRANS_IS_PRODUCTION` & `NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION` ke `true` + gunakan **Production Keys** saat go-live
- [ ] Set `NEXT_PUBLIC_APP_URL` ke domain asli (dipakai untuk callback Midtrans)
- [ ] Review ulang RLS policies di Supabase sebelum menerima data pelanggan asli
- [ ] Pertimbangkan menambahkan rate-limiting di API login (admin & pelanggan)

---

## 🧩 Stack Teknologi

| Layer | Teknologi |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS |
| Database & Auth | Supabase (Postgres + RLS) |
| Storage | Supabase Storage |
| Payment | Midtrans Snap |
| State management | Zustand (persist) |
| Form & validasi | React Hook Form + Zod |
| Grafik | Recharts |
| Export Excel | ExcelJS |
| Ikon | Lucide React |
