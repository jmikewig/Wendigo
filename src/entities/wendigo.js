// The Wendigo: in-world stalker + the deck reveal cutscene.
import { RANGER_SIZE } from './player.js';

const WENDIGO_SIZE = Math.round(RANGER_SIZE * 1.55);
const DIR_ROW = { down: 0, left: 1, up: 2, right: 3 };

// Route waypoints on Watchtower 4 (world coords, feet position).
export const NODES = {
  SB: { x: 32, y: 80 },   // bottom of the stairs (centered x=32)
  ST: { x: 32, y: 215 },  // top of the stairs (bottom-left deck corner)
  DO: { x: 137, y: 215 }, // outside the door (centered x=137)
  DI: { x: 137, y: 166 }, // inside the door (centered x=137)
  BR: { x: 247, y: 215 }, // bottom-right deck corner (clear of right cabin wall 224.1)
  TR: { x: 247, y: 38 },  // top-right deck corner (clear of right cabin wall 224.1)
  LD: { x: 32, y: 38 },   // top-left landing
};
const LINKS = {
  SB: ['ST'], ST: ['SB', 'DO'], DO: ['ST', 'BR', 'DI'],
  BR: ['DO', 'TR'], TR: ['BR', 'LD'], LD: ['TR'], DI: ['DO'],
};
const ZONE_NODES = {
  stairs: ['SB', 'ST'],
  bottom: ['ST', 'DO', 'BR'],
  right: ['BR', 'TR'],
  top: ['TR', 'LD'],
  doorway: ['DO', 'DI'],
  inside: ['DI'],
};

/** Zones a point belongs to (deck corners belong to two). */
export function zonesOf(p) {
  if (p.x < 54 && p.y > 46 && p.y < 200) return ['stairs'];
  const z = [];
  if (p.y >= 200) z.push('bottom');
  if (p.x >= 225) z.push('right');
  if (p.y <= 46) z.push('top');
  if (!z.length && p.y > 172) z.push('doorway');
  if (!z.length) z.push('inside');
  return z;
}

const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

function nearestNode(names, p) {
  let best = names[0];
  for (const n of names) if (dist(NODES[n], p) < dist(NODES[best], p)) best = n;
  return best;
}

/** First hop from `from` toward `goal` along the deck graph. */
function nextHop(from, goal) {
  if (from === goal) return null;
  const prev = { [from]: null };
  const queue = [from];
  while (queue.length) {
    const n = queue.shift();
    if (n === goal) break;
    for (const m of LINKS[n]) if (!(m in prev)) { prev[m] = n; queue.push(m); }
  }
  if (!(goal in prev)) return null;
  let step = goal;
  while (prev[step] !== from) step = prev[step];
  return step;
}

export class Wendigo {
  constructor(assets) {
    this.assets = assets;
    this.active = false;
    this.state = 'hidden';
    this.x = 0;
    this.y = 0;
    this.alpha = 1;
    this.next = null;
    this.dir = 'down';
    this.anim = 0;
  }

  spawn(state = 'stalk') {
    this.active = true;
    this.state = state;
    this.alpha = 1;
    this.x = NODES.SB.x;
    this.y = NODES.SB.y;
    this.next = 'ST';
    this.dir = 'down';
    this.anim = 0;
  }
  flee() { this.state = 'flee'; }

  update(dt, player) {
    if (!this.active) return;
    this.anim += dt;
    const speed = { stalk: player.speed * 0.9, charge: 95, flee: 140 }[this.state] || 0;

    if (this.state === 'flee') {
      const dx = this.x - player.x, dy = this.y - player.y, d = Math.hypot(dx, dy) || 1;
      this.x += (dx / d) * speed * dt;
      this.y += (dy / d) * speed * dt;
      this.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      this.alpha -= dt * 1.2;
      if (this.alpha <= 0) { this.active = false; this.state = 'hidden'; }
      return;
    }

    const wz = zonesOf(this), pz = zonesOf(player);
    let tgt;
    if (wz.some((z) => pz.includes(z))) {
      tgt = player; this.next = null;
    } else {
      const goal = nearestNode(pz.flatMap((z) => ZONE_NODES[z]), player);
      if (!this.next) this.next = nearestNode(ZONE_NODES[wz[0]], this);
      if (dist(this, NODES[this.next]) < 2) this.next = nextHop(this.next, goal) || this.next;
      tgt = this.next === goal && dist(this, NODES[goal]) < 2 ? player : NODES[this.next];
    }
    const dx = tgt.x - this.x, dy = tgt.y - this.y, d = Math.hypot(dx, dy);
    if (d < 0.001) return;
    this.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    const stepLen = Math.min(d, speed * dt);
    this.x += (dx / d) * stepLen;
    this.y += (dy / d) * stepLen;
    if (this.x >= 220 && this.y > 46 && this.y < 200) {
      this.x = Math.max(242, Math.min(254, this.x));
    }
  }

  reached(player) {
    return this.active && this.state !== 'flee' && Math.hypot(player.x - this.x, player.y - this.y) < 13;
  }

  render(ctx) {
    if (!this.active) return;
    const charging = this.state === 'charge' || this.state === 'flee';
    const sheet = charging ? this.assets.wendigoCharge : this.assets.wendigoWalk;
    const fw = sheet.width / 4;
    const fh = sheet.height / 4;
    const row = DIR_ROW[this.dir] ?? 0;
    const col = Math.floor(this.anim * (charging ? 12 : 7)) % 4;
    const drawX = Math.round(this.x - WENDIGO_SIZE / 2);
    const drawY = Math.round(this.y - WENDIGO_SIZE);
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.drawImage(sheet, col * fw, row * fh, fw, fh, drawX, drawY, WENDIGO_SIZE, WENDIGO_SIZE);
    ctx.restore();
  }
}
