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
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'used':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
      case 'active':
        return 'Active'
      case 'used':
        return 'Used'
      case 'revoked':
        return 'Revoked'
      default:
        return status
    }
  }

  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200">
      <div className="px-6 py-6 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">
            {license.plan === 'first' ? 'First License' : 'Additional License'}
            {license.isGift && (
              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-purple-100 text-purple-800 border border-purple-200">
                🎁 Gift
              </span>
            )}
          </h3>
          <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full border ${getStatusColor(license.status)}`}>
            {getStatusText(license.status)}
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">License Key</label>
            <p className="text-lg text-gray-900 font-mono bg-gray-50 p-3 rounded-lg border-2 border-gray-200 font-bold">
              {license.key}
            </p>
          </div>
          
          {license.isGift && license.giftRecipientEmail && (
            <div>
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Gift Recipient</label>
              <p className="text-sm text-gray-900 font-semibold">{license.giftRecipientEmail}</p>
            </div>
          )}

          {license.isGift && license.giftMessage && (
            <div>
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Gift Message</label>
              <p className="text-sm text-gray-900 italic font-medium">"{license.giftMessage}"</p>
            </div>
          )}

          {license.status === 'used' && license.redeemedAt && (
            <div>
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Redeemed</label>
              <p className="text-sm text-gray-900 font-semibold">
                {new Date(license.redeemedAt).toLocaleString()}
                {license.redeemedBy && (
                  <span className="block text-xs text-gray-500 font-medium">by {license.redeemedBy}</span>
                )}
              </p>
            </div>
          )}
          
          <div>
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Created</label>
            <p className="text-sm text-gray-900 font-semibold">
              {new Date(license.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className="mt-6 space-y-4">
          {(license.status === 'available' || license.status === 'active') && (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h4 className="text-lg font-bold text-blue-900 mb-4 flex items-center">
                  🚀 How to Activate Your License:
                </h4>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside font-medium">
                  <li className="font-semibold">Download the Closet Hopper browser extension</li>
                  <li className="font-semibold">Install it in your browser</li>
                  <li className="font-semibold">Click "Deploy to Browser" below</li>
                  <li className="font-semibold">Enter your license key when prompted</li>
                </ol>
                <div className="mt-4">
                  <a 
                    href="https://chrome.google.com/webstore/detail/closet-hopper/your-extension-id" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-500 bg-white px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                  >
                    📥 Download Extension →
                  </a>
                </div>
              </div>
              
              <button 
                onClick={() => onDeploy?.(license.id)}
                className="w-full bg-gradient-to-r from-poshmark-pink to-pink-600 text-white px-6 py-3 rounded-lg text-lg font-bold hover:from-poshmark-pink-dark hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                🚀 Deploy to Browser
              </button>
              
              {!license.isGift && (
                <button 
                  onClick={() => setShowTransferForm(!showTransferForm)}
                  className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-lg font-bold hover:bg-gray-300 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200"
                >
                  🎁 Transfer to Someone Else
                </button>
              )}
            </>
          )}

          {showTransferForm && (
            <div className="border-t-2 border-gray-200 pt-6 space-y-4">
              <h4 className="text-lg font-bold text-gray-900">Transfer License as Gift</h4>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Recipient Email
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-poshmark-pink focus:border-poshmark-pink font-medium"
                  placeholder="Enter recipient's email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Gift Message (Optional)
                </label>
                <textarea
                  value={giftMessage}
                  onChange={(e) => setGiftMessage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-poshmark-pink focus:border-poshmark-pink font-medium"
                  placeholder="Add a personal message..."
                  rows={3}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleTransfer}
                  disabled={!recipientEmail.trim() || isTransferring}
                  className="flex-1 bg-gradient-to-r from-poshmark-pink to-pink-600 text-white px-6 py-3 rounded-lg text-lg font-bold hover:from-poshmark-pink-dark hover:to-pink-700 disabled:opacity-50 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isTransferring ? '🔄 Transferring...' : '🎁 Send Gift'}
                </button>
                <button
                  onClick={() => setShowTransferForm(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg text-lg font-bold hover:bg-gray-300 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200"
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
