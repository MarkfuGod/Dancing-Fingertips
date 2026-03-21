// ─────────────────────────────────────────────
//  N_EndScreen  –  victory / defeat display
//  Ported from end.py
// ─────────────────────────────────────────────

class N_EndScreen {
  constructor() {
    this._active = false;
    this._type   = null;  // 'victory' | 'defeat'
    this._score  = 0;
    this._result = null;  // 'restart' | 'home' | null
  }

  show(type, score) {
    this._active = true;
    this._type   = type;
    this._score  = score;
    this._result = null;
  }

  get active() { return this._active; }
  get result()  { return this._result; }

  _starKey() {
    if (this._type === 'defeat') return 'end_zero';
    if (this._score >= 80)  return 'end_three';
    if (this._score >= 60)  return 'end_two';
    return 'end_one';
  }

  update(ctx, mouse) {
    if (!this._active) return;

    // Full-screen star image
    const bg = GameAssets.get(this._starKey());
    if (bg) ctx.drawImage(bg, 0, 0, SCREEN_W, SCREEN_H);
    else {
      ctx.fillStyle = this._type === 'victory' ? '#1a3a1a' : '#3a1a1a';
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
      drawText(ctx,
        this._type === 'victory' ? 'VICTORY!' : 'DEFEAT',
        SCREEN_W/2, 200,
        { font: FONT_LG, color: this._type === 'victory' ? '#4CAF50' : '#FF4444', shadow: true }
      );
    }

    drawText(ctx, `Score: ${this._score}`, SCREEN_W/2, SCREEN_H/2 + 20, {
      font: FONT_MD, color: '#FFEB3B', shadow: true,
    });

    // Buttons
    const BW = 80, BH = 80;
    const restartImg = GameAssets.get('btn_restart');
    const homeImg    = GameAssets.get('btn_home');

    const r1 = { x: SCREEN_W/2 - 120 - BW/2, y: SCREEN_H - 180 };
    const r2 = { x: SCREEN_W/2       - BW/2, y: SCREEN_H - 180 };

    if (restartImg) ctx.drawImage(restartImg, r1.x, r1.y, BW, BH);
    else drawButton(ctx, 'RESTART', r1.x + BW/2, r1.y + BH/2, mouse);

    if (homeImg) ctx.drawImage(homeImg, r2.x, r2.y, BW, BH);
    else drawButton(ctx, 'HOME', r2.x + BW/2, r2.y + BH/2, mouse);

    // Hit detection for icon buttons
    const hr = { x: r1.x, y: r1.y, w: BW, h: BH };
    const hh = { x: r2.x, y: r2.y, w: BW, h: BH };
    if (mouse.justDown && rectsOverlap({ x: mouse.x-1, y: mouse.y-1, w:2, h:2 }, hr)) {
      this._result = 'restart';
      this._active = false;
    }
    if (mouse.justDown && rectsOverlap({ x: mouse.x-1, y: mouse.y-1, w:2, h:2 }, hh)) {
      this._result = 'home';
      this._active = false;
    }
  }
}
