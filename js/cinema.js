const $ = s => document.querySelector(s);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const clamp = n => Math.max(0,Math.min(1,n));
export function initCinema(){
  setupFilm($('#hero-film'),$('#film-control'),$('#film-symbol'),$('#film-label'));
  setupFilm($('#place-film'),$('#place-film-control'),$('#place-film-symbol'),$('#place-film-label'));
  let requested=false,last=-1;
  const section=$('#w-srodku');
  if(section)new IntersectionObserver(([entry])=>section.classList.toggle('is-visible',entry.isIntersecting),{threshold:0}).observe(section);
  const photos=section?[...section.querySelectorAll('.process-photo')]:[];
  const captions=section?[...section.querySelectorAll('.process-caption')]:[];
  const progress=section?.querySelector('#scene-progress');
  const render=()=>{
    requested=false;
    $('#header')?.classList.toggle('is-scrolled',scrollY>40||document.body.classList.contains('inner-page'));
    if(!section)return;
    const rect=section.getBoundingClientRect();
    if(!reduced.matches&&(rect.bottom<0||rect.top>innerHeight))return;
    const p=reduced.matches?1:clamp(-rect.top/Math.max(1,rect.height-innerHeight));
    const scene=p<.16?0:p<.32?1:p<.49?2:p<.65?3:p<.84?4:5;
    const isPierog=scene>=4;
    section.style.setProperty('--process-photo-opacity',isPierog?'0':'1');
    section.style.setProperty('--pierog-opacity',isPierog?'1':'0');
    // The closed dumpling and the cut faces are mutually exclusive frames.
    // Compress the whole silhouette slightly, then reveal both halves in one paint.
    const split=p>=.84;
    const compression=clamp((p-.80)/.04);
    const opening=clamp((p-.84)/.13);
    const smooth=opening*opening*(3-2*opening);
    section.dataset.dumpling=split?'split':'whole';
    section.style.setProperty('--whole-opacity',split?'0':'1');
    section.style.setProperty('--split-opacity',split?'1':'0');
    section.style.setProperty('--whole-scale-x',String(1-compression*.035));
    section.style.setProperty('--whole-scale-y',String(1+compression*.012));
    section.style.setProperty('--split-left',`${3.4-smooth*5.4}%`);
    section.style.setProperty('--split-right',`${-3.4+smooth*5.4}%`);
    section.style.setProperty('--split-rotation',`${smooth*3}deg`);
    if(progress)progress.style.width=`${p*100}%`;
    if(scene!==last){
      photos.forEach((e,i)=>e.classList.toggle('active',i===scene));
      captions.forEach((e,i)=>{e.classList.toggle('active',i===scene);e.setAttribute('aria-hidden',String(!reduced.matches&&i!==scene));});
      section.dataset.scene=scene;
      last=scene;
    }
  };
  const schedule=()=>{if(!requested){requested=true;requestAnimationFrame(render);}};
  addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',()=>{last=-1;schedule();});
  window.__renderCinema=render;render();
}

function setupFilm(video,button,symbol,label){
  if(!video||!button)return;
  let userPaused=false,visible=false;
  const update=()=>{symbol.textContent=video.paused?'▶':'Ⅱ';label.textContent=video.paused?'Odtwórz film':'Zatrzymaj film';button.setAttribute('aria-label',label.textContent);};
  const play=async()=>{if(!video.getAttribute('src')){video.src=video.dataset.src;video.load();}try{await video.play();}catch{}update();};
  const canPlay=()=>!userPaused&&!reduced.matches&&!navigator.connection?.saveData&&!document.hidden;
  button.addEventListener('click',()=>{if(video.paused){userPaused=false;play();}else{userPaused=true;video.pause();}});
  video.addEventListener('play',update);video.addEventListener('pause',update);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible)video.pause();else if(canPlay())play();},{threshold:.12}).observe(video);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)video.pause();else if(visible&&canPlay())play();});
  reduced.addEventListener('change',()=>{if(reduced.matches)video.pause();});
}
