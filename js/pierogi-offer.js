import {getLanguage} from './i18n.js?v=20261023-motion';

export const offerFlavours = [
  ['sandacz', 'pierogi-z-sandaczem-6', 'assets/offer-boiled-sandacz.webp', 'assets/pierog-boiled-whole.webp'],
  ['kaczka', 'pierogi-z-kaczka-17', 'assets/offer-boiled-kaczka.webp', 'assets/pierog-boiled-whole.webp'],
  ['ruskie', 'pierogi-ruskie-12', 'assets/offer-boiled-ruskie.webp', 'assets/pierog-boiled-whole.webp'],
  ['kapusta', 'pierogi-z-kapusta-i-grzybami-16', 'assets/offer-boiled-kapusta.webp', 'assets/pierog-boiled-whole.webp'],
  ['mietus', 'pierogi-z-mietusem-8', 'assets/process-pierog-split.webp'],
  ['szczupak', 'pierogi-ze-szczupakiem-19', 'assets/process-pierog-split.webp'],
  ['mieso', 'pierogi-z-miesem-13', 'assets/offer-mieso.webp'],
  ['twarog', 'pierogi-z-twarogiem-11', 'assets/offer-twarog.webp']
];
export const offerDishes = [
  ...offerFlavours.map(([kind, slug, image, whole = 'assets/process-pierog-whole.webp']) => ({kind, slug, image, whole, type:'pierog'})),
  {kind:'uszka', slug:'uszka-z-grzybami-18', image:'assets/offer-uszka.webp', type:'dish'},
  {kind:'pasztet', slug:'pasztet-15', image:'assets/offer-pasztet.webp', type:'dish'},
  {kind:'smalec', slug:'smalec-14', image:'assets/offer-smalec.webp', type:'dish'}
];
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

/** One reversible pose for both the large dumpling and each flavour.
 * Only one source frame is visible: closed dough, then the two cut faces.
 * The first part of the opening reveals the seam; the rest follows a shallow arc.
 */
export function dumplingPose(progress) {
  const tension = smooth((progress - .18) / .22);
  const opening = clamp((progress - .4) / .6);
  const seam = smooth(opening / .2);
  const release = smooth((opening - .12) / .88);
  const arc = Math.sin(release * Math.PI);
  return {
    open: progress >= .4,
    wholeX: 1 - tension * .045,
    wholeY: 1 + tension * .022,
    wholeLift: tension * .6,
    wholeTurn: tension * -.65,
    leftX: 3.4 - seam * 1.3 - release * 6.1,
    rightX: -3.4 + seam * 1.3 + release * 5.7,
    leftY: .6 - arc * 3.2 + release * 1.2,
    rightY: .6 - arc * 2.3 + release * .5,
    leftTurn: -release * 4.5 - arc,
    rightTurn: release * 3.2 + arc * .6,
    leftTilt: -7 + release * 5,
    rightTilt: 7 - release * 5,
    scale: .985 + seam * .015,
    flour: Math.sin(opening * Math.PI) * .2,
    release
  };
}

export function applyDumplingPose(element, pose) {
  const values = {
    '--whole-scale-x':pose.wholeX, '--whole-scale-y':pose.wholeY,
    '--whole-lift':`${pose.wholeLift}%`, '--whole-turn':`${pose.wholeTurn}deg`,
    '--food-left-x':`${pose.leftX}%`, '--food-right-x':`${pose.rightX}%`,
    '--food-left-y':`${pose.leftY}%`, '--food-right-y':`${pose.rightY}%`,
    '--food-left-turn':`${pose.leftTurn}deg`, '--food-right-turn':`${pose.rightTurn}deg`,
    '--food-left-tilt':`${pose.leftTilt}deg`, '--food-right-tilt':`${pose.rightTilt}deg`,
    '--food-part-scale':pose.scale
  };
  for (const [name, value] of Object.entries(values)) element.style.setProperty(name, String(value));
}

/** Shared with the static build: all eleven food links exist without JavaScript. */
export function offerMarkup(products, copy) {
  return `<div class="offer-heading"><p class="offer-kicker" data-offer-copy="intro">${escape(copy.intro)}</p><h2 id="offer-title" data-offer-copy="title">${escape(copy.title)}</h2><p class="offer-hint" data-offer-copy="hint">${escape(copy.hint)}</p></div>
  <div class="offer-grid">${offerDishes.map(({kind, slug, image, whole, type}) => {
    const product = products.find(p => p.slug === slug);
    if (!product) throw new Error('Missing offer product: ' + slug);
    const visual = type === 'pierog' ? `<img class="offer-whole" src="${whole}" width="1200" height="675" alt="" loading="lazy" decoding="async">
        <span class="offer-half offer-half-left"><img src="${image}" width="840" height="473" alt="" loading="lazy" decoding="async"></span>
        <span class="offer-half offer-half-right"><img src="${image}" width="840" height="473" alt="" loading="lazy" decoding="async"></span>`
      : `<img class="offer-dish-image" src="${image}" width="1000" height="750" alt="" loading="lazy" decoding="async">`;
    return `<article class="offer-flavour${type === 'dish' ? ' offer-dish' : ''}" data-flavour="${kind}" data-offer-type="${type}"${type === 'pierog' ? ' data-open="false"' : ''}>
      <span class="offer-flour" aria-hidden="true"></span>
      <a class="offer-visual" href="${slug}.html" aria-label="${escape(product.name)}"><span aria-hidden="true">
        ${visual}
      </span></a>
      <div class="offer-caption"><h3><a href="${slug}.html">${escape(product.name)}</a></h3><p data-offer-kind="${kind}">${escape(copy.kinds[kind])}</p></div>
    </article>`;
  }).join('')}</div>
  <div class="offer-finale"><p data-offer-copy="availability">${escape(copy.availability)}</p><a href="sklep.html" class="button button-cream"><span data-offer-copy="cta">${escape(copy.cta)}</span></a></div>`;
}

export async function initPierogiOffer() {
  const section = document.querySelector('#nasze-pierogi');
  if (!section) return;
  try {
    const response = await fetch('data/offer-copy.json?v=20261023-motion');
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
  const visuals = new Map(cards.map(card => [card, card.querySelector('.offer-visual')]));
  const images = new Map(cards.map(card => [card, [...card.querySelectorAll(card.dataset.offerType === 'pierog' ? '.offer-half img' : '.offer-dish-image')]]));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set();
  let frame = 0;
  function render() {
    frame = 0;
    if (document.hidden) return;
    for (const card of visible) {
      const visual = visuals.get(card);
      const rect = visual.getBoundingClientRect();
      const onScreen = rect.bottom >= 0 && rect.top <= innerHeight;
      card.classList.toggle('food-in-view', onScreen);
      if (!onScreen && !reduced.matches) continue;
      const progress = reduced.matches || card.matches(':focus-within') ? 1 : clamp((innerHeight * .87 - rect.top) / Math.max(180, innerHeight * .38));
      const isPierog = card.dataset.offerType === 'pierog';
      const ready = images.get(card).every(img => img.complete && img.naturalWidth > 0);
      const ease = smooth(progress);
      card.dataset.foodProgress = progress.toFixed(4);
      if (isPierog) {
        const pose = dumplingPose(ready ? progress : 0);
        applyDumplingPose(visual, pose);
        card.dataset.open = String(pose.open && ready);
        card.style.setProperty('--flour-opacity', reduced.matches ? '0' : String(pose.flour));
        card.style.setProperty('--flour-y', `${8 - pose.release * 16}px`);
      } else {
        const kind = card.dataset.flavour;
        // A plate settles upright. Bread dishes approach from opposite sides;
        // neither plate nor jar rotates, and no photograph is duplicated.
        const x = kind === 'pasztet' ? (1 - ease) * 14 : kind === 'smalec' ? (ease - 1) * 16 : 0;
        const y = (1 - ease) * (kind === 'uszka' ? 20 : 8);
        visual.style.setProperty('--dish-x', reduced.matches ? '0px' : `${x}px`);
        visual.style.setProperty('--dish-y', reduced.matches ? '0px' : `${y}px`);
        visual.style.setProperty('--dish-scale', reduced.matches ? '1' : String(.975 + ease * .025));
        visual.style.setProperty('--dish-opacity', '1');
        visual.style.setProperty('--accent-y', `${10 - ease * 26}px`);
        visual.style.setProperty('--accent-x', `${(ease - .5) * 8}px`);
        visual.style.setProperty('--accent-opacity', reduced.matches ? '0' : String(Math.sin(progress * Math.PI) * .32));
        card.style.setProperty('--flour-opacity', reduced.matches || kind === 'uszka' ? '0' : String(Math.sin(progress * Math.PI) * .35));
        card.style.setProperty('--flour-y', `${5 - ease * 12}px`);
      }
    }
  }
  const schedule = () => { if (!frame && !document.hidden && visible.size) frame = requestAnimationFrame(render); };
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) visible.add(entry.target);
      else { visible.delete(entry.target); entry.target.classList.remove('food-in-view'); }
    });
    schedule();
  }, {rootMargin:'0px'});
  cards.forEach(card => {
    observer.observe(card);
    card.querySelectorAll('img').forEach(img => img.addEventListener('load', schedule, {once:true}));
    card.addEventListener('focusin', schedule);
    card.addEventListener('focusout', schedule);
  });
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  reduced.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(frame); frame = 0; }
    else schedule();
  });
}
