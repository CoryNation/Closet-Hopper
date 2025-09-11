'use client'

import { useState } from 'react'

interface LicenseActivationProps {
  onActivate: (licenseKey: string) => void
  onCancel: () => void
}

export default function LicenseActivation({ onActivate, onCancel }: LicenseActivationProps) {
  const [licenseKey, setLicenseKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      setError('Please enter a license key')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Validate license key format (basic validation)
      if (licenseKey.length < 10) {
        throw new Error('Invalid license key format')
      }

      // Call the activation function
      onActivate(licenseKey.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid license key')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Activate License</h2>
        <p className="text-gray-600 mb-6">
          Enter your Closet Hopper license key to activate the extension.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="licenseKey" className="block text-sm font-medium text-gray-700 mb-2">
              License Key
            </label>
            <input
              id="licenseKey"
              type="text"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="Enter your license key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-poshmark-pink focus:border-poshmark-pink"
              disabled={loading}
            />
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleActivate}
              disabled={loading}
              className="flex-1 bg-poshmark-pink text-white py-2 px-4 rounded-md hover:bg-poshmark-pink-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Activating...' : 'Activate'}
            </button>
            <button
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>Don't have a license key? <a href="/" className="text-poshmark-pink hover:underline">Purchase one here</a></p>
        </div>
      </div>
    </div>
  )
}
