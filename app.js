/* ==========================================================================
   The Round by Kuma Partners: app.js
   Vanilla ES6, zero dependencies.

   Modules:
   1. Config
   2. Utilities (storage, dates, DOM, toast)
   3. Header, mobile drawer, smooth scrolling, scroll-spy
   4. Accessible tabs
   5. Modals (focus trap, Esc, restore focus)
   6. Forms: validation + Netlify AJAX submission
   7. Member Portal: authentication and session
   8. Accountability tracker
   9. Deliverables repository
   10. Init

   SECURITY NOTE
   The Member Portal gate runs in the browser. It keeps casual visitors out
   and never stores a plaintext passcode (only SHA-256 hashes), but anyone
   who reads this file can see the gated markup and the seed data. Do not
   place confidential client data in this repository. For real protection,
   enable Netlify site password protection or Netlify Identity on the
   subdomain and keep this gate as the in-page experience.
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     1. CONFIG
     ------------------------------------------------------------------------ */

  const CONFIG = {
    /* SHA-256 hex of "MEMBER-ID:passcode" (Member ID is upper-cased before hashing).
       Generate a new entry in any browser console:
         crypto.subtle.digest('SHA-256', new TextEncoder().encode('ROUND-07:your-passcode'))
           .then(b => console.log([...new Uint8Array(b)].map(x => x.toString(16).padStart(2,'0')).join('')))
       Demo credential below: Member ID "ROUND-DEMO", passcode "change-me-2026". Replace before launch. */
    memberHashes: [
      '0cbbe9f831935ffd1bc694f697f380e18feecf6fbc9124ca7f81e5315ec796f5'
    ],
    sessionKey: 'kuma.round.session',
    sessionTtlMs: 4 * 60 * 60 * 1000,        // 4 hours of inactivity
    trackerKey: 'kuma.round.tracker.v1',
    maxLoginAttempts: 5,
    lockoutMs: 30 * 1000,
    approachingDays: 14,
    /* Next cohort session shown in the portal header (YYYY-MM-DD). Leave empty to hide the date. */
    nextSessionDate: '2026-10-14',
    contactEmail: 'contact@kuma.partners',
    personalEmailDomains: [
      'gmail.com', 'googlemail.com', 'yahoo.com', 'yahoo.es', 'yahoo.fr', 'yahoo.de', 'hotmail.com',
      'hotmail.es', 'hotmail.fr', 'outlook.com', 'outlook.es', 'live.com', 'msn.com', 'icloud.com',
      'me.com', 'mac.com', 'aol.com', 'gmx.de', 'gmx.net', 'gmx.com', 'web.de', 'proton.me',
      'protonmail.com', 'yandex.com', 'mail.com', 'orange.fr', 'free.fr', 'laposte.net', 't-online.de'
    ]
  };

  /* Repository items. Set href to a secure document link (for example a
     restricted Google Drive or Notion page). Items without an href render as
     an access request to the facilitator. */
  const DELIVERABLES = [
    { type: 'Minutes', title: 'Monthly Session Minutes', description: 'Anonymised minutes and the commitments logged at each Executive Peer Board.', meta: 'After each board', href: '' },
    { type: 'Archive', title: 'The Hard Call Archive', description: 'Executed decisions, trade-offs and aftermath metrics from across the cohort.', meta: 'Searchable by theme', href: '' },
    { type: 'Template', title: 'Dilemma Brief', description: 'One-page pre-read: baseline facts, Option A versus Option B, and the 90-day cost of inaction.', meta: 'Complete 48 hours before', href: '' },
    { type: 'Template', title: 'Hard Call Card', description: 'The prescription formula for board members: decide [X], execute by [Y], accept [Z].', meta: 'One per member', href: '' },
    { type: 'Retreats', title: 'Immersion & Offsite Pack', description: 'Logistics, pre-work and the reflection framework for the 24-hour immersion and annual offsite.', meta: 'Shared before each retreat', href: '' },
    { type: 'Compact', title: 'The Round Compact', description: 'NDA, Chatham House terms, competitor veto and attendance commitments.', meta: 'Signed at onboarding', href: '' }
  ];

  /* Seed commitments, anonymised by role. Deadlines are relative to today so
     the demo always shows a realistic mix of statuses. */
  const SEED_COMMITMENTS = [
    { protagonist: 'Founder & CEO', context: 'B2B SaaS · 140 people', decision: 'Split the commercial team into new-logo and expansion units with separate quotas.', consequence: 'Lose two senior AEs who prefer the hybrid role.', deadlineOffset: 9, sessionOffset: -12, partner: 'COO, Logistics', completed: false },
    { protagonist: 'CEO', context: 'Industrial manufacturing · 1,200 people', decision: 'Replace the Iberia country manager and run the search externally.', consequence: 'Six months of slower growth in Portugal.', deadlineOffset: 34, sessionOffset: -12, partner: 'Founder, HealthTech', completed: false },
    { protagonist: 'Co-founder & CTO', context: 'Climate tech · 85 people', decision: 'Freeze the second product line and move its engineers to the core platform.', consequence: 'Delay the pilot promised to one strategic customer.', deadlineOffset: 3, sessionOffset: -40, partner: 'CEO, Fintech', completed: false },
    { protagonist: 'Managing Director', context: 'Professional services · 60 people', decision: 'Exit the two lowest-margin retainer clients before year end.', consequence: 'Revenue dip of roughly 12% for two quarters.', deadlineOffset: -6, sessionOffset: -40, partner: 'CEO, Industrial', completed: true },
    { protagonist: 'Founder & CEO', context: 'Consumer marketplace · 30 people', decision: 'Accept the bridge round from existing investors instead of a new lead.', consequence: 'Heavier dilution and a harder Series A narrative.', deadlineOffset: 21, sessionOffset: -12, partner: 'CFO, B2B SaaS', completed: false },
    { protagonist: 'COO', context: 'Logistics · 450 people', decision: 'Consolidate three regional warehouses into one hub near Zaragoza.', consequence: 'Voluntary attrition among site leads.', deadlineOffset: -20, sessionOffset: -70, partner: 'Managing Director, Services', completed: true }
  ];

  /* ------------------------------------------------------------------------
     2. UTILITIES
     ------------------------------------------------------------------------ */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /** Storage wrapper: never throws (private mode, blocked site data, previews). */
  const store = (type) => ({
    get(key, fallback = null) {
      try {
        const raw = window[type].getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) { return fallback; }
    },
    set(key, value) {
      try { window[type].setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
    },
    remove(key) {
      try { window[type].removeItem(key); } catch (e) { /* ignore */ }
    }
  });
  const session = store('sessionStorage');
  const local = store('localStorage');

  const pad = (n) => String(n).padStart(2, '0');
  const toISODate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseISODate = (s) => {
    const [y, m, d] = String(s).split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  };
  const today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d; };
  const daysUntil = (iso) => Math.round((parseISODate(iso) - today()) / 86400000);
  const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatDate = (iso) => dateFmt.format(parseISODate(iso));
  const uid = () => `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;

  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Small SVG helper for icon buttons. */
  const icon = (paths) => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    paths.forEach((d) => {
      const p = document.createElementNS(ns, 'path');
      p.setAttribute('d', d);
      svg.appendChild(p);
    });
    return svg;
  };

  /* Toast with optional action (used for undo). */
  const Toast = (() => {
    const el = $('[data-toast]');
    let timer = null;
    const hide = () => { if (el) { el.hidden = true; el.textContent = ''; } };
    const show = (message, action) => {
      if (!el) return;
      clearTimeout(timer);
      el.textContent = message;
      if (action) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'toast-action';
        btn.textContent = action.label;
        btn.style.cssText = 'margin-left:14px;background:none;border:none;color:#9CC0C6;font-weight:700;cursor:pointer;padding:0;font-family:inherit;font-size:inherit;';
        btn.addEventListener('click', () => { action.onClick(); hide(); });
        el.appendChild(btn);
      }
      el.hidden = false;
      timer = setTimeout(hide, action ? 6000 : 3500);
    };
    return { show, hide };
  })();

  /* ------------------------------------------------------------------------
     3. HEADER, DRAWER, SMOOTH SCROLL, SCROLL-SPY
     ------------------------------------------------------------------------ */

  const Nav = (() => {
    const header = $('[data-site-header]');
    const drawer = $('[data-nav-drawer]');
    const toggle = $('[data-nav-toggle]');
    const scrim = $('[data-nav-scrim]');
    const mqMobile = window.matchMedia('(max-width: 960px)');

    const isOpen = () => drawer && drawer.classList.contains('is-open');

    const setOpen = (open) => {
      if (!drawer || !toggle) return;
      drawer.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
      $('.icon-menu', toggle).hidden = open;
      $('.icon-close', toggle).hidden = !open;
      if (scrim) scrim.hidden = !open;
      document.body.classList.toggle('is-locked', open);
      if (open) {
        const first = $('a, button', drawer);
        if (first) first.focus();
      }
    };

    const close = () => { if (isOpen()) setOpen(false); };

    const onScroll = () => {
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
    };

    const scrollToTarget = (hash) => {
      const target = hash && hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
      if (!target) return false;
      const headerH = header ? header.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH - 8;
      window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      if (history.replaceState) history.replaceState(null, '', hash);
      // Move focus for keyboard and screen reader users without jumping the page.
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      return true;
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
          const link = map.get(entry.target);
          if (!link) return;
          if (entry.isIntersecting) {
            links.forEach((l) => { l.classList.remove('is-current'); l.removeAttribute('aria-current'); });
            link.classList.add('is-current');
            link.setAttribute('aria-current', 'true');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      map.forEach((_, sec) => io.observe(sec));
    };

    const init = () => {
      if (toggle) toggle.addEventListener('click', () => setOpen(!isOpen()));
      if (scrim) scrim.addEventListener('click', close);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
      });
      mqMobile.addEventListener ? mqMobile.addEventListener('change', (e) => { if (!e.matches) close(); })
        : mqMobile.addListener((e) => { if (!e.matches) close(); });

      document.addEventListener('click', (e) => {
        const link = e.target.closest('a[data-scroll]');
        if (!link) return;
        const hash = link.getAttribute('href');
        if (!hash || !hash.startsWith('#')) return;
        e.preventDefault();
        close();
        // If the portal is showing, return to the public layer first (session is kept).
        if (Portal.isShowing()) Portal.showPublic();
        requestAnimationFrame(() => scrollToTarget(hash));
      });

      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
      initScrollSpy();
    };

    return { init, close, scrollToTarget };
  })();

  /* ------------------------------------------------------------------------
     4. ACCESSIBLE TABS (WAI-ARIA tabs pattern, automatic activation)
     ------------------------------------------------------------------------ */

  const Tabs = (() => {
    const activate = (tabs, tab, focus = true) => {
      tabs.forEach((t) => {
        const selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !selected;
      });
      if (focus) tab.focus();
    };

    const init = () => {
      $$('[data-tabs]').forEach((root) => {
        const tabs = $$('[role="tab"]', root);
        tabs.forEach((tab, i) => {
          tab.addEventListener('click', () => activate(tabs, tab, false));
          tab.addEventListener('keydown', (e) => {
            let next = null;
            if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
            else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
            else if (e.key === 'Home') next = tabs[0];
            else if (e.key === 'End') next = tabs[tabs.length - 1];
            if (next) { e.preventDefault(); activate(tabs, next); }
          });
        });
      });
    };

    return { init };
  })();

  /* ------------------------------------------------------------------------
     5. MODALS
     ------------------------------------------------------------------------ */

  const Modal = (() => {
    let active = null;
    let returnFocus = null;
    const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const focusables = (root) => $$(FOCUSABLE, root).filter((el) => el.offsetParent !== null && !el.closest('.visually-hidden'));

    const onKeydown = (e) => {
      if (!active) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const items = focusables(active);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    const open = (name, opts = {}) => {
      const overlay = $(`[data-modal="${name}"]`);
      if (!overlay) return;
      if (active) close({ restore: false });
      Nav.close();
      returnFocus = opts.returnFocus || document.activeElement;
      active = overlay;
      overlay.hidden = false;
      document.body.classList.add('is-locked');
      document.addEventListener('keydown', onKeydown);
      const target = opts.focus ? $(opts.focus, overlay) : focusables(overlay).find((el) => !el.matches('[data-modal-close]'));
      requestAnimationFrame(() => { if (target) target.focus(); });
    };

    const close = ({ restore = true } = {}) => {
      if (!active) return;
      active.hidden = true;
      active = null;
      document.body.classList.remove('is-locked');
      document.removeEventListener('keydown', onKeydown);
      if (restore && returnFocus && document.contains(returnFocus) && returnFocus.offsetParent !== null) {
        returnFocus.focus();
      }
      returnFocus = null;
    };

    const init = () => {
      $$('[data-modal]').forEach((overlay) => {
        overlay.addEventListener('mousedown', (e) => { if (e.target === overlay) close(); });
        $$('[data-modal-close]', overlay).forEach((btn) => btn.addEventListener('click', () => close()));
      });
    };

    return { init, open, close };
  })();

  /* ------------------------------------------------------------------------
     6. FORMS: VALIDATION + NETLIFY AJAX
     ------------------------------------------------------------------------ */

  const Forms = (() => {
    const encode = (form) => new URLSearchParams(new FormData(form)).toString();

    /** POST to Netlify Forms. Resolves on 2xx, rejects otherwise. */
    const submitToNetlify = (form) => fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(form)
    }).then((res) => {
      if (!res.ok) throw new Error(`Form submission failed (${res.status})`);
      return res;
    });

    const setError = (field, message) => {
      const wrap = field.closest('.field');
      const err = document.getElementById(`${field.id}-error`);
      if (wrap) wrap.classList.toggle('is-invalid', Boolean(message));
      if (err) err.textContent = message || '';
      if (message) {
        field.setAttribute('aria-invalid', 'true');
        if (err) {
          const described = (field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
          if (!described.includes(err.id)) described.push(err.id);
          field.setAttribute('aria-describedby', described.join(' '));
        }
      } else {
        field.removeAttribute('aria-invalid');
      }
    };

    const isPersonalEmail = (value) => {
      const domain = String(value).split('@')[1];
      return domain ? CONFIG.personalEmailDomains.includes(domain.trim().toLowerCase()) : false;
    };

    const validateField = (field) => {
      const value = field.type === 'checkbox' ? field.checked : field.value.trim();
      let message = '';
      if (field.required && !value) {
        message = field.type === 'checkbox' ? 'Please confirm to continue.' : 'This field is required.';
      } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        message = 'Please enter a valid email address.';
      } else if (field.hasAttribute('data-work-email') && value && isPersonalEmail(value)) {
        message = 'Please use your corporate work email, not a personal inbox.';
      } else if (field.dataset.minlength && value && value.length < Number(field.dataset.minlength)) {
        message = 'A little more detail helps us prepare. Aim for two or three sentences.';
      }
      setError(field, message);
      return !message;
    };

    const validateForm = (form, extra) => {
      const fields = $$('input[required], select[required], textarea[required], input[data-work-email]', form);
      let firstInvalid = null;
      fields.forEach((f) => { if (!validateField(f) && !firstInvalid) firstInvalid = f; });
      if (extra) {
        const extraInvalid = extra();
        if (extraInvalid && !firstInvalid) firstInvalid = extraInvalid;
      }
      if (firstInvalid) firstInvalid.focus();
      return !firstInvalid;
    };

    const liveValidate = (form) => {
      $$('input, select, textarea', form).forEach((f) => {
        if (f.type === 'hidden' || f.name === 'bot-field') return;
        f.addEventListener('blur', () => { if (f.value || f.getAttribute('aria-invalid')) validateField(f); });
        f.addEventListener('input', () => { if (f.getAttribute('aria-invalid')) validateField(f); });
        f.addEventListener('change', () => { if (f.getAttribute('aria-invalid')) validateField(f); });
      });
    };

    const setBusy = (form, busy, label) => {
      const btn = $('button[type="submit"]', form);
      if (!btn) return;
      btn.disabled = busy;
      btn.setAttribute('aria-busy', String(busy));
      btn.textContent = busy ? (label || 'Sending…') : btn.getAttribute('data-submit-label');
    };

    const setStatus = (form, message, isError) => {
      const el = $('[data-form-status]', form);
      if (!el) return;
      el.textContent = message || '';
      el.classList.toggle('is-error', Boolean(isError));
    };

    /* Guest seat application */
    const initApply = () => {
      const form = $('[data-ajax-form="apply"]');
      if (!form) return;
      const success = $('[data-form-success="apply"]');
      const textarea = $('textarea[maxlength]', form);
      const counter = $('[data-char-count]', form);

      if (textarea && counter) {
        const max = Number(textarea.getAttribute('maxlength')) || 1200;
        const update = () => { counter.textContent = `${textarea.value.length} / ${max}`; };
        textarea.addEventListener('input', update);
        update();
      }

      liveValidate(form);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        setStatus(form, '');
        if (!validateForm(form)) {
          setStatus(form, 'Please review the highlighted fields.', true);
          return;
        }
        setBusy(form, true, 'Submitting…');
        submitToNetlify(form)
          .then(() => {
            form.hidden = true;
            if (success) { success.hidden = false; success.focus(); }
            form.reset();
          })
          .catch(() => {
            setStatus(form, `We could not submit your application just now. Please try again or write to ${CONFIG.contactEmail}.`, true);
          })
          .finally(() => setBusy(form, false));
      });
    };

    return { initApply, validateForm, validateField, liveValidate, setBusy, setStatus, submitToNetlify, setError };
  })();

  /* ------------------------------------------------------------------------
     7. MEMBER PORTAL: AUTH + SESSION
     ------------------------------------------------------------------------ */

  const Portal = (() => {
    const publicView = $('[data-public-view]');
    const portalView = $('[data-portal-view]');
    const loginForm = $('[data-login-form]');
    const loginError = $('[data-login-error]');
    let attempts = 0;
    let lockedUntil = 0;
    let idleTimer = null;

    const sha256Hex = async (text) => {
      if (!(window.crypto && window.crypto.subtle)) {
        throw new Error('insecure-context');
      }
      const buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    };

    /* Constant-time comparison to avoid trivially leaking match length. */
    const safeEqual = (a, b) => {
      if (a.length !== b.length) return false;
      let diff = 0;
      for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
      return diff === 0;
    };

    const getSession = () => {
      const s = session.get(CONFIG.sessionKey);
      if (!s || !s.id || !s.exp) return null;
      if (Date.now() > s.exp) { session.remove(CONFIG.sessionKey); return null; }
      return s;
    };

    const touchSession = () => {
      const s = getSession();
      if (!s) return;
      s.exp = Date.now() + CONFIG.sessionTtlMs;
      session.set(CONFIG.sessionKey, s);
    };

    const isAuthenticated = () => Boolean(getSession());
    const isShowing = () => portalView && !portalView.hidden;

    const setHeaderMode = (portal) => {
      document.body.classList.toggle('is-portal', portal);
      $$('[data-portal-only]').forEach((el) => { el.hidden = !portal; });
      $$('.nav-cta [data-open-portal]').forEach((el) => { el.hidden = portal; });
    };

    const showPortal = () => {
      const s = getSession();
      if (!s) return;
      $$('[data-member-id]').forEach((el) => { el.textContent = s.id; });
      $$('[data-logged-by]').forEach((el) => { el.value = s.id; });
      $$('[data-next-session]').forEach((el) => {
        el.textContent = CONFIG.nextSessionDate && daysUntil(CONFIG.nextSessionDate) >= 0
          ? `Next cohort session: ${formatDate(CONFIG.nextSessionDate)}`
          : 'Next cohort session to be confirmed';
      });
      if (publicView) publicView.hidden = true;
      if (portalView) portalView.hidden = false;
      setHeaderMode(true);
      Tracker.render();
      window.scrollTo({ top: 0, behavior: 'auto' });
      const title = $('#portal-title');
      if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); }
      document.title = 'Member Portal | The Round by Kuma Partners';
      startIdleWatch();
    };

    const showPublic = () => {
      if (portalView) portalView.hidden = true;
      if (publicView) publicView.hidden = false;
      setHeaderMode(false);
      document.title = 'The Round | Executive Peer Operating System by Kuma Partners';
    };

    const logout = (reason) => {
      session.remove(CONFIG.sessionKey);
      clearTimeout(idleTimer);
      Modal.close({ restore: false });
      showPublic();
      window.scrollTo({ top: 0, behavior: 'auto' });
      Toast.show(reason === 'expired' ? 'Your session expired. Please sign in again.' : 'You have been signed out of the Member Portal.');
      const trigger = $('.nav-cta [data-open-portal]');
      if (trigger && trigger.offsetParent !== null) trigger.focus();
    };

    const startIdleWatch = () => {
      clearTimeout(idleTimer);
      const check = () => {
        if (!getSession()) { if (isShowing()) logout('expired'); return; }
        idleTimer = setTimeout(check, 60 * 1000);
      };
      idleTimer = setTimeout(check, 60 * 1000);
    };

    const shake = () => {
      const dialog = loginForm && loginForm.closest('.modal');
      if (!dialog || prefersReducedMotion()) return;
      dialog.classList.remove('is-shaking');
      void dialog.offsetWidth;
      dialog.classList.add('is-shaking');
    };

    const onLogin = async (e) => {
      e.preventDefault();
      const idField = $('#login-id', loginForm);
      const passField = $('#login-pass', loginForm);
      const id = idField.value.trim().toUpperCase();
      const pass = passField.value;
      loginError.textContent = '';

      if (Date.now() < lockedUntil) {
        const secs = Math.ceil((lockedUntil - Date.now()) / 1000);
        loginError.textContent = `Too many attempts. Try again in ${secs} seconds.`;
        return;
      }
      if (!id || !pass) {
        loginError.textContent = 'Enter both your Member ID and passcode.';
        (id ? passField : idField).focus();
        shake();
        return;
      }

      const btn = $('button[type="submit"]', loginForm);
      btn.disabled = true;
      btn.textContent = 'Verifying…';

      try {
        const hash = await sha256Hex(`${id}:${pass}`);
        const ok = CONFIG.memberHashes.some((h) => safeEqual(h, hash));
        if (!ok) {
          attempts += 1;
          if (attempts >= CONFIG.maxLoginAttempts) {
            lockedUntil = Date.now() + CONFIG.lockoutMs;
            attempts = 0;
            loginError.textContent = 'Too many attempts. Access paused for 30 seconds.';
          } else {
            loginError.textContent = 'Those credentials do not match our member list.';
          }
          passField.value = '';
          passField.focus();
          shake();
          return;
        }
        attempts = 0;
        session.set(CONFIG.sessionKey, { id, exp: Date.now() + CONFIG.sessionTtlMs });
        loginForm.reset();
        Modal.close({ restore: false });
        showPortal();
        Toast.show(`Welcome back, ${id}.`);
      } catch (err) {
        loginError.textContent = err.message === 'insecure-context'
          ? 'Secure sign-in needs an HTTPS connection. Please open the site via https://.'
          : 'Something went wrong while verifying. Please try again.';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Enter Portal';
      }
    };

    const init = () => {
      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-open-portal]');
        if (trigger) {
          e.preventDefault();
          Nav.close();
          if (isAuthenticated()) showPortal();
          else Modal.open('portal', { returnFocus: trigger, focus: '#login-id' });
          return;
        }
        if (e.target.closest('[data-logout]')) { e.preventDefault(); logout(); }
      });

      if (loginForm) loginForm.addEventListener('submit', onLogin);

      const passToggle = $('[data-pass-toggle]');
      if (passToggle) {
        passToggle.addEventListener('click', () => {
          const input = $('#login-pass');
          const show = input.type === 'password';
          input.type = show ? 'text' : 'password';
          passToggle.textContent = show ? 'Hide' : 'Show';
          passToggle.setAttribute('aria-pressed', String(show));
        });
      }

      ['click', 'keydown'].forEach((evt) => document.addEventListener(evt, () => { if (isShowing()) touchSession(); }, { passive: true }));

      // Restore an existing session in this tab, or honour a #portal deep link.
      if (isAuthenticated()) {
        showPortal();
      } else {
        setHeaderMode(false);
        if (location.hash === '#portal') Modal.open('portal', { focus: '#login-id' });
      }
    };

    return { init, isShowing, showPublic, getSession };
  })();

  /* ------------------------------------------------------------------------
     8. ACCOUNTABILITY TRACKER
     ------------------------------------------------------------------------ */

  const Tracker = (() => {
    const tbody = $('[data-tracker-body]');
    const empty = $('[data-tracker-empty]');
    const search = $('[data-tracker-search]');
    const commitForm = $('[data-commit-form]');

    const state = {
      items: [],
      filter: 'all',
      query: '',
      sortKey: 'deadline',
      sortDir: 'asc'
    };

    const STATUS_ORDER = { approaching: 0, active: 1, completed: 2 };
    const STATUS_LABEL = { active: 'Active', approaching: 'Approaching', completed: 'Completed' };

    const statusOf = (item) => {
      if (item.completed) return 'completed';
      return daysUntil(item.deadline) <= CONFIG.approachingDays ? 'approaching' : 'active';
    };

    const seed = () => SEED_COMMITMENTS.map((s) => ({
      id: uid(),
      protagonist: s.protagonist,
      context: s.context,
      decision: s.decision,
      consequence: s.consequence,
      deadline: toISODate(addDays(today(), s.deadlineOffset)),
      sessionDate: toISODate(addDays(today(), s.sessionOffset)),
      partner: s.partner,
      completed: s.completed,
      source: 'seed'
    }));

    const load = () => {
      const saved = local.get(CONFIG.trackerKey);
      state.items = Array.isArray(saved) && saved.length ? saved : seed();
    };
    const save = () => local.set(CONFIG.trackerKey, state.items);

    const filtered = () => {
      const q = state.query.toLowerCase();
      return state.items
        .filter((it) => state.filter === 'all' || statusOf(it) === state.filter)
        .filter((it) => !q || [it.protagonist, it.context, it.decision, it.partner, it.consequence]
          .filter(Boolean).some((v) => v.toLowerCase().includes(q)))
        .sort((a, b) => {
          let cmp = 0;
          if (state.sortKey === 'deadline') cmp = a.deadline.localeCompare(b.deadline);
          else if (state.sortKey === 'status') cmp = STATUS_ORDER[statusOf(a)] - STATUS_ORDER[statusOf(b)] || a.deadline.localeCompare(b.deadline);
          else cmp = String(a[state.sortKey] || '').localeCompare(String(b[state.sortKey] || ''), 'en', { sensitivity: 'base' });
          return state.sortDir === 'asc' ? cmp : -cmp;
        });
    };

    const td = (label, className) => {
      const cell = document.createElement('td');
      cell.setAttribute('data-label', label);
      if (className) cell.className = className;
      return cell;
    };

    const buildRow = (item, highlight) => {
      const status = statusOf(item);
      const tr = document.createElement('tr');
      tr.dataset.id = item.id;
      if (status === 'completed') tr.classList.add('row-completed');
      if (highlight) tr.classList.add('is-new');

      const c1 = td('Protagonist', 'cell-protagonist');
      c1.textContent = item.protagonist;
      if (item.context) {
        const sub = document.createElement('span');
        sub.className = 'cell-sub';
        sub.textContent = item.context;
        c1.appendChild(sub);
      }

      const c2 = td('Decision [X]', 'cell-decision');
      const decisionText = document.createElement('span');
      decisionText.textContent = item.decision;
      c2.appendChild(decisionText);
      if (item.consequence) {
        const cons = document.createElement('span');
        cons.className = 'cell-consequence';
        cons.textContent = `Accepts: ${item.consequence}`;
        c2.appendChild(cons);
      }

      const c3 = td('Deadline [Y]', 'cell-deadline');
      const time = document.createElement('time');
      time.dateTime = item.deadline;
      time.textContent = formatDate(item.deadline);
      c3.appendChild(time);
      const days = daysUntil(item.deadline);
      const daysEl = document.createElement('span');
      daysEl.className = 'cell-days';
      if (status === 'completed') daysEl.textContent = 'Closed';
      else if (days < 0) { daysEl.textContent = `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`; daysEl.classList.add('is-overdue'); }
      else if (days === 0) daysEl.textContent = 'Due today';
      else daysEl.textContent = `${days} day${days === 1 ? '' : 's'} left`;
      c3.appendChild(daysEl);

      const c4 = td('Peer partner');
      c4.textContent = item.partner;

      const c5 = td('Status');
      const badge = document.createElement('span');
      badge.className = `badge badge--${status}`;
      badge.textContent = STATUS_LABEL[status];
      c5.appendChild(badge);

      const c6 = td('Actions', 'cell-actions');
      const actions = document.createElement('div');
      actions.className = 'row-actions';

      const toggleBtn = document.createElement('button');
      toggleBtn.type = 'button';
      toggleBtn.className = 'icon-btn';
      toggleBtn.dataset.action = 'toggle';
      const toggleLabel = item.completed ? `Reopen commitment for ${item.protagonist}` : `Mark commitment for ${item.protagonist} as completed`;
      toggleBtn.setAttribute('aria-label', toggleLabel);
      toggleBtn.title = item.completed ? 'Reopen' : 'Mark completed';
      toggleBtn.appendChild(item.completed ? icon(['M3 12a9 9 0 1 0 3-6.7', 'M3 4v5h5']) : icon(['M5 12.5l4.5 4.5L19 7.5']));

      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'icon-btn icon-btn--danger';
      delBtn.dataset.action = 'delete';
      delBtn.setAttribute('aria-label', `Remove commitment for ${item.protagonist}`);
      delBtn.title = 'Remove';
      delBtn.appendChild(icon(['M4 7h16', 'M9 7V4h6v3', 'M6 7l1 13h10l1-13']));

      actions.append(toggleBtn, delBtn);
      c6.appendChild(actions);

      tr.append(c1, c2, c3, c4, c5, c6);
      return tr;
    };

    const renderMetrics = () => {
      const counts = { all: state.items.length, active: 0, approaching: 0, completed: 0 };
      state.items.forEach((it) => { counts[statusOf(it)] += 1; });
      Object.keys(counts).forEach((k) => {
        $$(`[data-count="${k}"]`).forEach((el) => { el.textContent = counts[k]; });
        $$(`[data-metric="${k}"]`).forEach((el) => { el.textContent = counts[k]; });
      });
      const open = state.items.filter((it) => !it.completed).sort((a, b) => a.deadline.localeCompare(b.deadline));
      const next = $('[data-metric="next"]');
      if (next) next.textContent = open.length ? formatDate(open[0].deadline) : 'None';
    };

    const renderSortState = () => {
      $$('.tracker-table th').forEach((th) => {
        const btn = $('.sort-btn', th);
        if (!btn) return;
        th.setAttribute('aria-sort', btn.dataset.sort === state.sortKey ? (state.sortDir === 'asc' ? 'ascending' : 'descending') : 'none');
      });
    };

    const render = (highlightId) => {
      if (!tbody) return;
      const rows = filtered();
      tbody.textContent = '';
      const frag = document.createDocumentFragment();
      rows.forEach((it) => frag.appendChild(buildRow(it, it.id === highlightId)));
      tbody.appendChild(frag);
      if (empty) empty.hidden = rows.length > 0;
      renderMetrics();
      renderSortState();
    };

    const setFilter = (filter) => {
      state.filter = filter;
      $$('[data-filter]').forEach((chip) => {
        const on = chip.dataset.filter === filter;
        chip.classList.toggle('is-active', on);
        chip.setAttribute('aria-pressed', String(on));
      });
      render();
    };

    const onRowAction = (e) => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id = btn.closest('tr').dataset.id;
      const index = state.items.findIndex((it) => it.id === id);
      if (index < 0) return;
      const item = state.items[index];

      if (btn.dataset.action === 'toggle') {
        item.completed = !item.completed;
        save();
        render();
        Toast.show(item.completed ? `Marked completed: ${item.protagonist}.` : `Reopened: ${item.protagonist}.`);
        const again = $(`tr[data-id="${id}"] [data-action="toggle"]`, tbody);
        if (again) again.focus();
      }

      if (btn.dataset.action === 'delete') {
        const [removed] = state.items.splice(index, 1);
        save();
        render();
        if (search) search.focus();
        Toast.show(`Commitment removed: ${removed.protagonist}.`, {
          label: 'Undo',
          onClick: () => {
            state.items.splice(index, 0, removed);
            save();
            render(removed.id);
          }
        });
      }
    };

    /* Commitment entry */
    const openCommitModal = (trigger) => {
      if (!Portal.getSession()) return;
      if (commitForm) {
        commitForm.reset();
        Forms.setStatus(commitForm, '');
        $$('.field', commitForm).forEach((f) => f.classList.remove('is-invalid'));
        $$('[aria-invalid]', commitForm).forEach((f) => f.removeAttribute('aria-invalid'));
        $$('.field-error', commitForm).forEach((f) => { f.textContent = ''; });
        const s = Portal.getSession();
        $$('[data-logged-by]', commitForm).forEach((el) => { el.value = s ? s.id : ''; });
        const sessionDate = $('#commit-session', commitForm);
        if (sessionDate) sessionDate.value = toISODate(today());
        const deadline = $('#commit-deadline', commitForm);
        if (deadline) deadline.min = toISODate(today());
      }
      Modal.open('commit', { returnFocus: trigger, focus: '#commit-protagonist' });
    };

    const onCommitSubmit = (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      Forms.setStatus(form, '');

      const valid = Forms.validateForm(form, () => {
        const sessionField = $('#commit-session', form);
        const deadlineField = $('#commit-deadline', form);
        if (sessionField.value && deadlineField.value && deadlineField.value < sessionField.value) {
          Forms.setError(deadlineField, 'The deadline must fall after the session date.');
          return deadlineField;
        }
        return null;
      });
      if (!valid) { Forms.setStatus(form, 'Please complete the highlighted fields.', true); return; }

      const data = new FormData(form);
      const item = {
        id: uid(),
        protagonist: String(data.get('protagonist')).trim(),
        context: `Logged ${formatDate(String(data.get('session-date')))}`,
        decision: String(data.get('decision')).trim(),
        consequence: String(data.get('consequence') || '').trim(),
        deadline: String(data.get('deadline')),
        sessionDate: String(data.get('session-date')),
        partner: String(data.get('partner')).trim(),
        completed: false,
        source: 'local'
      };

      Forms.setBusy(form, true, 'Saving…');

      // Save locally first so nothing is lost, then notify the facilitator via Netlify.
      state.items.push(item);
      save();

      Forms.submitToNetlify(form)
        .then(() => {
          Toast.show('Commitment logged and sent to the facilitator.');
        })
        .catch(() => {
          Toast.show('Commitment saved in this browser. The facilitator copy could not be sent.');
        })
        .finally(() => {
          Forms.setBusy(form, false);
          Modal.close();
          if (state.filter !== 'all' && statusOf(item) !== state.filter) setFilter('all');
          state.query = '';
          if (search) search.value = '';
          render(item.id);
        });
    };

    const init = () => {
      load();

      $$('[data-filter]').forEach((chip) => chip.addEventListener('click', () => setFilter(chip.dataset.filter)));

      if (search) {
        let t = null;
        search.addEventListener('input', () => {
          clearTimeout(t);
          t = setTimeout(() => { state.query = search.value.trim(); render(); }, 120);
        });
      }

      $$('.sort-btn').forEach((btn) => btn.addEventListener('click', () => {
        const key = btn.dataset.sort;
        if (state.sortKey === key) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        else { state.sortKey = key; state.sortDir = 'asc'; }
        render();
      }));

      if (tbody) tbody.addEventListener('click', onRowAction);

      document.addEventListener('click', (e) => {
        const trigger = e.target.closest('[data-open-commit]');
        if (trigger) { e.preventDefault(); openCommitModal(trigger); }
      });

      if (commitForm) {
        Forms.liveValidate(commitForm);
        commitForm.addEventListener('submit', onCommitSubmit);
      }
    };

    return { init, render };
  })();

  /* ------------------------------------------------------------------------
     9. DELIVERABLES REPOSITORY
     ------------------------------------------------------------------------ */

  const Repository = (() => {
    const grid = $('[data-repo-grid]');

    const card = (item) => {
      const hasLink = Boolean(item.href);
      const el = document.createElement('a');
      el.className = 'repo-card';
      if (hasLink) {
        el.href = item.href;
        el.target = '_blank';
        el.rel = 'noopener noreferrer';
      } else {
        const subject = encodeURIComponent(`The Round: access request for ${item.title}`);
        el.href = `mailto:${CONFIG.contactEmail}?subject=${subject}`;
      }

      const type = document.createElement('p');
      type.className = 'repo-type';
      type.textContent = item.type;

      const h = document.createElement('h3');
      h.textContent = item.title;

      const p = document.createElement('p');
      p.textContent = item.description;

      const meta = document.createElement('div');
      meta.className = 'repo-meta';
      const m1 = document.createElement('span');
      m1.textContent = item.meta;
      const m2 = document.createElement('span');
      m2.className = 'repo-cta';
      m2.textContent = hasLink ? 'Open →' : 'Request access →';
      meta.append(m1, m2);

      el.append(type, h, p, meta);
      el.setAttribute('aria-label', `${item.title}, ${item.type}. ${hasLink ? 'Opens in a new tab' : 'Request access by email'}`);
      return el;
    };

    const init = () => {
      if (!grid) return;
      const frag = document.createDocumentFragment();
      DELIVERABLES.forEach((d) => frag.appendChild(card(d)));
      grid.appendChild(frag);
    };

    return { init };
  })();

  /* ------------------------------------------------------------------------
     10. INIT
     ------------------------------------------------------------------------ */

  const init = () => {
    $$('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
    // Brand logo fallback: show the text lockup if the image is missing.
    $$('[data-brand-logo]').forEach((img) => {
      const fail = () => img.closest('.brand-lockup').classList.add('is-logo-missing');
      if (img.complete && img.naturalWidth === 0) fail();
      else img.addEventListener('error', fail, { once: true });
    });
    Nav.init();
    Tabs.init();
    Modal.init();
    Forms.initApply();
    Tracker.init();
    Repository.init();
    Portal.init();

    // Honour a deep link to a public section on first load.
    if (location.hash && location.hash !== '#portal' && !Portal.isShowing()) {
      setTimeout(() => Nav.scrollToTarget(location.hash), 60);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
