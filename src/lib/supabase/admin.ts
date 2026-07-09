import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client dengan SERVICE ROLE KEY — hanya boleh dipakai di
 * server-side code (Route Handlers / Server Actions), TIDAK PERNAH
 * di Client Components, karena key ini bisa bypass semua RLS policy.
 *
 * Dipakai untuk:
 * - Operasi admin dashboard (CRUD produk, lihat semua pesanan, dll)
 * - Webhook Midtrans (update status pesanan tanpa konteks user login)
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY atau NEXT_PUBLIC_SUPABASE_URL belum diset di .env.local"
    );
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
