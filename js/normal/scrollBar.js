// ─────────────────────────────────────────────
//  N_ScrollBar  –  card tray at top of screen
//  Ported from scroll_bar.py
// ─────────────────────────────────────────────

class N_ScrollBar {
  constructor() {
    this._initBudget();
    this.cards          = [];
    this._spawnTimer    = performance.now();
    this._spawnInterval = rndInt(NM.CARD_SPAWN_MIN, NM.CARD_SPAWN_MAX);
    this.rect = { x: 100, y: 0, w: 1000, h: NM.SCROLL_H };
  }

  _initBudget() {
    this.budget = {
      card_fire:   rndInt(3, 6),
      card_golden: rndInt(2, 4),
      card_ice:    rndInt(3, 6),
      card_ground: rndInt(3, 5),
    };
    // Snapshot the initial total for use by EnemyHandle
    this.initialTotal = Object.values(this.budget).reduce((s,v)=>s+v,0);
  }

  get totalBudget() {
    // Returns initial total (fixed at construction/reset time)
    return this.initialTotal;
  }

  reset() {
    this.cards = [];
    this._initBudget();
    this._spawnTimer    = performance.now();
    this._spawnInterval = rndInt(NM.CARD_SPAWN_MIN, NM.CARD_SPAWN_MAX);
  }

  _pickType() {
    const available = Object.entries(this.budget).filter(([,v])=>v>0);
    if (available.length === 0) return null;
    const [type] = available[rndInt(0, available.length-1)];
    return type;
  }

  _trySpawn(now) {
    if (this.cards.length >= NM.MAX_CARDS) return;
    if (now - this._spawnTimer < this._spawnInterval) return;
    const type = this._pickType();
    if (!type) return;

    this._spawnTimer    = now;
    this._spawnInterval = rndInt(NM.CARD_SPAWN_MIN, NM.CARD_SPAWN_MAX);
    this.budget[type]--;

    // Start card off right edge, slide in
    const card = new N_Card(type, this.rect.x + this.rect.w + 100);
    // Place target after last card
    const lastX = this.cards.length
      ? this.cards[this.cards.length-1].targetX + 90 + rndInt(0, 30)
      : this.rect.x + 50;
    card.targetX = Math.min(lastX, this.rect.x + this.rect.w - 50);
    this.cards.push(card);
  }

  /** Return card at position, or null */
  cardAt(cx, cy) {
    for (const c of this.cards) {
      if (!c.isDragged && !c.released && rectsOverlap(c.hitRect, {x:cx-1,y:cy-1,w:2,h:2}))
        return c;
    }
    return null;
  }

  /** Return a card to the tray after a failed drop */
  returnCard(card) {
    card.isDragged = false;
    card.released  = false;
    // Re-position at left of tray
    card.cx      = this.rect.x + 50;
    card.cy      = 66;
    card.targetX = this.rect.x + 50;
    card.sliding = false;
    if (!this.cards.includes(card)) this.cards.push(card);
  }

  update(now) {
    this._trySpawn(now);
    for (const c of this.cards) c.update();
    // Remove used/dead cards
    this.cards = this.cards.filter(c => c.alive && !c.used);
  }

  draw(ctx) {
    // Tray background
    const img = GameAssets.get('scroll_bar');
    if (img) ctx.drawImage(img, this.rect.x, this.rect.y, this.rect.w, NM.SCROLL_H);
    else {
      ctx.save();
      ctx.fillStyle = 'rgba(30,30,60,0.85)';
      ctx.roundRect(this.rect.x, this.rect.y, this.rect.w, NM.SCROLL_H, 8);
      ctx.fill();
      ctx.restore();
    }
    // Cards (non-dragged)
    for (const c of this.cards) {
      if (!c.isDragged) c.draw(ctx, this.rect);
    }
  }
}
