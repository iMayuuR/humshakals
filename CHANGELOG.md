# Changelog

All notable changes to this project will be documented in this file.

## [3.2.0] - 2026-02-27

### 🚀 Major Enhancements
- **DevTools Pocket**: New built-in monitoring panel per device with three segregated tabs:
  - **Console Errors** — Captures errors filtered by source URL/domain. Supports comma-separated domain entries.
  - **Console Logs** — Detects exact-match and numeric console logs. Auto-captures all pure-numeric logs; supports comma-separated filters.
  - **Network Requests** — Intercepts completed network calls via `session.webRequest.onCompleted` (IPC relay from main process). Filters by URL path only (ignores query strings to avoid tracking pixel false positives). Supports comma-separated patterns.
- **Color-Coded Stacking Toast Notifications**: Toasts are now color-coded by event type (🔴 error, 🟡 log, 🔵 network, 🟢 success). Multiple toasts stack vertically with smooth CSS slide-in animations and progressive opacity fade for older items.
- **Responsive BugPopup UI**: The DevTools Pocket popup now adapts to device viewport width (260px fixed with max-width fallback), ensuring it fits on small mobile devices without overflow.
- **Light/Dark Theme Fixes**: Fixed button text visibility in light mode (Download, Save Rules). Added `.btn-cta` utility for always-white CTA text.

### 🔒 Security Hardening
- **Path Traversal Prevention**: `store-get`/`store-set` IPC handlers now validate keys against a safe alphanumeric pattern.
- **Filename Sanitization**: `save-screenshot` and `save-bug-report` handlers use `path.basename()` to strip directory traversal.
- **Permission Restriction**: Device session permissions restricted from blanket-grant to clipboard-only.
- **Protocol Allowlist Hardened**: Removed `data:`, `blob:`, `file:`, `devtools:` from external URL allowlist (only `http:`, `https:`, `mailto:` allowed).
- **IPC Listener Cleanup**: Replaced `removeAllListeners` with `removeListener` in preload to prevent cross-component interference.
- **Event Accumulation Cap**: DevTools Pocket events capped at 500 per device to prevent unbounded memory growth.
- **Consolidated Security Constants**: Unified 3 duplicate `ALLOWED_PROTOCOLS` definitions into a single module-level constant.
- **Anti-Bot Switches Documented**: Added security trade-off documentation for disabled browser features.

### 🛠 Technical Improvements
- **Network Monitoring Architecture**: Replaced deprecated `did-get-response-details` webview event with `session.webRequest.onCompleted` + IPC relay. Dynamic session attachment via `app.on('web-contents-created')`.
- **Framework Noise Filter**: Console messages from AMP, GTM, DoubleClick, and other ad/analytics frameworks are automatically filtered out.
- **DevTools Pocket Icon**: Changed from bug icon to terminal icon (`ic:round-terminal`).
- **Protocol Leak Blocking**: Added `gmsg://`, `intent://`, `market://`, `fb://`, `whatsapp://`, `tg://`, `viber://` to blocked protocols.
- **Removed Unused Dependency**: Uninstalled `electron-store` (replaced by custom fs-based JSON storage).

### 🐛 Fixes
- Fixed DevTools Pocket popup not toggling (only opened, never closed on click).
- Fixed `will-frame-navigate` type cast for Electron v40 compatibility.

## [3.1.0] - 2026-02-25

### 🚀 Major Enhancements
- **True Native DevTools Emulation**: Replaced the custom JavaScript-injected mobile touch and layout systems with the core Chromium `DevTools Protocol (CDP)`.
- **Global Touch Toggle**: Added a explicit UI toggle on the toolbar that safely commands native mobile Touch and momentum-scroll to active devices via CDP bindings without bleeding into the app bounds.
- **Cross-Origin Iframe Support**: The new native CDP touch perfectly scales and propagates pointer drags universally, meaning mobile nested scroll areas inside independent third-party IFrames now work flawlessly.

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
