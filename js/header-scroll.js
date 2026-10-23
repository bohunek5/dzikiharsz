/** Directional hysteresis: two deliberate upward samples restore the full mark.
 * Only the fixed bar changes height, never the page's reserved header spacing. */
export function createHeaderScrollState(initialY = 0) {
  let previous = Math.max(0, initialY), direction = 0, distance = 0, samples = 0;
  let compact = previous > 72;
  return (position, locked = false) => {
    const y = Math.max(0, position), delta = y - previous;
    previous = y;
    if (y < 24) {
      compact = false;
      direction = distance = samples = 0;
    } else if (locked) {
      direction = distance = samples = 0;
    } else if (Math.abs(delta) >= 4) {
      const next = Math.sign(delta);
      if (next !== direction) { direction = next; distance = samples = 0; }
      distance += Math.abs(delta);
      samples++;
      if (direction < 0 && samples >= 2 && distance >= 64) compact = false;
      if (direction > 0 && y > 72 && distance >= 40) compact = true;
    }
    return compact;
  };
}
