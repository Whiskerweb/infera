/* INFERA — partials rendered client-side so every page stays in sync */

const PAGES = [
  { href: 'index.html',     fr: 'Accueil',        en: 'Home',          key: 'home' },
  { href: 'clients.html',   fr: 'Clients',        en: 'Clients',       key: 'clients' },
  { href: 'docs.html',      fr: 'Docs',           en: 'Docs',          key: 'docs' },
  { href: 'security.html',  fr: 'Sécurité',       en: 'Security',      key: 'security' },
  { href: 'blog.html',      fr: 'Journal',        en: 'Journal',       key: 'blog' },
];

function renderNav(activeKey) {
  const links = PAGES.map(p => {
    const active = p.key === activeKey ? ' active' : '';
    return `<a href="${p.href}" class="${active.trim()}" data-fr="${p.fr}" data-en="${p.en}">${p.fr}</a>`;
  }).join('');

  const mainLinks = links;
  const mobileLinks = PAGES.map(p => `<a href="${p.href}" data-fr="${p.fr}" data-en="${p.en}">${p.fr}</a>`).join('');

  return `
    <nav class="nav">
      <div class="nav-inner">
        <a href="index.html" class="brand" aria-label="Infera">
          <span class="brand-mark">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="1" y="1" width="22" height="22" rx="5" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
              <circle cx="6" cy="12" r="1.6" fill="#7EE787"/>
              <circle cx="12" cy="6"  r="1.6" fill="#7EE787"/>
              <circle cx="12" cy="18" r="1.6" fill="#7EE787"/>
              <circle cx="18" cy="12" r="1.6" fill="#7EE787"/>
              <circle cx="12" cy="12" r="1.8" fill="#E8F2FF"/>
              <path d="M6 12 L12 6 M12 6 L18 12 M18 12 L12 18 M12 18 L6 12 M6 12 L18 12 M12 6 L12 18" stroke="rgba(126,231,135,0.35)" stroke-width="0.6"/>
            </svg>
          </span>
          <span>Infera</span>
        </a>
        <div class="nav-links">
          ${mainLinks}
        </div>
        <div class="nav-right">
          <div class="lang-switch" role="group" aria-label="Language">
            <button data-lang="fr" class="on">FR</button>
            <button data-lang="en">EN</button>
          </div>
          <a href="contact.html" class="cta" data-fr="Rejoindre la beta" data-en="Join the beta">Rejoindre la beta</a>
          <button class="burger" aria-label="Menu" aria-expanded="false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
      </div>
      <div class="mobile-menu" id="mobile-menu">
        ${mobileLinks}
        <a href="contact.html" class="cta" style="align-self:flex-start" data-fr="Rejoindre la beta" data-en="Join the beta">Rejoindre la beta</a>
      </div>
    </nav>
  `;
}

function renderFooter() {
  return `
    <footer class="site">
      <div class="wrap">
        <div class="footer-grid">
          <div class="footer-brand">
            <a href="index.html" class="brand">
              <span class="brand-mark">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="22" height="22" rx="5" stroke="rgba(255,255,255,0.14)" stroke-width="1"/>
                  <circle cx="6" cy="12" r="1.6" fill="#7EE787"/>
                  <circle cx="12" cy="6"  r="1.6" fill="#7EE787"/>
                  <circle cx="12" cy="18" r="1.6" fill="#7EE787"/>
                  <circle cx="18" cy="12" r="1.6" fill="#7EE787"/>
                  <circle cx="12" cy="12" r="1.8" fill="#E8F2FF"/>
                  <path d="M6 12 L12 6 M12 6 L18 12 M18 12 L12 18 M12 18 L6 12 M6 12 L18 12 M12 6 L12 18" stroke="rgba(126,231,135,0.35)" stroke-width="0.6"/>
                </svg>
              </span>
              <span>Infera</span>
            </a>
            <p data-fr="Le cloud d'IA souverain, décentralisé, économique et écologique. API compatible OpenAI, résilient par nature."
               data-en="The sovereign, decentralized, affordable and low-carbon AI cloud. OpenAI-compatible API, resilient by design.">
              Le cloud d'IA souverain, décentralisé, économique et écologique. API compatible OpenAI, résilient par nature.
            </p>
          </div>
          <div class="footer-col">
            <h4 data-fr="Produit" data-en="Product">Produit</h4>
            <ul>
              <li><a href="product.html"   data-fr="Architecture"   data-en="Architecture">Architecture</a></li>
              <li><a href="providers.html" data-fr="Fournisseurs"   data-en="Providers">Fournisseurs</a></li>
              <li><a href="clients.html"   data-fr="Clients"        data-en="Clients">Clients</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 data-fr="Ressources" data-en="Resources">Ressources</h4>
            <ul>
              <li><a href="docs.html"     data-fr="Documentation"  data-en="Documentation">Documentation</a></li>
              <li><a href="security.html" data-fr="Sécurité" data-en="Security">Sécurité</a></li>
              <li><a href="blog.html"     data-fr="Journal"        data-en="Journal">Journal</a></li>
              <li><a href="#"             data-fr="Statut réseau" data-en="Network status">Statut réseau</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 data-fr="Entreprise" data-en="Company">Entreprise</h4>
            <ul>
              <li><a href="contact.html" data-fr="Contact"   data-en="Contact">Contact</a></li>
              <li><a href="#"            data-fr="GitHub"    data-en="GitHub">GitHub</a></li>
              <li><a href="#"            data-fr="Changelog" data-en="Changelog">Changelog</a></li>
              <li><a href="#"            data-fr="Presse"    data-en="Press">Presse</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4 data-fr="Légal" data-en="Legal">Légal</h4>
            <ul>
              <li><a href="#" data-fr="Mentions"        data-en="Imprint">Mentions</a></li>
              <li><a href="#" data-fr="Confidentialité" data-en="Privacy">Confidentialité</a></li>
              <li><a href="#" data-fr="CGU"             data-en="Terms">CGU</a></li>
              <li><a href="#" data-fr="DPA"             data-en="DPA">DPA</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <div>INFERA SYSTEM © 2026 · DECENTRALIZED COMPUTE · REGISTERED IN EU</div>
          <div class="status">
            <span class="status-dot"></span>
            <span data-fr="Réseau opérationnel · 1,284 nodes actifs" data-en="Network operational · 1,284 active nodes">Réseau opérationnel · 1,284 nodes actifs</span>
          </div>
        </div>
      </div>
    </footer>
  `;
}

function initNavDropdown() {
  document.querySelectorAll('[data-nav-dropdown]').forEach(dd => {
    const btn = dd.querySelector('.nav-dropdown-trigger');
    if (!btn) return;
    let open = false;
    const set = (v) => {
      open = v;
      dd.classList.toggle('open', v);
      btn.setAttribute('aria-expanded', v ? 'true' : 'false');
    };
    btn.addEventListener('click', (e) => { e.stopPropagation(); set(!open); });
    dd.addEventListener('mouseenter', () => set(true));
    dd.addEventListener('mouseleave', () => set(false));
    document.addEventListener('click', (e) => {
      if (!dd.contains(e.target)) set(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') set(false);
    });
  });
}

function mount(activeKey) {
  const navSlot = document.getElementById('nav-slot');
  const footerSlot = document.getElementById('footer-slot');
  if (navSlot) navSlot.outerHTML = renderNav(activeKey);
  if (footerSlot) footerSlot.outerHTML = renderFooter();
  initNavDropdown();
}
