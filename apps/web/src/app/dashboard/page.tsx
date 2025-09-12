'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import StripeCheckout from '@/components/StripeCheckout'
import LicenseCard from '@/components/LicenseCard'

interface License {
  id: string
  key: string
  plan: string
  status: string
  createdAt: string
  activations: number
  maxSeats: number
  isGift?: boolean
  giftRecipientEmail?: string
  giftMessage?: string
  redeemedAt?: string
  redeemedBy?: string
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

  const handleLicenseTransfer = async (licenseId: string, recipientEmail: string, message?: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/licenses/transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          licenseId,
          recipientEmail,
          message
        })
      });

      if (response.ok) {
        // Refresh the page to show updated license
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`Transfer failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Transfer failed. Please try again.');
    }
  }

  const handleLicenseDeploy = async (licenseId: string) => {
    // This would typically open the extension installation or provide download link
    alert('Extension deployment functionality would be implemented here');
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
              🦘 Closet Hopper
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.email}</span>
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
              Manage your Closet Hopper licenses and purchase additional ones.
            </p>
          </div>

          {/* License Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {licenses.map((license) => (
              <LicenseCard
                key={license.id}
                license={license}
                onTransfer={handleLicenseTransfer}
                onDeploy={handleLicenseDeploy}
              />
            ))}
          </div>

          {/* Purchase License Section */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {licenses.length === 0 ? (
                // First license purchase
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Get Started with Closet Hopper
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Purchase your first license to start moving your eBay listings to Poshmark.
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-poshmark-pink">$57</p>
                      <p className="text-sm text-gray-500">One-time payment, lifetime access</p>
                    </div>
                    <StripeCheckout 
                      priceId={process.env.NEXT_PUBLIC_STRIPE_FIRST_LICENSE_PRICE_ID!}
                      licenseType="first"
                      onSuccess={() => {
                        // Refresh the page to show new license
                        window.location.reload();
                      }}
                      onError={(error) => {
                        alert(`Payment error: ${error}`);
                      }}
                    />
                  </div>
                </>
              ) : (
                // Additional license purchase
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Buy Additional Licenses
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Purchase additional licenses for other browsers, team members, or as gifts. 
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
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-medium text-gray-900 mb-2">Get Help</h4>
              <p className="text-sm text-gray-600 mb-4">
                Need assistance with Closet Hopper?
              </p>
              <button className="text-poshmark-pink hover:text-poshmark-pink-dark text-sm font-medium">
                Contact Support →
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-medium text-gray-900 mb-2">Tutorial</h4>
              <p className="text-sm text-gray-600 mb-4">
                Learn how to use Closet Hopper effectively.
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
