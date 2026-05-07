"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface ChartPoint {
  apy: number;
}

interface Props {
  poolId: string;
  currentAPY: number;
}

export default function Sparkline({ poolId, currentAPY }: Props) {
  const [data, setData] = useState<ChartPoint[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Skip static/mock entries that have no DeFiLlama pool
    if (!poolId || poolId.startsWith("static-") || poolId === "") {
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetch(`https://yields.llama.fi/chart/${poolId}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const raw: { timestamp: string; apy: number }[] = json?.data ?? [];
        const valid = raw.filter((p) => typeof p.apy === "number" && !isNaN(p.apy));
        const last30 = valid.slice(-30);
        setData(last30.map((p) => ({ apy: p.apy })));
      })
      .catch(() => {
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [poolId]);

  if (loading) {
    return <div className="h-8 bg-[#1E2A35]/50 rounded animate-pulse w-full" />;
  }

  if (!data || data.length < 3) return null;

  const avg30d = data.reduce((s, p) => s + p.apy, 0) / data.length;
  const color = currentAPY >= avg30d ? "#34D399" : "#F87171";

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col gap-0.5 shrink-0">
        <span className="text-[8px] text-[#3D5166]">30D AVG</span>
        <span className="text-[10px] font-medium tabular-nums" style={{ color }}>
          {avg30d.toFixed(2)}%
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <ResponsiveContainer width="100%" height={32}>
          <LineChart data={data}>
            <Line
              type="monotone"
              dataKey="apy"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
