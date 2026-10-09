/* ==========================================================================
   The Round by Kuma Partners: app.js
   Vanilla ES6, zero dependencies.

   1. Config
   2. Utilities
   3. Header: sticky state, mobile drawer, smooth scroll, scroll-spy
   4. Brand logo fallback
   5. Guest seat form: validation + Netlify AJAX
   6. Member Portal: modal, passcode, session, ledger
   7. Scroll reveal and staggered entrances

   SECURITY NOTE
   The portal gate runs in the browser. The passcode is stored only as a
   SHA-256 hash, but anyone reading this file can see the ledger rows below.
   Keep entries anonymised by role, and turn on Netlify password protection
   for the subdomain before any real client data goes in.
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     1. CONFIG
     ------------------------------------------------------------------------ */

  const CONFIG = {
    /* SHA-256 hex of the cohort passcode. Current passcode: "theround2026".
       To change it, run this in any browser console and paste the result here:
         crypto.subtle.digest('SHA-256', new TextEncoder().encode('new-passcode'))
           .then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join('')))  */
    passcodeHash: 'b292f34bac5ac4ba7bc528117f469352be3852c54b92e38a3f0804b790c20152',
    sessionKey: 'kuma.theround.session',
    sessionTtlMs: 4 * 60 * 60 * 1000,
    maxAttempts: 5,
    lockoutMs: 30 * 1000,

    /* Next cohort session (YYYY-MM-DD). Leave empty to hide. */
    nextSessionDate: '2026-10-14',

    /* Link to the latest minutes PDF (for example a restricted Google Drive
       link). Leave empty and the button becomes an email request instead.
       Avoid putting the PDF in this repo: every file here is public. */
    minutesPdfUrl: '',

    contactEmail: 'contact@kuma.partners',
    personalEmailDomains: [
      'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.es', 'yahoo.fr', 'yahoo.de', 'hotmail.com',
      'hotmail.es', 'hotmail.fr', 'outlook.com', 'outlook.es', 'live.com', 'msn.com', 'icloud.com',
      'me.com', 'mac.com', 'aol.com', 'gmx.de', 'gmx.net', 'gmx.com', 'web.de', 'proton.me',
      'protonmail.com', 'yandex.com', 'mail.com', 'orange.fr', 'free.fr', 'laposte.net', 't-online.de'
    ]
  };

  /* Ledger rows, anonymised by role. Target dates are days from today so the
     demo stays current. status: 'in-progress' | 'actionable' | 'completed'.
     For real entries use a fixed date instead of offset: targetDate: '2026-10-22'. */
  const LEDGER = [
    { member: 'Founder & CEO', context: 'B2B SaaS · 140 people', decision: 'Split the commercial team into new-logo and expansion units with separate quotas.', offset: 9, partner: 'COO, Logistics', status: 'in-progress' },
    { member: 'CEO', context: 'Industrial · 1,200 people', decision: 'Replace the Iberia country manager through an external search.', offset: 34, partner: 'Founder, HealthTech', status: 'actionable' },
    { member: 'Co-founder & CTO', context: 'Climate tech · 85 people', decision: 'Freeze the second product line and move its engineers to the core platform.', offset: 3, partner: 'CEO, Fintech', status: 'in-progress' },
    { member: 'Founder & CEO', context: 'Marketplace · 30 people', decision: 'Accept the bridge round from existing investors instead of a new lead.', offset: 21, partner: 'CFO, B2B SaaS', status: 'actionable' },
    { member: 'Managing Director', context: 'Professional services · 60 people', decision: 'Exit the two lowest-margin retainer clients before year end.', offset: -6, partner: 'CEO, Industrial', status: 'completed' }
  ];

  const STATUS_LABEL = { 'in-progress': 'In Progress', actionable: 'Actionable', completed: 'Completed' };

  /* ------------------------------------------------------------------------
     2. UTILITIES
     ------------------------------------------------------------------------ */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const session = {
    get() {
      try { return JSON.parse(sessionStorage.getItem(CONFIG.sessionKey)); } catch (e) { return null; }
    },
    set(value) {
      try { sessionStorage.setItem(CONFIG.sessionKey, JSON.stringify(value)); } catch (e) { /* private mode */ }
    },
    clear() {
      try { sessionStorage.removeItem(CONFIG.sessionKey); } catch (e) { /* ignore */ }
    }
  };

  const pad = (n) => String(n).padStart(2, '0');
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
  const addDays = (n) => { const d = today(); d.setDate(d.getDate() + n); return d; };
  const daysUntil = (iso) => Math.round((parseISO(iso) - today()) / 86400000);
  const fmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatDate = (iso) => fmt.format(parseISO(iso));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const Toast = (() => {
    const el = $('[data-toast]');
    let timer = null;
    return {
      show(message) {
        if (!el) return;
        clearTimeout(timer);
        el.textContent = message;
        el.hidden = false;
        timer = setTimeout(() => { el.hidden = true; }, 3500);
      }
    };
  })();

  /* ------------------------------------------------------------------------
     3. HEADER
     ------------------------------------------------------------------------ */

  const Nav = (() => {
    const header = $('[data-site-header]');
    const drawer = $('[data-nav-drawer]');
    const toggle = $('[data-nav-toggle]');
    const scrim = $('[data-nav-scrim]');
    const mq = window.matchMedia('(max-width: 1240px)');

    const isOpen = () => drawer.classList.contains('is-open');

    const setOpen = (open) => {
      drawer.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      $('.icon-menu', toggle).hidden = open;
      $('.icon-close', toggle).hidden = !open;
      scrim.hidden = !open;
      document.body.classList.toggle('is-locked', open);
      if (open) { const first = $('a', drawer); if (first) first.focus(); }
    };

    const close = () => { if (isOpen()) setOpen(false); };

    /* Smooth scroll with an offset for the sticky header. */
    const scrollToHash = (hash) => {
      const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
      if (!target) return;
      const offset = (header ? header.offsetHeight : 0) + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: reducedMotion() ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', hash);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    };

    const initScrollSpy = () => {
      if (!('IntersectionObserver' in window)) return;
      const links = $$('.nav-links a[href^="#"]:not(.btn)');
      const map = new Map();
      links.forEach((a) => {
        const sec = document.getElementById(a.getAttribute('href').slice(1));
        if (sec) map.set(sec, a);
      });
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((l) => { l.classList.remove('is-current'); l.removeAttribute('aria-current'); });
          const link = map.get(entry.target);
          link.classList.add('is-current');
          link.setAttribute('aria-current', 'true');
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      map.forEach((_, sec) => io.observe(sec));
    };

    const init = () => {
      toggle.addEventListener('click', () => setOpen(!isOpen()));
      scrim.addEventListener('click', close);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
      });
      const onMq = (e) => { if (!e.matches) close(); };
      if (mq.addEventListener) mq.addEventListener('change', onMq); else mq.addListener(onMq);

      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-scroll]');
        if (!link) return;
        const hash = link.getAttribute('href');
        if (!hash || hash.charAt(0) !== '#') return;
        e.preventDefault();
        close();
        requestAnimationFrame(() => scrollToHash(hash));
      });

      const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      initScrollSpy();

      if (location.hash && location.hash !== '#portal') setTimeout(() => scrollToHash(location.hash), 60);
    };

    return { init, close };
  })();

  /* ------------------------------------------------------------------------
     4. BRAND LOGO FALLBACK
     ------------------------------------------------------------------------ */

  const initLogoFallback = () => {
    $$('[data-brand-logo]').forEach((img) => {
      const fail = () => img.closest('.brand-lockup').classList.add('is-logo-missing');
      if (img.complete && img.naturalWidth === 0) fail();
      else img.addEventListener('error', fail, { once: true });
    });
  };

  /* ------------------------------------------------------------------------
     5. GUEST SEAT FORM
     ------------------------------------------------------------------------ */

  const ApplyForm = (() => {
    const form = $('[data-apply-form]');
    const success = $('[data-form-success]');

    const setError = (field, message) => {
      const wrap = field.closest('.field');
      const err = document.getElementById(`${field.id}-error`);
      if (wrap) wrap.classList.toggle('is-invalid', Boolean(message));
      if (err) err.textContent = message || '';
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        if (err) {
          const ids = (field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
          if (!ids.includes(err.id)) ids.push(err.id);
          field.setAttribute('aria-describedby', ids.join(' '));
        }
      } else {
        field.removeAttribute('aria-invalid');
      }
    };

    const isPersonal = (email) => {
      const domain = (email.split('@')[1] || '').trim().toLowerCase();
      return CONFIG.personalEmailDomains.includes(domain);
    };

    const validate = (field) => {
      const value = field.type === 'checkbox' ? field.checked : field.value.trim();
      let msg = '';
      if (field.required && !value) {
        msg = field.type === 'checkbox' ? 'Please confirm to continue.' : 'This field is required.';
      } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        msg = 'Please enter a valid email address.';
      } else if (field.hasAttribute('data-work-email') && value && isPersonal(value)) {
        msg = 'Please use your corporate work email, not a personal inbox.';
      } else if (field.dataset.minlength && value && value.length < Number(field.dataset.minlength)) {
        msg = 'A little more detail helps us prepare. Two or three sentences is ideal.';
      }
      setError(field, msg);
      return !msg;
    };

    const status = (msg, isError) => {
      const el = $('[data-form-status]', form);
      el.textContent = msg || '';
      el.classList.toggle('is-error', Boolean(isError));
    };

    const init = () => {
      if (!form) return;
      const fields = $$('input[required], textarea[required]', form);
      const btn = $('button[type="submit"]', form);

      const textarea = $('textarea[maxlength]', form);
      const counter = $('[data-char-count]', form);
      if (textarea && counter) {
        const max = textarea.getAttribute('maxlength');
        const update = () => { counter.textContent = `${textarea.value.length} / ${max}`; };
        textarea.addEventListener('input', update);
        update();
      }

      fields.forEach((f) => {
        f.addEventListener('blur', () => { if (f.value || f.getAttribute('aria-invalid')) validate(f); });
        f.addEventListener('input', () => { if (f.getAttribute('aria-invalid')) validate(f); });
        f.addEventListener('change', () => { if (f.getAttribute('aria-invalid')) validate(f); });
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        status('');
        let firstInvalid = null;
        fields.forEach((f) => { if (!validate(f) && !firstInvalid) firstInvalid = f; });
        if (firstInvalid) {
          firstInvalid.focus();
          status('Please review the highlighted fields.', true);
          return;
        }

        btn.disabled = true;
        btn.textContent = 'Sending…';

        fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams(new FormData(form)).toString()
        })
          .then((res) => {
            if (!res.ok) throw new Error(String(res.status));
            form.reset();
            form.hidden = true;
            success.hidden = false;
            success.focus();
          })
          .catch(() => {
            status(`We could not send your request just now. Please try again or write to ${CONFIG.contactEmail}.`, true);
          })
          .finally(() => {
            btn.disabled = false;
            btn.textContent = btn.dataset.submitLabel;
          });
      });
    };

    return { init };
  })();

  /* ------------------------------------------------------------------------
     6. MEMBER PORTAL
     ------------------------------------------------------------------------ */

  const Portal = (() => {
    const overlay = $('[data-portal-modal]');
    const dialog = $('[data-portal-dialog]');
    const authView = $('[data-portal-auth]');
    const dashView = $('[data-portal-dashboard]');
    const loginForm = $('[data-login-form]');
    const passInput = $('#portal-pass');
    const loginError = $('[data-login-error]');
    const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), [tabindex]:not([tabindex="-1"])';

    let returnFocus = null;
    let attempts = 0;
    let lockedUntil = 0;

    /* --- session --- */
    const isAuthed = () => {
      const s = session.get();
      if (!s || !s.exp || Date.now() > s.exp) { session.clear(); return false; }
      return true;
    };
    const refresh = () => { if (isAuthed()) session.set({ exp: Date.now() + CONFIG.sessionTtlMs }); };

    const sha256 = async (text) => {
      if (!(window.crypto && crypto.subtle)) throw new Error('insecure-context');
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    };

    /* --- ledger --- */
    const cell = (label, className) => {
      const td = document.createElement('td');
      td.setAttribute('data-label', label);
      if (className) td.className = className;
      return td;
    };

    const renderLedger = () => {
      const body = $('[data-ledger-body]');
      const rows = LEDGER.map((r) => ({ ...r, targetDate: r.targetDate || toISO(addDays(r.offset)) }))
        .sort((a, b) => (a.status === 'completed') - (b.status === 'completed') || a.targetDate.localeCompare(b.targetDate));

      body.textContent = '';
      const counts = { 'in-progress': 0, actionable: 0, completed: 0 };

      rows.forEach((r) => {
        counts[r.status] += 1;
        const tr = document.createElement('tr');
        if (r.status === 'completed') tr.className = 'row-completed';

        const c1 = cell('Member', 'cell-member');
        c1.textContent = r.member;
        const sub = document.createElement('span');
        sub.className = 'cell-sub';
        sub.textContent = r.context;
        c1.appendChild(sub);

        const c2 = cell('Hard call', 'cell-decision');
        c2.textContent = r.decision;

        const c3 = cell('Target date', 'cell-date');
        const time = document.createElement('time');
        time.dateTime = r.targetDate;
        time.textContent = formatDate(r.targetDate);
        c3.appendChild(time);
        const days = daysUntil(r.targetDate);
        const d = document.createElement('span');
        d.className = 'cell-days';
        if (r.status === 'completed') d.textContent = 'Closed';
        else if (days < 0) { d.textContent = `${-days} day${days === -1 ? '' : 's'} overdue`; d.classList.add('is-overdue'); }
        else if (days === 0) d.textContent = 'Due today';
        else d.textContent = `${days} day${days === 1 ? '' : 's'} left`;
        c3.appendChild(d);

        const c4 = cell('Partner');
        c4.textContent = r.partner;

        const c5 = cell('Status');
        const badge = document.createElement('span');
        badge.className = `badge badge--${r.status}`;
        badge.textContent = STATUS_LABEL[r.status];
        c5.appendChild(badge);

        tr.append(c1, c2, c3, c4, c5);
        body.appendChild(tr);
      });

      Object.keys(counts).forEach((k) => {
        const el = $(`[data-metric="${k}"]`);
        if (el) el.textContent = counts[k];
      });

      const next = $('[data-next-session]');
      next.textContent = CONFIG.nextSessionDate && daysUntil(CONFIG.nextSessionDate) >= 0
        ? `Next cohort session: ${formatDate(CONFIG.nextSessionDate)}`
        : '';

      const minutes = $('[data-minutes-link]');
      if (CONFIG.minutesPdfUrl) {
        minutes.href = CONFIG.minutesPdfUrl;
        minutes.target = '_blank';
        minutes.rel = 'noopener noreferrer';
        minutes.textContent = 'Download Monthly Minutes PDF';
      } else {
        minutes.href = `mailto:${CONFIG.contactEmail}?subject=${encodeURIComponent('The Round: monthly minutes')}`;
        minutes.removeAttribute('target');
        minutes.textContent = 'Request Monthly Minutes';
      }
    };

    /* --- views --- */
    const showAuth = () => {
      dashView.hidden = true;
      authView.hidden = false;
      dialog.classList.remove('is-dashboard');
      dialog.setAttribute('aria-labelledby', 'portal-modal-title');
      loginError.textContent = '';
      requestAnimationFrame(() => passInput.focus());
    };

    const showDashboard = () => {
      renderLedger();
      authView.hidden = true;
      dashView.hidden = false;
      dialog.classList.add('is-dashboard');
      dialog.setAttribute('aria-labelledby', 'portal-dash-title');
      requestAnimationFrame(() => $('#portal-dash-title').focus());
    };

    /* --- modal --- */
    const focusables = () => $$(FOCUSABLE, dialog).filter((el) => el.offsetParent !== null);

    const onKeydown = (e) => {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    const open = (trigger) => {
      Nav.close();
      returnFocus = trigger || document.activeElement;
      overlay.hidden = false;
      document.body.classList.add('is-locked');
      document.addEventListener('keydown', onKeydown);
      if (isAuthed()) showDashboard(); else showAuth();
    };

    const close = () => {
      overlay.hidden = true;
      document.body.classList.remove('is-locked');
      document.removeEventListener('keydown', onKeydown);
      loginForm.reset();
      if (returnFocus && document.contains(returnFocus) && returnFocus.offsetParent !== null) returnFocus.focus();
      returnFocus = null;
      if (location.hash === '#portal' && history.replaceState) history.replaceState(null, '', location.pathname);
    };

    const shake = () => {
      if (reducedMotion()) return;
      dialog.classList.remove('is-shaking');
      void dialog.offsetWidth;
      dialog.classList.add('is-shaking');
    };

    const onLogin = async (e) => {
      e.preventDefault();
      loginError.textContent = '';

      if (Date.now() < lockedUntil) {
        loginError.textContent = `Too many attempts. Try again in ${Math.ceil((lockedUntil - Date.now()) / 1000)} seconds.`;
        return;
      }
      const value = passInput.value;
      if (!value) { loginError.textContent = 'Please enter the cohort passcode.'; shake(); passInput.focus(); return; }

      const btn = $('button[type="submit"]', loginForm);
      btn.disabled = true;
      btn.textContent = 'Verifying…';
      try {
        const hash = await sha256(value);
        if (hash !== CONFIG.passcodeHash) {
          attempts += 1;
          if (attempts >= CONFIG.maxAttempts) {
            attempts = 0;
            lockedUntil = Date.now() + CONFIG.lockoutMs;
            loginError.textContent = 'Too many attempts. Access is paused for 30 seconds.';
          } else {
            loginError.textContent = 'Invalid passcode. Please contact your facilitator.';
          }
          passInput.value = '';
          passInput.focus();
          shake();
          return;
        }
        attempts = 0;
        session.set({ exp: Date.now() + CONFIG.sessionTtlMs });
        loginForm.reset();
        showDashboard();
      } catch (err) {
        loginError.textContent = err.message === 'insecure-context'
          ? 'Secure sign-in needs an HTTPS connection.'
          : 'Something went wrong. Please try again.';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Enter Dashboard';
      }
    };

    const logout = () => {
      session.clear();
      close();
      Toast.show('You have been signed out of the Member Portal.');
    };

    const init = () => {
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-open-portal]');
        if (trigger) { e.preventDefault(); open(trigger); return; }
        if (e.target.closest('[data-logout]')) { e.preventDefault(); logout(); return; }
        if (e.target.closest('[data-portal-close]')) { e.preventDefault(); close(); }
      });
      overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
      loginForm.addEventListener('submit', onLogin);

      const passToggle = $('[data-pass-toggle]');
      passToggle.addEventListener('click', () => {
        const show = passInput.type === 'password';
        passInput.type = show ? 'text' : 'password';
        passToggle.textContent = show ? 'Hide' : 'Show';
        passToggle.setAttribute('aria-pressed', String(show));
      });

      ['click', 'keydown'].forEach((evt) => document.addEventListener(evt, () => { if (!overlay.hidden) refresh(); }, { passive: true }));

      if (location.hash === '#portal') open();
    };

    return { init };
  })();

  /* ------------------------------------------------------------------------
     7. SCROLL REVEAL
     Adds .is-visible to .reveal-on-scroll and .reveal-stagger elements as
     they enter the viewport. Staggered groups get .is-settled once their
     entrance has finished, so later hover transitions run without delay.
     ------------------------------------------------------------------------ */

  const Reveal = (() => {
    const SETTLE_MS = 360 + 650 + 50; // last stagger delay + duration + margin

    const show = (el) => {
      el.classList.add('is-visible');
      if (el.classList.contains('reveal-stagger')) {
        setTimeout(() => el.classList.add('is-settled'), SETTLE_MS);
      }
    };

    const init = () => {
      const items = $$('.reveal-on-scroll, .reveal-stagger');
      if (!items.length) return;
      if (reducedMotion() || !('IntersectionObserver' in window)) {
        items.forEach((el) => { el.classList.add('is-visible', 'is-settled'); });
        return;
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          show(entry.target);
          io.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      items.forEach((el) => io.observe(el));
    };

    return { init };
  })();

  /* ------------------------------------------------------------------------
     INIT
     ------------------------------------------------------------------------ */

  const init = () => {
    $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
    initLogoFallback();
    Reveal.init();
    Nav.init();
    ApplyForm.init();
    Portal.init();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
