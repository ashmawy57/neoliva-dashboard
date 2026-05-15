export default function PatientProfileLoading() {
  return (
    <div className="flex flex-col gap-8 p-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
          <div className="flex flex-col gap-2">
            <div className="h-6 w-48 bg-slate-200 rounded-md" />
            <div className="h-4 w-24 bg-slate-100 rounded-md" />
          </div>
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-xl" />
      </div>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-white border border-slate-100 rounded-2xl shadow-sm" />
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="h-12 w-full bg-slate-100 rounded-xl" />

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-[500px] bg-white border border-slate-100 rounded-3xl" />
        <div className="h-[500px] bg-white border border-slate-100 rounded-3xl" />
      </div>
    </div>
  );
}
