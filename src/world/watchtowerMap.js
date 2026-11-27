// Watchtower 4 — 3/4 overhead layout: cabin + 3-sided wraparound deck + left staircase.
// All coordinates are world pixels. The structure is 256×240; main.js centers it on screen.

export const WORLD_W = 256, WORLD_H = 240;
export const CABIN = { x: 48, y: 36, w: 168, h: 158 };

// Areas the player's feet box may occupy.
const WALK = [
  { x: 63, y: 69, w: 152, h: 103 },  // cabin floor (x: 63..215, y: 69..172)
  { x: 11, y: 22, w: 251, h: 24 },   // top deck + top-left landing (x: 11..262, y: 22..46)
  { x: 225, y: 22, w: 37, h: 202 },  // right deck (x: 225..262, y: 22..224)
  { x: 11, y: 202, w: 251, h: 22 },  // bottom deck (x: 11..262, y: 202..224)
];
const DOORWAY = { x: 126, y: 162, w: 23, h: 48 }; // x: 126..149, y: 162..210

// Furniture footprints (block movement).
export const SOLIDS = {
  workbench: { x: 63, y: 50, w: 39, h: 38 },  // x: 63..102, y: 50..88
  fireplace: { x: 113, y: 50, w: 47, h: 38 }, // x: 113..160, y: 50..88
  backGap: { x: 158, y: 50, w: 26, h: 38 },   // x: 158..184, y: 50..88 (prevents clipping behind FG4 wall)
  bed: { x: 182, y: 50, w: 34, h: 61 },       // x: 182..216, y: 50..111
  kitchen: { x: 194, y: 111, w: 22, h: 61 },  // x: 194..216, y: 111..172
  desk: { x: 63, y: 128, w: 26, h: 44 },      // x: 63..89, y: 128..172
};

const inRect = (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

export class WatchtowerMap {
  constructor(assets) {
    this.doorLocked = true;
    this.assets = assets;
  }

  /** Feet box is (x-7..x+7, y-4..y). */
  canStand(x, y) {
    const areas = this.doorLocked ? WALK : [...WALK, DOORWAY];
    const halfW = 7;
    const corners = [[x - halfW, y - 4], [x + halfW, y - 4], [x - halfW, y], [x + halfW, y]];
    for (const [px, py] of corners) if (!areas.some((a) => inRect(a, px, py))) return false;
    for (const s of Object.values(SOLIDS)) {
      if (x + halfW > s.x && x - halfW < s.x + s.w && y > s.y && y - 4 < s.y + s.h) return false;
    }
    return true;
  }

  getStateIndex(dir) {
    if (dir.fireLit) return 4;
    if (dir.revealing) return 3;
    if (dir.journalRead) return 2;
    return 1;
  }

  renderBase(ctx, dir, W, H) {
    const woodTaken = !dir.g.items.wood.visible;
    const drawNoWoodPatch = () => {
      if (!woodTaken) return;
      const src = this.assets.base3a;
      const sx = 262, sy = 68, sw = 68, sh = 56;
      ctx.drawImage(
        src,
        sx, sy, sw, sh,
        (sx / src.width) * W, (sy / src.height) * H,
        (sw / src.width) * W, (sh / src.height) * H
      );
    };

    if (dir.sleeping) {
      ctx.drawImage(this.assets.base5, 0, 0, W, H);
      drawNoWoodPatch();
      return;
    }
    if (dir.revealing && !dir.fireLit && dir.reveal < 1) {
      ctx.drawImage(this.assets.base2, 0, 0, W, H);
      ctx.save();
      ctx.globalAlpha = dir.reveal;
      ctx.drawImage(woodTaken ? this.assets.base3a : this.assets.base3, 0, 0, W, H);
      ctx.restore();
      return;
    }
    const state = this.getStateIndex(dir);
    const key = state === 3 && woodTaken ? 'base3a' : `base${state}`;
    ctx.drawImage(this.assets[key], 0, 0, W, H);
    if (state === 4) drawNoWoodPatch();
  }

  renderFireplaceFire(ctx, t) {
    const sheet = this.assets.fireplaceFire;
    const fw = sheet.width / 4;
    const fh = sheet.height;
    const col = Math.floor(t * 7) % 4;
    ctx.drawImage(sheet, col * fw, 0, fw, fh, 239, 74, 24, 24);
  }

  renderForegroundUpper(ctx, dir, W, H, splitY) {
    const img = this.assets[`fg${this.getStateIndex(dir)}`];
    const srcH = Math.round(img.height * (splitY / H));
    ctx.drawImage(img, 0, 0, img.width, srcH, 0, 0, W, splitY);
  }

  renderForegroundLower(ctx, dir, W, H, splitY) {
    const img = this.assets[`fg${this.getStateIndex(dir)}`];
    const srcY = Math.round(img.height * (splitY / H));
    ctx.drawImage(img, 0, srcY, img.width, img.height - srcY, 0, splitY, W, H - splitY);
  }
}
