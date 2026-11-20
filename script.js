// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('site-nav');
toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});

// Contact page: "Copy address" buttons
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
  const label = button.textContent;
  button.addEventListener('click', async () => {
    const ok = await copyText(button.dataset.copy);
    button.textContent = ok ? 'Copied!' : 'Copy failed';
    button.classList.toggle('is-copied', ok);
    if (copyStatus) copyStatus.textContent = ok ? `Copied ${button.dataset.copy}` : 'Could not copy. Please copy the address manually.';
    clearTimeout(button.resetTimer);
    button.resetTimer = setTimeout(() => {
      button.textContent = label;
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
