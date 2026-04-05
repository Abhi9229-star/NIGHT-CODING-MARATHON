const SkeletonCard = () => (
  <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_70px_-42px_rgba(15,23,42,0.4)] backdrop-blur-xl animate-pulse">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-2xl bg-slate-200" />
        <div className="space-y-3">
          <div className="h-4 w-52 rounded-full bg-slate-200" />
          <div className="h-3 w-32 rounded-full bg-slate-100" />
        </div>
      </div>
      <div className="h-10 w-24 rounded-full bg-slate-100" />
    </div>
    <div className="mt-6 space-y-3">
      <div className="h-3 w-full rounded-full bg-slate-100" />
      <div className="h-3 w-5/6 rounded-full bg-slate-100" />
      <div className="h-3 w-3/4 rounded-full bg-slate-100" />
    </div>
  </div>
);

export default SkeletonCard;
