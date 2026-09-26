import { defineShared, Models } from '@platform';
import { THEME_CSS } from './hud';
import { MAPS, WORLD } from './map';
import meta from './meta';
import { TROOPERS } from './models';
import { STYLE } from './style';
import type { Team } from './teams';

export const COLORS = { yellow: '#ffe81f', ink: '#0b0f14', paper: '#e9edf2', red: '#ff3b30', blue: '#4db8ff', green: '#5dff6a' };

/** A side's trooper of a class (`ClassInfo.model`): a model on the platform's humanoid rig. */
export const trooperModel = (team: Team, model: number) => Models.gltf(TROOPERS[team][model % TROOPERS[team].length].url, { rig: 'humanoid', ...STYLE });

/**
 * What the server and every screen agree on: the maps (built into one void world over a desert
 * floor, and shot into: blaster bolts scorch and chip the walls), how troopers move (each screen
 * predicts its own: sprint, slide, mantle), and the HUD's look.
 */
export const shared = defineShared({
  ...meta,
  world: {
    seed: WORLD.seed,
    terrain: 'void',
    ground: { y: WORLD.floorY - 1, top: WORLD.ground.top, fill: WORLD.ground.fill, depth: 6 },
    maxViewDistance: 11,
    structures: WORLD.structures,
    terraform: WORLD.terraform,
    spawn: { x: MAPS[0].home.x, y: MAPS[0].home.y, z: MAPS[0].home.z },
    spawnYaw: MAPS[0].home.yaw,
    time: WORLD.time,
    freezeTime: true,
    // Walls and roofs chip and scorch under blaster fire (each blaster's `carve`); the ground stays whole.
    destructible: { above: WORLD.floorY - 1 },
  },
  player: {
    health: 100,
    regen: { delay: 5, perSecond: 25 },
    hurtCooldown: 0,
    pvp: true,
    fallDamage: false,
    hotbar: 'items',
    model: trooperModel(0, 0),
    movement: {
      walk: 5.8,
      sprint: 8.4,
      crouch: 2.8,
      jump: 1.3,
      gravity: 30,
      acceleration: 16,
      airControl: 4,
      sprintKeys: ['ShiftLeft', 'ShiftRight'],
      crouchKeys: ['KeyC'],
      doubleTapSprint: false,
      edgeGuard: false,
      slide: { speed: 11, time: 0.75, friction: 1.3, cooldown: 0.6 },
      mantle: 1.1,
    },
  },
  hud: {
    health: 'bar',
    healthBars: true,
    nameTags: 'sight',
    theme: {
      display: "'Orbitron', 'Arial Black', sans-serif",
      text: "'Titillium Web', 'Helvetica Neue', system-ui, sans-serif",
      fonts: ['Orbitron', 'Titillium Web'],
      colors: { accent: COLORS.yellow, ink: COLORS.ink, paper: COLORS.ink, text: COLORS.paper, danger: COLORS.red, good: COLORS.paper },
      css: THEME_CSS,
    },
  },
});
