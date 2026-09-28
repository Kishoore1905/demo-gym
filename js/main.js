/* IronPulse Fitness – progressive enhancement. The page stays usable without JS. */
(function () {
  'use strict';

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('primary-nav');

  function setNav(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', function () {
    setNav(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Close after choosing a link, on Escape, or when resizing up to desktop
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setNav(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setNav(false);
      toggle.focus();
    }
  });
  window.matchMedia('(min-width: 900px)').addEventListener('change', function (mq) {
    if (mq.matches) setNav(false);
  });

  /* ---------- Schedule tabs (WAI-ARIA tabs pattern) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));

  function selectTab(tab, moveFocus) {
    tabs.forEach(function (t) {
      var selected = t === tab;
      t.setAttribute('aria-selected', String(selected));
      t.tabIndex = selected ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
    });
    if (moveFocus) tab.focus();
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { selectTab(tab, true); });
    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (next) {
        e.preventDefault();
        selectTab(next, true);
      }
    });
  });

  // Open today's schedule by default (Sunday falls back to Monday)
  var today = new Date().getDay(); // 0 = Sun
  if (today >= 1 && today <= 6 && tabs[today - 1]) {
    selectTab(tabs[today - 1], false);
  }

  /* ---------- Pricing buttons pre-select the plan in the form ---------- */
  var planSelect = document.getElementById('plan');
  document.querySelectorAll('[data-plan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      planSelect.value = btn.getAttribute('data-plan');
    });
  });

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById('trial-form');
  var status = document.getElementById('form-status');

  var messages = {
    name: 'Please enter your name.',
    phone: 'Please enter a valid phone number (8–15 digits).',
    email: 'Please enter a valid email address.'
  };

  function validateField(input) {
    var errorEl = document.getElementById(input.id + '-error');
    var valid = input.checkValidity();
    input.setAttribute('aria-invalid', String(!valid));
    if (errorEl) errorEl.textContent = valid ? '' : messages[input.name];
    return valid;
  }

  ['name', 'phone', 'email'].forEach(function (id) {
    var input = document.getElementById(id);
    input.addEventListener('blur', function () {
      if (input.value) validateField(input);
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';

    var fields = ['name', 'phone', 'email'].map(function (id) {
      return document.getElementById(id);
    });
    var firstInvalid = null;
    fields.forEach(function (f) {
      if (!validateField(f) && !firstInvalid) firstInvalid = f;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      status.classList.add('is-error');
      status.textContent = 'Please fix the highlighted fields.';
      return;
    }

    // TODO: connect to a real backend (e.g. Formspree, Netlify Forms or the client's CRM).
    // Example: fetch('https://formspree.io/f/XXXX', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    status.classList.add('is-success');
    status.textContent = 'Thanks, ' + form.name.value.trim().split(' ')[0] +
      '! We’ll call you within one working day to book your free trial.';
    form.reset();
    fields.forEach(function (f) { f.removeAttribute('aria-invalid'); });
  });

  /* ---------- Footer year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();
