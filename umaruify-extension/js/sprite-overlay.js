/**
 * Sprite Overlay Manager - Manages hand and keyboard PNG sprite overlays
 * Adapted for Chrome Extension from UmarufyBase
 */

window.UmaruifySpriteOverlay = {
  handSprite: null,
  keyboardSprite: null,
  mouseBgSprite: null,

  currentHandIndex: -1,
  currentKeyboardIndex: -1,

  // Sprite paths (populated from container data attributes)
  paths: {
    hand: '',
    keyboard: '',
    mouseBg: ''
  },

  // Preloaded images
  handImages: [],
  keyboardImages: [],

  enabled: true,

  /**
   * Initialize the sprite overlay system
   */
  init() {
    const container = document.getElementById('umaruify-container');
    if (!container) {
      console.error('[Umaruify] SpriteOverlay: Container not found');
      return;
    }

    // Get paths from container data attributes
    this.paths.hand = container.dataset.handSprites || '';
    this.paths.keyboard = container.dataset.keyboardSprites || '';
    this.paths.mouseBg = container.dataset.mouseBg || '';

    console.log('[Umaruify] SpriteOverlay: Paths loaded -', {
      hand: this.paths.hand,
      keyboard: this.paths.keyboard,
      mouseBg: this.paths.mouseBg
    });

    // Get sprite elements created by content script
    this.handSprite = document.getElementById('umaruify-hand-sprite');
    this.keyboardSprite = document.getElementById('umaruify-keyboard-sprite');
    this.mouseBgSprite = document.getElementById('umaruify-mouse-bg');

    console.log('[Umaruify] SpriteOverlay: Elements found -', {
      handSprite: !!this.handSprite,
      keyboardSprite: !!this.keyboardSprite,
      mouseBgSprite: !!this.mouseBgSprite
    });

    // Preload sprites
    this.preloadSprites();

    console.log('[Umaruify] SpriteOverlay: Initialized');
  },

  /**
   * Preload all sprites for smooth transitions
   */
  preloadSprites() {
    // Preload hand sprites (0-49)
    for (let i = 0; i < 50; i++) {
      const img = new Image();
      img.src = `${this.paths.hand}${i}.png`;
      this.handImages[i] = img;
    }

    // Preload keyboard sprites (0-49)
    for (let i = 0; i < 50; i++) {
      const img = new Image();
      img.src = `${this.paths.keyboard}${i}.png`;
      this.keyboardImages[i] = img;
    }

    console.log('[Umaruify] SpriteOverlay: Sprites preloaded');
  },

  /**
   * Show hand sprite for a given index
   * @param {number} index - Sprite index (0-49)
   */
  showHand(index) {
    console.log('[Umaruify] SpriteOverlay: showHand called with index:', index);

    if (!this.enabled) {
      console.log('[Umaruify] SpriteOverlay: showHand - disabled, skipping');
      return;
    }
    if (index < 0 || index >= 50) {
      console.log('[Umaruify] SpriteOverlay: showHand - index out of range:', index);
      return;
    }
    if (!this.handSprite) {
      console.log('[Umaruify] SpriteOverlay: showHand - handSprite element not found');
      return;
    }

    if (index !== this.currentHandIndex) {
      this.currentHandIndex = index;
      // Use preloaded image src for faster response
      if (this.handImages[index] && this.handImages[index].complete) {
        this.handSprite.src = this.handImages[index].src;
        console.log('[Umaruify] SpriteOverlay: showHand - using preloaded image:', this.handImages[index].src);
      } else {
        const src = `${this.paths.hand}${index}.png`;
        this.handSprite.src = src;
        console.log('[Umaruify] SpriteOverlay: showHand - loading image:', src);
      }
    }
    this.handSprite.style.setProperty('display', 'block', 'important');
    console.log('[Umaruify] SpriteOverlay: showHand - display set to block, current style:', this.handSprite.style.display);
  },

  /**
   * Hide hand sprite
   */
  hideHand() {
    console.log('[Umaruify] SpriteOverlay: hideHand called');
    if (this.handSprite) {
      this.handSprite.style.setProperty('display', 'none', 'important');
      // Verify the change took effect
      const computed = window.getComputedStyle(this.handSprite).display;
      console.log('[Umaruify] SpriteOverlay: hideHand - set to none, computed:', computed);
    }
    this.currentHandIndex = -1;
  },

  /**
   * Show keyboard highlight sprite for a given index
   * @param {number} index - Sprite index (0-49)
   */
  showKeyboard(index) {
    console.log('[Umaruify] SpriteOverlay: showKeyboard called with index:', index);

    if (!this.enabled) {
      console.log('[Umaruify] SpriteOverlay: showKeyboard - disabled, skipping');
      return;
    }
    if (index < 0 || index >= 50) {
      console.log('[Umaruify] SpriteOverlay: showKeyboard - index out of range:', index);
      return;
    }
    if (!this.keyboardSprite) {
      console.log('[Umaruify] SpriteOverlay: showKeyboard - keyboardSprite element not found');
      return;
    }

    if (index !== this.currentKeyboardIndex) {
      this.currentKeyboardIndex = index;
      // Use preloaded image src for faster response
      if (this.keyboardImages[index] && this.keyboardImages[index].complete) {
        this.keyboardSprite.src = this.keyboardImages[index].src;
        console.log('[Umaruify] SpriteOverlay: showKeyboard - using preloaded image:', this.keyboardImages[index].src);
      } else {
        const src = `${this.paths.keyboard}${index}.png`;
        this.keyboardSprite.src = src;
        console.log('[Umaruify] SpriteOverlay: showKeyboard - loading image:', src);
      }
    }
    this.keyboardSprite.style.setProperty('display', 'block', 'important');
    console.log('[Umaruify] SpriteOverlay: showKeyboard - display set to block');
  },

  /**
   * Hide keyboard highlight sprite
   */
  hideKeyboard() {
    console.log('[Umaruify] SpriteOverlay: hideKeyboard called');
    if (this.keyboardSprite) {
      this.keyboardSprite.style.setProperty('display', 'none', 'important');
      // Verify the change took effect
      const computed = window.getComputedStyle(this.keyboardSprite).display;
      console.log('[Umaruify] SpriteOverlay: hideKeyboard - set to none, computed:', computed);
    }
    this.currentKeyboardIndex = -1;
  },

  /**
   * Enable/disable sprite overlays
   * @param {boolean} enabled
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.hideHand();
      this.hideKeyboard();
    }
  },

  /**
   * Set visibility of mouse background sprite
   * @param {boolean} visible
   */
  setMouseVisible(visible) {
    if (this.mouseBgSprite) {
      this.mouseBgSprite.style.display = visible ? 'block' : 'none';
    }
  }
};
