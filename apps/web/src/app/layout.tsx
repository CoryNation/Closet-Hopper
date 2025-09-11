import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Closet Hopper - Migrate eBay to Poshmark',
  description: 'Hop your closet from eBay to Poshmark in one drag. No retyping, no re-shooting. One-time fee, lifetime access.',
  keywords: 'eBay, Poshmark, reseller, migration, listings, fashion',
  authors: [{ name: 'Closet Hopper' }],
  openGraph: {
    title: 'Closet Hopper - Migrate eBay to Poshmark',
    description: 'Hop your closet from eBay to Poshmark in one drag. No retyping, no re-shooting.',
    type: 'website',
    locale: 'en_US',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
