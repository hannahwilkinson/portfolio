// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');
const setMenu = (open) => {
  nav.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', String(open));
};
toggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('open')) {
    setMenu(false);
    toggle.focus();
  }
});

// Header gets a shadow once the page scrolls
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// Fade sections in as they scroll into view (only things below the fold, so nothing flickers)
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('is-visible');
        revealObserver.unobserve(el);
        // Hand the element back to its normal styles (so hover effects work) once its own fade-in ends
        const done = (e) => {
          if (e.target !== el || e.propertyName !== 'opacity') return;
          el.removeEventListener('transitionend', done);
          el.classList.remove('reveal', 'is-visible');
          el.style.transitionDelay = '';
        };
        el.addEventListener('transitionend', done);
      }
    });
  }, { rootMargin: '0px 0px -8% 0px' });

  document.querySelectorAll('.section-head, .explore-card, .stat, .cta-inner, .org, .card, .gallery li, .gallery-title, .contact-panel, .contact-form-card')
    .forEach((el) => {
      if (el.getBoundingClientRect().top < window.innerHeight) return;
      const position = Array.prototype.indexOf.call(el.parentElement.children, el);
      el.style.transitionDelay = `${(position % 4) * 70}ms`;
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
}

// Count the home page stats up when they appear
const counters = document.querySelectorAll('[data-count]');
if (counters.length && 'IntersectionObserver' in window && !reduceMotion) {
  const format = (n, suffix) => `${Math.round(n).toLocaleString('en-US')}${suffix}`;
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      countObserver.unobserve(el);
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const duration = 1400;
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = format(target * eased, suffix);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => countObserver.observe(el));
}

// Portfolio: click an image to view it larger
const figures = Array.from(document.querySelectorAll('.gallery figure'));
if (figures.length && typeof HTMLDialogElement === 'function') {
  const icon = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`;
  const dialog = document.createElement('dialog');
  dialog.className = 'lightbox';
  dialog.setAttribute('aria-label', 'Image viewer');
  dialog.innerHTML = `
    <div class="lb-stage">
      <figure class="lb-figure">
        <img class="lb-img" alt="" />
        <figcaption class="lb-caption"><span class="lb-title"></span><span class="lb-count"></span></figcaption>
      </figure>
    </div>
    <button type="button" class="lb-btn lb-close" aria-label="Close">${icon('M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z')}</button>
    <button type="button" class="lb-btn lb-prev" aria-label="Previous image">${icon('M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z')}</button>
    <button type="button" class="lb-btn lb-next" aria-label="Next image">${icon('M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z')}</button>`;
  document.body.appendChild(dialog);

  const lbImg = dialog.querySelector('.lb-img');
  const lbTitle = dialog.querySelector('.lb-title');
  const lbCount = dialog.querySelector('.lb-count');
  let current = 0;
  let list = figures; // only the images showing under the current filter

  const show = (i) => {
    current = (i + list.length) % list.length;
    const source = list[current].querySelector('img');
    const caption = list[current].querySelector('figcaption');
    lbImg.src = source.currentSrc || source.src;
    lbImg.alt = source.alt;
    lbTitle.textContent = caption ? caption.textContent : '';
    lbCount.textContent = `${current + 1} / ${list.length}`;
  };
  const open = (i) => {
    list = figures.filter((f) => !f.closest('[hidden]'));
    show(list.indexOf(figures[i]));
    document.documentElement.classList.add('lb-open');
    dialog.showModal();
  };

  figures.forEach((figure, i) => {
    const caption = figure.querySelector('figcaption');
    figure.setAttribute('role', 'button');
    figure.tabIndex = 0;
    figure.setAttribute('aria-label', `View larger: ${caption ? caption.textContent : 'image'}`);
    figure.addEventListener('click', () => open(i));
    figure.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open(i);
      }
    });
  });

  dialog.querySelector('.lb-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('.lb-prev').addEventListener('click', () => show(current - 1));
  dialog.querySelector('.lb-next').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target.classList.contains('lb-stage')) dialog.close();
  });
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') show(current - 1);
    if (event.key === 'ArrowRight') show(current + 1);
  });
  dialog.addEventListener('close', () => document.documentElement.classList.remove('lb-open'));

  // Swipe on phones
  let touchX = null;
  dialog.addEventListener('touchstart', (event) => {
    touchX = event.touches.length === 1 ? event.touches[0].clientX : null; // ignore pinch / multi-finger
  }, { passive: true });
  dialog.addEventListener('touchend', (event) => {
    if (touchX === null) return;
    const dx = event.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    touchX = null;
  });
}

// Portfolio: filter buttons (portfolio.html#events opens straight to that collection)
const chips = Array.from(document.querySelectorAll('.filter-chip'));
if (chips.length) {
  const collections = document.querySelectorAll('.collection');
  const groups = document.querySelectorAll('.gallery-group');
  const filterStatus = document.getElementById('filter-status');
  const applyFilter = (filter, updateUrl) => {
    if (!chips.some((chip) => chip.dataset.filter === filter)) filter = 'all';
    chips.forEach((chip) => chip.setAttribute('aria-pressed', String(chip.dataset.filter === filter)));
    collections.forEach((c) => { c.hidden = filter !== 'all' && c.dataset.collection !== filter; });
    groups.forEach((g) => { g.hidden = !g.querySelector('.collection:not([hidden])'); });
    const count = document.querySelectorAll('.collection:not([hidden]) .gallery figure').length;
    if (filterStatus) filterStatus.textContent = `Showing ${count} ${count === 1 ? 'item' : 'items'}`;
    if (updateUrl) history.replaceState(null, '', filter === 'all' ? window.location.pathname : `#${filter}`);
  };
  chips.forEach((chip) => chip.addEventListener('click', () => applyFilter(chip.dataset.filter, true)));
  const fromHash = () => applyFilter(decodeURIComponent(window.location.hash.slice(1)) || 'all', false);
  fromHash();
  window.addEventListener('hashchange', fromHash);
}

// Contact page: "Copy" button
const copyStatus = document.getElementById('copy-status');

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for browsers that block the clipboard API
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.setAttribute('readonly', '');
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    const ok = document.execCommand('copy');
    temp.remove();
    return ok;
  }
}

document.querySelectorAll('[data-copy]').forEach((button) => {
  const labelEl = button.querySelector('.copy-label') || button;
  const label = labelEl.textContent;
  button.addEventListener('click', async () => {
    const ok = await copyText(button.dataset.copy);
    labelEl.textContent = ok ? 'Copied!' : 'Copy failed';
    button.classList.toggle('is-copied', ok);
    if (copyStatus) copyStatus.textContent = ok ? `Copied ${button.dataset.copy}` : 'Could not copy. Please copy the address manually.';
    clearTimeout(button.resetTimer);
    button.resetTimer = setTimeout(() => {
      labelEl.textContent = label;
      button.classList.remove('is-copied');
    }, 2000);
  });
});

// Contact page: message form opens the visitor's email app
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();
    // Use namedItem: form.name would return the form's own name attribute
    const field = (id) => contactForm.elements.namedItem(id).value.trim();
    const name = field('name');
    const subject = field('subject') || `Message from ${name}`;
    const body = `${field('message')}\n\n${name}`;
    const link = document.createElement('a');
    link.href = `mailto:${contactForm.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    link.click();
    document.getElementById('form-status').textContent = 'Opening your email app…';
  });
}
