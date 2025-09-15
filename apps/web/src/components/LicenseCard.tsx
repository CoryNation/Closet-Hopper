'use client'

import { useState } from 'react'

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

interface LicenseCardProps {
  license: License
  onTransfer?: (licenseId: string, recipientEmail: string, message?: string) => void
  onDeploy?: (licenseId: string) => void
}

export default function LicenseCard({ license, onTransfer, onDeploy }: LicenseCardProps) {
  const [showTransferForm, setShowTransferForm] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [giftMessage, setGiftMessage] = useState('')
  const [isTransferring, setIsTransferring] = useState(false)

  const handleTransfer = async () => {
    if (!recipientEmail.trim()) return
    
    setIsTransferring(true)
    try {
      await onTransfer?.(license.id, recipientEmail, giftMessage)
      setShowTransferForm(false)
      setRecipientEmail('')
      setGiftMessage('')
    } catch (error) {
      console.error('Transfer failed:', error)
    } finally {
      setIsTransferring(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'used':
        return 'bg-blue-100 text-blue-800'
      case 'revoked':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'used':
        return 'Used'
      case 'revoked':
        return 'Revoked'
      default:
        return status
    }
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {license.plan === 'first' ? 'First License' : 'Additional License'}
            {license.isGift && (
              <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Gift
              </span>
            )}
          </h3>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(license.status)}`}>
            {getStatusText(license.status)}
          </span>
        </div>
        
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-500">License Key</label>
            <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
              {license.key}
            </p>
          </div>
          
          {license.isGift && license.giftRecipientEmail && (
            <div>
              <label className="text-sm font-medium text-gray-500">Gift Recipient</label>
              <p className="text-sm text-gray-900">{license.giftRecipientEmail}</p>
            </div>
          )}

          {license.isGift && license.giftMessage && (
            <div>
              <label className="text-sm font-medium text-gray-500">Gift Message</label>
              <p className="text-sm text-gray-900 italic">"{license.giftMessage}"</p>
            </div>
          )}

          {license.status === 'used' && license.redeemedAt && (
            <div>
              <label className="text-sm font-medium text-gray-500">Redeemed</label>
              <p className="text-sm text-gray-900">
                {new Date(license.redeemedAt).toLocaleString()}
                {license.redeemedBy && (
                  <span className="block text-xs text-gray-500">by {license.redeemedBy}</span>
                )}
              </p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium text-gray-500">Created</label>
            <p className="text-sm text-gray-900">
              {new Date(license.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="mt-4 space-y-3">
          {license.status === 'available' && (
            <>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">How to Activate Your License:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Download the Closet Hopper browser extension</li>
                  <li>Install it in your browser</li>
                  <li>Click "Deploy to Browser" below</li>
                  <li>Enter your license key when prompted</li>
                </ol>
                <div className="mt-3">
                  <a 
                    href="https://chrome.google.com/webstore/detail/closet-hopper/your-extension-id" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    Download Extension →
                  </a>
                </div>
              </div>
              
              <button 
                onClick={() => onDeploy?.(license.id)}
                className="w-full bg-poshmark-pink text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-poshmark-pink-dark"
              >
                Deploy to Browser
              </button>
              
              {!license.isGift && (
                <button 
                  onClick={() => setShowTransferForm(!showTransferForm)}
                  className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
                >
                  Transfer to Someone Else
                </button>
              )}
            </>
          )}

          {showTransferForm && (
            <div className="border-t pt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-poshmark-pink focus:border-poshmark-pink"
                  placeholder="Enter recipient's email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gift Message (Optional)
                </label>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-poshmark-pink focus:border-poshmark-pink"
                  placeholder="Add a personal message..."
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleTransfer}
                  disabled={!recipientEmail.trim() || isTransferring}
                  className="flex-1 bg-poshmark-pink text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-poshmark-pink-dark disabled:opacity-50"
                >
                  {isTransferring ? 'Transferring...' : 'Send Gift'}
                </button>
                <button
                  onClick={() => setShowTransferForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
