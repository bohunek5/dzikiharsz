import {getLanguage} from './i18n.js?v=20261023-motion';

const copy = {
  pl: ['DROGA DO HARSZU', 'Do zobaczenia nad Darginem.', 'Pokaż mapę Google', 'Wyznacz trasę', 'Mapa wczyta się po kliknięciu. Wtedy połączysz się z Google.', 'Mapa dojazdu do Dziki Harsz', 'Ukryj mapę'],
  en: ['THE WAY TO HARSZ', 'See you by Lake Dargin.', 'Show Google map', 'Get directions', 'The map loads when you click. This connects you to Google.', 'Directions to Dziki Harsz', 'Hide map'],
  de: ['DER WEG NACH HARSZ', 'Bis bald am Darginsee.', 'Google-Karte anzeigen', 'Route planen', 'Die Karte wird nach dem Klick geladen. Dabei wird eine Verbindung zu Google hergestellt.', 'Anfahrt zu Dziki Harsz', 'Karte ausblenden'],
  lt: ['KELIAS Į HARSZĄ', 'Iki pasimatymo prie Dargino ežero.', 'Rodyti „Google“ žemėlapį', 'Suplanuoti maršrutą', 'Žemėlapis įkeliamas paspaudus. Tada prisijungiama prie „Google“.', 'Kelias į „Dziki Harsz“', 'Slėpti žemėlapį'],
  hu: ['ÚT HARSZBA', 'Találkozunk a Dargin-tónál.', 'Google-térkép megjelenítése', 'Útvonaltervezés', 'A térkép kattintás után töltődik be, és kapcsolódik a Google-höz.', 'Útvonal a Dziki Harszhoz', 'Térkép elrejtése'],
  cs: ['CESTA DO HARSZU', 'Na viděnou u jezera Dargin.', 'Zobrazit mapu Google', 'Naplánovat trasu', 'Mapa se načte po kliknutí. Tím se připojíte ke Googlu.', 'Cesta do Dziki Harsz', 'Skrýt mapu'],
  sk: ['CESTA DO HARSZU', 'Dovidenia pri jazere Dargin.', 'Zobraziť mapu Google', 'Naplánovať trasu', 'Mapa sa načíta po kliknutí. Tým sa pripojíte ku Googlu.', 'Cesta do Dziki Harsz', 'Skryť mapu']
};

export function initContactMap() {
  const section = document.querySelector('#contact-map');
  if (!section) return;
  const panel = section.querySelector('.contact-map-panel');
  const toggle = section.querySelector('[data-map-toggle]');
  let frame;
  const update = () => {
    const labels = copy[getLanguage()] || copy.pl;
    section.querySelectorAll('[data-map-copy]').forEach(el => { el.textContent = labels[Number(el.dataset.mapCopy)]; });
    toggle.textContent = labels[frame ? 6 : 2];
    toggle.setAttribute('aria-expanded', String(Boolean(frame)));
    if (frame) frame.title = labels[5];
  };
  toggle.addEventListener('click', () => {
    if (frame) { frame.remove(); frame = null; }
    else {
      frame = document.createElement('iframe');
      frame.src = 'https://maps.google.com/maps?q=Dziki%20Harsz%2C%20Nowy%20Harsz%2084%2C%20Polska&z=14&output=embed';
      frame.referrerPolicy = 'no-referrer-when-downgrade';
      frame.allowFullscreen = true;
      panel.append(frame);
    }
    panel.classList.toggle('is-loaded', Boolean(frame));
    update();
  });
  window.addEventListener('languagechange', update);
  update();
}
