import type { Bot, GameContext, Player } from '@platform';
import type { BotMind } from '@platform/kits';
import { HERO_ABILITY, coolOf, type HeroMove } from './abilities';
import { HEROES, type HeroId, type PowerId } from './defs';
import type { Powers } from './powers';
import type { Sabers } from './saber';
import { GUARD, POWERS, SABER } from './tuning';

export interface HeroBotRules {
  heroOf(p: Player): HeroId | null;
  hostile(a: Player, b: Player): boolean;
  powers: Powers;
  sabers(): Sabers | null;
}

/** What a hero bot has in mind, beyond the shooter bot's. */
interface Plan {
  /** Guard up until (host time), and not again before. */
  guardUntil: number;
  guardAgain: number;
  /** Lightning held until. */
  zapUntil: number;
  /** When it last thought about a power, and the next time it may. */
  nextPower: number;
}

const DEG = Math.PI / 180;

/**
 * Hero bots: the shooter bots' fighting (`shooterBots`: they see, chase and rush in with the blade
 * as a `rush` weapon), plus a hero's own moves each tick of a fight:
 *
 * - in reach, the saber: held down, the combo keeps coming;
 * - shot at from further off, the guard up (while the meter holds), turning the bolts;
 * - the powers where they pay: a push into a crowd, a pull or a choke on someone keeping their
 *   distance (a sniper), a rush or a leap to close in, the saber thrown down a line, lightning on
 *   whoever's in front, chain lightning into a group, the aura or a rage in the thick of it, the
 *   stance under fire.
 */
export function heroBots(game: GameContext, rules: HeroBotRules) {
  const plans = new Map<string, Plan>();
  const plan = (b: Bot) => {
    let p = plans.get(b.id);
    if (!p) plans.set(b.id, (p = { guardUntil: 0, guardAgain: 0, zapUntil: 0, nextPower: 0 }));
    return p;
  };

  /** Enemies within `range` of the bot, in front of it (within `arc` degrees each side, level). */
  const around = (bot: Bot, range: number, arc = 180) => {
    const cos = Math.cos(arc * DEG);
    const fx = -Math.sin(bot.yaw);
    const fz = -Math.cos(bot.yaw);
    return game.players.filter((t) => {
      if (t === bot || !t.alive || !rules.hostile(bot, t)) return false;
      const dx = t.position.x - bot.position.x;
      const dz = t.position.z - bot.position.z;
      const d = Math.hypot(dx, dz);
      return d <= range && (d < 1 || (dx * fx + dz * fz) / d >= cos) && Math.abs(t.position.y - bot.position.y) < 4;
    });
  };

  /** Whether to use this power now, against `target` at `d`. */
  const worth = (bot: Bot, power: PowerId, target: Player, d: number, hurtLately: boolean): boolean => {
    switch (power) {
      case 'push':
        return around(bot, POWERS.push.range * 0.8, POWERS.push.arc).length >= 2 || (d < 4 && hurtLately);
      case 'rush':
        return d > 4.5 && d < 9;
      case 'leap':
        return d > 9 && d < 16;
      case 'pull':
        return d > 6 && d < POWERS.pull.range;
      case 'soresu':
        return hurtLately && d > 6 && bot.health < bot.maxHealth * 0.8;
      case 'throw':
        return d > 4.5 && d < POWERS.throw.range - 1;
      case 'choke':
        return d > 3.5 && d < POWERS.choke.range;
      case 'rage':
        return around(bot, 9).length >= 2 || (d < 5 && rules.heroOf(target) !== null);
      case 'lightning':
        return d < POWERS.lightning.range - 1;
      case 'chain':
        return d < POWERS.chain.range - 2 && d > 4;
      case 'aura':
        return around(bot, POWERS.aura.radius - 0.5).length >= 2 || (d < 3.5 && bot.health < bot.maxHealth * 0.6);
    }
  };

  return {
    fight(bot: Bot, mind: BotMind) {
      const id = rules.heroOf(bot);
      const target = mind.target;
      if (!id || !target || !bot.alive) return;
      const c = bot.controls;
      const now = game.clock.now;
      const pl = plan(bot);
      const s = rules.sabers()?.of(bot);
      const m = bot.abilities[HERO_ABILITY] as HeroMove;
      const hurtLately = now - mind.hurtAt < 0.9;
      const d = Math.hypot(target.position.x - bot.position.x, target.position.z - bot.position.z);
      // In reach and facing them: the saber, held (the combo keeps coming).
      const facing = (() => {
        const dx = target.position.x - bot.position.x;
        const dz = target.position.z - bot.position.z;
        return (dx * -Math.sin(bot.yaw) + dz * -Math.cos(bot.yaw)) / (d || 1) > Math.cos(50 * DEG);
      })();
      const inReach = d < SABER.reach - 0.2 && facing;
      // Lightning under way: keep holding while there's someone in front, and it lasts.
      const lightning = HEROES[id].powers[0].id === 'lightning';
      if (lightning && pl.zapUntil > now) {
        c.hold('KeyQ', d < POWERS.lightning.range && facing);
        c.button(0, false);
        c.button(2, false);
        return;
      }
      if (lightning) c.hold('KeyQ', false);
      // Shot at while closing in: the guard up (it holds while the meter does), down again to strike.
      if (!inReach && hurtLately && d > 4 && m.g > 0 && m.m > GUARD.meter * 0.25 && now > pl.guardAgain) {
        pl.guardUntil = now + 1 + Math.random() * 1.2 * (0.5 + mind.skill);
        pl.guardAgain = pl.guardUntil + 0.3 + Math.random() * 0.6 * (1 - mind.skill);
      }
      const guard = pl.guardUntil > now && m.g > 0 && m.m > GUARD.meter * 0.12 && d > 3.5;
      c.button(2, guard);
      c.button(0, inReach && !guard && (s?.stagger ?? 0) === 0);
      // A power, now and then (more often the better the bot), when one's ready and worth it.
      if (now < pl.nextPower || rules.powers.held(bot)) return;
      pl.nextPower = now + 0.25 + (1 - mind.skill) * 0.6 + Math.random() * 0.4;
      const ready = HEROES[id].powers.filter((_, slot) => coolOf(m, slot) === 0);
      for (const p of ready.sort(() => Math.random() - 0.5)) {
        if (!worth(bot, p.id, target, d, hurtLately)) continue;
        if (p.id === 'leap') c.look(bot.yaw, Math.min(0.5, bot.pitch + 0.25));
        if (p.hold) {
          pl.zapUntil = now + 1.2 + Math.random() * 1.6;
          c.hold(p.key, true);
        } else c.press(p.key);
        pl.nextPower = now + 1.2;
        break;
      }
    },
    /** Each step: lightning let go once it's had its while (out of a fight too). */
    update() {
      const now = game.clock.now;
      for (const [id, pl] of plans) {
        if (pl.zapUntil === 0 || pl.zapUntil > now) continue;
        pl.zapUntil = 0;
        const bot = game.bots.all.find((b) => b.id === id);
        bot?.controls.hold('KeyQ', false);
      }
    },
    forget(bot: Player) {
      plans.delete(bot.id);
    },
  };
}
