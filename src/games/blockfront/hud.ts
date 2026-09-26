import type { WidgetDefinition } from '@platform';
import hudCss from './hud.css?raw';
import { TEAMS } from './teams';

/**
 * Blockfront's HUD: its theme (`hud.css`, over the platform's pieces) and its widgets (filled in
 * by `server.ts` every tick; only what changed goes out):
 *
 * - `conquest` (everyone's, top middle): each side's reinforcements (the number, and a bar
 *   draining toward the middle; flashing once they're low), and the command posts between them:
 *   each a diamond edged in its holder's colour, filling from the bottom in the colour of the side
 *   it leans to as it's taken, pulsing in the taker's colour while it moves, flashing white
 *   while it's contested. The clock under them.
 * - `status` (each player's, top right): what they fight as, their battle points, and how near a
 *   hero is (a bar toward the cheapest), or HERO READY (H).
 */

/** Reinforcements at or under this share of a full side's are running low: they flash (server.ts warns the side at the same, `LOW_TICKETS`). */
const LOW = 0.2;

/** The scoreboard's columns after the name (the theme lays the two sides out by them: `boardCss`). */
export const BOARD_COLUMNS = ['Score', 'Kills', 'Deaths', 'Posts'] as const;

const [REB, IMP] = TEAMS;

export const CONQUEST: WidgetDefinition = {
  at: 'top',
  html: `
    <div class="bar">
      <div class="side a" style="--c: {{a.color}}; --fill: {{a.pct}}">
        <div class="head"><span class="name">{{a.short}}</span><span class="low" data-if="a.pct <= ${LOW}">LOW</span></div>
        <div class="count"><span class="track"><span class="left"></span></span><span class="n" data-if="a.pct > ${LOW}">{{a.tickets}}</span><span class="n flash" data-if="a.pct <= ${LOW}">{{a.tickets}}</span></div>
      </div>
      <div class="posts">
        <div data-each="posts" class="post own-{{own}} lean-{{lean}} by-{{by}} {{state}}" style="--fill: {{fill}}">
          <span class="gem"><span class="core"><span class="fill"></span></span></span>
          <span class="letter">{{id}}</span>
          <span class="cue"></span>
        </div>
      </div>
      <div class="side b" style="--c: {{b.color}}; --fill: {{b.pct}}">
        <div class="head"><span class="low" data-if="b.pct <= ${LOW}">LOW</span><span class="name">{{b.short}}</span></div>
        <div class="count"><span class="n" data-if="b.pct > ${LOW}">{{b.tickets}}</span><span class="n flash" data-if="b.pct <= ${LOW}">{{b.tickets}}</span><span class="track"><span class="left"></span></span></div>
      </div>
    </div>
    <div class="clock">{{clock}}</div>`,
  css: `
    :scope { margin-top: -4px; display: flex; flex-direction: column; align-items: center; --y: var(--hud-accent, #ffe81f); }
    .bar {
      position: relative; display: flex; align-items: center; gap: 14px; padding: 7px 16px 8px;
      background: linear-gradient(180deg, rgba(6, 9, 13, 0.82), rgba(6, 9, 13, 0.62));
      clip-path: polygon(0 0, 100% 0, calc(100% - 14px) 100%, 14px 100%);
    }
    .bar::before { content: ''; position: absolute; left: 0; right: 0; top: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--y) 20%, var(--y) 80%, transparent); opacity: 0.75; }
    .side { display: flex; flex-direction: column; gap: 3px; width: 168px; }
    .side.a { align-items: flex-start; }
    .side.b { align-items: flex-end; }
    .head { display: flex; align-items: center; gap: 6px; }
    .name { font: 700 10px var(--pixel); letter-spacing: 0.24em; color: var(--c); text-shadow: 0 0 8px color-mix(in srgb, var(--c) 45%, transparent); }
    .low { font: 700 8px var(--pixel); letter-spacing: 0.2em; padding: 1px 4px 0; color: #0b0f14; background: #ff3b30; animation: blink 0.6s steps(2) infinite; }
    .count { display: flex; align-items: center; gap: 8px; width: 100%; }
    .n { font: 700 21px/1 var(--pixel); color: #fff; min-width: 46px; font-variant-numeric: tabular-nums; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8); }
    .a .n { text-align: right; order: 2; }
    .b .n { text-align: left; }
    .n.flash { color: #ff5a4f; animation: blink 0.6s steps(2) infinite; }
    .track { flex: 1; height: 5px; background: rgba(255, 255, 255, 0.1); position: relative; overflow: hidden; }
    .a .track { order: 1; }
    .left { position: absolute; top: 0; bottom: 0; width: calc(var(--fill) * 100%); background: var(--c); box-shadow: 0 0 8px var(--c); transition: width 300ms ease; }
    .a .left { right: 0; }
    .b .left { left: 0; }
    .posts { display: flex; gap: 7px; padding: 0 4px; }
    .post { position: relative; width: 32px; height: 36px; display: grid; place-items: center; --own: rgba(233, 237, 242, 0.55); --lean: rgba(233, 237, 242, 0.5); --by: var(--y); }
    .post.own-rebels { --own: ${REB.color}; }
    .post.own-empire { --own: ${IMP.color}; }
    .post.lean-rebels { --lean: ${REB.color}; }
    .post.lean-empire { --lean: ${IMP.color}; }
    .post.by-rebels { --by: ${REB.color}; }
    .post.by-empire { --by: ${IMP.color}; }
    .gem { position: absolute; left: 1px; top: 3px; width: 30px; height: 30px; background: var(--own); clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); }
    .core { position: absolute; inset: 2px; background: rgba(8, 11, 16, 0.92); clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%); overflow: hidden; }
    .fill { position: absolute; left: 0; right: 0; bottom: 0; height: calc(var(--fill) * 100%); background: color-mix(in srgb, var(--lean) 78%, transparent); transition: height 250ms linear; }
    .post.own-rebels.lean-rebels .fill, .post.own-empire.lean-empire .fill { background: color-mix(in srgb, var(--own) 62%, #0b0f14); }
    .letter { position: relative; margin-top: -1px; font: 700 12px var(--pixel); color: #fff; text-shadow: 0 1px 2px #000, 0 0 4px #000; }
    .cue { position: absolute; left: 7px; right: 7px; bottom: -2px; height: 2px; background: var(--by); box-shadow: 0 0 6px var(--by); opacity: 0; }
    .post.moving .cue { opacity: 1; animation: blink 0.5s ease-in-out infinite; }
    .post.moving .gem { animation: breathe 0.9s ease-in-out infinite; }
    .post.contested .gem { background: #fff; animation: blink 0.3s steps(2) infinite; }
    .post.contested .cue { opacity: 1; background: #fff; box-shadow: 0 0 6px #fff; }
    .clock {
      margin-top: 0; padding: 2px 14px 3px; font: 700 11px var(--pixel); letter-spacing: 0.16em; color: rgba(233, 237, 242, 0.9);
      background: rgba(6, 9, 13, 0.62); clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 8px 100%);
      font-variant-numeric: tabular-nums;
    }
    @keyframes blink { 50% { opacity: 0.35; } }
    @keyframes breathe { 50% { filter: brightness(1.8); } }`,
};

export const STATUS: WidgetDefinition = {
  at: 'top-right',
  html: `
    <div class="card" style="--c: {{color}}; --p: calc({{bp}} / {{heroCost}})">
      <div class="who"><span class="mark"></span><span class="side">{{side}}</span><span class="role">{{role}}</span></div>
      <div class="bp"><span class="label">BATTLE POINTS</span><span class="value">{{bp}}</span></div>
      <div class="hero ready" data-if="heroReady"><span class="key">H</span><span>HERO READY</span></div>
      <div class="hero" data-if="!heroReady">
        <span class="as" data-if="hero">IN THE FIGHT AS A HERO</span>
        <span class="toward" data-if="!hero"><span class="bar"><span class="got"></span></span><span class="at">HERO {{heroCost}}</span></span>
      </div>
    </div>`,
  css: `
    :scope { margin: 0; align-self: flex-end; width: 236px; }
    .card {
      position: relative; display: flex; flex-direction: column; align-items: stretch; gap: 5px; padding: 8px 14px 10px 18px; color: #e9edf2;
      background: linear-gradient(270deg, rgba(6, 9, 13, 0.8), rgba(6, 9, 13, 0.55));
      clip-path: polygon(12px 0, 100% 0, 100% 100%, 0 100%, 0 12px);
      border-right: 2px solid var(--c);
    }
    .card::before { content: ''; position: absolute; left: 12px; right: 0; top: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--hud-accent, #ffe81f)); opacity: 0.7; }
    .who { display: flex; align-items: center; justify-content: flex-end; gap: 7px; }
    .mark { width: 8px; height: 8px; background: var(--c); transform: rotate(45deg); box-shadow: 0 0 6px var(--c); }
    .side { font: 700 10px var(--pixel); letter-spacing: 0.22em; color: var(--c); }
    .role { font: 700 14px var(--pixel); letter-spacing: 0.08em; color: #fff; text-transform: uppercase; }
    .bp { display: flex; justify-content: space-between; align-items: baseline; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 5px; }
    .label { font: 700 9px var(--pixel); letter-spacing: 0.2em; color: rgba(233, 237, 242, 0.55); }
    .value { font: 700 19px/1 var(--pixel); color: var(--hud-accent, #ffe81f); font-variant-numeric: tabular-nums; text-shadow: 0 0 10px rgba(255, 232, 31, 0.3); }
    .hero { display: flex; align-items: center; justify-content: flex-end; gap: 8px; font: 700 10px var(--pixel); letter-spacing: 0.16em; }
    .hero.ready { justify-content: center; padding: 4px 8px; color: #0b0f14; background: var(--hud-accent, #ffe81f); animation: glow 1.1s ease-in-out infinite; }
    .key { display: inline-grid; place-items: center; width: 16px; height: 16px; border: 1.5px solid #0b0f14; font: 700 10px var(--pixel); }
    .toward { display: flex; align-items: center; gap: 8px; width: 100%; }
    .bar { flex: 1; height: 4px; background: rgba(255, 255, 255, 0.1); position: relative; overflow: hidden; }
    .got { position: absolute; left: 0; top: 0; bottom: 0; width: calc(min(1, var(--p)) * 100%); background: var(--hud-accent, #ffe81f); opacity: 0.8; transition: width 300ms ease; }
    .at { color: rgba(233, 237, 242, 0.6); white-space: nowrap; }
    .as { color: var(--c); }
    @keyframes glow { 50% { box-shadow: 0 0 16px var(--hud-accent, #ffe81f); } }`,
};

/**
 * The scoreboard as two sides, the Rebels' on the left and the Empire's on the right: the
 * platform's one table (sorted by side, then score) laid out as a grid, each row put on its side
 * by its name's colour (the side's), numbered on its own side, under its own headings.
 */
function boardCss(): string {
  const rgb = (hex: string) => {
    const n = parseInt(hex.slice(1), 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
  };
  const empire = `tr:has(> .sb-name[style*="${rgb(IMP.color)}"])`;
  const cols = (from: number, row: string) => [1, 2, 3, 4, 5, 6].map((i) => `.sb-table ${row} > :nth-child(${i}) { grid-column: ${from + i - 1}; }`).join('\n');
  // The Empire's headings: the table's, the head's and the body's own boxes (6 of them), in the first row.
  const heads = [
    ['.sb-table::before', 8, '#'],
    ['.sb-table thead::before', 9, IMP.name],
    ...BOARD_COLUMNS.map((c, i) => [['.sb-table thead::after', '.sb-table tbody::before', '.sb-table tbody::after', '.sb-table::after'][i], 10 + i, c]),
  ] as [string, number, string][];
  return `
.sb-table {
  display: grid;
  grid-template-columns: 30px minmax(0, 1fr) 58px 50px 60px 50px 28px 30px minmax(0, 1fr) 58px 50px 60px 50px;
  grid-auto-flow: row dense;
  counter-reset: bf-a bf-b;
}
.sb-table thead,
.sb-table tbody,
.sb-table tr {
  display: contents;
}
${cols(1, 'tr')}
${cols(8, empire)}
${heads.map(([sel, col, text]) => `${sel} { content: ${JSON.stringify(text.toUpperCase())}; grid-row: 1; grid-column: ${col}; }`).join('\n')}
.sb-table th.sb-name::after { content: ${JSON.stringify(REB.name.toUpperCase())}; }
.sb-table thead::before { color: ${IMP.color}; }
.sb-table th.sb-name::after { color: ${REB.color}; }
.sb-table td.sb-rank { counter-increment: bf-a; }
.sb-table ${empire} > td.sb-rank { counter-increment: bf-b; }
.sb-table td.sb-rank::before { content: counter(bf-a); }
.sb-table ${empire} > td.sb-rank::before { content: counter(bf-b); }
`;
}

/** The HUD theme's stylesheet (`hud.theme.css`): `hud.css`, and the scoreboard's two sides. */
export const THEME_CSS = hudCss + boardCss();
