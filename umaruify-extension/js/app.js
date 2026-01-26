/**
 * Main Application Entry Point
 * Coordinates Live2D, sprite overlays, and keyboard input
 * Adapted for Chrome Extension from UmarufyBase
 */

window.UmaruifyApp = {
  initialized: false,
  settings: {
    mouseTracking: true
  },

  /**
   * Initialize all modules
   */
  async init() {
    console.log('[Umaruify] App: Initializing...');

    // Load settings from storage
    await this.loadSettings();

    // Initialize sprite overlay
    window.UmaruifySpriteOverlay.init();

    // Initialize keyboard handler
    window.UmaruifyKeyboardHandler.init();
    this.setupKeyboardCallbacks();

    // Initialize Live2D controller
    const live2dLoaded = await window.UmaruifyLive2DController.init();

    if (!live2dLoaded) {
      console.warn('[Umaruify] App: Failed to load Live2D model, sprite-only mode');
    }

    // Apply initial settings
    this.applySettings();

    this.initialized = true;
    console.log('[Umaruify] App: Initialization complete');
  },

  /**
   * Load settings from Chrome storage
   */
  async loadSettings() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['mouseTracking'], (result) => {
          this.settings.mouseTracking = result.mouseTracking !== false;
          resolve();
        });
      } else {
        resolve();
      }
    });
  },

  /**
   * Apply current settings to modules
   */
  applySettings() {
    window.UmaruifyLive2DController.setMouseTracking(this.settings.mouseTracking);
  },

  /**
   * Setup keyboard event callbacks
   */
  setupKeyboardCallbacks() {
    // Handle key press
    window.UmaruifyKeyboardHandler.onKeyPress = (keyCode, spriteIndex, state) => {
      // Update Live2D parameter (CatParamLeftHandDown = 1)
      window.UmaruifyLive2DController.setKeyboardPressed(true);

      // Show hand sprite based on sprite index
      window.UmaruifySpriteOverlay.showHand(spriteIndex);
    };

    // Handle key release
    window.UmaruifyKeyboardHandler.onKeyRelease = (keyCode, state) => {
      // If still keys pressed, show the current sprite
      if (state.isActive) {
        window.UmaruifySpriteOverlay.showHand(state.currentSpriteIndex);
      } else {
        // No keys pressed - hide hand sprite and reset Live2D parameter
        window.UmaruifySpriteOverlay.hideHand();
        window.UmaruifyLive2DController.setKeyboardPressed(false);
      }
    };
  },

  /**
   * Handle settings changes from popup
   */
  handleSettingsChange(changes) {
    if (changes.mouseTracking !== undefined) {
      this.settings.mouseTracking = changes.mouseTracking.newValue;
      window.UmaruifyLive2DController.setMouseTracking(this.settings.mouseTracking);
    }
  },

  /**
   * Destroy all modules and clean up resources
   */
  destroy() {
    if (!this.initialized) return;

    console.log('[Umaruify] App: Destroying...');

    // Destroy keyboard handler
    if (window.UmaruifyKeyboardHandler && window.UmaruifyKeyboardHandler.destroy) {
      window.UmaruifyKeyboardHandler.destroy();
    }

    // Destroy sprite overlay
    if (window.UmaruifySpriteOverlay && window.UmaruifySpriteOverlay.destroy) {
      window.UmaruifySpriteOverlay.destroy();
    }

    // Destroy Live2D controller
    if (window.UmaruifyLive2DController && window.UmaruifyLive2DController.destroy) {
      window.UmaruifyLive2DController.destroy();
    }

    this.initialized = false;
    console.log('[Umaruify] App: Destroyed');
  }
};
