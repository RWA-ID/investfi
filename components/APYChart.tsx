"use client";
import type { HistoricalAPY } from "@/lib/types";

interface Props {
  data: HistoricalAPY[];
  color?: string;
}

export default function APYChart({ data, color = "#34D399" }: Props) {
  if (!data.length) return null;

  const min = Math.min(...data.map((d) => d.apy));
  const max = Math.max(...data.map((d) => d.apy));
  const range = max - min || 1;
  const W = 600;
  const H = 120;
  const pad = { t: 10, r: 10, b: 20, l: 40 };
  const iW = W - pad.l - pad.r;
  const iH = H - pad.t - pad.b;

  const pts = data.map((d, i) => {
    const x = pad.l + (i / (data.length - 1)) * iW;
    const y = pad.t + iH - ((d.apy - min) / range) * iH;
    return `${x},${y}`;
  });

  const polyline = pts.join(" ");
  const fill = `${pts.join(" ")} ${pad.l + iW},${pad.t + iH} ${pad.l},${pad.t + iH}`;

  // Y-axis labels
  const yLabels = [min, (min + max) / 2, max].map((v, i) => {
    const y = pad.t + iH - (i / 2) * iH;
    return { y, label: v.toFixed(1) + "%" };
  });

  // X-axis labels — first and last
  const xLabels = [
    { x: pad.l, label: data[0].date.slice(0, 7) },
    { x: pad.l + iW, label: data[data.length - 1].date.slice(0, 7) },
  ];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ fontFamily: "inherit" }}>
      {/* Grid lines */}
      {[0, 0.5, 1].map((t) => (
        <line
          key={t}
          x1={pad.l} y1={pad.t + iH - t * iH}
          x2={pad.l + iW} y2={pad.t + iH - t * iH}
          stroke="#1E2A35" strokeWidth={1}
        />
      ))}

      {/* Fill */}
      <polygon points={fill} fill={color} fillOpacity={0.08} />

      {/* Line */}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" />

      {/* Y labels */}
      {yLabels.map((l) => (
        <text key={l.label} x={pad.l - 4} y={l.y + 3} textAnchor="end" fontSize={8} fill="#3D5166">
          {l.label}
        </text>
      ))}

      {/* X labels */}
      {xLabels.map((l, i) => (
        <text
          key={i}
          x={l.x}
          y={H - 4}
          textAnchor={i === 0 ? "start" : "end"}
          fontSize={8}
          fill="#3D5166"
        >
          {l.label}
        </text>
      ))}
    </svg>
  );
}
