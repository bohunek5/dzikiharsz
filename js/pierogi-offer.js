import {getLanguage} from './i18n.js';

export const offerFlavours = [
  ['sandacz', 'pierogi-z-sandaczem-6', 'assets/process-pierog-split.webp'],
  ['kaczka', 'pierogi-z-kaczka-17', 'assets/offer-kaczka.webp'],
  ['ruskie', 'pierogi-ruskie-12', 'assets/offer-ruskie.webp'],
  ['kapusta', 'pierogi-z-kapusta-i-grzybami-16', 'assets/offer-kapusta.webp'],
  ['mietus', 'pierogi-z-mietusem-8', 'assets/process-pierog-split.webp'],
  ['szczupak', 'pierogi-ze-szczupakiem-19', 'assets/process-pierog-split.webp'],
  ['mieso', 'pierogi-z-miesem-13', 'assets/offer-mieso.webp'],
  ['twarog', 'pierogi-z-twarogiem-11', 'assets/offer-twarog.webp']
];
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/** Shared with the static build: all eight links and fillings exist without JavaScript. */
export function offerMarkup(products, copy) {
  return `<div class="offer-heading"><p class="offer-kicker" data-offer-copy="intro">${escape(copy.intro)}</p><h2 id="offer-title" data-offer-copy="title">${escape(copy.title)}</h2><p class="offer-hint" data-offer-copy="hint">${escape(copy.hint)}</p></div>
  <div class="offer-grid">${offerFlavours.map(([kind, slug, image]) => {
    const product = products.find(p => p.slug === slug);
    if (!product) throw new Error('Missing offer product: ' + slug);
    return `<article class="offer-flavour" data-flavour="${kind}" data-open="false">
      <a class="offer-visual" href="${slug}.html" aria-label="${escape(product.name)}"><span aria-hidden="true">
        <img class="offer-whole" src="assets/process-pierog-whole.webp" width="1200" height="675" alt="" loading="lazy" decoding="async">
        <span class="offer-half offer-half-left"><img src="${image}" width="840" height="473" alt="" loading="lazy" decoding="async"></span>
        <span class="offer-half offer-half-right"><img src="${image}" width="840" height="473" alt="" loading="lazy" decoding="async"></span>
      </span></a>
      <div class="offer-caption"><h3><a href="${slug}.html">${escape(product.name)}</a></h3><p data-offer-kind="${kind}">${escape(copy.kinds[kind])}</p><a class="offer-detail" href="${slug}.html"><span data-offer-copy="detail">${escape(copy.detail)}</span> <span aria-hidden="true">↗</span></a></div>
    </article>`;
  }).join('')}</div>
  <a class="offer-uszka" href="uszka-z-grzybami-18.html"><img src="assets/uszka-z-grzybami-18.webp" width="640" height="600" loading="lazy" decoding="async" alt="Uszka z grzybami"><span data-offer-copy="uszka">${escape(copy.uszka)}</span><span aria-hidden="true">↗</span></a>
  <div class="offer-finale"><p data-offer-copy="availability">${escape(copy.availability)}</p><a href="sklep.html" class="button button-cream"><span data-offer-copy="cta">${escape(copy.cta)}</span><span aria-hidden="true">↗</span></a><small data-offer-copy="illustration">${escape(copy.illustration)}</small></div>`;
}

export async function initPierogiOffer() {
  const section = document.querySelector('#nasze-pierogi');
  if (!section) return;
  try {
    const response = await fetch('data/offer-copy.json');
    if (!response.ok) throw new Error(`Offer translations: HTTP ${response.status}`);
    const copy = await response.json();
    const translateOffer = () => {
      const active = copy[getLanguage()] || copy.pl;
      section.querySelectorAll('[data-offer-copy]').forEach(el => { el.textContent = active[el.dataset.offerCopy]; });
      section.querySelectorAll('[data-offer-kind]').forEach(el => { el.textContent = active.kinds[el.dataset.offerKind]; });
    };
    // These few labels own their translations; product names use the normal catalog dictionary.
    section.querySelectorAll('[data-offer-copy],[data-offer-kind]').forEach(el => el.setAttribute('data-no-translate',''));
    addEventListener('languagechange', translateOffer);
    translateOffer();
  } catch {
    // The static Polish offer and its animation remain usable if translations fail.
  }
  const cards = [...section.querySelectorAll('.offer-flavour')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set();
  let frame = 0;
  function render() {
    frame = 0;
    for (const card of visible) {
      const visual = card.querySelector('.offer-visual');
      const rect = visual.getBoundingClientRect();
      const progress = reduced.matches ? 1 : Math.max(0, Math.min(1, (innerHeight * .87 - rect.top) / Math.max(180, innerHeight * .38)));
      const ready = [...card.querySelectorAll('.offer-half img')].every(img => img.complete && img.naturalWidth > 0);
      const open = (progress > .12 || card.matches(':focus-within')) && ready;
      card.dataset.open = String(open);
      const amount = Math.max(0, (progress - .12) / .88);
      const ease = amount * amount * (3 - 2 * amount);
      visual.style.setProperty('--open-x', `${3.4 - ease * 7.4}%`);
      visual.style.setProperty('--open-turn', `${ease * -3}deg`);
    }
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(render); };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target));
    schedule();
  }, {rootMargin:'160px 0px'});
  cards.forEach(card => {
    observer.observe(card);
    card.querySelectorAll('img').forEach(img => img.addEventListener('load', schedule, {once:true}));
    card.addEventListener('focusin', schedule);
    card.addEventListener('focusout', schedule);
  });
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  reduced.addEventListener('change', schedule);
}
