"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatRupiah } from "@/lib/utils";

interface DataPoint {
  tanggal: string;
  pemasukan: number;
}

export function IncomeChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1a82d1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1a82d1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1f6fb" />
        <XAxis
          dataKey="tanggal"
          tick={{ fontSize: 12, fill: "#194a73" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "#194a73" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) =>
            value >= 1000000 ? `${value / 1000000}jt` : `${value / 1000}rb`
          }
          width={45}
        />
        <Tooltip
          formatter={(value: number) => [formatRupiah(value), "Pemasukan"]}
          contentStyle={{ borderRadius: 12, border: "1px solid #bce6ff", fontSize: 13 }}
        />
        <Area
          type="monotone"
          dataKey="pemasukan"
          stroke="#1a82d1"
          strokeWidth={2}
          fill="url(#colorPemasukan)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
