import type { SynthKit } from '@platform';
import type { Client } from '@platform/client';

/**
 * Blockfront's sounds, synthesised on each screen (`client.audio.define`): the blasters' bright
 * falling "pew" over a crack of noise, venting heat, sabers, the posts changing hands.
 */

/** A blaster bolt: a bright tone falling fast (the pew), a snap of noise, a short ring. */
function bolt(s: SynthKit, o: { from: number; to: number; len: number; snap: number; loud?: number }) {
  const p = s.pitch;
  const v = o.loud ?? 1;
  s.tone({ wave: 'sawtooth', from: o.from * p, to: o.to * p, duration: o.len, volume: 0.22 * v, lowpass: 5200 });
  s.tone({ wave: 'sine', from: o.from * 0.5 * p, to: o.to * 0.4 * p, duration: o.len * 1.3, volume: 0.35 * v });
  s.noise({ duration: 0.04, filter: 'bandpass', from: 3800 * p, to: 1800, q: 1.2, volume: o.snap * v });
  s.tone({ wave: 'triangle', from: o.to * 1.5 * p, to: o.to * 1.2 * p, duration: o.len * 1.6, delay: 0.03, volume: 0.06 * v, vibrato: { rate: 40, depth: 30 } });
}

export function defineSounds(client: Client) {
  const a = client.audio;
  a.define('blaster_rifle', (s) => bolt(s, { from: 2400, to: 320, len: 0.16, snap: 0.35 }));
  a.define('blaster_heavy', (s) => bolt(s, { from: 1900, to: 260, len: 0.11, snap: 0.25, loud: 0.8 }));
  a.define('blaster_sniper', (s) => {
    bolt(s, { from: 3200, to: 180, len: 0.32, snap: 0.6, loud: 1.3 });
    s.noise({ duration: 0.5, delay: 0.12, filter: 'lowpass', from: 1200, to: 120, volume: 0.1 });
  });
  a.define('blaster_pistol', (s) => bolt(s, { from: 2800, to: 420, len: 0.13, snap: 0.4, loud: 0.9 }));
  a.define('vent', (s) => {
    s.noise({ duration: 0.9, filter: 'highpass', from: 5000, to: 2400, volume: 0.22 });
    s.tone({ wave: 'sine', from: 900, to: 300, duration: 0.8, volume: 0.08 });
  });
  a.define('overheat', (s) => {
    s.tone({ wave: 'square', from: 660, to: 640, duration: 0.08, volume: 0.1, lowpass: 2000 });
    s.tone({ wave: 'square', from: 520, to: 500, duration: 0.1, delay: 0.1, volume: 0.1, lowpass: 2000 });
  });
  a.define('detonator_arm', (s) => {
    for (let i = 0; i < 3; i++) s.tone({ wave: 'square', from: 1800, to: 1800, duration: 0.04, delay: i * 0.09, volume: 0.1, lowpass: 3000 });
  });
  a.define('saber_swing', (s) => {
    const p = s.pitch;
    s.tone({ wave: 'sawtooth', from: 110 * p, to: 180 * p, duration: 0.32, volume: 0.25, lowpass: 900, vibrato: { rate: 30, depth: 6 } });
    s.noise({ duration: 0.3, filter: 'bandpass', from: 600, to: 1400, q: 2, volume: 0.25 });
  });
  a.define('saber_hit', (s) => {
    s.noise({ duration: 0.25, filter: 'bandpass', from: 2200, to: 900, q: 1.5, volume: 0.45 });
    s.tone({ wave: 'square', from: 220, to: 90, duration: 0.25, volume: 0.2, lowpass: 1200 });
  });
  a.define('hero_arrives', (s) => {
    for (const [i, n] of [0, 7, 12].entries()) s.tone({ wave: 'sawtooth', from: 196 * 2 ** (n / 12), to: 196 * 2 ** (n / 12), duration: 0.5, delay: i * 0.16, volume: 0.13, lowpass: 1800, attack: 0.02 });
  });
  a.define('post_gained', (s) => {
    s.tone({ wave: 'triangle', from: 660, to: 660, duration: 0.12, volume: 0.2 });
    s.tone({ wave: 'triangle', from: 990, to: 990, duration: 0.2, delay: 0.12, volume: 0.2 });
  });
  a.define('post_lost', (s) => {
    s.tone({ wave: 'triangle', from: 660, to: 660, duration: 0.12, volume: 0.2 });
    s.tone({ wave: 'triangle', from: 440, to: 430, duration: 0.25, delay: 0.12, volume: 0.2 });
  });
}
