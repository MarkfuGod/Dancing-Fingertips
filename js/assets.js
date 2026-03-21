// ─────────────────────────────────────────────
//  Asset loader  –  images & audio
//  All paths are relative to repo root
//  (Dancing-Fingertips/)
// ─────────────────────────────────────────────

const GameAssets = (() => {
  const BASE_CH = 'ChallengeMode/Assets';
  const BASE_NM = 'ChallengeMode/NormalAssets';

  // Image manifest  {key: path}
  const IMAGE_MANIFEST = {
    // hand cursors
    hand_ch:          `${BASE_CH}/hand.png`,
    hand_nm:          `${BASE_NM}/hand.png`,

    // challenge gestures
    gesture_fist:     `${BASE_CH}/handgesture/fist.png`,
    gesture_gun:      `${BASE_CH}/handgesture/gun.png`,
    gesture_love:     `${BASE_CH}/handgesture/love.png`,
    gesture_thumbup:  `${BASE_CH}/handgesture/thumbup.png`,
    gesture_two:      `${BASE_CH}/handgesture/two.png`,

    // bomb frames (1-6)
    bomb_1: `${BASE_CH}/bomb/1.png`,
    bomb_2: `${BASE_CH}/bomb/2.png`,
    bomb_3: `${BASE_CH}/bomb/3.png`,
    bomb_4: `${BASE_CH}/bomb/4.png`,
    bomb_5: `${BASE_CH}/bomb/5.png`,
    bomb_6: `${BASE_CH}/bomb/6.png`,

    // medals (bronze / silver / gold – frames 1-10 each)
    ...makeFrames('medal_bronze', `${BASE_CH}/medal/bronze/`, 10),
    ...makeFrames('medal_silver', `${BASE_CH}/medal/silver/`, 10),
    ...makeFrames('medal_gold',   `${BASE_CH}/medal/gold/`,   10),

    // mode thumbnails
    mode_challenge: `${BASE_CH}/Mode/challenge.png`,
    mode_normal:    `${BASE_CH}/Mode/normal.png`,

    // Background frames are NOT listed here because the 120-frame PNG
    // sequences are not committed to the repo. background.js uses a
    // procedural animated gradient fallback when these are absent.
    // If you do commit the frames, add them back with makeFrames().

    // normal mode assets
    hexagon:       `${BASE_NM}/hexagon.png`,
    scroll_bar:    `${BASE_NM}/scroll_bar/scroll_bar.png`,
    card_ice:      `${BASE_NM}/scroll_bar/card_ice.png`,
    card_fire:     `${BASE_NM}/scroll_bar/card_fire.png`,
    card_golden:   `${BASE_NM}/scroll_bar/card_golden.png`,
    card_ground:   `${BASE_NM}/scroll_bar/card_ground.png`,
    ball_ice:      `${BASE_NM}/ball/ice.png`,
    ball_fire:     `${BASE_NM}/ball/fire.png`,
    ball_golden:   `${BASE_NM}/ball/golden.png`,
    ball_ground:   `${BASE_NM}/ball/ground.png`,
    frozen_fx:     `${BASE_NM}/Collision_SE/frozen.png`,
    dizzy_fx:      `${BASE_NM}/Collision_SE/dizzy.png`,
    fire_fx_1:     `${BASE_NM}/Collision_SE/fire1.png`,
    fire_fx_2:     `${BASE_NM}/Collision_SE/fire2.png`,
    fire_fx_3:     `${BASE_NM}/Collision_SE/fire3.png`,
    // enemy walk left (6 frames)
    ...makeFrames('enemy', `${BASE_NM}/Enemy/`, 6),
    // enemy walk right (6 frames)
    ...makeFrames('enemy_r', `${BASE_NM}/Enemy_Reverse/`, 6),
    // cart (9 frames)
    ...makeFrames('cart', `${BASE_NM}/Cart/`, 9),
    // end screens
    end_zero:    `${BASE_NM}/game_res/zero_star.png`,
    end_one:     `${BASE_NM}/game_res/one_star.png`,
    end_two:     `${BASE_NM}/game_res/two_star.png`,
    end_three:   `${BASE_NM}/game_res/three_star.png`,
    btn_restart: `${BASE_NM}/game_res/restart.png`,
    btn_home:    `${BASE_NM}/game_res/home.png`,
    progress_bg: `${BASE_NM}/process_line/pogress.png`,
    progress_fill:`${BASE_NM}/process_line/rate_of_progress.png`,
  };

  function makeFrames(prefix, dir, count) {
    const obj = {};
    for (let i = 1; i <= count; i++) obj[`${prefix}_${i}`] = `${dir}${i}.png`;
    return obj;
  }

  // ── Sound manifest ───────────────────────
  const SOUND_MANIFEST = {
    bg_music:  `${BASE_CH}/Sounds/background.mp3`,
    slap:      `${BASE_CH}/Sounds/slap.wav`,
    screaming: `${BASE_CH}/Sounds/screaming.wav`,
  };

  // ── State ────────────────────────────────
  const imgs   = {};
  const sounds = {};
  let totalEager  = 0;
  let loadedEager = 0;
  let onProgress  = null;
  let onReady     = null;

  // Keys we load eagerly before showing Start button
  const EAGER_KEYS = [
    'hand_ch','hand_nm',
    'gesture_fist','gesture_gun','gesture_love','gesture_thumbup','gesture_two',
    'bomb_1','bomb_2','bomb_3','bomb_4','bomb_5','bomb_6',
    ...Array.from({length:10},(_,i)=>`medal_bronze_${i+1}`),
    ...Array.from({length:10},(_,i)=>`medal_silver_${i+1}`),
    ...Array.from({length:10},(_,i)=>`medal_gold_${i+1}`),
    'mode_challenge','mode_normal',
    'hexagon','scroll_bar',
    'card_ice','card_fire','card_golden','card_ground',
    'ball_ice','ball_fire','ball_golden','ball_ground',
    'frozen_fx','dizzy_fx','fire_fx_1','fire_fx_2','fire_fx_3',
    ...Array.from({length:6},(_,i)=>`enemy_${i+1}`),
    ...Array.from({length:6},(_,i)=>`enemy_r_${i+1}`),
    ...Array.from({length:9},(_,i)=>`cart_${i+1}`),
    'end_zero','end_one','end_two','end_three',
    'btn_restart','btn_home','progress_bg','progress_fill',
  ];

  function loadImage(key, src) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload  = () => { imgs[key] = img; resolve(true); };
      img.onerror = () => { imgs[key] = null; resolve(false); };
      img.src = src;
    });
  }

  function loadSound(key, src) {
    const audio = new Audio();
    audio.src = src;
    audio.preload = 'auto';
    sounds[key] = audio;
  }

  async function loadEager(progressCb, doneCb) {
    onProgress = progressCb;
    onReady    = doneCb;

    totalEager  = EAGER_KEYS.length;
    loadedEager = 0;

    // load sounds (non-blocking)
    for (const [k, v] of Object.entries(SOUND_MANIFEST)) loadSound(k, v);

    // eager images
    const tasks = EAGER_KEYS.map(k => {
      const src = IMAGE_MANIFEST[k];
      if (!src) return Promise.resolve(false);
      return loadImage(k, src).then(ok => {
        loadedEager++;
        if (onProgress) onProgress(loadedEager / totalEager);
        return ok;
      });
    });
    await Promise.all(tasks);

    // lazy: remaining bg frames
    loadLazy();

    if (onReady) onReady();
  }

  function loadLazy() {
    for (const [k, v] of Object.entries(IMAGE_MANIFEST)) {
      if (!(k in imgs)) loadImage(k, v);
    }
  }

  function get(key) { return imgs[key] || null; }

  function playSound(key, { volume = 1, loop = false } = {}) {
    const s = sounds[key];
    if (!s) return;
    try {
      const clone = s.cloneNode();
      clone.volume = volume;
      clone.loop   = loop;
      clone.play().catch(() => {});
      return clone;
    } catch(e) {}
  }

  return { loadEager, get, playSound, imgs };
})();
