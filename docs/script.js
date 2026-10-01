// Shared by the published static page and the optional animated Vite preview.
// The static script runs after parsing; the Vite entry calls this after React mounts.
const latestReleaseUrl = 'https://github.com/iMayuuR/humshakals/releases/latest';
const latestReleaseApi = 'https://api.github.com/repos/iMayuuR/humshakals/releases/latest';

// Only official, complete release assets are eligible for direct download links.
// A missing or malformed asset leaves every button on the safe latest-release page.
function resolveLatestReleaseAssets(release) {
  if (!release || release.draft !== false || release.prerelease !== false
    || !/^v\d+\.\d+\.\d+$/.test(release.tag_name) || !Array.isArray(release.assets)) return null;
  const version = release.tag_name.slice(1);
  const names = {
    windows: `Humshakals-Setup-${version}.exe`,
    mac: `Humshakals-${version}-universal.dmg`,
    checksum: 'SHA256SUMS.txt'
  };
  const assets = {};
  for (const [kind, name] of Object.entries(names)) {
    const url = `https://github.com/iMayuuR/humshakals/releases/download/${release.tag_name}/${name}`;
    const asset = release.assets.find(item => item && item.name === name
      && item.state === 'uploaded' && Number.isSafeInteger(item.size) && item.size > 0
      && item.browser_download_url === url);
    if (!asset) return null;
    assets[kind] = { name, url };
  }
  return { tag: release.tag_name, assets };
}

function renderLatestReleaseAssets(release) {
  const { tag, assets } = release;
  document.querySelectorAll('[data-release-asset]').forEach(link => {
    const asset = assets[link.dataset.releaseAsset];
    if (!asset) return;
    link.href = asset.url;
    const label = link.querySelector('[data-download-label]');
    if (label) label.textContent = link.closest('.hero__actions')
      ? (link.dataset.releaseAsset === 'windows' ? 'Download for Windows' : 'Download for macOS')
      : (link.dataset.releaseAsset === 'windows' ? 'Download Windows setup' : 'Download macOS DMG');
  });
  const kicker = document.querySelector('[data-release-kicker]');
  if (kicker) kicker.textContent = `FIRST-TIME INSTALL / ${tag.toUpperCase()}`;
  for (const kind of ['windows', 'mac']) {
    const file = document.querySelector(`[data-release-file="${kind}"]`);
    if (file) file.textContent = assets[kind].name;
  }
  const windowsCommand = document.querySelector('[data-release-command="windows"]');
  if (windowsCommand) windowsCommand.textContent =
    `Get-FileHash "$env:USERPROFILE\\Downloads\\${assets.windows.name}" -Algorithm SHA256`;
  const macCommand = document.querySelector('[data-release-command="mac"]');
  if (macCommand) macCommand.textContent = `shasum -a 256 ~/Downloads/${assets.mac.name}`;
  document.querySelectorAll('[data-release-status]').forEach(node => {
    node.textContent = `${tag} · direct installers ready. Check the release notes before installing.`;
  });
}

function renderLatestReleaseFallback() {
  document.querySelectorAll('[data-release-asset]').forEach(link => {
    link.href = latestReleaseUrl;
    const label = link.querySelector('[data-download-label]');
    if (label) label.textContent = link.closest('.hero__actions')
      ? (link.dataset.releaseAsset === 'windows' ? 'Get for Windows' : 'Get for macOS')
      : (link.dataset.releaseAsset === 'windows' ? 'Windows setup on GitHub' : 'macOS DMG on GitHub');
  });
  const kicker = document.querySelector('[data-release-kicker]');
  if (kicker) kicker.textContent = 'FIRST-TIME INSTALL / LATEST RELEASE';
  const files = {
    windows: 'the latest Windows .exe',
    mac: 'the latest universal .dmg'
  };
  for (const [kind, name] of Object.entries(files)) {
    const file = document.querySelector(`[data-release-file="${kind}"]`);
    if (file) file.textContent = name;
  }
  const windowsCommand = document.querySelector('[data-release-command="windows"]');
  if (windowsCommand) windowsCommand.textContent =
    'Get-FileHash "C:\\path\\to\\downloaded-setup.exe" -Algorithm SHA256';
  const macCommand = document.querySelector('[data-release-command="mac"]');
  if (macCommand) macCommand.textContent = 'shasum -a 256 ~/Downloads/your-downloaded-file.dmg';
  document.querySelectorAll('[data-release-status]').forEach(node => {
    node.textContent = 'Direct links unavailable right now; choose your installer on the latest GitHub release.';
  });
}

async function updateLatestReleaseDownloads() {
  if (!document.querySelector('[data-release-asset]')) return;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(latestReleaseApi, {
      headers: { Accept: 'application/vnd.github+json' },
      cache: 'no-store',
      signal: controller.signal
    });
    if (!response.ok) throw new Error('Latest release unavailable');
    const release = resolveLatestReleaseAssets(await response.json());
    if (!release) throw new Error('Latest release has no complete installer set');
    renderLatestReleaseAssets(release);
  } catch {
    renderLatestReleaseFallback();
  } finally {
    clearTimeout(timeout);
  }
}

function initHumshakalsLanding() {
  const siteHeader = document.querySelector('.site-header');
  if (!siteHeader || siteHeader.dataset.interactionsReady === 'true') return;
  siteHeader.dataset.interactionsReady = 'true';

  const menuButton = document.querySelector('.menu-toggle');
  const primaryNav = document.getElementById('primary-nav');

  function closeMenu() {
    if (!menuButton || !primaryNav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    primaryNav.classList.remove('is-open');
  }

  if (menuButton && primaryNav) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      primaryNav.classList.toggle('is-open', open);
    });

    primaryNav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', (event) => {
      if (!primaryNav.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    window.matchMedia('(min-width: 951px)').addEventListener('change', closeMenu);
  }

  const demoTabs = Array.from(document.querySelectorAll('[data-demo-tab]'));

  function activateDemoTab(tab, focus = false) {
    if (!tab) return;
    demoTabs.forEach((item) => {
      const active = item === tab;
      const panel = document.getElementById(item.getAttribute('aria-controls'));
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
      if (panel) panel.hidden = !active;
    });
    if (focus) tab.focus();
  }

  demoTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateDemoTab(tab));
    tab.addEventListener('keydown', (event) => {
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % demoTabs.length;
      else if (event.key === 'ArrowLeft') next = (index - 1 + demoTabs.length) % demoTabs.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = demoTabs.length - 1;
      else return;
      event.preventDefault();
      activateDemoTab(demoTabs[next], true);
    });
  });

  const year = document.getElementById('current-year');
  if (year) year.textContent = String(new Date().getFullYear());
  void updateLatestReleaseDownloads();
}

window.initHumshakalsLanding = initHumshakalsLanding;
initHumshakalsLanding();
