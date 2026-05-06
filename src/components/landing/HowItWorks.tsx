import { UserPlus, Settings, LayoutDashboard } from 'lucide-react'

const steps = [
  {
    title: "Create Your Clinic",
    description: "Sign up and set up your clinic profile in less than 5 minutes.",
    icon: Settings,
    color: "text-blue-600",
    bgColor: "bg-blue-50"
  },
  {
    title: "Invite Your Staff",
    description: "Add doctors and assistants with specific roles and permissions.",
    icon: UserPlus,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50"
  },
  {
    title: "Start Managing",
    description: "Book appointments, manage patients, and grow your practice.",
    icon: LayoutDashboard,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50"
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3">Simple Setup</h2>
          <p className="text-4xl font-bold text-slate-900">Three steps to a better clinic</p>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -z-10"></div>

          <div className="grid lg:grid-cols-3 gap-12 lg:gap-20">
            {steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center text-center">
                <div className={`w-20 h-20 ${step.bgColor} ${step.color} rounded-3xl flex items-center justify-center mb-8 relative shadow-lg shadow-slate-100 ring-8 ring-white`}>
                  <step.icon className="w-10 h-10" />
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center font-bold border-4 border-white">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-600 max-w-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
