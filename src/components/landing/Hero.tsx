import { ArrowRight, Play, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[120px] opacity-50 animate-pulse"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[100px] opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            New: AI-Powered Treatment Planning
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Run Your Dental Clinic <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Smarter, Not Harder
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            The all-in-one management platform designed specifically for modern dental practices. 
            Automate your workflow, delight your patients, and grow your revenue.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Link 
              href="/create-clinic" 
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-200 hover:shadow-blue-300 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <Play className="w-4 h-4 fill-current" />
              </div>
              Book a Demo
            </button>
          </div>

          <div className="mt-12 flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-sm font-medium text-slate-500 animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              14-day free trial
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
