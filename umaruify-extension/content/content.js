/**
 * Umaruify Chrome Extension - Content Script
 * Creates the overlay container and initializes the app
 * Scripts are loaded via manifest.json (CSP-safe)
 */
(function() {
  'use strict';

  // Check if already injected
  if (document.getElementById('umaruify-container')) return;

  // Wait for body to be available
  if (!document.body) {
    document.addEventListener('DOMContentLoaded', init);
    return;
  }

  init();

  function init() {
    // Get extension asset URLs
    const urls = {
      handSprites: chrome.runtime.getURL('assets/hand/'),
      keyboardSprites: chrome.runtime.getURL('assets/keyboard/'),
      mouseBg: chrome.runtime.getURL('assets/mousebg.png'),
      model: chrome.runtime.getURL('models/urume-chan/cat.model3.json')
    };

    // Create main container
    const container = document.createElement('div');
    container.id = 'umaruify-container';

    // Store URLs as data attributes for JS modules to access
    container.dataset.handSprites = urls.handSprites;
    container.dataset.keyboardSprites = urls.keyboardSprites;
    container.dataset.mouseBg = urls.mouseBg;
    container.dataset.model = urls.model;

    // Create mouse background (first for proper z-ordering)
    const mouseBg = document.createElement('img');
    mouseBg.id = 'umaruify-mouse-bg';
    mouseBg.src = urls.mouseBg;
    container.appendChild(mouseBg);

    // Create Live2D canvas container
    const live2dContainer = document.createElement('div');
    live2dContainer.id = 'umaruify-live2d-container';

    const canvas = document.createElement('canvas');
    canvas.id = 'umaruify-live2d-canvas';
    canvas.width = 612;
    canvas.height = 352;
    live2dContainer.appendChild(canvas);
    container.appendChild(live2dContainer);

    // Create sprite layer
    const spriteLayer = document.createElement('div');
    spriteLayer.id = 'umaruify-sprite-layer';

    // Create hand sprite
    const handSprite = document.createElement('img');
    handSprite.id = 'umaruify-hand-sprite';
    spriteLayer.appendChild(handSprite);

    // Create keyboard sprite
    const keyboardSprite = document.createElement('img');
    keyboardSprite.id = 'umaruify-keyboard-sprite';
    spriteLayer.appendChild(keyboardSprite);

    container.appendChild(spriteLayer);

    // Append container to body
    document.body.appendChild(container);

    console.log('[Umaruify] Container created');

    // Check storage for enabled state and scale
    chrome.storage.local.get(['enabled', 'scale'], (result) => {
      const isEnabled = result.enabled !== false;
      const scale = (result.scale || 100) / 100;

      // Apply initial scale (use setProperty with important to override CSS reset)
      container.style.setProperty('transform', `scale(${scale})`, 'important');

      if (isEnabled) {
        // Initialize the app (modules are already loaded via manifest)
        if (window.UmaruifyApp && window.UmaruifyApp.init) {
          window.UmaruifyApp.init();
        }
      } else {
        container.classList.add('hidden');
      }
    });

    // Listen for storage changes
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes.enabled !== undefined) {
          const isEnabled = changes.enabled.newValue;
          container.classList.toggle('hidden', !isEnabled);

          // Initialize if enabling for the first time
          if (isEnabled && window.UmaruifyApp && !window.UmaruifyApp.initialized) {
            window.UmaruifyApp.init();
          }
        }

        if (changes.scale !== undefined) {
          const scale = changes.scale.newValue / 100;
          container.style.setProperty('transform', `scale(${scale})`, 'important');
        }

        // Forward settings changes to the app
        if (window.UmaruifyApp && window.UmaruifyApp.handleSettingsChange) {
          window.UmaruifyApp.handleSettingsChange(changes);
        }
      }
    });

    console.log('[Umaruify] Content script initialized');
  }
})();
