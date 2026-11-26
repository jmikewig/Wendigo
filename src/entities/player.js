// The fire ranger. (x, y) is the feet position.
export const RANGER_SIZE = 36;
const DIR_ROW = { down: 0, left: 1, up: 2, right: 3 };

export class Player {
  constructor(x, y, assets) {
    this.x = x; this.y = y;
    this.assets = assets;
    this.speed = 62;
    this.dir = 'down';
    this.moving = false;
    this.anim = 0;
    this.wood = 0;
    this.torchLit = false;
    this.torchMax = 20;
    this.torchTime = 0;
  }

  update(dt, input, map) {
    let dx = 0, dy = 0;
    if (input.down('KeyW', 'ArrowUp')) dy -= 1;
    if (input.down('KeyS', 'ArrowDown')) dy += 1;
    if (input.down('KeyA', 'ArrowLeft')) dx -= 1;
    if (input.down('KeyD', 'ArrowRight')) dx += 1;
    this.moving = dx !== 0 || dy !== 0;
    if (!this.moving) {
      this.anim = 1 / 7;
      return;
    }
    const len = Math.hypot(dx, dy);
    dx = (dx / len) * this.speed * dt;
    dy = (dy / len) * this.speed * dt;
    if (map.canStand(this.x + dx, this.y)) this.x += dx;
    if (map.canStand(this.x, this.y + dy)) this.y += dy;
    if (Math.abs(dx) > Math.abs(dy)) this.dir = dx > 0 ? 'right' : 'left';
    else this.dir = dy > 0 ? 'down' : 'up';
    this.anim += dt;
  }

  lightTorch() {
    if (this.wood <= 0) return false;
    this.wood--;
    this.torchLit = true;
    this.torchTime = this.torchMax;
    return true;
  }

  dist(o) { return Math.hypot(this.x - o.x, this.y - o.y); }

  render(ctx) {
    const sheet = this.torchLit ? this.assets.rangerTorch : this.assets.rangerUnlit;
    const fw = sheet.width / 4;
    const fh = sheet.height / 4;
    const row = DIR_ROW[this.dir] ?? 0;
    const col = this.moving ? Math.floor(this.anim * 7) % 4 : 0;
    const drawX = Math.round(this.x - RANGER_SIZE / 2);
    const drawY = Math.round(this.y - RANGER_SIZE);
    ctx.drawImage(sheet, col * fw, row * fh, fw, fh, drawX, drawY, RANGER_SIZE, RANGER_SIZE);
  }
}
