import { t, getLanguage } from './i18n.js?v=20261023-motion';
const $ = (s, parent = document) => parent.querySelector(s);
const $$ = (s, parent = document) => [...parent.querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => new Intl.NumberFormat(globalThis.document?.documentElement.lang || 'pl', { style:'currency', currency:'PLN' }).format(n);
const norm = text => text.toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ł/g,'l');
const bagKey = 'dziki-harsz-paczka-v1';
const state = { products:[], stories:{}, category:'all', search:'', sort:'featured', bag:{}, storage:true };
let timer;
export function toast(message) {
  clearTimeout(timer);
  const modal = $('dialog[open] [data-status]');
  if (modal) { modal.hidden = false; modal.textContent = message; timer = setTimeout(()=>{modal.hidden=true;modal.textContent='';},3500); return; }
  const node = $('#toast'); node.textContent=message; node.classList.add('visible');
  timer = setTimeout(()=>node.classList.remove('visible'),3500);
}
const find = slug => state.products.find(p=>p.slug===slug);
const portion = p => p.portion_pieces ? `${p.portion_pieces} sztuk / porcja` : p.slug==='voucher-portowy-9' ? 'ważny 12 miesięcy' : p.food ? 'szczegóły w sklepie' : '1 sztuka';
const productURL = p => `${encodeURIComponent(p.slug)}.html`;
function group(p) { return p.category==='spizarnia' ? 'Do chleba' : p.category==='harsz' ? 'Trochę Harszu' : /sandaczem|mietusem|szczupakiem/.test(p.slug) ? 'Smaki z rybą' : /kaczka|miesem/.test(p.slug) ? 'Z naszej kuchni' : 'Znajome klasyki'; }
function entries(){return Object.entries(state.bag).map(([slug,count])=>({product:find(slug),count})).filter(x=>x.product&&x.count>0);}
function total(){return entries().reduce((sum,{product,count})=>sum+product.price*count,0);}
function save(){try{localStorage.setItem(bagKey,JSON.stringify(state.bag));}catch{state.storage=false;}}
function restore(){try{const saved=JSON.parse(localStorage.getItem(bagKey)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))for(const [slug,count] of Object.entries(saved))if(find(slug)&&Number.isSafeInteger(count)&&count>0)state.bag[slug]=Math.min(99,count);}catch{state.bag={};}}
function add(slug,quantity=1){const p=find(slug);if(!p)return;const current=state.bag[slug]||0;if(current>=99){toast('Maksymalnie 99 sztuk jednego produktu.');return;}const count=Number.isSafeInteger(quantity)?Math.max(1,Math.min(99,quantity)):1;state.bag[slug]=Math.min(99,current+count);save();renderBag();renderOrder();toast(`Zapisano na liście: ${p.name}`);}

function renderProducts(){
  const grid=$('#product-grid');if(!grid)return;
  let products=state.products.filter(p=>(state.category==='all'||p.category===state.category)&&norm(`${p.name} ${p.description} ${t(p.name)} ${t(p.description)}`).includes(norm(state.search)));
  if(state.sort==='price-asc')products.sort((a,b)=>a.price-b.price);
  if(state.sort==='price-desc')products.sort((a,b)=>b.price-a.price);
  if(state.sort==='name')products.sort((a,b)=>t(a.name).localeCompare(t(b.name),getLanguage()));
  const count=$('#result-count');if(count)count.textContent=`W menu: ${products.length} ${products.length===1?'produkt':products.length>=2&&products.length<=4?'produkty':'produktów'}`;
  if(grid.dataset.limit&&state.category==='all'&&!state.search)products=products.slice(0,Number(grid.dataset.limit));
  grid.innerHTML=productGridMarkup(products);
  $$('[data-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.category===state.category)));
}

export function productGridMarkup(products){return products.length?products.map((p,index)=>`<article class="product-card" data-slug="${p.slug}"><div class="product-photo-wrap"><a class="product-photo" href="${productURL(p)}" aria-label="Zobacz: ${esc(p.name)}"><img src="${p.image}" alt="${esc(p.name)}" width="640" height="600" loading="${index<3?'eager':'lazy'}"${index===0?' fetchpriority="high"':''} decoding="async">${p.imageAlt?`<img class="photo-alt" src="${p.imageAlt}" alt="" width="640" height="600" loading="lazy" decoding="async" aria-hidden="true">`:''}${p.availability?`<span class="product-badge">${esc(p.availability)}</span>`:p.slug==='voucher-portowy-9'?'<span class="product-badge special">POMYSŁ NA PREZENT</span>':''}</a></div><div class="product-meta"><span>${group(p)}</span><span>${portion(p)}</span></div><h3><a href="${productURL(p)}">${esc(p.name)}</a></h3><p class="product-description">${esc(p.description)}</p><button class="quick-view" type="button" data-product="${p.slug}" aria-label="Szybki podgląd: ${esc(p.name)}">Szybki podgląd</button><div class="product-actions"><span class="price">${money(p.price)}<small>/ ${p.portion_pieces?'porcja':p.food?'produkt':'szt.'}</small></span><button class="add-button" data-add="${p.slug}" aria-label="Dodaj do swojej paczki: ${esc(p.name)}">+</button></div></article>`).join(''):'<div class="empty-state"><p>Nie znaleźliśmy takiego smaku.</p><button class="text-link" data-reset-filters>Pokaż całe menu</button></div>';}
function detailMarkup(p, standalone=false){return `<div class="product-detail-grid"><div class="detail-visual"><img class="detail-main-image" src="${p.image}" alt="${esc(p.name)}" width="900" height="900">${p.imageAlt?`<div class="detail-thumbnails" role="group" aria-label="Zdjęcia produktu"><button data-photo="${p.image}" aria-label="Pierwsze zdjęcie" aria-pressed="true"><img src="${p.image}" alt=""></button><button data-photo="${p.imageAlt}" aria-label="Drugie zdjęcie" aria-pressed="false"><img src="${p.imageAlt}" alt=""></button></div>`:''}</div><div class="detail-content"><a class="eyebrow" href="sklep.html">${group(p)} · DZIKI HARSZ</a><${standalone?'h1':'h2'} id="${standalone?'product-page-title':'product-dialog-title'}">${esc(p.name)}</${standalone?'h1':'h2'}><p>${esc(p.description)}</p><div class="detail-price">${money(p.price)}<small>${portion(p)}</small></div><button class="button button-dark" data-add="${p.slug}">Dodaj do paczki <span aria-hidden="true">+</span></button><p class="dialog-status" data-status role="status" aria-live="polite" hidden></p>${standalone?'<a class="text-link" href="zamowienie.html">Zobacz moje zamówienie </a>':`<a class="text-link" href="${productURL(p)}">Pełna karta produktu </a>`}<dl class="detail-facts"><div><dt>Dostępność</dt><dd>${p.availability||'Sprawdź dostępność przy zamówieniu.'}</dd></div>${p.food?'<div><dt>Dostawa jedzenia</dt><dd>Opakowanie termiczne i wkład chłodzący. Koszt i sposób dostawy przy zamówieniu.</dd></div><div><dt>Skład, alergeny i przechowywanie</dt><dd>Zapytaj nas przed zakupem: <a href="tel:+48722277527">722 277 527</a> lub <a href="kontakt.html">przejdź do kontaktu</a>.</dd></div>':''}<div><dt>Dobrze wiedzieć</dt><dd><a href="regulamin.html">Warunki zamawiania</a> · <a href="polityka-prywatnosci.html">Prywatność</a></dd></div></dl></div></div>`;}
function showProduct(slug){const p=find(slug);if(!p)return;$('#product-detail').innerHTML=detailMarkup(p);if(!$('#product-dialog').open)$('#product-dialog').showModal();}
function storyMarkup(p,stories=state.stories){const s=stories[p.slug];if(!s)return '';return `<section class="product-stories"><h2>${p.food?'O tym smaku':'O tym produkcie'}</h2>${s.intro.map(text=>`<p>${esc(text)}</p>`).join('')}<ul class="product-highlights">${s.highlights.map(text=>`<li>${esc(text)}</li>`).join('')}</ul><div class="product-serving"><h3>${p.food?'Pomysł na podanie':'Pomysł na wykorzystanie'}</h3><p>${esc(s.serving)}</p></div><p class="product-occasion">${esc(s.occasion)}</p></section>`;}
function relatedMarkup(p,products=state.products){const related=products.filter(x=>x.slug!==p.slug).sort((a,b)=>Number(b.category===p.category)-Number(a.category===p.category)).slice(0,3);return `<section class="related-products"><h2>Dobierz do swojej paczki</h2><div class="related-grid">${related.map(x=>`<article class="related-card"><a href="${productURL(x)}"><img src="${x.image}" alt="${esc(x.name)}" width="450" height="375" loading="lazy"><h3>${esc(x.name)}</h3></a><p>${money(x.price)}</p></article>`).join('')}</div></section>`;}
/** The browser and SEO build use exactly the same product-card markup. */
export function productPageMarkup(p,products,stories){
  const quantity='<div class="detail-quantity"><span>Ilość</span><div class="quantity-picker"><button data-detail-qty="-1" aria-label="Zmniejsz ilość">−</button><input type="number" min="1" max="99" step="1" value="1" inputmode="numeric" aria-label="Ilość"><button data-detail-qty="1" aria-label="Zwiększ ilość">+</button></div></div>';
  return detailMarkup(p,true)
    .replace('<button class="button button-dark" data-add=',quantity+'<button class="button button-dark" data-add=')
    .replace(/<\/div><\/div>$/,storyMarkup(p,stories)+'</div></div>')+relatedMarkup(p,products);
}
function renderProductPage(){
  const parent=$('#product-page');if(!parent)return;
  const slug=parent.dataset.productSlug||new URLSearchParams(location.search).get('id'),p=find(slug);
  if(!p){parent.innerHTML='<div class="empty-state"><h1>Ten smak jeszcze tu nie dotarł.</h1><a class="button button-dark" href="sklep.html">Wróć do sklepu</a></div>';return;}
  if(parent.dataset.prerendered!=='true')parent.innerHTML=productPageMarkup(p,state.products,state.stories);
  // Legacy query links remain usable; their preferred URL is the static card.
  if(!document.querySelector('link[rel="canonical"]')){
    const canonical=document.createElement('link');canonical.rel='canonical';
    canonical.href=new URL(productURL(p),'https://bohunek5.github.io/dzikiharsz/').href;document.head.append(canonical);
  }
  if(parent.dataset.prerendered!=='true'){
    document.title=`${p.name} — Dziki Harsz`;
    document.querySelector('meta[name="description"]')?.setAttribute('content',p.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content',document.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content',p.description);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content',document.querySelector('link[rel="canonical"]').href);
  }
}

function row(p,count){return `<article class="bag-item"><a href="${productURL(p)}"><img src="${p.image}" alt="${esc(p.name)}" width="80" height="80"></a><div><h3><a href="${productURL(p)}">${esc(p.name)}</a></h3><small>${money(p.price)} · ${p.availability||portion(p)}</small><div class="quantity-line"><div class="quantity-picker"><button data-quantity="${p.slug}" data-delta="-1" aria-label="Zmniejsz ilość: ${esc(p.name)}">−</button><span aria-label="Ilość">${count}</span><button data-quantity="${p.slug}" data-delta="1" aria-label="Zwiększ ilość: ${esc(p.name)}" ${count===99?'disabled':''}>+</button></div><button class="remove-item" data-remove="${p.slug}" aria-label="Usuń z paczki: ${esc(p.name)}">Usuń</button></div></div></article>`;}
function renderBag(){const list=entries();const count=list.reduce((n,e)=>n+e.count,0);$('#bag-count').textContent=count;$('#open-bag').setAttribute('aria-label',`Twoja paczka: ${count} produktów`);if(!list.length){$('#bag-items').innerHTML='<div class="empty-bag"><h3>Coś dobrego<br> jeszcze tu trafi.</h3><p>Zapisz smaki, które chcesz zabrać do domu.</p><a class="button button-dark" href="sklep.html">Wybierz z menu</a></div>';$('#bag-summary').innerHTML='';return;}$('#bag-items').innerHTML=list.map(({product,count})=>row(product,count)).join('');$('#bag-summary').innerHTML=`<div class="bag-summary"><div class="bag-total"><span>Wartość produktów</span><strong>${money(total())}</strong></div><p>Bez kosztów dostawy. Ostateczne ceny i dostępność potwierdzisz przy zamówieniu.</p><a class="button button-dark" href="zamowienie.html">Przejdź do zamówienia </a><button class="text-link" id="copy-list">Skopiuj listę produktów</button></div>`;}
function renderOrder(){const list=$('#order-items');if(!list)return;const data=entries();list.innerHTML=data.length?data.map(({product,count})=>row(product,count)).join(''):'<div class="empty-bag"><h3>Najpierw coś wybierz.</h3><p>Twoja paczka czeka na pierwsze smaki.</p><a class="button button-dark" href="sklep.html">Idę do sklepu</a></div>';$('#order-total').textContent=money(total());$('#order-form').hidden=!data.length;$('#order-empty-note').hidden=!!data.length;}
async function copyList(){const text=t('Moja paczka z Dzikiego Harszu')+'\n\n'+entries().map(({product,count})=>`${count} × ${t(product.name)} — ${money(product.price*count)}`).join('\n')+`\n\n${t('Wartość produktów:')} ${money(total())}. ${t('Dostawa dodatkowo.')}\n${t('To lista zakupów, nie złożone zamówienie.')}`;try{await navigator.clipboard.writeText(text);toast('Lista skopiowana. Smacznych planów!');}catch{download(text,'moja-paczka-dziki-harsz.txt');toast('Pobrano listę produktów.');}}
function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function setupOrder(){const form=$('#order-form');if(!form)return;form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity()||!entries().length)return;const data=new FormData(form);const receipt=`${t('SZKIC ZAMÓWIENIA — DZIKI HARSZ')}\n${t('Nie wysłano zamówienia. Nie pobrano płatności.')}\n\n${entries().map(({product,count})=>`${count} × ${t(product.name)} — ${money(product.price*count)}`).join('\n')}\n\n${t('Wartość produktów:')} ${money(total())}\n${t('Koszt dostawy: do ustalenia')}\n\n${t('Imię i nazwisko')}: ${data.get('name')}\n${t('E-mail')}: ${data.get('email')}\n${t('Telefon')}: ${data.get('phone')}\n${t('Adres')}: ${data.get('address')}\n${t('Kod i miejscowość')}: ${data.get('postal')} ${data.get('city')}\n${t('Uwagi')}: ${data.get('note')||''}`;download(receipt,'dziki-harsz-szkic-zamowienia.txt');const status=$('#order-status');status.hidden=false;status.textContent='Szkic zamówienia został pobrany. Nic nie zostało wysłane ani opłacone.';status.focus();});}

function events(){
 document.addEventListener('click',event=>{const b=event.target.closest('button,a');if(!b)return;
  if(b.dataset.product)showProduct(b.dataset.product);
  if(b.dataset.add){const input=b.closest('#product-page')?.querySelector('.detail-quantity input');add(b.dataset.add,input?Number(input.value):1);}
  if(b.dataset.detailQty){const input=$('input',b.closest('.detail-quantity'));input.value=Math.min(99,Math.max(1,(Number(input.value)||1)+Number(b.dataset.detailQty)));}
  if(b.hasAttribute('data-close'))b.closest('dialog').close();
  if(b.dataset.category){state.category=b.dataset.category;renderProducts();}
  if(b.hasAttribute('data-reset-filters')){state.search='';state.category='all';state.sort='featured';if($('#product-search'))$('#product-search').value='';if($('#product-sort'))$('#product-sort').value='featured';renderProducts();}
  if(b.dataset.photo){const context=b.closest('.product-detail-grid');$('.detail-main-image',context).src=b.dataset.photo;$$('[data-photo]',context).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}
  if(b.dataset.quantity){const slug=b.dataset.quantity;state.bag[slug]=Math.min(99,Math.max(0,(state.bag[slug]||0)+Number(b.dataset.delta)));if(!state.bag[slug])delete state.bag[slug];const inDialog=!!b.closest('dialog');save();renderBag();renderOrder();const context=inDialog?$('#bag-dialog'):$('#order-items');$(`[data-quantity="${slug}"][data-delta="${b.dataset.delta}"]`,context)?.focus({preventScroll:true});}
  if(b.dataset.remove){const inDialog=!!b.closest('dialog');delete state.bag[b.dataset.remove];save();renderBag();renderOrder();const context=inDialog?$('#bag-dialog'):$('#order-items');$('button,a',context)?.focus({preventScroll:true});}
  if(b.id==='copy-list')copyList();
 });
 $('#open-bag').addEventListener('click',()=>{renderBag();$('#bag-dialog').showModal();});
 $$('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}));
 $('#product-search')?.addEventListener('input',e=>{state.search=e.target.value.trim();renderProducts();});
 $('#product-sort')?.addEventListener('change',e=>{state.sort=e.target.value;renderProducts();});
 $('#clear-search')?.addEventListener('click',()=>{state.search='';$('#product-search').value='';renderProducts();$('#product-search').focus();});
 $('.search-toggle').addEventListener('click',()=>{closeMenu();if(!$('#search-row')){location.href='sklep.html?szukaj=1';return;}$('#search-row').hidden=false;$('#sklep').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});$('#product-search').focus({preventScroll:true});});
 $('.menu-toggle').addEventListener('click',()=>{const isOpen=!$('#header').classList.contains('menu-open');setMenu(isOpen);if(isOpen)$('.main-nav a').focus({preventScroll:true});});
 $$('.main-nav a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#header').classList.contains('menu-open')){closeMenu();$('.menu-toggle').focus();}if(e.key==='Tab'&&$('#header').classList.contains('menu-open')){const controls=$$('#header a,#header button,#header select').filter(x=>x.getClientRects().length);const first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
 window.addEventListener('resize',()=>{if(innerWidth>1100)closeMenu();});
 window.addEventListener('languagechange',()=>{renderProducts();renderBag();renderOrder();});
 setupOrder();
}
function setMenu(open){$('#header').classList.toggle('menu-open',open);$('.menu-toggle').setAttribute('aria-expanded',String(open));$('.menu-toggle').setAttribute('aria-label',open?'Zamknij menu':'Otwórz menu');$('.menu-toggle svg path').setAttribute('d',open?'M5 5l14 14M5 19L19 5':'M3 8h18M3 16h18');document.body.classList.toggle('menu-is-open',open);}
function closeMenu(){setMenu(false);}

export async function initStorefront(){
  events();
  try{
    const response=await fetch('data/products.json');
    if(!response.ok)throw new Error(`Catalog ${response.status}`);
    state.products=await response.json();
    if($('#product-page')){
      const storyResponse=await fetch('data/product-stories.json');
      if(storyResponse.ok)state.stories=await storyResponse.json();
    }
    restore();renderProducts();renderBag();renderProductPage();renderOrder();
    const params=new URLSearchParams(location.search);
    if(params.get('produkt'))showProduct(params.get('produkt'));
    if(params.has('szukaj')&&$('#search-row')){$('#search-row').hidden=false;$('#product-search').focus();}
  }catch(error){
    const grid=$('#product-grid')||$('#product-page');
    if(grid)grid.innerHTML='<div class="empty-state"><p>Nie udało się wczytać menu.</p><a class="button button-dark" href="sklep.html">Spróbuj ponownie</a></div>';
    window.__catalogError=error.message;console.error(error.message);
  }
}
