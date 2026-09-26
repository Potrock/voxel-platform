import type { SynthKit } from '@platform';
import type { Client } from '@platform/client';

/**
 * Blockfront's sounds, synthesised on each screen (`client.audio.define`), all our own:
 *
 * - **Blasters** (`blaster_<kind>_<side>`, each blaster's look names its own): the falling "pew"
 *   of a bolt leaving, over a snap of noise and a ring. The Rebels' brighter and ringing, the
 *   Empire's lower and harsher; the rifle, the heavy repeater, the cycler and the pistol each
 *   their own. Venting (`vent`), the dry click of an overheated trigger (`overheat`) and the
 *   alarm as it overheats (`blaster_overheat`).
 * - **Bolts** (the bolts kit plays them where they land): a zap and a sizzle on a wall
 *   (`bolt_hit`), a burn on someone (`bolt_burn`), and the whizz of one going by (`bolt_whizz`).
 * - **The detonator**: arming beeps, the toss, a clink off the ground.
 * - **UI**: a post gained and lost, a hero ready, low reinforcements, deploying, a heartbeat at
 *   low health; the match's opening and victory / defeat stingers (short brass fanfares).
 * - **Ambience** (`client/ambience.ts` plays them): desert wind, a firefight far off, a fighter
 *   screaming over.
 *
 * (Voices stop after three seconds: the platform lets each play go then.)
 */

/** A note's frequency, `n` semitones from A4. */
const note = (n: number) => 440 * 2 ** (n / 12);

/** A blaster bolt: a bright tone falling fast (the pew), a snap of noise, a short ring. */
function bolt(s: SynthKit, o: { from: number; to: number; len: number; snap: number; loud?: number; ring?: number; grit?: number }) {
  const p = s.pitch;
  const v = o.loud ?? 1;
  s.tone({ wave: 'sawtooth', from: o.from * p, to: o.to * p, duration: o.len, volume: 0.2 * v, lowpass: 5200 });
  s.tone({ wave: 'sine', from: o.from * 0.5 * p, to: o.to * 0.4 * p, duration: o.len * 1.3, volume: 0.34 * v });
  s.noise({ duration: 0.04, filter: 'bandpass', from: 3800 * p, to: 1800, q: 1.2, volume: o.snap * v });
  if (o.grit) s.tone({ wave: 'square', from: o.from * 0.33 * p, to: o.to * 0.3 * p, duration: o.len * 0.9, volume: o.grit * v, lowpass: 2400 });
  s.tone({ wave: 'triangle', from: o.to * 1.5 * p, to: o.to * 1.2 * p, duration: o.len * 1.6, delay: 0.03, volume: (o.ring ?? 0.06) * v, vibrato: { rate: 40, depth: 30 } });
}

/** A brass-ish note: two detuned sawtooths swelling through a lowpass, an octave's body under. */
function brass(s: SynthKit, freq: number, at: number, len: number, loud = 1, bright = 1800) {
  const v = 0.08 * loud;
  s.tone({ wave: 'sawtooth', from: freq, to: freq, duration: len, delay: at, volume: v, lowpass: bright, attack: 0.05 });
  s.tone({ wave: 'sawtooth', from: freq * 1.006, to: freq * 1.006, duration: len, delay: at + 0.01, volume: v * 0.8, lowpass: bright * 0.8, attack: 0.07 });
  s.tone({ wave: 'triangle', from: freq / 2, to: freq / 2, duration: len * 0.9, delay: at, volume: v * 1.2, attack: 0.04 });
}

/** A timpani-ish hit: a low sine thump falling a little, and a skin of noise. */
function drum(s: SynthKit, freq: number, at: number, loud = 1) {
  s.tone({ wave: 'sine', from: freq * 1.25, to: freq, duration: 0.7, delay: at, volume: 0.45 * loud });
  s.noise({ duration: 0.18, delay: at, filter: 'lowpass', from: 600, to: 120, volume: 0.18 * loud });
}

export function defineSounds(client: Client) {
  const a = client.audio;

  // ---- Blasters: the Rebels' brighter and ringing, the Empire's lower and harsher ----
  a.define('blaster_rifle_rebels', (s) => bolt(s, { from: 2600, to: 340, len: 0.15, snap: 0.3, ring: 0.08 }));
  a.define('blaster_rifle_empire', (s) => bolt(s, { from: 2050, to: 250, len: 0.14, snap: 0.45, ring: 0.04, grit: 0.08 }));
  a.define('blaster_heavy_rebels', (s) => bolt(s, { from: 2100, to: 300, len: 0.1, snap: 0.25, loud: 0.8, ring: 0.05 }));
  a.define('blaster_heavy_empire', (s) => bolt(s, { from: 1700, to: 230, len: 0.1, snap: 0.35, loud: 0.8, ring: 0.03, grit: 0.1 }));
  const cycler = (s: SynthKit, o: { from: number; to: number; grit?: number }) => {
    bolt(s, { from: o.from, to: o.to, len: 0.32, snap: 0.6, loud: 1.25, ring: 0.07, grit: o.grit });
    s.tone({ wave: 'sine', from: 120 * s.pitch, to: 45, duration: 0.45, volume: 0.4 });
    s.noise({ duration: 0.55, delay: 0.1, filter: 'lowpass', from: 1300, to: 120, volume: 0.12 });
  };
  a.define('blaster_sniper_rebels', (s) => cycler(s, { from: 3300, to: 190 }));
  a.define('blaster_sniper_empire', (s) => cycler(s, { from: 2700, to: 150, grit: 0.08 }));
  a.define('blaster_pistol_rebels', (s) => bolt(s, { from: 2900, to: 430, len: 0.12, snap: 0.4, loud: 0.95, ring: 0.07 }));
  a.define('blaster_pistol_empire', (s) => bolt(s, { from: 2400, to: 330, len: 0.12, snap: 0.5, loud: 0.95, ring: 0.03, grit: 0.07 }));
  // (The first cut's names, for anything still naming them.)
  a.define('blaster_rifle', (s) => bolt(s, { from: 2400, to: 320, len: 0.16, snap: 0.35 }));
  a.define('blaster_heavy', (s) => bolt(s, { from: 1900, to: 260, len: 0.11, snap: 0.25, loud: 0.8 }));
  a.define('blaster_sniper', (s) => cycler(s, { from: 3200, to: 180 }));
  a.define('blaster_pistol', (s) => bolt(s, { from: 2800, to: 420, len: 0.13, snap: 0.4, loud: 0.9 }));

  // Heat: venting (R, or overheated), the dry click of an overheated trigger, the alarm as it overheats.
  a.define('vent', (s) => {
    s.noise({ duration: 0.14, filter: 'bandpass', from: 1800, to: 900, q: 2, volume: 0.2 });
    s.noise({ duration: 1.0, delay: 0.05, filter: 'highpass', from: 5200, to: 2200, volume: 0.2 });
    s.tone({ wave: 'sine', from: 1300, to: 260, duration: 0.95, delay: 0.05, volume: 0.07 });
    s.tone({ wave: 'triangle', from: 520, to: 780, duration: 0.12, delay: 1.0, volume: 0.1 });
  });
  a.define('overheat', (s) => {
    s.tone({ wave: 'square', from: 660, to: 640, duration: 0.07, volume: 0.09, lowpass: 2000 });
    s.noise({ duration: 0.05, filter: 'highpass', from: 4000, to: 3000, volume: 0.12 });
  });
  a.define('blaster_overheat', (s) => {
    for (let i = 0; i < 3; i++) s.tone({ wave: 'square', from: 880, to: 860, duration: 0.07, delay: i * 0.11, volume: 0.08, lowpass: 2600 });
    s.noise({ duration: 0.5, filter: 'bandpass', from: 3000, to: 6000, q: 0.8, volume: 0.14 });
    s.tone({ wave: 'sawtooth', from: 180, to: 90, duration: 0.35, volume: 0.1, lowpass: 900 });
  });

  // ---- Bolts landing, burning, going by ----
  a.define('bolt_hit', (s) => {
    const p = s.pitch;
    s.noise({ duration: 0.06, filter: 'highpass', from: 6000 * p, to: 3000, volume: 0.35 });
    s.tone({ wave: 'square', from: 1500 * p, to: 240 * p, duration: 0.09, volume: 0.1, lowpass: 3500 });
    s.noise({ duration: 0.32, delay: 0.02, filter: 'bandpass', from: 2600 * p, to: 5200, q: 3, volume: 0.12 });
  });
  a.define('bolt_burn', (s) => {
    const p = s.pitch;
    s.tone({ wave: 'sine', from: 240 * p, to: 70, duration: 0.14, volume: 0.35 });
    s.noise({ duration: 0.28, filter: 'bandpass', from: 3200 * p, to: 1600, q: 2.5, volume: 0.22 });
    s.noise({ duration: 0.05, filter: 'highpass', from: 5000, to: 4000, volume: 0.2 });
  });
  a.define('bolt_whizz', (s) => {
    const p = s.pitch;
    s.tone({ wave: 'sawtooth', from: 1500 * p, to: 380 * p, duration: 0.28, volume: 0.12, attack: 0.06, bandpass: { freq: 1400 * p, to: 500, q: 2 } });
    s.tone({ wave: 'sine', from: 900 * p, to: 260 * p, duration: 0.3, volume: 0.14, attack: 0.07 });
    s.noise({ duration: 0.22, filter: 'bandpass', from: 4200 * p, to: 1400, q: 1.5, volume: 0.16 });
  });

  // ---- The thermal detonator ----
  a.define('detonator_arm', (s) => {
    for (let i = 0; i < 3; i++) s.tone({ wave: 'square', from: 1500 + i * 300, to: 1500 + i * 300, duration: 0.045, delay: i * 0.09, volume: 0.09, lowpass: 3200 });
    s.tone({ wave: 'sine', from: 180, to: 420, duration: 0.3, delay: 0.27, volume: 0.1, attack: 0.1 });
  });
  a.define('toss', (s) => {
    s.noise({ duration: 0.2, filter: 'bandpass', from: 500, to: 1800, q: 1.2, volume: 0.28 });
  });
  a.define('clink', (s) => {
    const p = s.pitch;
    s.tone({ wave: 'triangle', from: 2350 * p, to: 2300 * p, duration: 0.16, volume: 0.16 });
    s.tone({ wave: 'sine', from: 3710 * p, to: 3650 * p, duration: 0.11, volume: 0.1 });
    s.noise({ duration: 0.03, filter: 'highpass', from: 5000, to: 4000, volume: 0.15 });
  });

  // ---- Sabers and heroes (the heroes' own voices may replace these) ----
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
    drum(s, 55, 0, 0.8);
    for (const [i, n] of [-14, -7, -2].entries()) brass(s, note(n), 0.05 + i * 0.16, 1.4, 1.1);
  });

  // ---- UI ----
  a.define('post_gained', (s) => {
    brass(s, note(-2), 0, 0.35, 1.2, 2600);
    brass(s, note(3), 0.12, 0.8, 1.3, 2600);
    s.tone({ wave: 'triangle', from: note(15), to: note(15), duration: 0.5, delay: 0.14, volume: 0.06 });
  });
  a.define('post_lost', (s) => {
    brass(s, note(-2), 0, 0.35, 1.2, 1600);
    brass(s, note(-9), 0.14, 0.9, 1.3, 1300);
    s.tone({ wave: 'square', from: 200, to: 190, duration: 0.5, delay: 0.14, volume: 0.05, lowpass: 700 });
  });
  a.define('ui_hero_ready', (s) => {
    for (const [i, n] of [3, 10, 15, 22].entries()) s.tone({ wave: 'triangle', from: note(n), to: note(n), duration: 0.5, delay: i * 0.07, volume: 0.09 });
    s.tone({ wave: 'sine', from: note(27), to: note(27), duration: 0.9, delay: 0.28, volume: 0.05, vibrato: { rate: 7, depth: 12 } });
  });
  a.define('low_tickets', (s) => {
    for (let i = 0; i < 2; i++) {
      s.tone({ wave: 'square', from: 196, to: 185, duration: 0.3, delay: i * 0.38, volume: 0.1, lowpass: 900 });
      s.tone({ wave: 'sawtooth', from: 98, to: 96, duration: 0.3, delay: i * 0.38, volume: 0.08, lowpass: 500 });
    }
  });
  a.define('ui_heartbeat', (s) => {
    s.tone({ wave: 'sine', from: 70, to: 45, duration: 0.14, volume: 0.35 });
    s.tone({ wave: 'sine', from: 62, to: 40, duration: 0.16, delay: 0.2, volume: 0.25 });
  });
  a.define('respawn', (s) => {
    s.noise({ duration: 0.5, filter: 'bandpass', from: 300, to: 2400, q: 1.1, volume: 0.14 });
    s.tone({ wave: 'sine', from: 220, to: 660, duration: 0.45, volume: 0.1, attack: 0.15 });
    s.tone({ wave: 'triangle', from: note(3), to: note(3), duration: 0.3, delay: 0.42, volume: 0.07 });
  });

  // ---- Stingers: the match opening, victory, defeat ----
  a.define('match_start', (s) => {
    drum(s, 49, 0);
    drum(s, 49, 0.2, 0.7);
    // A rising call: up a fourth, up again, and a held chord.
    brass(s, note(-14), 0.38, 0.5, 1.2);
    brass(s, note(-9), 0.62, 0.5, 1.2);
    brass(s, note(-7), 0.86, 0.3, 1.1);
    for (const n of [-9, -5, 0]) brass(s, note(n), 1.12, 1.7, 1.1, 2200);
    drum(s, 41, 1.12, 0.9);
  });
  a.define('victory', (s) => {
    drum(s, 55, 0);
    for (const [i, n] of [-7, -2, 2, 5].entries()) brass(s, note(n), 0.08 + i * 0.13, 0.45, 1.2, 2600);
    for (const n of [-2, 2, 5, 10]) brass(s, note(n), 0.62, 1.9, 1.1, 2800);
    drum(s, 55, 0.62);
    s.tone({ wave: 'triangle', from: note(22), to: note(22), duration: 1.4, delay: 0.66, volume: 0.05, vibrato: { rate: 6, depth: 10 } });
  });
  a.define('defeat', (s) => {
    drum(s, 41, 0, 0.9);
    brass(s, note(-12), 0.05, 0.6, 1.2, 1300);
    brass(s, note(-13), 0.45, 0.6, 1.2, 1200);
    for (const n of [-24, -17, -13]) brass(s, note(n), 0.9, 1.9, 1.1, 1000);
    drum(s, 36, 0.9, 1);
  });

  // ---- Ambience ----
  a.define('amb_wind', (s) => {
    // A gust: noise swelling and falling as it sweeps (layers, each fading, their loudness rising then falling).
    const p = s.pitch;
    for (let i = 0; i < 16; i++) {
      const swell = Math.sin((i / 15) * Math.PI);
      s.noise({ duration: 1.0, delay: i * 0.12, filter: 'bandpass', from: (240 + swell * 380) * p, to: (300 + swell * 300) * p, q: 0.9, volume: 0.012 + swell * 0.03 });
    }
  });
  a.define('amb_firefight', (s) => {
    // Far off: a few muffled bolts, one side answering the other.
    let t = 0;
    const n = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++) {
      const hi = Math.random() < 0.5;
      const f = hi ? 2200 : 1700;
      s.tone({ wave: 'sawtooth', from: f * (0.9 + Math.random() * 0.2), to: 260, duration: 0.12, delay: t, volume: 0.1, lowpass: 900 });
      s.noise({ duration: 0.05, delay: t, filter: 'lowpass', from: 900, to: 300, volume: 0.1 });
      t += 0.08 + Math.random() * 0.22;
    }
  });
  a.define('amb_boom', (s) => {
    s.tone({ wave: 'sine', from: 70, to: 30, duration: 1.2, volume: 0.35 });
    s.noise({ duration: 1.4, filter: 'lowpass', from: 500, to: 60, volume: 0.22 });
  });
  a.define('amb_flyby', (s) => {
    // A fighter screaming over: a wavering howl, falling as it passes, through a sweeping band.
    const p = s.pitch;
    for (const d of [1, 1.013, 0.988]) s.tone({ wave: 'sawtooth', from: 820 * d * p, to: 360 * d * p, duration: 2.4, volume: 0.05, attack: 0.9, bandpass: { freq: 900 * p, to: 500, q: 1.2 }, vibrato: { rate: 23, depth: 18 } });
    s.noise({ duration: 2.2, delay: 0.5, filter: 'bandpass', from: 1600, to: 400, q: 0.8, volume: 0.1 });
    s.tone({ wave: 'sine', from: 140 * p, to: 60 * p, duration: 2, delay: 0.6, volume: 0.12, attack: 0.5 });
  });
}
