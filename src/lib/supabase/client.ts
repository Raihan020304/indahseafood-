import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client untuk dipakai di Client Components (browser).
 * Menggunakan anon key — aman untuk diekspos, karena akses data
 * diatur lewat Row Level Security (RLS) di Supabase.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
