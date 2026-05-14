'use client'

import { useState, useEffect } from 'react'
import { Hospital, Menu, X } from 'lucide-react'
import Link from 'next/link'

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md border-b border-slate-100 py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
              <Hospital className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">SmileCare</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Features</Link>
            <Link href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">How it Works</Link>
            <Link href="#pricing" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Pricing</Link>
            <div className="h-6 w-px bg-slate-200"></div>
            <Link 
              href="/staff/sign-in" 
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Staff Sign In
            </Link>
            <Link 
              href="/signup" 
              className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Staff Signup
            </Link>
            <Link 
              href="/login" 
              className="text-sm font-semibold text-slate-900 hover:text-blue-600 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/create-clinic" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-100 active:scale-95"
            >
              Register Clinic
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 py-6 space-y-4 animate-in slide-in-from-top duration-300">
          <Link href="#features" className="block text-base font-medium text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
          <Link href="#how-it-works" className="block text-base font-medium text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>How it Works</Link>
          <Link href="#pricing" className="block text-base font-medium text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
          <hr className="border-slate-100" />
          <Link href="/staff/sign-in" className="block text-base font-medium text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Staff Sign In</Link>
          <Link href="/signup" className="block text-base font-medium text-slate-600" onClick={() => setIsMobileMenuOpen(false)}>Staff Signup</Link>
          <Link href="/login" className="block text-base font-semibold text-slate-900" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
          <Link 
            href="/create-clinic" 
            className="block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold text-center shadow-lg shadow-blue-100"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Register Clinic
          </Link>
        </div>
      )}
    </nav>
  )
}
