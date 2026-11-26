// DOM HUD + canvas guide arrow.
const $ = (id) => document.getElementById(id);

export class HUD {
  constructor() {
    this.banner = $('banner'); this.objective = $('objective'); this.prompt = $('prompt');
    this.torchWrap = $('torchWrap'); this.torchFill = $('torchFill');
    this.woodCount = $('woodCount'); this.woodNum = $('woodNum');
  }
  setObjective(text) { this.objective.textContent = text; }
  setBanner(text, alert = false, duration = 0) {
    clearTimeout(this._fadeT);
    clearTimeout(this._hideT);
    this.banner.classList.remove('fade-out');
    this.banner.textContent = text;
    this.banner.classList.toggle('hidden', !text);
    this.banner.classList.toggle('alert', alert);
    if (text && duration > 0) {
      this._fadeT = setTimeout(() => this.banner.classList.add('fade-out'), duration * 1000);
      this._hideT = setTimeout(() => {
        this.banner.classList.add('hidden');
        this.banner.classList.remove('fade-out');
        this.banner.textContent = '';
      }, (duration + 0.4) * 1000);
    }
  }
  setPrompt(text) {
    if (this.prompt.textContent !== text) this.prompt.textContent = text;
    this.prompt.classList.toggle('hidden', !text);
  }
  setTorch(visible, ratio = 1) {
    this.torchWrap.classList.toggle('hidden', !visible);
    this.torchWrap.classList.toggle('low', ratio < 0.3);
    this.torchFill.style.width = `${Math.max(0, ratio) * 100}%`;
  }
  setWood(n, visible) {
    this.woodNum.textContent = n;
    this.woodCount.classList.toggle('hidden', !visible);
  }
}

/** Pulsing pixel arrow floating above a world target. */
export function drawArrow(ctx, x, y, t) {
  const by = Math.round(y - 22 + Math.sin(t * 6) * 3);
  x = Math.round(x);
  const px = [
    '.XXXXX.',
    '.XYYYX.',
    '.XYYYX.',
    'XXYYYXX',
    '.XYYYX.',
    '..XYX..',
    '...X...',
  ];
  for (let r = 0; r < px.length; r++) {
    for (let c = 0; c < 7; c++) {
      const ch = px[r][c];
      if (ch === '.') continue;
      ctx.fillStyle = ch === 'X' ? '#1a0a00' : (Math.sin(t * 6) > 0 ? '#ffd34d' : '#ffb020');
      ctx.fillRect(x - 3 + c, by + r, 1, 1);
    }
  }
}
