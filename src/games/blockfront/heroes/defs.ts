import type { Team } from '../teams';

/**
 * The heroes: who they are, whose side they fight on, and their three powers (Q, E, F). Plain data
 * both sides read (the spawn menu, the hero HUD). What they do is `rules.ts` (the server's);
 * how they look is the screens' (`client/`).
 */

export type HeroId = 'luke' | 'ben' | 'vader' | 'emperor';

export interface PowerInfo {
  /** The key that uses it. */
  key: 'KeyQ' | 'KeyE' | 'KeyF';
  name: string;
  /** Seconds before it can be used again. */
  cooldown: number;
  /** One line for the HUD and the spawn menu. */
  blurb: string;
}

export interface HeroInfo {
  id: HeroId;
  name: string;
  /** Who they are, in a few words. */
  title: string;
  team: Team;
  health: number;
  /** Their saber's colour (the blade, its glow, the HUD). */
  blade: string;
  /** Battle points it costs to play them. */
  cost: number;
  powers: [PowerInfo, PowerInfo, PowerInfo];
}

export const HEROES: Record<HeroId, HeroInfo> = {
  luke: {
    id: 'luke',
    name: 'Luke Skyblocker',
    title: 'Jedi Knight',
    team: 0,
    health: 650,
    blade: '#5dff6a',
    cost: 1200,
    powers: [
      { key: 'KeyQ', name: 'Force Push', cooldown: 8, blurb: 'Throws back everyone in front of him' },
      { key: 'KeyE', name: 'Saber Rush', cooldown: 10, blurb: 'Dashes ahead, cutting through all in the way' },
      { key: 'KeyF', name: 'Force Leap', cooldown: 12, blurb: 'A great leap, landing with a shockwave' },
    ],
  },
  ben: {
    id: 'ben',
    name: 'Ben Kenoblock',
    title: 'Jedi Master',
    team: 0,
    health: 600,
    blade: '#4db8ff',
    cost: 1200,
    powers: [
      { key: 'KeyQ', name: 'Force Push', cooldown: 8, blurb: 'Throws back everyone in front of him' },
      { key: 'KeyE', name: 'Force Pull', cooldown: 11, blurb: 'Drags an enemy to his blade' },
      { key: 'KeyF', name: 'Soresu Stance', cooldown: 18, blurb: 'Deflects everything, from every side, for a while' },
    ],
  },
  vader: {
    id: 'vader',
    name: 'Darth Voxel',
    title: 'Dark Lord of the Sith',
    team: 1,
    health: 800,
    blade: '#ff2a2a',
    cost: 1200,
    powers: [
      { key: 'KeyQ', name: 'Saber Throw', cooldown: 9, blurb: 'Hurls his saber out and back through the ranks' },
      { key: 'KeyE', name: 'Force Choke', cooldown: 12, blurb: 'Lifts one enemy by the throat' },
      { key: 'KeyF', name: 'Focused Rage', cooldown: 20, blurb: 'Faster, and every swing hits harder' },
    ],
  },
  emperor: {
    id: 'emperor',
    name: 'Emperor Palpablock',
    title: 'Sith Master',
    team: 1,
    health: 600,
    blade: '#ff3355',
    cost: 1200,
    powers: [
      { key: 'KeyQ', name: 'Force Lightning', cooldown: 6, blurb: 'Lightning from both hands, for as long as he holds it' },
      { key: 'KeyE', name: 'Chain Lightning', cooldown: 10, blurb: 'A bolt that leaps from enemy to enemy' },
      { key: 'KeyF', name: 'Dark Aura', cooldown: 18, blurb: 'Drains everyone close by, healing him' },
    ],
  },
};

export const HERO_IDS = Object.keys(HEROES) as HeroId[];

/** The item each hero's saber is (`saber_<id>`). */
export const saberOf = (id: HeroId) => `saber_${id}`;
