"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

type LoginValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    setLoading(true);
    const supabase = createSupabaseBrowserClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email.trim(),
      password: values.password,
    });

    if (error) {
      toast.error(
        error.message === "Invalid login credentials"
          ? "Email atau password salah"
          : error.message
      );
      setLoading(false);
      return;
    }

    try {
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (profileError || !userProfile) {
        toast.success("Berhasil masuk!");
        router.push("/");
        router.refresh();
        return;
      }

      toast.success("Berhasil masuk!");

      const hasRedirect = searchParams.get("redirect");

      if (hasRedirect) {
        router.push(hasRedirect);
      } else if (userProfile.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch {
      setLoading(false);
      toast.error("Gagal memvalidasi role pengguna.");
    }
  }

  return (
    <div>
      <h1 className="font-display text-xl font-bold text-ocean-900">
        Masuk ke Akun
      </h1>

      <p className="mt-1 text-sm text-ocean-500">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-semibold text-ocean-700 hover:underline"
        >
          Daftar di sini
        </Link>
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-ocean-700">Email</label>
          <input
            {...register("email")}
            type="email"
            className="input-field mt-1"
            placeholder="nama@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-coral-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-ocean-700">
            Password
          </label>
          <input
            {...register("password")}
            type="password"
            className="input-field mt-1"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-xs text-coral-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Masuk"
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}