import type { WidgetDefinition } from '@platform';

/**
 * Blockfront's HUD widgets (filled in by `server.ts` every tick; only what changed goes out):
 *
 * - `conquest` (everyone's, top middle): each side's tickets, draining bars toward the middle, and
 *   the command posts between them, each in its holder's colour, filling as it's taken.
 * - `status` (each player's, top right): what they fight as, their battle points, and whether a
 *   hero's theirs to take (H).
 */

export const CONQUEST: WidgetDefinition = {
  at: 'top',
  html: `
    <div class="bar">
      <div class="side a" style="--c: {{a.color}}; --fill: {{a.pct}}">
        <span class="name">{{a.short}}</span><span class="track"><span class="left"></span></span><span class="n">{{a.tickets}}</span>
      </div>
      <div class="posts">
        <div data-each="posts" class="post {{own}} {{state}}" style="--fill: {{fill}}; --lean: {{lean}}">
          <span class="ring"></span><span class="letter">{{id}}</span>
        </div>
      </div>
      <div class="side b" style="--c: {{b.color}}; --fill: {{b.pct}}">
        <span class="n">{{b.tickets}}</span><span class="track"><span class="left"></span></span><span class="name">{{b.short}}</span>
      </div>
    </div>
    <div class="clock">{{clock}}</div>`,
  css: `
    :scope { margin-top: 10px; display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .bar { display: flex; align-items: center; gap: 12px; padding: 6px 12px; background: rgba(8, 11, 16, 0.78); border: 1px solid rgba(255, 232, 31, 0.45); border-radius: 3px; }
    .side { display: flex; align-items: center; gap: 8px; color: var(--c); font: 700 13px var(--pixel); letter-spacing: 0.08em; }
    .n { font: 700 18px var(--pixel); min-width: 38px; text-align: center; color: #fff; }
    .track { width: 120px; height: 8px; background: rgba(255, 255, 255, 0.12); position: relative; }
    .left { position: absolute; top: 0; bottom: 0; width: calc(var(--fill) * 100%); background: var(--c); box-shadow: 0 0 8px var(--c); }
    .a .left { right: 0; }
    .b .left { left: 0; }
    .posts { display: flex; gap: 6px; }
    .post { position: relative; width: 28px; height: 28px; display: grid; place-items: center; }
    .ring { position: absolute; inset: 0; border: 2px solid rgba(255, 255, 255, 0.5); transform: rotate(45deg) scale(0.78); background: rgba(255, 255, 255, 0.08); }
    .post.rebels .ring { border-color: #ff9f43; background: rgba(255, 159, 67, 0.35); }
    .post.empire .ring { border-color: #7cc4ff; background: rgba(124, 196, 255, 0.35); }
    .post.moving .ring { animation: pulse 0.8s ease-in-out infinite; }
    .post.contested .ring { border-color: #fff; animation: pulse 0.35s ease-in-out infinite; }
    .letter { position: relative; font: 700 13px var(--pixel); color: #fff; text-shadow: 0 1px 0 #000; }
    .clock { font: 600 12px var(--sans); color: rgba(255, 255, 255, 0.8); letter-spacing: 0.1em; text-shadow: 0 1px 0 #000; }
    @keyframes pulse { 50% { opacity: 0.45; } }`,
};

export const STATUS: WidgetDefinition = {
  at: 'top-right',
  html: `
    <div class="panel" style="--c: {{color}}">
      <div class="role"><span class="side">{{side}}</span> {{role}}</div>
      <div class="bp"><span class="label">Battle points</span><span class="value">{{bp}}</span></div>
      <div class="hero" data-if="heroReady">HERO READY · press H</div>
      <div class="hero off" data-if="!heroReady">Hero at {{heroCost}}</div>
    </div>`,
  css: `
    :scope { margin: 14px -4px 0 0; }
    .panel { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; padding: 8px 12px; background: rgba(8, 11, 16, 0.72); border-right: 4px solid var(--c); color: #fff; }
    .role { font: 700 13px var(--pixel); letter-spacing: 0.06em; }
    .side { color: var(--c); }
    .bp { display: flex; gap: 8px; align-items: baseline; }
    .label { font: 600 10px var(--sans); text-transform: uppercase; letter-spacing: 0.12em; opacity: 0.7; }
    .value { font: 700 18px var(--pixel); color: var(--hud-accent, #ffe81f); }
    .hero { font: 700 11px var(--pixel); letter-spacing: 0.08em; color: #111; background: var(--hud-accent, #ffe81f); padding: 2px 6px; animation: glow 1s ease-in-out infinite; }
    .hero.off { background: none; color: rgba(255, 255, 255, 0.55); animation: none; }
    @keyframes glow { 50% { box-shadow: 0 0 14px var(--hud-accent, #ffe81f); } }`,
};
