// ─────────────────────────────────────────────
//  N_Card  –  draggable elemental card
//  Ported from card.py
// ─────────────────────────────────────────────

class N_Card {
  constructor(type, startX) {
    this.type     = type;  // 'card_ice' | 'card_fire' | 'card_golden' | 'card_ground'
    this.w        = 80;
    this.h        = 100;

    // Scroll-bar position (right edge, slides left into tray)
    this.cx       = startX;
    this.cy       = 66;   // top tray centre y

    this.targetX  = -1;   // set by ScrollBar once position is known
    this.sliding  = true; // still sliding into place
    this.slideSpeed = 8;

    this.isDragged  = false;
    this.released   = false;   // dragged then dropped
    this.used       = false;   // ball has been fired
    this.alive      = true;
  }

  get hitRect() {
    return { x: this.cx - this.w/2, y: this.cy - this.h/2, w: this.w, h: this.h };
  }

  update() {
    if (this.sliding && !this.isDragged && this.targetX >= 0) {
      if (this.cx > this.targetX) {
        this.cx -= this.slideSpeed;
        if (this.cx < this.targetX) this.cx = this.targetX;
      } else {
        this.sliding = false;
      }
    }
  }

  draw(ctx, scrollRect) {
    if (!this.alive) return;
    const img = GameAssets.get(this.type);
    if (!img) return;

    // Clip drawing to scroll bar bounds (Python clips cards to scroll bar rect)
    ctx.save();
    ctx.beginPath();
    ctx.rect(scrollRect.x, scrollRect.y, scrollRect.w, scrollRect.h);
    ctx.clip();
    ctx.drawImage(img, this.cx - this.w/2, this.cy - this.h/2, this.w, this.h);
    ctx.restore();
  }

  // Draw when dragged – no clipping
  drawDragged(ctx) {
    if (!this.alive) return;
    const img = GameAssets.get(this.type);
    if (img) ctx.drawImage(img, this.cx - this.w/2, this.cy - this.h/2, this.w, this.h);
  }
}
