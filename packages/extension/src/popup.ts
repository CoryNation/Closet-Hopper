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
  const manageSection = document.getElementById('manageSection') as HTMLElement;
  
  document.getElementById('manageBtn')?.addEventListener('click', () => {
    manageSection.style.display = 'block';
    downloadSection.style.display = 'none';
    uploadSection.style.display = 'none';
    updateActiveNav('manageBtn');
    loadListings();
  });

  document.getElementById('downloadBtn')?.addEventListener('click', () => {
    manageSection.style.display = 'none';
    downloadSection.style.display = 'block';
    uploadSection.style.display = 'none';
    updateActiveNav('downloadBtn');
  });

  document.getElementById('uploadBtn')?.addEventListener('click', () => {
    manageSection.style.display = 'none';
    downloadSection.style.display = 'none';
    uploadSection.style.display = 'block';
    updateActiveNav('uploadBtn');
  });

  function updateActiveNav(activeId: string) {
    document.querySelectorAll('.workflow-nav button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById(activeId)?.classList.add('active');
  }

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

  document.getElementById('createListing')?.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://poshmark.com/create-listing' });
  });

  // Listing management functions
  async function loadListings() {
    try {
      const result = await chrome.storage.local.get(['extractedListings']);
      const listings = result.extractedListings || [];
      
      const totalElement = document.getElementById('totalListings');
      if (totalElement) {
        totalElement.textContent = listings.length.toString();
      }

      displayListings(listings);
    } catch (error) {
      console.error('Error loading listings:', error);
    }
  }

  function displayListings(listings: any[]) {
    const listingsList = document.getElementById('listingsList');
    if (!listingsList) return;

    if (listings.length === 0) {
      listingsList.innerHTML = '<p style="text-align: center; color: #666; font-size: 12px;">No listings found. Download from eBay first.</p>';
      return;
    }

    listingsList.innerHTML = listings.map((listing, index) => `
      <div class="listing-item" style="border: 1px solid #ddd; border-radius: 5px; padding: 8px; margin-bottom: 5px; background: white;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <input type="checkbox" class="listing-checkbox" data-index="${index}" style="margin: 0;">
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: bold; font-size: 12px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${listing.title || 'Untitled Listing'}
            </div>
            <div style="font-size: 11px; color: #666;">
              ${listing.price || 'No price'} • ${listing.condition || 'Unknown condition'}
            </div>
            <div style="font-size: 10px; color: #999;">
              Status: <span class="status-badge" style="padding: 2px 6px; border-radius: 3px; background: #e9ecef; color: #495057;">${listing.status || 'downloaded'}</span>
            </div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <button class="edit-listing" data-index="${index}" style="padding: 2px 6px; font-size: 10px; background: #007bff; color: white; border: none; border-radius: 3px; cursor: pointer;">Edit</button>
            <button class="delete-listing" data-index="${index}" style="padding: 2px 6px; font-size: 10px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Delete</button>
          </div>
        </div>
      </div>
    `).join('');

    // Add event listeners for listing actions
    listingsList.querySelectorAll('.listing-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', updateSelectionCount);
    });

    listingsList.querySelectorAll('.edit-listing').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = (e.target as HTMLElement).dataset.index;
        editListing(parseInt(index || '0'));
      });
    });

    listingsList.querySelectorAll('.delete-listing').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = (e.target as HTMLElement).dataset.index;
        deleteListing(parseInt(index || '0'));
      });
    });
  }

  function updateSelectionCount() {
    const selected = document.querySelectorAll('.listing-checkbox:checked').length;
    // Could update a counter display here if needed
  }

  async function editListing(index: number) {
    try {
      const result = await chrome.storage.local.get(['extractedListings']);
      const listings = result.extractedListings || [];
      const listing = listings[index];
      
      if (!listing) return;

      // Open Poshmark create listing page and send listing data
      const tab = await chrome.tabs.create({ url: 'https://poshmark.com/create-listing' });
      
      // Wait for tab to load, then send message to fill form
      setTimeout(() => {
        chrome.tabs.sendMessage(tab.id!, {
          action: 'fillPoshmarkForm',
          listing: listing
        });
      }, 2000);

    } catch (error) {
      console.error('Error editing listing:', error);
    }
  }

  async function deleteListing(index: number) {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      const result = await chrome.storage.local.get(['extractedListings']);
      const listings = result.extractedListings || [];
      listings.splice(index, 1);
      
      await chrome.storage.local.set({ extractedListings: listings });
      loadListings();
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  }

  // Bulk actions
  document.getElementById('selectAll')?.addEventListener('click', () => {
    document.querySelectorAll('.listing-checkbox').forEach(checkbox => {
      (checkbox as HTMLInputElement).checked = true;
    });
    updateSelectionCount();
  });

  document.getElementById('clearSelection')?.addEventListener('click', () => {
    document.querySelectorAll('.listing-checkbox').forEach(checkbox => {
      (checkbox as HTMLInputElement).checked = false;
    });
    updateSelectionCount();
  });

  document.getElementById('bulkDelete')?.addEventListener('click', async () => {
    const selected = Array.from(document.querySelectorAll('.listing-checkbox:checked'))
      .map(cb => parseInt((cb as HTMLInputElement).dataset.index || '0'))
      .sort((a, b) => b - a); // Sort in descending order to avoid index issues

    if (selected.length === 0) {
      alert('Please select listings to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selected.length} listing(s)?`)) return;

    try {
      const result = await chrome.storage.local.get(['extractedListings']);
      const listings = result.extractedListings || [];
      
      selected.forEach(index => {
        listings.splice(index, 1);
      });
      
      await chrome.storage.local.set({ extractedListings: listings });
      loadListings();
    } catch (error) {
      console.error('Error bulk deleting listings:', error);
    }
  });

  document.getElementById('bulkArchive')?.addEventListener('click', async () => {
    const selected = Array.from(document.querySelectorAll('.listing-checkbox:checked'))
      .map(cb => parseInt((cb as HTMLInputElement).dataset.index || '0'));

    if (selected.length === 0) {
      alert('Please select listings to archive');
      return;
    }

    try {
      const result = await chrome.storage.local.get(['extractedListings']);
      const listings = result.extractedListings || [];
      
      selected.forEach(index => {
        if (listings[index]) {
          listings[index].status = 'archived';
        }
      });
      
      await chrome.storage.local.set({ extractedListings: listings });
      loadListings();
    } catch (error) {
      console.error('Error bulk archiving listings:', error);
    }
  });

  // Initialize with manage section visible
  if (licensed) {
    manageSection.style.display = 'block';
    downloadSection.style.display = 'none';
    uploadSection.style.display = 'none';
    loadListings();
  }
});
