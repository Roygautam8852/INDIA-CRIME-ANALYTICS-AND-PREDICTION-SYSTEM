export default function LoadingSpinner({ text = "Loading data..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-4 border-primary-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 animate-spin" />
        <div className="absolute inset-2 rounded-full bg-primary-500/10 animate-pulse-soft" />
      </div>
      <p className="text-slate-400 text-sm font-medium animate-pulse-soft">{text}</p>
    </div>
  );
}
