// License management for Closet Hopper extension

const API_BASE = 'https://closethopper.com/api';

export async function generateProfileHash(): Promise<string> {
  // Generate a stable hash for this browser profile
  const stored = await chrome.storage.sync.get(['profileId']);
  let profileId = stored.profileId;
  
  if (!profileId) {
    // Generate a new UUID for this profile
    profileId = crypto.randomUUID();
    await chrome.storage.sync.set({ profileId });
  }
  
  // Hash the profile ID for privacy
  const encoder = new TextEncoder();
  const data = encoder.encode(profileId);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex;
}

export async function validateLicense(licenseKey: string, profileHash: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/licenses/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ key: licenseKey, profileHash })
    });
    
    const result = await response.json();
    return result.ok && result.status === 'active';
  } catch (error) {
    console.error('License validation error:', error);
    return false;
  }
}

export async function activateLicense(licenseKey: string, email: string): Promise<boolean> {
  try {
    const profileHash = await generateProfileHash();
    
    const response = await fetch(`${API_BASE}/licenses/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        key: licenseKey, 
        profileHash, 
        email 
      })
    });
    
    const result = await response.json();
    
    if (result.ok) {
      // Store license info
      await chrome.storage.sync.set({
        licenseKey,
        profileHash,
        nextCheckAt: Date.now() + (14 * 24 * 60 * 60 * 1000) // 14 days
      });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('License activation error:', error);
    return false;
  }
}

export async function pingLicense(): Promise<boolean> {
  const stored = await chrome.storage.sync.get(['licenseKey', 'profileHash']);
  if (!stored.licenseKey || !stored.profileHash) {
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE}/licenses/ping`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        key: stored.licenseKey, 
        profileHash: stored.profileHash 
      })
    });
    
    const result = await response.json();
    return result.ok;
  } catch (error) {
    console.error('License ping error:', error);
    return false;
  }
}

export async function isLicensed(): Promise<boolean> {
  const stored = await chrome.storage.sync.get(['licenseKey', 'profileHash', 'nextCheckAt']);
  
  if (!stored.licenseKey || !stored.profileHash) {
    return false;
  }
  
  // Check if we need to revalidate
  if (stored.nextCheckAt && Date.now() > stored.nextCheckAt) {
    const isValid = await validateLicense(stored.licenseKey, stored.profileHash);
    if (isValid) {
      await pingLicense();
      await chrome.storage.sync.set({
        nextCheckAt: Date.now() + (14 * 24 * 60 * 60 * 1000)
      });
      return true;
    } else {
      // License invalid, clear storage
      await chrome.storage.sync.remove(['licenseKey', 'profileHash', 'nextCheckAt']);
      return false;
    }
  }
  
  return true;
}
