'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StripeCheckout from '@/components/StripeCheckout'

interface License {
  id: string
  key: string
  plan: string
  status: string
  createdAt: string
  activations: number
  maxSeats: number
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if no token
      window.location.href = '/login';
      return;
    }

    // Fetch user data and licenses
    fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          console.error('Error fetching user data:', data.error);
          // Clear invalid token and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else {
          setUser(data.user);
          setLicenses(data.user.licenses || []);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        // Clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      });
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-poshmark-pink mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="text-2xl font-bold text-poshmark-pink">
              🦘 ClosetHopper
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name || user?.email}</span>
              <button 
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Licenses</h1>
            <p className="mt-2 text-gray-600">
              Manage your ClosetHopper licenses and purchase additional ones.
            </p>
          </div>

          {/* License Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {licenses.map((license) => (
              <div key={license.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {license.plan === 'pro' ? 'Pro License' : 'Basic License'}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      license.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {license.status}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-500">License Key</label>
                      <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                        {license.key}
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Activations</label>
                      <p className="text-sm text-gray-900">
                        {license.activations} / {license.maxSeats} browser profiles
                      </p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <p className="text-sm text-gray-900">
                        {new Date(license.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex space-x-3">
                    <button className="flex-1 bg-poshmark-pink text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-poshmark-pink-dark">
                      Download Extension
                    </button>
                    <button className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Purchase Additional License */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Need More Licenses?
              </h3>
              <p className="text-gray-600 mb-4">
                Purchase additional licenses for other browsers or team members. 
                Additional licenses are discounted 40% from the original price.
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-poshmark-pink">$34</p>
                  <p className="text-sm text-gray-500">40% off original price</p>
                </div>
                <StripeCheckout 
                  priceId={process.env.NEXT_PUBLIC_STRIPE_ADDITIONAL_LICENSE_PRICE_ID!}
                  licenseType="additional"
                  onSuccess={() => {
                    // Refresh the page to show new license
                    window.location.reload();
                  }}
                  onError={(error) => {
                    alert(`Payment error: ${error}`);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-medium text-gray-900 mb-2">Get Help</h4>
              <p className="text-sm text-gray-600 mb-4">
                Need assistance with ClosetHopper?
              </p>
              <button className="text-poshmark-pink hover:text-poshmark-pink-dark text-sm font-medium">
                Contact Support →
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-medium text-gray-900 mb-2">Tutorial</h4>
              <p className="text-sm text-gray-600 mb-4">
                Learn how to use ClosetHopper effectively.
              </p>
              <button className="text-poshmark-pink hover:text-poshmark-pink-dark text-sm font-medium">
                Watch Tutorial →
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-medium text-gray-900 mb-2">Updates</h4>
              <p className="text-sm text-gray-600 mb-4">
                Stay updated with the latest features.
              </p>
              <button className="text-poshmark-pink hover:text-poshmark-pink-dark text-sm font-medium">
                View Changelog →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
