// ─────────────────────────────────────────────
//  N_Drag  –  gesture-based card dragging
//  Ported from drag.py
//
//  Gesture → card type mapping:
//    love          → card_ice
//    two           → card_fire
//    six           → card_golden
//    one (finger)  → card_ground
// ─────────────────────────────────────────────

class N_Drag {
  constructor() {
    this._held      = null;   // currently dragged card
    this._wasActive = false;  // previous-frame gesture-active state
  }

  /**
   * Call every frame.
   * @param {number} hx hand x
   * @param {number} hy hand y
   * @param {N_ScrollBar} scrollBar
   * @param {N_BallHandle} ballHandle
   */
  update(hx, hy, scrollBar, ballHandle, now) {
    const love = GestureTracker.love;
    const six  = GestureTracker.six;
    const one  = GestureTracker.one;
    const two  = GestureTracker.two;

    const active = love || six || one || two;

    if (!active) {
      // Release: drop card onto lane or return it
      if (this._held) {
        const dropped = this._tryDrop(this._held, ballHandle);
        if (!dropped) scrollBar.returnCard(this._held);
        this._held = null;
      }
      this._wasActive = false;
      return;
    }

    // Determine which card type matches the active gesture
    const neededType = love ? 'card_ice'
                     : two  ? 'card_fire'
                     : six  ? 'card_golden'
                     :        'card_ground';

    // If no card held yet, try to pick one up from the scroll bar
    if (!this._held) {
      for (const c of scrollBar.cards) {
        if (c.type === neededType && !c.isDragged && !c.used
            && rectsOverlap(c.hitRect, { x: hx - 50, y: hy - 60, w: 100, h: 120 })) {
          c.isDragged = true;
          this._held  = c;
          scrollBar.cards = scrollBar.cards.filter(x => x !== c);
          break;
        }
      }
    }

    // Move held card continuously with hand
    if (this._held) {
      this._held.cx = hx;
      this._held.cy = hy;
    }

    this._wasActive = true;
  }

  /**
   * Try to drop held card onto a lane drop zone.
   * Returns true if successfully placed.
   */
  _tryDrop(card, ballHandle) {
    for (let i = 0; i < NM.DROP_ZONES.length; i++) {
      const zone = NM.DROP_ZONES[i];
      const cardCentre = { x: card.cx - 1, y: card.cy - 1, w: 2, h: 2 };
      if (rectsOverlap(cardCentre, zone)) {
        // Fire ball into this lane from card drop position
        const bx = card.cx;
        const by = NM.BALL_Y[i];
        ballHandle.add(card.type, bx, by);
        card.used  = true;
        card.alive = false;
        return true;
      }
    }
    return false;
  }

  drawDragged(ctx) {
    if (this._held) this._held.drawDragged(ctx);
  }

  /** Draw lane drop zone hints while dragging */
  drawDropZones(ctx) {
    if (!this._held) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,100,0.5)';
    ctx.lineWidth   = 2;
    ctx.setLineDash([6, 4]);
    for (const z of NM.DROP_ZONES) {
      ctx.beginPath();
      ctx.roundRect(z.x, z.y, z.w, z.h, 6);
      ctx.stroke();
    }
    ctx.restore();
  }
}
