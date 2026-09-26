import { defineClient } from '@platform/client';
import { effects, figures, firstPerson, hud, sounds } from '@platform/client/kits';
import { blasterHud } from './client/blaster-hud';
import { bolts } from './client/bolts';
import { defineLooks } from './client/looks';
import { defineSounds } from './client/sounds';
import { shared } from './shared';

/**
 * Blockfront II on each player's screen: the platform's kits it uses (the standard voices, first
 * person for those who'd rather, the troopers' figures, the blaster's and the detonators' HUD,
 * blaster fire and detonators in the world), then its own look: each weapon's model, icon, hold
 * and bolt (`client/looks.ts`), and its voices (`client/sounds.ts`).
 */
export default defineClient(shared, {
  kits: [...sounds.standard(), ...firstPerson.standard(), figures.humanoid(), blasterHud(), hud.throwables(), bolts(), effects.throwables()],
  setup(client) {
    defineLooks(client);
    defineSounds(client);
  },
});
