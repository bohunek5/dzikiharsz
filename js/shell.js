const icons = {
  search: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>',
  bag: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14l1 14H4L5 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/></svg>',
  sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>',
  moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14a9 9 0 0 1-10.7-11 9 9 0 1 0 10.7 11Z"/></svg>'
};
const languages = [['pl','Polski'],['de','Deutsch'],['en','English'],['lt','Lietuvių'],['hu','Magyar'],['cs','Čeština'],['sk','Slovenčina']];
const languageOptions = languages.map(([code, name]) => `<option value="${code}" data-no-translate>${name} · ${code.toUpperCase()}</option>`).join('');
const flagShapes = {
  pl: '<path fill="#fff" d="M0 0h30v10H0z"/><path fill="#dc143c" d="M0 10h30v10H0z"/>',
  de: '<path fill="#161616" d="M0 0h30v7H0z"/><path fill="#d6262f" d="M0 7h30v6H0z"/><path fill="#f6c343" d="M0 13h30v7H0z"/>',
  en: '<path fill="#153b73" d="M0 0h30v20H0z"/><path stroke="#fff" stroke-width="4" d="m0 0 30 20M30 0 0 20"/><path stroke="#c9233e" stroke-width="1.5" d="m0 0 30 20M30 0 0 20"/><path stroke="#fff" stroke-width="7" d="M15 0v20M0 10h30"/><path stroke="#c9233e" stroke-width="4" d="M15 0v20M0 10h30"/>',
  lt: '<path fill="#fdb913" d="M0 0h30v7H0z"/><path fill="#006a44" d="M0 7h30v6H0z"/><path fill="#c1272d" d="M0 13h30v7H0z"/>',
  hu: '<path fill="#ce2939" d="M0 0h30v7H0z"/><path fill="#fff" d="M0 7h30v6H0z"/><path fill="#477050" d="M0 13h30v7H0z"/>',
  cs: '<path fill="#fff" d="M0 0h30v10H0z"/><path fill="#d7141a" d="M0 10h30v10H0z"/><path fill="#11457e" d="m0 0 15 10L0 20Z"/>',
  sk: '<path fill="#fff" d="M0 0h30v7H0z"/><path fill="#0b4ea2" d="M0 7h30v6H0z"/><path fill="#ee1c25" d="M0 13h30v7H0z"/><path fill="#ee1c25" stroke="#fff" stroke-width=".8" d="M6 5h8v7q0 3-4 5-4-2-4-5Z"/><path stroke="#fff" stroke-width="1.3" d="M10 6v8M8 8h4M7.5 10h5"/><path fill="#0b4ea2" d="M6.5 13q1-2 2 0 1.5-3 3 0 1-2 2 0-1 2-3.5 3-2.5-1-3.5-3Z"/>'
};
const languageIndicator = `<span class="language-current" data-no-translate aria-hidden="true"><span class="language-flag"></span><span class="language-code">PL</span><svg class="language-chevron" viewBox="0 0 10 6"><path d="m1 1 4 4 4-4"/></svg></span>`;
const logo = `<span class="logo-sigil" aria-hidden="true"><span class="logo-wheel-window"><img class="logo-wheel" src="assets/logo-wheel.svg" width="450" height="436" alt=""></span><img class="logo-wordmark" src="assets/logo-wordmark.svg" width="450" height="140" alt=""></span>`;

export function initShell() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.body.dataset.page = page.replace('.html', '');
  document.body.classList.toggle('inner-page', page !== 'index.html');
  let header = document.querySelector('#header');
  if (!header) { header = document.createElement('header'); header.id = 'header'; document.body.prepend(header); }
  header.className = 'site-header';
  header.innerHTML = `<a class="brand" href="index.html" aria-label="Dziki Harsz — strona główna">${logo}</a>
    <nav class="main-nav" id="navigation" aria-label="Główna nawigacja">
      ${[['index.html','Strona główna'],['sklep.html','Sklep'],['o-nas.html','O nas'],['kontakt.html','Kontakt']].map(([url,label])=>`<a href="${url}" ${page===url?'aria-current="page"':''}>${label}</a>`).join('')}
      <div class="mobile-menu-settings"><span>Po Twojemu</span><label for="mobile-language-select">Język</label><select id="mobile-language-select" aria-label="Wybierz język">${languageOptions}</select><button class="theme-switch mobile-theme" aria-label="Zmień tryb dzień/noc">${icons.moon}<span class="theme-label">Tryb nocny</span></button><a class="menu-search" href="sklep.html?szukaj=1">${icons.search}<span>Szukaj w sklepie</span></a><a class="menu-contact" href="tel:+48722277527">722 277 527</a></div>
    </nav>
    <div class="header-end"><div class="desktop-settings"><button class="icon-button theme-switch" aria-label="Zmień tryb dzień/noc" title="Tryb nocny">${icons.moon}</button><label class="language-control"><span class="sr-only">Język</span>${languageIndicator}<select id="language-select" aria-label="Wybierz język">${languageOptions}</select></label></div><div class="header-actions"><button class="icon-button search-toggle" aria-label="Szukaj w sklepie">${icons.search}</button><button class="bag-button" id="open-bag" aria-haspopup="dialog">${icons.bag}<span class="bag-label">Twoja paczka</span><span id="bag-count">0</span></button><button class="icon-button menu-toggle" aria-label="Otwórz menu" aria-expanded="false" aria-controls="navigation"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h18M3 16h18"/></svg></button></div></div>`;
  initHeaderLanguages(header);
  const footer = document.querySelector('.footer') || document.body.appendChild(document.createElement('footer'));
  footer.className = 'footer';
  footer.innerHTML = `<div class="footer-top"><div class="footer-summary"><div class="footer-message"><p class="footer-slogan" data-no-translate><span data-footer-slogan>Najlepiej smakuje na miejscu.</span><em data-footer-invitation>Wpadnij nad Dargin.</em></p><div class="footer-contact"><a class="footer-phone" href="tel:+48722277527">722 277 527</a><span>Nowy Harsz 84 · 11-610 Pozezdrze</span><a class="footer-email" href="mailto:sklep@dzikiharsz.pl">sklep@dzikiharsz.pl</a></div></div></div></div><div class="footer-links"><span>© 2026 Dziki Harsz</span><nav aria-label="Informacje sklepu"><a href="regulamin.html">Regulamin</a><a href="polityka-prywatnosci.html">Prywatność</a><a href="cookies.html">Cookies</a><button class="footer-cookie-settings" data-cookie-settings>Ustawienia cookies</button><a href="kontakt.html">Kontakt</a><a href="https://www.facebook.com/DzikiHarsz" target="_blank" rel="noopener">Facebook</a></nav><a href="#">Do góry</a></div>`;
  if (!document.querySelector('#product-dialog')) document.body.insertAdjacentHTML('beforeend','<dialog class="product-dialog" id="product-dialog" aria-labelledby="product-dialog-title"><button class="dialog-close" data-close aria-label="Zamknij szczegóły produktu">×</button><div id="product-detail"></div></dialog>');
  if (!document.querySelector('#bag-dialog')) document.body.insertAdjacentHTML('beforeend','<dialog class="bag-dialog" id="bag-dialog" aria-labelledby="bag-title"><div class="bag-heading"><div><span class="eyebrow">KAWAŁEK HARSZU DLA CIEBIE</span><h2 id="bag-title">Twoja paczka</h2></div><button class="dialog-close" data-close aria-label="Zamknij paczkę">×</button></div><p class="bag-explainer">Twoje smaki, w jednym miejscu. Tutaj przygotujesz paczkę i sprawdzisz jej zawartość.</p><p class="dialog-status" data-status role="status" aria-live="polite" hidden></p><div id="bag-items"></div><div id="bag-summary"></div></dialog>');
  else document.querySelector('.bag-explainer').textContent = 'Twoje smaki, w jednym miejscu. Tutaj przygotujesz paczkę i sprawdzisz jej zawartość.';
  if (!document.querySelector('#toast')) document.body.insertAdjacentHTML('beforeend','<div class="toast" id="toast" role="status" aria-live="polite"></div>');
  initTheme();
  initCookies();
}

function safeRead(key) { try { return localStorage.getItem(key); } catch { return null; } }
function initHeaderLanguages(header) {
  const update = () => {
    const code = document.documentElement.lang?.slice(0, 2) || 'pl';
    const current = flagShapes[code] ? code : 'pl';
    header.querySelector('.language-flag').innerHTML = `<svg viewBox="0 0 30 20" aria-hidden="true" focusable="false">${flagShapes[current]}</svg>`;
    header.querySelector('.language-code').textContent = current.toUpperCase();
  };
  window.addEventListener('languagechange', update);
  update();
}
function safeWrite(key, value) { try { localStorage.setItem(key, value); } catch { /* UI still works for this visit. */ } }
function initTheme() {
  const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#07191f' : '#faf8f2');
    document.querySelectorAll('.theme-switch').forEach(button => {
      button.innerHTML = theme === 'dark' ? icons.sun : icons.moon;
      if (button.classList.contains('mobile-theme')) button.insertAdjacentHTML('beforeend',`<span class="theme-label">${theme === 'dark' ? 'Tryb dzienny' : 'Tryb nocny'}</span>`);
      button.setAttribute('aria-pressed', String(theme === 'dark'));
      button.setAttribute('title', theme === 'dark' ? 'Tryb dzienny' : 'Tryb nocny');
    });
  };
  apply(safeRead('dziki-harsz-theme') === 'dark' ? 'dark' : 'light');
  document.querySelectorAll('.theme-switch').forEach(button => button.addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    safeWrite('dziki-harsz-theme', theme); apply(theme);
    window.dispatchEvent(new CustomEvent('themechange', {detail:{theme}}));
  }));
}

function initCookies() {
  document.body.insertAdjacentHTML('beforeend', `<aside class="cookie-banner" id="cookie-banner" aria-labelledby="cookie-title" hidden><div class="cookie-pierog" aria-hidden="true"><img class="cookie-whole" src="assets/cookie-whole.webp" alt="" width="180" height="101"><span class="cookie-half cookie-left"></span><span class="cookie-half cookie-right"></span></div><div class="cookie-copy"><span class="eyebrow">MAŁA SPRAWA PRZED PIEROGAMI</span><h2 id="cookie-title">U nas nawet cookies<br> <em>mają farsz.</em></h2><p>Zapamiętujemy Twoją paczkę, język i tryb wyświetlania. W tym podglądzie nie uruchamiamy reklam ani analityki.</p><a href="cookies.html">Zobacz szczegóły</a></div><div class="cookie-actions"><button class="button button-dark" data-cookie-choice="all">Akceptuję</button><button class="cookie-essential" data-cookie-choice="essential">Tylko niezbędne</button></div><p class="sr-only" id="cookie-status" role="status"></p></aside>`);
  const banner = document.querySelector('#cookie-banner');
  const open = () => { banner.classList.remove('is-cracking'); banner.hidden = false; };
  const stored = safeRead('dziki-harsz-consent');
  let valid = false;
  try { const value = JSON.parse(stored); valid = value?.version === 1 && ['all','essential'].includes(value.choice); } catch {}
  if (!valid) setTimeout(open, 900);
  document.addEventListener('click', event => {
    const settings = event.target.closest('[data-cookie-settings]');
    if (settings) { open(); banner.querySelector('button').focus(); }
    const choice = event.target.closest('[data-cookie-choice]');
    if (!choice || banner.classList.contains('is-cracking')) return;
    safeWrite('dziki-harsz-consent', JSON.stringify({version:1, choice:choice.dataset.cookieChoice, updatedAt:new Date().toISOString(), analytics:false, marketing:false}));
    banner.classList.add('is-cracking');
    document.querySelector('#cookie-status').textContent = 'Ustawienia zapisane.';
    const duration = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 900;
    setTimeout(() => { banner.hidden = true; }, duration);
  });
}
