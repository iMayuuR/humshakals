# Humshakals

[Explore the Humshakals app preview](https://imayuur.github.io/humshakals/) — a multi-device desktop browser workspace with responsive previews, browser-agent assistance and local test automation.

This public repository owns the static landing page in `docs/`, the [release-publishing workflow](.github/workflows/publish-release.yml), and [GitHub Releases](https://github.com/iMayuuR/humshakals/releases). The application source, development history and installer build workflow stay in a private repository. GitHub's automatically generated “Source code” archives for releases contain this landing-page repository, **not** the source used to build an installer.

The current `v3.8.9` release is an explicitly **unsigned, unnotarized manual-install build**. Windows SmartScreen or macOS Gatekeeper may warn or block it; some managed devices will not offer an override. It has not passed the signed packaged-platform release matrix. Download only from [the official release](https://github.com/iMayuuR/humshakals/releases/tag/v3.8.9) and compare the files with its `SHA256SUMS.txt`. Humshakals checks these public Releases for a newer version but does **not** silently download or install updates.

The [landing page](https://imayuur.github.io/humshakals/#install) resolves the latest published release on each visit and links directly to its Windows setup, macOS DMG and checksum file when all three verified asset names are present. If GitHub's public release API is unavailable or the set is incomplete, the buttons fall back to the official latest-release page. This website behavior does not install updates inside the app.

The private signed-release pipeline remains separate and requires Windows/macOS signing, Apple notarization and packaged QA. The public publishing workflow verifies uploaded asset hashes and updater metadata; those checks do **not** turn an unsigned installer into a signed one. Future production-ready installers remain pending signing and packaged-platform QA. Do not disable operating-system security protections globally to run this build.

First time installing? The [Windows/macOS guide](https://imayuur.github.io/humshakals/#install) covers checksum verification, SmartScreen and macOS first-launch prompts. It also explains when to stop rather than override a security block.

Developed & engineered by Mayur Dattatray Patil · [GitHub](https://github.com/iMayuuR) · [@MayurXplorer](https://www.instagram.com/MayurXplorer/)
