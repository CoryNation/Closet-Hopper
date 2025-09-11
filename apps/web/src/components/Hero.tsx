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
    <section className="bg-white min-h-screen flex items-center">
      <div className="container mx-auto px-4 py-20">
        {/* Auth buttons */}
        <div className="absolute top-4 right-4 flex space-x-4">
          {user ? (
            <Link 
              href="/dashboard"
              className="bg-poshmark-pink text-white px-4 py-2 rounded-lg hover:bg-poshmark-pink-dark transition-colors"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link 
                href="/login"
                className="text-gray-700 hover:text-poshmark-pink transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/signup"
                className="bg-poshmark-pink text-white px-4 py-2 rounded-lg hover:bg-poshmark-pink-dark transition-colors"
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
            <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
              Hop Your Closet in One Drag
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-2xl mx-auto">
              ClosetHopper moves your eBay listings to Poshmark — no retyping, no re-shooting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-poshmark-pink hover:bg-poshmark-pink-dark text-white font-semibold py-4 px-8 rounded-lg transition-colors text-lg"
              >
                Get ClosetHopper
              </button>
              <div className="text-gray-600 text-sm">
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
            <div className="bg-poshmark-pink-light rounded-2xl p-8 max-w-2xl mx-auto border border-poshmark-pink/20">
              <div className="text-6xl mb-4">🦘</div>
              <p className="text-gray-800 text-lg">
                Drag your exported eBay folders into Poshmark and watch the magic happen
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
