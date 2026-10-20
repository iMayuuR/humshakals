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

function initDuoLaunch() {
  const root = document.querySelector('[data-duo-demo]');
  if (!root || root.dataset.duoReady) return;
  root.dataset.duoReady = 'true';
  const stage = root.querySelector('[data-duo-stage]');
  const range = root.querySelector('[data-duo-angle]');
  const output = root.querySelector('[data-duo-angle-value]');
  const play = root.querySelector('[data-duo-play]');
  const buttons = [...root.querySelectorAll('[data-duo-posture]')];
  const template = root.querySelector('#duo-page-art');
  root.querySelectorAll('[data-duo-page]').forEach(pane => pane.append(template.content.cloneNode(true)));
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const states = {
    folded: { angle: 0, name: 'Folded', caption: 'A compact display. The same journey.' },
    half: { angle: 110, name: 'Half-folded', caption: 'Find what happens between breakpoints.' },
    unfolded: { angle: 180, name: 'Unfolded', caption: 'Open up a wider canvas.' }
  };
  const sequence = [110, 0, 110, 180];
  let angle = 180, playing = !motion.matches, inView = true;
  let frame = 0, last = 0, hold = 1400, step = 0, move = null, displayed = -1;

  function render(value) {
    angle = Math.max(0, Math.min(180, value));
    stage.style.setProperty('--duo-hinge', `${angle - 180}deg`);
    stage.style.setProperty('--duo-center', `${(1 - angle / 180) * 120}px`);
    stage.style.setProperty('--duo-lift', `${(1 - angle / 180) * 8}px`);
    const rounded = Math.round(angle);
    if (rounded === displayed) return;
    displayed = rounded;
    const posture = rounded <= 4 ? 'folded' : rounded >= 176 ? 'unfolded' : 'half';
    const state = states[posture];
    root.dataset.duoPosture = posture;
    range.value = String(rounded);
    range.setAttribute('aria-valuetext', `${rounded} degrees, ${state.name.toLowerCase()}`);
    output.value = `${rounded}°`;
    root.querySelector('[data-duo-stage-state]').textContent = state.name;
    root.querySelector('[data-duo-caption]').textContent = state.caption;
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.duoPosture === posture)));
  }

  function renderPlayback() {
    root.dataset.duoPlaying = String(playing);
    play.dataset.paused = String(!playing);
    play.disabled = motion.matches;
    play.setAttribute('aria-label', motion.matches ? 'Animation paused for reduced motion'
      : playing ? 'Pause folding animation' : 'Play folding animation');
  }

  function stopFrame() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }

  function schedule() {
    if (!frame && inView && !document.hidden && (playing || move)) frame = requestAnimationFrame(tick);
  }

  function tick(now) {
    frame = 0;
    if (!inView || document.hidden) { last = 0; return; }
    const elapsed = last ? Math.min(now - last, 64) : 0;
    last = now;
    if (!move && playing) {
      hold -= elapsed;
      if (hold <= 0) {
        move = { from: angle, to: sequence[step], time: 0, duration: 1500 };
        step = (step + 1) % sequence.length;
      }
    }
    if (move) {
      move.time += elapsed;
      const progress = Math.min(1, move.time / move.duration);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      render(move.from + (move.to - move.from) * eased);
      if (progress === 1) { render(move.to); move = null; hold = 1500; }
    }
    schedule();
  }

  function pause() {
    playing = false;
    move = null;
    stopFrame();
    renderPlayback();
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    pause();
    const target = states[button.dataset.duoPosture].angle;
    if (motion.matches) render(target);
    else { move = { from: angle, to: target, time: 0, duration: 850 }; schedule(); }
  }));
  range.addEventListener('input', () => { pause(); render(Number(range.value)); });
  play.addEventListener('click', () => {
    if (motion.matches) return;
    if (playing) pause();
    else { playing = true; hold = 0; step = angle < 90 ? 2 : 0; renderPlayback(); schedule(); }
  });
  motion.addEventListener('change', () => { pause(); renderPlayback(); });
  document.addEventListener('visibilitychange', () => { stopFrame(); schedule(); });
  window.addEventListener('pagehide', stopFrame);
  window.addEventListener('pageshow', schedule);

  // Only transforms change during folding. No frames run in a hidden tab or offscreen.
  const resize = new ResizeObserver(entries => {
    const { width, height } = entries[0].contentRect;
    stage.style.setProperty('--duo-scale', String(Math.min(1.18, width / 610, (height - 48) / 430)));
  });
  resize.observe(stage);
  const visibility = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    stopFrame();
    schedule();
  }, { threshold: 0 });
  visibility.observe(stage);
  render(180);
  renderPlayback();
  schedule();
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
  initDuoLaunch();
  void updateLatestReleaseDownloads();
}

window.initHumshakalsLanding = initHumshakalsLanding;
initHumshakalsLanding();
