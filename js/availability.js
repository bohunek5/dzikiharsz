import { getLanguage, t } from './i18n.js?v=20261023-menu';

// The catalogue is the source of truth. A missing date never means in stock.
// No year is added: the original product notices only specify 5 November.
const COPY = {
  pl: { title:'Pierogi i uszka od 5 listopada', plan:'Zaplanuj paczkę już teraz. Zapisanie listy nie rezerwuje produktów.', date:'Od 5 listopada', available:'Dostępne od 5 listopada', ask:'Zapytaj o dostępność', productPlan:'Możesz już zapisać produkt w swojej paczce. Lista nie jest rezerwacją.', confirm:'Przed zamówieniem potwierdź dostępność w kontakcie z nami.' },
  en: { title:'Pierogi and uszka from 5 November', plan:'Plan your parcel now. Saving a list does not reserve any products.', date:'From 5 November', available:'Available from 5 November', ask:'Ask about availability', productPlan:'You can already save this product to your parcel. Your list is not a reservation.', confirm:'Please contact us to confirm availability before ordering.' },
  de: { title:'Pierogi und Uszka ab 5. November', plan:'Stelle jetzt dein Paket zusammen. Eine gespeicherte Liste reserviert keine Produkte.', date:'Ab 5. November', available:'Erhältlich ab 5. November', ask:'Verfügbarkeit anfragen', productPlan:'Du kannst das Produkt schon für dein Paket vormerken. Die Liste ist keine Reservierung.', confirm:'Bitte frage vor der Bestellung bei uns nach der Verfügbarkeit.' },
  lt: { title:'Virtiniai ir auselės nuo lapkričio 5 d.', plan:'Jau dabar suplanuokite savo siuntinį. Išsaugotas sąrašas nėra produktų rezervacija.', date:'Nuo lapkričio 5 d.', available:'Bus nuo lapkričio 5 d.', ask:'Pasiteiraukite, ar turime', productPlan:'Jau galite įtraukti šį produktą į savo siuntinį. Sąrašas nėra rezervacija.', confirm:'Prieš užsakydami susisiekite su mumis ir pasitikslinkite, ar turime.' },
  hu: { title:'Pierogi és uszka november 5-től', plan:'Állítsd össze a csomagodat már most. A mentett lista nem foglalja le a termékeket.', date:'November 5-től', available:'November 5-től elérhető', ask:'Érdeklődj a készletről', productPlan:'A terméket már most hozzáadhatod a csomagodhoz. A lista nem jelent foglalást.', confirm:'Rendelés előtt érdeklődj nálunk a termék elérhetőségéről.' },
  cs: { title:'Pirohy a uszka od 5. listopadu', plan:'Sestavte si balíček už teď. Uložený seznam produkty nerezervuje.', date:'Od 5. listopadu', available:'Dostupné od 5. listopadu', ask:'Zeptejte se na dostupnost', productPlan:'Produkt si můžete už teď přidat do balíčku. Seznam není rezervací.', confirm:'Před objednáním nás kontaktujte a ověřte si dostupnost.' },
  sk: { title:'Pirohy a ušká od 5. novembra', plan:'Zostavte si balíček už teraz. Uložený zoznam produkty nerezervuje.', date:'Od 5. novembra', available:'Dostupné od 5. novembra', ask:'Opýtajte sa na dostupnosť', productPlan:'Produkt si môžete už teraz pridať do balíčka. Zoznam nie je rezerváciou.', confirm:'Pred objednaním nás kontaktujte a overte si dostupnosť.' }
};

const upcoming = product => product?.category === 'pierogi' && /^Dostępne od 5[./]11$/.test(product.availability || '');
let started = false;

export async function initAvailability() {
  if(started)return;
  started=true;
  let products;
  try {
    const response=await fetch(new URL('../data/products.json',import.meta.url));
    if(!response.ok)return;
    const value=await response.json();
    if(!Array.isArray(value))return;
    products=new Map(value.map(product=>[product.slug,product]));
  } catch { return; } // Existing catalogue dates remain visible if the request fails.

  let copy=COPY[getLanguage()]||COPY.pl;
  const observer=new MutationObserver(records=>{
    // Storefront replaces cards and modal contents. Translation-only text changes
    // do not need another pass, and our own additions happen while disconnected.
    if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1)))decorate();
  });

  function observe(){
    ['#product-grid','#product-detail','#product-page'].forEach(selector=>{
      const node=document.querySelector(selector);
      if(node)observer.observe(node,{childList:true,subtree:true});
    });
  }
  function slugFromLink(link){
    if(!link)return null;
    const url=new URL(link.href,location.href);
    return url.searchParams.get('id')||decodeURIComponent(url.pathname.split('/').pop()||'').replace(/\.html$/,'');
  }
  function cardStatus(card,product){
    const dated=upcoming(product);
    let note=card.querySelector('[data-card-availability]');
    if(!note){
      note=document.createElement(dated?'span':'a');
      note.dataset.cardAvailability=product.slug;note.dataset.noTranslate='';
      note.innerHTML='<span class="availability-dot" aria-hidden="true"></span><span></span>';
      const anchor=card.querySelector('.product-meta')||card.querySelector(':scope > a');
      if(anchor)anchor.after(note);else card.append(note);
    }
    note.className=`card-availability ${dated?'availability-upcoming':'availability-confirm'}`;
    note.lastElementChild.textContent=dated?copy.date:copy.ask;
    if(!dated){note.href='kontakt.html';note.setAttribute('aria-label',`${copy.ask}: ${t(product.name)}`);}
    // Replace the old, tiny photo badge with one consistent readable status.
    if(dated){const badge=card.querySelector('.product-badge');if(badge){badge.hidden=true;badge.dataset.availabilityReplaced='';}}
  }
  function detailStatus(content,product){
    const dated=upcoming(product);
    let note=content.querySelector('[data-product-availability]');
    if(!note){
      note=document.createElement('div');note.dataset.productAvailability=product.slug;note.dataset.noTranslate='';
      note.innerHTML='<span class="availability-dot" aria-hidden="true"></span><div><strong></strong><p></p></div>';
      const price=content.querySelector('.detail-price');
      if(price)price.before(note);else content.prepend(note);
    }
    note.className=`product-availability ${dated?'availability-upcoming':'availability-confirm'}`;
    const heading=note.querySelector('strong');heading.textContent=dated?copy.available:copy.ask;
    const paragraph=note.querySelector('p');paragraph.textContent=dated?copy.productPlan:copy.confirm;
    if(!dated&&!note.querySelector('.availability-contact')){
      let link=heading.closest('a');
      if(!link){link=document.createElement('a');heading.replaceWith(link);link.append(heading);}
      link.href='kontakt.html';link.className='availability-contact';
    }
    const fact=content.querySelector('.detail-facts > div:first-child dd');
    if(fact){fact.dataset.noTranslate='';fact.textContent=dated?copy.available:copy.ask;}
  }
  function decorate(){
    observer.disconnect();
    try{
      copy=COPY[getLanguage()]||COPY.pl;
      const shop=document.querySelector('.shop-full');
      if(shop){
        let banner=shop.querySelector('[data-shop-availability]');
        if(!banner){
          banner=document.createElement('aside');banner.className='shop-availability';banner.dataset.shopAvailability='';banner.dataset.noTranslate='';banner.innerHTML='<strong></strong><p></p>';
          shop.querySelector('.shop-toolbar')?.before(banner);
        }
        banner.hidden=![...products.values()].some(upcoming);
        banner.querySelector('strong').textContent=copy.title;banner.querySelector('p').textContent=copy.plan;
      }
      document.querySelectorAll('.product-card[data-slug]').forEach(card=>{const product=products.get(card.dataset.slug);if(product)cardStatus(card,product);});
      document.querySelectorAll('.related-card').forEach(card=>{const product=products.get(slugFromLink(card.querySelector('a')));if(product)cardStatus(card,product);});
      document.querySelectorAll('#product-detail .detail-content,#product-page .detail-content').forEach(content=>{
        const page=content.closest('#product-page');
        const slug=page?.dataset.productSlug||content.querySelector('[data-add]')?.dataset.add||new URLSearchParams(location.search).get('id');
        const product=products.get(slug);if(product)detailStatus(content,product);
      });
    } finally { observe(); }
  }
  window.addEventListener('languagechange',decorate);
  decorate();
}
