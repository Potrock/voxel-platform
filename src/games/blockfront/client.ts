import { defineClient } from '@platform/client';
import { effects, firstPerson, hud, sounds } from '@platform/client/kits';
import { defineLooks } from './client/looks';
import { defineSounds } from './client/sounds';
import { heroKits } from './heroes/client';
import { shared } from './shared';

/**
 * Blockfront II on each player's screen: the platform's kits it uses (the standard voices, first
 * person for those who'd rather, the troopers' figures, the blaster's and the detonators' HUD,
 * blaster fire and detonators in the world), then its own look: each weapon's model, icon, hold
 * and bolt (`client/looks.ts`), and its voices (`client/sounds.ts`).
 */
export default defineClient(shared, {
  kits: [...sounds.standard(), ...firstPerson.standard(), ...heroKits() /* the figures (heroes' sabers and powers too), the heroes' effects and HUD: heroes/client */, hud.gunner(), hud.throwables(), effects.gunfire(), effects.throwables()],
  setup(client) {
    defineLooks(client);
    defineSounds(client);
  },
});
