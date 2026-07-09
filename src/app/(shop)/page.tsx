import Link from "next/link";
import { ArrowRight, Truck, ShieldCheck, Snowflake, BadgePercent } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ProductCard } from "@/components/shop/product-card";
import type { Produk, Kategori } from "@/types/database";
import { APP_NAME } from "@/lib/constants";

export const revalidate = 60;

async function getDataHome() {
  const supabase = createSupabaseServerClient();

  const [{ data: unggulan }, { data: kategori }, { data: terbaru }] =
    await Promise.all([
      supabase
        .from("produk")
        .select("*")
        .eq("is_aktif", true)
        .eq("is_unggulan", true)
        .limit(8),
      supabase.from("kategori").select("*").order("nama"),
      supabase
        .from("produk")
        .select("*")
        .eq("is_aktif", true)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

  return {
    unggulan: (unggulan ?? []) as Produk[],
    kategori: (kategori ?? []) as Kategori[],
    terbaru: (terbaru ?? []) as Produk[],
  };
}

export default async function HomePage() {
  const { unggulan, kategori, terbaru } = await getDataHome();

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ocean-900">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)",
            backgroundSize: "60px 60px, 90px 90px",
          }}
        />
        <div className="container-app relative grid gap-8 py-16 sm:py-24 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-ocean-800 px-3 py-1 text-xs font-semibold text-ocean-200">
              <Snowflake className="h-3.5 w-3.5" /> Dibekukan segar, langsung dari pelabuhan
            </span>
            <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
              Seafood Segar Beku,
              <br /> Tanpa Ribet ke Pasar.
            </h1>
            <p className="mt-4 max-w-md text-ocean-200">
              {APP_NAME} mengantarkan udang, ikan, cumi, dan kepiting pilihan
              langsung ke pintu rumah Anda — beku sempurna, kualitas terjaga.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/produk" className="btn-coral">
                Belanja Sekarang <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/produk?kategori=udang" className="btn-secondary !bg-white/10 !text-white !border-white/20 hover:!bg-white/20">
                Lihat Udang Segar
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Truck, label: "Pengiriman Cepat", desc: "Cold-chain terjaga" },
              { icon: ShieldCheck, label: "Kualitas Terjamin", desc: "100% seafood asli" },
              { icon: BadgePercent, label: "Harga Bersaing", desc: "Promo tiap minggu" },
              { icon: Snowflake, label: "Selalu Beku Segar", desc: "Freezer grade -18°C" },
            ].map((f) => (
              <div key={f.label} className="rounded-xl2 bg-white/10 p-4 backdrop-blur">
                <f.icon className="h-6 w-6 text-ocean-200" />
                <p className="mt-2 text-sm font-semibold text-white">{f.label}</p>
                <p className="text-xs text-ocean-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* KATEGORI */}
      <section className="container-app py-12">
        <h2 className="font-display text-2xl font-bold text-ocean-900">
          Belanja per Kategori
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {kategori.map((k) => (
            <Link
              key={k.id}
              href={`/produk?kategori=${k.slug}`}
              className="card flex flex-col items-center gap-2 p-4 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ocean-50 text-2xl">
                🦐
              </span>
              <span className="text-sm font-medium text-ocean-800">{k.nama}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* PRODUK UNGGULAN */}
      {unggulan.length > 0 && (
        <section className="container-app py-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-ocean-900">
              Produk Unggulan
            </h2>
            <Link href="/produk" className="flex items-center gap-1 text-sm font-semibold text-ocean-600 hover:text-ocean-800">
              Lihat Semua <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {unggulan.map((p) => (
              <ProductCard key={p.id} produk={p} />
            ))}
          </div>
        </section>
      )}

      {/* PRODUK TERBARU */}
      <section className="container-app py-8 pb-16">
        <h2 className="font-display text-2xl font-bold text-ocean-900">
          Baru Ditambahkan
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {terbaru.map((p) => (
            <ProductCard key={p.id} produk={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
