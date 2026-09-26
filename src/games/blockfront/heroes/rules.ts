import { Models, type Bot, type GameContext, type MeleeItem, type Player } from '@platform';
import type { BotMind, BotWeapon } from '@platform/kits';
import { HERO_MODELS } from '../models';
import { STYLE } from '../style';
import type { Team } from '../teams';
import { HEROES, HERO_IDS, saberOf, type HeroId } from './defs';

/**
 * The heroes on the server: making someone a hero (their model, health, saber and powers) and
 * back again, and everything their sabers and powers do. `server.ts` decides who gets to be one
 * (battle points, one of each hero at a time); this is what being one means.
 *
 * (A first cut: a hero is a tougher fighter with a saber. The powers, blocking and deflecting,
 * and the hero bots' fighting come next.)
 */

/** What the heroes need to know of the match. */
export interface HeroRules {
  teamOf(p: Player): Team | null;
  hostile(a: Player, b: Player): boolean;
}

export interface Heroes {
  /** Define the sabers (and anything else the heroes carry): in `setup`. */
  define(): void;
  /** Make them this hero now (just spawned): their model, health, saber and powers. */
  become(p: Player, id: HeroId): void;
  /** Back to a trooper (they died as the hero, the match ended): what the hero had goes. */
  end(p: Player): void;
  /** The hero they are now, if any. */
  heroOf(p: Player): HeroId | null;
  /** Each step, before the bots. */
  update(dt: number): void;
  /** How bots fight with the heroes' weapons (for `shooterBots`). */
  botWeapons: Record<string, BotWeapon>;
  /** A hero bot's own moves in a fight (powers, blocking), each tick of it. */
  botFight(bot: Bot, mind: BotMind, distance: number): void;
}

const SABER: Omit<MeleeItem, 'name'> = { kind: 'melee', damage: 55, cooldown: 0.45, reach: 3.4, knockback: 0.5, sweep: true };

export function setupHeroes(game: GameContext, _rules: HeroRules): Heroes {
  const who = new Map<string, HeroId>();
  return {
    define() {
      for (const id of HERO_IDS) game.items.define(saberOf(id), { ...SABER, name: `${HEROES[id].name}'s Saber` });
    },
    become(p, id) {
      const h = HEROES[id];
      who.set(p.id, id);
      p.setModel(Models.gltf(HERO_MODELS[id], { rig: 'humanoid', ...STYLE }));
      p.maxHealth = h.health;
      p.health = h.health;
      p.speed = 1.12;
      p.inventory.clear();
      p.inventory.give(saberOf(id));
      p.inventory.select(0);
    },
    end(p) {
      who.delete(p.id);
      p.speed = 1;
    },
    heroOf: (p) => who.get(p.id) ?? null,
    update() {},
    botWeapons: Object.fromEntries(HERO_IDS.map((id) => [saberOf(id), { range: 1.6, rush: true }])),
    botFight() {},
  };
}
