import { cn } from "@/lib/utils";
import { LABEL_STATUS_PESANAN, type StatusPesanan } from "@/types/database";

const STATUS_COLOR: Record<StatusPesanan, string> = {
  menunggu_pembayaran: "bg-amber-100 text-amber-700",
  dibayar: "bg-blue-100 text-blue-700",
  diproses: "bg-indigo-100 text-indigo-700",
  dikirim: "bg-ocean-100 text-ocean-700",
  selesai: "bg-emerald-100 text-emerald-700",
  dibatalkan: "bg-gray-100 text-gray-600",
  gagal: "bg-coral-100 text-coral-700",
};

export function StatusBadge({ status }: { status: StatusPesanan }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        STATUS_COLOR[status]
      )}
    >
      {LABEL_STATUS_PESANAN[status]}
    </span>
  );
}
