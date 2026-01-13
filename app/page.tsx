import Hero from '@/components/Hero'
import BeforeAfterComparison from '@/components/BeforeAfterComparison'
import Benefits from '@/components/Benefits'
import HowItWorks from '@/components/HowItWorks'
import Pricing from '@/components/Pricing'
import Testimonials from '@/components/Testimonials'
import CTA from '@/components/CTA'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import FloatingAuthButton from '@/components/FloatingAuthButton'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <FloatingAuthButton />
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
