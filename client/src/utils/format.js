export const fmt = (n) =>
  n === undefined || n === null
    ? "N/A"
    : Number(n).toLocaleString("en-IN");

export const fmtPct = (n, decimals = 1) =>
  n === undefined || n === null ? "N/A" : `${Number(n).toFixed(decimals)}%`;

export const fmtK = (n) => {
  if (n === undefined || n === null) return "N/A";
  if (n >= 1e7) return `${(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(n);
};

export const CHART_COLORS = [
  "#3b82f6", "#ec4899", "#10b981", "#f59e0b",
  "#8b5cf6", "#06b6d4", "#f97316", "#ef4444",
  "#84cc16", "#a855f7",
];

export const GRADIENT_STOPS = {
  primary: ["#3b82f6", "#1d4ed8"],
  pink:    ["#ec4899", "#be185d"],
  green:   ["#10b981", "#065f46"],
  amber:   ["#f59e0b", "#92400e"],
};
