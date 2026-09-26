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
    // If it's an array of primitives/strings
    if (Array.isArray(data)) return data.map(String);

    // mike may output { versions: ["1.0.0", ...], aliases: {...} }
    if (data.versions && Array.isArray(data.versions)) return data.versions.map(String);

    // Sometimes entries are objects like {name: '1.2.3', path: '...'} or {version:'1.2.3', url:'...'}
    if (Array.isArray(data.entries)) {
      return data.entries.map(e => (typeof e === 'object' ? (e.name || e.version || e.label || e.id || JSON.stringify(e)) : String(e)));
    }

    if (typeof data === 'object') {
      // If object maps version->url or alias->version
      const keys = Object.keys(data);
      // If values are objects containing name/url, map accordingly to name strings
      if (keys.length > 0 && typeof data[keys[0]] === 'object') {
        return keys.map(k => {
          const v = data[k];
          return v && (v.name || v.version || v.label) ? (v.name || v.version || v.label) : k;
        });
      }
      return keys;
    }
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
      // If v looks like JSON string from earlier fallback, try to parse or use as label
      let label = '' + v;
      let path = `${origin}/dash-openlayers/${encodeURIComponent(label)}/`;

      // If version is an object-like stringified JSON, keep label but fallback path
      opt.textContent = label;
      opt.value = path;
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
