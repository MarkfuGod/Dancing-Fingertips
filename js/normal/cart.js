// ─────────────────────────────────────────────
//  N_Cart + N_CartHandle
//  Friendly cart at left end of each lane.
//  Charges right when hit by an enemy.
//  Ported from cart.py
// ─────────────────────────────────────────────

class N_Cart {
  constructor(lane) {
    this.lane      = lane;
    this.cx        = NM.CART_X;
    this.cy        = NM.LANE_Y[lane];
    this.w         = 80;
    this.h         = 80;
    this.speed     = 10;
    this.charging  = false;
    this.alive     = true;

    this._frame    = 0;
    this._frameTime= 0;
    this._totalFrames = 9;
    this._animSpeed   = 60; // ms per frame
  }

  get hitRect() {
    return { x: this.cx - this.w/2, y: this.cy - this.h/2, w: this.w, h: this.h };
  }

  update(now) {
    if (!this.alive) return;
    if (this.charging) {
      this.cx += this.speed;
      if (this.cx > SCREEN_W + this.w) this.alive = false;
      if (now - this._frameTime > this._animSpeed) {
        this._frame = (this._frame + 1) % this._totalFrames;
        this._frameTime = now;
      }
    }
  }

  draw(ctx, now) {
    if (!this.alive) return;
    const img = GameAssets.get(`cart_${this._frame + 1}`);
    if (img) ctx.drawImage(img, this.cx - this.w/2, this.cy - this.h/2, this.w, this.h);
  }
}

// ─────────────────────────────────────────────

class N_CartHandle {
  constructor() {
    this.carts = [new N_Cart(0), new N_Cart(1), new N_Cart(2)];
  }

  reset() {
    this.carts = [new N_Cart(0), new N_Cart(1), new N_Cart(2)];
  }

  /**
   * Check if any enemy hit a cart; charge it if so.
   * @param {N_Enemy[]} enemies
   */
  checkCollision(enemies) {
    for (const cart of this.carts) {
      if (!cart.alive || cart.charging) continue;
      for (const e of enemies) {
        if (e.lane === cart.lane && rectsOverlap(cart.hitRect, e.hitRect)) {
          cart.charging = true;
          e.alive       = false;
          break;
        }
      }
    }
  }

  update(now) {
    for (const c of this.carts) c.update(now);
  }

  draw(ctx, now) {
    for (const c of this.carts) c.draw(ctx, now);
  }
}
