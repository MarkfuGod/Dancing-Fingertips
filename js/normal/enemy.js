// ─────────────────────────────────────────────
//  N_Enemy + N_EnemyHandle
//  Ported from enemy.py
// ─────────────────────────────────────────────

class N_Enemy {
  constructor(lane) {
    this.lane    = lane;           // 0, 1, 2
    this.cx      = NM.ENEMY_X;
    this.cy      = NM.LANE_Y[lane];
    this.w       = 80;
    this.h       = 90;
    this.speed   = NM.ENEMY_SPEED;
    this.alive   = true;

    // effect states
    this.frozen   = false;
    this.frozenAt = 0;
    this.fired    = false;
    this.firedAt  = 0;
    this.enchanted= false;   // moving right
    this.immune   = false;

    // animation
    this._frame     = 0;
    this._frameTime = 0;
    this._totalFrames = 6;
    this._animSpeed   = 100; // ms per frame
  }

  get hitRect() {
    return { x: this.cx - this.w/2, y: this.cy - this.h/2, w: this.w, h: this.h };
  }

  _advanceAnim(now) {
    if (now - this._frameTime > this._animSpeed) {
      this._frame = (this._frame + 1) % this._totalFrames;
      this._frameTime = now;
    }
  }

  update(now) {
    if (!this.alive) return;

    // Check fire burnout
    if (this.fired && now - this.firedAt >= NM.FIRE_MS) {
      this.alive = false;
      return;
    }
    // Check freeze expiry
    if (this.frozen && now - this.frozenAt >= NM.FROZEN_MS) {
      this.frozen = false;
    }

    if (!this.frozen) {
      if (this.enchanted) {
        this.cx += this.speed * 2;   // walks right faster
        if (this.cx > NM.ENEMY_X + this.w) this.alive = false;
      } else {
        this.cx -= this.speed;
      }
    }

    this._advanceAnim(now);
  }

  /** Returns true if enemy crossed the defeat line */
  crossedLine() {
    return this.cx <= NM.DEFEAT_X;
  }

  draw(ctx, now) {
    if (!this.alive) return;
    this._advanceAnim(now);

    const frameKey = this.enchanted
      ? `enemy_r_${this._frame + 1}`
      : `enemy_${this._frame + 1}`;
    const img = GameAssets.get(frameKey);
    if (img) ctx.drawImage(img, this.cx - this.w/2, this.cy - this.h/2, this.w, this.h);

    // Status effects
    if (this.frozen) {
      const fx = GameAssets.get('frozen_fx');
      if (fx) ctx.drawImage(fx, this.cx - this.w/2, this.cy - this.h/2, this.w, this.h);
    }
    if (this.fired) {
      const fi = Math.floor(((now % 300) / 300) * 3) + 1;
      const ffx = GameAssets.get(`fire_fx_${fi}`);
      if (ffx) ctx.drawImage(ffx, this.cx - 20, this.cy - this.h/2 - 10, 50, 60);
    }
    if (this.enchanted) {
      const dz = GameAssets.get('dizzy_fx');
      if (dz) ctx.drawImage(dz, this.cx - 10, this.cy - this.h/2 - 20, 40, 30);
    }
  }
}

// ─────────────────────────────────────────────

class N_EnemyHandle {
  constructor(totalBudget) {
    this.enemies      = [];
    this.totalBudget  = totalBudget;  // how many enemies to spawn
    this.remaining    = totalBudget;
    this._spawnTimer  = performance.now();
    this._spawnInterval = rndInt(NM.SPAWN_MIN, NM.SPAWN_MAX);
    this.killed       = 0;
  }

  reset(totalBudget) {
    this.enemies      = [];
    this.totalBudget  = totalBudget;
    this.remaining    = totalBudget;
    this._spawnTimer  = performance.now();
    this._spawnInterval = rndInt(NM.SPAWN_MIN, NM.SPAWN_MAX);
    this.killed       = 0;
  }

  _trySpawn(now) {
    if (this.remaining <= 0) return;
    if (now - this._spawnTimer < this._spawnInterval) return;
    this._spawnTimer    = now;
    this._spawnInterval = rndInt(NM.SPAWN_MIN, NM.SPAWN_MAX);
    const lane = rndInt(0, 2);
    const e    = new N_Enemy(lane);
    this.enemies.push(e);
    this.remaining--;
  }

  /**
   * Update all enemies.
   * Returns  0=ongoing  -1=defeat  -2=victory
   */
  update(now) {
    this._trySpawn(now);

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.update(now);
      if (!e.alive) {
        this.killed++;
        this.enemies.splice(i, 1);
        continue;
      }
      if (e.crossedLine()) return -1; // defeat
    }

    // Enchanted collision: enchanted enemy hits others
    for (const e of this.enemies.filter(en => en.enchanted)) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const other = this.enemies[i];
        if (other === e) continue;
        if (other.lane === e.lane && rectsOverlap(e.hitRect, other.hitRect)) {
          other.alive = false;
          e.alive     = false;
        }
      }
    }
    this.enemies = this.enemies.filter(e => e.alive);

    if (this.remaining <= 0 && this.enemies.length === 0) return -2; // victory
    return 0;
  }

  draw(ctx, now) {
    for (const e of this.enemies) e.draw(ctx, now);
  }
}
