import { Blueprint } from '@platform';
import { hash, ringSpawns, spawnAt, type MapSpec, type PostSpec } from './kit';

/**
 * The desert spaceport (a placeholder while the real one is built): five command posts in a line
 * across a sandy flat, from the Rebels' hangar (A, theirs for good) to the Imperial garrison (E),
 * with sandstone cover round each.
 */

const FLOOR = 64;
const W = 96;
const D = 44;

const bp = new Blueprint({ x: -W, y: FLOOR - 1, z: -D }, { x: W * 2 + 1, y: 24, z: D * 2 + 1 });

// The flat's own floor (the world's ground is sand already; a sandstone apron round each post).
const POSTS: PostSpec[] = [
  { id: 'A', name: 'the Rebel hangar', at: { x: -72.5, y: FLOOR, z: 0.5 }, radius: 7, owner: 0, locked: true, spawns: [] },
  { id: 'B', name: 'the market', at: { x: -36.5, y: FLOOR, z: 12.5 }, radius: 7, owner: 0, spawns: [] },
  { id: 'C', name: 'the docking bay', at: { x: 0.5, y: FLOOR, z: 0.5 }, radius: 8, owner: null, spawns: [] },
  { id: 'D', name: 'the cantina', at: { x: 36.5, y: FLOOR, z: -12.5 }, radius: 7, owner: 1, spawns: [] },
  { id: 'E', name: 'the Imperial garrison', at: { x: 72.5, y: FLOOR, z: 0.5 }, radius: 7, owner: 1, locked: true, spawns: [] },
];

for (const p of POSTS) {
  const cx = Math.floor(p.at.x);
  const cz = Math.floor(p.at.z);
  // An apron of sandstone, a pad in the middle.
  bp.fill({ x: cx - 5, y: FLOOR - 1, z: cz - 5 }, { x: cx + 5, y: FLOOR - 1, z: cz + 5 }, (x, _y, z) => (Math.hypot(x - cx, z - cz) < 5.5 ? (Math.hypot(x - cx, z - cz) < 1.5 ? 'glowstone' : 'end_stone') : undefined));
  // Cover: low walls round it, broken here and there.
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const wx = Math.round(cx + Math.cos(a) * 10);
    const wz = Math.round(cz + Math.sin(a) * 10);
    const along = Math.abs(Math.cos(a)) > 0.5;
    for (let k = -3; k <= 3; k++) {
      const x = along ? wx : wx + k;
      const z = along ? wz + k : wz;
      const h = 1 + (hash(x, z) < 0.6 ? 1 : 0);
      for (let y = 0; y < h; y++) bp.set(x, FLOOR + y, z, 'sandstone');
    }
  }
  p.spawns = ringSpawns(cx, FLOOR, cz, 4, 6, { x: 0, z: 0 });
}

// A few huts between the posts: sandstone boxes with a door, for cover.
for (let i = 0; i < 14; i++) {
  const x = Math.round(-80 + hash(i, 1) * 160);
  const z = Math.round(-36 + hash(i, 2) * 72);
  if (POSTS.some((p) => Math.hypot(p.at.x - x, p.at.z - z) < 13)) continue;
  const w = 3 + Math.floor(hash(i, 3) * 3);
  for (let dx = -w; dx <= w; dx++)
    for (let dz = -w; dz <= w; dz++)
      for (let y = 0; y < 4; y++) {
        const edge = Math.abs(dx) === w || Math.abs(dz) === w;
        const door = dz === -w && Math.abs(dx) <= 0 && y < 2;
        if ((edge && !door) || y === 3) bp.set(x + dx, FLOOR + y, z + dz, y === 3 ? 'end_stone' : 'sandstone');
      }
}

export const SPACEPORT: MapSpec = {
  id: 'spaceport',
  name: 'Mos Blockley Spaceport',
  blurb: 'A desert spaceport: take the market, the docking bay and the cantina',
  floorY: FLOOR,
  time: 0.4,
  ground: { top: 'sand', fill: 'sandstone' },
  structures: [bp],
  terraform: [],
  bounds: { min: { x: -W, y: FLOOR - 2, z: -D }, max: { x: W, y: FLOOR + 22, z: D } },
  posts: POSTS,
  home: spawnAt(0, FLOOR + 14, 40, 0, 0),
  overview: { position: { x: 0, y: FLOOR + 40, z: 60 }, target: { x: 0, y: FLOOR, z: 0 } },
  hotspots: POSTS.map((p) => ({ ...p.at })),
};
