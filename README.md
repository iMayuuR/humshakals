# Humshakals

[Explore the Humshakals app preview](https://imayuur.github.io/humshakals/) — a multi-device desktop browser workspace with responsive previews, browser-agent assistance and local test automation.

This public repository owns the static landing page in `docs/`, the [release-publishing workflow](.github/workflows/publish-release.yml), and [GitHub Releases](https://github.com/iMayuuR/humshakals/releases). The application source, development history and installer build workflow stay in a private repository. GitHub's automatically generated “Source code” archives for releases contain this landing-page repository, **not** the source used to build an installer.

Humshakals distributes **unsigned Windows/macOS installers** as its production format. Download from the official [public release](https://github.com/iMayuuR/humshakals/releases/latest); its `SHA256SUMS.txt` supports an optional integrity check. Windows SmartScreen or macOS Gatekeeper may still prompt or block installation.

**Starting with v3.9.8, updates replace the installed app.** A verified download starts a visible 30-second restart countdown. Choose **Later** to finish your work, or **Restart & update** to install immediately. Humshakals closes, updates its existing installation and reopens, retaining saved layouts/settings. Windows preserves the registered installation folder and scope; macOS restores the previous bundle if the updated app cannot start.

**One-time upgrade from v3.9.7 or earlier:** quit the old app and install v3.9.8 into the same location. On macOS, replace the existing `Applications/Humshakals.app` and launch that copy. On Windows, run the official Setup installer for the existing installation. Older binaries contain download-only code; they cannot acquire automatic replacement until this first manual upgrade. System permission/security prompts may still need your action.

The [landing page](https://imayuur.github.io/humshakals/#install) resolves the latest published release on each visit and links directly to its Windows setup, macOS DMG and checksum file when all three verified asset names are present. If GitHub's public release API is unavailable or the set is incomplete, the buttons fall back to the official latest-release page. This website behavior does not install updates inside the app.

The public publishing workflow verifies uploaded asset hashes and updater metadata. Installed-upgrade checks cover Windows NSIS replacement/relaunch and macOS native replacement, startup and rollback on the release's CI runners. These checks do not provide publisher signatures or establish compatibility with every OS configuration. The private signing pipeline remains separate; do not disable operating-system security protections globally.

First time installing? The [Windows/macOS guide](https://imayuur.github.io/humshakals/#install) covers checksum verification, SmartScreen and macOS first-launch prompts. It also explains when to stop rather than override a security block.

Developed & engineered by Mayur Dattatray Patil · [GitHub](https://github.com/iMayuuR) · [@MayurXplorer](https://www.instagram.com/MayurXplorer/)
