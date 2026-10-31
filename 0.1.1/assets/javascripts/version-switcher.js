(function () {
  const script =
    document.currentScript || document.querySelector('script[src*="version-switcher.js"]');
  const assetSuffix = '/assets/javascripts/version-switcher.js';

  function getSiteRoot() {
    if (!script) return null;

    const scriptPath = new URL(script.src, window.location.href).pathname;
    const assetIndex = scriptPath.lastIndexOf(assetSuffix);
    if (assetIndex === -1) return null;

    const versionRoot = scriptPath.slice(0, assetIndex);
    const rootIndex = versionRoot.lastIndexOf('/');
    return rootIndex > 0 ? versionRoot.slice(0, rootIndex) : '';
  }

  async function fetchVersions(siteRoot) {
    try {
      const response = await fetch(`${siteRoot}/versions.json`, { cache: 'no-cache' });
      if (!response.ok) return [];
      return normalizeVersions(await response.json());
    } catch (error) {
      return [];
    }
  }

  function normalizeVersions(data) {
    const entries = Array.isArray(data) ? data : data && data.versions;
    if (!Array.isArray(entries)) return [];

    return entries.flatMap((entry) => {
      if (typeof entry === 'string') return [{ version: entry, title: entry, aliases: [] }];
      if (!entry || typeof entry !== 'object') return [];

      const version = entry.version || entry.path || entry.id;
      if (!version) return [];
      return [
        {
          version,
          title: entry.title || entry.name || version,
          aliases: Array.isArray(entry.aliases) ? entry.aliases : [],
        },
      ];
    });
  }

  function buildDropdown(versions, siteRoot) {
    if (versions.length === 0) return null;

    const container = document.createElement('div');
    container.style.cssText = 'position:relative; margin-left:1rem; z-index:10;';

    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Documentation version');
    select.style.cssText = 'padding:4px 6px;';

    const rootPrefix = `${siteRoot}/`;
    const relativePath = window.location.pathname.startsWith(rootPrefix)
      ? window.location.pathname.slice(rootPrefix.length)
      : '';
    const pathSegments = relativePath.split('/').filter(Boolean);
    const currentVersion = pathSegments.shift();
    const pagePath = pathSegments.length ? `${pathSegments.join('/')}/` : '';

    versions.forEach(({ version, title, aliases }) => {
      const opt = document.createElement('option');
      opt.textContent = title;
      opt.value = `${rootPrefix}${encodeURIComponent(version)}/${pagePath}${window.location.search}${window.location.hash}`;
      opt.selected = version === currentVersion || aliases.includes(currentVersion);
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      const target = e.target.value;
      if (target) window.location.href = target;
    });
    select.disabled = versions.length < 2;

    container.appendChild(select);
    return container;
  }

  async function init() {
    const siteRoot = getSiteRoot();
    if (siteRoot === null) return;

    const versions = await fetchVersions(siteRoot);
    const dropdown = buildDropdown(versions, siteRoot);
    if (!dropdown) return;

    const header = document.querySelector('header') || document.body;
    header.appendChild(dropdown);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
