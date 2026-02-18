# 🛡️ Installation Safety & "Tigdam" Guide

Since this is a private/developer tool and we haven't bought a $400/year "Code Signing Certificate", Windows will show a blue screen warning (**SmartScreen**) saying "Windows protected your PC".

Here is the "Tigdam" (Workaround) to install it safely and easily.

## Method 1: The "Run Anyway" Trick (Standard)

When the blue box appears:
1.  Click **"More info"** text (it's small and underlined).
2.  A new button **"Run anyway"** will appear.
3.  Click it.
*You only have to do this once. Windows will remember it.*

## Method 2: The "Unblock" Trick (Pro)

To prevent the warning entirely for a specific file:
1.  Right-click the downloaded `.exe` file.
2.  Go to **Properties**.
3.  At the bottom of the "General" tab, look for a standard security options.
4.  Check the box **✅ Unblock**.
5.  Click **Apply** > **OK**.
6.  Now run the installer - no warning!

## Method 3: Browser "Keep" Trick

If Chrome/Edge says "This file is not commonly downloaded":
1.  Click the **three dots** (...) on the download item.
2.  Select **Keep**.
3.  Click **Show more** > **Keep anyway**.

---

## Why this happens?
This isn't a virus warning. It just means "Microsoft doesn't know this publisher yet". To remove this officially, developers have to pay ~30,000 INR/year for a certificate. For free tools, using the "More info" trick is the standard way!
