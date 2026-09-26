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
 * The saucer freighter: a round hull (its middle `(0.5, 0.5)`, `R` across the radius) thick in the
 * middle and thin at the rim, on landing legs a block high; two cargo prongs out front with a slot
 * between them, the cockpit tube off the starboard side (north, as built), the engines glowing
 * round the back, a gun turret and a sensor dish on top. A ramp comes down to starboard behind the
 * cockpit, and its back is walkable, in half steps, from the rim to the turret.
 */
export function freighter(c: Canvas, y: number, R = 9.5) {
  const topAt = (d: number) => 5.2 - 2.8 * (d / R) ** 2;
  // The slot between the prongs runs back into the hull a little.
  const slot = (x: number, z: number) => x < -R + 3 && z >= -1 && z <= 1;
  disc(0.5, 0.5, R, (x, z, d) => {
    if (slot(x, z)) return;
    const bottom = d < R - 2 ? 1 : 2;
    const t = topAt(d);
    const full = Math.floor(t);
    const rear = x > R * 0.35 && d > R - 1.3;
    for (let k = bottom; k < full; k++) c.set(x, y + k, z, rear && k === 2 ? 'engine_glow' : k === bottom && d > R - 4 ? 'hull_dark' : 'hull');
    if (t - full >= 0.5) c.set(x, y + full, z, slab('hull'));
    else if (rear && full === 2) c.set(x, y + 2, z, 'engine_glow');
    // Panel lines on top: a darker ring, and the spokes of the plating.
    const ang = Math.atan2(z + 0.5 - 0.5, x + 0.5 - 0.5);
    const spoke = Math.abs(((ang / (Math.PI / 4)) % 1) + 1) % 1 < 0.08 * (6 / Math.max(d, 1));
    if ((d > 3.6 && d < 4.4) || (spoke && d > 2.5 && d < R - 1.5)) {
      if (c.get(x, y + full - 1, z) === 'hull' && t - full < 0.5) c.set(x, y + full - 1, z, 'hull_dark');
    }
  });
  // The prongs: out past the rim, tapering.
  for (const side of [-1, 1])
    for (let x = Math.floor(-R) - 6; x <= Math.floor(-R) + 3; x++)
      for (let w = 2; w <= 4; w++) {
        const z = side * w;
        if (dist(x, z, 0.5, 0.5) <= R - 1) continue;
        const tip = x <= Math.floor(-R) - 5;
        c.set(x, y + 2, z, tip ? slab('hull') : w === 4 ? 'hull_dark' : 'hull');
        if (!tip && w < 4 && x >= Math.floor(-R) - 3) c.set(x, y + 3, z, slab('hull'));
      }
  // The cockpit: a tube out to starboard and forward, glass at its end.
  const cz = -Math.round(R) - 1;
  box(c, -8, y + 2, cz - 1, -1, y + 3, cz, 'hull');
  box(c, -1, y + 2, cz + 1, 1, y + 3, cz + 1, 'hull');
  box(c, -9, y + 2, cz - 1, -9, y + 3, cz, 'cockpit');
  box(c, -8, y + 4, cz - 1, -6, y + 4, cz, slab('hull'));
  c.set(-8, y + 3, cz, 'cockpit');
  // The turret on top, its guns, and the sensor dish.
  box(c, 0, y + 5, 0, 1, y + 5, 1, 'hull_dark');
  c.set(-1, y + 5, 0, 'vaporator_pipe');
  c.set(-1, y + 5, 1, 'vaporator_pipe');
  c.set(3, y + 5, 5, 'pole');
  box(c, 2, y + 6, 4, 4, y + 6, 6, slab('hull'));
  c.set(3, y + 6, 5, 'hull_dark');
  // Legs.
  for (const [x, z] of [[-5, -5], [-5, 5], [5, -5], [5, 5], [-1, 0], [-13, -3], [-13, 3]] as const) c.set(x, y, z, 'hull_dark');
  // The ramp down to starboard behind the cockpit, climbing to the rim.
  const rz = -Math.round(R) - 1;
  for (let x = 1; x <= 3; x++) {
    c.set(x, y, rz - 1, stairs('plaster', 'south'));
    c.set(x, y, rz, 'hull_dark');
    c.set(x, y + 1, rz, stairs('plaster', 'south'));
    c.set(x, y, rz + 1, 'hull_dark');
    c.set(x, y + 1, rz + 1, 'hull_dark');
    c.set(x, y + 2, rz + 1, stairs('plaster', 'south'));
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
 * The wreck of a star destroyer: a dagger-shaped wedge `len` long, its nose at the origin and its
 * stern along +x, rolled most of the way onto its side so its flat belly stands up like a wall
 * facing -z, a great grey triangle of plating sunk in the sand (put dunes round it); its dead
 * engines face +x, and plates are torn away here and there. For the backdrop: nobody gets near it.
 */
export function wreck(c: Canvas, y: number, len = 120) {
  const W = len * 0.3;
  const rise = 0.05;
  const roll = (-62 * Math.PI) / 180;
  const [cr, sr] = [Math.cos(roll), Math.sin(roll)];
  const base = (u: number) => y - 5 + u * rise;
  /** A cell of the hull in its own frame (u along it, v across its belly, k up from the belly), rolled. */
  const put = (u: number, v: number, k: number, b: BlockRef) => {
    const yy = Math.floor(base(u) + v * sr + k * cr);
    if (yy < y - 3) return;
    c.set(Math.floor(u), yy, Math.round(v * cr - k * sr), b);
  };
  /** The belly's plating: big panels ruled in dark lines, a few holes torn in it. */
  const plate = (u: number, v: number): BlockRef => {
    const hole = hash(u >> 4, Math.floor(v) >> 3, 9) < 0.07;
    if (hole) return 'black_concrete';
    return u % 12 === 0 || Math.floor(v) % 9 === 0 || hash(u, Math.floor(v), 8) < 0.015 ? 'hull_dark' : 'hull';
  };
  for (let u = 0; u <= len; u++) {
    const t = u / len;
    const half = Math.max(1, W * t);
    const thick = 3 + 10 * t;
    for (let v = -half; v <= half; v += 0.5) {
      const edge = Math.abs(v) / half;
      // Stepped decks on the far side: the spine highest, the flanks falling away.
      const top = thick * (1 - 0.55 * edge) + (edge < 0.18 ? 2 : 0);
      for (let k = 0; k <= top; k += 0.5) {
        const skin = k === 0 || k > top - 1 || Math.abs(v) > half - 1 || u === len;
        if (skin) put(u, v, k, k === 0 ? plate(u, v) : 'hull');
      }
    }
  }
  // The stern: plated over, three dead engines.
  for (let v = -W; v <= W; v += 0.5)
    for (let k = 0; k <= 15; k += 0.5) {
      const top = 13 * (1 - 0.55 * (Math.abs(v) / W)) + (Math.abs(v) / W < 0.18 ? 2 : 0);
      if (k > top) continue;
      const engine = [-12, 0, 12].some((e) => Math.hypot(v - e, k - 6) < 3.2);
      put(len, v, k, engine ? 'black_concrete' : 'hull_dark');
    }
}
