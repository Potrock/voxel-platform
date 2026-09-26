import type { SynthKit } from '@platform';
import type { Client } from '@platform/client';

/**
 * The heroes' sounds, synthesised on each screen (`client.audio.define`; the server plays them by
 * name): a saber's ignition, hum, swings, cuts, clashes and deflections; the Force's push and
 * pull, a choke, lightning's crackle, the aura and the rage; the thrown saber's whirl; a leap and
 * its landing. All made here from oscillators and noise.
 */

/** The saber's buzz: two detuned saws beating, low-passed. */
function buzz(s: SynthKit, o: { from: number; to?: number; duration: number; volume: number; delay?: number; attack?: number; cutoff?: number }) {
  const p = s.pitch;
  s.tone({ wave: 'sawtooth', from: o.from * p, to: (o.to ?? o.from) * p, duration: o.duration, volume: o.volume, delay: o.delay, attack: o.attack, lowpass: o.cutoff ?? 700 });
  s.tone({ wave: 'sawtooth', from: o.from * 1.018 * p, to: (o.to ?? o.from) * 1.018 * p, duration: o.duration, volume: o.volume * 0.8, delay: o.delay, attack: o.attack, lowpass: o.cutoff ?? 700 });
}

export function defineHeroSounds(client: Client) {
  const a = client.audio;
  a.define('bfh_hum', (s) => {
    buzz(s, { from: 88, duration: 1.05, volume: 0.05, attack: 0.25, cutoff: 420 });
    s.tone({ wave: 'sine', from: 176 * s.pitch, duration: 1.05, volume: 0.035, attack: 0.25, vibrato: { rate: 5, depth: 3 } });
  });
  a.define('bfh_saber_ignite', (s) => {
    buzz(s, { from: 55, to: 120, duration: 0.45, volume: 0.2, cutoff: 1400 });
    s.noise({ duration: 0.18, filter: 'bandpass', from: 900, to: 3800, q: 1.5, volume: 0.22 });
    buzz(s, { from: 110, duration: 0.8, volume: 0.09, delay: 0.3, cutoff: 600 });
  });
  a.define('bfh_saber_swing', (s) => {
    const p = s.pitch;
    s.tone({ wave: 'sawtooth', from: 105 * p, to: 210 * p, duration: 0.3, volume: 0.22, lowpass: 1000, vibrato: { rate: 26, depth: 8 } });
    s.tone({ wave: 'sawtooth', from: 190 * p, to: 110 * p, duration: 0.26, delay: 0.08, volume: 0.14, lowpass: 900 });
    s.noise({ duration: 0.28, filter: 'bandpass', from: 500, to: 1700, q: 2.2, volume: 0.2 });
  });
  a.define('bfh_saber_hit', (s) => {
    const p = s.pitch;
    s.noise({ duration: 0.32, filter: 'highpass', from: 3200, to: 1200, volume: 0.35 });
    s.tone({ wave: 'square', from: 260 * p, to: 70 * p, duration: 0.3, volume: 0.16, lowpass: 1600 });
    buzz(s, { from: 140, to: 95, duration: 0.35, volume: 0.12, cutoff: 1200 });
  });
  a.define('bfh_saber_clash', (s) => {
    const p = s.pitch;
    s.noise({ duration: 0.22, filter: 'bandpass', from: 3400, to: 2200, q: 3, volume: 0.45 });
    s.tone({ wave: 'square', from: 1500 * p, to: 900 * p, duration: 0.14, volume: 0.12, lowpass: 5000 });
    s.tone({ wave: 'triangle', from: 740 * p, to: 700 * p, duration: 0.5, volume: 0.1, vibrato: { rate: 30, depth: 20 } });
    buzz(s, { from: 95, to: 70, duration: 0.45, volume: 0.18, cutoff: 1500 });
  });
  a.define('bfh_saber_deflect', (s) => {
    const p = s.pitch;
    s.tone({ wave: 'triangle', from: 2400 * p, to: 1300 * p, duration: 0.13, volume: 0.2 });
    s.noise({ duration: 0.06, filter: 'highpass', from: 4200, to: 3000, volume: 0.25 });
    buzz(s, { from: 150, to: 120, duration: 0.14, volume: 0.1, cutoff: 1500 });
  });
  a.define('bfh_guard_break', (s) => {
    s.noise({ duration: 0.45, filter: 'lowpass', from: 2400, to: 300, volume: 0.45 });
    s.tone({ wave: 'square', from: 170 * s.pitch, to: 55 * s.pitch, duration: 0.45, volume: 0.2, lowpass: 1200 });
  });
  a.define('bfh_force_push', (s) => {
    s.noise({ duration: 0.5, filter: 'lowpass', from: 1100, to: 160, volume: 0.55 });
    s.tone({ wave: 'sine', from: 120 * s.pitch, to: 42 * s.pitch, duration: 0.45, volume: 0.45 });
    s.noise({ duration: 0.3, filter: 'bandpass', from: 1800, to: 500, q: 1.2, volume: 0.15, delay: 0.03 });
  });
  a.define('bfh_force_pull', (s) => {
    s.noise({ duration: 0.45, filter: 'bandpass', from: 250, to: 1700, q: 1.4, volume: 0.35 });
    s.tone({ wave: 'sine', from: 50 * s.pitch, to: 140 * s.pitch, duration: 0.4, volume: 0.3 });
  });
  a.define('bfh_force_stance', (s) => {
    const p = s.pitch;
    s.tone({ wave: 'triangle', from: 660 * p, duration: 0.7, volume: 0.1, attack: 0.1, vibrato: { rate: 7, depth: 12 } });
    s.tone({ wave: 'triangle', from: 990 * p, duration: 0.7, volume: 0.07, attack: 0.15, delay: 0.05, vibrato: { rate: 6, depth: 14 } });
    buzz(s, { from: 110, duration: 0.6, volume: 0.08 });
  });
  a.define('bfh_saber_throw', (s) => {
    s.tone({ wave: 'sawtooth', from: 130 * s.pitch, to: 240 * s.pitch, duration: 0.5, volume: 0.2, lowpass: 1100, vibrato: { rate: 18, depth: 40 } });
    s.noise({ duration: 0.4, filter: 'bandpass', from: 600, to: 1800, q: 2, volume: 0.18 });
  });
  a.define('bfh_saber_spin', (s) => {
    s.tone({ wave: 'sawtooth', from: 170 * s.pitch, to: 120 * s.pitch, duration: 0.16, volume: 0.12, lowpass: 900 });
    s.noise({ duration: 0.12, filter: 'bandpass', from: 1400, to: 700, q: 2, volume: 0.08 });
  });
  a.define('bfh_saber_catch', (s) => {
    s.noise({ duration: 0.06, filter: 'highpass', from: 2500, to: 1500, volume: 0.25 });
    buzz(s, { from: 100, duration: 0.3, volume: 0.1 });
  });
  a.define('bfh_force_choke', (s) => {
    s.tone({ wave: 'sine', from: 58 * s.pitch, to: 46 * s.pitch, duration: 1.2, volume: 0.35, attack: 0.1 });
    // A strangled rasp, catching.
    for (let i = 0; i < 5; i++) s.noise({ duration: 0.16, filter: 'bandpass', from: 1100 - i * 60, to: 800, q: 7, volume: 0.16, delay: 0.1 + i * 0.24 });
  });
  a.define('bfh_force_rage', (s) => {
    buzz(s, { from: 72, to: 48, duration: 0.9, volume: 0.22, cutoff: 650 });
    s.noise({ duration: 0.7, filter: 'lowpass', from: 900, to: 200, volume: 0.25 });
  });
  a.define('bfh_crackle', (s) => {
    for (let i = 0; i < 4; i++) s.noise({ duration: 0.03 + Math.random() * 0.04, filter: 'highpass', from: 2500 + Math.random() * 3000, to: 1800, volume: 0.22, delay: Math.random() * 0.14 });
    s.tone({ wave: 'square', from: (60 + Math.random() * 60) * s.pitch, duration: 0.14, volume: 0.1, lowpass: 2500 });
  });
  a.define('bfh_lightning_chain', (s) => {
    s.tone({ wave: 'square', from: 1100 * s.pitch, to: 110 * s.pitch, duration: 0.3, volume: 0.16, lowpass: 4000 });
    for (let i = 0; i < 6; i++) s.noise({ duration: 0.04, filter: 'highpass', from: 3500, to: 2000, volume: 0.25, delay: i * 0.05 });
  });
  a.define('bfh_dark_aura', (s) => {
    buzz(s, { from: 55, duration: 1.4, volume: 0.16, attack: 0.3, cutoff: 380 });
    s.tone({ wave: 'sine', from: 220 * s.pitch, to: 105 * s.pitch, duration: 1.2, volume: 0.14, vibrato: { rate: 3, depth: 6 } });
    s.noise({ duration: 1.1, filter: 'bandpass', from: 300, to: 120, q: 2, volume: 0.15 });
  });
  a.define('bfh_saber_rush', (s) => {
    s.noise({ duration: 0.35, filter: 'bandpass', from: 600, to: 2400, q: 1.5, volume: 0.35 });
    buzz(s, { from: 120, to: 210, duration: 0.35, volume: 0.18, cutoff: 1400 });
  });
  a.define('bfh_force_leap', (s) => {
    s.noise({ duration: 0.45, filter: 'bandpass', from: 400, to: 1700, q: 1.2, volume: 0.3 });
    s.tone({ wave: 'sine', from: 180 * s.pitch, to: 480 * s.pitch, duration: 0.4, volume: 0.12 });
  });
  a.define('bfh_force_land', (s) => {
    s.noise({ duration: 0.7, filter: 'lowpass', from: 500, to: 70, volume: 0.65 });
    s.tone({ wave: 'sine', from: 80 * s.pitch, to: 32 * s.pitch, duration: 0.6, volume: 0.55 });
    buzz(s, { from: 100, to: 60, duration: 0.4, volume: 0.12 });
  });
  a.define('bfh_force_jump', (s) => {
    s.noise({ duration: 0.22, filter: 'bandpass', from: 500, to: 1300, q: 1.5, volume: 0.18 });
  });
}
