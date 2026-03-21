// ─────────────────────────────────────────────
//  Animated background
//  Tries to use the 120-frame PNG sequence first;
//  falls back to a canvas-drawn animated gradient
//  when images are missing (e.g. on GitHub Pages
//  if the asset folder wasn't committed).
// ─────────────────────────────────────────────

// Shared particle system for the fallback background
const _BG_PARTICLES = (() => {
  const COUNT  = 60;
  const pts    = [];
  for (let i = 0; i < COUNT; i++) {
    pts.push({
      x:  Math.random() * 1200,
      y:  Math.random() * 700,
      r:  Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      a:  Math.random() * Math.PI * 2,
    });
  }
  function update() {
    for (const p of pts) {
      p.x = (p.x + p.vx + 1200) % 1200;
      p.y = (p.y + p.vy +  700) %  700;
      p.a += 0.01;
    }
  }
  return { pts, update };
})();

function _drawFallbackBG(ctx, now, blurred) {
  // Slowly cycling hue
  const hue   = (now / 60) % 360;
  const hue2  = (hue + 60)  % 360;

  const grad = ctx.createLinearGradient(0, 0, SCREEN_W, SCREEN_H);
  grad.addColorStop(0,   `hsl(${hue},  60%, 8%)`);
  grad.addColorStop(0.5, `hsl(${hue2}, 50%, 5%)`);
  grad.addColorStop(1,   `hsl(${(hue + 120) % 360}, 55%, 7%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);

  // Subtle glow blobs
  const blobCount = blurred ? 3 : 5;
  for (let i = 0; i < blobCount; i++) {
    const bx  = SCREEN_W * (0.2 + i * 0.18 + 0.04 * Math.sin(now / 4000 + i));
    const by  = SCREEN_H * (0.3 + 0.3 * Math.sin(now / 5000 + i * 1.3));
    const br  = 140 + 60 * Math.sin(now / 3000 + i);
    const bh  = (hue + i * 50) % 360;
    const blob = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    blob.addColorStop(0,   `hsla(${bh}, 80%, 35%, 0.18)`);
    blob.addColorStop(1,   `hsla(${bh}, 80%, 35%, 0)`);
    ctx.fillStyle = blob;
    ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  }

  if (!blurred) {
    // Floating star particles
    _BG_PARTICLES.update();
    ctx.save();
    for (const p of _BG_PARTICLES.pts) {
      const alpha = 0.4 + 0.3 * Math.sin(p.a);
      ctx.fillStyle = `rgba(180,220,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

class Background {
  /**
   * @param {'normal'|'blurred'} type
   */
  constructor(type = 'normal') {
    this.type        = type;
    this.prefix      = type === 'blurred' ? 'bg_blur' : 'bg';
    this.totalFrames = 120;
    this.msPerFrame  = 100;   // 10 fps
  }

  _currentFrame(now) {
    return Math.floor(now / this.msPerFrame) % this.totalFrames;
  }

  _tryGetFrame(now) {
    const idx = this._currentFrame(now) + 1;
    return GameAssets.get(`${this.prefix}_${idx}`)
        || GameAssets.get(`${this.prefix}_1`);
  }

  draw(ctx, now) {
    const img = this._tryGetFrame(now);
    if (!img) {
      _drawFallbackBG(ctx, now, this.type === 'blurred');
      return;
    }
    // Centre image on canvas (Python blits at center 800×600)
    const sx = (SCREEN_W - img.width)  / 2;
    const sy = (SCREEN_H - img.height) / 2;
    // Fill edges first in case image is smaller than canvas
    _drawFallbackBG(ctx, now, this.type === 'blurred');
    ctx.drawImage(img, sx, sy);
  }

  drawCover(ctx, now) {
    const img = this._tryGetFrame(now);
    if (!img) {
      _drawFallbackBG(ctx, now, this.type === 'blurred');
      return;
    }
    ctx.drawImage(img, 0, 0, SCREEN_W, SCREEN_H);
  }
}
