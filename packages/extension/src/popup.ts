import { isLicensed, activateLicense } from './license';

document.addEventListener('DOMContentLoaded', async () => {
  const statusElement = document.getElementById('status') as HTMLElement;
  const licenseKeyInput = document.getElementById('licenseKey') as HTMLInputElement;
  const activateButton = document.getElementById('activateButton') as HTMLButtonElement;
  const workflowContainer = document.getElementById('workflowContainer') as HTMLElement;
  const downloadSection = document.getElementById('downloadSection') as HTMLElement;
  const uploadSection = document.getElementById('uploadSection') as HTMLElement;

  // Check if user is already licensed
  const licensed = await isLicensed();
  
  if (licensed) {
    // Show workflow options
    statusElement.textContent = '✅ License Active';
    statusElement.className = 'text-green-600 font-bold';
    licenseKeyInput.style.display = 'none';
    activateButton.style.display = 'none';
    workflowContainer.style.display = 'block';
  } else {
    // Show license activation
    statusElement.textContent = '❌ License Required';
    statusElement.className = 'text-red-600 font-bold';
    workflowContainer.style.display = 'none';
  }

  activateButton.addEventListener('click', async () => {
    const key = licenseKeyInput.value.trim();
    if (!key) {
      alert('Please enter your license key');
      return;
    }

    try {
      // Get user email from web app context or prompt user
      const userEmail = prompt('Please enter your email address for license activation:');
      if (!userEmail) {
        alert('Email is required for license activation');
        return;
      }
      
      const success = await activateLicense(key, userEmail);
      if (success) {
        alert('License activated successfully!');
        location.reload();
      } else {
        alert('License activation failed. Please check your key.');
      }
    } catch (error) {
      alert('Error activating license. Please try again.');
    }
  });

  // Workflow navigation
  document.getElementById('downloadBtn')?.addEventListener('click', () => {
    downloadSection.style.display = 'block';
    uploadSection.style.display = 'none';
  });

  document.getElementById('uploadBtn')?.addEventListener('click', () => {
    downloadSection.style.display = 'none';
    uploadSection.style.display = 'block';
  });

  // eBay navigation buttons
  document.getElementById('activeListings')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.ebay.com/sh/lst/active' });
  });

  document.getElementById('unsoldListings')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.ebay.com/sh/lst/ended?status=UNSOLD_NOT_RELISTED' });
  });

  document.getElementById('draftListings')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.ebay.com/sh/lst/drafts' });
  });

  document.getElementById('scheduledListings')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://www.ebay.com/sh/lst/scheduled' });
  });

  // Poshmark navigation
  document.getElementById('poshmarkFeed')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://poshmark.com/feed' });
  });
});
