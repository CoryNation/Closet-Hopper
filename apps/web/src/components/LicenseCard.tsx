
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
  transferToken?: string
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
  const [transferLink, setTransferLink] = useState('')
  const [showTransferLink, setShowTransferLink] = useState(false)

  const handleTransfer = async () => {
    if (!recipientEmail.trim()) return
    
    setIsTransferring(true)
    try {
      // Generate transfer token and create shareable link
      const transferToken = `transfer_${license.id}_${Date.now()}`
      const shareableLink = `${window.location.origin}/transfer/${transferToken}`
      setTransferLink(shareableLink)
      setShowTransferLink(true)
      
      // Call the transfer API to mark license as pending transfer
      await onTransfer?.(license.id, recipientEmail, giftMessage)
      
      // Generate canned message for user to copy/paste
      const cannedMessage = `Hi! I'm sending you a Closet Hopper license as a gift! 🎁

Closet Hopper helps you easily transfer your eBay listings to Poshmark. 

To claim your license:
1. Click this link: ${shareableLink}
2. Create an account (if you don't have one) or log in
3. Your license will be automatically activated!

${giftMessage ? `Personal message: "${giftMessage}"` : ''}

Enjoy using Closet Hopper! ��`

      // Copy to clipboard
      await navigator.clipboard.writeText(cannedMessage)
      
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
        return 'bg-green-100 text-green-800 border-green-200'
      case 'active':
      case 'deployed':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'transferred':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'pending_transfer':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'revoked':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Available'
      case 'active':
      case 'deployed':
        return 'Deployed'
      case 'transferred':
        return 'Transferred'
      case 'pending_transfer':
        return 'Pending Transfer'
      case 'revoked':
        return 'Revoked'
      default:
        return status
    }
  }

  return (
    <div className="bg-white overflow-hidden shadow-lg rounded-lg border border-gray-200">
      <div className="px-6 py-4 sm:p-4">
        <div className="flex items-center justify-between mb-3">
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
        
        <div className="space-y-2">
          <div>
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">License Key</label>
            <div className="relative">
              <p className="text-lg text-gray-900 font-mono bg-gray-50 p-2 pr-12 rounded-lg border-2 border-gray-200 font-bold">
                {license.key}
              </p>
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(license.key)
                    // Optional: Show a brief success message
                  } catch (err) {
                    console.error('Failed to copy license key:', err)
                  }
                }}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                title="Copy license key"
              >
                📋
              </button>
            </div>
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

          {license.status === 'transferred' && license.redeemedAt && (
            <div>
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Transferred</label>
              <p className="text-sm text-gray-900 font-semibold">
                {new Date(license.redeemedAt).toLocaleString()}
                {license.redeemedBy && (
                  <span className="block text-xs text-gray-500 font-medium">to {license.redeemedBy}</span>
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
        
        <div className="mt-3 space-y-2">
          {(license.status === 'available' || license.status === 'active') && (
            <>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mb-3">
                <h4 className="text-lg font-bold text-blue-900 mb-2">
                  How to Activate Your License
                </h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside font-medium">
                  <li className="font-semibold">Download Closet Hopper from Chrome Web Store</li>
                  <li className="font-semibold">Load extension to your Chrome browser</li>
                  <li className="font-semibold">Open the extension and enter your license key</li>
                  <li className="font-semibold">Start using Closet Hopper!</li>
                </ol>
                <div className="mt-3">
                  <a 
                    href="https://chrome.google.com/webstore/detail/closet-hopper/[EXTENSION-ID-PLACEHOLDER]" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center text-sm font-bold text-blue-600 hover:text-blue-500 bg-white px-4 py-2 rounded-lg border border-blue-200 hover:border-blue-300 transition-colors"
                  >
                    📥 Download Extension
                  </a>
                </div>
              </div>
              
              {!license.isGift && (
                <button 
                  onClick={() => setShowTransferForm(!showTransferForm)}
                  className="w-full bg-gray-200 text-gray-800 px-6 py-2 rounded-lg text-lg font-bold hover:bg-gray-300 border-2 border-gray-300 hover:border-gray-400 transition-all duration-200"
                >
                  🎁 Transfer to Someone Else
                </button>
              )}
            </>
          )}

          {showTransferForm && (
            <div className="border-t-2 border-gray-200 pt-4 space-y-3">
              <h4 className="text-lg font-bold text-gray-900">Transfer License</h4>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">
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
                <label className="block text-sm font-bold text-gray-700 mb-1">
                  Personal Message (Optional)
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
                  {isTransferring ? '🔄 Transferring...' : 'Transfer'}
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

          {showTransferLink && (
            <div className="border-t-2 border-gray-200 pt-4 space-y-3">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h4 className="text-lg font-bold text-green-900 mb-2">✅ Transfer Link Generated!</h4>
                <p className="text-sm text-green-800 mb-3">
                  A canned message with the transfer link has been copied to your clipboard. 
                  You can paste it into any communication method (email, text, Facebook, etc.).
                </p>
                <div className="bg-white border border-green-300 rounded p-2">
                  <p className="text-xs text-gray-600 font-mono break-all">{transferLink}</p>
                </div>
                <button
                  onClick={() => setShowTransferLink(false)}
                  className="mt-3 w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                >
                  Got it!
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}