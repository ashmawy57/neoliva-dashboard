export default function RouteLoading({ title = "Loading content..." }: { title?: string }) {
  return (
    <div className="flex flex-col gap-8 p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-xl" />
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 bg-slate-200 rounded-md" />
            <div className="h-4 w-32 bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-white border border-slate-100 rounded-2xl shadow-sm" />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="h-[400px] bg-white border border-slate-100 rounded-3xl w-full" />
      
      <p className="text-center text-xs text-slate-400 font-medium animate-pulse">
        {title}
      </p>
    </div>
  );
}
