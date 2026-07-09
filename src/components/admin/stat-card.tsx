import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  colorClass = "bg-ocean-100 text-ocean-600",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  colorClass?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ocean-500">{label}</p>
        <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", colorClass)}>
          <Icon className="h-[18px] w-[18px]" />
        </span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold text-ocean-900">{value}</p>
      {trend && <p className="mt-1 text-xs text-ocean-400">{trend}</p>}
    </div>
  );
}
