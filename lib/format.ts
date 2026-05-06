export function formatTVL(n: number): string {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

export function formatAPY(n: number): string {
  return `${n.toFixed(2)}%`;
}

export function formatPct(n: number): string {
  return `${n.toFixed(1)}%`;
}
