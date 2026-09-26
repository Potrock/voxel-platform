import hitman from './placeholder/hitman.glb?url';
import bride from './placeholder/bride.glb?url';
import boss from './placeholder/boss.glb?url';
import kahuna from './placeholder/kahuna.glb?url';
import rifle from './placeholder/rifle.glb?url';
import smg from './placeholder/smg.glb?url';
import sniper from './placeholder/sniper.glb?url';
import pistol from './placeholder/pistol.glb?url';
import katana from './placeholder/katana.glb?url';
import frag from './placeholder/frag.glb?url';

/**
 * The models (GLB). Placeholders for now (Call of Blocky's fighters and guns), until the troopers,
 * the heroes and the arsenal are built (`tools/`).
 *
 * - Troopers and heroes: on the platform's humanoid rig (docs/HUMANOID.md), for each side one per
 *   class (`ClassInfo.model`).
 * - Weapons: by item id, with the gun conventions of Call of Blocky's (`grip`, `grip2`, `muzzle`,
 *   `sight`, `mag` marker nodes; the barrel along +z).
 */
export interface TrooperModel {
  id: string;
  name: string;
  url: string;
}

export const TROOPERS: [TrooperModel[], TrooperModel[]] = [
  [
    { id: 'rebel_trooper', name: 'Rebel Trooper', url: kahuna },
    { id: 'rebel_heavy', name: 'Rebel Heavy', url: boss },
    { id: 'rebel_specialist', name: 'Rebel Specialist', url: bride },
  ],
  [
    { id: 'imp_trooper', name: 'Stormtrooper', url: hitman },
    { id: 'imp_heavy', name: 'Heavy Stormtrooper', url: boss },
    { id: 'imp_specialist', name: 'Scout Trooper', url: hitman },
  ],
];

/** The heroes' models, by hero id. */
export const HERO_MODELS: Record<'luke' | 'ben' | 'vader' | 'emperor', string> = {
  luke: kahuna,
  ben: bride,
  vader: boss,
  emperor: hitman,
};

/** The weapons' models, by item id. */
export const WEAPON_MODELS: Record<string, string> = {
  rebel_rifle: rifle,
  rebel_heavy: smg,
  rebel_sniper: sniper,
  rebel_pistol: pistol,
  imp_rifle: rifle,
  imp_heavy: smg,
  imp_sniper: sniper,
  imp_pistol: pistol,
  detonator: frag,
  saber_luke: katana,
  saber_ben: katana,
  saber_vader: katana,
  saber_emperor: katana,
};
