/**
 * Umaruify Popup Script - Settings UI
 */
(function() {
  'use strict';

  const enabledCheckbox = document.getElementById('enabled');

  // Load saved settings (mouse tracking always enabled by default)
  chrome.storage.local.get(['enabled'], (result) => {
    enabledCheckbox.checked = result.enabled !== false;
  });

  // Ensure mouse tracking is always enabled
  chrome.storage.local.set({ mouseTracking: true });

  // Save settings on change
  enabledCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ enabled: enabledCheckbox.checked });
  });
})();
