export default function ErrorCard({ message, onRetry }) {
  return (
    <div className="glass-card border border-red-500/20 bg-red-500/5 p-12 flex flex-col items-center gap-6 text-center">
      <div className="flex flex-col gap-2">
        <p className="text-red-500 font-black text-xs uppercase tracking-widest">System Error</p>
        <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">{message || "Failed to load data"}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="btn-secondary text-[10px] font-black uppercase tracking-[0.2em] py-3 px-8 border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all"
        >
          Retry Simulation
        </button>
      )}
    </div>
  );
}
