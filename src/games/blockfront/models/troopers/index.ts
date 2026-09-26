import hitman from './placeholder_hitman.glb?url';
import bride from './placeholder_bride.glb?url';
import boss from './placeholder_boss.glb?url';
import kahuna from './placeholder_kahuna.glb?url';

/**
 * The troopers' and heroes' models (GLB on the platform's humanoid rig, docs/HUMANOID.md).
 * Placeholders for now (Call of Blocky's fighters), until they're built (`tools/troopers/`).
 */
export interface TrooperModel {
  id: string;
  name: string;
  url: string;
}

/** For each side, one per class (`ClassInfo.model`: trooper, heavy, specialist). */
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
