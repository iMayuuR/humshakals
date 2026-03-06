# Humshakals
### The Ultimate Responsive Design Browser 📱💻

**Humshakals** is a powerful desktop tool for developers to build, test, and debug responsive web applications. Mirror your website across 20+ devices simultaneously — from the latest iPhones to 4K desktops — with synchronized scrolling, clicks, and interactions.

![Humshakals App](resources/icon.png)

## 🚀 Key Features

*   **📱 Multi-Device Mirroring:** Preview your site on flagship devices including iPhone 16 Pro Max, Samsung S25 Ultra, and iPad Pro with pixel-perfect accuracy.
*   **👆 True Native DevTools Touch:** Uses pure Chrome DevTools Protocol (CDP) for flawless touch emulation. Features a seamless **Global UI Toggle** to command precise Mobile Drag-to-Scroll and momentum swiping natively, even across cross-origin IFrames.
*   **🌐 Smart Browsing Tools:** Fully-featured address bar with auto-search fallback, `Ctrl+Enter` domain resolution, integrated bookmarks system, and one-click tools to clear Cache, Cookies, and Storage across all emulated devices.
*   **🔄 Synchronized Testing:**
    *   **Click Sync:** Interaction events are propagated instantly to all devices.
    *   **Navigation Sync:** Unified browsing experience across the entire device suite.
*   **🛡 DevTools Pocket:** A lightweight, built-in monitoring panel per device:
    *   **Console Errors** — Capture and filter by source domain (comma-separated).
    *   **Console Logs** — Exact-match and numeric log detection with comma-separated filters.
    *   **Network Requests** — Intercept completed network calls, filter by URL path (comma-separated).
    *   **Color-Coded Stacking Toasts** — 🔴 Errors, 🟡 Logs, 🔵 Network, 🟢 Success with smooth slide-in animations.
    *   **Download Reports** — Export captured events as `.txt` files.
*   **⚡ Performance Core:** Powered by Electron v40 (Chromium 132) for blazing-fast rendering and modern web standards compliance.
*   **🛠 Developer Tools:** Inspect elements, debug issues, and analyze layouts with per-device DevTools.
*   **🎨 Light & Dark Themes:** Full theme support with smooth transitions.
*   **📦 Automated Updates:** Seamless background updates ensure you are always running the latest version.

## 📥 Installation

### Windows
1.  Navigate to the [Releases](https://github.com/iMayuuR/humshakals/releases) page.
2.  Download the latest installer (`.exe`).
3.  Run the installer to launch the application.

### macOS
1.  Navigate to the [Releases](https://github.com/iMayuuR/humshakals/releases) page.
2.  Download the disk image (`.dmg`).
3.  Drag **Humshakals** to your Applications folder.
    > **Note:** As the binaries are currently unsigned, you may need to Right-Click the app and select "Open" on the first launch to bypass security warnings.

## 🛠 Development

To run Humshakals locally:

```bash
# Clone the repository
git clone https://github.com/iMayuuR/humshakals.git

# Install dependencies
npm install

# Run in development mode
npm run dev
```

## 📦 Build & Release

To build the application for production:

```bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux
```

## 📜 License

MIT © Mayur Panchal
