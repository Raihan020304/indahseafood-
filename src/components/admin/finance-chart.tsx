"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { formatRupiah } from "@/lib/utils";

interface DataPoint {
  tanggal: string;
  pemasukan: number;
  pengeluaran: number;
}

export function FinanceChart({ data }: { data: DataPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-ocean-400">
        Belum ada data transaksi bulan ini.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1f6fb" />
        <XAxis dataKey="tanggal" tick={{ fontSize: 12, fill: "#194a73" }} axisLine={false} tickLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: "#194a73" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => (v >= 1000000 ? `${v / 1000000}jt` : `${v / 1000}rb`)}
          width={45}
        />
        <Tooltip
          formatter={(value: number, name: string) => [
            formatRupiah(value),
            name === "pemasukan" ? "Pemasukan" : "Pengeluaran",
          ]}
          contentStyle={{ borderRadius: 12, border: "1px solid #bce6ff", fontSize: 13 }}
        />
        <Legend
          formatter={(value) => (value === "pemasukan" ? "Pemasukan" : "Pengeluaran")}
          wrapperStyle={{ fontSize: 12 }}
        />
        <Bar dataKey="pemasukan" fill="#1a82d1" radius={[4, 4, 0, 0]} />
        <Bar dataKey="pengeluaran" fill="#ff6b4a" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
