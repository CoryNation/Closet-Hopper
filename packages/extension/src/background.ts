// Background script for Closet Hopper extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('Closet Hopper extension installed');
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggleAssistant' });
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkLicense') {
    // License checking is handled in the content script
    sendResponse({ licensed: true });
  }
});

// Periodic license check
setInterval(async () => {
  const stored = await chrome.storage.sync.get(['licenseKey', 'profileHash', 'nextCheckAt']);
  
  if (stored.licenseKey && stored.nextCheckAt && Date.now() > stored.nextCheckAt) {
    // Revalidate license
    try {
      const response = await fetch('https://closethopper.com/api/licenses/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          key: stored.licenseKey, 
          profileHash: stored.profileHash 
        })
      });
      
      const result = await response.json();
      
      if (result.ok) {
        // Update next check time
        await chrome.storage.sync.set({
          nextCheckAt: Date.now() + (14 * 24 * 60 * 60 * 1000)
        });
      } else {
        // License invalid, clear storage
        await chrome.storage.sync.remove(['licenseKey', 'profileHash', 'nextCheckAt']);
      }
    } catch (error) {
      console.error('License check failed:', error);
    }
  }
}, 24 * 60 * 60 * 1000); // Check daily
