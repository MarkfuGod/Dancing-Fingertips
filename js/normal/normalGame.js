// ─────────────────────────────────────────────
//  N_Game  –  Normal / Defence mode
//  Ported from normal_game.py + normal_main.py
// ─────────────────────────────────────────────

class N_Game {
  constructor() {
    this._scrollBar  = new N_ScrollBar();
    this._ballHandle = new N_BallHandle();
    this._enemyHandle= new N_EnemyHandle(this._scrollBar.totalBudget);
    this._cartHandle = new N_CartHandle();
    this._drag       = new N_Drag();
    this._endScreen  = new N_EndScreen();
    this._score      = 0;
    this._phase      = 'playing'; // 'playing' | 'end'
    this._bg         = null; // loaded lazily (NormalAssets/background1.png)
  }

  reset() {
    this._scrollBar.reset();
    this._ballHandle.reset();
    this._enemyHandle.reset(this._scrollBar.totalBudget);
    this._cartHandle.reset();
    this._drag       = new N_Drag();
    this._score      = 0;
    this._phase      = 'playing';
  }

  // ── Background drawing ─────────────────────
  _drawBG(ctx) {
    // Use a solid colour if the bg image is unavailable
    const img = GameAssets.get('bg_blur_1'); // reuse blurred bg as fallback
    if (img) ctx.drawImage(img, 0, 0, SCREEN_W, SCREEN_H);
    else {
      ctx.fillStyle = '#111122';
      ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
    }
  }

  // ── Lane visuals ───────────────────────────
  _drawLanes(ctx) {
    ctx.save();
    for (let i = 0; i < 3; i++) {
      const y  = NM.LANE_Y[i];
      // Lane floor stripe
      ctx.fillStyle = 'rgba(255,255,255,0.05)';
      ctx.fillRect(100, y - 55, 900, 110);

      // Hexagon at start of lane
      const hex = GameAssets.get('hexagon');
      if (hex) {
        ctx.drawImage(hex, 100, y - 55, 80, 110);
      } else {
        ctx.fillStyle = '#334';
        ctx.beginPath();
        ctx.arc(140, y, 40, 0, Math.PI*2);
        ctx.fill();
      }

      // Lane separator lines
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth   = 1;
      ctx.beginPath();
      ctx.moveTo(100, y - 55);
      ctx.lineTo(1100, y - 55);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── Progress bar ───────────────────────────
  _drawProgress(ctx) {
    const total   = this._enemyHandle.totalBudget;
    const killed  = this._enemyHandle.killed;
    const rate    = total > 0 ? killed / total : 0;

    const bgImg   = GameAssets.get('progress_bg');
    const fillImg = GameAssets.get('progress_fill');
    const px = 350, py = SCREEN_H - 60, pw = 500, ph = 44;

    if (bgImg)   ctx.drawImage(bgImg,  px, py, pw, ph);
    if (fillImg) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(px + 10, py + 6, (pw - 20) * rate, ph - 12);
      ctx.clip();
      ctx.drawImage(fillImg, px + 10, py + 6, pw - 20, ph - 12);
      ctx.restore();
    }
    if (!bgImg) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 6); ctx.fill();
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath(); ctx.roundRect(px + 4, py + 4, (pw - 8) * rate, ph - 8, 4); ctx.fill();
      ctx.restore();
    }
    drawText(ctx, `${killed} / ${total}`, px + pw/2, py + ph/2, {
      font: FONT_XS, color: '#fff', shadow: true,
    });
  }

  // ── Score ──────────────────────────────────
  _drawScore(ctx) {
    drawText(ctx, `Score: ${this._score}`, SCREEN_W - 20, SCREEN_H - 30, {
      font: FONT_XS, color: C.scoreText, align: 'right', shadow: true,
    });
  }

  // ── Gesture HUD ───────────────────────────
  _drawGestureHUD(ctx) {
    const g = GestureTracker.gesture;
    const labels = {
      love: 'ICE card ready', two: 'FIRE card ready',
      six:  'GOLD card ready', one: 'GROUND card ready',
    };
    const msg = labels[g] || '';
    if (msg) {
      drawText(ctx, msg, SCREEN_W/2, SCREEN_H - 30, {
        font: FONT_XS, color: 'rgba(255,255,100,0.9)', shadow: true,
      });
    }
  }

  // ── Hand cursor ───────────────────────────
  _drawHand(ctx, mouse) {
    const img = GameAssets.get('hand_nm');
    const s   = (GestureTracker.love || GestureTracker.six || GestureTracker.one || GestureTracker.two) ? 0.75 : 1.0;
    // Follow MediaPipe if camera active, else follow mouse
    const hx  = GestureTracker.ready ? GestureTracker.x : (mouse ? mouse.x : SCREEN_W / 2);
    const hy  = GestureTracker.ready ? GestureTracker.y : (mouse ? mouse.y : SCREEN_H / 2);
    if (img) {
      ctx.drawImage(img, hx - 75 * s, hy - 75 * s, 150 * s, 150 * s);
    } else {
      // Fallback ring
      ctx.save();
      ctx.strokeStyle = '#00e676'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(hx, hy, 18, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }

  // ── Main update ───────────────────────────
  /**
   * @returns {string} 'playing' | 'mode'
   */
  update(ctx, now, mouse) {
    if (this._endScreen.active) {
      this._endScreen.update(ctx, mouse);
      const r = this._endScreen.result;
      if (r === 'restart') { this.reset(); return 'normal'; }
      if (r === 'home')    return 'mode';
      return 'normal';
    }

    // ── Draw ──
    this._drawBG(ctx);
    this._drawLanes(ctx);

    // Scroll bar
    this._scrollBar.update(now);
    this._scrollBar.draw(ctx);

    // Drag drop zones hint
    this._drag.drawDropZones(ctx);

    // Enemies
    const result = this._enemyHandle.update(now);
    this._enemyHandle.draw(ctx, now);

    // Balls
    this._ballHandle.update();
    this._ballHandle.draw(ctx);

    // Collisions
    N_Collision.ballVsEnemies(this._ballHandle, this._enemyHandle, now);

    // Carts
    this._cartHandle.checkCollision(this._enemyHandle.enemies);
    this._cartHandle.update(now);
    this._cartHandle.draw(ctx, now);

    // Drag – use mouse position as fallback when camera not active
    const hx = GestureTracker.ready ? GestureTracker.x : (mouse ? mouse.x : SCREEN_W / 2);
    const hy = GestureTracker.ready ? GestureTracker.y : (mouse ? mouse.y : SCREEN_H / 2);
    this._drag.update(hx, hy, this._scrollBar, this._ballHandle, now);
    this._drag.drawDragged(ctx);

    // Score update from kills
    const prev = this._enemyHandle.killed;
    // (kills tracked continuously in enemy handle)

    // Hand
    this._drawHand(ctx, mouse);
    this._drawScore(ctx);
    this._drawProgress(ctx);
    this._drawGestureHUD(ctx);

    // Check game end
    if (result === -2) {
      this._endScreen.show('victory', this._score);
    } else if (result === -1) {
      this._endScreen.show('defeat', this._score);
    }

    // Score: award per kill delta
    this._score = this._enemyHandle.killed * NM.SCORE_KILL;

    return 'normal';
  }
}
