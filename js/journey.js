import {getLanguage,t} from './i18n.js?v=20261023-marine';

const compactLabels={
  pl:['Wybierasz','Pakujemy','W drodze','Odbierasz'],
  en:['Choose','We pack','On the way','Collect'],
  de:['Auswählen','Verpacken','Unterwegs','Empfangen'],
  lt:['Renkiesi','Pakuojame','Kelyje','Atsiimi'],
  hu:['Választasz','Pakolunk','Úton','Átveszed'],
  cs:['Vybereš','Zabalíme','Na cestě','Převezmeš'],
  sk:['Vyberieš','Zabalíme','Na ceste','Prevezmeš']
};

/** A small four-stop timeline. Only runs while the delivery drawing is visible. */
export function initJourney(){
  const section=document.querySelector('.shipping-journey');
  if(!section)return;
  const steps=[...section.querySelectorAll('.journey-step')];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const button=section.querySelector('[data-journey-toggle]');
  let current=0,timer,visible=false,paused=false;
  const show=i=>{current=i;section.dataset.active=String(i);steps.forEach((step,n)=>{step.classList.toggle('is-current',n===i);step.classList.toggle('is-done',n<i);step.setAttribute('aria-current',n===i?'step':'false');});};
  const stop=()=>{clearTimeout(timer);timer=undefined;};
  const tick=()=>{stop();if(!visible||paused||reduce.matches||document.hidden)return;timer=setTimeout(()=>{show((current+1)%steps.length);tick();},2600);};
  const sync=()=>{section.classList.toggle('journey-still',paused||reduce.matches||!visible);const labels=compactLabels[getLanguage()]||compactLabels.pl;steps.forEach((step,i)=>{const label=step.querySelector('.journey-label-short');if(label&&label.textContent!==labels[i])label.textContent=labels[i];});button?.setAttribute('aria-pressed',String(paused));if(button){const label=t(paused?'Odtwórz animację':'Zatrzymaj animację');button.setAttribute('aria-label',label);button.title=label;}tick();};
  button?.addEventListener('click',()=>{paused=!paused;sync();});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.15}).observe(section);
  document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);
  window.addEventListener('languagechange',sync);
  show(0);sync();
}
