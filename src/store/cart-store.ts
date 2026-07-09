import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItemClient } from "@/types/database";

interface CartState {
  items: CartItemClient[];
  tambahItem: (item: CartItemClient) => void;
  updateJumlah: (produkId: string, jumlah: number) => void;
  hapusItem: (produkId: string) => void;
  kosongkanKeranjang: () => void;
  totalItem: () => number;
  totalHarga: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      tambahItem: (item) => {
        const items = get().items;
        const existing = items.find((i) => i.produk_id === item.produk_id);

        if (existing) {
          const jumlahBaru = Math.min(
            existing.jumlah + item.jumlah,
            existing.stok
          );
          set({
            items: items.map((i) =>
              i.produk_id === item.produk_id ? { ...i, jumlah: jumlahBaru } : i
            ),
          });
        } else {
          set({ items: [...items, item] });
        }
      },

      updateJumlah: (produkId, jumlah) => {
        if (jumlah <= 0) {
          get().hapusItem(produkId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.produk_id === produkId
              ? { ...i, jumlah: Math.min(jumlah, i.stok) }
              : i
          ),
        });
      },

      hapusItem: (produkId) => {
        set({ items: get().items.filter((i) => i.produk_id !== produkId) });
      },

      kosongkanKeranjang: () => set({ items: [] }),

      totalItem: () => get().items.reduce((sum, i) => sum + i.jumlah, 0),

      totalHarga: () =>
        get().items.reduce((sum, i) => sum + i.harga * i.jumlah, 0),
    }),
    {
      name: "indahseafood-cart",
    }
  )
);
