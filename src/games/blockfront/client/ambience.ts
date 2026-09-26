import type { ClientKit } from '@platform/client';

/**
 * The spaceport's air on each screen, while a match is on: desert wind in gusts, a firefight
 * somewhere off across the flats (muffled bolts, now and then a blast), and every so often a
 * fighter screaming over. The voices are `client/sounds.ts`'s (`amb_*`); each plays at a point
 * round the player, so it comes from somewhere.
 */
export function ambience(): ClientKit {
  let wind = 0;
  let fight = 4;
  let boom = 14;
  let flyby = 25;
  const rand = (a: number, b: number) => a + Math.random() * (b - a);

  return {
    name: 'blockfront.ambience',
    frame(client) {
      if (!client.running) return;
      const t = client.time;
      const me = client.me.position;
      /** A point `d` blocks off in a random direction, `up` above us. */
      const around = (d: number, up: number) => {
        const a = Math.random() * Math.PI * 2;
        return { x: me.x + Math.cos(a) * d, y: me.y + up, z: me.z + Math.sin(a) * d };
      };
      if (t >= wind) {
        wind = t + rand(1.9, 2.6);
        client.audio.play('amb_wind', { volume: 0.9, pitch: rand(0.85, 1.15) });
      }
      if (t >= fight) {
        fight = t + rand(1.2, 5);
        client.audio.play('amb_firefight', { at: around(rand(50, 90), 3), volume: 3.2, pitch: rand(0.9, 1.1) });
      }
      if (t >= boom) {
        boom = t + rand(12, 30);
        client.audio.play('amb_boom', { at: around(rand(70, 110), 0), volume: 3.5, pitch: rand(0.8, 1.1) });
      }
      if (t >= flyby) {
        flyby = t + rand(35, 80);
        client.audio.play('amb_flyby', { at: around(rand(25, 45), 30), volume: 3, pitch: rand(0.9, 1.1) });
      }
    },
  };
}
