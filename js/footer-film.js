import { getLanguage } from './i18n.js';

// The illustration belongs to the footer; its description follows the selected language.
const ALT = {
  pl: 'Dłonie ugniatające ciasto na drewnianej stolnicy, obok misek z farszem.',
  en: 'Hands kneading dough on a wooden board beside bowls of filling.',
  de: 'Hände kneten Teig auf einem Holzbrett neben Schalen mit Füllung.',
  lt: 'Rankos minko tešlą ant medinės lentos šalia dubenėlių su įdaru.',
  hu: 'Tésztát gyúró kezek egy fadeszkán, töltelékkel teli tálak mellett.',
  cs: 'Ruce hnětoucí těsto na dřevěném vále vedle misek s náplní.',
  sk: 'Ruky miesiace cesto na drevenej doske vedľa misiek s plnkou.'
};
const INVITATION = {
  pl: ['Najlepiej smakuje na miejscu.', 'Wpadnij nad Dargin.'],
  en: ['Best enjoyed here.', 'Come and visit us by Lake Dargin.'],
  de: ['Vor Ort schmeckt es am besten.', 'Komm zu uns an den Darginsee.'],
  lt: ['Skaniausia čia, vietoje.', 'Užsuk prie Dargino ežero.'],
  hu: ['Helyben a legfinomabb.', 'Látogass el hozzánk a Dargin-tóhoz.'],
  cs: ['Nejlépe chutná u nás.', 'Zastav se u jezera Dargin.'],
  sk: ['Najlepšie chutí u nás.', 'Zastav sa pri jazere Dargin.']
};

// Only the two hand regions have a non-neutral displacement. The board, bowls,
// and centre of the dough keep their original pixels and alignment with the logo.
const HAND_MAP = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="676" viewBox="0 0 1200 676"><defs><radialGradient id="l"><stop stop-color="#304080"/><stop offset=".3" stop-color="#304080"/><stop offset="1" stop-color="#808080"/></radialGradient><radialGradient id="r"><stop stop-color="#d04080"/><stop offset=".3" stop-color="#d04080"/><stop offset="1" stop-color="#808080"/></radialGradient></defs><rect width="1200" height="676" fill="#808080"/><ellipse cx="390" cy="245" rx="105" ry="150" fill="url(#l)"/><ellipse cx="769" cy="250" rx="95" ry="150" fill="url(#r)"/></svg>';

function initKneading(art) {
  const displacement = art.querySelector('#footer-knead-shift');
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  let frame = 0;
  let last = 0;
  let lastPaint = 0;
  let elapsed = 0;
  let strength = 12 * art.clientWidth / 1200;
  function resize() { strength = 12 * art.clientWidth / 1200; }
  function animate(now) {
    if (last) elapsed += now - last;
    last = now;
    // Keep the filter at 30 updates/s; rAF retains a smooth, time-based phase.
    if (now - lastPaint >= 1000 / 30) {
      lastPaint = now - ((now - lastPaint) % (1000 / 30));
      const press = (1 - Math.cos(elapsed * Math.PI * 2 / 4000)) / 2;
      displacement.setAttribute('scale', (press * strength).toFixed(3));
    }
    frame = requestAnimationFrame(animate);
  }
  function sync() {
    const run = visible && !document.hidden && !media.matches;
    if (!run && frame) {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      lastPaint = 0;
    }
    if (media.matches) {
      elapsed = 0;
      displacement.setAttribute('scale', '0');
    }
    if (run && !frame) frame = requestAnimationFrame(animate);
    art.dataset.kneading = media.matches ? 'reduced' : run ? 'running' : 'paused';
  }
  const observer = new IntersectionObserver(entries => {
    visible = entries.some(entry => entry.isIntersecting);
    sync();
  });
  observer.observe(art);
  window.addEventListener('resize', resize, { passive: true });
  media.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  sync();
}
export function initFooterFilm() {
  if (document.querySelector('#footer-film')) return;
  const footerTop = document.querySelector('.footer .footer-top');
  if (!footerTop) return;
  const art = document.createElement('div');
  art.id = 'footer-film';
  art.className = 'footer-film footer-kitchen-art';
  art.dataset.noTranslate = '';
  art.dataset.visual = 'illustration';
  art.innerHTML = `<figure class="footer-kitchen-figure"><img src="assets/footer-kitchen-flour-logo.webp" width="1200" height="676" loading="lazy" decoding="async" alt=""><svg class="footer-flour-filter" width="0" height="0" aria-hidden="true" focusable="false"><defs><filter id="footer-knead-filter" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage href="data:image/svg+xml,${encodeURIComponent(HAND_MAP)}" result="map" preserveAspectRatio="none"/><feComponentTransfer in="map" result="neutral-map"><feFuncR type="linear" slope="1" intercept="-.00196078431372549"/><feFuncG type="linear" slope="1" intercept="-.00196078431372549"/></feComponentTransfer><feDisplacementMap id="footer-knead-shift" in="SourceGraphic" in2="neutral-map" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter><filter id="footer-flour-grain" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="2" seed="7" result="grain"/><feColorMatrix in="grain" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 .45 0 0 0 .55" result="flour"/><feComposite in="flour" in2="SourceAlpha" operator="in"/></filter></defs></svg><span class="footer-flour-logo logo-sigil" aria-hidden="true"><span class="logo-wheel-window"><img class="logo-wheel" src="assets/logo-wheel.svg" width="450" height="436" alt=""></span><img class="logo-wordmark" src="assets/logo-wordmark.svg" width="450" height="140" alt=""></span></figure>`;
  footerTop.prepend(art);
  const image = art.querySelector('img');
  function describe() {
    const language = getLanguage();
    image.alt = ALT[language] || ALT.pl;
    const [slogan, invitation] = INVITATION[language] || INVITATION.pl;
    footerTop.querySelector('[data-footer-slogan]').textContent = slogan;
    footerTop.querySelector('[data-footer-invitation]').textContent = invitation;
  }
  window.addEventListener('languagechange', describe);
  describe();
  initKneading(art);
}
