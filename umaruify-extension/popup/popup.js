/**
 * Umaruify Popup Script - Settings UI
 */
(function() {
  'use strict';

  const enabledCheckbox = document.getElementById('enabled');
  const sizeSlider = document.getElementById('size');
  const sizeValue = document.getElementById('size-value');

  // Load saved settings (mouse tracking always enabled by default)
  chrome.storage.local.get(['enabled', 'scale'], (result) => {
    enabledCheckbox.checked = result.enabled !== false;
    const scale = result.scale || 100;
    sizeSlider.value = scale;
    sizeValue.textContent = scale + '%';
  });

  // Ensure mouse tracking is always enabled
  chrome.storage.local.set({ mouseTracking: true });

  // Save settings on change
  enabledCheckbox.addEventListener('change', () => {
    chrome.storage.local.set({ enabled: enabledCheckbox.checked });
  });

  // Save scale on change
  sizeSlider.addEventListener('input', () => {
    const value = sizeSlider.value;
    sizeValue.textContent = value + '%';
    chrome.storage.local.set({ scale: parseInt(value) });
  });
})();
