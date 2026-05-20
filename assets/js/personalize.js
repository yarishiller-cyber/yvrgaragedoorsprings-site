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

  /* ---- Site data (verify and swap when real values exist) ----
     null = not yet on file, JS hides the credential line.
     Set the string to publish. Footer and About page both read from this. */
  const SITE_DATA = {
    wcbAccount: null,            // e.g. 'WS1234567'
    bcLicence: null,             // e.g. 'BC123456789'
    coiPdfUrl: null,             // e.g. '/assets/docs/coi-2026.pdf'
    insuranceCarrier: null,      // e.g. 'Intact Insurance'
    insuranceAmount: '$5M',      // already public
    foundedYear: null,           // e.g. '2018'
    googlePlaceId: null,         // for future reviews pull via Places API
    jobsThisMonth: null          // manual update on 1st of month, e.g. '142'
  };

  /* ---- Cities ----
     Each city has:
       display     — user-facing name
       localEta    — "your local tech is somewhere in the city, average ~X min to your driveway"
                     This MUST be ≤ the smallest drive-time TO this city from any neighbor,
                     so the user's local tile is always (or ties for) the closest.
       centerAddr  — representative city-centre reference point used to compute drive times.
                     Documentary only — not read by code.

     If TECH_STATUS[city].hiring === true, the city has no resident tech yet —
     coverage comes from coverCity at coverEta. */
  const CITIES = {
    'vancouver':       { display: 'Vancouver',       localEta: 12, centerAddr: 'City Hall, 453 W 12th Ave' },
    'burnaby':         { display: 'Burnaby',         localEta: 12, centerAddr: 'City Hall, 4949 Canada Way' },
    'richmond':        { display: 'Richmond',        localEta: 15, centerAddr: 'City Hall, 6911 No. 3 Rd' },
    'surrey':          { display: 'Surrey',          localEta: 18, centerAddr: 'Central City, 13450 102 Ave' },
    'coquitlam':       { display: 'Coquitlam',       localEta: 10, centerAddr: 'City Centre, 3000 Guildford Way' },
    'port-coquitlam':  { display: 'Port Coquitlam',  localEta: 10, centerAddr: 'City Hall, 2580 Shaughnessy St' },
    'port-moody':      { display: 'Port Moody',      localEta: 10, centerAddr: 'City Hall, 100 Newport Dr' },
    'north-vancouver': { display: 'North Vancouver', localEta: 10, centerAddr: 'Lonsdale Quay, 123 Carrie Cates Ct' },
    'west-vancouver':  { display: 'West Vancouver',  localEta: 10, centerAddr: 'Park Royal, 1980 Park Royal S' },
    'new-westminster': { display: 'New Westminster', localEta:  8, centerAddr: 'City Hall, 511 Royal Ave' },
    'delta':           { display: 'Delta',           localEta: 12, centerAddr: 'Civic Centre, 4500 Clarence Taylor Cres (Ladner)' },
    'langley':         { display: 'Langley',         localEta: 12, centerAddr: 'City Hall, 20399 Douglas Cres' },
    'white-rock':      { display: 'White Rock',      localEta: 10, centerAddr: 'City Hall, 15322 Buena Vista Ave' },
    'maple-ridge':     { display: 'Maple Ridge',     localEta:  8, centerAddr: 'City Hall, 11995 Haney Pl' },
    'pitt-meadows':    { display: 'Pitt Meadows',    localEta:  8, centerAddr: 'City Hall, 12007 Harris Rd' },
    'tsawwassen':      { display: 'Tsawwassen',      localEta: 22, centerAddr: '56th St & 12th Ave (English Bluff)' }
  };

  const TECH_STATUS = {
    'tsawwassen': {
      hiring: true,
      coverCity: 'delta',
      coverEta: 18,
      hiringMessage: 'Hiring local tech — Delta crew covers in the meantime'
    }
  };

  /* ---- Drive-time matrix (minutes, point-to-point city-centre to city-centre) ----
     Reflects non-rush mid-day Lower Mainland conditions including bridge/tunnel
     passage (Lions Gate, 2nd Narrows, Pattullo, Alex Fraser, Port Mann, Massey,
     Golden Ears) and the fact that most of these legs are city driving, not
     highway. Self-entry equals the city's localEta (see CITIES above).
     INVARIANT: for any destination X, DRIVE_TIMES[Y][X] >= CITIES[X].localEta
     for every Y, so the user's local tile is always (or ties for) the closest. */
  const DRIVE_TIMES = {
    'vancouver': {
      'vancouver': 12, 'burnaby': 18, 'new-westminster': 20, 'richmond': 22,
      'north-vancouver': 22, 'west-vancouver': 25, 'port-moody': 30,
      'coquitlam': 32, 'delta': 32, 'surrey': 38, 'port-coquitlam': 38,
      'tsawwassen': 38, 'pitt-meadows': 45, 'langley': 48, 'white-rock': 48,
      'maple-ridge': 50
    },
    'burnaby': {
      'burnaby': 12, 'new-westminster': 12, 'vancouver': 18, 'port-moody': 18,
      'coquitlam': 18, 'north-vancouver': 22, 'richmond': 25, 'port-coquitlam': 25,
      'surrey': 28, 'west-vancouver': 28, 'delta': 30, 'langley': 35,
      'maple-ridge': 35, 'pitt-meadows': 35, 'tsawwassen': 35, 'white-rock': 40
    },
    'richmond': {
      'richmond': 15, 'delta': 15, 'tsawwassen': 20, 'vancouver': 22,
      'burnaby': 25, 'surrey': 25, 'new-westminster': 28, 'north-vancouver': 30,
      'white-rock': 30, 'coquitlam': 35, 'west-vancouver': 35, 'langley': 35,
      'port-moody': 38, 'port-coquitlam': 40, 'pitt-meadows': 45, 'maple-ridge': 50
    },
    'surrey': {
      'surrey': 18, 'new-westminster': 18, 'langley': 18, 'white-rock': 18,
      'coquitlam': 22, 'port-coquitlam': 22, 'delta': 22, 'richmond': 25,
      'pitt-meadows': 25, 'burnaby': 28, 'maple-ridge': 28, 'port-moody': 28,
      'tsawwassen': 28, 'vancouver': 38, 'north-vancouver': 45, 'west-vancouver': 50
    },
    'coquitlam': {
      'coquitlam': 10, 'port-moody': 10, 'port-coquitlam': 12, 'pitt-meadows': 15,
      'burnaby': 18, 'new-westminster': 18, 'maple-ridge': 18, 'surrey': 22,
      'langley': 25, 'vancouver': 32, 'north-vancouver': 32, 'richmond': 35,
      'delta': 35, 'west-vancouver': 38, 'white-rock': 38, 'tsawwassen': 42
    },
    'port-coquitlam': {
      'port-coquitlam': 10, 'pitt-meadows': 10, 'coquitlam': 12, 'port-moody': 12,
      'maple-ridge': 15, 'new-westminster': 22, 'surrey': 22, 'langley': 22,
      'burnaby': 25, 'vancouver': 38, 'north-vancouver': 38, 'delta': 38,
      'richmond': 40, 'white-rock': 40, 'west-vancouver': 42, 'tsawwassen': 45
    },
    'port-moody': {
      'port-moody': 10, 'coquitlam': 10, 'port-coquitlam': 12, 'burnaby': 18,
      'pitt-meadows': 18, 'new-westminster': 20, 'maple-ridge': 22, 'vancouver': 30,
      'north-vancouver': 30, 'surrey': 28, 'langley': 30, 'west-vancouver': 35,
      'richmond': 38, 'delta': 38, 'white-rock': 42, 'tsawwassen': 42
    },
    'north-vancouver': {
      'north-vancouver': 10, 'west-vancouver': 10, 'vancouver': 22, 'burnaby': 22,
      'new-westminster': 28, 'richmond': 30, 'port-moody': 30, 'coquitlam': 32,
      'port-coquitlam': 38, 'delta': 40, 'surrey': 45, 'tsawwassen': 45,
      'pitt-meadows': 48, 'langley': 50, 'maple-ridge': 50, 'white-rock': 55
    },
    'west-vancouver': {
      'west-vancouver': 10, 'north-vancouver': 10, 'vancouver': 25, 'burnaby': 28,
      'new-westminster': 32, 'richmond': 35, 'port-moody': 35, 'coquitlam': 38,
      'port-coquitlam': 42, 'delta': 45, 'surrey': 50, 'tsawwassen': 50,
      'pitt-meadows': 55, 'langley': 55, 'maple-ridge': 55, 'white-rock': 55
    },
    'new-westminster': {
      'new-westminster': 8, 'burnaby': 12, 'surrey': 18, 'coquitlam': 18,
      'vancouver': 20, 'port-moody': 20, 'port-coquitlam': 22, 'langley': 25,
      'richmond': 28, 'north-vancouver': 28, 'delta': 28, 'maple-ridge': 28,
      'pitt-meadows': 28, 'white-rock': 30, 'west-vancouver': 32, 'tsawwassen': 35
    },
    'delta': {
      'delta': 12, 'tsawwassen': 12, 'richmond': 15, 'surrey': 22,
      'white-rock': 22, 'new-westminster': 28, 'burnaby': 30, 'langley': 30,
      'vancouver': 32, 'coquitlam': 35, 'port-moody': 38, 'port-coquitlam': 38,
      'north-vancouver': 40, 'maple-ridge': 42, 'pitt-meadows': 42, 'west-vancouver': 45
    },
    'langley': {
      'langley': 12, 'surrey': 18, 'white-rock': 22, 'port-coquitlam': 22,
      'maple-ridge': 22, 'new-westminster': 25, 'coquitlam': 25, 'pitt-meadows': 25,
      'port-moody': 30, 'delta': 30, 'burnaby': 35, 'richmond': 35,
      'tsawwassen': 32, 'vancouver': 48, 'north-vancouver': 50, 'west-vancouver': 55
    },
    'white-rock': {
      'white-rock': 10, 'surrey': 18, 'delta': 22, 'langley': 22, 'tsawwassen': 22,
      'new-westminster': 30, 'richmond': 30, 'maple-ridge': 38, 'pitt-meadows': 38,
      'coquitlam': 38, 'burnaby': 40, 'port-coquitlam': 40, 'port-moody': 42,
      'vancouver': 48, 'north-vancouver': 55, 'west-vancouver': 55
    },
    'maple-ridge': {
      'maple-ridge': 8, 'pitt-meadows': 8, 'port-coquitlam': 15, 'coquitlam': 18,
      'port-moody': 22, 'langley': 22, 'new-westminster': 28, 'surrey': 28,
      'burnaby': 35, 'white-rock': 38, 'delta': 42, 'richmond': 50, 'vancouver': 50,
      'north-vancouver': 50, 'tsawwassen': 50, 'west-vancouver': 55
    },
    'pitt-meadows': {
      'pitt-meadows': 8, 'maple-ridge': 8, 'port-coquitlam': 10, 'coquitlam': 15,
      'port-moody': 18, 'langley': 25, 'surrey': 25, 'new-westminster': 28,
      'burnaby': 35, 'white-rock': 38, 'delta': 42, 'richmond': 45, 'vancouver': 45,
      'north-vancouver': 48, 'tsawwassen': 50, 'west-vancouver': 55
    },
    'tsawwassen': {
      'tsawwassen': 22, 'delta': 12, 'richmond': 20, 'white-rock': 22,
      'surrey': 28, 'new-westminster': 35, 'burnaby': 35, 'langley': 32,
      'vancouver': 38, 'coquitlam': 42, 'port-moody': 42, 'port-coquitlam': 45,
      'north-vancouver': 45, 'west-vancouver': 50, 'maple-ridge': 50, 'pitt-meadows': 50
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

  /* ---- 2. URL-param DTR ----
     Infers intent from explicit ?intent= param OR from the search query that
     brought the user here. We sniff both Google's q= (in document.referrer) and
     our own canonical ?q= override. Anything we can't classify falls through and
     the hero stays in default mode. */
  const INTENT_KEYWORDS = {
    // Hot, emergency-leaning queries
    emergency:  ['broken', 'broke', 'snapped', 'snap', 'bang', 'loud', 'wont open', "won't open", 'wont close', "won't close", 'stuck', 'emergency'],
    // Cost/research queries
    price:      ['cost', 'price', 'how much', 'quote', 'estimate', 'cheap', 'cheapest'],
    // How-it-works / diagnostic
    diagnostic: ['vs', 'difference', 'which', 'diagnose', 'diagnos', 'why', 'symptom', 'how do i know'],
    // Cold/weather
    cold:       ['cold', 'frozen', 'frost', 'winter', 'snow'],
    // Coastal
    coastal:    ['salt', 'rust', 'corroded', 'corrosion', 'coastal', 'oceanfront'],
  };
  function inferIntentFromQuery(qs) {
    if (!qs) return null;
    const lower = qs.toLowerCase();
    for (const intent in INTENT_KEYWORDS) {
      for (const kw of INTENT_KEYWORDS[intent]) {
        if (lower.indexOf(kw) !== -1) return intent;
      }
    }
    return null;
  }
  function inferIntentFromReferrer() {
    try {
      if (!document.referrer) return null;
      const ref = new URL(document.referrer);
      // Google / Bing / DuckDuckGo all use q=
      const q = ref.searchParams.get('q');
      return inferIntentFromQuery(q);
    } catch (e) { return null; }
  }

  function applyDTR() {
    const params = new URLSearchParams(location.search);
    const intentParam = (params.get('intent') || '').toLowerCase();
    const qParam = params.get('q');
    const cityParam = params.get('city');

    // Explicit ?intent= wins. Then ?q=. Then the search-engine referrer.
    const intent =
      intentParam ||
      inferIntentFromQuery(qParam) ||
      inferIntentFromReferrer();

    if (intent) {
      document.body.setAttribute('data-intent', intent.replace(/[^a-z]/g, ''));
      swapHeroImage();
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
    // Hero moment may want to mention the new city / new eta
    try { renderHeroMoment(); } catch (e) {}
    // Reflect in URL (no reload) for shareability — but only if source isn't already URL
    if (source !== 'url' && 'URLSearchParams' in window) {
      try {
        const url = new URL(location.href);
        url.searchParams.set('city', slug);
        history.replaceState(null, '', url.toString());
      } catch (e) {}
    }
  }

  /* ---- 4-busy. Tech "on a job" scheduler ----
     Each tech can be either AVAILABLE or BUSY-until-some-time. The schedule lives
     in localStorage so it persists across refreshes: if the user comes back 5
     minutes later, the countdown reflects 5 minutes of elapsed real time; come
     back 3 hours later and the previously-busy techs are now free (but a new
     random set may be busy). Daytime → more techs busy; overnight → everyone
     available because no one is doing residential jobs at 3 a.m. */
  const TECH_BUSY_KEY = 'yvr-tech-busy-v1';

  function _busyLoad() {
    try {
      const raw = localStorage.getItem(TECH_BUSY_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      const now = Date.now();
      const cleaned = {};
      for (const k in obj) { if (typeof obj[k] === 'number' && obj[k] > now) cleaned[k] = obj[k]; }
      return cleaned;
    } catch (e) { return {}; }
  }
  function _busySave(s) {
    try { localStorage.setItem(TECH_BUSY_KEY, JSON.stringify(s)); } catch (e) {}
  }

  // How many techs should be busy at this hour, on average
  function _busyTargetCount(hour) {
    if (hour < 6 || hour >= 23) return 0;   // overnight, nothing
    if (hour < 8)               return 1;   // pre-shift dispatch
    if (hour >= 17 && hour < 19) return 4;  // school-pickup/after-work rush
    if (hour >= 19 && hour < 22) return 3;  // evening calls
    if (hour >= 22)             return 1;   // wrapping up
    return 3;                                // mid-day baseline
  }

  function manageBusySchedule() {
    const schedule = _busyLoad();
    const now = Date.now();
    const hour = new Date().getHours();
    const target = _busyTargetCount(hour);
    // Drop any prior busy assignment on the user's origin city — their tile
    // stays gold ("your city") no matter what the carousel says.
    if (_originCity && schedule[_originCity]) {
      delete schedule[_originCity];
      _busySave(schedule);
    }
    const current = Object.keys(schedule).filter(s => schedule[s] > now);

    if (current.length >= target) { _busySave(schedule); return schedule; }

    // Pick more cities to make busy. Tsawwassen is already flagged "hiring local tech"
    // and the Delta crew can't be in two places, so we keep Tsawwassen+Delta off the busy roster.
    // Also exclude the user's own origin city — their tile stays gold no matter what.
    const eligible = Object.keys(CITIES)
      .filter(s => s !== 'tsawwassen' && s !== 'delta' && s !== _originCity)
      .filter(s => !schedule[s] || schedule[s] <= now);

    // Fisher-Yates shuffle
    for (let i = eligible.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = eligible[i]; eligible[i] = eligible[j]; eligible[j] = t;
    }

    const needed = target - current.length;
    for (let i = 0; i < needed && i < eligible.length; i++) {
      // 18–95 minutes until done. Skewed toward the lower end (most jobs ~30–55 min).
      const mins = 18 + Math.floor(Math.pow(Math.random(), 1.4) * 77);
      schedule[eligible[i]] = now + mins * 60 * 1000;
    }
    _busySave(schedule);
    return schedule;
  }

  function _busyLabel(remainingMs) {
    const mins = Math.max(1, Math.ceil(remainingMs / 60000));
    if (mins < 60) return '~' + mins + ' min until done';
    const h = Math.floor(mins / 60); const m = mins % 60;
    if (m === 0) return '~' + h + ' h until done';
    return '~' + h + ' h ' + m + ' min until done';
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
      formatForOther = (slug) => 'Tech ~' + (times[slug] || '?') + ' min from you';
    } else {
      // Default order — alphabetical-ish by our CITIES definition
      order = cities;
      formatForOther = null;
    }

    const busy = manageBusySchedule();
    const now = Date.now();

    // The tech-truck image is a photoreal Ford Maverick with the YVR Garage Door
    // Springs wrap (PNG, transparent background, 480px wide thumbnail). Per-state
    // colour cues come from the tile border/badge, not from recolouring the
    // truck. Hiring/busy tiles use a CSS filter on the image to dim it.
    const TRUCK_HTML = '<img class="city-tile-truck-img" src="/assets/img/tech-truck-sm.png" srcset="/assets/img/tech-truck-sm.webp 1x" alt="" loading="lazy" width="480" height="180">';

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

        // Tech truck (photoreal branded vehicle)
        const truck = document.createElement('span');
        truck.className = 'city-tile-van';
        truck.innerHTML = TRUCK_HTML;
        a.appendChild(truck);

        // Origin corner marker (pin) takes priority over the hiring badge
        if (isOrigin) {
          const marker = document.createElement('span');
          marker.className = 'city-tile-marker';
          marker.setAttribute('aria-label', 'Your city');
          marker.innerHTML = '★';   // ★
          a.appendChild(marker);
        } else if (status.hiring) {
          const pin = document.createElement('span');
          pin.className = 'city-tile-hiring-pin';
          pin.setAttribute('aria-label', 'Hiring local tech');
          pin.textContent = '+';
          a.appendChild(pin);
        }

        const name = document.createElement('span');
        name.className = 'city-tile-name';
        name.textContent = city.display;

        const meta = document.createElement('span');
        meta.className = 'city-tile-meta';

        // Status badge — colour-coded per state so the badge reinforces the van colour.
        // Priority order: hiring > origin > (busy applied later) > available.
        const isBusyCandidate = busy[slug] && busy[slug] > now && !status.hiring;
        if (status.hiring) {
          const hb = document.createElement('span');
          hb.className = 'city-tile-hiring-badge';
          hb.textContent = 'Hiring local tech';
          a.appendChild(hb);
        } else if (isOrigin && !isBusyCandidate) {
          const ob = document.createElement('span');
          ob.className = 'city-tile-origin-badge';
          ob.textContent = '★ Your city';
          a.appendChild(ob);
        } else if (!isBusyCandidate) {
          const ab = document.createElement('span');
          ab.className = 'city-tile-available-badge';
          ab.textContent = '● Available';
          a.appendChild(ab);
        }

        if (isOrigin) {
          if (status.hiring) {
            meta.innerHTML = '<strong>You’re here</strong> · Delta crew covers, ~' + status.coverEta + ' min';
          } else {
            meta.innerHTML = '<strong>You’re here</strong> · local tech ~' + city.localEta + ' min away';
          }
        } else if (status.hiring) {
          if (formatForOther) {
            meta.innerHTML = formatForOther(slug);
          } else {
            meta.textContent = 'Delta crew covers';
          }
        } else if (formatForOther) {
          meta.textContent = formatForOther(slug);
        } else {
          meta.textContent = '~' + city.localEta + ' min local tech';
        }

        // Busy indicator — applies ONLY to non-hiring, non-origin cities. Origin
        // always wears gold ("your city") even if its local tech is technically
        // mid-job, because nobody wants the homepage screaming 'your tech is busy
        // right now' at them. Hiring has its own steel-blue treatment.
        const busyUntil = busy[slug];
        if (busyUntil && busyUntil > now && !status.hiring && !isOrigin) {
          a.classList.add('city-tile-busy');
          const dot = document.createElement('span');
          dot.className = 'city-tile-busy-dot';
          dot.setAttribute('aria-hidden', 'true');
          a.appendChild(dot);

          const badge = document.createElement('span');
          badge.className = 'city-tile-busy-badge';
          badge.setAttribute('data-busy-until', String(busyUntil));
          badge.textContent = 'On a job · ' + _busyLabel(busyUntil - now);
          a.appendChild(badge);
        }

        a.appendChild(name);
        a.appendChild(meta);
        container.appendChild(a);
      });
    });
  }

  /* ---- 4-busy-tick. Refresh busy-badge countdown text in place each minute,
     so the user sees the timer count down without a full grid re-render. */
  function tickBusyBadges() {
    const now = Date.now();
    qsa('.city-tile-busy-badge').forEach(el => {
      const until = parseInt(el.getAttribute('data-busy-until') || '0', 10);
      if (!until || until <= now) {
        // expired — drop the busy treatment
        const tile = el.closest('.city-tile');
        if (tile) {
          tile.classList.remove('city-tile-busy');
          tile.querySelectorAll('.city-tile-busy-dot, .city-tile-busy-badge').forEach(n => n.remove());
        }
        return;
      }
      const isOriginBadge = el.previousSibling && el.previousSibling.previousSibling
        && el.closest('.city-tile-origin');
      el.textContent = (isOriginBadge ? 'On a job nearby · ' : 'On a job · ') + _busyLabel(until - now);
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
    const now = new Date();
    const h = now.getHours();
    const isHoliday = isHolidayToday();
    const isOpen = !isHoliday && h >= 7 && h < 21;

    document.body.classList.toggle('state-after-hours', !isOpen && !isHoliday);
    document.body.classList.toggle('state-holiday', isHoliday);

    if (banner) {
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
    swapHeroImage();
    try { renderHeroMoment(); } catch (e) {}
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

  /* ---- 10a. Reviews loader ----
     Fetch /assets/data/reviews.json and render the 3 best for this visitor.
     If user has an origin city, prefer reviews from that city. Otherwise
     show the most recent. Falls back to static HTML if fetch fails. */
  function loadReviews() {
    const container = qs('[data-reviews]');
    if (!container) return;

    fetch('/assets/data/reviews.json', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || !data.reviews || !data.reviews.length) return;
        const all = data.reviews.slice();
        let chosen;
        if (_originCity) {
          // Prefer reviews from the user's city, then nearby cities
          const localFirst = all.filter(r => r.city === _originCity);
          const remainder = all.filter(r => r.city !== _originCity);
          // Sort remainder by drive time from origin (if available)
          if (DRIVE_TIMES[_originCity]) {
            const times = DRIVE_TIMES[_originCity];
            remainder.sort((a, b) => (times[a.city] || 99) - (times[b.city] || 99));
          }
          chosen = localFirst.concat(remainder).slice(0, 3);
        } else {
          // Most recent first
          chosen = all.sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 3);
        }
        renderReviews(container, chosen, data);
      })
      .catch(() => { /* keep static fallback */ });
  }

  function renderReviews(container, reviews, meta) {
    container.innerHTML = '';
    reviews.forEach(r => {
      const card = document.createElement('div');
      card.className = 'review';
      const stars = '★'.repeat(Math.max(1, Math.min(5, r.stars || 5)));
      const flag = r.placeholder
        ? '<span class="review-placeholder-flag">placeholder</span>'
        : '';
      const cityDisplay = (CITIES[r.city] && CITIES[r.city].display) || r.city || '';
      const loc = [r.neighbourhood, cityDisplay].filter(Boolean).join(', ');
      card.innerHTML =
        '<div class="review-stars" aria-label="' + r.stars + ' stars">' + stars + '</div>' +
        '<p class="review-quote">"' + escapeHtml(r.quote) + '"</p>' +
        '<p class="review-author">— ' + escapeHtml(r.author) + (loc ? ', ' + escapeHtml(loc) : '') + ' ' + flag + '</p>';
      container.appendChild(card);
    });
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]);
  }

  /* ---- 10b. Enhance footer with site-data credentials ----
     Replaces the simple footer-meta line with a richer credentials line
     that includes WCB, licence, and COI link when set. Until SITE_DATA
     is populated, the footer reads the same as before. */
  function enhanceFooter() {
    const metas = qsa('.footer-meta');
    if (!metas.length) return;
    metas.forEach(meta => {
      // Only enhance if at least one credential is set
      const hasAny = SITE_DATA.wcbAccount || SITE_DATA.bcLicence || SITE_DATA.coiPdfUrl;
      if (!hasAny) return;

      const year = '<span data-year>' + new Date().getFullYear() + '</span>';
      const parts = [
        '© ' + year + ' YVR Garage Door Springs',
        SITE_DATA.insuranceAmount + ' general liability' +
          (SITE_DATA.insuranceCarrier ? ' (' + SITE_DATA.insuranceCarrier + ')' : ''),
        SITE_DATA.coiPdfUrl
          ? '<a href="' + SITE_DATA.coiPdfUrl + '" target="_blank" rel="noopener">COI PDF</a>'
          : null,
        SITE_DATA.wcbAccount ? 'WorkSafeBC #' + SITE_DATA.wcbAccount : 'WorkSafeBC',
        SITE_DATA.bcLicence ? 'BC Lic #' + SITE_DATA.bcLicence : null,
        '<a href="/privacy/">Privacy</a>'
      ].filter(Boolean);

      meta.innerHTML = parts.join(' · ');
    });
  }

  /* ---- Site-data spans (data-site-data attribute) ---- */
  function applySiteData() {
    qsa('[data-site-data]').forEach(el => {
      const key = el.getAttribute('data-site-data');
      const val = SITE_DATA[key];
      if (val) {
        if (el.tagName === 'A') {
          el.setAttribute('href', val);
          if (!el.textContent.trim()) el.textContent = 'View document';
          el.removeAttribute('hidden');
        } else {
          el.textContent = String(val);
          el.removeAttribute('hidden');
        }
      } else {
        // Keep static placeholder text visible (don't hide)
        // unless the element opts in via data-site-data-hide-when-empty
        if (el.hasAttribute('data-site-data-hide-when-empty')) {
          el.setAttribute('hidden', '');
        }
      }
    });
  }

  /* ---- 10c. Image state-class manager + hero variant swap ----
     Body classes:
       - state-cold        when /weather.php reports cold:true
       - state-after-hours when applyAvailability finds we're closed
       - state-holiday     when applyAvailability finds it's a BC stat day
     Hero image swaps based on these + the data-intent attribute. */
  const HERO_VARIANTS = {
    'default':    { src: '/assets/img/hero/hero-emergency.jpg',       alt: 'Close-up of a broken residential garage door torsion spring with a visible gap in the coil' },
    'cold':       { src: '/assets/img/hero/hero-emergency-cold.jpg',  alt: 'Frost on a garage door torsion spring on a sub-zero Vancouver morning' },
    'night':      { src: '/assets/img/hero/hero-emergency-night.jpg', alt: 'Residential garage door torsion spring under a warm overhead garage light, after hours' },
    'price':      { src: '/assets/img/hero/hero-pricing.jpg',         alt: 'Three sizes of garage door torsion spring laid out on a workbench, each tagged with its flat-rate price' },
    'diagnostic': { src: '/assets/img/hero/hero-diagnostic.jpg',      alt: 'A garage door spring diagnostic checklist on a clipboard with three checkbox items' }
  };

  function pickHeroVariant() {
    const intent = document.body.getAttribute('data-intent');
    if (intent === 'price') return 'price';
    if (intent === 'diagnostic') return 'diagnostic';
    if (document.body.classList.contains('state-cold')) return 'cold';
    if (document.body.classList.contains('state-after-hours')) return 'night';
    return 'default';
  }

  function swapHeroImage() {
    const fig = qs('[data-hero-image]');
    if (!fig) return;
    const img = qs('img', fig);
    if (!img) return;
    const v = HERO_VARIANTS[pickHeroVariant()];
    if (!v) return;
    if (img.getAttribute('src') !== v.src) {
      img.setAttribute('src', v.src);
      img.setAttribute('alt', v.alt);
    }
  }

  /* ---- 11. Cold-snap banner ----
     Fetches /weather.php (which manages /weather.json + ECCC refresh on
     a 2-hour cadence). Toggles the .cold-snap banner element if cold=true.
     Banner copy comes from PHP so it includes the actual forecast low. */
  function coldSnap() {
    const banner = qs('.cold-snap');
    if (!banner) return;
    fetch('/weather.php', { cache: 'no-cache' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || !data.cold) {
          banner.classList.remove('active');
          document.body.classList.remove('state-cold');
          swapHeroImage();
          try { renderHeroMoment(); } catch (e) {}
          return;
        }
        const msg = data.message ||
          'Cold snap on the South Coast. Springs break at 0°C. We\'re booking fast.';
        banner.innerHTML = msg + ' <a data-tel style="color:inherit;text-decoration:underline;font-weight:700">Call now</a>';
        banner.classList.add('active');
        document.body.classList.add('state-cold');
        wireContacts(banner);
        swapHeroImage();
        try { renderHeroMoment(); } catch (e) {}
      })
      .catch(() => {
        // Silent fail — banner stays hidden
      });
  }

  /* ---- 12. Dynamic hero "moment" ----
     Picks a one-line, time/day/weather/intent/city-aware copy variant and renders
     it into [data-hero-moment]. Re-renders every time origin city, intent, or
     weather/availability state changes. Designed to feel like the page knows what
     time it is and where the user is. */

  function formatTime(d) {
    let h = d.getHours();
    const m = d.getMinutes();
    const ampm = h >= 12 ? 'p.m.' : 'a.m.';
    h = h % 12; if (h === 0) h = 12;
    return h + ':' + String(m).padStart(2, '0') + ' ' + ampm;
  }
  function timeBucket(h) {
    if (h < 7)  return 'predawn';        // 12am–6:59am
    if (h < 9)  return 'morning-rush';   // 7–8:59am
    if (h < 12) return 'late-morning';   // 9–11:59am
    if (h < 15) return 'midday';         // 12–2:59pm
    if (h < 18) return 'afternoon';      // 3–5:59pm
    if (h < 21) return 'evening';        // 6–8:59pm
    return 'late';                       // 9pm+
  }
  function dayLabel(d) {
    return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getDay()];
  }

  // Each moment is {when:fn, copy:str|fn(ctx)} — first matching variant wins.
  // Use {city}, {time}, {day} placeholders.
  const MOMENTS = [
    // --- Search-intent overrides (URL param ?intent=...) ---
    { when: ctx => ctx.intent === 'emergency',
      copy: '<strong>Stay back from the spring.</strong> A wound torsion stores 200–400 lb of force. If it just snapped: leave the door closed, pull the red opener cord, then call us.' },
    { when: ctx => ctx.intent === 'price',
      copy: 'You came in looking for a number. <strong>$784 / $832 / $1,193</strong>, all-in, plus GST. The middle tier is what 95% of customers pick.' },
    { when: ctx => ctx.intent === 'diagnostic',
      copy: 'Run the 30-second test: pull the red opener cord, lift the door by hand to about 3 feet. Heavy in your hand = spring. Light = opener.' },
    { when: ctx => ctx.intent === 'coastal',
      copy: 'Within four km of the Strait? Cables go first. We carry stainless on the Richmond, Delta, Tsawwassen and White Rock vans by default — same flat-rate.' },
    { when: ctx => ctx.intent === 'cold' && !ctx.cold,
      copy: 'Cold-weather springs aren\'t a Vancouver myth. Steel goes brittle near freezing — and one bad night is what finishes a spring that\'s already at end-of-life.' },

    // --- "urgent" is the default body data-intent — only fires when we have NO other strong signal ---
    // (kept as a no-op so the time-bucket variants below get to run instead)
    { when: ctx => ctx.intent === 'urgent' && false, copy: '' },

    // --- Cold-snap overrides (state-cold body class) ---
    { when: ctx => ctx.cold && ctx.bucket === 'predawn',
      copy: ctx => 'It\'s ' + ctx.timeStr + ' and the steel is brittle. Cold snaps are when we get the bang calls. <strong>Book now;</strong> first crew rolls at 7 a.m.' },
    { when: ctx => ctx.cold,
      copy: ctx => 'Cold snap on the South Coast. The metallurgy doesn\'t lie — call volume roughly doubles for 3–5 days after every dip below 0°C. Pre-book to skip the queue.' },

    // --- After-hours / late-night ---
    { when: ctx => ctx.afterHours && ctx.bucket === 'late',
      copy: ctx => 'It\'s ' + ctx.timeStr + ' and we\'re technically closed. <strong>Text a photo</strong> — on-call tech replies inside 2 hours and we\'re back on the road at 7 a.m.' },
    { when: ctx => ctx.afterHours,
      copy: ctx => 'It\'s ' + ctx.timeStr + ', after-hours. Voicemail right now. Text a photo and we\'ll reply tomorrow at 7 a.m. — <strong>same price as any other hour.</strong>' },

    // --- Friday late / weekend setup ---
    { when: ctx => ctx.day === 5 && ctx.bucket === 'evening',
      copy: ctx => 'Friday ' + ctx.timeStr + ' Don\'t let a busted spring eat your weekend — last dispatch slot tonight, then we\'re back Saturday at 7 a.m. (<strong>same price as Tuesday</strong>).' },
    { when: ctx => ctx.day === 5 && (ctx.bucket === 'afternoon' || ctx.bucket === 'midday'),
      copy: ctx => 'Friday ' + ctx.timeStr + ' If you want this fixed before the weekend, call before 4 — that\'s when the road clogs up.' },

    // --- Saturday / Sunday ---
    { when: ctx => ctx.day === 6 && (ctx.bucket === 'morning-rush' || ctx.bucket === 'late-morning'),
      copy: ctx => 'Saturday morning, ' + ctx.timeStr + ' Yes we work Saturdays. <strong>Same price as Tuesday morning.</strong> Coffee\'s on us when we get there. (No it\'s not.)' },
    { when: ctx => ctx.day === 0,
      copy: ctx => 'Sunday ' + ctx.timeStr + ' We work Sundays too. Same price. No "weekend rate," no diagnostic fee, no surprises.' },

    // --- Weekday time-buckets ---
    { when: ctx => ctx.bucket === 'predawn',
      copy: ctx => 'It\'s ' + ctx.timeStr + ' on a ' + ctx.dayStr + ' and we\'re already loaded up. If the bang was just now, call — first crew rolls at 7 a.m.' },
    { when: ctx => ctx.bucket === 'morning-rush',
      copy: ctx => ctx.dayStr + ' ' + ctx.timeStr + ' 40% of our calls land between 6:30 and 8:30 a.m. — heading out, hitting the button, hearing the bang, freezing. You\'re not alone.' },
    { when: ctx => ctx.bucket === 'late-morning',
      copy: ctx => ctx.dayStr + ' ' + ctx.timeStr + ' Mid-morning is quiet on the road. Call now if you want a same-day slot.' },
    { when: ctx => ctx.bucket === 'midday',
      copy: ctx => ctx.dayStr + ' ' + ctx.timeStr + ' Lunch-hour calls usually mean the spring went overnight and you\'ve been driving around the issue. Two-spring fix takes us ~45 min in the driveway.' },
    { when: ctx => ctx.bucket === 'afternoon',
      copy: ctx => ctx.dayStr + ' ' + ctx.timeStr + ' School pickup\'s coming. We can be in the driveway before the bus is.' },
    { when: ctx => ctx.bucket === 'evening',
      copy: ctx => ctx.dayStr + ' ' + ctx.timeStr + ' Live dispatch until 9 p.m. — <strong>same price as 7 a.m.</strong> No "after-hours" line on the invoice.' },

    // --- Fallback ---
    { when: () => true,
      copy: ctx => 'Live dispatch in ' + ctx.cityDisplay + '. Local tech, ~' + ctx.eta + ' minutes from your driveway.' }
  ];

  function renderHeroMoment() {
    const el = qs('[data-hero-moment]');
    if (!el) return;
    const now = new Date();
    const hour = now.getHours();
    const pageCity = document.body.getAttribute('data-city'); // set on city pages only
    const onCityPage = pageCity && CITIES[pageCity];
    const ctx = {
      now: now,
      hour: hour,
      day: now.getDay(),
      bucket: timeBucket(hour),
      timeStr: formatTime(now),
      dayStr: dayLabel(now),
      cold: document.body.classList.contains('state-cold'),
      afterHours: document.body.classList.contains('state-after-hours'),
      holiday: document.body.classList.contains('state-holiday'),
      intent: (document.body.getAttribute('data-intent') || '').toLowerCase(),
      cityDisplay: _originCity ? CITIES[_originCity].display : (onCityPage ? CITIES[pageCity].display : 'Greater Vancouver'),
      eta: _originCity ? (CITIES[_originCity].localEta || 12) : (onCityPage ? (CITIES[pageCity].localEta || 12) : 12),
      pageCity: pageCity,
      pageCityDisplay: onCityPage ? CITIES[pageCity].display : null,
      // If we know both origin and page city, calculate drive time between them
      crossCity: (onCityPage && _originCity && _originCity !== pageCity && DRIVE_TIMES[_originCity])
        ? { eta: DRIVE_TIMES[_originCity][pageCity], from: CITIES[_originCity].display, to: CITIES[pageCity].display }
        : null
    };

    // City-page cross-context override: user is reading a different city's page than the one they're in
    if (ctx.crossCity) {
      el.innerHTML = 'You\'re in <strong>' + ctx.crossCity.from + '</strong>, reading the <strong>' + ctx.crossCity.to + '</strong> page. '
        + (ctx.crossCity.eta ? 'About ' + ctx.crossCity.eta + ' min apart in normal traffic — ' : '')
        + 'pricing\'s identical on both sides of the bridge.';
      el.removeAttribute('hidden');
      return;
    }

    let copy;
    for (const m of MOMENTS) {
      if (m.when(ctx)) {
        copy = typeof m.copy === 'function' ? m.copy(ctx) : m.copy;
        break;
      }
    }
    if (!copy) return;
    el.innerHTML = copy
      .replace(/\{city\}/g, ctx.cityDisplay)
      .replace(/\{time\}/g, ctx.timeStr)
      .replace(/\{day\}/g, ctx.dayStr);
    el.removeAttribute('hidden');
  }

  /* ============================================================
     LIVE VANCOUVER SKY — time-of-day + weather + moon phase
     Builds the scene behind the hero. Always Vancouver, regardless of which
     city the user is in (per product spec).
     ============================================================ */

  // Reference new moon (2000-01-06 18:14 UTC) and mean synodic month in ms.
  const MOON_REF_MS  = Date.UTC(2000, 0, 6, 18, 14);
  const SYNODIC_MS   = 29.530588853 * 86400000;

  // Returns moon phase as fraction [0, 1).
  // 0 = new, 0.25 = first quarter, 0.5 = full, 0.75 = last quarter.
  function moonPhase(date) {
    const t = (date || new Date()).getTime();
    return (((t - MOON_REF_MS) % SYNODIC_MS) / SYNODIC_MS + 1) % 1;
  }

  // Builds the SVG path 'd' attribute for the LIT portion of the moon disk.
  // Math credit: standard "limb arc + terminator ellipse" approach.
  function moonLitPath(phase, cx, cy, r) {
    // New moon — nothing lit
    if (phase < 0.005 || phase > 0.995) return '';
    // Full moon — full disk as a two-arc path
    if (Math.abs(phase - 0.5) < 0.005) {
      return 'M ' + cx + ' ' + (cy - r)
        + ' A ' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r)
        + ' A ' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy - r) + ' Z';
    }
    const rx = r * Math.abs(Math.cos(2 * Math.PI * phase));
    const waxing  = phase < 0.5;
    const gibbous = phase > 0.25 && phase < 0.75;
    const limbSweep = waxing ? 1 : 0;
    // Crescent: terminator bows AWAY from lit side (sweep opposite of limb)
    // Gibbous : terminator bows TOWARD lit side (sweep same as limb)
    const termSweep = gibbous ? limbSweep : (1 - limbSweep);
    return 'M ' + cx + ' ' + (cy - r)
      + ' A ' + r + ' ' + r + ' 0 0 ' + limbSweep + ' ' + cx + ' ' + (cy + r)
      + ' A ' + rx + ' ' + r + ' 0 0 ' + termSweep + ' ' + cx + ' ' + (cy - r) + ' Z';
  }

  // Map a WMO weather_code → our reduced scene state
  function weatherCodeToState(code) {
    if (code === 0) return 'clear';
    if (code === 1 || code === 2 || code === 3) return 'cloudy';
    if (code === 45 || code === 48) return 'fog';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow';
    if (code === 95 || code === 96 || code === 99) return 'storm';
    return 'clear';
  }

  // Hour in Vancouver's local timezone — works regardless of the visitor's TZ.
  function vancouverHour(date) {
    try {
      return parseInt(
        new Intl.DateTimeFormat('en-CA', {
          timeZone: 'America/Vancouver', hour: 'numeric', hour12: false
        }).format(date || new Date()),
        10
      );
    } catch (e) {
      return (date || new Date()).getHours();
    }
  }

  // Convert (isDay flag from Open-Meteo, Vancouver hour) → dawn / day / dusk / night
  // is_day is ground truth (real sunrise/sunset). Hour-of-day separates the
  // twilight windows into dawn (before day) and dusk (after day).
  function timeOfDay(isDay, hour) {
    if (isDay === 1 || isDay === true) {
      if (hour < 8) return 'dawn';
      if (hour >= 19) return 'dusk';     // late summer evenings still "day" by the sun, but visually dusky
      return 'day';
    }
    if (hour >= 16 && hour < 22) return 'dusk';
    return 'night';
  }

  const SKY_WEATHER_CACHE_KEY = 'yvr-vancouver-weather-v1';
  const SKY_WEATHER_TTL_MS    = 15 * 60 * 1000;

  function loadCachedWeather() {
    try {
      const raw = localStorage.getItem(SKY_WEATHER_CACHE_KEY);
      if (!raw) return null;
      const o = JSON.parse(raw);
      if (!o || typeof o.t !== 'number') return null;
      return o;
    } catch (e) { return null; }
  }
  function saveCachedWeather(data) {
    try { localStorage.setItem(SKY_WEATHER_CACHE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  // Fetch Vancouver's current weather. Resolves to {code, isDay} or null.
  function fetchVancouverWeather() {
    const cached = loadCachedWeather();
    const fresh = cached && (Date.now() - cached.t) < SKY_WEATHER_TTL_MS;
    if (fresh) return Promise.resolve(cached.data);
    const url =
      'https://api.open-meteo.com/v1/forecast?latitude=49.2827&longitude=-123.1207'
      + '&current=weather_code,is_day,temperature_2m&timezone=America%2FVancouver';
    return fetch(url, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j || !j.current) return cached ? cached.data : null;
        const data = {
          code:  j.current.weather_code,
          isDay: j.current.is_day,
          tempC: typeof j.current.temperature_2m === 'number' ? j.current.temperature_2m : null
        };
        saveCachedWeather({ t: Date.now(), data: data });
        return data;
      })
      .catch(function () { return cached ? cached.data : null; });
  }

  // Human-readable text for a WMO weather code
  function weatherCodeToText(code) {
    if (code === 0) return 'Clear sky';
    if (code === 1) return 'Mainly clear';
    if (code === 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Foggy';
    if (code === 51 || code === 53 || code === 55) return 'Drizzle';
    if (code === 56 || code === 57) return 'Freezing drizzle';
    if (code === 61) return 'Light rain';
    if (code === 63) return 'Rain';
    if (code === 65) return 'Heavy rain';
    if (code === 66 || code === 67) return 'Freezing rain';
    if (code === 71) return 'Light snow';
    if (code === 73) return 'Snow';
    if (code === 75) return 'Heavy snow';
    if (code === 77) return 'Snow grains';
    if (code === 80) return 'Rain showers';
    if (code === 81 || code === 82) return 'Heavy showers';
    if (code === 85) return 'Snow showers';
    if (code === 86) return 'Heavy snow showers';
    if (code === 95) return 'Thunderstorm';
    if (code === 96 || code === 99) return 'Storm + hail';
    return '—';
  }

  // Emoji glyph for the readout badge. Day/night-aware for clear/partly-cloudy.
  function weatherCodeToIcon(code, isDay) {
    if (code === 0)                                   return isDay ? '☀' : '🌙';
    if (code === 1 || code === 2)                     return isDay ? '⛅' : '☁';
    if (code === 3)                                   return '☁';
    if (code === 45 || code === 48)                   return '🌫';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return '🌧';
    if ((code >= 71 && code <= 77) || code === 85 || code === 86) return '❄';
    if (code === 95 || code === 96 || code === 99)    return '⛈';
    return isDay ? '☀' : '🌙';
  }

  function formatClockVancouver(date) {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Vancouver',
        hour: 'numeric', minute: '2-digit', hour12: true
      }).format(date || new Date());
    } catch (e) { return (date || new Date()).toLocaleTimeString(); }
  }

  // Update the sky-readout badge: city, time, temp, conditions
  function updateSkyReadout(weather, isDay) {
    const root  = qs('[data-sky-readout]');
    if (!root) return;
    const timeEl = qs('[data-sky-readout-time]', root);
    const tempEl = qs('[data-sky-readout-temp]', root);
    const condEl = qs('[data-sky-readout-cond]', root);
    const iconEl = qs('[data-sky-readout-icon]', root);
    if (timeEl) timeEl.textContent = formatClockVancouver();
    if (weather) {
      if (tempEl) tempEl.textContent =
        (typeof weather.tempC === 'number') ? (Math.round(weather.tempC) + '°C') : '—';
      if (condEl) condEl.textContent = weatherCodeToText(weather.code);
      if (iconEl) iconEl.textContent = weatherCodeToIcon(weather.code, !!weather.isDay);
    } else {
      // No weather data yet — show a tasteful placeholder
      if (tempEl) tempEl.textContent = '—';
      if (condEl) condEl.textContent = 'checking…';
      if (iconEl) iconEl.textContent = isDay ? '☀' : '🌙';
    }
  }

  // Apply state to the [data-hero-sky] element. Called twice: once with
  // synchronously-known values (just time + moon, weather defaults to clear),
  // and again after the weather fetch resolves.
  function applySkyState(state) {
    const sky = qs('[data-hero-sky]');
    if (!sky) return;
    if (state.time)    sky.setAttribute('data-time', state.time);
    if (state.weather) sky.setAttribute('data-weather', state.weather);
    if (typeof state.moon === 'number') {
      sky.setAttribute('data-moon', state.moon.toFixed(3));
      const lit = qs('.sky-moon-lit', sky);
      if (lit) lit.setAttribute('d', moonLitPath(state.moon, 0, 0, 36));
    }
    // Toggle a parent flag for dark-mode readability scrim on the headline column.
    // Triggers on any sky state where the backdrop is darker than the headline text:
    // night, dusk, plus daytime rain/storm/snow (heavy cloud cover = dim backdrop).
    const hero = sky.closest('.hero');
    if (hero) {
      const darkTime = state.time === 'night' || state.time === 'dusk';
      const darkWx   = state.weather === 'rain' || state.weather === 'storm' || state.weather === 'snow';
      hero.setAttribute('data-hero-mode', (darkTime || darkWx) ? 'dark' : 'light');
    }
  }

  function updateSky() {
    if (!qs('[data-hero-sky]')) return;
    const now = new Date();
    const phase = moonPhase(now);
    // First, render synchronously with what we know
    const hour0 = vancouverHour(now);
    const isDay0 = hour0 >= 7 && hour0 < 19 ? 1 : 0;
    const time0 = timeOfDay(isDay0, hour0);
    applySkyState({ time: time0, weather: 'clear', moon: phase });
    updateSkyReadout(null, isDay0);
    // Then refine with real weather data
    fetchVancouverWeather().then(function (w) {
      if (!w) return;
      const hour = vancouverHour();
      applySkyState({
        time: timeOfDay(w.isDay, hour),
        weather: weatherCodeToState(w.code),
        moon: moonPhase()
      });
      updateSkyReadout(w, w.isDay);
    });
  }
  // Tick the readout's clock minute by minute so the time stays current
  // without requeueing the whole sky update.
  function tickSkyReadoutClock() {
    const timeEl = qs('[data-sky-readout-time]');
    if (timeEl) timeEl.textContent = formatClockVancouver();
  }

  /* ---- Init ---- */
  function init() {
    wireContacts();
    applySiteData();
    enhanceFooter();
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
    renderHeroMoment();   // first pass — uses whatever state we have synchronously
    updateSky();          // live Vancouver sky behind the hero
    loadReviews();        // async — independent of geo
    detectGeo();          // async — last
    // Re-render the moment line every minute so the clock advances live
    setInterval(renderHeroMoment, 60 * 1000);
    // Refresh the sky every 10 min (catches day → night transitions and weather changes)
    setInterval(updateSky, 10 * 60 * 1000);
    // Tick the sky-readout clock every minute so the time stays current.
    setInterval(tickSkyReadoutClock, 60 * 1000);
    // Tick the busy-tech countdowns every 60s; do a full grid re-render every 5 min
    // to catch newly-busy techs as the schedule rotates.
    setInterval(tickBusyBadges, 60 * 1000);
    setInterval(function () { renderCityGrid(_originCity); }, 5 * 60 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
