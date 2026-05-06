const stats = [
  { label: "Active Clinics", value: "500+" },
  { label: "Patients Managed", value: "1.2M+" },
  { label: "Appointments Daily", value: "25k+" },
  { label: "Support Rating", value: "4.9/5" }
]

export function Stats() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-12 lg:p-20 shadow-2xl shadow-blue-200 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-extrabold text-white mb-3 tracking-tight">{stat.value}</div>
                <div className="text-blue-100 font-medium text-sm lg:text-base uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
