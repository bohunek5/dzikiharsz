import { initShell } from './js/shell.js';
import { initStorefront } from './js/storefront.js';
import { initCinema } from './js/cinema.js';
import { initI18n } from './js/i18n.js';
import { initJourney } from './js/journey.js';
import { initFooterFilm } from './js/footer-film.js';
import { initAvailability } from './js/availability.js';

initShell();
await initStorefront();
initCinema();
initJourney();
await initI18n();
await initAvailability();
initFooterFilm();
await document.fonts.ready;
window.__ready = true;
