// ─────────────────────────────────────────────
//  main.js  –  Entry point, state machine,
//              Menu / ModeSelect / Extra screens
// ─────────────────────────────────────────────

// ── DOM refs ─────────────────────────────────
const canvas   = document.getElementById('gameCanvas');
const ctx      = canvas.getContext('2d');
const loadingEl= document.getElementById('loadingOverlay');
const fillEl   = document.getElementById('loadingFill');
const statusEl = document.getElementById('loadingStatus');
const startBtn = document.getElementById('startBtn');

// ── Responsive canvas scaling ─────────────────
function resizeCanvas() {
  const scaleX = window.innerWidth  / SCREEN_W;
  const scaleY = window.innerHeight / SCREEN_H;
  const scale  = Math.min(scaleX, scaleY);
  canvas.style.width  = `${SCREEN_W * scale}px`;
  canvas.style.height = `${SCREEN_H * scale}px`;
  // Update mouse transform
  _canvasScale = scale;
}
let _canvasScale = 1;
window.addEventListener('resize', resizeCanvas);

// ── Mouse tracking ────────────────────────────
const mouse = { x: 0, y: 0, down: false, justDown: false };
let _lastDown = false;

canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mouse.x = (e.clientX - r.left) / _canvasScale;
  mouse.y = (e.clientY - r.top)  / _canvasScale;
});
canvas.addEventListener('mousedown', () => { mouse.down = true; });
canvas.addEventListener('mouseup',   () => { mouse.down = false; });

// Touch support
canvas.addEventListener('touchmove', e => {
  e.preventDefault();
  const r  = canvas.getBoundingClientRect();
  const t  = e.touches[0];
  mouse.x  = (t.clientX - r.left) / _canvasScale;
  mouse.y  = (t.clientY - r.top)  / _canvasScale;
}, { passive: false });
canvas.addEventListener('touchstart', e => {
  e.preventDefault();
  const r  = canvas.getBoundingClientRect();
  const t  = e.touches[0];
  mouse.x  = (t.clientX - r.left) / _canvasScale;
  mouse.y  = (t.clientY - r.top)  / _canvasScale;
  mouse.down = true;
}, { passive: false });
canvas.addEventListener('touchend', () => { mouse.down = false; });

// ── State machine ─────────────────────────────
let state = 'menu'; // menu | mode | challenge | normal | records | extra

// Screen instances (created once)
let menuBg;
let challengeGame;
let normalGame;
let recordsScreen;
let bgBlurred;

function initScreens() {
  menuBg       = new Background('normal');
  bgBlurred    = new Background('blurred');
  challengeGame= new CH_Game();
  normalGame   = new N_Game();
  recordsScreen= new RecordsScreen();
}

// ── Menu screen ───────────────────────────────
function drawMenu(now) {
  menuBg.draw(ctx, now);
  drawOverlay(ctx, 0.35);

  drawText(ctx, 'DANCING', SCREEN_W/2, 130, {
    font: "bold 86px 'Cinzel', serif",
    color: C.title,
    shadow: true,
    shadowColor: 'rgba(0,200,80,0.4)',
    shadowOff: [4, 6],
  });
  drawText(ctx, 'FINGERTIPS', SCREEN_W/2, 220, {
    font: "bold 64px 'Cinzel', serif",
    color: '#ffffff',
    shadow: true,
  });

  const cx = SCREEN_W / 2;
  if (drawButton(ctx, 'START',   cx, 330, mouse)) return 'mode';
  if (drawButton(ctx, 'RECORDS', cx, 440, mouse)) return 'records';
  if (drawButton(ctx, 'MEDALS',  cx, 550, mouse)) return 'extra';

  // Quit button (web – just goes back to menu description)
  if (drawButton(ctx, 'QUIT',    cx, 660, mouse, { w:160, h:55 })) {
    // Can't really quit a web app; show a note
    drawText(ctx, 'Close this tab to quit', cx, 620, {
      font: FONT_XS, color: 'rgba(255,255,255,0.5)',
    });
  }
  return 'menu';
}

// ── Mode select ───────────────────────────────
function drawModeSelect(now) {
  bgBlurred.drawCover(ctx, now);
  drawOverlay(ctx, 0.3);

  drawText(ctx, 'CHOOSE MODE', SCREEN_W/2, 70, {
    font: FONT_MD, color: C.title, shadow: true,
  });

  // Thumbnails
  const imgCh = GameAssets.get('mode_challenge');
  const imgNm = GameAssets.get('mode_normal');
  const TW = 380, TH = 260;
  const y1 = 160;

  if (imgCh) ctx.drawImage(imgCh, 140, y1, TW, TH);
  else {
    ctx.fillStyle = '#223';
    ctx.beginPath(); ctx.roundRect(140, y1, TW, TH, 10); ctx.fill();
    drawText(ctx, 'CATCH WIND', 140 + TW/2, y1 + TH/2, { font: FONT_SM });
  }

  if (imgNm) ctx.drawImage(imgNm, 680, y1, TW, TH);
  else {
    ctx.fillStyle = '#223';
    ctx.beginPath(); ctx.roundRect(680, y1, TW, TH, 10); ctx.fill();
    drawText(ctx, 'DEFENCE', 680 + TW/2, y1 + TH/2, { font: FONT_SM });
  }

  if (drawButton(ctx, 'CATCH WIND', 330,  y1 + TH + 50, mouse)) return 'challenge';
  if (drawButton(ctx, 'DEFENCE',    870,  y1 + TH + 50, mouse)) return 'normal';
  if (drawButton(ctx, 'BACK',       120,  SCREEN_H - 50, mouse, { w:160, h:55 })) return 'menu';

  return 'mode';
}

// ── Extra / medals ────────────────────────────
function drawExtra(now) {
  bgBlurred.drawCover(ctx, now);
  drawOverlay(ctx, 0.3);

  drawText(ctx, 'MEDALS', SCREEN_W/2, 70, { font: FONT_MD, color: C.title, shadow: true });

  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('df_medals') || '{}'); } catch(e) {}

  const tiers  = ['bronze', 'silver', 'gold'];
  const labels = ['Bronze', 'Silver', 'Gold'];
  const thres  = [MEDAL.bronze, MEDAL.silver, MEDAL.gold];
  const xPos   = [200, 600, 1000];

  const now2 = performance.now();
  for (let i = 0; i < 3; i++) {
    const unlocked = !!saved[tiers[i]];
    const cx = xPos[i], cy = 330;

    // Medal image frames 1-5 (unlocked anim) or frames 6-10 (locked grey)
    const baseFrame = unlocked ? 1 : 6;
    const frameOff  = unlocked ? Math.floor(now2 / 600) % 2 : 0;  // slow toggle
    const img       = GameAssets.get(`medal_${tiers[i]}_${baseFrame + frameOff}`);
    const MW = 160, MH = 206;
    drawImg(ctx, img, cx, cy, MW, MH);

    if (!unlocked) {
      ctx.save();
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = '#000';
      ctx.beginPath();
      ctx.ellipse(cx, cy, MW/2, MH/2, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.globalAlpha = 1;
      drawText(ctx, '?', cx, cy, { font: FONT_LG, color: 'rgba(255,255,255,0.4)' });
      ctx.restore();
    }

    drawText(ctx, labels[i], cx, cy + 130, { font: FONT_XS, color: '#fff' });
    drawText(ctx, `Score ≥ ${thres[i]}`, cx, cy + 160, {
      font: '18px Cinzel', color: 'rgba(255,255,255,0.6)',
    });
  }

  if (drawButton(ctx, 'BACK', 120, SCREEN_H - 50, mouse, { w:160, h:55 })) return 'menu';
  return 'extra';
}

// ── Main game loop ────────────────────────────
let _bgMusic = null;

function startBGMusic() {
  if (_bgMusic) return;
  _bgMusic = GameAssets.playSound('bg_music', { volume: 0.16, loop: true });
}

// ── Universal cursor ─────────────────────────
// Tracks the hand / mouse position for all screens.
// When MediaPipe is active the challenge/normal games override this
// internally, but the menu screens always use the mouse.
function drawUniversalCursor(cx, cy) {
  const img = GameAssets.get('hand_ch');
  ctx.save();
  if (img) {
    // Draw hand image at 80px (compact cursor for menu screens)
    ctx.drawImage(img, cx - 40, cy - 40, 80, 80);
  } else {
    // Fallback: simple ring cursor
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,230,118,0.25)';
    ctx.fill();
    // Cross-hair
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + 20, cy);
    ctx.moveTo(cx, cy - 20); ctx.lineTo(cx, cy + 20);
    ctx.stroke();
  }
  ctx.restore();
}

function gameLoop(now) {
  // Compute justDown
  mouse.justDown  = mouse.down && !_lastDown;
  _lastDown       = mouse.down;

  let next = state;

  switch (state) {
    case 'menu':
      next = drawMenu(now);
      drawUniversalCursor(mouse.x, mouse.y);
      break;

    case 'mode':
      next = drawModeSelect(now);
      drawUniversalCursor(mouse.x, mouse.y);
      break;

    case 'challenge':
      // CH_Hand inside challengeGame already draws itself (follows mouse as fallback)
      next = challengeGame.update(ctx, now, mouse);
      break;

    case 'normal':
      // normalGame._drawHand already draws itself (follows mouse as fallback)
      next = normalGame.update(ctx, now, mouse);
      break;

    case 'records':
      next = recordsScreen.update(ctx, now, mouse);
      drawUniversalCursor(mouse.x, mouse.y);
      break;

    case 'extra':
      next = drawExtra(now);
      drawUniversalCursor(mouse.x, mouse.y);
      break;
  }

  // State transition
  if (next !== state) {
    if (next === 'challenge') challengeGame.reset();
    if (next === 'normal')    normalGame.reset();
    state = next;
  }

  requestAnimationFrame(gameLoop);
}

// ── Startup ───────────────────────────────────
async function startup() {
  resizeCanvas();

  // Load assets with progress bar
  await GameAssets.loadEager(
    pct => {
      fillEl.style.width = `${pct * 100}%`;
      statusEl.textContent = `Loading assets… ${Math.round(pct*100)}%`;
    },
    () => {
      statusEl.textContent = 'Ready!';
      startBtn.style.display = 'block';
    }
  );
}

// ── Called when player clicks "Enable Camera & Play" ──
window.onStartClicked = async () => {
  startBtn.disabled = true;
  statusEl.textContent = 'Requesting camera access…';

  try {
    await GestureTracker.init();
    statusEl.textContent = 'Camera connected!';
  } catch(e) {
    statusEl.textContent = 'Camera not available – using mouse fallback.';
  }

  // Fade out loading overlay
  loadingEl.classList.add('hidden');
  setTimeout(() => { loadingEl.style.display = 'none'; }, 500);

  initScreens();
  startBGMusic();
  requestAnimationFrame(gameLoop);
};

// Boot
startup();
