import rebel_trooper from './rebel_trooper.glb?url';
import rebel_heavy from './rebel_heavy.glb?url';
import rebel_specialist from './rebel_specialist.glb?url';
import imp_trooper from './imp_trooper.glb?url';
import imp_heavy from './imp_heavy.glb?url';
import imp_specialist from './imp_specialist.glb?url';
import luke from './luke.glb?url';
import ben from './ben.glb?url';
import vader from './vader.glb?url';
import emperor from './emperor.glb?url';

/**
 * The troopers' and heroes' models (GLB on the platform's humanoid rig, docs/HUMANOID.md), written by
 * `src/games/blockfront/tools/troopers/build.mjs` (see its header).
 */
export interface TrooperModel {
  id: string;
  name: string;
  url: string;
}

/** For each side, one per class (`ClassInfo.model`: trooper, heavy, specialist). */
export const TROOPERS: [TrooperModel[], TrooperModel[]] = [
  [
    { id: 'rebel_trooper', name: 'Rebel Trooper', url: rebel_trooper },
    { id: 'rebel_heavy', name: 'Rebel Heavy', url: rebel_heavy },
    { id: 'rebel_specialist', name: 'Rebel Specialist', url: rebel_specialist },
  ],
  [
    { id: 'imp_trooper', name: 'Stormtrooper', url: imp_trooper },
    { id: 'imp_heavy', name: 'Heavy Stormtrooper', url: imp_heavy },
    { id: 'imp_specialist', name: 'Scout Trooper', url: imp_specialist },
  ],
];

/** The heroes' models, by hero id. */
export const HERO_MODELS: Record<'luke' | 'ben' | 'vader' | 'emperor', string> = {
  luke,
  ben,
  vader,
  emperor,
};
