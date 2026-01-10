import Hero from '@/components/Hero'
import BeforeAfterComparison from '@/components/BeforeAfterComparison'
import Benefits from '@/components/Benefits'
import HowItWorks from '@/components/HowItWorks'
import Pricing from '@/components/Pricing'
import Testimonials from '@/components/Testimonials'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <BeforeAfterComparison />
      <Benefits />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  )
}
