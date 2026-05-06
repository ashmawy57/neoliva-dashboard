import { Check } from 'lucide-react'

const plans = [
  {
    name: "Basic",
    price: "49",
    description: "Perfect for single-doctor practices just getting started.",
    features: [
      "Up to 1,000 patients",
      "Full appointment scheduling",
      "Basic reporting",
      "Email support",
      "Single clinic access"
    ],
    cta: "Start Free Trial",
    popular: false
  },
  {
    name: "Professional",
    price: "99",
    description: "Advanced tools for growing multi-doctor clinics.",
    features: [
      "Unlimited patients",
      "AI treatment planning",
      "Advanced financial analytics",
      "Inventory management",
      "Priority 24/7 support",
      "Custom branding"
    ],
    cta: "Get Started",
    popular: true
  }
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-blue-600 font-bold tracking-wider uppercase text-sm mb-3">Simple Pricing</h2>
          <p className="text-4xl font-bold text-slate-900 mb-6">Choose the right plan for <br /> your practice</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-[2.5rem] p-10 border-2 transition-all duration-300 ${
                plan.popular 
                  ? 'border-blue-500 shadow-2xl shadow-blue-100 scale-105 z-10' 
                  : 'border-slate-100 shadow-xl shadow-slate-200/50 hover:border-blue-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-200">
                  Most Popular
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-extrabold text-slate-900">${plan.price}</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center gap-3 text-slate-600 font-medium">
                    <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 px-6 rounded-2xl font-bold transition-all active:scale-[0.98] ${
                plan.popular 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100' 
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
