import rifle from './placeholder_rifle.glb?url';
import smg from './placeholder_smg.glb?url';
import sniper from './placeholder_sniper.glb?url';
import pistol from './placeholder_pistol.glb?url';
import katana from './placeholder_katana.glb?url';
import frag from './placeholder_frag.glb?url';

/**
 * The weapons' models (GLB), by item id: the blasters (with Call of Blocky's gun conventions:
 * `grip`, `grip2`, `muzzle`, `sight`, `mag` marker nodes, the barrel along +z), the thermal
 * detonator and the heroes' sabers. Placeholders for now, until they're built (`tools/weapons/`).
 */
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
