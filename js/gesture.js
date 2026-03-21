// ─────────────────────────────────────────────
//  GestureTracker  –  MediaPipe Hands wrapper
//
//  Ported from hand_tracking.py / normal_hand_tracking.py
//  Gesture classification uses the same angle algorithm
//  as the Python original.
// ─────────────────────────────────────────────

const GestureTracker = (() => {
  // ── public state ──────────────────────────
  let handX = SCREEN_W / 2;
  let handY = SCREEN_H / 2;
  let gesture    = 'unknown';
  let gesturePrev= 'unknown';
  let gestureChanged = false;   // true for ONE frame on transition

  // continuous flags (normal mode)
  let flagLove  = false;
  let flagSix   = false;
  let flagOne   = false;
  let flagTwo   = false;

  let initialized = false;
  let camStarted  = false;
  let handsModel  = null;

  const videoEl  = document.getElementById('videoElement');
  const camCanvas= document.getElementById('cameraCanvas');
  const camCtx   = camCanvas ? camCanvas.getContext('2d') : null;
  const camPreview = document.getElementById('cameraPreview');
  const gestureLabel = document.getElementById('gestureLabel');
  const guideEl = document.getElementById('gestureGuide');

  // ── Geometry helpers ─────────────────────
  function vec2DAngle(v1x, v1y, v2x, v2y) {
    const dot  = v1x * v2x + v1y * v2y;
    const mag1 = Math.hypot(v1x, v1y);
    const mag2 = Math.hypot(v2x, v2y);
    if (mag1 < 1e-9 || mag2 < 1e-9) return 65535;
    const cosA = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
    const deg  = Math.acos(cosA) * 180 / Math.PI;
    return deg > 180 ? 65535 : deg;
  }

  // Angle representing how "bent" a finger is.
  // v1: wrist → MCP   v2: PIP → TIP
  function fingerBendAngle(lm, wrist, mcp, pip, tip) {
    const v1x = lm[mcp].x - lm[wrist].x, v1y = lm[mcp].y - lm[wrist].y;
    const v2x = lm[tip].x  - lm[pip].x,  v2y = lm[tip].y  - lm[pip].y;
    return vec2DAngle(v1x, v1y, v2x, v2y);
  }

  // Returns [thumb, index, middle, ring, pinky] bend angles
  // MediaPipe landmark indices:
  //  0=wrist | 1,2,3,4=thumb | 5,6,7,8=index | 9,10,11,12=middle
  //  13,14,15,16=ring | 17,18,19,20=pinky
  function handAngles(lm) {
    return [
      fingerBendAngle(lm,  0,  2,  3,  4),  // thumb:  wrist→MCP2, IP→TIP
      fingerBendAngle(lm,  0,  5,  6,  8),  // index:  wrist→MCP5, PIP→TIP
      fingerBendAngle(lm,  0,  9, 10, 12),  // middle
      fingerBendAngle(lm,  0, 13, 14, 16),  // ring
      fingerBendAngle(lm,  0, 17, 18, 20),  // pinky
    ];
  }

  // Same classification logic as Python h_gesture()
  function classifyGesture(angles) {
    const [t, i, m, r, p] = angles;
    const ext = a => a < 65;
    const fld = a => a >= 65;

    // order matters – most specific first
    if (fld(t) && fld(i) && fld(m) && fld(r) && fld(p)) return 'fist';
    if (ext(t) && ext(i) && fld(m) && fld(r) && ext(p)) return 'love';
    if (ext(t) && ext(i) && fld(m) && fld(r) && fld(p)) return 'gun';
    if (ext(t) && fld(i) && fld(m) && fld(r) && ext(p)) return 'six';
    if (fld(t) && ext(i) && fld(m) && fld(r) && fld(p)) return 'one';
    if (fld(t) && ext(i) && ext(m) && fld(r) && fld(p)) return 'two';
    if (fld(t) && ext(i) && ext(m) && ext(r) && fld(p)) return 'three';
    if (ext(t) && fld(i) && fld(m) && fld(r) && fld(p)) return 'thumbup';
    return 'unknown';
  }

  // ── MediaPipe callback ───────────────────
  function onResults(results) {
    gestureChanged = false;
    flagLove = flagSix = flagOne = flagTwo = false;

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const lm = results.multiHandLandmarks[0];

      // Map landmark 9 (back of hand) to screen coords, mirrored
      const raw = lm[9];
      handX = (1 - raw.x) * SCREEN_W;
      handY = raw.y * SCREEN_H;

      const angles  = handAngles(lm);
      const newGest = classifyGesture(angles);

      if (newGest !== gesturePrev) {
        gestureChanged = true;
        gesturePrev    = gesture;
      }
      gesture = newGest;

      // continuous flags for normal mode
      flagLove = gesture === 'love';
      flagSix  = gesture === 'six';
      flagOne  = gesture === 'one';
      flagTwo  = gesture === 'two';
    } else {
      gesture = 'unknown';
    }

    if (gestureLabel) gestureLabel.textContent = gesture;

    // Draw camera preview with skeleton
    if (camCtx && results.image) {
      camCtx.save();
      camCtx.drawImage(results.image, 0, 0, camCanvas.width, camCanvas.height);
      if (results.multiHandLandmarks) {
        for (const lm of results.multiHandLandmarks) {
          drawConnectors(camCtx, lm, HAND_CONNECTIONS, { color:'#00FF00', lineWidth:1 });
          drawLandmarks(camCtx,  lm, { color:'#FF0000', lineWidth:1, radius:2 });
        }
      }
      camCtx.restore();
    }
  }

  // ── Init ─────────────────────────────────
  async function init() {
    if (initialized) return;
    initialized = true;

    // ── STEP 1: ask for camera FIRST ──────────
    // This guarantees the browser permission dialog fires before
    // anything MediaPipe-related can throw.
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 360, facingMode: 'user' },
      audio: false,
    });
    videoEl.srcObject = stream;
    await videoEl.play();

    // ── STEP 2: set up MediaPipe Hands ────────
    handsModel = new Hands({
      locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4/${f}`,
    });
    handsModel.setOptions({
      maxNumHands:            1,
      modelComplexity:        1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence:  0.5,
    });
    handsModel.onResults(onResults);

    // Pre-load WASM / model weights before we start the loop
    await handsModel.initialize();

    // ── STEP 3: drive inference loop manually ─
    // (avoids camera_utils conflicts and keeps the code self-contained)
    camStarted = true;
    if (camPreview) camPreview.style.display = 'block';
    if (guideEl)    guideEl.style.display    = 'block';

    async function processFrame() {
      if (!camStarted) return;
      try { await handsModel.send({ image: videoEl }); } catch(e) {}
      requestAnimationFrame(processFrame);
    }
    requestAnimationFrame(processFrame);
  }

  // Call once per game frame to reset the "changed" flag after it's been read
  function tick() {
    // gestureChanged auto-resets on next MediaPipe callback
  }

  return {
    init,
    tick,
    get x()              { return handX; },
    get y()              { return handY; },
    get gesture()        { return gesture; },
    get gestureChanged() { return gestureChanged; },
    get love()           { return flagLove; },
    get six()            { return flagSix; },
    get one()            { return flagOne; },
    get two()            { return flagTwo; },
    get ready()          { return camStarted; },
    resetChanged()       { gestureChanged = false; },
  };
})();
