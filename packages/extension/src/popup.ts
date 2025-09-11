import { validateLicense, activateLicense } from './license';

document.addEventListener('DOMContentLoaded', async () => {
  const statusEl = document.getElementById('status') as HTMLElement;
  const licenseForm = document.getElementById('license-form') as HTMLElement;
  const licensedContent = document.getElementById('licensed-content') as HTMLElement;
  const licenseKeyInput = document.getElementById('license-key') as HTMLInputElement;
  const emailInput = document.getElementById('email') as HTMLInputElement;
  const activateBtn = document.getElementById('activate-btn') as HTMLButtonElement;

  // Check if already licensed
  const stored = await chrome.storage.sync.get(['licenseKey', 'profileHash']);
  if (stored.licenseKey && stored.profileHash) {
    const isValid = await validateLicense(stored.licenseKey, stored.profileHash);
    if (isValid) {
      showLicensed();
      return;
    }
  }

  // Show license form
  showUnlicensed();

  activateBtn.addEventListener('click', async () => {
    const licenseKey = licenseKeyInput.value.trim();
    const email = emailInput.value.trim();

    if (!licenseKey || !email) {
      alert('Please enter both license key and email');
      return;
    }

    activateBtn.disabled = true;
    activateBtn.textContent = 'Activating...';

    try {
      const success = await activateLicense(licenseKey, email);
      if (success) {
        showLicensed();
      } else {
        alert('Failed to activate license. Please check your key and try again.');
      }
    } catch (error) {
      console.error('License activation error:', error);
      alert('Error activating license. Please try again.');
    } finally {
      activateBtn.disabled = false;
      activateBtn.textContent = 'Activate License';
    }
  });

  function showLicensed() {
    statusEl.className = 'status licensed';
    statusEl.textContent = '✅ License active';
    licenseForm.style.display = 'none';
    licensedContent.style.display = 'block';
  }

  function showUnlicensed() {
    statusEl.className = 'status unlicensed';
    statusEl.textContent = 'License required';
    licenseForm.style.display = 'block';
    licensedContent.style.display = 'none';
  }
});
