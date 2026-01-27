/**
 * Live2D Controller - Manages Live2D model rendering
 * Adapted for Chrome Extension from UmarufyBase
 */

window.UmaruifyLive2DController = {
  app: null,
  model: null,
  modelPath: '',
  modelBasePath: '',
  mouseTracking: true,
  initialized: false,

  // Configuration
  config: {
    scale: 1.16,
    offsetX: 0,
    offsetY: -0.005,
    horizontalFlip: false,
    mouseSensitivity: 1.5
  },

  // Parameter state
  params: {
    CatParamLeftHandDown: 0,
    ParamMouseX: 0,
    ParamMouseY: 0,
    ParamMouseLeftDown: 0,
    ParamMouseRightDown: 0
  },

  // Parameter indices map for direct access
  parameterIndices: null,
  cubismModel: null,
  coreModel: null,
  parameterMethod: null,

  // Debug logging state
  _lastLoggedHandDown: null,
  _lastLoggedIndex: null,

  /**
   * Initialize the Live2D canvas and load the model
   */
  async init() {
    const container = document.getElementById('umaruify-container');
    if (!container) {
      console.error('[Umaruify] Live2DController: Container not found');
      return false;
    }

    this.modelPath = container.dataset.model || '';
    // Get base path for model resources
    this.modelBasePath = this.modelPath.substring(0, this.modelPath.lastIndexOf('/') + 1);

    const canvas = document.getElementById('umaruify-live2d-canvas');
    if (!canvas) {
      console.error('[Umaruify] Live2DController: Canvas not found');
      return false;
    }

    if (typeof PIXI === 'undefined') {
      console.error('[Umaruify] Live2DController: PIXI not loaded');
      return false;
    }

    try {
      // Initialize PixiJS application
      this.app = new PIXI.Application({
        view: canvas,
        autoStart: true,
        width: 612,
        height: 352,
        backgroundColor: 0x000000,
        backgroundAlpha: 0,
        antialias: true
      });

      if (!PIXI.live2d || !PIXI.live2d.Live2DModel) {
        console.error('[Umaruify] Live2DController: live2d plugin not available');
        return false;
      }

      PIXI.live2d.Live2DModel.registerTicker(PIXI.Ticker);

      // Fetch and patch the model settings to use absolute URLs
      console.log('[Umaruify] Fetching model from:', this.modelPath);

      const response = await fetch(this.modelPath);
      if (!response.ok) {
        throw new Error(`Failed to fetch model: ${response.status}`);
      }

      const modelSettings = await response.json();
      console.log('[Umaruify] Model settings loaded');

      // Create model from settings with custom URL resolver
      this.model = await PIXI.live2d.Live2DModel.from(this.modelPath, {
        autoInteract: false,
        autoUpdate: true
      });

      this.configureModel();
      this.app.stage.addChild(this.model);
      this.setupMouseTracking();
      this.setupParameterOverride();

      this.initialized = true;
      console.log('[Umaruify] Live2DController: Model loaded successfully');

      return true;
    } catch (error) {
      console.error('[Umaruify] Live2DController: Failed to load model', error);
      return false;
    }
  },

  configureModel() {
    if (!this.model) return;

    const width = 612;
    const height = 352;

    const baseScale = this.config.scale * (height / 400);
    this.model.scale.set(baseScale);

    if (this.config.horizontalFlip) {
      this.model.scale.x *= -1;
    }

    this.model.anchor.set(0.5, 1);
    this.model.x = width / 2 + (this.config.offsetX * width);
    this.model.y = height + (this.config.offsetY * height);
  },

  setupMouseTracking() {
    document.addEventListener('mousemove', (e) => {
      if (!this.mouseTracking || !this.model) return;

      const rawX = (e.clientX / window.innerWidth - 0.5) * 2;
      const rawY = -((e.clientY / window.innerHeight - 0.5) * 2); // Inverted Y axis

      const sensitivity = this.config.mouseSensitivity;
      const x = Math.max(-30, Math.min(30, rawX * sensitivity * 30));
      const y = Math.max(-30, Math.min(30, rawY * sensitivity * 30));

      this.params.ParamMouseX = x;
      this.params.ParamMouseY = y;

      this.model.focus(
        Math.max(-1, Math.min(1, rawX * sensitivity)),
        Math.max(-1, Math.min(1, rawY * sensitivity))
      );
    });

    document.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.params.ParamMouseLeftDown = 1;
      } else if (e.button === 2) {
        this.params.ParamMouseRightDown = 1;
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) {
        this.params.ParamMouseLeftDown = 0;
      } else if (e.button === 2) {
        this.params.ParamMouseRightDown = 0;
      }
    });
  },

  /**
   * Setup parameter override by hooking into motionManager update
   * This ensures our parameters are applied AFTER the normal animation update
   */
  setupParameterOverride() {
    if (!this.model || !this.model.internalModel) return;

    const internalModel = this.model.internalModel;
    const coreModel = internalModel.coreModel;

    // Debug: Log the coreModel structure to understand what's available
    console.log('[Umaruify] coreModel type:', coreModel.constructor.name);
    console.log('[Umaruify] coreModel._model:', coreModel._model);

    // Store reference to coreModel for parameter setting
    this.coreModel = coreModel;

    // Try to build parameter index map using multiple approaches
    this.parameterIndices = {};
    this.parameterMethod = null;

    // Approach 1: coreModel._model has getParameterCount (inner Cubism model)
    const innerModel = coreModel._model;
    if (innerModel && typeof innerModel.getParameterCount === 'function') {
      console.log('[Umaruify] Using inner model (_model) for parameters');
      this.cubismModel = innerModel;
      this.buildParameterIndices(innerModel);
      this.parameterMethod = 'innerModel';
    }
    // Approach 2: coreModel has getParameterIndex (direct method)
    else if (typeof coreModel.getParameterIndex === 'function') {
      console.log('[Umaruify] Using coreModel.getParameterIndex');
      this.cubismModel = coreModel;
      this.parameterMethod = 'getParameterIndex';
    }
    // Approach 3: Use internalModel's parameter update method
    else {
      console.log('[Umaruify] Will use internalModel for parameters');
      this.parameterMethod = 'internalModel';
    }

    // Hook into motion manager update to apply our parameters after
    if (internalModel.motionManager) {
      const originalUpdate = internalModel.motionManager.update.bind(internalModel.motionManager);
      const self = this;

      internalModel.motionManager.update = function(model, now) {
        // Call original update first
        const result = originalUpdate(model, now);

        // Then apply our parameter overrides
        self.applyParameterOverrides();

        return result;
      };
      console.log('[Umaruify] MotionManager update hooked successfully');
    } else {
      console.warn('[Umaruify] MotionManager not found, using ticker fallback');
      // Fallback: use PIXI ticker to apply parameters
      const self = this;
      this.app.ticker.add(() => {
        self.applyParameterOverrides();
      });
      console.log('[Umaruify] Using PIXI ticker for parameter updates');
    }
  },

  /**
   * Build parameter indices map from a Cubism model
   */
  buildParameterIndices(model) {
    if (!model || typeof model.getParameterCount !== 'function') return;

    const count = model.getParameterCount();
    for (let i = 0; i < count; i++) {
      const idObj = model.getParameterId(i);
      let name = '';
      if (typeof idObj === 'string') {
        name = idObj;
      } else if (idObj && idObj.s) {
        name = idObj.s;
      } else if (idObj && typeof idObj.getString === 'function') {
        name = idObj.getString();
      } else {
        name = String(idObj);
      }

      this.parameterIndices[name] = i;
    }
    console.log('[Umaruify] Parameter indices built:', Object.keys(this.parameterIndices));
  },

  /**
   * Apply parameter overrides to the Cubism model
   */
  applyParameterOverrides() {
    if (!this.model || !this.model.internalModel) return;

    const coreModel = this.coreModel;
    if (!coreModel) return;

    // Only log when CatParamLeftHandDown changes (to avoid spam)
    const handDown = this.params.CatParamLeftHandDown;
    if (this._lastLoggedHandDown !== handDown) {
      console.log('[Umaruify] Live2D: applyParameterOverrides - CatParamLeftHandDown:', handDown, 'method:', this.parameterMethod);
      this._lastLoggedHandDown = handDown;
    }

    Object.entries(this.params).forEach(([name, value]) => {
      try {
        if (this.parameterMethod === 'innerModel' && this.cubismModel) {
          // Use pre-built indices with inner model
          const index = this.parameterIndices[name];
          if (index !== undefined && index >= 0) {
            this.cubismModel.setParameterValueByIndex(index, value);
          }
        } else if (this.parameterMethod === 'getParameterIndex') {
          // Use getParameterIndex directly on coreModel
          const index = coreModel.getParameterIndex(name);
          if (name === 'CatParamLeftHandDown' && this._lastLoggedHandDown !== this._lastLoggedIndex) {
            console.log('[Umaruify] Live2D: getParameterIndex("CatParamLeftHandDown") =', index);
            this._lastLoggedIndex = this._lastLoggedHandDown;
          }
          if (index >= 0) {
            coreModel.setParameterValueByIndex(index, value);
          }
        } else {
          // Fallback: try coreModel.setParameterValueById if available
          if (typeof coreModel.setParameterValueById === 'function') {
            coreModel.setParameterValueById(name, value);
          }
        }
      } catch (e) {
        console.error('[Umaruify] Live2D: applyParameterOverrides error for', name, ':', e.message);
      }
    });
  },

  setKeyboardPressed(pressed) {
    const value = pressed ? 1 : 0;
    this.params.CatParamLeftHandDown = value;
    console.log('[Umaruify] Live2D: setKeyboardPressed -', pressed, '-> CatParamLeftHandDown =', value);
  },

  setMouseLeftPressed(pressed) {
    this.params.ParamMouseLeftDown = pressed ? 1 : 0;
  },

  setMouseRightPressed(pressed) {
    this.params.ParamMouseRightDown = pressed ? 1 : 0;
  },

  setMouseTracking(enabled) {
    this.mouseTracking = enabled;
    if (!enabled) {
      this.params.ParamMouseX = 0;
      this.params.ParamMouseY = 0;
    }
  },

  destroy() {
    this.parameterIndices = null;
    this.cubismModel = null;
    this.coreModel = null;
    this.parameterMethod = null;
    if (this.model) {
      this.app.stage.removeChild(this.model);
      this.model.destroy();
    }
    if (this.app) {
      this.app.destroy(true);
    }
  }
};
