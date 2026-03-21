// ─────────────────────────────────────────────
//  CH_Handgesture  –  flying gesture target
//  CH_Bomb         –  penalty gesture target
// ─────────────────────────────────────────────

class CH_Handgesture {
  constructor() {
    const name  = CH.GESTURES[rndInt(0, CH.GESTURES.length - 1)];
    const scale = rndFloat(CH.GESTURE_SCALE_MIN, CH.GESTURE_SCALE_MAX);
    this.gestureStr = name;
    this.isBomb     = false;
    this.w  = CH.GESTURE_W * scale;
    this.h  = CH.GESTURE_H * scale;

    this._init();
  }

  _init() {
    const edge = rndInt(0, 3); // 0=left, 1=right, 2=top, 3=bottom
    const speed = rndFloat(CH.SPEED_MIN, CH.SPEED_MAX);

    let sx, sy, vx, vy;
    if (edge === 0) {
      sx = -this.w; sy = rndFloat(0, SCREEN_H);
      vx = speed;   vy = rndFloat(-speed/2, speed/2);
    } else if (edge === 1) {
      sx = SCREEN_W + this.w; sy = rndFloat(0, SCREEN_H);
      vx = -speed;  vy = rndFloat(-speed/2, speed/2);
    } else if (edge === 2) {
      sx = rndFloat(0, SCREEN_W); sy = -this.h;
      vx = rndFloat(-speed/2, speed/2); vy = speed;
    } else {
      sx = rndFloat(0, SCREEN_W); sy = SCREEN_H + this.h;
      vx = rndFloat(-speed/2, speed/2); vy = -speed;
    }

    this.cx = sx; this.cy = sy;
    this.vx = vx; this.vy = vy;
    this._mirrored = vx < 0;
  }

  get hitRect() {
    return { x: this.cx - this.w/2, y: this.cy - this.h/2, w: this.w, h: this.h };
  }

  isOffScreen() {
    return this.cx < -this.w * 2  || this.cx > SCREEN_W + this.w * 2
        || this.cy < -this.h * 2  || this.cy > SCREEN_H + this.h * 2;
  }

  update() {
    this.cx += this.vx;
    this.cy += this.vy;
  }

  /**
   * Remove self from array; return +1 (score multiplier).
   */
  kill(arr) {
    const idx = arr.indexOf(this);
    if (idx !== -1) arr.splice(idx, 1);
    return 1;
  }

  draw(ctx) {
    const img = GameAssets.get(`gesture_${this.gestureStr}`);
    if (!img) return;
    ctx.save();
    if (this._mirrored) {
      ctx.translate(this.cx, this.cy);
      ctx.scale(-1, 1);
      ctx.drawImage(img, -this.w/2, -this.h/2, this.w, this.h);
    } else {
      ctx.drawImage(img, this.cx - this.w/2, this.cy - this.h/2, this.w, this.h);
    }
    ctx.restore();
  }
}

// ── Bomb ─────────────────────────────────────

class CH_Bomb extends CH_Handgesture {
  constructor() {
    super();
    const scale = rndFloat(CH.BOMB_SCALE_MIN, CH.BOMB_SCALE_MAX);
    this.w  = CH.BOMB_W * scale;
    this.h  = CH.BOMB_H * scale;
    this.gestureStr = 'bomb';
    this.isBomb     = true;
    this._frame     = 0;
    this._frameTime = 0;
    this._totalFrames = 6;
    this._init(); // re-init position/velocity with new size
  }

  kill(arr) {
    const idx = arr.indexOf(this);
    if (idx !== -1) arr.splice(idx, 1);
    return -CH.BOMB_PENALTY; // negative score
  }

  update(now) {
    this.cx += this.vx;
    this.cy += this.vy;
    // animate
    if (now - this._frameTime > CH.ANIM_SPEED) {
      this._frame = (this._frame + 1) % this._totalFrames;
      this._frameTime = now;
    }
  }

  draw(ctx) {
    const img = GameAssets.get(`bomb_${this._frame + 1}`);
    if (!img) return;
    ctx.drawImage(img, this.cx - this.w/2, this.cy - this.h/2, this.w, this.h);
  }
}
