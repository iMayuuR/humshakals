# Changelog

All notable changes to this project will be documented in this file.

## [3.0.0] - 2026-02-12

### 🚀 Major Enhancements
- **Electron v40 Core Upgrade**: Migrated the application core to Electron 40.4.0 (Chromium 132), delivering significant performance improvements, enhanced security patches, and modern web standards support.
- **Automated Update System**: Integrated a robust auto-update mechanism. The application now silently downloads updates in the background and prompts for a restart, ensuring users are always on the latest version.
- **CI/CD Pipeline**: Established a GitHub Actions workflow for automated cross-platform builds.
    - **Windows**: Generates `.exe` installers.
    - **macOS**: Generates `.dmg` disk images (unsigned).
- **Refined User Interface**:
    - **"About" Modal**: Redesigned for clarity, featuring vertically stacked system information and a dedicated "Check for Updates" button.
    - **Platform Independence**: Removed platform-specific indicators for a cleaner look.

### 🛠 Technical Improvements
- **TypeScript Architecture**: resolved persistent type definition conflicts by restructuring global declarations (`env.d.ts`, `electron.d.ts`), resulting in a stable and error-free development environment.
- **Dependency Management**: Updated all core dependencies (`electron-builder`, `electron-vite`, `@electron-toolkit`) to their latest stable versions.

### 🐛 Fixes
- Addressed various type safety issues in the renderer process.
- Fixed `Window.api` interface augmentation for better intellisense.

## [1.0.0] - 2026-02-09

### 🚀 New Features

- **Multi-Device Preview**: Simultaneously view and interact with your website on 20+ devices ranging from mobile phones to 4K desktops.
- **Touch Emulation**: 
    - Dedicated touch cursor for mobile and tablet devices.
    - Natural **drag-to-scroll** behavior with momentum/inertia.
    - Horizontal scroll support for carousels and sliders.
    - Accurately scoped to mobile views only (does not affect desktop views).
- **Synchronized Interaction**:
    - **Scroll Sync**: Scrolling on one device scrolls all others proportionally.
    - **Click Sync**: Clicks and interactions are mirrored across all active devices.
    - **Navigation Sync**: Navigating to a URL updates all devices instantly.
- **Smart Device List**:
    - Added latest flagship devices: **iPhone 16 Pro Max**, **Samsung Galaxy S25 Ultra**, **iPad Pro 13" M4**.
    - Included **custom scaled desktops**: 1080p @ 150% and 1200p @ 150% for high-DPI testing.
    - **Auto-load**: Newly added devices automatically load the current active URL.
- **Device Selector**:
    - Grouped dropdown for easy addition of Phones, Tablets, and Desktops.
    - Toggle mechanism to quickly show/hide specific devices.
- **Auto-Update System**:
    - Seamless background updates via GitHub Releases.
    - Silent download with "Restart to Update" prompt.

### 🛠 Improvements
- **Performance**: Optimized rendering for multiple webviews.
- **UI/UX**: Clean, dark-themed interface with responsive toolbar.
- **Zoom Controls**: Global zoom support to fit many devices on one screen.
- **Device Emulation**: Accurate user-agent and viewport emulation for all devices.

### 🐛 Fixes
- Fixed issue where touch cursor appeared on desktop devices.
- Resolved horizontal scrolling issues in touch emulation.
- Fixed blank screen issue when adding devices after URL load.
