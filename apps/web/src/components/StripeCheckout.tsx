'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import PromoCodeInput from './PromoCodeInput'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  licenseType: 'first' | 'additional'
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function StripeCheckout({ licenseType, onSuccess, onError }: StripeCheckoutProps) {
  const [loading, setLoading] = useState(false)
  const [appliedPromo, setAppliedPromo] = useState<any>(null)

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
      const requestBody = {
        licenseType,
        promoCodeId: appliedPromo?.id,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      };
      
      console.log('Creating checkout session with:', requestBody);
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
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

  const calculatePrice = () => {
    const basePrice = licenseType === 'first' ? 5700 : 3400 // in cents
    if (!appliedPromo) return basePrice

    if (appliedPromo.discountType === 'free') return 0
    if (appliedPromo.discountType === 'percentage') {
      return Math.round(basePrice * (1 - appliedPromo.discountValue / 100))
    }
    if (appliedPromo.discountType === 'fixed') {
      return Math.max(0, basePrice - appliedPromo.discountValue)
    }
    return basePrice
  }

  const displayPrice = () => {
    const price = calculatePrice()
    if (price === 0) return 'Free'
    return `$${(price / 100).toFixed(2)}`
  }

  return (
    <div className="space-y-4">
      <PromoCodeInput
        onPromoApplied={setAppliedPromo}
        onPromoRemoved={() => setAppliedPromo(null)}
        appliedPromo={appliedPromo}
      />
      
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-poshmark-pink hover:bg-poshmark-pink-dark text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg disabled:opacity-50"
      >
        {loading ? 'Processing...' : `Buy ${licenseType === 'first' ? 'License' : 'Additional License'} - ${displayPrice()}`}
      </button>
    </div>
  )
}
