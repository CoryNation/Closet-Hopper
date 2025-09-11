'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  priceId: string
  licenseType: 'first' | 'additional'
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function StripeCheckout({ priceId, licenseType, onSuccess, onError }: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    
    try {
      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      // Get authentication token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please sign in to purchase');
      }

      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          priceId,
          licenseType,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      })

      const session = await response.json()
      
      if (session.error) {
        throw new Error(session.error)
      }

      // Redirect to Stripe Checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id,
      })

      if (result.error) {
        throw new Error(result.error.message)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      onError?.(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="w-full bg-poshmark-pink hover:bg-poshmark-pink-dark text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg disabled:opacity-50"
    >
      {loading ? 'Processing...' : `Buy ${licenseType === 'first' ? 'License' : 'Additional License'} - $${licenseType === 'first' ? '57' : '34'}`}
    </button>
  )
}
