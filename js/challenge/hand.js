// ─────────────────────────────────────────────
//  CH_Hand  –  Challenge mode hand cursor
//  Follows MediaPipe hand position.
//  "Click" = gesture transition (not hand close).
// ─────────────────────────────────────────────

class CH_Hand {
  constructor() {
    this.cx = SCREEN_W / 2;
    this.cy = SCREEN_H / 2;
    this.w  = CH.HAND_SIZE;
    this.h  = CH.HAND_SIZE;
    this.hitW = CH.HAND_HIT_W;
    this.hitH = CH.HAND_HIT_H;

    this.clicked = false;       // true for ONE frame on gesture change
    this.playerGesture = 'unknown';

    // visual scale – shrinks briefly when clicking
    this._scale    = 1.0;
    this._clickTimer = 0;
  }

  get hitRect() {
    return {
      x: this.cx - this.hitW / 2,
      y: this.cy - this.hitH / 2,
      w: this.hitW,
      h: this.hitH,
    };
  }

  update(now, mouse) {
    // Follow MediaPipe hand if camera is active, otherwise follow the mouse
    this.cx = GestureTracker.ready ? GestureTracker.x : (mouse ? mouse.x : this.cx);
    this.cy = GestureTracker.ready ? GestureTracker.y : (mouse ? mouse.y : this.cy);
    this.playerGesture = GestureTracker.gesture;

    // Detect gesture transition = "click"
    this.clicked = GestureTracker.gestureChanged;
    if (this.clicked) {
      this._clickTimer = 120; // ms to stay small
      GestureTracker.resetChanged();
    }

    if (this._clickTimer > 0) {
      this._clickTimer -= 16;
      this._scale = 0.75;
    } else {
      this._scale = 1.0;
    }
  }

  /**
   * Return targets that:
   *   1. Overlap the hand hitbox
   *   2. Match the player's current gesture  OR  are bombs
   */
  overlapping(targets) {
    const hr = this.hitRect;
    return targets.filter(t => {
      if (!rectsOverlap(hr, t.hitRect)) return false;
      return t.isBomb || t.gestureStr === this.playerGesture;
    });
  }

  /**
   * Kill overlapping targets; returns net score delta.
   */
  killTargets(targets) {
    if (!this.clicked) return 0;
    let delta = 0;
    for (const t of this.overlapping(targets)) {
      delta += t.kill(targets);
    }
    if (delta > 0)  GameAssets.playSound('slap',      { volume: 0.8 });
    if (delta < 0)  GameAssets.playSound('screaming', { volume: 0.6 });
    return delta * CH.SCORE_PER_KILL;
  }

  draw(ctx) {
    const img = GameAssets.get('hand_ch');
    const s   = this._scale;
    const w   = this.w * s, h = this.h * s;
    drawImg(ctx, img, this.cx, this.cy, w, h);
  }
}
