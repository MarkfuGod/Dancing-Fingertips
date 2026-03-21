// ─────────────────────────────────────────────
//  Animated background  –  120 PNG frames
//  Matches Python Background class behaviour
// ─────────────────────────────────────────────

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

  draw(ctx, now) {
    const idx = this._currentFrame(now) + 1;
    const img = GameAssets.get(`${this.prefix}_${idx}`)
              || GameAssets.get(`${this.prefix}_1`);

    if (!img) {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
      return;
    }

    // Centre image on canvas (Python blits at center 800×600 → same logic)
    const sx = (SCREEN_W - img.width)  / 2;
    const sy = (SCREEN_H - img.height) / 2;
    ctx.drawImage(img, sx, sy);
  }

  // Fill canvas ignoring centering – useful as a pure cover background
  drawCover(ctx, now) {
    const idx = this._currentFrame(now) + 1;
    const img = GameAssets.get(`${this.prefix}_${idx}`)
              || GameAssets.get(`${this.prefix}_1`);

    if (!img) {
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
      return;
    }
    ctx.drawImage(img, 0, 0, SCREEN_W, SCREEN_H);
  }
}
