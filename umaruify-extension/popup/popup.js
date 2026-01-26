/**
 * Umaruify Popup Script - Settings UI
 */
(function() {
  'use strict';

  const enabledCheckbox = document.getElementById('enabled');
  const mouseTrackingCheckbox = document.getElementById('mouse-tracking');

  // Load saved settings
  chrome.storage.local.get(['enabled', 'mouseTracking'], (result) => {
    enabledCheckbox.checked = result.enabled !== false;
    mouseTrackingCheckbox.checked = result.mouseTracking !== false;
  });

  // Save settings on change
  enabledCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ enabled: enabledCheckbox.checked });
  });

  mouseTrackingCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ mouseTracking: mouseTrackingCheckbox.checked });
  });
})();
