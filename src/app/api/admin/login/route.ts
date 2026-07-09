import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createAdminSession } from "@/lib/auth/admin-session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Email atau password tidak valid" }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const supabaseAdmin = createSupabaseAdminClient();

    console.log("--- Mencoba login untuk:", email);

    // 1. Autentikasi ke Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: password,
    });

    if (authError || !authData.user) {
      console.log("--- Auth Error:", authError?.message);
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    console.log("--- Auth Berhasil, UID:", authData.user.id);

    // 2. Ambil data dari tabel 'admins'
    const { data: adminRecord, error: dbError } = await supabaseAdmin
      .from("admins")
      .select("id, email, nama")
      .eq("id", authData.user.id)
      .single();

    if (dbError) {
      console.log("--- Database Query Error:", dbError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }

    if (!adminRecord) {
      console.log("--- User ditemukan di Auth, tapi TIDAK DITEMUKAN di tabel 'admins' untuk UID:", authData.user.id);
      return NextResponse.json({ error: "Akun anda tidak terdaftar sebagai admin" }, { status: 403 });
    }

    console.log("--- Admin ditemukan:", adminRecord.email);

    // 3. Buat session admin
    await createAdminSession({
      adminId: adminRecord.id,
      email: adminRecord.email,
      nama: adminRecord.nama,
    });

    console.log("--- Login Selesai & Session Dibuat");
    return NextResponse.json({ message: "Login berhasil" });

  } catch (error) {
    console.error("--- Server Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}