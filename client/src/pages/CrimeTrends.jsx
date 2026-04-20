import { useQuery } from "@tanstack/react-query";
import { fetchTrends } from "../api/crimeApi";
import { useFilters } from "../context/FilterContext";
import GlobalFilters from "../components/GlobalFilters";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorCard from "../components/ErrorCard";
import { fmtK, CHART_COLORS } from "../utils/format";
import {
  LineChart, Line, BarChart, Bar, ComposedChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="font-bold text-white mb-2 text-[10px] uppercase tracking-widest">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wide">
          <span style={{ color: p.color }}>{p.name}:</span>
          <span className="text-white">{fmtK(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const TrendBadge = ({ label, current, prev }) => {
  if (!current || !prev) return null;
  const change = (((current - prev) / prev) * 100).toFixed(1);
  const up = change > 0;
  return (
    <div className="glass-card p-4 flex flex-col gap-2">
      <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{label}</div>
      <div className="flex items-end justify-between">
        <div className="text-xl font-black text-white">{fmtK(current)}</div>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${up ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-500"}`}>
          {up ? "+" : "-"} {Math.abs(change)}%
        </span>
      </div>
    </div>
  );
};

export default function CrimeTrends() {
  const { selectedState, selectedRegion, selectedZone, selectedYear } = useFilters();
  const params = {};
  if (selectedState)  params.state  = selectedState;
  if (selectedRegion) params.region = selectedRegion;
  if (selectedZone)   params.zone   = selectedZone;

  // For badges/stats, we use the selected year if available, 
  // but the trend chart should always show the full range for the selected geography.
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["trends", params],
    queryFn: () => fetchTrends(params),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <LoadingSpinner text="Loading trends..." />;
  if (error) return <ErrorCard message={error.message} onRetry={refetch} />;

  const trends = data?.data || [];
  
  // If a year is selected, find THAT year's data for the badges. 
  // Otherwise use the last available year.
  const last = selectedYear 
    ? trends.find(t => t.year === Number(selectedYear)) || trends[trends.length - 1] || {}
    : trends[trends.length - 1] || {};
  
  const secondLast = selectedYear
    ? trends.find(t => t.year === Number(selectedYear) - 1) || {}
    : trends[trends.length - 2] || {};

  const jstData = trends.map((t) => ({
    year: t.year,
    Conviction: t.avgConviction,
    Chargesheeting: t.avgChargesheeting,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Temporal Trends</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Yearly Crime Trajectories • Justice Pipeline Analytics</p>
        </div>
        <GlobalFilters />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TrendBadge label="Total Crimes" current={last.totalCognizable} prev={secondLast.totalCognizable} />
        <TrendBadge label="Women Crimes" current={last.totalWomen}      prev={secondLast.totalWomen} />
        <TrendBadge label="Cyber Crimes" current={last.totalCyber}      prev={secondLast.totalCyber} />
        <TrendBadge label="Murder"       current={last.totalMurder}     prev={secondLast.totalMurder} />
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6">Aggregate Trajectories</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" stroke="#27272a" tick={{ fontSize: 11, fill: "#52525b" }} />
            <YAxis stroke="#27272a" tick={{ fontSize: 10, fill: "#52525b" }} tickFormatter={fmtK} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Legend wrapperStyle={{ fontSize: "11px", color: "#52525b", paddingTop: "10px", textTransform: "uppercase" }} />
            <Line type="monotone" dataKey="totalCognizable" name="Total" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="totalWomen"      name="Women" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="totalCyber"      name="Cyber" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="totalMurder"     name="Murder" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="totalKidnapping" name="Kidnap" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6 px-1">IPC vs SLL Split</h3>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={trends}>
              <defs>
                <linearGradient id="ipcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="sllGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" stroke="#27272a" tick={{ fontSize: 11, fill: "#52525b" }} />
              <YAxis stroke="#27272a" tick={{ fontSize: 10, fill: "#52525b" }} tickFormatter={fmtK} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#52525b", textTransform: "uppercase" }} />
              <Area type="monotone" dataKey="totalIPC" name="IPC" fill="url(#ipcGrad)" stroke="#3b82f6" strokeWidth={2} />
              <Area type="monotone" dataKey="totalSLL" name="SLL" fill="url(#sllGrad)" stroke="#f59e0b" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6 px-1">Case Disposals</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={jstData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" stroke="#27272a" tick={{ fontSize: 11, fill: "#52525b" }} />
              <YAxis stroke="#27272a" tick={{ fontSize: 10, fill: "#52525b" }} unit="%" domain={[0, 100]} />
              <Tooltip formatter={(v) => `${v}%`} cursor={false} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#52525b", textTransform: "uppercase" }} />
              <Line type="monotone" dataKey="Conviction"     stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Chargesheeting" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
