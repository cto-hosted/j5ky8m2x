/* ============================================
   MCTools - Shared Scripts
   ============================================ */

// Generate stars if .stars container exists
(function () {
  const starsContainer = document.querySelector('.stars');
  if (!starsContainer) return;

  const count = 120;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star' + (Math.random() > 0.85 ? ' bright' : '');
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.opacity = (0.2 + Math.random() * 0.7).toFixed(2);
    fragment.appendChild(star);
  }

  starsContainer.appendChild(fragment);
})();

// Mobile nav
(function () {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Mobile dropdown toggles
  navLinks.querySelectorAll(':scope > li').forEach(li => {
    const toggle = li.querySelector('a');
    const menu = li.querySelector('.dropdown-menu');
    if (!menu) return;
    toggle.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        li.classList.toggle('open');
      }
    });
  });
})();

// Highlight current nav link
(function () {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && href.split('/').pop() === path) {
      a.classList.add('active');
    }
  });
})();

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
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
}

/**
 * Debounce helper
 */
export function debounce(fn, wait = 200) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/**
 * Throttle helper
 */
export function throttle(fn, limit = 50) {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Create an element with attributes and children
 */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  });
  children.forEach(c => {
    if (typeof c === 'string') node.appendChild(document.createTextNode(c));
    else if (c) node.appendChild(c);
  });
  return node;
}
