"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const registerSchema = z
  .object({
    nama: z.string().min(3, "Nama minimal 3 karakter"),
    email: z.string().email("Email tidak valid"),
    telepon: z.string().min(8, "Nomor telepon tidak valid"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    konfirmasiPassword: z.string(),
  })
  .refine((data) => data.password === data.konfirmasiPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["konfirmasiPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterValues) {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          nama: values.nama,
          telepon: values.telepon,
        },
      },
    });

    if (error) {
      toast.error(
        error.message.includes("already registered")
          ? "Email sudah terdaftar"
          : error.message
      );
      setLoading(false);
      return;
    }

    toast.success("Pendaftaran berhasil! Silakan masuk.");
    router.push("/login");
  }

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ocean-900">Buat Akun Baru</h1>
      <p className="mt-1 text-sm text-ocean-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-semibold text-ocean-700 hover:underline">
          Masuk di sini
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-ocean-700">Nama Lengkap</label>
          <input {...register("nama")} className="input-field mt-1" placeholder="Nama Anda" />
          {errors.nama && <p className="mt-1 text-xs text-coral-600">{errors.nama.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-ocean-700">Email</label>
          <input {...register("email")} type="email" className="input-field mt-1" placeholder="nama@email.com" />
          {errors.email && <p className="mt-1 text-xs text-coral-600">{errors.email.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-ocean-700">Nomor Telepon</label>
          <input {...register("telepon")} className="input-field mt-1" placeholder="08xxxxxxxxxx" />
          {errors.telepon && <p className="mt-1 text-xs text-coral-600">{errors.telepon.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-ocean-700">Password</label>
          <input {...register("password")} type="password" className="input-field mt-1" placeholder="••••••••" />
          {errors.password && <p className="mt-1 text-xs text-coral-600">{errors.password.message}</p>}
        </div>

        <div>
          <label className="text-sm font-medium text-ocean-700">Konfirmasi Password</label>
          <input {...register("konfirmasiPassword")} type="password" className="input-field mt-1" placeholder="••••••••" />
          {errors.konfirmasiPassword && (
            <p className="mt-1 text-xs text-coral-600">{errors.konfirmasiPassword.message}</p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Daftar"}
        </button>
      </form>
    </div>
  );
}
