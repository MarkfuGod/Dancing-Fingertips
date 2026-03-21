// ─────────────────────────────────────────────
//  N_Collision  –  ball vs enemy effects
//  Ported from collision.py
// ─────────────────────────────────────────────

const N_Collision = {
  /**
   * Check all balls against all enemies.
   * Applies card effect, marks ball dead on hit.
   */
  ballVsEnemies(ballHandle, enemyHandle, now) {
    for (const ball of ballHandle.balls) {
      if (!ball.alive) continue;
      for (const enemy of enemyHandle.enemies) {
        if (!enemy.alive) continue;
        if (!rectsOverlap(ball.hitRect, enemy.hitRect)) continue;

        // Apply effect
        switch (ball.type) {
          case 'card_ice':
            if (!enemy.frozen && !enemy.enchanted) {
              enemy.frozen   = true;
              enemy.frozenAt = now;
            }
            break;
          case 'card_fire':
            enemy.fired   = true;
            enemy.firedAt = now;
            enemy.frozen  = false;
            break;
          case 'card_golden':
            enemy.enchanted = true;
            enemy.frozen    = false;
            break;
          case 'card_ground':
            // Push enemy right by 40px
            enemy.cx += 40;
            break;
        }
        ball.alive = false;
        break; // one enemy per ball
      }
    }
  },
};
