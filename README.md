# Auto Repeat for YouTube Music

A Chrome extension designed to automatically maintain and apply your preferred repeat settings on YouTube Music.
Whether you close the tab or switch songs, this extension ensures your desired repeat mode (One, All, or Off) stays consistent for an uninterrupted listening experience.

## 🚀 Key Features

- **Automatic Persistence**: Restores your last-used repeat mode automatically after browser restarts or page reloads.
- **Intuitive UI**: Easily select repeat modes from the extension popup, with the current status reflected in the extension's icon badge.
- **Robust Control**: Handles YouTube Music's complex internal structures (Shadow DOM and internal components) using `MutationObserver` to reliably control the repeat button.

## 🛠 Tech Stack

- **Language**: TypeScript (with a JavaScript bridge for Main World access)
- **Framework/Bundler**: [Vite](https://vitejs.dev/) + [@crxjs/vite-plugin](https://crxjs.dev/vite-plugin) (Manifest V3)
- **Testing**: [Vitest](https://vitest.dev/) + jsdom
- **Storage**: Chrome Extension Storage API

## 📂 Project Structure

```text
├── src/
│   ├── background.ts    # Service Worker: Lifecycle management, badge updates
│   ├── content.ts       # Content Script: DOM monitoring and repeat control
│   ├── bridge.js        # Main World Bridge: Direct access to YTM internal state
│   ├── popup.ts/html    # Popup UI logic and design
│   ├── manifest.json    # Extension metadata definition
│   └── types.ts         # Type definitions
├── tests/               # Unit and integration tests using Vitest
```

## 🛠 Developer Setup

### Prerequisites
- Node.js 18 or higher
- Google Chrome browser

### Installation & Development
```bash
# Install dependencies
npm install

# Start development mode (with hot-reload)
npm run dev

# Build the project (output to dist/ folder)
npm run build

# Package for release (generates zip in releases/ folder)
npm run package

# Run tests
npm test
```

### Loading the Extension
1. Open `chrome://extensions/` in Chrome.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `dist` directory of this project.


On every push to the `main` branch, the CI/CD pipeline will automatically determine the next version, update `package.json`, generate a changelog, create a git tag, and publish a new GitHub Release with the extension ZIP attached.

## 📄 License

ISC License
