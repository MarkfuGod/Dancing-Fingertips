// ─────────────────────────────────────────────
//  UI utilities  –  text, buttons, overlays
// ─────────────────────────────────────────────

const FONT_SM   = "bold 36px 'Cinzel', serif";
const FONT_MD   = "bold 56px 'Cinzel', serif";
const FONT_LG   = "bold 96px 'Cinzel', serif";
const FONT_XS   = "bold 22px 'Cinzel', serif";

const BTN_W = 240, BTN_H = 80;

/**
 * Draw text with optional shadow.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {object} opts
 */
function drawText(ctx, text, x, y, {
  font        = FONT_SM,
  color       = '#ffffff',
  align       = 'center',
  baseline    = 'middle',
  shadow      = false,
  shadowColor = 'rgba(0,0,0,0.7)',
  shadowOff   = [3, 3],
} = {}) {
  ctx.save();
  ctx.font         = font;
  ctx.textAlign    = align;
  ctx.textBaseline = baseline;
  if (shadow) {
    ctx.fillStyle = shadowColor;
    ctx.fillText(text, x + shadowOff[0], y + shadowOff[1]);
  }
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
}

/**
 * Draw a button and return true if it was clicked this frame.
 * mouseState must have .x .y .down .justDown
 */
function drawButton(ctx, text, cx, cy, mouse, {
  w      = BTN_W,
  h      = BTN_H,
  font   = FONT_XS,
  fgColor= '#ffffff',
} = {}) {
  const bx = cx - w / 2;
  const by = cy - h / 2;

  const hover = mouse.x >= bx && mouse.x <= bx + w
             && mouse.y >= by && mouse.y <= by + h;

  ctx.save();

  // shadow
  ctx.fillStyle = C.btnShadow;
  ctx.beginPath();
  ctx.roundRect(bx - 5, by + 5, w, h, 10);
  ctx.fill();

  // body
  ctx.fillStyle = hover ? C.btnHover : C.btnFill;
  ctx.beginPath();
  ctx.roundRect(bx, by, w, h, 10);
  ctx.fill();

  // label
  ctx.font         = font;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = fgColor;
  ctx.fillText(text, cx, cy);

  ctx.restore();

  return hover && mouse.justDown;
}

/**
 * Semi-transparent dark overlay for end screens / pauses.
 */
function drawOverlay(ctx, alpha = 0.5) {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${alpha})`;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  ctx.restore();
}

/**
 * Rect collision helper.
 * rect = {x, y, w, h}
 */
function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x
      && a.y < b.y + b.h && a.y + a.h > b.y;
}

/**
 * Return a random float in [min, max).
 */
function rndFloat(min, max) { return min + Math.random() * (max - min); }

/**
 * Return a random integer in [min, max].
 */
function rndInt(min, max) { return Math.floor(rndFloat(min, max + 1)); }

/**
 * Draw an image centred at (cx, cy) scaled to (w, h).
 * Returns early if img is null.
 */
function drawImg(ctx, img, cx, cy, w, h) {
  if (!img) return;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}
