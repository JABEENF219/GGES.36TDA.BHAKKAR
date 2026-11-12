/* ==========================================================================
   GGES 36 TDA BHAKKAR — Shared application shell
   Renders header + footer, handles theme, language toggle, toasts,
   scroll reveal, counters, live clock and settings binding.
   ========================================================================== */
(function (global) {
  'use strict';

  var TZ = 'Asia/Karachi';

  var NAV = [
    { key: 'nav.home', href: 'index.html', id: 'home' },
    { key: 'nav.about', href: 'about.html', id: 'about' },
    { key: 'nav.gallery', href: 'gallery.html', id: 'gallery' },
    { key: 'nav.view360', href: 'view360.html', id: 'view360' },
    { key: 'nav.notices', href: 'notices.html', id: 'notices' },
    { key: 'nav.admissions', href: 'admissions.html', id: 'admissions' },
    { key: 'nav.students', href: 'students.html', id: 'students' },
    { key: 'nav.teachers', href: 'teachers.html', id: 'teachers' },
    { key: 'nav.results', href: 'results.html', id: 'results' }
  ];

  var ICONS = {
    phone: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.6a2 2 0 0 1-.5 2.1L8.1 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7a2 2 0 0 1 1.7 2Z"/></svg>',
    mail: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
    pin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    clock: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    lock: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    sun: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>',
    moon: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10Z"/></svg>',
    up: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    arrow: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" class="flip-icon"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  /* ------------------------------------------------------------ small utils */
  function esc(s) { return global.Store.escape(s); }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function debounce(fn, ms) {
    var t; return function () {
      var a = arguments, self = this;
      clearTimeout(t); t = setTimeout(function () { fn.apply(self, a); }, ms || 220);
    };
  }

  /* --------------------------------------------------------------- settings */
  function settingValue(key) {
    var s = global.Store.settings();
    var lang = global.I18N.lang();
    if (lang === 'ur' && s[key + 'Ur'] !== undefined && s[key + 'Ur'] !== '') return s[key + 'Ur'];
    return s[key] !== undefined ? s[key] : '';
  }

  function bindSettings(root) {
    $$('[data-setting]', root || document).forEach(function (el) {
      var key = el.getAttribute('data-setting');
      var prefix = el.getAttribute('data-setting-prefix') || '';
      var suffix = el.getAttribute('data-setting-suffix') || '';
      var v = settingValue(key);
      if (v === '' || v === undefined) return;
      el.textContent = prefix + v + suffix;
    });
    $$('[data-setting-attr]', root || document).forEach(function (el) {
      var parts = el.getAttribute('data-setting-attr').split(':');
      var v = settingValue(parts[1]);
      if (v) el.setAttribute(parts[0], v);
    });
  }

  /* ------------------------------------------------------------------ toast */
  function toast(message, type, title) {
    var box = $('.toasts');
    if (!box) {
      box = document.createElement('div');
      box.className = 'toasts';
      box.setAttribute('role', 'status');
      box.setAttribute('aria-live', 'polite');
      document.body.appendChild(box);
    }
    var el = document.createElement('div');
    el.className = 'toast' + (type && type !== 'success' ? ' toast--' + type : '');
    var icon = type === 'error' ? '⚠️' : type === 'warn' ? '🔔' : type === 'info' ? 'ℹ️' : '✅';
    el.innerHTML = '<span aria-hidden="true">' + icon + '</span><div><strong>' +
      esc(title || (type === 'error' ? 'Error' : 'Done')) + '</strong>' +
      (message ? '<p>' + esc(message) + '</p>' : '') + '</div>';
    box.appendChild(el);
    setTimeout(function () {
      el.style.transition = 'opacity .3s, transform .3s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      setTimeout(function () { el.remove(); }, 320);
    }, 4200);
  }

  /* ---------------------------------------------------------------- header */
  function renderHeader(active) {
    var host = $('#site-header');
    if (!host) return;
    var s = global.Store.settings();
    var logo = s.logoData
      ? '<img src="' + esc(s.logoData) + '" alt="">'
      : 'G';

    var links = NAV.map(function (n) {
      return '<a class="nav__link" href="' + n.href + '" data-i18n="' + n.key + '"' +
        (n.id === active ? ' aria-current="page"' : '') + '></a>';
    }).join('');

    host.innerHTML =
      '<div class="topbar">' +
        '<div class="shell">' +
          '<div class="tb-info">' +
            '<span class="tb-item">' + ICONS.pin + '<span data-setting="address"></span></span>' +
            '<span class="tb-item">' + ICONS.phone + '<a data-setting="phone" href="#" data-phone-link></a></span>' +
          '</div>' +
          '<div class="tb-right">' +
            '<span class="tb-item">' + ICONS.clock + '<span id="live-clock">—</span></span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<header class="site-header" id="siteHeader">' +
        '<div class="shell">' +
          '<nav class="nav" aria-label="Main">' +
            '<a class="brand" href="index.html">' +
              '<span class="brand__logo">' + logo + '</span>' +
              '<span class="brand__text">' +
                '<span class="brand__name" data-setting="schoolName"></span>' +
                '<span class="brand__sub" data-i18n="brand.sub"></span>' +
              '</span>' +
            '</a>' +
            '<button class="nav-toggle" id="navToggle" aria-expanded="false" aria-controls="navLinks" data-i18n-aria="nav.menu">' +
              '<span></span><span class="sr-only">Menu</span>' +
            '</button>' +
            '<div class="nav__links" id="navLinks">' + links +
              '<div class="nav__actions">' +
                '<button class="icon-btn" id="langToggle" data-lang-toggle data-i18n-title="nav.lang" aria-label="Language">اردو</button>' +
                '<button class="icon-btn" id="themeToggle" data-i18n-title="nav.theme" aria-label="Theme"></button>' +
                '<a class="btn btn--primary btn--sm" href="admin.html">' + ICONS.lock + '<span data-i18n="nav.admin"></span></a>' +
              '</div>' +
            '</div>' +
          '</nav>' +
        '</div>' +
      '</header>';

    // phone link
    var phoneEl = host.querySelector('[data-phone-link]');
    if (phoneEl) {
      phoneEl.setAttribute('href', 'tel:' + settingValue('phone').replace(/[^\d+]/g, ''));
    }
  }

  /* ---------------------------------------------------------------- footer */
  function renderFooter() {
    var host = $('#site-footer');
    if (!host) return;
    host.className = 'site-footer';
    host.innerHTML =
      '<div class="shell">' +
        '<div class="footer-grid">' +
          '<div>' +
            '<div class="footer-brand">' +
              '<span class="brand__logo" id="footerLogo">G</span>' +
              '<b data-setting="schoolName"></b>' +
            '</div>' +
            '<p style="font-size:.89rem" data-i18n="footer.aboutText"></p>' +
            '<p class="small mt-2" style="color:#8fb5a6"><span data-i18n="common.builtFor"></span> <b data-setting="established"></b></p>' +
          '</div>' +
          '<div>' +
            '<h4 data-i18n="common.quickLinks"></h4>' +
            '<ul class="footer-list">' +
              '<li><a href="about.html" data-i18n="nav.about"></a></li>' +
              '<li><a href="admissions.html" data-i18n="nav.admissions"></a></li>' +
              '<li><a href="notices.html" data-i18n="nav.notices"></a></li>' +
              '<li><a href="results.html" data-i18n="nav.results"></a></li>' +
              '<li><a href="gallery.html" data-i18n="nav.gallery"></a></li>' +
            '</ul>' +
          '</div>' +
          '<div>' +
            '<h4 data-i18n="common.school"></h4>' +
            '<ul class="footer-list">' +
              '<li><a href="students.html" data-i18n="nav.students"></a></li>' +
              '<li><a href="teachers.html" data-i18n="nav.teachers"></a></li>' +
              '<li><a href="index.html#contact" data-i18n="nav.contact"></a></li>' +
              '<li><a href="admin.html" data-i18n="nav.admin"></a></li>' +
            '</ul>' +
          '</div>' +
          '<div>' +
            '<h4 data-i18n="common.contactUs"></h4>' +
            '<ul class="footer-list">' +
              '<li class="tb-item">' + ICONS.pin + '<span data-setting="address"></span></li>' +
              '<li class="tb-item">' + ICONS.phone + '<a id="footerPhone" href="#"></a></li>' +
              '<li class="tb-item">' + ICONS.mail + '<a id="footerMail" href="#"></a></li>' +
              '<li class="tb-item">' + ICONS.clock + '<span data-setting="officeHours"></span></li>' +
            '</ul>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>© <span id="footerYear"></span> <span data-setting="schoolName"></span>. <span data-i18n="common.rights"></span></span>' +
          '<span data-i18n="footer.legal"></span>' +
        '</div>' +
      '</div>';
  }

  function paintFooterExtras() {
    var s = global.Store.settings();
    var fLogo = $('#footerLogo');
    if (fLogo) fLogo.innerHTML = s.logoData ? '<img src="' + esc(s.logoData) + '" alt="">' : 'G';
    var fp = $('#footerPhone');
    if (fp) { fp.textContent = s.phone || ''; fp.href = 'tel:' + String(s.phone || '').replace(/[^\d+]/g, ''); }
    var fm = $('#footerMail');
    if (fm) { fm.textContent = s.email || ''; fm.href = 'mailto:' + (s.email || ''); }
    var fy = $('#footerYear');
    if (fy) fy.textContent = new Date().getFullYear();
  }

  /* -------------------------------------------------------------- behaviour */
  function bindBehaviour() {
    var toggle = $('#navToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        var open = document.body.classList.toggle('nav-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
      $$('#navLinks a').forEach(function (a) {
        a.addEventListener('click', function () {
          document.body.classList.remove('nav-open');
          toggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    var lang = $('#langToggle');
    if (lang) lang.addEventListener('click', function () { global.I18N.toggle(); });

    var theme = $('#themeToggle');
    if (theme) {
      theme.innerHTML = global.Store.getTheme() === 'dark' ? ICONS.sun : ICONS.moon;
      theme.addEventListener('click', function () {
        var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        global.Store.setTheme(next);
        theme.innerHTML = next === 'dark' ? ICONS.sun : ICONS.moon;
      });
    }

    // sticky header shadow
    var header = $('#siteHeader');
    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-stuck', global.scrollY > 8);
        var t = $('.to-top');
        if (t) t.classList.toggle('is-visible', global.scrollY > 480);
      };
      global.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    // back to top
    if (!$('.to-top')) {
      var b = document.createElement('button');
      b.className = 'to-top';
      b.innerHTML = ICONS.up;
      b.setAttribute('aria-label', 'Back to top');
      b.addEventListener('click', function () { global.scrollTo({ top: 0, behavior: 'smooth' }); });
      document.body.appendChild(b);
    }
  }

  /* ---------------------------------------------------------------- clocks */
  function startClock() {
    var el = $('#live-clock');
    if (!el) return;
    function tick() {
      var lang = global.I18N.lang();
      var locale = lang === 'ur' ? 'ur-PK' : 'en-GB';
      try {
        el.textContent = new Date().toLocaleString(locale, {
          timeZone: TZ, weekday: 'short', day: '2-digit', month: 'short',
          hour: '2-digit', minute: '2-digit'
        });
      } catch (e) {
        el.textContent = new Date().toLocaleString();
      }
    }
    tick();
    setInterval(tick, 30000);
  }

  /* ------------------------------------------------------- reveal + counters */
  function startReveal(root) {
    var items = $$('.reveal', root || document);
    if (!('IntersectionObserver' in global)) {
      items.forEach(function (i) { i.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target;
          var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
          setTimeout(function () { el.classList.add('is-in'); }, delay);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    items.forEach(function (i) { io.observe(i); });
  }

  function startCounters(root) {
    var nodes = $$('[data-count]', root || document);
    if (!nodes.length) return;
    function run(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-count-suffix') || '';
      var dur = 1100, start = performance.now();
      function frame(now) {
        var p = Math.min((now - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    if (!('IntersectionObserver' in global)) { nodes.forEach(run); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
      });
    }, { threshold: 0.4 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  /* ---------------------------------------------------------------- ticker */
  function renderTicker(selector) {
    var host = $(selector || '#ticker');
    if (!host) return;
    function paint() {
      var notices = global.Store.all('notices')
        .slice()
        .sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); })
        .slice(0, 8);
      if (!notices.length) { host.innerHTML = ''; host.style.display = 'none'; return; }
      host.style.display = '';
      var lang = global.I18N.lang();
      var items = notices.map(function (n) {
        return '<span class="ticker__item">★ ' + esc(lang === 'ur' && n.titleUr ? n.titleUr : n.title) + '</span>';
      }).join('');
      host.innerHTML =
        '<div class="shell">' +
          '<span class="ticker__label">' + (lang === 'ur' ? 'اطلاع' : 'Notice') + '</span>' +
          '<div class="ticker__viewport"><div class="ticker__track">' + items + items + '</div></div>' +
        '</div>';
    }
    paint();
    global.Store.subscribe('notices', paint);
  }

  /* ------------------------------------------------------------------ init */
  function init(opts) {
    opts = opts || {};
    document.documentElement.setAttribute('data-theme', global.Store.getTheme());
    global.I18N.setLang(global.Store.getLang());

    renderHeader(opts.active || '');
    renderFooter();
    global.I18N.apply(document);
    bindSettings(document);
    paintFooterExtras();
    bindBehaviour();
    startClock();
    if (opts.ticker !== false) renderTicker();
    startReveal();
    startCounters();

    document.addEventListener('gges:langchange', function () {
      bindSettings(document);
      paintFooterExtras();
      if (opts.ticker !== false) renderTicker();
    });

    // live settings sync across tabs
    global.Store.subscribe('settings', function () {
      bindSettings(document);
      paintFooterExtras();
      var logo = $('.brand__logo');
      var s = global.Store.settings();
      if (logo) logo.innerHTML = s.logoData ? '<img src="' + esc(s.logoData) + '" alt="">' : 'G';
    });
  }

  global.App = {
    init: init,
    toast: toast,
    esc: esc,
    $: $,
    $$: $$,
    debounce: debounce,
    ICONS: ICONS,
    bindSettings: bindSettings,
    renderTicker: renderTicker,
    settingValue: settingValue,
    startReveal: startReveal,
    startCounters: startCounters,
    NAV: NAV
  };

})(window);
