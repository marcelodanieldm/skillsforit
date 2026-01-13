import EbookHero from '@/components/ebook/EbookHero'
import EbookIndex from '@/components/ebook/EbookIndex'
import EbookSocialProof from '@/components/ebook/EbookSocialProof'
import EbookCTA from '@/components/ebook/EbookCTA'
import Footer from '@/components/Footer'

export default function EbookPage() {
  return (
    <main className="min-h-screen">
      <EbookHero />
      <EbookIndex />
      <EbookSocialProof />
      <EbookCTA />
      <Footer />
    </main>
  )
}