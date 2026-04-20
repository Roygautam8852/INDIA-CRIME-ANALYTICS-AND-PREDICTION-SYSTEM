export default function StatCard({ title, value, subtitle, color = "primary", trend }) {
  const configs = {
    primary: { text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20" },
    pink:    { text: "text-pink-600 dark:text-pink-400",  border: "border-pink-500/20" },
    green:   { text: "text-green-600 dark:text-green-400", border: "border-green-500/20" },
    amber:   { text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20" },
    red:     { text: "text-red-600 dark:text-red-400",   border: "border-red-500/20" },
  };
  const c = configs[color] || configs.primary;

  return (
    <div className={`stat-card border ${c.border} flex flex-col gap-4 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <span className={`text-[10px] font-black uppercase tracking-widest ${c.text}`}>{title}</span>
        {trend !== undefined && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
            trend >= 0 ? "bg-red-500/10 text-red-600 dark:text-red-400" : "bg-green-500/10 text-green-600 dark:text-green-400"
          }`}>
            {trend >= 0 ? "+" : "-"} {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div>
        <div className={`text-4xl font-black ${c.text} tracking-tight`}>{value}</div>
        {subtitle && <div className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-1.5 opacity-70">{subtitle}</div>}
      </div>
    </div>
  );
}

