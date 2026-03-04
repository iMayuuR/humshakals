# 🛡️ Installation and Security Guidelines

Because Humshakals is an open-source developer tool distributed independently, it currently does not utilize paid Code Signing Certificates. As a result, operating systems like Windows may display security warnings prior to installation.

Below are the standard procedures to safely bypass these warnings and install the application.

## Method 1: The "Run Anyway" Option (Standard)

When the blue box appears:
1.  Click **"More info"** text (it's small and underlined).
2.  A new button **"Run anyway"** will appear.
3.  Click it.
*Note: Windows will remember this preference for future launches of this specific version.*

## Method 2: Unblocking the Executable (Advanced)

To prevent the warning entirely for a specific file:
1.  Right-click the downloaded `.exe` file.
2.  Go to **Properties**.
3.  At the bottom of the "General" tab, look for a standard security options.
4.  Check the box **✅ Unblock**.
5.  Click **Apply** > **OK**.
6.  Now run the installer.

## Method 3: Browser Download Warnings

If Chrome/Edge says "This file is not commonly downloaded":
1.  Click the **three dots** (...) on the download item.
2.  Select **Keep**.
3.  Click **Show more** > **Keep anyway**.

---

## 🍏 macOS: "App is damaged and can't be opened"

If you are on macOS (Sequoia, Sonoma, etc.) and get an error saying **"Humshakals is damaged and can't be opened. You should move it to the Trash."**, this is macOS Gatekeeper blocking the app because it doesn't have a paid Apple Developer signature.

**The Fix (xattr trick):**
1. Drag `Humshakals.app` from the DMG into your **Applications** folder.
2. Open the **Terminal** app (Command + Space > type "Terminal").
3. Paste this exact command and hit Enter:
   ```bash
   xattr -cr /Applications/Humshakals.app
   ```
4. Now double-click the app in your Applications folder. It will open perfectly!

---

## Technical Context
These security prompts do not indicate the presence of malware. They simply denote that the publisher is unverified within the Apple or Microsoft ecosystems. Utilizing these manual bypass methods is standard practice for free and open-source applications.
