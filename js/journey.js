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
  const sync=()=>{section.classList.toggle('journey-still',paused||reduce.matches||!visible);button?.setAttribute('aria-pressed',String(paused));if(button){button.textContent=paused?'Odtwórz animację':'Zatrzymaj animację';}tick();};
  button?.addEventListener('click',()=>{paused=!paused;sync();});
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.15}).observe(section);
  document.addEventListener('visibilitychange',sync);reduce.addEventListener('change',sync);
  show(0);sync();
}
