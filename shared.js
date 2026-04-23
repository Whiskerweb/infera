/* INFERA — Direction A shared JS: nav, i18n, reveal, network viz */

/* ---------- Mobile menu ---------- */
function initNav() {
  const burger = document.querySelector('.burger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!burger || !mobileMenu) return;
  burger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }));
}

/* ---------- Scroll reveal ---------- */
function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ---------- Card cursor glow ---------- */
function initCardGlow() {
  document.querySelectorAll('.card, .feature, .tier, .stat, .flow-node, .doc-card, .article').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--x', (e.clientX - r.left) + 'px');
      card.style.setProperty('--y', (e.clientY - r.top) + 'px');
    });
  });
}

/* ---------- i18n ---------- */
function initI18n() {
  const saved = localStorage.getItem('infera-lang') || 'fr';
  setLang(saved);
  document.querySelectorAll('.lang-switch button').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
}
function setLang(lang) {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-fr], [data-en]').forEach(el => {
    const val = el.getAttribute('data-' + lang);
    if (val !== null) {
      // Preserve child elements if any - we only replace if node has only text or raw html marker
      if (el.hasAttribute('data-html')) {
        el.innerHTML = val;
      } else {
        el.textContent = val;
      }
    }
  });
  document.querySelectorAll('[data-fr-attr]').forEach(el => {
    const map = JSON.parse(el.getAttribute('data-' + lang + '-attr') || '{}');
    for (const k in map) el.setAttribute(k, map[k]);
  });
  document.querySelectorAll('.lang-switch button').forEach(b => {
    b.classList.toggle('on', b.dataset.lang === lang);
  });
  localStorage.setItem('infera-lang', lang);
}

/* ---------- Global init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initReveal();
  initCardGlow();
  initI18n();
});
