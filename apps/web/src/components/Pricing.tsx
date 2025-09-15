'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import StripeCheckout from './StripeCheckout'

export default function Pricing() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, [])
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simple Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            One-time fee. Lifetime access. No hidden costs.
          </p>
        </motion.div>

        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="card relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 bg-poshmark-pink text-white px-4 py-1 text-sm font-semibold">
              Most Popular
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro License</h3>
              <div className="text-5xl font-bold text-poshmark-pink mb-2">$57</div>
              <p className="text-gray-600">One-time payment</p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                <span>Unlimited eBay exports</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                <span>Drag & drop to Poshmark</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                <span>Automatic form filling</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                <span>Image forwarding</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                <span>Lifetime updates for v1.x</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✅</span>
                <span>One browser profile</span>
              </li>
            </ul>

            <div className="text-center mb-6">
              <p className="text-sm text-gray-500 mb-4">
                Competitors charge $30–70 per month. We're one-time only.
              </p>
              
              {loading ? (
                <div className="animate-pulse bg-gray-200 h-12 rounded-lg"></div>
              ) : user ? (
                <>
                  <StripeCheckout 
                    licenseType="first"
                    onSuccess={() => {
                      // Redirect to dashboard or show success message
                      window.location.href = '/dashboard?success=true';
                    }}
                    onError={(error) => {
                      alert(`Payment error: ${error}`);
                    }}
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Instant download after purchase
                  </p>
                </>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Please sign up or sign in to purchase
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link 
                      href="/signup"
                      className="bg-poshmark-pink text-white px-6 py-3 rounded-lg hover:bg-poshmark-pink-dark transition-colors font-medium"
                    >
                      Sign Up & Purchase
                    </Link>
                    <Link 
                      href="/login"
                      className="border border-poshmark-pink text-poshmark-pink px-6 py-3 rounded-lg hover:bg-poshmark-pink hover:text-white transition-colors font-medium"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center text-sm text-gray-500">
              <p>License valid for one browser profile</p>
              <p>Revalidation every 14 days</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
