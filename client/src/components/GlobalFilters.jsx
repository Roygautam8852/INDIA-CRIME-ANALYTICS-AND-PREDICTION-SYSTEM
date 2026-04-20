import { useFilters } from "../context/FilterContext";
import { useQuery } from "@tanstack/react-query";
import { fetchFilters } from "../api/crimeApi";

export default function GlobalFilters() {
  const { 
    selectedYear, setSelectedYear, 
    selectedState, setSelectedState, 
    selectedRegion, setSelectedRegion,
    selectedZone, setSelectedZone
  } = useFilters();
  const { data } = useQuery({ queryKey: ["filters"], queryFn: fetchFilters, staleTime: Infinity });

  const hasActive = selectedYear || selectedState || selectedRegion || selectedZone;

  const resetAll = () => {
    setSelectedYear("");
    setSelectedState("");
    setSelectedRegion("");
    setSelectedZone("");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 text-zinc-600 text-[10px] font-black uppercase tracking-widest px-1">
        Filters
      </div>

      {/* Year */}
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(e.target.value)}
        className="input-field w-auto min-w-[100px] text-[11px] font-bold uppercase tracking-wider"
      >
        <option value="">Year</option>
        {(data?.years || []).map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {/* State */}
      <select
        value={selectedState}
        onChange={(e) => setSelectedState(e.target.value)}
        className="input-field w-auto min-w-[140px] text-[11px] font-bold uppercase tracking-wider"
      >
        <option value="">State</option>
        {(data?.states || []).map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Region */}
      <select
        value={selectedRegion}
        onChange={(e) => setSelectedRegion(e.target.value)}
        className="input-field w-auto min-w-[130px] text-[11px] font-bold uppercase tracking-wider"
      >
        <option value="">Region</option>
        {(data?.regions || []).map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      {/* Zone */}
      <select
        value={selectedZone}
        onChange={(e) => setSelectedZone(e.target.value)}
        className="input-field w-auto min-w-[130px] text-[11px] font-bold uppercase tracking-wider"
      >
        <option value="">Zone</option>
        {(data?.zones || []).map((z) => (
          <option key={z} value={z}>{z}</option>
        ))}
      </select>

      {hasActive && (
        <button
          onClick={resetAll}
          className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all font-bold"
        >
          Reset
        </button>
      )}
    </div>
  );
}
