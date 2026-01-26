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

    // Get sprite elements created by content script
    this.handSprite = document.getElementById('umaruify-hand-sprite');
    this.keyboardSprite = document.getElementById('umaruify-keyboard-sprite');
    this.mouseBgSprite = document.getElementById('umaruify-mouse-bg');

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
    if (!this.enabled || index < 0 || index >= 50 || !this.handSprite) return;

    if (index !== this.currentHandIndex) {
      this.currentHandIndex = index;
      // Use preloaded image src for faster response
      if (this.handImages[index] && this.handImages[index].complete) {
        this.handSprite.src = this.handImages[index].src;
      } else {
        this.handSprite.src = `${this.paths.hand}${index}.png`;
      }
    }
    this.handSprite.style.display = 'block';
  },

  /**
   * Hide hand sprite
   */
  hideHand() {
    if (this.handSprite) {
      this.handSprite.style.display = 'none';
    }
    this.currentHandIndex = -1;
  },

  /**
   * Show keyboard highlight sprite for a given index
   * @param {number} index - Sprite index (0-49)
   */
  showKeyboard(index) {
    if (!this.enabled || index < 0 || index >= 50 || !this.keyboardSprite) return;

    if (index !== this.currentKeyboardIndex) {
      this.currentKeyboardIndex = index;
      // Use preloaded image src for faster response
      if (this.keyboardImages[index] && this.keyboardImages[index].complete) {
        this.keyboardSprite.src = this.keyboardImages[index].src;
      } else {
        this.keyboardSprite.src = `${this.paths.keyboard}${index}.png`;
      }
    }
    this.keyboardSprite.style.display = 'block';
  },

  /**
   * Hide keyboard highlight sprite
   */
  hideKeyboard() {
    if (this.keyboardSprite) {
      this.keyboardSprite.style.display = 'none';
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
