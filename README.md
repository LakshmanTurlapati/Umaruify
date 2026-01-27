<p align="center">
  <img src="umaruify-extension/icons/icon128.png" alt="Umaruify Logo" width="80">
</p>

<h1 align="center">Umaruify</h1>

<p align="center">
  <strong>An interactive anime companion for your browser</strong>
</p>

<p align="center">
  <a href="https://github.com/LakshmanTurlapati/Umaruify/stargazers"><img src="https://img.shields.io/github/stars/LakshmanTurlapati/Umaruify?style=for-the-badge&color=ff91a4" alt="Stars"></a>
  <a href="https://github.com/LakshmanTurlapati/Umaruify/network/members"><img src="https://img.shields.io/github/forks/LakshmanTurlapati/Umaruify?style=for-the-badge&color=ffb6c1" alt="Forks"></a>
  <a href="https://github.com/LakshmanTurlapati/Umaruify/issues"><img src="https://img.shields.io/github/issues/LakshmanTurlapati/Umaruify?style=for-the-badge&color=ff7089" alt="Issues"></a>
  <a href="https://github.com/LakshmanTurlapati/Umaruify/blob/main/LICENSE"><img src="https://img.shields.io/github/license/LakshmanTurlapati/Umaruify?style=for-the-badge&color=d4627a" alt="License"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Chrome Extension">
  <img src="https://img.shields.io/badge/Manifest-V3-34A853?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3">
  <img src="https://img.shields.io/badge/Live2D-Cubism%204-FF6F61?style=for-the-badge" alt="Live2D Cubism 4">
  <img src="https://img.shields.io/badge/PixiJS-Powered-E91E63?style=for-the-badge&logo=pixiv&logoColor=white" alt="PixiJS">
</p>

---

## About

Umaruify brings an adorable interactive anime companion to your web browsing experience. Inspired by Bongo Cat, this Chrome extension features a Live2D animated character that reacts to your keyboard input and follows your mouse cursor in real-time.

## Features

- **Live2D Animation** - Smooth, high-quality character animation powered by Live2D Cubism 4
- **Keyboard Reactions** - Character responds to 50+ keyboard keys with hand gestures and keyboard highlights
- **Mouse Tracking** - Eyes follow your cursor across the screen
- **Seamless Integration** - Works on any website without interfering with page content
- **Lightweight** - Minimal performance impact with optimized rendering
- **Easy Toggle** - Enable/disable with a single click from the popup

## Demo

<p align="center">
  <a href="https://www.youtube.com/watch?v=WtwWP2oQzw0">
    <img src="https://img.youtube.com/vi/WtwWP2oQzw0/maxresdefault.jpg" alt="Umaruify Demo Video" width="80%">
  </a>
</p>

<p align="center">
  <em>Click the image above to watch the demo video</em>
</p>

## Screenshots

<p align="center">
  <img src="Extras/Screenshot 2026-01-26 at 22.29.09.png" alt="Umaruify Screenshot 1" width="45%">
  &nbsp;&nbsp;
  <img src="Extras/Screenshot 2026-01-26 at 22.30.28.png" alt="Umaruify Screenshot 2" width="45%">
</p>

## Architecture

```mermaid
flowchart TB
    subgraph Browser["Chrome Browser"]
        subgraph Extension["Umaruify Extension"]
            Popup["Popup UI<br/>(Settings)"]
            Storage["Chrome Storage<br/>(Preferences)"]
        end

        subgraph ContentScript["Content Scripts (Injected)"]
            Content["content.js<br/>(Entry Point)"]
            App["app.js<br/>(Orchestrator)"]

            subgraph Modules["Core Modules"]
                KBHandler["keyboard-handler.js<br/>(Input Detection)"]
                Live2D["live2d-controller.js<br/>(Animation Engine)"]
                Sprites["sprite-overlay.js<br/>(Visual Overlays)"]
                ConfigMap["config-mapping.js<br/>(Key Mapping)"]
            end

            subgraph Rendering["Rendering Layer"]
                PixiJS["PixiJS Canvas"]
                Live2DModel["Live2D Model"]
                HandSprites["Hand Sprites (50)"]
                KBSprites["Keyboard Sprites (50)"]
            end
        end
    end

    subgraph UserInput["User Input"]
        Keyboard["Keyboard Events"]
        Mouse["Mouse Events"]
    end

    Popup <--> Storage
    Storage --> Content
    Content --> App
    App --> KBHandler
    App --> Live2D
    App --> Sprites
    KBHandler --> ConfigMap

    Keyboard --> KBHandler
    Mouse --> Live2D

    KBHandler --> Sprites
    KBHandler --> Live2D

    Live2D --> PixiJS
    PixiJS --> Live2DModel
    Sprites --> HandSprites
    Sprites --> KBSprites
```

### Component Overview

| Component | Responsibility |
|-----------|---------------|
| `content.js` | Creates overlay container and injects all elements into the page |
| `app.js` | Main orchestrator that initializes modules and coordinates events |
| `keyboard-handler.js` | Captures keyboard events and maps keys to sprite indices |
| `live2d-controller.js` | Manages Live2D model rendering with PixiJS and mouse tracking |
| `sprite-overlay.js` | Handles hand and keyboard sprite visibility |
| `config-mapping.js` | Maps 50 keycodes to corresponding sprite indices |

### Data Flow

```mermaid
sequenceDiagram
    participant User
    participant KeyboardHandler
    participant App
    participant Live2DController
    participant SpriteOverlay

    User->>KeyboardHandler: Keydown Event
    KeyboardHandler->>KeyboardHandler: Map keycode to sprite index
    KeyboardHandler->>App: onKeyPress(index)
    App->>Live2DController: setKeyboardActive(true)
    App->>SpriteOverlay: showHand(index)
    App->>SpriteOverlay: showKeyboard(index)

    User->>KeyboardHandler: Keyup Event
    KeyboardHandler->>App: onKeyRelease(index)
    App->>Live2DController: setKeyboardActive(false)
    App->>SpriteOverlay: hideHand()
    App->>SpriteOverlay: hideKeyboard()
```

## Installation

### From Source (Developer Mode)

1. Clone the repository:
   ```bash
   git clone https://github.com/LakshmanTurlapati/Umaruify.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable **Developer mode** (toggle in top-right corner)

4. Click **Load unpacked** and select the `umaruify-extension` folder

5. The extension icon should appear in your toolbar

### Usage

1. Click the Umaruify icon in your Chrome toolbar
2. Toggle the extension on/off using the checkbox
3. Visit any website and start typing to see the character react

## Project Structure

```
umaruify-extension/
├── manifest.json          # Extension configuration (Manifest V3)
├── content/
│   ├── content.js         # Page injection entry point
│   └── content.css        # Overlay container styles
├── js/
│   ├── app.js             # Main application coordinator
│   ├── keyboard-handler.js
│   ├── live2d-controller.js
│   ├── sprite-overlay.js
│   └── config-mapping.js
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── lib/                   # Third-party libraries (PixiJS, Live2D)
├── models/                # Live2D model assets
├── assets/                # Hand and keyboard sprites
└── icons/                 # Extension icons
```

## Tech Stack

- **Chrome Extension Manifest V3** - Modern extension architecture
- **Live2D Cubism 4** - High-quality 2D animation
- **PixiJS** - Fast 2D WebGL renderer
- **Vanilla JavaScript** - No framework dependencies

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contributions

- Add more character expressions and animations
- Support for additional browsers (Firefox, Edge)
- Customizable keyboard mappings
- Sound effects option
- Multiple character skins
- Performance optimizations

## Acknowledgments

- Live2D Inc. for the Cubism SDK
- PixiJS team for the rendering engine
- The Bongo Cat meme for inspiration

---

<p align="center">
  <img src="Extras/banner.png" alt="Umaruify Banner" width="100%">
</p>

<p align="center">
  <strong>Made by <a href="https://www.parzival.live">Lakshman Turlapati</a></strong>
</p>

<p align="center">
  <a href="https://staging.d364wjsbiwvjpv.amplifyapp.com">
    <img src="https://img.shields.io/badge/Live_Demo-Visit_Site-c4836a?style=for-the-badge" alt="Live Demo">
  </a>
  <a href="https://www.parzival.live">
    <img src="https://img.shields.io/badge/More_Works-parzival.live-e8a090?style=for-the-badge" alt="More Works">
  </a>
  <a href="https://github.com/LakshmanTurlapati">
    <img src="https://img.shields.io/badge/GitHub-LakshmanTurlapati-181717?style=for-the-badge&logo=github" alt="GitHub">
  </a>
</p>
