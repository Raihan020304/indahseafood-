import { ProdukForm } from "@/components/admin/produk-form";

export default function ProdukBaruPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="font-display text-2xl font-bold text-ocean-900">Tambah Produk Baru</h1>
      <p className="text-sm text-ocean-500">Lengkapi detail produk dan stok awal</p>

      <div className="mt-6 max-w-3xl">
        <ProdukForm />
      </div>
    </div>
  );
}
