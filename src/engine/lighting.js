// Subtle warm additive radial glows layered over pre-lit pixel art.
export class Lighting {
  constructor(w, h) {
    this.w = w;
    this.h = h;
  }

  /**
   * @param ctx  screen-space context
   * @param o    { ox, oy, cabin, lights:[{x,y,r,alpha,clip:'inside'|'outside'|undefined}] }
   */
  render(ctx, o) {
    if (!o.lights?.length) return;
    ctx.save();
    ctx.translate(o.ox, o.oy);
    ctx.globalCompositeOperation = 'lighter';
    for (const l of o.lights) {
      const a = l.alpha ?? 0.2;
      if (a <= 0 || l.r <= 0) continue;
      ctx.save();
      this._clip(ctx, l.clip, o);
      const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
      g.addColorStop(0, `rgba(255,140,50,${a})`);
      g.addColorStop(0.5, `rgba(255,100,30,${a * 0.4})`);
      g.addColorStop(1, 'rgba(255,80,20,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }

  _clip(c, mode, o) {
    if (!mode) return;
    const r = o.cabin;
    c.beginPath();
    if (mode === 'inside') { c.rect(r.x, r.y, r.w, r.h); c.clip(); return; }
    c.rect(-o.ox - 20, -o.oy - 20, this.w + 40, this.h + 40);
    c.rect(r.x, r.y, r.w, r.h);
    c.clip('evenodd');
  }
}
