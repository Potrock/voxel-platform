import type { HumanoidPoses } from '@platform';
import type { ClientKit } from '@platform/client';
import { humanoid } from './figures/humanoid';
import { heroFx } from './fx';
import { heroHud } from './hud';
import { defineHeroLooks } from './looks';
import { defineHeroSounds } from './sounds';
import { HeroScene, heroState } from './state';

/**
 * The heroes on each screen, as client kits for `client.ts` (in place of `figures.humanoid()`):
 * what the server says heroes do, kept (`state.ts`); everyone's figures posed, heroes' sabers and
 * gestures and their victims included (`figures/`, the platform's kit copied and grown); the
 * effects (`fx.ts`); the hero HUD (`hud.ts`); and their looks and voices (`looks.ts`, `sounds.ts`).
 */
export function heroKits(opts: { poses?: HumanoidPoses } = {}): ClientKit[] {
  const scene = new HeroScene();
  return [
    {
      name: 'blockfront.heroes.looks',
      setup(client) {
        defineHeroLooks(client);
        defineHeroSounds(client);
      },
    },
    heroState(scene),
    humanoid({ ...opts, scene }),
    heroFx(scene),
    heroHud(scene),
  ];
}
