// ─────────────────────────────────────────────
//  N_Ball + N_BallHandle
//  Ported from ball.py
// ─────────────────────────────────────────────

class N_Ball {
  constructor(type, cx, cy) {
    this.type  = type;  // 'card_ice'|'card_fire'|'card_golden'|'card_ground'
    this.cx    = cx;
    this.cy    = cy;
    this.w     = 50;
    this.h     = 50;
    this.speed = NM.BALL_SPEED;
    this.alive = true;
  }

  get hitRect() {
    return { x: this.cx - this.w/2, y: this.cy - this.h/2, w: this.w, h: this.h };
  }

  _imgKey() {
    // card_ice → ball_ice, card_fire → ball_fire, etc.
    return 'ball_' + this.type.replace('card_', '');
  }

  update() {
    this.cx += this.speed;
    if (this.cx > SCREEN_W + this.w) this.alive = false;
  }

  draw(ctx) {
    if (!this.alive) return;
    const img = GameAssets.get(this._imgKey());
    if (img) ctx.drawImage(img, this.cx - this.w/2, this.cy - this.h/2, this.w, this.h);
  }
}

// ─────────────────────────────────────────────

class N_BallHandle {
  constructor() { this.balls = []; }

  add(type, cx, cy) {
    this.balls.push(new N_Ball(type, cx, cy));
  }

  reset() { this.balls = []; }

  update() {
    for (let i = this.balls.length - 1; i >= 0; i--) {
      this.balls[i].update();
      if (!this.balls[i].alive) this.balls.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const b of this.balls) b.draw(ctx);
  }
}
