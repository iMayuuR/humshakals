# 📦 Humshakals Release & Installation Guide

This guide explains how to build the application into an installer and distribute it to users.

## 🏗️ Building the Installer (For You)

To create the installation file (`.exe` for Windows), run this command in your terminal:

```bash
npm run build:win
```

### What happens next?
1.  The build process starts (compiling code, packaging Electron).
2.  Wait for ~2-5 minutes.
3.  Once finished, check the **`dist`** folder in your project directory.
4.  You will find an installer file named something like:
    *   `Humshakals Setup 1.0.0.exe`

## 🚀 Distributing to Users

You just need to share this **`.exe`** file with your users. You can share it via:
*   **Google Drive / Dropbox / Slack**
*   **GitHub Releases** (Recommended for Auto-Updates)

### Recommended: GitHub Releases (For Auto-Updates)
1.  Go to your GitHub repository > Releases > Draft a new release.
2.  Tag version: `v1.0.0`
3.  Upload the `.exe` file.
4.  Publish Release.
*Users who download this will automatically get updates when you publish `v1.0.1` etc.*

## 💿 Installing (For Users)

The user experience is simple:

1.  **Download:** User downloads `Humshakals Setup 1.0.0.exe`.
2.  **Run:** Double-click the file.
3.  **Install:** The setup runs automatically (no complex wizard).
4.  **Launch:**
    *   App opens automatically.
    *   Shortcut added to **Desktop**.
    *   Shortcut added to **Start Menu**.

## 🔄 Auto-Updates

When you release a new version (e.g., `v1.0.1`):
1.  Update version in `package.json`.
2.  Run `npm run build:win`.
3.  Upload new `.exe` to GitHub Releases.
4.  User's app will check for updates, download silently, and prompt to restart!

## ⚠️ Common Issues

*   **"Windows protected your PC" (SmartScreen):**
    *   Since the app is not code-signed (requires a paid certificate), Windows might show a blue warning.
    *   Tell users to click **"More info"** -> **"Run anyway"**.
