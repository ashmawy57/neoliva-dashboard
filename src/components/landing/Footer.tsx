import { Hospital, Globe, Mail, MessageSquare, Share2 } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-white pt-24 pb-12 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6 group">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <Hospital className="text-white w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">SmileCare</span>
            </Link>
            <p className="text-slate-500 max-w-sm leading-relaxed mb-8">
              The next generation of dental practice management. Building tools that help clinicians focus on what matters most: patient care.
            </p>
            <div className="flex gap-4">
              {[Globe, Mail, MessageSquare, Share2].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl flex items-center justify-center transition-all">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Product</h4>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">Features</Link></li>
              <li><Link href="#pricing" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">Pricing</Link></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">Demo</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">Updates</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">About</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">Careers</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">Blog</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Legal</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">Privacy</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">Terms</a></li>
              <li><a href="#" className="text-slate-500 hover:text-blue-600 transition-colors text-sm font-medium">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} SmileCare Inc. All rights reserved.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors">Terms of Service</a>
            <a href="#" className="text-slate-400 hover:text-slate-600 text-xs font-medium transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
