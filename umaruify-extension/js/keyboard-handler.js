/**
 * Keyboard Handler - Detects keyboard input
 * Adapted for Chrome Extension from UmarufyBase
 */

window.UmaruifyKeyboardHandler = {
  // Currently pressed keys (keyCode -> spriteIndex)
  pressedKeys: new Map(),

  // Last active sprite index (for maintaining hand position)
  lastSpriteIndex: -1,

  // Callbacks
  onKeyPress: null,      // (keyCode, spriteIndex, state) => {}
  onKeyRelease: null,    // (keyCode, state) => {}
  onStateChange: null,   // (state) => {}

  // Bound event handlers
  _boundKeyDown: null,
  _boundKeyUp: null,
  _boundBlur: null,

  /**
   * Initialize keyboard listeners
   */
  init() {
    this._boundKeyDown = this.handleKeyDown.bind(this);
    this._boundKeyUp = this.handleKeyUp.bind(this);
    this._boundBlur = this.handleBlur.bind(this);

    // Use capture phase to ensure we get events before page handlers
    document.addEventListener('keydown', this._boundKeyDown, true);
    document.addEventListener('keyup', this._boundKeyUp, true);
    window.addEventListener('blur', this._boundBlur);

    console.log('[Umaruify] KeyboardHandler: Initialized');
  },

  /**
   * Handle key down event
   * @param {KeyboardEvent} e
   */
  handleKeyDown(e) {
    // Get keyCode (or convert from code for modern browsers)
    let keyCode = e.keyCode || e.which;

    // Fallback to code conversion if keyCode is 0 or undefined
    if (!keyCode && e.code) {
      keyCode = window.UmaruifyConfigMapping.codeToKeyCode(e.code);
    }

    if (!keyCode) return;

    // Check if this is a mapped key
    const spriteIndex = window.UmaruifyConfigMapping.getSpriteIndex(keyCode);

    if (spriteIndex !== null && !this.pressedKeys.has(keyCode)) {
      // New key press
      this.pressedKeys.set(keyCode, spriteIndex);
      this.lastSpriteIndex = spriteIndex;

      if (this.onKeyPress) {
        this.onKeyPress(keyCode, spriteIndex, this.getState());
      }

      if (this.onStateChange) {
        this.onStateChange(this.getState());
      }
    }
  },

  /**
   * Handle key up event
   * @param {KeyboardEvent} e
   */
  handleKeyUp(e) {
    let keyCode = e.keyCode || e.which;

    if (!keyCode && e.code) {
      keyCode = window.UmaruifyConfigMapping.codeToKeyCode(e.code);
    }

    if (!keyCode) return;

    if (this.pressedKeys.has(keyCode)) {
      this.pressedKeys.delete(keyCode);

      // Update last sprite index to the most recent remaining key
      if (this.pressedKeys.size > 0) {
        const values = Array.from(this.pressedKeys.values());
        this.lastSpriteIndex = values[values.length - 1];
      } else {
        this.lastSpriteIndex = -1;
      }

      if (this.onKeyRelease) {
        this.onKeyRelease(keyCode, this.getState());
      }

      if (this.onStateChange) {
        this.onStateChange(this.getState());
      }
    }
  },

  /**
   * Handle window blur - release all keys
   */
  handleBlur() {
    if (this.pressedKeys.size > 0) {
      this.pressedKeys.clear();
      this.lastSpriteIndex = -1;

      if (this.onStateChange) {
        this.onStateChange(this.getState());
      }
    }
  },

  /**
   * Get current keyboard state
   * @returns {Object}
   */
  getState() {
    return {
      isActive: this.pressedKeys.size > 0,
      pressedCount: this.pressedKeys.size,
      currentSpriteIndex: this.lastSpriteIndex,
      pressedKeys: Array.from(this.pressedKeys.keys()),
      pressedSpriteIndices: Array.from(this.pressedKeys.values())
    };
  },

  /**
   * Check if any key is currently pressed
   * @returns {boolean}
   */
  isAnyKeyPressed() {
    return this.pressedKeys.size > 0;
  },

  /**
   * Get the current sprite index (most recently pressed)
   * @returns {number} - Sprite index or -1 if no keys pressed
   */
  getCurrentSpriteIndex() {
    return this.lastSpriteIndex;
  },

  /**
   * Cleanup
   */
  destroy() {
    if (this._boundKeyDown) {
      document.removeEventListener('keydown', this._boundKeyDown, true);
    }
    if (this._boundKeyUp) {
      document.removeEventListener('keyup', this._boundKeyUp, true);
    }
    if (this._boundBlur) {
      window.removeEventListener('blur', this._boundBlur);
    }
  }
};
