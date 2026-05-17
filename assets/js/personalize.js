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

  /* ---- Cities we actually serve (lowercase keys, display values) ----
     Drive time = local-tech-to-your-home estimate (NOT downtown dispatch). */
  const CITIES = {
    'vancouver':       { display: 'Vancouver',       eta: '12' },
    'burnaby':         { display: 'Burnaby',         eta: '12' },
    'richmond':        { display: 'Richmond',        eta: '15' },
    'surrey':          { display: 'Surrey',          eta: '12' },
    'coquitlam':       { display: 'Coquitlam',       eta: '15' },
    'port-coquitlam':  { display: 'Port Coquitlam',  eta: '15' },
    'port coquitlam':  { display: 'Port Coquitlam',  eta: '15' },
    'port-moody':      { display: 'Port Moody',      eta: '15' },
    'port moody':      { display: 'Port Moody',      eta: '15' },
    'north-vancouver': { display: 'North Vancouver', eta: '12' },
    'north vancouver': { display: 'North Vancouver', eta: '12' },
    'west-vancouver':  { display: 'West Vancouver',  eta: '15' },
    'west vancouver':  { display: 'West Vancouver',  eta: '15' },
    'new-westminster': { display: 'New Westminster', eta: '12' },
    'new westminster': { display: 'New Westminster', eta: '12' },
    'delta':           { display: 'Delta',           eta: '15' },
    'ladner':          { display: 'Ladner',          eta: '15' },
    'langley':         { display: 'Langley',         eta: '18' },
    'white-rock':      { display: 'White Rock',      eta: '15' },
    'white rock':      { display: 'White Rock',      eta: '15' },
    'maple-ridge':     { display: 'Maple Ridge',     eta: '18' },
    'maple ridge':     { display: 'Maple Ridge',     eta: '18' },
    'pitt-meadows':    { display: 'Pitt Meadows',    eta: '18' },
    'pitt meadows':    { display: 'Pitt Meadows',    eta: '18' },
    'tsawwassen':      { display: 'Tsawwassen',      eta: '18' }
  };

  /* ---- Helpers ---- */
  const qs  = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const swap = (sel, val) => { qsa(sel).forEach(el => { if (val) el.textContent = val; }); };

  /* ---- 1. Wire phone / email / sms hrefs from constants ---- */
  function wireContacts() {
    qsa('[data-tel]').forEach(el => {
      el.setAttribute('href', 'tel:' + PHONE_TEL);
    });
    qsa('[data-phone-display]').forEach(el => {
      el.textContent = PHONE_DISPLAY;
    });
    qsa('[data-email]').forEach(el => {
      el.setAttribute('href', 'mailto:' + EMAIL);
    });
    qsa('[data-email-display]').forEach(el => {
      el.textContent = EMAIL;
    });
    qsa('[data-sms]').forEach(el => {
      el.setAttribute('href', 'sms:' + PHONE_TEL + '?body=' + encodeURIComponent(SMS_BODY));
    });
  }

  /* ---- 2. URL-param DTR ----
     ?city=burnaby  -> swap [data-dtr="city"] spans
     ?intent=urgent|price|diagnostic|specialty|stuck|cable|empathy
                    -> body[data-intent] attr drives CSS / copy variants */
  function applyDTR() {
    const params = new URLSearchParams(location.search);
    const intent = (params.get('intent') || '').toLowerCase();
    const cityParam = (params.get('city') || '').toLowerCase().trim();

    if (intent) {
      document.body.setAttribute('data-intent', intent.replace(/[^a-z]/g, ''));
    }

    if (cityParam && CITIES[cityParam]) {
      const city = CITIES[cityParam];
      swap('[data-dtr="city"]', city.display);
      swap('[data-dtr="eta"]', city.eta);
      document.body.setAttribute('data-city', cityParam);
    }
  }

  /* ---- 3. Geo-detect fallback (only if no ?city= in URL) ----
     Uses free ipapi.co. Silent fail -> keeps "Greater Vancouver" default.
     Never invents a city: must match one of our served cities. */
  function detectGeo() {
    if (new URLSearchParams(location.search).get('city')) return;
    if (document.body.getAttribute('data-city')) return;

    fetch('https://ipapi.co/json/', { mode: 'cors' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data || !data.city) return;
        const key = data.city.toLowerCase().trim();
        if (CITIES[key]) {
          const city = CITIES[key];
          swap('[data-dtr="city"]', city.display);
          swap('[data-dtr="eta"]', city.eta);
          document.body.setAttribute('data-city', key);
        }
      })
      .catch(() => {});
  }

  /* ---- 4. Time-of-day open/closed banner ----
     Open: 7am-9pm daily, BC time. Adjust BC_HOLIDAYS yearly. */
  const BC_HOLIDAYS_2026 = [
    '2026-01-01', // New Year's
    '2026-02-16', // Family Day
    '2026-04-03', // Good Friday
    '2026-05-18', // Victoria Day
    '2026-07-01', // Canada Day
    '2026-08-03', // BC Day
    '2026-09-07', // Labour Day
    '2026-09-30', // Truth and Reconciliation
    '2026-10-12', // Thanksgiving
    '2026-11-11', // Remembrance Day
    '2026-12-25', // Christmas
    '2026-12-26'  // Boxing Day
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

  /* ---- 5. Sticky bottom call bar ----
     Show after 25% scroll. Hide when an input/textarea is focused. */
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

  /* ---- 6. Diagnosis widget (3 questions -> result + call CTA) ---- */
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
        '<a class="btn btn-block mt-4" data-tel data-phone-display></a>';
      result.classList.add('shown');
      wireContacts();
      // Rewire phone display in the new button
      qsa('[data-phone-display]', result).forEach(el => el.textContent = 'Call ' + PHONE_DISPLAY);
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

  /* ---- 7. Quote form (basic mailto fallback; real intake = later) ---- */
  function quoteForm() {
    const form = qs('#quote-form');
    if (!form) return;
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
  }

  /* ---- 8. Cold-snap banner (stub — production reads /weather.json from cron) ---- */
  function coldSnap() {
    const banner = qs('.cold-snap');
    if (!banner) return;
    // Placeholder: in production, fetch('/weather.json') populated by an hourly
    // ECCC GeoMet poll (free, no key) — see Section 2.1.4. For now: no-op.
    // Example response: { cold: true, low_c: -4, message: "..." }
  }

  /* ---- Init ---- */
  function init() {
    applyDTR();      // sync first so geo doesn't override URL param
    wireContacts();
    applyAvailability();
    stickyBar();
    diagnosis();
    quoteForm();
    coldSnap();
    detectGeo();     // async — runs last
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
