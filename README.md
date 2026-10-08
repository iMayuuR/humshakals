# Humshakals

[Explore the Humshakals app preview](https://imayuur.github.io/humshakals/) — a multi-device desktop browser workspace with responsive previews, browser-agent assistance and local test automation.

This public repository owns the static landing page in `docs/`, the [release-publishing workflow](.github/workflows/publish-release.yml), and [GitHub Releases](https://github.com/iMayuuR/humshakals/releases). The application source, development history and installer build workflow stay in a private repository. GitHub's automatically generated “Source code” archives for releases contain this landing-page repository, **not** the source used to build an installer.

The latest [public release](https://github.com/iMayuuR/humshakals/releases/latest) is an explicitly **unsigned, unnotarized manual-install build** until signing and packaged-platform QA are complete. Windows SmartScreen or macOS Gatekeeper may warn or block it; some managed devices will not offer an override. Download only from the official release and compare the files with its `SHA256SUMS.txt`. Installed v3.9.3+ builds automatically download and SHA-256-verify a newer Windows/macOS installer from the public release, then offer to reveal it; installation remains an explicit user action. Older builds need a manual upgrade to gain this downloader.

The [landing page](https://imayuur.github.io/humshakals/#install) resolves the latest published release on each visit and links directly to its Windows setup, macOS DMG and checksum file when all three verified asset names are present. If GitHub's public release API is unavailable or the set is incomplete, the buttons fall back to the official latest-release page. This website behavior does not install updates inside the app.

The private signed-release pipeline remains separate and requires Windows/macOS signing, Apple notarization and packaged QA. The public publishing workflow verifies uploaded asset hashes and updater metadata; those checks do **not** turn an unsigned installer into a signed one. Future production-ready installers remain pending signing and packaged-platform QA. Do not disable operating-system security protections globally to run this build.

First time installing? The [Windows/macOS guide](https://imayuur.github.io/humshakals/#install) covers checksum verification, SmartScreen and macOS first-launch prompts. It also explains when to stop rather than override a security block.

Developed & engineered by Mayur Dattatray Patil · [GitHub](https://github.com/iMayuuR) · [@MayurXplorer](https://www.instagram.com/MayurXplorer/)
