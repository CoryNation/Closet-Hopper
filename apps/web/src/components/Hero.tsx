'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Hero() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        {/* Auth buttons */}
        <div className="absolute top-4 right-4 flex space-x-4">
          {user ? (
            <Link 
              href="/dashboard"
              className="bg-white text-poshmark-pink px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link 
                href="/login"
                className="border-2 border-white text-white px-4 py-2 rounded-lg hover:bg-white hover:text-poshmark-pink transition-colors font-semibold"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="bg-white text-poshmark-pink px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
              Hop Your Closet in One Drag
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              Closet Hopper moves your eBay listings to Poshmark — no retyping, no re-shooting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link 
                href="/signup"
                className="bg-white text-poshmark-pink hover:bg-gray-50 font-semibold py-4 px-8 rounded-lg transition-colors text-lg"
              >
                Get Closet Hopper
              </Link>
              <div className="text-white/80 text-sm">
                One-time fee. Lifetime access. No subscription nonsense.
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16"
          >
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 max-w-2xl mx-auto border border-white/20">
              <div className="text-6xl mb-4">🦘</div>
              <p className="text-white text-lg">
                Drag your exported eBay folders into Poshmark and watch the magic happen
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
