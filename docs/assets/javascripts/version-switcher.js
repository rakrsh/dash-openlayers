/* Simple version switcher that fetches versions.json produced by mike and
   injects a dropdown into the header. Tries repo-root and site-root paths. */
(function () {
  async function fetchVersions() {
    const candidates = [
      '/dash-openlayers/versions.json',
      '/versions.json',
      'versions.json'
    ];

    for (const url of candidates) {
      try {
        const resp = await fetch(url, {cache: 'no-cache'});
        if (!resp.ok) continue;
        return await resp.json();
      } catch (e) {
        // ignore and try next
      }
    }
    return null;
  }

  function normalizeVersions(data) {
    // Accept multiple shapes (array, object, {versions: [...]}, {aliases: {...}})
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (data.versions && Array.isArray(data.versions)) return data.versions;
    if (typeof data === 'object') return Object.keys(data);
    return [];
  }

  function buildDropdown(versions) {
    if (!versions || versions.length === 0) return null;

    const container = document.createElement('div');
    container.style.cssText = 'position:relative; margin-left:1rem;';

    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Documentation version');
    select.style.cssText = 'padding:4px 6px;';

    const currentPath = window.location.pathname;
    const origin = window.location.origin.replace(/\/$/, '');

    versions.forEach(v => {
      const opt = document.createElement('option');
      opt.textContent = v;
      // Build target URL: prefer repo-root path
      opt.value = `${origin}/dash-openlayers/${v}/`;
      select.appendChild(opt);
    });

    select.addEventListener('change', (e) => {
      const target = e.target.value;
      if (target) window.location.href = target;
    });

    container.appendChild(select);
    return container;
  }

  async function init() {
    const data = await fetchVersions();
    const versions = normalizeVersions(data);
    if (!versions || versions.length === 0) return;

    const dropdown = buildDropdown(versions);
    if (!dropdown) return;

    // Insert into header if possible
    const header = document.querySelector('header') || document.body;
    // Try to insert near top-right of header
    header.style.position = header.style.position || '';
    header.appendChild(dropdown);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
