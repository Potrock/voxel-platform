import * as THREE from 'three';
import type { Input } from '../player/input';
import type { PlayerFrame } from '../sim/player';

const EYE = 1.62;
const SNEAK_EYE = 1.27;
const SLIDE_EYE = 0.95;

/**
 * Stepping up onto a stair or a slab lifts the body in one step (the engine's step-up, up to 0.6);
 * a rise on the ground between these is one. The eyes start where they were and spring up after
 * it (critically damped), so a flight of stairs is a smooth climb, not a jolt a step. The spring
 * stiffens with speed (`STEP_SPRING` standing, `STEP_PER_SPEED` times the walking speed), so the
 * eyes trail a climb by about the same (half a block or so) walking or sprinting, and never more
 * than `STEP_LAG`: soft enough that a climb goes up evenly, not in a surge a step.
 */
const STEP_MIN = 0.15;
const STEP_MAX = 0.65;
const STEP_SPRING = 16;
const STEP_PER_SPEED = 5;
const STEP_LAG = 1;

const smoothstep = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const clampPitch = (p: number) => Math.max(-Math.PI / 2 + 0.001, Math.min(Math.PI / 2 - 0.001, p));
/** Over the shoulder, the aim converges on the first thing under the crosshair this far out, and never nearer than this past the eyes. */
const AIM_FAR = 200;
const AIM_NEAR = 2;

/**
 * The first-person camera: mouse look (the client owns it, so it feels immediate; the view goes
 * to the simulation with the controls), then following the simulation's player with smooth eye
 * height, view bobbing and the sprint / flight FOV kick. With the game's `camera.orbit`, the
 * wheel pulls it back to circle a target (third person), turned by the same mouse look.
 */
export class PlayerCamera {
  sensitivity = 1;
  baseFov = 75;
  viewBobbing = true;
  /** Aiming down the sights: the field of view is divided by this (the runtime eases it). */
  aimZoom = 1;
  private eye = EYE;
  /** How far the eyes are below where they'd be, after stepping up (<= 0), and how fast they're catching up. */
  private stepLag = 0;
  private stepSpeed = 0;
  /** Where the feet were last frame, and if on the ground (null: no frame yet). */
  private feet: { y: number; ground: boolean } | null = null;
  private fov = 75;
  /** The last view the simulation set that we've taken on. */
  viewSeq = -1;
  private euler = new THREE.Euler(0, 0, 0, 'YXZ');
  /** Third person: how far the camera is from the point it circles (0: first person), and where the wheel is taking it. */
  distance = 0;
  private zoomTo = 0;
  /** The game's orbit (`camera.orbit`): how close and far the wheel goes; null for first person only. */
  private range: { min: number; max: number } | null = null;
  private orbitSeq = -1;
  /** The point circled last (kept while zooming back in after the orbit ends). */
  private circled = new THREE.Vector3();
  /** How far the camera can go from a point along a direction before a block stops it. */
  clearance: (from: THREE.Vector3, dir: THREE.Vector3, max: number) => number = (_from, _dir, max) => max;
  /**
   * What a movement ability asks of the camera now ([roll, pitch, dip], `AbilityBody.camera`), in
   * first person: eased toward, so a tumble that stops doesn't snap the view straight.
   */
  tilt: readonly [number, number, number] | null = null;
  private tiltNow: [number, number, number] = [0, 0, 0];
  /**
   * The camera's own turn, as the mouse turns it. `yaw` and `pitch` are the player's aim (what goes
   * to the simulation: where they look and shoot): the same, except over the shoulder (an orbit's
   * `shoulder`), where the aim is turned from their eyes to what's under the middle of the screen
   * (`aimOff`, worked out each frame in `follow`).
   */
  private camYaw = 0;
  private camPitch = 0;
  private aimOff = { yaw: 0, pitch: 0 };
  /** The orbit's camera beside the point it circles, across and up the view (blocks), and whether the wheel zooms it. */
  private shoulder: [number, number] | null = null;
  private wheel = true;
  /**
   * How far along a ray the first thing is that the aim should meet (a block, someone else's body),
   * or null for nothing within `max`: over the shoulder, the aim converges on it.
   */
  aimAt: (from: THREE.Vector3, dir: THREE.Vector3, max: number) => number | null = () => null;

  constructor(readonly camera: THREE.PerspectiveCamera) {}

  /** Where the player aims (radians; yaw 0 looks toward -z): the camera's turn, converged over the shoulder. */
  get yaw(): number {
    return this.camYaw + this.aimOff.yaw;
  }
  set yaw(v: number) {
    this.camYaw = v - this.aimOff.yaw;
  }
  get pitch(): number {
    return this.camPitch + this.aimOff.pitch;
  }
  set pitch(v: number) {
    this.camPitch = clampPitch(v - this.aimOff.pitch);
  }

  look(input: Input, active: boolean) {
    if (!active) return;
    const k = 0.0022 * this.sensitivity;
    this.camYaw -= input.mouseDX * k;
    this.camPitch = clampPitch(this.camPitch - input.mouseDY * k);
  }

  /** The game's orbit, as the newest frame has it: a new one starts from its distance. */
  setOrbit(o: PlayerFrame['orbit']) {
    if (!o) {
      this.range = null;
      this.shoulder = null;
      this.wheel = true;
      this.zoomTo = 0;
      return;
    }
    this.range = { min: o.min, max: o.max };
    this.shoulder = o.shoulder ?? null;
    this.wheel = o.wheel !== false;
    if (o.seq !== this.orbitSeq) {
      this.orbitSeq = o.seq;
      this.zoomTo = o.distance;
    }
    this.zoomTo = Math.max(o.min, Math.min(o.max, this.zoomTo));
  }

  /** The wheel zooms (the game has an orbit on that the wheel moves). */
  get zooms(): boolean {
    return this.range !== null && this.wheel;
  }

  /** Out of the player's eyes: their figure shows, their first-person hand doesn't. */
  get thirdPerson(): boolean {
    return this.distance > 1.2;
  }

  /** The wheel: notches out (positive) or in, each a bigger step further out; all the way in is first person. */
  zoom(notches: number) {
    const r = this.range;
    if (!r || !notches) return;
    let d = this.zoomTo;
    for (let i = 0; i < Math.abs(notches); i++) d = notches > 0 ? Math.max(2, d * 1.3) : d < 2.6 ? 0 : d / 1.3;
    this.zoomTo = Math.max(r.min, Math.min(r.max, d));
  }

  /**
   * Where the simulation put the player; it turns us when it says so (teleports, spawning).
   * `circle` is the point an orbit goes round (the ship), if the game set one.
   */
  follow(dt: number, f: PlayerFrame, circle: THREE.Vector3 | null = null) {
    // Newer only: frames can come out of order (a server's, played back smoothly).
    if (f.view.seq > this.viewSeq) {
      this.viewSeq = f.view.seq;
      this.camYaw = f.view.yaw;
      this.camPitch = f.view.pitch;
      this.aimOff.yaw = this.aimOff.pitch = 0;
    }
    const targetEye = f.sliding ? SLIDE_EYE : f.sneaking && !f.flying ? SNEAK_EYE : EYE;
    this.eye += (targetEye - this.eye) * (1 - Math.exp(-dt * (f.sliding ? 18 : 14)));
    this.stepUp(dt, f);

    const speed = Math.hypot(f.vx, f.vz);
    const bobAmt = this.viewBobbing && f.onGround && !f.flying ? Math.min(1, speed / 4.3) : 0;
    const phase = f.bob * Math.PI * 0.9;
    const bobY = Math.abs(Math.sin(phase)) * 0.055 * bobAmt;
    const bobX = Math.cos(phase) * 0.03 * bobAmt;

    // An ability's tilt, dip and pitch kick (first person only): the view, not the aim.
    const want = this.distance > 0 ? null : this.tilt;
    const ease = 1 - Math.exp(-dt * 30);
    const t = this.tiltNow;
    for (let i = 0; i < 3; i++) t[i] += ((want?.[i] ?? 0) - t[i]) * ease;
    const kicked = clampPitch(this.camPitch + t[1]);
    this.camera.position.set(f.x + Math.cos(this.camYaw) * bobX, f.y + this.eye + this.stepLag + bobY - t[2], f.z - Math.sin(this.camYaw) * bobX);
    this.euler.set(kicked, this.camYaw, Math.cos(phase) * 0.004 * bobAmt - t[0]);
    this.camera.quaternion.setFromEuler(this.euler);

    // Third person: back from the eyes, round the point the game's orbit circles (reached over the
    // first few blocks of zoom, so scrolling out glides from the eyes to the ship).
    this.distance += (this.zoomTo - this.distance) * (1 - Math.exp(-dt * 8));
    if (Math.abs(this.zoomTo - this.distance) < 0.01) this.distance = this.zoomTo;
    if (circle) this.circled.copy(circle);
    this.aimOff.yaw = this.aimOff.pitch = 0;
    if (this.distance > 0) {
      const eye = new THREE.Vector3(f.x, f.y + this.eye + this.stepLag, f.z);
      const pivot = eye.clone().lerp(this.circled, smoothstep(this.distance / 6));
      const q = this.camera.quaternion;
      const back = new THREE.Vector3(0, 0, 1).applyQuaternion(q);
      const pos = this.camera.position.copy(pivot).addScaledVector(back, Math.min(this.distance, this.clearance(pivot, back, this.distance)));
      // Over the shoulder: across and up from there (eased in over the first blocks of zoom), short of a wall.
      if (this.shoulder) {
        const k = smoothstep(this.distance / 3);
        const side = new THREE.Vector3(1, 0, 0).applyQuaternion(q).multiplyScalar(this.shoulder[0] * k);
        side.addScaledVector(new THREE.Vector3(0, 1, 0).applyQuaternion(q), this.shoulder[1] * k);
        const len = side.length();
        if (len > 1e-4) {
          side.divideScalar(len);
          pos.addScaledVector(side, Math.min(len, this.clearance(pos, side, len)));
        }
        this.converge(eye, k);
      }
    }

    const aiming = this.aimZoom > 1.01;
    const targetFov = (this.baseFov + (f.sprinting && !aiming ? 9 : 0) + (f.sliding ? 6 : 0) + (f.flying && speed > 12 ? 6 : 0)) / this.aimZoom;
    // Aiming snaps in quicker than the sprint kick eases.
    this.fov += (targetFov - this.fov) * (1 - Math.exp(-dt * (aiming ? 22 : 8)));
    if (Math.abs(this.camera.fov - this.fov) > 0.01) {
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }
    this.camera.updateMatrixWorld();
  }

  /**
   * Over the shoulder, the middle of the screen isn't along their eyes' line: aim their eyes at what
   * the middle of the screen shows (the first block or body along the camera's line, at least a
   * couple of blocks past their eyes), so what they shoot is what the crosshair is on. `k` eases it
   * in with the shoulder.
   */
  private converge(eye: THREE.Vector3, k: number) {
    const from = this.camera.position;
    const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(this.camera.quaternion);
    const ahead = new THREE.Vector3().subVectors(eye, from).dot(fwd);
    const hit = this.aimAt(from, fwd, AIM_FAR) ?? AIM_FAR;
    const at = from.clone().addScaledVector(fwd, Math.max(hit, ahead + AIM_NEAR));
    const dir = at.sub(eye).normalize();
    const yaw = Math.atan2(-dir.x, -dir.z);
    const pitch = Math.asin(Math.max(-1, Math.min(1, dir.y)));
    let dy = yaw - this.camYaw;
    dy -= Math.round(dy / (Math.PI * 2)) * Math.PI * 2;
    this.aimOff.yaw = dy * k;
    this.aimOff.pitch = (clampPitch(pitch) - this.camPitch) * k;
  }

  /** Start from where another camera on the same view has settled (its eye height and field of view): a replay's eyes take over without a jump. */
  settleFrom(other: PlayerCamera) {
    this.eye = other.eye;
    this.stepLag = other.stepLag;
    this.stepSpeed = other.stepSpeed;
    this.fov = other.fov;
  }

  /** A step up since last frame leaves the eyes behind; they spring up after it. */
  private stepUp(dt: number, f: PlayerFrame) {
    const last = this.feet;
    this.feet = { y: f.y, ground: f.onGround && !f.flying };
    const rise = last ? f.y - last.y : 0;
    if (last?.ground && this.feet.ground && rise > STEP_MIN && rise < STEP_MAX) this.stepLag = Math.max(-STEP_LAG, this.stepLag - rise);
    if (this.stepLag === 0 && this.stepSpeed === 0) return;
    // The spring's exact motion over dt (any frame rate): x(t) = (x0 + (v0 + w x0) t) e^(-w t).
    const w = Math.max(STEP_SPRING, STEP_PER_SPEED * Math.hypot(f.vx, f.vz));
    const x0 = this.stepLag;
    const v0 = this.stepSpeed;
    const e = Math.exp(-w * dt);
    const c = v0 + w * x0;
    this.stepLag = Math.min(0, (x0 + c * dt) * e);
    this.stepSpeed = (v0 - w * c * dt) * e;
    if (Math.abs(this.stepLag) < 1e-4 && Math.abs(this.stepSpeed) < 1e-3) this.stepLag = this.stepSpeed = 0;
  }

  viewDirection(out: THREE.Vector3): THREE.Vector3 {
    return this.camera.getWorldDirection(out);
  }
}
