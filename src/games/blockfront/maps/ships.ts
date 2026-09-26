import type { BlockRef } from '@platform';
import { box, disc, dist, hash, slab, stairs, type Canvas } from './build';

/**
 * The ships of Mos Blockley, homages rather than anyone's in particular, block-built and nose
 * west (-x) in their own coordinates (put them on a `Place` to turn them), standing on the floor
 * at y (the feet level): the battered saucer freighter in the docking bay, the Rebels' X-winged
 * fighters, the Empire's folded-wing shuttle and its twin-panelled fighter, and the wedge of a
 * star destroyer lying half buried out in the dunes.
 */

/**
 * The saucer freighter: a round hull (its middle `(0.5, 0.5)`, 7.5 across the radius) thick in
 * the middle and thin at the rim, on landing legs a block high; two cargo prongs out front with a
 * slot between them, the cockpit tube off the starboard side (north, as built), the engine glow
 * round the back, a gun turret and a sensor dish on top. A ramp comes down to starboard behind the
 * cockpit, and its back is walkable, in half steps, from the rim to the turret.
 */
export function freighter(c: Canvas, y: number) {
  const R = 7.5;
  const topAt = (d: number) => 5.2 - 2.4 * (d / R) ** 2;
  disc(0.5, 0.5, R, (x, z, d) => {
    const bottom = d < 6 ? 1 : 2;
    const t = topAt(d);
    const full = Math.floor(t);
    const rear = x >= 3 && d > 6.1;
    for (let k = bottom; k < full; k++) c.set(x, y + k, z, rear && k === 2 ? 'engine_glow' : k === bottom && d > 5 ? 'hull_dark' : 'hull');
    if (t - full >= 0.5) c.set(x, y + full, z, slab('hull'));
    else if (rear && full === 2) c.set(x, y + 2, z, 'engine_glow');
    // Panel lines on top: a darker ring, and the spokes of the hull's plating.
    const spoke = Math.abs(x - z) <= 0 || Math.abs(x + z - 1) <= 0;
    if ((d > 3 && d < 3.8) || (spoke && d > 2 && d < 6)) {
      const b = c.get(x, y + full - 1, z);
      if (b === 'hull' && t - full < 0.5) c.set(x, y + full - 1, z, 'hull_dark');
    }
  });
  // The prongs, and the slot between them.
  for (const side of [-1, 1])
    for (let x = -12; x <= -6; x++)
      for (let w = 2; w <= 4; w++) {
        const z = side * w;
        if (dist(x, z, 0.5, 0.5) <= R && x > -7) continue;
        const tip = x <= -11;
        c.set(x, y + 2, z, tip ? slab('hull') : w === 4 ? 'hull_dark' : 'hull');
        if (!tip && x >= -9 && w < 4) c.set(x, y + 3, z, slab('hull'));
      }
  for (let x = -8; x <= -6; x++) for (let z = -1; z <= 1; z++) for (let k = 1; k <= 4; k++) if (dist(x, z, 0.5, 0.5) > 6.6) c.set(x, y + k, z, 'air');
  // The cockpit: a tube out to starboard and forward, glass at its end.
  box(c, -7, y + 2, -9, -1, y + 3, -8, 'hull');
  box(c, -1, y + 2, -8, 1, y + 2, -8, 'hull');
  box(c, -8, y + 2, -9, -8, y + 3, -8, 'cockpit');
  c.set(-7, y + 4, -9, slab('hull'));
  c.set(-7, y + 4, -8, slab('hull'));
  c.set(-8, y + 3, -9, 'cockpit');
  // The turret on top, its guns, and the sensor dish.
  c.set(0, y + 5, 0, 'hull_dark');
  c.set(-1, y + 5, 0, 'vaporator_pipe');
  c.set(2, y + 5, 4, 'pole');
  box(c, 1, y + 6, 3, 3, y + 6, 5, slab('hull'));
  c.set(2, y + 6, 4, 'hull_dark');
  // Legs.
  for (const [x, z] of [[-4, -4], [-4, 4], [4, -4], [4, 4], [-1, 0], [-10, -3], [-10, 3]] as const) c.set(x, y, z, 'hull_dark');
  // The ramp down to starboard behind the cockpit, climbing to the rim.
  for (let x = 1; x <= 3; x++) {
    c.set(x, y, -10, stairs('plaster', 'south'));
    c.set(x, y, -9, 'hull_dark');
    c.set(x, y + 1, -9, stairs('plaster', 'south'));
    c.set(x, y, -8, 'hull_dark');
    c.set(x, y + 1, -8, 'hull_dark');
    c.set(x, y + 2, -8, 'hull');
  }
}

/**
 * An X-winged fighter on its landing gear: a long nose, the cockpit and a little droid behind it,
 * four wings splayed from engines at their roots, a cannon at each wingtip, red squadron stripes.
 * Its tail is at x = 0.
 */
export function xfighter(c: Canvas, y: number, stripe: BlockRef = 'red_concrete') {
  const b = y + 3;
  // The fuselage: broad at the back, a long thin nose.
  box(c, -4, b, -1, 1, b + 1, 1, 'hull');
  box(c, -9, b, 0, -5, b + 1, 0, 'hull');
  box(c, -12, b, 0, -10, b, 0, 'hull');
  c.set(-13, b, 0, slab('hull'));
  c.set(-8, b + 1, 0, stripe);
  c.set(-5, b + 2, 0, 'cockpit');
  c.set(-4, b + 2, 0, 'cockpit');
  c.set(-3, b + 2, 0, slab('hull'));
  c.set(-1, b + 2, 0, 'blue_concrete');
  box(c, -4, b - 1, -1, 1, b - 1, 1, 'hull_dark');
  // The wings: out and up, out and down, from engines at their roots.
  for (const s of [-1, 1]) {
    box(c, -5, b - 1, s * 2, 1, b + 2, s * 2, (x, yy) => (yy === b - 1 || yy === b + 2 ? 'hull_dark' : x === 1 ? 'hull_dark' : 'hull'));
    c.set(2, b - 1, s * 2, 'engine_glow');
    c.set(2, b + 2, s * 2, 'engine_glow');
    const lift = [0, 0, 1, 1, 2, 2];
    for (let w = 3; w <= 7; w++) {
      const up = b + 2 + lift[w - 2];
      const down = b - 1 - lift[w - 2];
      for (let x = -3; x <= 0; x++) {
        const mark = w === 5 && x >= -2;
        c.set(x, up, s * w, mark ? stripe : 'hull');
        c.set(x, down, s * w, mark ? stripe : 'hull');
      }
    }
    // The cannons at the tips.
    for (const yy of [b + 4, b - 3]) for (let x = -9; x <= 0; x++) c.set(x, yy, s * 8, x === -9 ? 'hull_dark' : x > -3 ? 'hull' : 'hull_dark');
  }
  // Gear.
  for (let k = 0; k < 2; k++) {
    c.set(-8, y + k, 0, 'hull_dark');
    c.set(-1, y + k, -1, 'hull_dark');
    c.set(-1, y + k, 1, 'hull_dark');
  }
}

/**
 * The Empire's shuttle, landed: a boxy body, a stepped cockpit out front, the tall fin on top and
 * both wings folded up beside it. White and grey, the engines glowing at the back.
 */
export function shuttle(c: Canvas, y: number) {
  const b = y + 1;
  // Body.
  box(c, -6, b, -2, 5, b + 3, 2, (x, yy, z) => {
    if (yy === b + 3 && Math.abs(z) === 2) return undefined;
    if (yy === b) return 'durasteel_dark';
    if (yy === b + 2 && Math.abs(z) === 2 && x % 3 === 0) return 'cockpit';
    return 'durasteel';
  });
  // Cockpit, stepping down to the nose.
  box(c, -8, b, -1, -7, b + 2, 1, 'durasteel');
  box(c, -10, b, -1, -9, b + 1, 1, 'durasteel');
  box(c, -8, b + 2, -1, -8, b + 2, 1, 'cockpit');
  box(c, -10, b + 1, -1, -10, b + 1, 1, 'cockpit');
  c.set(-11, b, 0, 'durasteel_dark');
  // The fin: tall, tapering back.
  for (let k = 0; k < 9; k++) {
    const x0 = -4 + Math.floor(k * 0.45);
    const x1 = 4 - Math.floor(k * 0.2);
    for (let x = x0; x <= x1; x++) c.set(x, b + 4 + k, 0, x === x0 || k === 8 ? 'durasteel_dark' : 'durasteel');
  }
  // The wings, folded up: leaning out as they rise.
  for (const s of [-1, 1])
    for (let k = 0; k < 9; k++) {
      const z = s * (3 + Math.floor(k * 0.34));
      const x0 = -3 + Math.floor(k * 0.3);
      for (let x = x0; x <= 3; x++) c.set(x, b + 1 + k, z, x === x0 ? 'durasteel_dark' : k === 8 ? 'durasteel_dark' : 'durasteel');
    }
  // Engines.
  box(c, 6, b + 1, -2, 6, b + 2, 2, 'engine_glow');
  box(c, 6, b, -2, 6, b, 2, 'durasteel_dark');
  // Gear.
  for (const [x, z] of [[-8, 0], [3, -2], [3, 2]] as const) c.set(x, y, z, 'durasteel_dark');
}

/**
 * The Empire's twin-panelled fighter, standing on its wings: a ball of a cockpit with a round
 * window forward (west), a pylon each side out to a tall six-sided panel.
 */
export function tieFighter(c: Canvas, y: number) {
  const mid = y + 4;
  // The ball.
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++)
      for (let dz = -1; dz <= 1; dz++) {
        if (Math.abs(dx) + Math.abs(dy) + Math.abs(dz) === 3) continue;
        c.set(dx, mid + dy, dz, 'durasteel_dark');
      }
  c.set(-2, mid, 0, 'cockpit');
  c.set(-1, mid, 0, 'durasteel');
  // Pylons and panels.
  const HALF = [1, 2, 3, 4, 4, 4, 3, 2, 1];
  for (const s of [-1, 1]) {
    c.set(0, mid, s * 2, 'durasteel');
    c.set(0, mid, s * 3, 'durasteel');
    for (let k = 0; k < HALF.length; k++)
      for (let x = -HALF[k]; x <= HALF[k]; x++) {
        const edge = Math.abs(x) === HALF[k] || k === 0 || k === HALF.length - 1;
        const strut = x === 0 || k === 4;
        c.set(x, y + k, s * 4, edge ? 'durasteel' : strut ? 'durasteel_dark' : 'black_concrete');
      }
  }
}

/**
 * The wreck of a star destroyer: a dagger-shaped wedge `len` long, its nose buried in the sand at
 * the origin, rising along +x with its stern up in the air, the bridge tower on the stern; plates
 * torn away and the hull broken open here and there. For the backdrop: nobody gets near it.
 */
export function wreck(c: Canvas, y: number, len = 120) {
  const W = len * 0.3;
  const rise = 0.28;
  for (let u = 0; u <= len; u++) {
    const t = u / len;
    const half = Math.max(1, W * t);
    const thick = 3 + 10 * t;
    const base = y - 6 + u * rise;
    for (let v = -Math.ceil(half); v <= Math.ceil(half); v++) {
      const edge = Math.abs(v) / half;
      if (edge > 1) continue;
      // Stepped top: the spine highest, the flanks falling away.
      const top = thick * (1 - 0.55 * edge) + (edge < 0.18 ? 2 : 0);
      // Torn open here and there: a few courses missing from the top.
      const torn = hash(u >> 3, v >> 3, 7) < 0.14 && edge > 0.3 ? 3 : 0;
      for (let k = 0; k <= top - torn; k++) {
        const yy = Math.floor(base + k);
        if (yy < y - 4) continue;
        const b: BlockRef = hash(u, v, k + 11) < 0.1 || (u + v) % 9 === 0 || k >= top - torn - 1 && torn ? 'hull_dark' : 'hull';
        c.set(u, yy, v, b);
      }
    }
  }
  // The bridge tower on the stern, and its two globes.
  const sx = len - 14;
  const sb = Math.floor(y - 6 + sx * rise + 13);
  box(c, sx, sb, -6, len - 4, sb + 5, 6, (x, yy, z) => (x === sx || yy === sb + 5 || Math.abs(z) === 6 || x === len - 4 ? (hash(x, z, yy) < 0.2 ? 'hull_dark' : 'hull') : undefined));
  box(c, sx + 3, sb + 6, -9, sx + 7, sb + 8, 9, (x, yy, z) => (Math.abs(z) > 6 || yy === sb + 8 || x === sx + 3 ? 'hull' : undefined));
  for (const s of [-1, 1]) disc(sx + 5.5, s * 7 + 0.5, 1.6, (x, z) => box(c, x, sb + 9, z, x, sb + 10, z, 'hull'));
}
