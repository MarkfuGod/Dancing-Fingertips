// ─────────────────────────────────────────────
//  Global settings & constants
// ─────────────────────────────────────────────

const SCREEN_W = 1200;
const SCREEN_H = 700;
const FPS = 60;

// ── Challenge Mode ──────────────────────────
const CH = {
  GAME_DURATION:  60000,   // ms
  SPAWN_TIME:     2000,    // ms between gesture spawns
  SPEED_MIN:      1.5,
  SPEED_MAX:      4.5,
  GESTURE_W:      90,
  GESTURE_H:      68,
  GESTURE_SCALE_MIN: 1.0,
  GESTURE_SCALE_MAX: 2.0,
  BOMB_W:         75,
  BOMB_H:         75,
  BOMB_SCALE_MIN: 1.2,
  BOMB_SCALE_MAX: 1.8,
  BOMB_PENALTY:   1,       // score multiplier penalty (kills → -20)
  HAND_SIZE:      200,
  HAND_HIT_W:     70,
  HAND_HIT_H:     90,
  ANIM_SPEED:     80,      // ms per bomb frame
  SCORE_PER_KILL: 20,
  GESTURES: ['fist', 'gun', 'love', 'thumbup', 'two'],
};

// ── Normal / Defence Mode ───────────────────
const NM = {
  ENEMY_SPEED:    1,
  BALL_SPEED:     20,
  FROZEN_MS:      10000,
  FIRE_MS:        1000,
  SPAWN_MIN:      2000,
  SPAWN_MAX:      6000,
  CARD_SPAWN_MIN: 2000,
  CARD_SPAWN_MAX: 5000,
  MAX_CARDS:      9,

  // y-centres for the 3 lanes
  LANE_Y:    [225, 380, 535],
  ENEMY_X:   1260,
  CART_X:    250,
  DEFEAT_X:  100,

  // drop-zone rects for placing cards (x, y, w, h)
  DROP_ZONES: [
    { x: 100, y: 160, w: 900, h: 130 },
    { x: 100, y: 310, w: 900, h: 130 },
    { x: 100, y: 460, w: 900, h: 130 },
  ],

  // y of ball centre after drop, per lane
  BALL_Y: [225, 380, 535],

  CARD_TYPES: ['card_ice', 'card_fire', 'card_golden', 'card_ground'],
  SCROLL_H:   133,
  SCORE_KILL: 20,
};

// ── Colours ─────────────────────────────────
const C = {
  title:        '#4CAF50',
  btnFill:      '#1565C0',
  btnHover:     '#1976D2',
  btnShadow:    '#0D47A1',
  btnText:      '#FFFFFF',
  timerNormal:  '#FFFFFF',
  timerLow:     '#FF4444',
  scoreText:    '#FFEB3B',
  overlay:      'rgba(0,0,0,0.55)',
};

// ── Medal thresholds ─────────────────────────
const MEDAL = { bronze: 60, silver: 80, gold: 100 };
