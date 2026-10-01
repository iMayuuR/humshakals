# Humshakals

[Explore the Humshakals app preview](https://imayuur.github.io/humshakals/) — a multi-device desktop browser workspace with responsive previews, browser-agent assistance and local test automation.

This public repository owns the static landing page in `docs/`, the [release-publishing workflow](.github/workflows/publish-release.yml), and [GitHub Releases](https://github.com/iMayuuR/humshakals/releases). The application source, development history and installer build workflow stay in a private repository. GitHub's automatically generated “Source code” archives for releases contain this landing-page repository, **not** the source used to build an installer.

For a future approved version, private CI builds and verifies signed installers, stages only binaries/updater metadata/checksums in a public **draft**, and dispatches this public workflow. The public workflow validates the draft and publishes it. Installed apps check these public Releases for a newer version; they currently open the release page for a **manual install**, not a silent download or installation. A missing token, failed build, missing asset or failed verification leaves the release unpublished.

Humshakals is a product preview. New public installers are pending code-signing, dependency scanning and packaged-platform QA. Please verify the publisher and signature of any installer before running it.

Developed & engineered by Mayur Dattatray Patil · [GitHub](https://github.com/iMayuuR) · [@MayurXplorer](https://www.instagram.com/MayurXplorer/)
