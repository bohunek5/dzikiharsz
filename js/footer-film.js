import { getLanguage } from './i18n.js';

// This is a rendered keyframe, not a video. The rejected geometric scene is removed.
const COPY = {
  pl: ['Z naszej kuchni', 'Ilustracja', 'Bajkowa ilustracja dłoni kucharza ugniatających ciasto na drewnianej stolnicy, obok misek z farszem.'],
  en: ['From our kitchen', 'Illustration', 'Storybook illustration of a chef’s hands kneading dough on a wooden board beside bowls of filling.'],
  de: ['Aus unserer Küche', 'Illustration', 'Märchenhafte Illustration von Kochhänden beim Teigkneten auf einem Holzbrett neben Schalen mit Füllung.'],
  lt: ['Iš mūsų virtuvės', 'Iliustracija', 'Pasakiška iliustracija: virėjo rankos minko tešlą ant medinės lentos šalia dubenėlių su įdaru.'],
  hu: ['A konyhánkból', 'Illusztráció', 'Mesés illusztráció: a szakács keze tésztát gyúr egy fadeszkán, töltelékkel teli tálak mellett.'],
  cs: ['Z naší kuchyně', 'Ilustrace', 'Pohádková ilustrace kuchařových rukou hnětoucích těsto na dřevěném vále vedle misek s náplní.'],
  sk: ['Z našej kuchyne', 'Ilustrácia', 'Rozprávková ilustrácia kuchárových rúk miesiacich cesto na drevenej doske vedľa misiek s plnkou.']
};
export function initFooterFilm() {
  if (document.querySelector('#footer-film')) return;
  const footer = document.querySelector('.footer');
  if (!footer) return;
  const section = document.createElement('section');
  section.id = 'footer-film';
  section.className = 'footer-film footer-kitchen-art';
  section.dataset.noTranslate = '';
  section.dataset.visual = 'keyframe';
  section.innerHTML = '<figure class="footer-kitchen-figure"><img src="assets/footer-kitchen-art.webp?v=20261023-black-footer" width="1672" height="941" loading="lazy" decoding="async" alt=""><figcaption><span></span><small></small></figcaption></figure>';
  footer.before(section);
  function labels() {
    const [title, kind, alt] = COPY[getLanguage()] || COPY.pl;
    section.setAttribute('aria-label', title);
    section.querySelector('img').alt = alt;
    section.querySelector('figcaption span').textContent = title;
    section.querySelector('figcaption small').textContent = kind;
  }
  window.addEventListener('languagechange', labels);
  labels();
}
