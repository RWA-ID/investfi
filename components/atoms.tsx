"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Chain } from "@/lib/types";

export function Ticker({
  value,
  decimals = 2,
  prefix = "",
  suffix = "",
  duration = 1200,
  format,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  format?: (n: number) => string;
}) {
  const [v, setV] = useState(0);
  const fromRef = useRef(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = v;
    startRef.current = null;
    let raf = 0;
    const step = (t: number) => {
      if (startRef.current == null) startRef.current = t;
      const p = Math.min(1, (t - startRef.current) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(fromRef.current + (value - fromRef.current) * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const display = format
    ? format(v)
    : v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (
    <span className="tabular-nums">
      {prefix}
      {display}
      {suffix}
    </span>
  );
}

import { fmtUsdShort } from "@/lib/format";
export { fmtUsdShort };

export function Sparkline({
  data,
  width = 280,
  height = 48,
  stroke = "var(--accent)",
  fill = "var(--accent)",
  animate = true,
  strokeWidth = 1.6,
}: {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  animate?: boolean;
  strokeWidth?: number;
}) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data.map((v, i) => [i * stepX, height - ((v - min) / range) * height] as [number, number]);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(2)},${p[1].toFixed(2)}`)
    .join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;

  const ref = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  useEffect(() => {
    if (ref.current && animate) setLen(ref.current.getTotalLength());
  }, [animate, data]);

  const last = points[points.length - 1];

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
      {fill && <path d={area} fill={fill} opacity={0.18} />}
      <path
        ref={ref}
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={
          animate && len
            ? {
                strokeDasharray: len,
                strokeDashoffset: len,
                animation: "spark-draw 1.3s cubic-bezier(.2,.8,.2,1) forwards",
              }
            : undefined
        }
      />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={stroke} />
    </svg>
  );
}

export function RiskPill({ score, compact = false }: { score: number; compact?: boolean }) {
  let label, dot, bg, text;
  if (score <= 3.5) {
    label = "Low";
    dot = "#34D399";
    bg = "rgba(52,211,153,.12)";
    text = "#6EE7B7";
  } else if (score <= 5.5) {
    label = "Medium";
    dot = "#FBBF24";
    bg = "rgba(251,191,36,.12)";
    text = "#FCD34D";
  } else if (score <= 7.5) {
    label = "High";
    dot = "#FB923C";
    bg = "rgba(251,146,60,.14)";
    text = "#FDBA74";
  } else {
    label = "Very High";
    dot = "#F87171";
    bg = "rgba(248,113,113,.14)";
    text = "#FCA5A5";
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-medium"
      style={{
        background: bg,
        color: text,
        padding: compact ? "2px 8px" : "3px 10px",
        fontSize: compact ? 10 : 11,
        letterSpacing: ".01em",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          background: dot,
          boxShadow: `0 0 8px ${dot}`,
        }}
      />
      {label} · {score.toFixed(1)}
    </span>
  );
}

export const CHAIN_META: Record<Chain, { short: string; color: string }> = {
  Ethereum: { short: "ETH", color: "#627EEA" },
  Arbitrum: { short: "ARB", color: "#28A0F0" },
  Base: { short: "BASE", color: "#0052FF" },
  Optimism: { short: "OP", color: "#FF0420" },
  Polygon: { short: "POL", color: "#8247E5" },
  Avalanche: { short: "AVAX", color: "#E84142" },
  Solana: { short: "SOL", color: "#14F195" },
};

export function ChainBadge({ chain, compact = false }: { chain: Chain; compact?: boolean }) {
  const c = CHAIN_META[chain] ?? { short: chain.slice(0, 3).toUpperCase(), color: "#64748B" };
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-mono"
      style={{
        background: `color-mix(in oklab, ${c.color} 14%, transparent)`,
        color: `color-mix(in oklab, ${c.color} 65%, white)`,
        border: `1px solid color-mix(in oklab, ${c.color} 35%, transparent)`,
        padding: compact ? "1px 7px" : "2px 9px",
        fontSize: compact ? 9 : 10,
        letterSpacing: ".06em",
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: 999, background: c.color }} />
      {c.short}
    </span>
  );
}

const LOGO_GRADIENT: Record<string, [string, string]> = {
  AV: ["#B6509E", "#2EBAC6"],
  CO: ["#00D395", "#070A0E"],
  SP: ["#F2A03D", "#F26B23"],
  LI: ["#00A3FF", "#FFB6BB"],
  RP: ["#F08F47", "#FFCEAA"],
  UN: ["#FF007A", "#7B61FF"],
  CV: ["#FFE600", "#FF0000"],
  PE: ["#3CC8A4", "#0E7B5F"],
  GM: ["#4FA4DC", "#2E5BFF"],
  MO: ["#2470FF", "#9DB3FF"],
  ME: ["#0AB37C", "#053828"],
  ON: ["#FFFFFF", "#A1A1AA"],
  BA: ["#F5F5F5", "#A6A6A6"],
  YE: ["#0657F9", "#3B82F6"],
};

const ICON_BY_ID: Record<string, string> = {
  "aave-v3-eth-usdc": "/icons/aave.svg",
  "aave-v3-arb-usdc": "/icons/aave.svg",
  "compound-v3-eth-usdc": "/icons/comp.svg",
  "spark-usds": "/icons/spark.svg",
  "lido-steth": "/icons/lido.svg",
  "rocketpool-reth": "/icons/rpl.svg",
  "uniswap-v3-usdc-eth": "/icons/uniswap.svg",
  "curve-3pool": "/icons/curve.svg",
  "pendle-usdg": "/icons/pendle.svg",
  "gmx-v2-arb": "/icons/gmx.svg",
  "morpho-steakusdc": "/icons/morpho.svg",
  "meth-protocol": "/icons/meth.svg",
  "ondo-usdyc": "/icons/ondo.svg",
  "balancer-wsteth": "/icons/balancer.svg",
  "yearn-v3-usdc": "/icons/yearn.svg",
};

export function protocolIcon(id: string): string | null {
  return ICON_BY_ID[id] ?? null;
}

export function ProtoMark({
  logo,
  id,
  size = 40,
  alt,
}: {
  logo: string;
  id?: string;
  size?: number;
  alt?: string;
}) {
  const icon = id ? protocolIcon(id) : null;
  const [a, b] = LOGO_GRADIENT[logo] ?? ["#6366F1", "#22D3EE"];
  return (
    <div
      className="proto-mark"
      style={{
        width: size,
        height: size,
        background: icon
          ? "linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02))"
          : `linear-gradient(135deg, ${a}, ${b})`,
        borderRadius: size * 0.32,
        fontSize: size * 0.36,
      }}
    >
      {icon ? (
        <Image src={icon} alt={alt ?? logo} width={size} height={size} className="object-contain" />
      ) : (
        <span>{logo}</span>
      )}
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div className={`glass-card ${className}`} style={style}>
      {children}
    </div>
  );
}

export function LivePulse({ label = "LIVE" }: { label?: string }) {
  return (
    <span className="live-pulse">
      <span className="live-pulse__dot" />
      {label}
    </span>
  );
}

export function RiskBar({ label, value, weight }: { label: string; value: number; weight?: number }) {
  const color = value <= 3 ? "#34D399" : value <= 5.5 ? "#FBBF24" : value <= 7 ? "#FB923C" : "#F87171";
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[12px] text-white/80">{label}</span>
        <div className="flex items-baseline gap-2">
          {weight !== undefined && <span className="text-[10px] text-white/30">{weight}%</span>}
          <span className="text-[12px] tabular-nums font-medium" style={{ color }}>
            {value.toFixed(1)}
          </span>
        </div>
      </div>
      <div className="h-[3px] bg-white/[.06] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${(value / 10) * 100}%`,
            background: color,
            boxShadow: `0 0 8px ${color}66`,
            transition: "width .8s cubic-bezier(.2,.8,.2,1)",
          }}
        />
      </div>
    </div>
  );
}
