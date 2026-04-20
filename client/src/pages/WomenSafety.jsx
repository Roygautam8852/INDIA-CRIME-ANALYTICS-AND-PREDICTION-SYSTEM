import { useQuery } from "@tanstack/react-query";
import { fetchWomenSafety, fetchTrends } from "../api/crimeApi";
import { useFilters } from "../context/FilterContext";
import GlobalFilters from "../components/GlobalFilters";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorCard from "../components/ErrorCard";
import StatCard from "../components/StatCard";
import { fmtK, CHART_COLORS } from "../utils/format";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, Legend, PieChart, Pie,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="font-bold text-[var(--text-primary)] mb-2 text-[10px] uppercase tracking-widest">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-[10px] font-black uppercase tracking-wide">
          {p.name}: {fmtK(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function WomenSafety() {
  const { selectedYear, selectedState, selectedRegion, selectedZone } = useFilters();
  const params = {};
  if (selectedYear)   params.year = selectedYear;
  if (selectedState)  params.state = selectedState;
  if (selectedRegion) params.region = selectedRegion;
  if (selectedZone)   params.zone = selectedZone;

  const trendParams = { ...params };
  delete trendParams.year; // Trends usually show all years

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["women", params],
    queryFn: () => fetchWomenSafety(params),
    staleTime: 5 * 60 * 1000,
  });

  const { data: trends } = useQuery({
    queryKey: ["trends", trendParams],
    queryFn: () => fetchTrends(trendParams),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <LoadingSpinner text="Loading data..." />;
  if (error) return <ErrorCard message={error.message} onRetry={refetch} />;

  const states = data?.data || [];
  const top10 = states.slice(0, 10);
  const totalWomen = states.reduce((s, d) => s + d.totalWomen, 0);
  const totalRape = states.reduce((s, d) => s + d.totalRape, 0);
  const totalKidnapping = states.reduce((s, d) => s + d.totalKidnapping, 0);
  const totalDowry = states.reduce((s, d) => s + d.totalDowry, 0);
  const totalDomestic = states.reduce((s, d) => s + d.totalDomestic, 0);

  const trendData = trends?.data || [];
  const womenTrend = trendData.map((t) => ({
    year: t.year, Women: t.totalWomen, Rape: t.totalRape, Kidnapping: t.totalKidnapping, Dowry: t.totalDowry,
  }));

  const pieData = [
    { name: "Rape",            value: totalRape },
    { name: "Kidnapping",      value: totalKidnapping },
    { name: "Dowry Deaths",    value: totalDowry },
    { name: "Domestic Violence", value: totalDomestic },
    { name: "Other",           value: Math.max(0, totalWomen - totalRape - totalKidnapping - totalDowry - totalDomestic) },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Gender Safety</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Analytical Insights • Crime Against Women • National Dataset</p>
        </div>
        <GlobalFilters />
      </div>

      <div className="glass-card p-4 border border-zinc-800 bg-zinc-900/10">
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
          Notice: Reporting Gaps Exist. Figures reflect documented cases only.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Women Crimes" value={fmtK(totalWomen)} color="pink" />
        <StatCard title="Rape Cases" value={fmtK(totalRape)} color="red" />
        <StatCard title="Kidnapping" value={fmtK(totalKidnapping)} color="amber" />
        <StatCard title="Dowry Deaths" value={fmtK(totalDowry)} color="red" />
        <StatCard title="Domestic Violence" value={fmtK(totalDomestic)} color="pink" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6">Regional Impact</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={top10} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="#27272a" tick={{ fontSize: 10, fill: "#52525b" }} tickFormatter={fmtK} />
              <YAxis type="category" dataKey="state" stroke="#27272a" tick={{ fontSize: 10, fill: "#a1a1aa" }} width={120} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="totalWomen" name="Women Crimes" radius={[0,4,4,0]}>
                {top10.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#ef4444" : "#ec4899"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6 px-1">Sub-Category Split</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} paddingAngle={3}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={["#ef4444","#f59e0b","#ec4899","#8b5cf6","#3f3f46"][i % 5]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmtK(v)} cursor={false} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: "11px", color: "#52525b", textTransform: "uppercase" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6 px-1">Yearly Progression</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={womenTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="year" stroke="#27272a" tick={{ fontSize: 11, fill: "#52525b" }} />
            <YAxis stroke="#27272a" tick={{ fontSize: 10, fill: "#52525b" }} tickFormatter={fmtK} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Legend wrapperStyle={{ fontSize: "11px", color: "#52525b", paddingTop: "10px", textTransform: "uppercase" }} />
            <Line type="monotone" dataKey="Women"      stroke="#ec4899" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Rape"       stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Kidnapping" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Dowry"      stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-6 overflow-x-auto">
        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6 px-1">Ranked Matrix</h3>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              {["Rank", "State", "Region", "Total", "Rape", "Kidnap", "Dowry", "Domestic"].map((h) => (
                <th key={h} className="text-left py-3 px-3 text-zinc-500 font-black uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {states.slice(0, 20).map((s, i) => (
              <tr key={s.state} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="py-2.5 px-3 font-black text-zinc-700">{i + 1}</td>
                <td className="py-2.5 px-3 text-[var(--text-primary)] font-black uppercase tracking-wide">{s.state}</td>
                <td className="py-2.5 px-3 text-zinc-600 font-bold uppercase tracking-widest">{s.region}</td>
                <td className="py-2.5 px-3 text-accent-500 font-black tracking-tight">{fmtK(s.totalWomen)}</td>
                <td className="py-2.5 px-3 text-red-500 font-bold">{fmtK(s.totalRape)}</td>
                <td className="py-2.5 px-3 text-amber-500">{fmtK(s.totalKidnapping)}</td>
                <td className="py-2.5 px-3 text-zinc-400">{fmtK(s.totalDowry)}</td>
                <td className="py-2.5 px-3 text-zinc-400">{fmtK(s.totalDomestic)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
