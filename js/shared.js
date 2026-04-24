// ============================================
// MCTools — Shared Utilities
// ============================================

(function () {
  'use strict';

  // Mobile nav
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });

    // Dropdown toggles on mobile
    navMenu.querySelectorAll('.dropdown-toggle').forEach((toggle) => {
      toggle.addEventListener('click', (e) => {
        if (window.innerWidth <= 900) {
          e.preventDefault();
          toggle.parentElement.classList.toggle('open');
        }
      });
    });
  }

  // Active nav link based on path
  const path = window.location.pathname;
  document.querySelectorAll('.nav-menu a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    if (href === path || (href !== '/' && path.startsWith(href))) {
      a.classList.add('active');
    }
  });

  // Copy to clipboard
  window.copyText = async function (text) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
  };

  // Debounce / throttle
  window.debounce = function (fn, ms = 300) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  window.throttle = function (fn, ms = 300) {
    let last = 0;
    return (...args) => {
      const now = Date.now();
      if (now - last >= ms) {
        last = now;
        fn.apply(this, args);
      }
    };
  };

  // File drop helper
  window.setupDropZone = function (zone, onFiles) {
    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });
    zone.addEventListener('dragleave', () => {
      zone.classList.remove('dragover');
    });
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length) {
        onFiles(Array.from(e.dataTransfer.files));
      }
    });
    const input = zone.querySelector('input[type="file"]');
    if (input) {
      zone.addEventListener('click', () => input.click());
      input.addEventListener('change', () => {
        if (input.files && input.files.length) {
          onFiles(Array.from(input.files));
        }
      });
    }
  };
})();
