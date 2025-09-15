'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Pricing from '@/components/Pricing'

function PricingContent() {
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('')

  useEffect(() => {
    const canceled = searchParams.get('canceled')
    if (canceled === 'true') {
      setMessage('Payment was canceled. You can try again below.')
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {message && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
            {message}
          </div>
        )}
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pricing</h1>
          <Link 
            href="/" 
            className="text-poshmark-pink hover:text-poshmark-pink-dark underline"
          >
            ← Back to Home
          </Link>
        </div>
        
        <Pricing />
      </div>
    </div>
  )
}

export default function PricingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poshmark-pink mx-auto mb-4"></div>
          <p className="text-gray-600">Loading pricing...</p>
        </div>
      </div>
    }>
      <PricingContent />
    </Suspense>
  )
}
