// ─────────────────────────────────────────────
//  CH_Medal  –  end-of-game medal animation
//  Mirrors Python medal_ani class
// ─────────────────────────────────────────────

class CH_Medal {
  constructor() {
    this._frame     = 0;
    this._frameTime = 0;
    this._totalFrames = 5;
    this._animDone  = false;
    this._tier      = null;  // 'bronze' | 'silver' | 'gold' | null
  }

  reset() {
    this._frame    = 0;
    this._animDone = false;
    this._tier     = null;
  }

  _tierFor(score) {
    if (score >= MEDAL.gold)   return 'gold';
    if (score >= MEDAL.silver) return 'silver';
    if (score >= MEDAL.bronze) return 'bronze';
    return null;
  }

  // Call once per frame while showing result.
  // Returns true when animation is complete.
  update(ctx, now, score) {
    if (this._tier === null) {
      this._tier = this._tierFor(score);
      if (this._tier) this._unlock(this._tier);
    }

    if (!this._tier) return true; // no medal – skip animation

    const W = 245, H = 316;
    const cx = SCREEN_W / 2, cy = SCREEN_H / 2 - 60;

    if (!this._animDone && now - this._frameTime > 80) {
      if (this._frame < this._totalFrames - 1) {
        this._frame++;
        this._frameTime = now;
      } else {
        this._animDone = true;
      }
    }

    const img = GameAssets.get(`medal_${this._tier}_${this._frame + 1}`);
    drawImg(ctx, img, cx, cy, W, H);

    return this._animDone;
  }

  _unlock(tier) {
    try {
      const saved = JSON.parse(localStorage.getItem('df_medals') || '{}');
      saved[tier] = true;
      localStorage.setItem('df_medals', JSON.stringify(saved));
    } catch(e) {}
  }
}
