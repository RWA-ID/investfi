"use client";
import { useEffect, useRef, useState } from "react";
import type { HistoricalAPY } from "@/lib/types";

interface Props {
  data: HistoricalAPY[];
  height?: number;
}

export default function APYChart({ data, height = 220 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(720);
  const [hover, setHover] = useState<{ i: number; x: number; y: number; v: number } | null>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const ro = new ResizeObserver((entries) => setW(entries[0].contentRect.width));
    ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, []);

  if (!data.length) return null;
  const apys = data.map((d) => d.apy);
  const min = Math.min(...apys) * 0.92;
  const max = Math.max(...apys) * 1.08;
  const range = max - min || 1;
  const stepX = w / Math.max(1, data.length - 1);
  const points = apys.map((v, i) => [i * stepX, height - ((v - min) / range) * height] as [number, number]);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`)
    .join(" ");
  const area = `${path} L${w},${height} L0,${height} Z`;

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const i = Math.max(0, Math.min(data.length - 1, Math.round(x / stepX)));
    setHover({ i, x: points[i][0], y: points[i][1], v: apys[i] });
  };

  const lines = 4;

  return (
    <div ref={wrapRef} className="apy-chart" onMouseMove={onMove} onMouseLeave={() => setHover(null)}>
      <svg width={w} height={height} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="apyFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {Array.from({ length: lines }).map((_, i) => (
          <line
            key={i}
            x1="0"
            x2={w}
            y1={(i / (lines - 1)) * height}
            y2={(i / (lines - 1)) * height}
            stroke="rgba(255,255,255,.05)"
            strokeDasharray="2 4"
          />
        ))}
        <path d={area} fill="url(#apyFill)" />
        <path
          d={path}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0 0 6px color-mix(in oklab, var(--accent) 50%, transparent))" }}
        />
        {hover && (
          <g>
            <line
              x1={hover.x}
              x2={hover.x}
              y1="0"
              y2={height}
              stroke="rgba(255,255,255,.12)"
              strokeDasharray="2 3"
            />
            <circle cx={hover.x} cy={hover.y} r={5} fill="var(--accent)" />
            <circle cx={hover.x} cy={hover.y} r={9} fill="var(--accent)" opacity="0.18" />
          </g>
        )}
      </svg>
      {hover && (
        <div className="apy-chart__tip" style={{ left: hover.x, top: hover.y - 50 }}>
          <span className="apy-chart__tip-v">{hover.v.toFixed(2)}%</span>
          <span className="apy-chart__tip-d">{data[hover.i].date.slice(0, 10)}</span>
        </div>
      )}
      <div className="apy-chart__axis">
        <span>{data.length}d ago</span>
        <span>now</span>
      </div>
    </div>
  );
}
