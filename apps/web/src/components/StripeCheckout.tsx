'use client'

import { useState, useEffect } from 'react'
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
  const [autoAppliedPromo, setAutoAppliedPromo] = useState<any>(null)

  // Auto-apply additional license discount
  useEffect(() => {
    if (licenseType === 'additional') {
      fetchAdditionalLicensePromo()
    }
  }, [licenseType])

  const fetchAdditionalLicensePromo = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: 'ADDITIONAL40' })
      })

      if (response.ok) {
        const data = await response.json()
        setAutoAppliedPromo(data.promoCode)
      }
    } catch (error) {
      console.error('Failed to fetch additional license promo:', error)
    }
  }

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

      // Auto-apply additional license discount if no promo code is manually applied
      let finalPromoCodeId = appliedPromo?.id;
      if (!appliedPromo && licenseType === 'additional' && autoAppliedPromo) {
        finalPromoCodeId = autoAppliedPromo.id;
      }

      // Create checkout session
      const requestBody = {
        licenseType,
        promoCodeId: finalPromoCodeId,
        successUrl: `${window.location.origin}/dashboard?success=true`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`,
      };
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      })

      const session = await response.json()
      
      if (!response.ok) {
        throw new Error(session.error || `HTTP ${response.status}: ${response.statusText}`)
      }
      
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
    const promo = appliedPromo || autoAppliedPromo
    if (!promo) return basePrice

    if (promo.discountType === 'free') return 0
    if (promo.discountType === 'percentage') {
      return Math.round(basePrice * (1 - promo.discountValue / 100))
    }
    if (promo.discountType === 'fixed') {
      return Math.max(0, basePrice - promo.discountValue)
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
      {autoAppliedPromo && !appliedPromo && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800">
                Auto-applied discount: {autoAppliedPromo.code}
              </p>
              <p className="text-sm text-green-600">
                {autoAppliedPromo.discountType === 'percentage' 
                  ? `${autoAppliedPromo.discountValue}% off`
                  : autoAppliedPromo.discountType === 'fixed'
                  ? `$${(autoAppliedPromo.discountValue / 100).toFixed(2)} off`
                  : 'Free license'
                }
              </p>
            </div>
          </div>
        </div>
      )}

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
