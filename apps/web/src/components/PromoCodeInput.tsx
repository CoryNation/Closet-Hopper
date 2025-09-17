'use client'

import { useState, useEffect } from 'react'

interface PromoCodeInputProps {
  onPromoApplied: (promoCode: any) => void
  onPromoRemoved: () => void
  appliedPromo?: any
  preFilledCode?: string
  isReadOnly?: boolean
}

export default function PromoCodeInput({ 
  onPromoApplied, 
  onPromoRemoved, 
  appliedPromo, 
  preFilledCode,
  isReadOnly = false 
}: PromoCodeInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-apply pre-filled code
  useEffect(() => {
    if (preFilledCode && !appliedPromo) {
      setCode(preFilledCode)
      handleApplyPreFilled(preFilledCode)
    }
  }, [preFilledCode, appliedPromo])

  const handleApplyPreFilled = async (promoCode: string) => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: promoCode.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        onPromoApplied(data.promoCode)
      } else {
        setError(data.error || 'Invalid promo code')
      }
    } catch (error) {
      console.error('Promo code validation error:', error)
      setError('Failed to validate promo code')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!code.trim()) return

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: code.trim() })
      })

      const data = await response.json()

      if (response.ok) {
        onPromoApplied(data.promoCode)
        setCode('')
      } else {
        setError(data.error || 'Invalid promo code')
      }
    } catch (error) {
      console.error('Promo code validation error:', error)
      setError('Failed to validate promo code')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    onPromoRemoved()
    setCode('')
    setError('')
  }

  if (appliedPromo) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-800">
              Promo code applied: {appliedPromo.code}
            </p>
            {appliedPromo.description && (
              <p className="text-sm text-green-600">{appliedPromo.description}</p>
            )}
            <p className="text-sm text-green-600">
              {appliedPromo.discountType === 'percentage' 
                ? `${appliedPromo.discountValue}% off`
                : appliedPromo.discountType === 'fixed'
                ? `$${(appliedPromo.discountValue / 100).toFixed(2)} off`
                : 'Free license'
              }
            </p>
          </div>
          {!isReadOnly && (
            <button
              onClick={handleRemove}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex space-x-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
          className={`flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-poshmark-pink focus:border-poshmark-pink ${
            isReadOnly ? 'bg-gray-100 cursor-not-allowed' : ''
          }`}
          disabled={loading || isReadOnly}
        />
        {!isReadOnly && (
          <button
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="px-4 py-2 bg-poshmark-pink text-white rounded-md text-sm font-medium hover:bg-poshmark-pink-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Applying...' : 'Apply'}
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
