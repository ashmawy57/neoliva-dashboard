import { Navbar } from "@/components/landing/Navbar"
import { Hero } from "@/components/landing/Hero"
import { Features } from "@/components/landing/Features"
import { HowItWorks } from "@/components/landing/HowItWorks"
import { Stats } from "@/components/landing/Stats"
import { Pricing } from "@/components/landing/Pricing"
import { Footer } from "@/components/landing/Footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
