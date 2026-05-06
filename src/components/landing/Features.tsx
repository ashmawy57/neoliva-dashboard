import { 
  Users, 
  Calendar, 
  CreditCard, 
  BarChart3, 
  Package, 
  UserSquare2,
  ChevronRight
} from 'lucide-react'

const features = [
  {
    title: "Patient Management",
    description: "Detailed medical history, digital charts, and seamless communication channels.",
    icon: Users,
    color: "bg-blue-500",
    shadow: "shadow-blue-100"
  },
  {
    title: "Smart Appointments",
    description: "Intelligent scheduling with automated reminders to reduce no-shows.",
    icon: Calendar,
    color: "bg-indigo-500",
    shadow: "shadow-indigo-100"
  },
  {
    title: "Financial Control",
    description: "Automated invoicing, insurance tracking, and comprehensive financial reports.",
    icon: CreditCard,
    color: "bg-emerald-500",
    shadow: "shadow-emerald-100"
  },
  {
    title: "Advanced Analytics",
    description: "Track performance metrics, patient growth, and practice profitability in real-time.",
    icon: BarChart3,
    color: "bg-amber-500",
    shadow: "shadow-amber-100"
  },
  {
    title: "Inventory Tracking",
    description: "Real-time stock monitoring with automated low-stock alerts and supplier orders.",
    icon: Package,
    color: "bg-violet-500",
    shadow: "shadow-violet-100"
  },
  {
    title: "Staff Management",
    description: "Roles, permissions, schedules, and performance tracking for your entire team.",
    icon: UserSquare2,
    color: "bg-rose-500",
    shadow: "shadow-rose-100"
  }
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3">Powerful Capabilities</h2>
          <p className="text-4xl font-bold text-slate-900 mb-6">Everything you need to run <br /> a modern dental practice</p>
          <p className="text-slate-600 text-lg">Stop juggling multiple tools. SmileCare brings your entire practice under one roof with features built for clinicians.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-100 hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 ${feature.color} ${feature.shadow} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="text-white w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed mb-6">
                {feature.description}
              </p>
              <button className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:gap-2 transition-all">
                Learn more
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
