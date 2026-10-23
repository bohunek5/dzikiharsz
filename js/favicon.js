/** Tiny cached frames: no canvas rendering, requests or layout work per tick. */
export async function initFavicon() {
  const icon = document.querySelector('link[rel="icon"]');
  if (!icon) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const source = new Image();
  source.src = 'assets/favicon-wheel.svg';
  try { await source.decode(); } catch { return; }
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const frames = [];
  // Four small cached images per second, one gentle turn in sixteen seconds.
  for (let i = 0; i < 64; i++) {
    ctx.clearRect(0, 0, 32, 32);
    ctx.save();
    ctx.translate(16, 16);
    ctx.rotate(i / 64 * Math.PI * 2);
    ctx.drawImage(source, -15.5, -15.5, 31, 31);
    ctx.restore();
    frames.push(canvas.toDataURL('image/png'));
  }
  icon.type = 'image/png';
  icon.sizes = '32x32';
  let timer = 0, frame = 0;
  const paint = () => { icon.href = frames[frame++ % frames.length]; };
  const sync = () => {
    clearInterval(timer);
    timer = 0;
    if (reduced.matches || navigator.connection?.saveData) {
      frame = 0;
      paint();
    } else if (!document.hidden) {
      paint();
      timer = setInterval(paint, 250);
    }
  };
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  addEventListener('pagehide', () => { clearInterval(timer); timer = 0; });
  addEventListener('pageshow', sync);
  sync();
}
