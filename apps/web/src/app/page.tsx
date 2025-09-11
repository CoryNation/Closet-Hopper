import Hero from '@/components/Hero'
import HowItWorks from '@/components/HowItWorks'
import WhyClosetHopper from '@/components/WhyClosetHopper'
import FounderStory from '@/components/FounderStory'
import Pricing from '@/components/Pricing'
import FAQ from '@/components/FAQ'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <HowItWorks />
      <WhyClosetHopper />
      <FounderStory />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  )
}
