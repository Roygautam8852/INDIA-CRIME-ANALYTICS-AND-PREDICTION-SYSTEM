import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchFilters, fetchModelMetrics, postPredict, postForecast } from "../api/crimeApi";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorCard from "../components/ErrorCard";
import { fmtK, fmtPct, CHART_COLORS } from "../utils/format";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend,
} from "recharts";
import toast from "react-hot-toast";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <p className="font-bold text-[var(--text-primary)] mb-2 text-[10px] uppercase tracking-widest">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="text-[10px] uppercase font-black">
          {p.name}: {p.name === "Weight" ? `${(p.value * 100).toFixed(3)}%` : fmtK(p.value)}
        </p>
      ))}
    </div>
  );
};

const MetricBar = ({ label, value, max = 100, color = "#3b82f6" }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="text-[var(--text-primary)]">{typeof value === "number" && value < 1 ? (value * 100).toFixed(1) + "%" : value}</span>
    </div>
    <div className="h-1 bg-white/5 rounded-full">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, (value / max) * 100)}%`, background: color }} />
    </div>
  </div>
);

export default function Prediction() {
  const [model, setModel] = useState("random_forest");
  const [form, setForm] = useState({
    Year: 2025,
    State_UT_Name: "Maharashtra",
    Region: "West",
    Zone: "Western",
    Crime_Category: "High",
    Development_Index: "High",
    Population_Lakhs: 1240,
    Area_SqKm: 307713,
    IPC_Crimes: 180000,
    SLL_Crimes: 50000,
    Crimes_Against_Women: 45000,
    Rape_Cases: 3000,
    Kidnapping_Cases: 4000,
    Dowry_Deaths: 300,
    Domestic_Violence: 8000,
    Cyber_Crimes: 12000,
    Murder_Sec302: 2500,
    Attempt_Murder: 3200,
    Robbery_Dacoity: 4500,
    Chargesheeting_Rate_Pct: 62,
    Conviction_Rate_Pct: 38,
    Police_Strength: 185000,
    Pct_Change_vs_PrevYear: 2.5,
  });
  const [result, setResult] = useState(null);
  const [forecast, setForecast] = useState(null);

  const { data: filters } = useQuery({
    queryKey: ["filters"],
    queryFn: fetchFilters,
    staleTime: Infinity,
  });

  const { data: metrics, isLoading: ml, error: me } = useQuery({
    queryKey: ["model-metrics"],
    queryFn: fetchModelMetrics,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const predictMutation = useMutation({
    mutationFn: postPredict,
    onSuccess: (data) => {
      if (data.success) {
        setResult(data);
        toast.success("Prediction complete!");
        forecastMutation.mutate({
          State_UT_Name: form.State_UT_Name,
          base_data: { ...form, model },
          years: [2026, 2027, 2028, 2029, 2030],
        });
      } else {
        toast.error(data.error || "Prediction failed");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const forecastMutation = useMutation({
    mutationFn: postForecast,
    onSuccess: (data) => {
      if (data.success) setForecast(data.forecast);
    },
  });

  const handleChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handlePredict = () => {
    predictMutation.mutate({ ...form, model });
  };

  const rfM = metrics?.models?.random_forest || {};
  const lrM = metrics?.models?.linear_regression || {};
  const fi = metrics?.feature_importance || {};
  const fiTop = Object.entries(fi).slice(0, 8).map(([k, v]) => ({ name: k.replace(/_enc$/, ""), importance: v }));

  const forecastData = forecast
    ? [
        { year: "Historical", predicted: result?.predicted_total_cognizable_crimes },
        ...forecast.map((f) => ({ year: String(f.year), predicted: f.predicted })),
      ]
    : [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Prediction Engine</h1>
        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Machine Learning Forecasting • Advanced Statistical Modeling</p>
      </div>

      {!ml && !me && metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 border border-primary-500/10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-400 mb-4">Random Forest Model</h3>
            <div className="space-y-4">
              <MetricBar label="Accuracy (R²)" value={rfM.r2 * 100} max={100} color="#3b82f6" />
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">
                <div className="flex-1">MAE: <span className="text-white">{fmtK(rfM.mae)}</span></div>
                <div className="flex-1">RMSE: <span className="text-white">{fmtK(rfM.rmse)}</span></div>
              <div className="flex-1 text-green-600 dark:text-green-500">SCORE: {(rfM.r2 * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border border-zinc-800">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Linear Regression Model</h3>
            <div className="space-y-4">
              <MetricBar label="Accuracy (R²)" value={lrM.r2 * 100} max={100} color="#52525b" />
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">
                <div className="flex-1">MAE: <span className="text-white">{fmtK(lrM.mae)}</span></div>
                <div className="flex-1">RMSE: <span className="text-white">{fmtK(lrM.rmse)}</span></div>
                <div className="flex-1">SCORE: {(lrM.r2 * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {me && (
        <div className="glass-card p-6 border border-red-500/20 bg-red-500/5">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">ML Service Unreachable</p>
          <p className="text-zinc-500 text-[10px] mt-1 font-bold uppercase">The prediction engine metrics are currently unavailable. Ensure the ML API server is running on port 5001.</p>
        </div>
      )}

      {ml && <LoadingSpinner />}

      {fiTop.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6">Parametric Weights</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={fiTop} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
              <XAxis type="number" stroke="#27272a" tick={{ fontSize: 10, fill: "#52525b" }} tickFormatter={(v) => `${(v * 100).toFixed(1)}%`} />
              <YAxis type="category" dataKey="name" stroke="#27272a" tick={{ fontSize: 10, fill: "#a1a1aa", textTransform: "uppercase" }} width={140} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Bar dataKey="importance" name="Weight" radius={[0, 4, 4, 0]}>
                {fiTop.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="glass-card p-6 border border-zinc-900">
        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6 h-auto">System Input Configuration</h3>
        <div className="flex gap-4 mb-8">
          {[
            { val: "random_forest", label: "Random Forest" },
            { val: "linear_regression", label: "Linear Regression" },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setModel(val)}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded transition-all border ${
                model === val ? "bg-white/5 border-white/20 text-white" : "border-transparent text-zinc-600 hover:text-zinc-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div>
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">System Year</label>
            <select value={form.Year} onChange={(e) => handleChange("Year", Number(e.target.value))} className="input-field uppercase">
              {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Target Entity</label>
            <select value={form.State_UT_Name} onChange={(e) => handleChange("State_UT_Name", e.target.value)} className="input-field uppercase">
              {(filters?.states || []).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Classification</label>
            <select value={form.Crime_Category} onChange={(e) => handleChange("Crime_Category", e.target.value)} className="input-field uppercase">
              {["Low","Moderate","High","Very High"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">Index Tier</label>
            <select value={form.Development_Index} onChange={(e) => handleChange("Development_Index", e.target.value)} className="input-field uppercase">
              {["Low","Medium","High","Very High"].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {/* Numeric fields simplified */}
          {[
            { key: "Population_Lakhs", label: "Population" },
            { key: "Area_SqKm", label: "Area SqKm" },
            { key: "IPC_Crimes", label: "IPC Volume" },
            { key: "SLL_Crimes", label: "SLL Volume" },
            { key: "Police_Strength", label: "Police Force" },
            { key: "Conviction_Rate_Pct", label: "Conviction %" },
            { key: "Chargesheeting_Rate_Pct", label: "Charge %" },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2 block">{label}</label>
              <input type="number" value={form[key]} onChange={(e) => handleChange(key, Number(e.target.value))} className="input-field uppercase" />
            </div>
          ))}
        </div>

        <button
          onClick={handlePredict}
          disabled={predictMutation.isPending}
          className="w-full bg-white text-black py-4 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors"
        >
          {predictMutation.isPending ? "Processing..." : "Execute Simulation"}
        </button>
      </div>

      {result && (
        <div className="glass-card p-8 border border-green-500/20 bg-green-500/5">
          <div className="flex flex-col gap-4">
            <div className="text-[10px] font-black text-green-500 uppercase tracking-widest">Predicted Systematic Outcome</div>
            <div className="text-6xl font-black text-[var(--text-primary)] tracking-tighter">{fmtK(result.predicted_total_cognizable_crimes)}</div>
            <div className="text-[10px] font-bold text-zinc-500 mt-2 uppercase tracking-widest">
              State: {result.input_features?.State_UT_Name} · 
              Tier: {result.input_features?.Crime_Category} · 
              Dataset: {result.model?.replace(/_/g," ").toUpperCase()}
            </div>
          </div>
        </div>
      )}

      {forecastData.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-6">Aggregate Forecast Matrix</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={forecastData}>
              <defs>
                <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="year" stroke="#27272a" tick={{ fontSize: 11, fill: "#52525b" }} />
              <YAxis stroke="#27272a" tick={{ fontSize: 10, fill: "#52525b" }} tickFormatter={fmtK} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Area type="monotone" dataKey="predicted" name="Forecast" stroke="#10b981" fill="url(#forecastGrad)" strokeWidth={2.5} dot={{ fill: "#10b981", r: 4 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
