import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchStates } from "../api/crimeApi";
import { useFilters } from "../context/FilterContext";
import GlobalFilters from "../components/GlobalFilters";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorCard from "../components/ErrorCard";
import { fmt, fmtK, fmtPct, CHART_COLORS } from "../utils/format";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="font-bold text-[var(--text-primary)] mb-2 text-xs uppercase tracking-wider">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-[10px] font-bold uppercase tracking-wide">
          {p.name}: {fmtK(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function StateAnalysis() {
  const { selectedYear, selectedState, selectedRegion, selectedZone } = useFilters();
  const [search, setSearch] = useState("");
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");
  const [metric, setMetric] = useState("totalCognizable");

  const params = {};
  if (selectedYear)   params.year = selectedYear;
  if (selectedState)  params.state = selectedState;
  if (selectedRegion) params.region = selectedRegion;
  if (selectedZone)   params.zone = selectedZone;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["states", params],
    queryFn: () => fetchStates(params),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <LoadingSpinner text="Loading state data..." />;
  if (error) return <ErrorCard message={error.message} onRetry={refetch} />;

  const states = (data?.data || []).filter((s) =>
    s.state.toLowerCase().includes(search.toLowerCase())
  );

  const metricOptions = [
    { value: "totalCognizable",  label: "Total Crimes" },
    { value: "avgCrimeRate",     label: "Crime Rate/1L" },
    { value: "avgWomenCrimes",   label: "Women Crimes" },
    { value: "totalCyber",       label: "Cyber Crimes" },
    { value: "totalMurder",      label: "Murder" },
    { value: "avgConviction",    label: "Conviction %" },
    { value: "avgChargesheeting", label: "Chargesheeting %" },
  ];

  const top10 = [...states]
    .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
    .slice(0, 10);

  const stateA = data?.data?.find((s) => s.state === compareA);
  const stateB = data?.data?.find((s) => s.state === compareB);
  const radarData = stateA && stateB
    ? [
        { subject: "Total Crimes",  A: stateA.totalCognizable || 0, B: stateB.totalCognizable || 0 },
        { subject: "Crime Rate",    A: stateA.avgCrimeRate    || 0, B: stateB.avgCrimeRate    || 0 },
        { subject: "Women Crimes",  A: stateA.avgWomenCrimes  || 0, B: stateB.avgWomenCrimes  || 0 },
        { subject: "Cyber Crimes",  A: stateA.totalCyber      || 0, B: stateB.totalCyber      || 0 },
        { subject: "Murder",        A: stateA.totalMurder     || 0, B: stateB.totalMurder     || 0 },
        { subject: "Conviction %",  A: stateA.avgConviction   || 0, B: stateB.avgConviction   || 0 },
      ]
    : [];

  const allStates = (data?.data || []).map((s) => s.state).sort();

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">State Analytics</h1>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Regional Crime Comparisons • Interactive Map Data</p>
        </div>
        <GlobalFilters />
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="SEARCH STATE"
          className="input-field w-56 text-[10px] font-bold uppercase tracking-widest"
        />
        <select value={metric} onChange={(e) => setMetric(e.target.value)} className="input-field w-auto min-w-[200px] text-[10px] font-bold uppercase tracking-widest">
          {metricOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label.toUpperCase()}</option>
          ))}
        </select>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6 px-1">
          Top 10 : {metricOptions.find((o) => o.value === metric)?.label}
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={top10} layout="vertical" barSize={16}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
            <XAxis type="number" stroke="#27272a" tick={{ fontSize: 10, fill: "#52525b" }} tickFormatter={fmtK} />
            <YAxis type="category" dataKey="state" stroke="#27272a" tick={{ fontSize: 10, fill: "#a1a1aa" }} width={130} />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Bar dataKey={metric} name={metricOptions.find((o) => o.value === metric)?.label} radius={[0, 4, 4, 0]}>
              {top10.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6 px-1">Comparison Engine</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <select value={compareA} onChange={(e) => setCompareA(e.target.value)} className="input-field w-auto min-w-[200px] text-[10px] font-bold uppercase tracking-widest">
            <option value="">SELECT STATE A</option>
            {allStates.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={compareB} onChange={(e) => setCompareB(e.target.value)} className="input-field w-auto min-w-[200px] text-[10px] font-bold uppercase tracking-widest">
            <option value="">SELECT STATE B</option>
            {allStates.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {radarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={radarData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-color)" vertical={false} />
              <XAxis dataKey="subject" stroke="#27272a" tick={{ fontSize: 10, fill: "#52525b" }} />
              <YAxis stroke="#27272a" tick={{ fontSize: 10, fill: "#52525b" }} tickFormatter={fmtK} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
              <Legend wrapperStyle={{ fontSize: "11px", color: "#52525b", textTransform: "uppercase", paddingTop: "20px" }} />
              <Bar name={compareA} dataKey="A" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar name={compareB} dataKey="B" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center text-zinc-600 py-20 text-[10px] font-black uppercase tracking-[0.2em]">
            Select Two Entities To Compare
          </div>
        )}
      </div>

      <div className="glass-card p-6 overflow-x-auto">
        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6 px-1">Crime Matrix</h3>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-[var(--border-subtle)]">
              {["State", "Region", "Zone", "Rate", "IPC", "SLL", "Total", "Women", "Cyber", "Conv%"].map((h) => (
                <th key={h} className="text-left py-3 px-3 text-zinc-500 font-black uppercase tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {states.map((s) => (
              <tr key={s.state} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="py-2.5 px-3 text-[var(--text-primary)] font-black uppercase tracking-wide">{s.state}</td>
                <td className="py-2.5 px-3 text-zinc-500 font-bold uppercase tracking-widest">{s.region}</td>
                <td className="py-2.5 px-3 text-zinc-500">{s.zone}</td>
                <td className="py-2.5 px-3 text-amber-500 font-black">{s.avgCrimeRate}</td>
                <td className="py-2.5 px-3 text-zinc-400">{fmtK(s.totalIPC)}</td>
                <td className="py-2.5 px-3 text-zinc-400">{fmtK(s.totalSLL)}</td>
                <td className="py-2.5 px-3 text-primary-500 font-black tracking-tight">{fmtK(s.totalCognizable)}</td>
                <td className="py-2.5 px-3 text-accent-500">{fmtK(s.avgWomenCrimes)}</td>
                <td className="py-2.5 px-3 text-green-500">{fmtK(s.totalCyber)}</td>
                <td className="py-2.5 px-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${s.avgConviction >= 50 ? "bg-green-500/10 text-green-500" : s.avgConviction >= 30 ? "bg-amber-500/10 text-amber-500" : "bg-red-500/10 text-red-500"}`}>
                    {fmtPct(s.avgConviction)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
