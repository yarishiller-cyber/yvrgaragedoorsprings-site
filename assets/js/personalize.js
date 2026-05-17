/* ========================================================================
   YVR Garage Door Springs — personalization layer
   Vanilla JS, no dependencies. Single source of truth for phone + city list.
   Swap PHONE_DISPLAY / PHONE_TEL when the real tracked number is ready.
   ======================================================================== */

(function () {
  'use strict';

  /* ---- Contact constants (swap in one place) ---- */
  const PHONE_DISPLAY = '(604) XXX-XXXX';
  const PHONE_TEL     = '+1604XXXXXXX';
  const EMAIL         = 'info@yvrgaragedoorsprings.ca';
  const SMS_BODY      = 'Hi - my garage door spring broke. Can I send a photo?';

  /* ---- Cities (display + slug + local-tech ETA when present) ----
     LOCAL_ETA = "your local tech, ~X min" for residents of that city.
     If TECH_STATUS[city].hiring === true, we don't have a local tech yet —
     coverage comes from coverCity at coverEta. */
  const CITIES = {
    'vancouver':       { display: 'Vancouver',       localEta: 12 },
    'burnaby':         { display: 'Burnaby',         localEta: 12 },
    'richmond':        { display: 'Richmond',        localEta: 15 },
    'surrey':          { display: 'Surrey',          localEta: 12 },
    'coquitlam':       { display: 'Coquitlam',       localEta: 15 },
    'port-coquitlam':  { display: 'Port Coquitlam',  localEta: 15 },
    'port-moody':      { display: 'Port Moody',      localEta: 15 },
    'north-vancouver': { display: 'North Vancouver', localEta: 12 },
    'west-vancouver':  { display: 'West Vancouver',  localEta: 15 },
    'new-westminster': { display: 'New Westminster', localEta: 12 },
    'delta':           { display: 'Delta',           localEta: 15 },
    'langley':         { display: 'Langley',         localEta: 18 },
    'white-rock':      { display: 'White Rock',      localEta: 15 },
    'maple-ridge':     { display: 'Maple Ridge',     localEta: 18 },
    'pitt-meadows':    { display: 'Pitt Meadows',    localEta: 18 },
    'tsawwassen':      { display: 'Tsawwassen',      localEta: 25 }  // no local tech yet
  };

  const TECH_STATUS = {
    'tsawwassen': {
      hiring: true,
      coverCity: 'delta',
      coverEta: 25,
      hiringMessage: 'Hiring local tech · Delta crew covers in the meantime'
    }
  };

  /* ---- Drive-time matrix from each origin city to every other city.
     Numbers reflect mid-day, non-rush road travel in the Lower Mainland
     including typical bridge/tunnel passage. Self-entry is local-tech ETA. */
  const DRIVE_TIMES = {
    'vancouver': {
      'vancouver': 12, 'burnaby': 15, 'richmond': 25, 'north-vancouver': 25,
      'new-westminster': 25, 'west-vancouver': 30, 'coquitlam': 35, 'port-moody': 35,
      'delta': 35, 'surrey': 40, 'port-coquitlam': 40, 'tsawwassen': 40,
      'pitt-meadows': 50, 'langley': 50, 'maple-ridge': 55, 'white-rock': 50
    },
    'burnaby': {
      'burnaby': 12, 'vancouver': 15, 'new-westminster': 15, 'coquitlam': 20,
      'richmond': 25, 'north-vancouver': 25, 'port-moody': 25, 'surrey': 30,
      'port-coquitlam': 30, 'delta': 30, 'west-vancouver': 30, 'langley': 35,
      'maple-ridge': 40, 'pitt-meadows': 40, 'white-rock': 45, 'tsawwassen': 45
    },
    'richmond': {
      'richmond': 15, 'delta': 20, 'vancouver': 25, 'tsawwassen': 25,
      'burnaby': 25, 'surrey': 30, 'new-westminster': 30, 'white-rock': 35,
      'north-vancouver': 35, 'coquitlam': 35, 'west-vancouver': 40, 'port-moody': 40,
      'port-coquitlam': 40, 'langley': 40, 'pitt-meadows': 45, 'maple-ridge': 50
    },
    'surrey': {
      'surrey': 12, 'langley': 20, 'white-rock': 20, 'new-westminster': 25,
      'delta': 25, 'coquitlam': 25, 'burnaby': 30, 'richmond': 30,
      'port-coquitlam': 30, 'pitt-meadows': 30, 'maple-ridge': 30, 'tsawwassen': 30,
      'port-moody': 35, 'vancouver': 40, 'north-vancouver': 50, 'west-vancouver': 55
    },
    'coquitlam': {
      'coquitlam': 15, 'port-coquitlam': 10, 'port-moody': 10, 'pitt-meadows': 15,
      'burnaby': 20, 'new-westminster': 20, 'maple-ridge': 20, 'surrey': 25,
      'vancouver': 30, 'north-vancouver': 30, 'langley': 30, 'richmond': 35,
      'delta': 35, 'west-vancouver': 35, 'white-rock': 40, 'tsawwassen': 45
    },
    'port-coquitlam': {
      'port-coquitlam': 15, 'coquitlam': 10, 'port-moody': 10, 'pitt-meadows': 10,
      'maple-ridge': 15, 'burnaby': 25, 'new-westminster': 25, 'surrey': 25,
      'langley': 25, 'north-vancouver': 30, 'vancouver': 35, 'richmond': 40,
      'west-vancouver': 40, 'delta': 40, 'white-rock': 40, 'tsawwassen': 50
    },
    'port-moody': {
      'port-moody': 15, 'coquitlam': 10, 'port-coquitlam': 10, 'burnaby': 15,
      'new-westminster': 20, 'pitt-meadows': 20, 'vancouver': 25, 'north-vancouver': 25,
      'maple-ridge': 25, 'surrey': 30, 'richmond': 35, 'west-vancouver': 35,
      'delta': 35, 'langley': 35, 'white-rock': 45, 'tsawwassen': 45
    },
    'north-vancouver': {
      'north-vancouver': 12, 'west-vancouver': 10, 'vancouver': 25, 'burnaby': 25,
      'port-moody': 25, 'new-westminster': 30, 'coquitlam': 30, 'port-coquitlam': 30,
      'richmond': 35, 'delta': 45, 'pitt-meadows': 45, 'surrey': 50,
      'langley': 50, 'maple-ridge': 50, 'tsawwassen': 55, 'white-rock': 55
    },
    'west-vancouver': {
      'west-vancouver': 15, 'north-vancouver': 10, 'vancouver': 25, 'burnaby': 30,
      'richmond': 35, 'port-moody': 35, 'new-westminster': 40, 'coquitlam': 40,
      'port-coquitlam': 40, 'delta': 45, 'surrey': 50, 'langley': 55,
      'maple-ridge': 55, 'pitt-meadows': 55, 'tsawwassen': 55, 'white-rock': 60
    },
    'new-westminster': {
      'new-westminster': 12, 'burnaby': 15, 'surrey': 20, 'coquitlam': 20,
      'vancouver': 25, 'richmond': 25, 'port-coquitlam': 25, 'delta': 25,
      'port-moody': 25, 'langley': 30, 'north-vancouver': 30, 'maple-ridge': 30,
      'pitt-meadows': 30, 'tsawwassen': 35, 'white-rock': 35, 'west-vancouver': 40
    },
    'delta': {
      'delta': 15, 'tsawwassen': 15, 'richmond': 20, 'surrey': 25,
      'white-rock': 25, 'new-westminster': 25, 'burnaby': 30, 'langley': 30,
      'vancouver': 35, 'coquitlam': 35, 'port-moody': 40, 'port-coquitlam': 40,
      'north-vancouver': 45, 'maple-ridge': 45, 'pitt-meadows': 50, 'west-vancouver': 50
    },
    'langley': {
      'langley': 18, 'surrey': 20, 'white-rock': 25, 'maple-ridge': 25,
      'pitt-meadows': 30, 'delta': 30, 'port-coquitlam': 30, 'coquitlam': 30,
      'new-westminster': 35, 'tsawwassen': 35, 'burnaby': 40, 'richmond': 40,
      'port-moody': 40, 'vancouver': 50, 'north-vancouver': 55, 'west-vancouver': 60
    },
    'white-rock': {
      'white-rock': 15, 'surrey': 20, 'delta': 25, 'langley': 25,
      'tsawwassen': 25, 'new-westminster': 35, 'richmond': 35, 'burnaby': 40,
      'coquitlam': 45, 'port-coquitlam': 45, 'maple-ridge': 45, 'pitt-meadows': 45,
      'vancouver': 50, 'port-moody': 50, 'north-vancouver': 55, 'west-vancouver': 60
    },
    'maple-ridge': {
      'maple-ridge': 18, 'pitt-meadows': 10, 'port-coquitlam': 20, 'coquitlam': 25,
      'port-moody': 25, 'langley': 25, 'surrey': 30, 'new-westminster': 35,
      'burnaby': 40, 'richmond': 45, 'delta': 45, 'white-rock': 45,
      'vancouver': 50, 'north-vancouver': 50, 'west-vancouver': 55, 'tsawwassen': 55
    },
    'pitt-meadows': {
      'pitt-meadows': 18, 'maple-ridge': 10, 'port-coquitlam': 15, 'coquitlam': 20,
      'port-moody': 20, 'surrey': 30, 'new-westminster': 30, 'langley': 30,
      'burnaby': 35, 'vancouver': 45, 'richmond': 45, 'north-vancouver': 45,
      'white-rock': 45, 'delta': 50, 'tsawwassen': 55, 'west-vancouver': 55
    },
    'tsawwassen': {
      'tsawwassen': 25, 'delta': 15, 'richmond': 25, 'white-rock': 25,
      'surrey': 30, 'new-westminster': 35, 'burnaby': 40, 'vancouver': 40,
      'langley': 40, 'coquitlam': 45, 'port-coquitlam': 50, 'port-moody': 50,
      'maple-ridge': 55, 'pitt-meadows': 55, 'north-vancouver': 55, 'west-vancouver': 55
    }
  };

  /* ---- FSA (Canadian postal-code first 3 chars) → city slug.
     Best-effort mapping for Greater Vancouver. Unknown FSAs return null. */
  const FSA_TO_CITY = {
    // Vancouver
    'V5K':'vancouver','V5L':'vancouver','V5M':'vancouver','V5N':'vancouver',
    'V5P':'vancouver','V5R':'vancouver','V5S':'vancouver','V5T':'vancouver',
    'V5V':'vancouver','V5W':'vancouver','V5X':'vancouver','V5Y':'vancouver','V5Z':'vancouver',
    'V6A':'vancouver','V6B':'vancouver','V6C':'vancouver','V6E':'vancouver','V6G':'vancouver',
    'V6H':'vancouver','V6J':'vancouver','V6K':'vancouver','V6L':'vancouver','V6M':'vancouver',
    'V6N':'vancouver','V6P':'vancouver','V6R':'vancouver','V6S':'vancouver','V6T':'vancouver',
    'V6U':'vancouver','V6Z':'vancouver',
    // Burnaby
    'V5A':'burnaby','V5B':'burnaby','V5C':'burnaby','V5E':'burnaby','V5G':'burnaby',
    'V5H':'burnaby','V5J':'burnaby',
    // Richmond
    'V6V':'richmond','V6W':'richmond','V6X':'richmond','V6Y':'richmond',
    'V7A':'richmond','V7B':'richmond','V7C':'richmond','V7E':'richmond',
    // North Vancouver
    'V7G':'north-vancouver','V7H':'north-vancouver','V7J':'north-vancouver',
    'V7K':'north-vancouver','V7L':'north-vancouver','V7M':'north-vancouver',
    'V7N':'north-vancouver','V7P':'north-vancouver','V7R':'north-vancouver',
    // West Vancouver
    'V7S':'west-vancouver','V7T':'west-vancouver','V7V':'west-vancouver','V7W':'west-vancouver',
    // New Westminster
    'V3L':'new-westminster','V3M':'new-westminster','V3N':'new-westminster',
    // Coquitlam
    'V3E':'coquitlam','V3J':'coquitlam','V3K':'coquitlam',
    // Port Coquitlam
    'V3B':'port-coquitlam','V3C':'port-coquitlam',
    // Port Moody
    'V3H':'port-moody',
    // Surrey
    'V3R':'surrey','V3S':'surrey','V3T':'surrey','V3V':'surrey','V3W':'surrey','V3X':'surrey',
    'V4N':'surrey','V4P':'surrey','V4A':'surrey',
    // Langley
    'V2Y':'langley','V2Z':'langley','V3A':'langley','V4W':'langley',
    // White Rock
    'V4B':'white-rock','V3Z':'white-rock',
    // Delta / Ladner / Tsawwassen — V4K is mostly Ladner; V4L+V4M are Tsawwassen
    'V4G':'delta','V4K':'delta','V4C':'delta','V4E':'delta',
    'V4L':'tsawwassen','V4M':'tsawwassen',
    // Maple Ridge
    'V2W':'maple-ridge','V2X':'maple-ridge','V4R':'maple-ridge','V4S':'maple-ridge',
    // Pitt Meadows
    'V3Y':'pitt-meadows'
  };

  /* ---- Helpers ---- */
  const qs  = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const swap = (sel, val) => { qsa(sel).forEach(el => { if (val) el.textContent = val; }); };

  function citySlug(input) {
    if (!input) return null;
    const k = String(input).toLowerCase().trim().replace(/\s+/g, '-');
    if (CITIES[k]) return k;
    // Try alternate forms (with spaces vs hyphens)
    const noSpace = k.replace(/-/g, '');
    for (const slug in CITIES) {
      if (slug.replace(/-/g, '') === noSpace) return slug;
      if (CITIES[slug].display.toLowerCase() === k) return slug;
    }
    return null;
  }

  function postalToCity(postal) {
    if (!postal) return null;
    const fsa = postal.toUpperCase().replace(/\s|-/g, '').slice(0, 3);
    return FSA_TO_CITY[fsa] || null;
  }

  /* ---- 1. Wire phone / email / sms hrefs from constants ---- */
  function wireContacts(root) {
    const scope = root || document;
    qsa('[data-tel]', scope).forEach(el => el.setAttribute('href', 'tel:' + PHONE_TEL));
    qsa('[data-phone-display]', scope).forEach(el => {
      if (!el.textContent || el.textContent.match(/^\(?\d|XXX|^Call/i)) {
        // Don't overwrite text that's already a fully-formed CTA like "Call (604)..."
        if (el.textContent.indexOf(PHONE_DISPLAY) === -1) {
          el.textContent = PHONE_DISPLAY;
        }
      } else {
        el.textContent = PHONE_DISPLAY;
      }
    });
    qsa('[data-email]', scope).forEach(el => el.setAttribute('href', 'mailto:' + EMAIL));
    qsa('[data-email-display]', scope).forEach(el => el.textContent = EMAIL);
    qsa('[data-sms]', scope).forEach(el => el.setAttribute('href', 'sms:' + PHONE_TEL + '?body=' + encodeURIComponent(SMS_BODY)));
  }

  /* ---- 2. URL-param DTR ---- */
  function applyDTR() {
    const params = new URLSearchParams(location.search);
    const intent = (params.get('intent') || '').toLowerCase();
    const cityParam = params.get('city');

    if (intent) {
      document.body.setAttribute('data-intent', intent.replace(/[^a-z]/g, ''));
    }

    const slug = citySlug(cityParam);
    if (slug) {
      setOriginCity(slug, { source: 'url' });
    }
  }

  /* ---- 3. Origin city manager (drives DTR + city grid) ---- */
  let _originCity = null;
  const STORAGE_KEY = 'yvr-origin-city';

  function readStoredCity() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return (stored && CITIES[stored]) ? stored : null;
    } catch (e) { return null; }
  }
  function writeStoredCity(slug) {
    try { localStorage.setItem(STORAGE_KEY, slug); } catch (e) {}
  }

  function setOriginCity(slug, opts) {
    if (!slug || !CITIES[slug]) return;
    _originCity = slug;
    // data-user-city = the user's detected/selected location.
    // (data-city on city pages = the city the page is about — DON'T overwrite.)
    document.body.setAttribute('data-user-city', slug);
    const city = CITIES[slug];
    swap('[data-dtr="city"]', city.display);
    swap('[data-dtr="eta"]', String(city.localEta));
    renderCityGrid(slug);
    renderCrossCityHint(slug);
    // Sync the picker UI if not already set
    const select = qs('#city-picker-select');
    if (select && select.value !== slug) select.value = slug;
    // Persist preference across pages (unless source is geo — geo can re-detect on next visit)
    const source = (opts && opts.source) || 'unknown';
    if (source !== 'geo' && source !== 'geo-postal') {
      writeStoredCity(slug);
    }
    // Reflect in URL (no reload) for shareability — but only if source isn't already URL
    if (source !== 'url' && 'URLSearchParams' in window) {
      try {
        const url = new URL(location.href);
        url.searchParams.set('city', slug);
        history.replaceState(null, '', url.toString());
      } catch (e) {}
    }
  }

  /* ---- 4. Render city grid for a given origin (or default) ---- */
  function renderCityGrid(originSlug) {
    const containers = qsa('[data-city-grid]');
    if (!containers.length) return;

    const cities = Object.keys(CITIES);
    let order, formatForOther;

    if (originSlug && DRIVE_TIMES[originSlug]) {
      const times = DRIVE_TIMES[originSlug];
      // Sort all 16 by drive time from origin (origin = 0 for sort purposes)
      order = cities.slice().sort((a, b) => {
        const ta = (a === originSlug) ? -1 : (times[a] || 99);
        const tb = (b === originSlug) ? -1 : (times[b] || 99);
        return ta - tb;
      });
      formatForOther = (slug) => '~' + (times[slug] || '?') + ' min to ' + CITIES[originSlug].display;
    } else {
      // Default order — alphabetical-ish by our CITIES definition
      order = cities;
      formatForOther = null;
    }

    containers.forEach(container => {
      container.innerHTML = '';
      order.forEach(slug => {
        const city = CITIES[slug];
        const status = TECH_STATUS[slug] || {};
        const isOrigin = (slug === originSlug);
        const a = document.createElement('a');
        a.className = 'city-tile';
        a.href = '/cities/' + slug + '/';
        if (isOrigin) a.classList.add('city-tile-origin');
        if (status.hiring) a.classList.add('city-tile-hiring');

        const name = document.createElement('span');
        name.className = 'city-tile-name';
        name.textContent = city.display;

        const meta = document.createElement('span');
        meta.className = 'city-tile-meta';

        if (isOrigin) {
          if (status.hiring) {
            meta.innerHTML = '<strong>Your area</strong> · hiring tech · Delta crew covers, ~' + status.coverEta + ' min';
          } else {
            meta.innerHTML = '<strong>Your area</strong> · local tech, ~' + city.localEta + ' min';
          }
        } else if (status.hiring) {
          if (formatForOther) {
            meta.innerHTML = formatForOther(slug) + ' · <em>hiring local tech</em>';
          } else {
            meta.textContent = 'Currently hiring · Delta crew covers';
          }
        } else if (formatForOther) {
          meta.textContent = formatForOther(slug);
        } else {
          meta.textContent = '~' + city.localEta + ' min';
        }

        a.appendChild(name);
        a.appendChild(meta);
        container.appendChild(a);
      });
    });
  }

  /* ---- 4b. Cross-city navigation hint ----
     If user's origin (data-user-city) differs from the page they're on
     (data-city, set in HTML on city pages), surface a small banner offering
     to jump to their own city page. Dismissible per-session. */
  function renderCrossCityHint(originSlug) {
    if (!originSlug) return;
    const pageCity = document.body.getAttribute('data-city');
    if (!pageCity || !CITIES[pageCity]) return; // not a city page
    if (pageCity === originSlug) return;        // already on user's city
    if (sessionStorage.getItem('hint-dismissed-' + originSlug) === '1') return;

    const main = qs('#main');
    if (!main) return;

    // Remove any prior banner
    const prior = qs('.cross-city-hint');
    if (prior) prior.remove();

    const origin = CITIES[originSlug];
    const page = CITIES[pageCity];
    const banner = document.createElement('aside');
    banner.className = 'cross-city-hint';
    banner.setAttribute('role', 'note');
    banner.innerHTML =
      '<div class="wrap" style="display:flex;gap:var(--s-3);align-items:center;justify-content:space-between;flex-wrap:wrap">' +
        '<div>' +
          '<strong>Looking for ' + origin.display + '?</strong> You\'re reading the ' + page.display + ' page. ' +
          '<a href="/cities/' + originSlug + '/">Open ' + origin.display + ' page →</a>' +
        '</div>' +
        '<button type="button" class="cross-city-hint-dismiss" aria-label="Dismiss">×</button>' +
      '</div>';
    main.insertBefore(banner, main.firstChild);

    const dismissBtn = qs('.cross-city-hint-dismiss', banner);
    if (dismissBtn) {
      dismissBtn.addEventListener('click', () => {
        try { sessionStorage.setItem('hint-dismissed-' + originSlug, '1'); } catch (e) {}
        banner.remove();
      });
    }
  }

  /* ---- 5. Wire the city picker (dropdown + postal code input) ---- */
  function wireCityPicker() {
    const select = qs('#city-picker-select');
    const postal = qs('#city-picker-postal');
    const status = qs('#city-picker-status');

    if (select) {
      // Populate options if empty
      if (!select.options.length || select.options.length < 16) {
        select.innerHTML = '<option value="">Pick your city...</option>';
        Object.keys(CITIES).forEach(slug => {
          const opt = document.createElement('option');
          opt.value = slug;
          opt.textContent = CITIES[slug].display;
          select.appendChild(opt);
        });
      }
      select.addEventListener('change', () => {
        if (select.value) {
          setOriginCity(select.value, { source: 'picker' });
          if (status) status.textContent = 'Showing drive times from ' + CITIES[select.value].display + '.';
        }
      });
    }

    if (postal) {
      postal.addEventListener('input', () => {
        const slug = postalToCity(postal.value);
        if (slug) {
          setOriginCity(slug, { source: 'postal' });
          if (status) {
            status.textContent = 'Detected: ' + CITIES[slug].display + '. Tiles reordered.';
          }
        } else if (postal.value.length >= 3 && status) {
          status.textContent = 'Postal code not in our service area — pick a city manually.';
        }
      });
    }
  }

  /* ---- 6. Geo-detect fallback (only if no origin set yet) ---- */
  function detectGeo() {
    if (_originCity) return;
    if (new URLSearchParams(location.search).get('city')) return;

    fetch('https://ipapi.co/json/', { mode: 'cors' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        // Try city name first
        const slug = citySlug(data.city);
        if (slug) {
          setOriginCity(slug, { source: 'geo' });
          const status = qs('#city-picker-status');
          if (status) status.textContent = 'Detected: ' + CITIES[slug].display + ' (from your IP). Tiles reordered.';
        } else if (data.postal) {
          const psug = postalToCity(data.postal);
          if (psug) setOriginCity(psug, { source: 'geo-postal' });
        }
      })
      .catch(() => {});
  }

  /* ---- 7. Time-of-day open/closed banner ---- */
  const BC_HOLIDAYS_2026 = [
    '2026-01-01','2026-02-16','2026-04-03','2026-05-18','2026-07-01','2026-08-03',
    '2026-09-07','2026-09-30','2026-10-12','2026-11-11','2026-12-25','2026-12-26'
  ];
  function isHolidayToday() {
    const now = new Date();
    const iso = now.getFullYear() + '-' +
      String(now.getMonth() + 1).padStart(2, '0') + '-' +
      String(now.getDate()).padStart(2, '0');
    return BC_HOLIDAYS_2026.indexOf(iso) !== -1;
  }
  function applyAvailability() {
    const banner = qs('[data-availability]');
    if (!banner) return;
    const now = new Date();
    const h = now.getHours();
    const isHoliday = isHolidayToday();
    const isOpen = !isHoliday && h >= 7 && h < 21;

    if (isOpen) {
      banner.classList.remove('closed');
      banner.innerHTML = '<span class="dot"></span><span><strong>Open now.</strong> Live dispatch until 9 p.m. tonight. Average call back: under 90 seconds.</span>';
    } else if (isHoliday) {
      banner.classList.add('closed');
      banner.innerHTML = '<span class="dot"></span><span><strong>Stat holiday.</strong> Text a photo for fastest response — on-call tech replies every 2 hours.</span>';
    } else {
      banner.classList.add('closed');
      const nextOpen = h < 7 ? 'in the morning at 7 a.m.' : 'tomorrow at 7 a.m.';
      banner.innerHTML = '<span class="dot"></span><span><strong>After hours.</strong> Voicemail now — text a photo and we\'ll reply ' + nextOpen + '</span>';
    }
  }

  /* ---- 8. Sticky bottom call bar ---- */
  function stickyBar() {
    const bar = qs('.sticky-cta');
    if (!bar) return;
    let ticking = false;
    function update() {
      const scrolled = window.scrollY + window.innerHeight;
      const max = document.documentElement.scrollHeight;
      const pct = scrolled / max;
      if (pct > 0.25) bar.classList.add('show'); else bar.classList.remove('show');
      ticking = false;
    }
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    document.addEventListener('focusin', e => {
      if (e.target.matches('input, textarea, select')) bar.classList.remove('show');
    });
    document.addEventListener('focusout', update);
  }

  /* ---- 9. Diagnosis widget ---- */
  function diagnosis() {
    const widget = qs('.diagnosis');
    if (!widget) return;
    const steps   = qsa('.diagnosis-step', widget);
    const progress = qsa('.diagnosis-progress span', widget);
    const result  = qs('.diagnosis-result', widget);
    if (!steps.length) return;

    let answers = [];
    function showStep(i) {
      steps.forEach((s, idx) => s.classList.toggle('active', idx === i));
      progress.forEach((p, idx) => p.classList.toggle('done', idx <= i));
    }
    function showResult() {
      steps.forEach(s => s.classList.remove('active'));
      progress.forEach(p => p.classList.add('done'));
      const bangCount = answers.filter(a => a === 'yes').length;
      let verdict, action;
      if (bangCount >= 2) {
        verdict = '<strong>Your torsion spring snapped.</strong> Don\'t force the door — you\'ll burn the opener gear.';
        action  = 'Call now and your local tech will be there in ~12 minutes.';
      } else if (answers[0] === 'yes') {
        verdict = '<strong>Sounds like a spring or cable failure.</strong> Quick photo over text will confirm in 60 seconds.';
        action  = 'Text a photo or call — same response either way.';
      } else {
        verdict = '<strong>Could be balance, rollers, or an opener issue.</strong> Hard to call without seeing it.';
        action  = 'Send a photo and we\'ll quote in 2 minutes.';
      }
      result.innerHTML = '<p>' + verdict + '</p><p style="margin-top:0.5rem">' + action + '</p>' +
        '<a class="btn btn-block mt-4" data-tel></a>';
      result.classList.add('shown');
      const newBtn = qs('a.btn', result);
      if (newBtn) newBtn.textContent = 'Call ' + PHONE_DISPLAY;
      wireContacts(result);
    }

    qsa('.diagnosis-opt', widget).forEach(btn => {
      btn.addEventListener('click', () => {
        const step = parseInt(btn.closest('.diagnosis-step').dataset.step, 10);
        answers[step] = btn.dataset.answer;
        if (step + 1 < steps.length) showStep(step + 1);
        else showResult();
      });
    });

    showStep(0);
  }

  /* ---- 10. Quote form (mailto fallback) ---- */
  function quoteForm() {
    qsa('form#quote-form').forEach(form => {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form);
        const body = encodeURIComponent(
          'Postal code: ' + (fd.get('postal') || '') + '\n' +
          'Phone: ' + (fd.get('phone') || '') + '\n' +
          'What broke: ' + (fd.get('what') || '')
        );
        window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('New spring repair request') + '&body=' + body;
      });
    });
  }

  /* ---- 11. Cold-snap banner (stub) ---- */
  function coldSnap() { /* See Section 2.1.4 — production reads /weather.json from cron */ }

  /* ---- Init ---- */
  function init() {
    wireContacts();
    wireCityPicker();
    applyDTR();          // URL param wins
    // If no URL param, try stored preference next
    if (!_originCity) {
      const stored = readStoredCity();
      if (stored) {
        setOriginCity(stored, { source: 'storage' });
      }
    }
    // Still no origin? Render default grid and let geo decide
    if (!_originCity) renderCityGrid(null);
    applyAvailability();
    stickyBar();
    diagnosis();
    quoteForm();
    coldSnap();
    detectGeo();         // async — last
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
