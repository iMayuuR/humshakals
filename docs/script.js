// Shared by the published static page and the optional animated Vite preview.
// The static script runs after parsing; the Vite entry calls this after React mounts.
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
}

window.initHumshakalsLanding = initHumshakalsLanding;
initHumshakalsLanding();
