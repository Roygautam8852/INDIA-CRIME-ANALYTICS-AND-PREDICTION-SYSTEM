import { useQuery } from "@tanstack/react-query";
import { fetchOverview, fetchTrends } from "../api/crimeApi";
import { useFilters } from "../context/FilterContext";
import StatCard from "../components/StatCard";
import GlobalFilters from "../components/GlobalFilters";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorCard from "../components/ErrorCard";
import { fmt, fmtK, CHART_COLORS } from "../utils/format";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="font-bold text-[var(--text-primary)] mb-2 uppercase tracking-widest text-[10px]">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-xs">
          {p.name}: <span className="font-bold">{fmtK(p.value)}</span>
        </p>
      ))}
    </div>
  );
};

const InsightCard = ({ insight, color = "blue" }) => {
  const configs = {
    blue:  "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-300",
    pink:  "border-pink-500/30 bg-pink-500/5 text-pink-600 dark:text-pink-300",
    amber: "border-amber-400/30 bg-amber-400/5 text-amber-600 dark:text-amber-300",
    green: "border-green-400/30 bg-green-400/5 text-green-600 dark:text-green-300",
  };
  return (
    <div className={`glass-card p-4 border ${configs[color]} text-xs leading-relaxed uppercase tracking-wide font-black`}>
      {insight}
    </div>
  );
};

export default function Dashboard() {
  const { selectedYear, selectedState, selectedRegion, selectedZone } = useFilters();

  const params = {};
  if (selectedYear)   params.year = selectedYear;
  if (selectedState)  params.state = selectedState;
  if (selectedRegion) params.region = selectedRegion;
  if (selectedZone)   params.zone = selectedZone;

  const trendParams = { ...params };
  delete trendParams.year;

  const { data: overview, isLoading: ol, error: oe, refetch: or } = useQuery({
    queryKey: ["overview", params],
    queryFn: () => fetchOverview(params),
    staleTime: 5 * 60 * 1000,
  });

  const { data: trends, isLoading: tl, error: te, refetch: tr } = useQuery({
    queryKey: ["trends", trendParams],
    queryFn: () => fetchTrends(trendParams),
    staleTime: 5 * 60 * 1000,
  });

  if (ol || tl) return <LoadingSpinner text="Loading dashboard..." />;
  if (oe || te) return <ErrorCard message={oe?.message || te?.message} onRetry={() => { or(); tr(); }} />;

  const s = overview?.summary || {};
  const yearlyTrend = trends?.data || [];

  const lastYear = yearlyTrend[yearlyTrend.length - 1] || {};
  const crimeTypePie = [
    { name: "IPC Crimes",   value: lastYear.totalIPC        || 0 },
    { name: "SLL Crimes",   value: lastYear.totalSLL        || 0 },
    { name: "Women Crimes", value: lastYear.totalWomen      || 0 },
    { name: "Cyber Crimes", value: lastYear.totalCyber      || 0 },
    { name: "Murder",       value: lastYear.totalMurder     || 0 },
    { name: "Kidnapping",   value: lastYear.totalKidnapping || 0 },
  ].filter((d) => d.value > 0);

  const latestTrend = yearlyTrend.slice(-2);
  const trendChange = latestTrend.length === 2
    ? (((latestTrend[1].totalCognizable - latestTrend[0].totalCognizable) / latestTrend[0].totalCognizable) * 100).toFixed(1)
    : null;

  const topCyberYear = [...yearlyTrend].sort((a, b) => b.totalCyber - a.totalCyber)[0];
  const peakYear = [...yearlyTrend].sort((a, b) => b.totalCognizable - a.totalCognizable)[0];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter">
            Crime Pattern Prediction System
          </h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
            National Dataset • Statistical Overview • 2016–2025
          </p>
        </div>
        <GlobalFilters />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Cognizable" value={fmtK(s.totalCognizableCrimes)} subtitle="All recorded crimes" color="primary" />
        <StatCard title="IPC Crimes" value={fmtK(s.totalIPCCrimes)} subtitle="Indian Penal Code" color="amber" />
        <StatCard title="Women Crimes" value={fmtK(s.totalWomenCrimes)} subtitle="Crimes against women" color="pink" />
        <StatCard title="Cyber Crimes" value={fmtK(s.totalCyberCrimes)} subtitle="Digital offences" color="green" />
        <StatCard title="Avg Crime Rate" value={`${s.avgCrimeRate}`} subtitle="Per 1 lakh population" color="red" />
        <StatCard title="Conviction Rate" value={`${s.avgConvictionRate}%`} subtitle="Nationwide average" color="green" />
        <StatCard title="States / UTs" value={s.stateCount || "0"} subtitle="Covered in dataset" color="primary" />
        <StatCard title="Years Covered" value={s.yearCount || "0"} subtitle="Selected range" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6">Yearly Crime Trend</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={yearlyTrend}>
              <defs>
                <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="grad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" stroke="#27272a" tick={{ fontSize: 11, fill: "#52525b" }} />
              <YAxis stroke="#27272a" tick={{ fontSize: 10, fill: "#52525b" }} tickFormatter={fmtK} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#52525b", paddingTop: "10px" }} />
              <Area type="monotone" dataKey="totalCognizable" name="Total Crimes" stroke="#3b82f6" fill="url(#grad1)" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} />
              <Area type="monotone" dataKey="totalWomen"      name="Women Crimes" stroke="#ec4899" fill="url(#grad2)" strokeWidth={2} dot={{ fill: "#ec4899", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6">Crime Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={crimeTypePie} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3}>
                {crimeTypePie.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmtK(v)} cursor={false} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#94a3b8" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6">Trend Categories</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={yearlyTrend} barGap={6}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" stroke="#27272a" tick={{ fontSize: 11, fill: "#52525b" }} />
            <YAxis stroke="#27272a" tick={{ fontSize: 10, fill: "#52525b" }} tickFormatter={fmtK} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Legend wrapperStyle={{ fontSize: "11px", color: "#52525b", paddingTop: "10px" }} />
            <Bar dataKey="totalCyber"      name="Cyber"      fill="#10b981" radius={[4,4,0,0]} />
            <Bar dataKey="totalMurder"     name="Murder"     fill="#ef4444" radius={[4,4,0,0]} />
            <Bar dataKey="totalKidnapping" name="Kidnapping" fill="#f59e0b" radius={[4,4,0,0]} />
            <Bar dataKey="totalRape"       name="Rape"       fill="#8b5cf6" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest pl-1">Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {trendChange && (
            <InsightCard insight={`Total crimes ${trendChange > 0 ? "increased" : "decreased"} by ${Math.abs(trendChange)}% YoY.`} color={trendChange > 0 ? "pink" : "green"} />
          )}
          {peakYear && (
            <InsightCard insight={`Peak year identified as ${peakYear.year} with ${fmtK(peakYear.totalCognizable)} cases.`} color="amber" />
          )}
          {topCyberYear && (
            <InsightCard insight={`Cyber crimes peaked in ${topCyberYear.year} at ${fmtK(topCyberYear.totalCyber)}.`} color="blue" />
          )}
          <InsightCard insight={`National conviction average stands at ${s.avgConvictionRate}%.`} color="green" />
        </div>
      </div>

      {overview?.topCrimeStates?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6">Top Crime States</h3>
            <div className="space-y-4">
              {overview.topCrimeStates.map((s, i) => {
                const max = overview.topCrimeStates[0].total;
                const pct = (s.total / max) * 100;
                return (
                  <div key={s.state} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                      <span className="text-[var(--text-primary)]">
                        <span className="text-[var(--text-muted)] mr-2">{i + 1}</span>{s.state}
                      </span>
                      <span className="text-[var(--text-muted)]">{fmtK(s.total)}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="glass-card p-6">
            <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6">Women Crime Ranking</h3>
            <div className="space-y-4">
              {overview.topWomenCrimeStates.map((s, i) => {
                const max = overview.topWomenCrimeStates[0].total;
                const pct = (s.total / max) * 100;
                return (
                  <div key={s.state} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider">
                      <span className="text-[var(--text-primary)]">
                        <span className="text-[var(--text-muted)] mr-2">{i + 1}</span>{s.state}
                      </span>
                      <span className="text-[var(--text-muted)]">{fmtK(s.total)}</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full transition-all duration-700" style={{ width: `${pct}%`, background: "#ec4899" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
