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

  animationFrame: null,

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
      this.startParameterUpdateLoop();

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
      const rawY = (e.clientY / window.innerHeight - 0.5) * 2;

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

  startParameterUpdateLoop() {
    const updateLoop = () => {
      this.applyParameters();
      this.animationFrame = requestAnimationFrame(updateLoop);
    };
    updateLoop();
  },

  applyParameters() {
    if (!this.model || !this.model.internalModel) return;

    try {
      const coreModel = this.model.internalModel.coreModel;

      Object.entries(this.params).forEach(([name, value]) => {
        const index = coreModel.getParameterIndex(name);
        if (index >= 0) {
          coreModel.setParameterValueByIndex(index, value);
        }
      });
    } catch (error) {
      // Silently handle
    }
  },

  setKeyboardPressed(pressed) {
    this.params.CatParamLeftHandDown = pressed ? 1 : 0;
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
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.model) {
      this.app.stage.removeChild(this.model);
      this.model.destroy();
    }
    if (this.app) {
      this.app.destroy(true);
    }
  }
};
