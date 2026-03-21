// ─────────────────────────────────────────────
//  CH_Game  –  Challenge ("Catch Wind") mode
// ─────────────────────────────────────────────

class CH_Game {
  constructor() {
    this._bg     = new Background('normal');
    this._bgAudio= null;
    this._medal  = new CH_Medal();
    this._hand   = new CH_Hand();

    this._targets  = [];
    this._score    = 0;
    this._startTime= 0;
    this._timeLeft = CH.GAME_DURATION / 1000;
    this._spawnTimer = 0;
    this._phase    = 'playing'; // 'playing' | 'result'
  }

  reset() {
    this._targets  = [];
    this._score    = 0;
    this._startTime= performance.now();
    this._spawnTimer = performance.now();
    this._timeLeft = CH.GAME_DURATION / 1000;
    this._phase    = 'playing';
    this._medal.reset();
  }

  // ── Spawning ────────────────────────────────
  _spawn(now) {
    if (now - this._spawnTimer < CH.SPAWN_TIME) return;
    this._spawnTimer = now;

    const elapsed  = now - this._startTime;
    const ratio    = Math.min(elapsed / CH.GAME_DURATION, 1);

    // Chance of spawning a bomb increases 0→50% over the game
    const bombChance = ratio * 0.5;
    if (Math.random() < bombChance) {
      this._targets.push(new CH_Bomb());
    } else {
      this._targets.push(new CH_Handgesture());
    }

    // Extra gesture spawn in second half
    if (ratio > 0.5) {
      this._targets.push(new CH_Handgesture());
    }
  }

  // ── Update ──────────────────────────────────
  /**
   * @returns {'playing'|string}  returns 'mode' when player clicks Continue
   */
  update(ctx, now, mouse) {
    if (this._phase === 'playing') {
      return this._updatePlaying(ctx, now, mouse);
    } else {
      return this._updateResult(ctx, now, mouse);
    }
  }

  _updatePlaying(ctx, now, mouse) {
    const elapsed = now - this._startTime;
    this._timeLeft = Math.max((CH.GAME_DURATION - elapsed) / 1000, 0);

    this._spawn(now);

    // Hand – pass mouse for fallback when camera isn't active
    this._hand.update(now, mouse);
    const scoreDelta = this._hand.killTargets(this._targets);
    this._score += scoreDelta;

    // Move / cull targets
    for (let i = this._targets.length - 1; i >= 0; i--) {
      const t = this._targets[i];
      if (typeof t.update === 'function') t.update(now);
      if (t.isOffScreen()) this._targets.splice(i, 1);
    }

    // ── Draw ──
    this._bg.draw(ctx, now);
    for (const t of this._targets) t.draw(ctx);
    this._hand.draw(ctx);
    this._drawHUD(ctx, now);

    if (this._timeLeft <= 0) {
      this._phase = 'result';
      this._saveScore();
    }
    return 'challenge';
  }

  _updateResult(ctx, now, mouse) {
    this._bg.draw(ctx, now);
    drawOverlay(ctx, 0.5);

    this._medal.update(ctx, now, this._score);

    // Score text
    drawText(ctx, `Score: ${this._score}`, SCREEN_W/2, SCREEN_H/2 + 100, {
      font: FONT_MD, color: C.scoreText, shadow: true,
    });

    // Continue button
    if (drawButton(ctx, 'CONTINUE', SCREEN_W/2, SCREEN_H/2 + 190, mouse)) {
      return 'mode';
    }
    return 'challenge';
  }

  _drawHUD(ctx, now) {
    // Timer
    const tStr  = this._timeLeft.toFixed(1);
    const tColor= this._timeLeft < 5 ? C.timerLow : C.timerNormal;
    drawText(ctx, tStr + 's', SCREEN_W - 100, 50, {
      font: FONT_SM, color: tColor, shadow: true,
    });

    // Score
    drawText(ctx, `Score: ${this._score}`, 100, 50, {
      font: FONT_SM, color: C.scoreText, shadow: true, align: 'left',
    });

    // Current gesture label
    if (GestureTracker.gesture !== 'unknown') {
      drawText(ctx, GestureTracker.gesture, SCREEN_W/2, 38, {
        font: FONT_XS, color: 'rgba(255,255,255,0.7)', shadow: false,
      });
    }
  }

  _saveScore() {
    try {
      const today   = new Date().toLocaleDateString('en-US', { month:'2-digit', day:'2-digit' });
      const records = JSON.parse(localStorage.getItem('df_records') || '[]');
      records.push({ date: today, score: this._score });
      localStorage.setItem('df_records', JSON.stringify(records));
    } catch(e) {}
  }
}
