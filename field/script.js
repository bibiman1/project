(function () {
  "use strict";

  const canvas = document.getElementById("fieldCanvas");
  const ctx = canvas.getContext("2d");
  const VW = canvas.width;
  const VH = canvas.height;

  const WORLD_W = 4000;
  const WORLD_H = 3000;
  const SPEED = 230; // px / sec

  const introHint = document.getElementById("introHint");
  const fragmentBox = document.getElementById("fragmentBox");
  const fragmentTitle = document.getElementById("fragmentTitle");
  const fragmentText = document.getElementById("fragmentText");
  const progressText = document.getElementById("progressText");
  const completeToast = document.getElementById("completeToast");
  const storyOverlay = document.getElementById("storyOverlay");
  const storyTitleEl = document.getElementById("storyTitle");
  const storyTextEl = document.getElementById("storyText");
  const joystick = document.getElementById("joystick");
  const joystickKnob = document.getElementById("joystickKnob");
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    joystick.classList.add("touch-enabled");
  }

  const gameFrame = document.querySelector(".game-frame");
  const JOY_SIZE = 112;
  const JOY_INSET = 20;

  function positionJoystick() {
    const frameRect = gameFrame.getBoundingClientRect();
    const isCompact = document.body.classList.contains("landscape-compact");
    const leftMargin = frameRect.left;

    let left, top;
    if (isCompact && leftMargin > JOY_SIZE + 16) {
      // enough letterbox space beside the game view: rest the stick there
      // instead of covering the field
      left = leftMargin / 2 - JOY_SIZE / 2;
      top = frameRect.top + frameRect.height / 2 - JOY_SIZE / 2;
    } else {
      left = frameRect.left + JOY_INSET;
      top = frameRect.bottom - JOY_INSET - JOY_SIZE;
    }
    joystick.style.left = `${left}px`;
    joystick.style.top = `${top}px`;
  }

  function updateLayoutMode() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const compact = isTouchDevice && isLandscape;
    document.body.classList.toggle("landscape-compact", compact);
    document.documentElement.classList.toggle("landscape-compact", compact);
    positionJoystick();
  }
  updateLayoutMode();
  window.addEventListener("resize", updateLayoutMode);
  window.addEventListener("orientationchange", updateLayoutMode);
  gameFrame.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
    },
    { passive: false }
  );

  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const fullscreenSupported = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);

  if (!fullscreenSupported) {
    // iPhone Safari exposes no working Fullscreen API for non-video elements;
    // showing a button that can't do anything is worse than no button.
    fullscreenBtn.style.display = "none";
  } else {
    function isFullscreen() {
      return !!(document.fullscreenElement || document.webkitFullscreenElement);
    }

    function requestFullscreen(el) {
      const req = el.requestFullscreen || el.webkitRequestFullscreen;
      return req.call(el);
    }

    function exitFullscreen() {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      return exit.call(document);
    }

    fullscreenBtn.addEventListener("click", async () => {
      if (isFullscreen()) {
        try {
          await exitFullscreen();
        } catch (e) {
          // ignore
        }
        return;
      }
      try {
        await requestFullscreen(gameFrame);
      } catch (e) {
        // fullscreen request rejected; nothing more we can do
        return;
      }
      if (screen.orientation && screen.orientation.lock) {
        screen.orientation.lock("landscape").catch(() => {
          // orientation lock not supported; ignore
        });
      }
    });

    document.addEventListener("fullscreenchange", () => {
      fullscreenBtn.textContent = isFullscreen() ? "⤢" : "⛶";
    });
    document.addEventListener("webkitfullscreenchange", () => {
      fullscreenBtn.textContent = isFullscreen() ? "⤢" : "⛶";
    });
  }

  const FRAGMENTS = [
    {
      id: "lake",
      x: 2000,
      y: 1050,
      r: 150,
      color: "#bfe3f0",
      title: "凍った湖と富士山",
      text: "きーが見た風景。",
      icon: "lake",
    },
    {
      id: "suzuki",
      x: 2428,
      y: 1361,
      r: 150,
      color: "#d8b98a",
      title: "鈴木商店",
      text: "荒川区にある宇宙船殻用単結晶の製造販売卸元。超現実爆弾が招いた、現実には存在しない会社の看板。",
      icon: "shop",
    },
    {
      id: "bogicar",
      x: 1572,
      y: 1361,
      r: 150,
      color: "#8fc7c2",
      title: "ぼぎカー",
      text: "「きー」の車。ナイロンの戸板用ベアリングをタイヤに持つ。柿渋が塗られており臭い。ぼぎカーは光速度と慣性に制限を受けない。",
      icon: "car",
    },
    {
      id: "padre",
      x: 2264,
      y: 1864,
      r: 160,
      color: "#9a8f95",
      title: "ぱーでれ",
      text: "ぼぎを捕まえる機械。だいにちは、ぱーでれがぼぎをおびき寄せるために見せる紙芝居の主人公。連れ去られたぼぎは戻ってこない。",
      icon: "padre",
    },
    {
      id: "ki",
      x: 1736,
      y: 1864,
      r: 190,
      color: "#f0dca8",
      title: "きー",
      text: "最古のぼぎ。「ちゃん」と別れ、生老病死と万物流転の意味を理解するが、忘失。ただ一つ記憶している「ださいおさむん」を探しながら、いまも世界を徘徊している。",
      icon: "ki",
    },
  ];

  const player = {
    x: WORLD_W / 2,
    y: WORLD_H / 2,
    dir: "south",
    moving: false,
  };

  const discovered = new Set();
  let currentNear = null;
  let allShownOnce = false;
  let moved = false;

  const STORY_REVEAL_CHARS_PER_SEC = 38;
  let story = null; // { text, revealed }

  function startStory(frag) {
    story = { text: frag.text, revealed: 0 };
    storyTitleEl.textContent = frag.title;
    storyTextEl.textContent = "";
    storyOverlay.hidden = false;
    resetJoy();
    joystick.style.display = "none";
  }

  function updateStory(dt) {
    story.revealed = Math.min(story.text.length, story.revealed + STORY_REVEAL_CHARS_PER_SEC * dt);
    storyTextEl.textContent = story.text.slice(0, Math.floor(story.revealed));
  }

  function advanceStory() {
    if (!story) return;
    if (story.revealed < story.text.length) {
      story.revealed = story.text.length;
      storyTextEl.textContent = story.text;
      return;
    }
    story = null;
    storyOverlay.hidden = true;
    joystick.style.display = "";
  }

  const keys = { up: false, down: false, left: false, right: false };
  const KEY_MAP = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    KeyW: "up",
    KeyS: "down",
    KeyA: "left",
    KeyD: "right",
  };

  window.addEventListener("keydown", (e) => {
    if (story) {
      if (e.code === "Enter" || e.code === "Space" || e.code === "KeyZ") {
        advanceStory();
        e.preventDefault();
      }
      return;
    }
    const dir = KEY_MAP[e.code];
    if (!dir) return;
    keys[dir] = true;
    e.preventDefault();
  });
  window.addEventListener("keyup", (e) => {
    const dir = KEY_MAP[e.code];
    if (!dir) return;
    keys[dir] = false;
    e.preventDefault();
  });

  const joyVec = { x: 0, y: 0 };
  let joyActive = false;
  let joyPointerId = null;
  const JOY_RADIUS = 36;
  const JOY_DEADZONE = 0.15;

  function updateJoyKnob(dx, dy) {
    joystickKnob.style.transform = `translate(${dx}px, ${dy}px)`;
  }

  function setJoyFromPointer(e, rect) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > JOY_RADIUS) {
      dx = (dx / dist) * JOY_RADIUS;
      dy = (dy / dist) * JOY_RADIUS;
    }
    updateJoyKnob(dx, dy);
    joyVec.x = dx / JOY_RADIUS;
    joyVec.y = dy / JOY_RADIUS;
  }

  function resetJoy() {
    joyActive = false;
    joyPointerId = null;
    joyVec.x = 0;
    joyVec.y = 0;
    joystick.classList.remove("active");
    updateJoyKnob(0, 0);
  }

  joystick.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    joyActive = true;
    joyPointerId = e.pointerId;
    joystick.classList.add("active");
    joystick.setPointerCapture(e.pointerId);
    setJoyFromPointer(e, joystick.getBoundingClientRect());
  });
  joystick.addEventListener("pointermove", (e) => {
    if (!joyActive || e.pointerId !== joyPointerId) return;
    e.preventDefault();
    setJoyFromPointer(e, joystick.getBoundingClientRect());
  });
  const endJoy = (e) => {
    if (e.pointerId !== joyPointerId) return;
    resetJoy();
  };
  joystick.addEventListener("pointerup", endJoy);
  joystick.addEventListener("pointercancel", endJoy);

  storyOverlay.addEventListener("click", () => {
    advanceStory();
  });

  const kiSprite = new Image();
  let kiLoaded = false;
  kiSprite.onload = () => {
    kiLoaded = true;
  };
  kiSprite.src = "./assets/ki_sprite_sheet.png";
  const KI_FRAME = 128;
  const KI_COLS = 8;

  const manateeSprite = new Image();
  let manateeLoaded = false;
  manateeSprite.onload = () => {
    manateeLoaded = true;
  };
  manateeSprite.src = "./assets/manatee_walk_sheet.png";
  const MANATEE_W = 64;
  const MANATEE_H = 48;
  const MANATEE_FRAMES = 8;
  const MANATEE_DIR_ROW = {
    south: 0,
    "south-east": 1,
    east: 2,
    "north-east": 3,
    north: 4,
    "north-west": 5,
    west: 6,
    "south-west": 7,
  };
  const ANGLE_DIRS = [
    "east",
    "south-east",
    "south",
    "south-west",
    "west",
    "north-west",
    "north",
    "north-east",
  ];

  const floorTile = new Image();
  let floorLoaded = false;
  let floorBuffer = null;
  floorTile.onload = () => {
    floorLoaded = true;
    const tw = floorTile.width;
    const th = floorTile.height;
    floorBuffer = document.createElement("canvas");
    floorBuffer.width = VW + tw;
    floorBuffer.height = VH + th;
    const bctx = floorBuffer.getContext("2d");
    const pattern = bctx.createPattern(floorTile, "repeat");
    bctx.fillStyle = pattern;
    bctx.fillRect(0, 0, floorBuffer.width, floorBuffer.height);
  };
  floorTile.src = "./assets/floor_tile.png";

  const bogiSprite = new Image();
  let bogiLoaded = false;
  bogiSprite.onload = () => {
    bogiLoaded = true;
  };
  bogiSprite.src = "./assets/bogi_walk_sheet.png";
  const BOGI_CELL = 48;
  const BOGI_FRAMES = 2;
  const BOGI_DIR_ROW = {
    south: 0,
    "south-west": 1,
    west: 2,
    "north-west": 3,
    north: 4,
    "north-east": 5,
    east: 6,
    "south-east": 7,
  };

  const toribogikaaSprite = new Image();
  let toribogikaaLoaded = false;
  toribogikaaSprite.onload = () => {
    toribogikaaLoaded = true;
  };
  toribogikaaSprite.src = "./assets/toribogikaa_walk_sheet.png";
  const TORIBOGIKAA_W = 128;
  const TORIBOGIKAA_H = 100;
  const TORIBOGIKAA_DIR_COL = {
    west: 0,
    "south-west": 1,
    south: 2,
    east: 3,
    "south-east": 4,
    "north-east": 5,
    north: 6,
    "north-west": 7,
  };

  const bogikaaSprite = new Image();
  let bogikaaLoaded = false;
  bogikaaSprite.onload = () => {
    bogikaaLoaded = true;
  };
  bogikaaSprite.src = "./assets/bogikaa_walk_sheet.png";
  const BOGIKAA_W = 128;
  const BOGIKAA_H = 44;
  const BOGIKAA_DIR_COL = {
    west: 0,
    "south-west": 1,
    south: 2,
    east: 3,
    "south-east": 4,
    "north-east": 5,
    north: 6,
    "north-west": 7,
  };

  const wanderer = {
    x: 1800,
    y: 1400,
    vx: 0,
    vy: 0,
    dir: "south",
    moving: false,
    changeAt: 0,
  };

  const manateeWanderer = {
    x: 2300,
    y: 1900,
    vx: 0,
    vy: 0,
    dir: "south",
    moving: false,
    changeAt: 0,
  };

  const toribogikaaWanderer = {
    x: 2000,
    y: 2000,
    vx: 0,
    vy: 0,
    dir: "south",
    moving: false,
    changeAt: 0,
  };

  const bogikaaWanderer = {
    x: 1700,
    y: 1650,
    vx: 0,
    vy: 0,
    dir: "south",
    moving: false,
    changeAt: 0,
  };

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function dismissIntro() {
    if (!moved) {
      moved = true;
      introHint.classList.add("hidden");
    }
  }

  function dirFromDelta(dx, dy) {
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    const idx = Math.round(((angleDeg + 360) % 360) / 45) % 8;
    return ANGLE_DIRS[idx];
  }

  function updateWanderer(w, dt, t) {
    if (t > w.changeAt) {
      if (Math.random() < 0.3) {
        w.vx = 0;
        w.vy = 0;
        w.moving = false;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const speed = 35 + Math.random() * 35;
        w.vx = Math.cos(angle) * speed;
        w.vy = Math.sin(angle) * speed;
        w.moving = true;
        w.dir = dirFromDelta(w.vx, w.vy);
      }
      w.changeAt = t + 1.5 + Math.random() * 3.5;
    }
    w.x = clamp(w.x + w.vx * dt, 40, WORLD_W - 40);
    w.y = clamp(w.y + w.vy * dt, 40, WORLD_H - 40);
  }

  function update(dt, t) {
    if (story) {
      updateStory(dt);
      return;
    }

    let dx = 0;
    let dy = 0;
    const joyMag = Math.hypot(joyVec.x, joyVec.y);
    if (joyActive && joyMag > JOY_DEADZONE) {
      dx = joyVec.x;
      dy = joyVec.y;
    } else {
      if (keys.up) dy -= 1;
      if (keys.down) dy += 1;
      if (keys.left) dx -= 1;
      if (keys.right) dx += 1;
    }

    player.moving = dx !== 0 || dy !== 0;

    if (player.moving) {
      dismissIntro();
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      player.dir = dirFromDelta(dx, dy);
      player.x = clamp(player.x + dx * SPEED * dt, 40, WORLD_W - 40);
      player.y = clamp(player.y + dy * SPEED * dt, 40, WORLD_H - 40);
    }

    updateWanderer(wanderer, dt, t);
    updateWanderer(manateeWanderer, dt, t);
    updateWanderer(toribogikaaWanderer, dt, t);
    updateWanderer(bogikaaWanderer, dt, t);

    let near = null;
    for (const frag of FRAGMENTS) {
      const dist = Math.hypot(frag.x - player.x, frag.y - player.y);
      if (dist <= frag.r) {
        if (!discovered.has(frag.id)) {
          discovered.add(frag.id);
          progressText.textContent = `見つけた断片: ${discovered.size} / ${FRAGMENTS.length}`;
          startStory(frag);
          return;
        }
        near = frag;
        break;
      }
    }

    if (near !== currentNear) {
      currentNear = near;
      if (near) {
        fragmentTitle.textContent = near.title;
        fragmentText.textContent = near.text;
        fragmentBox.hidden = false;
      } else {
        fragmentBox.hidden = true;
      }
    }

    if (!allShownOnce && discovered.size === FRAGMENTS.length) {
      allShownOnce = true;
      completeToast.hidden = false;
      setTimeout(() => {
        completeToast.hidden = true;
      }, 4000);
    }
  }

  function drawVoid(camX, camY) {
    if (!floorLoaded) {
      ctx.fillStyle = "#eef0ee";
      ctx.fillRect(0, 0, VW, VH);
      return;
    }

    const tw = floorTile.width;
    const th = floorTile.height;
    const offsetX = (((camX - VW / 2) % tw) + tw) % tw;
    const offsetY = (((camY - VH / 2) % th) + th) % th;

    ctx.drawImage(floorBuffer, -offsetX, -offsetY);
  }

  function worldToScreen(camX, camY, wx, wy) {
    return { sx: wx - camX + VW / 2, sy: wy - camY + VH / 2 };
  }

  function drawPedestal(sx, sy) {
    const w = 116;
    const topH = 16;
    const baseH = 30;
    const topY = sy + 40;

    ctx.fillStyle = "rgba(60, 60, 50, 0.16)";
    ctx.beginPath();
    ctx.ellipse(sx, topY + baseH + 6, w * 0.42, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createLinearGradient(sx - w / 2, 0, sx + w / 2, 0);
    grad.addColorStop(0, "#d9d4c6");
    grad.addColorStop(0.5, "#f8f6ef");
    grad.addColorStop(1, "#cfc9ba");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(sx - w / 2, topY + topH * 0.5);
    ctx.lineTo(sx + w / 2, topY + topH * 0.5);
    ctx.lineTo(sx + w * 0.4, topY + baseH);
    ctx.lineTo(sx - w * 0.4, topY + baseH);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#fbfaf5";
    ctx.beginPath();
    ctx.ellipse(sx, topY, w / 2, topH / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(150, 145, 130, 0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawFragment(frag, camX, camY, t) {
    if (!discovered.has(frag.id)) return;
    const { sx, sy } = worldToScreen(camX, camY, frag.x, frag.y);
    if (sx < -frag.r - 40 || sx > VW + frag.r + 40 || sy < -frag.r - 40 || sy > VH + frag.r + 40) {
      return;
    }

    const glowR = 100;
    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
    grad.addColorStop(0, frag.color);
    grad.addColorStop(1, "rgba(238, 240, 238, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
    ctx.fill();

    drawPedestal(sx, sy);

    ctx.save();
    ctx.translate(sx, sy);
    drawIcon(frag.icon, t);
    ctx.restore();
  }

  function drawIcon(icon, t) {
    if (icon === "lake") {
      ctx.fillStyle = "#dff2f8";
      ctx.beginPath();
      ctx.ellipse(0, 30, 90, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f5f6f2";
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(46, 20);
      ctx.lineTo(-46, 20);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(0, -60);
      ctx.lineTo(16, -30);
      ctx.lineTo(-16, -30);
      ctx.closePath();
      ctx.fill();
    } else if (icon === "shop") {
      ctx.fillStyle = "#8a6a42";
      ctx.fillRect(-50, -30, 100, 60);
      ctx.fillStyle = "#f2e9d6";
      ctx.fillRect(-40, -18, 80, 40);
      ctx.fillStyle = "#3a2c18";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("鈴木商店", 0, 2);
    } else if (icon === "car") {
      ctx.fillStyle = "#2d6b66";
      ctx.beginPath();
      ctx.roundRect(-46, -18, 92, 34, 12);
      ctx.fill();
      ctx.fillStyle = "#1b2320";
      ctx.beginPath();
      ctx.arc(-26, 20, 12, 0, Math.PI * 2);
      ctx.arc(26, 20, 12, 0, Math.PI * 2);
      ctx.fill();
    } else if (icon === "padre") {
      ctx.fillStyle = "#3a3538";
      ctx.beginPath();
      ctx.roundRect(-44, -34, 88, 68, 6);
      ctx.fill();
      const pulse = 0.6 + Math.sin(t * 2) * 0.4;
      ctx.fillStyle = `rgba(200, 60, 50, ${0.5 + pulse * 0.5})`;
      ctx.beginPath();
      ctx.arc(0, 0, 14 + pulse * 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (icon === "ki") {
      if (kiLoaded) {
        const frame = Math.floor(t * 4) % KI_COLS;
        ctx.drawImage(
          kiSprite,
          frame * KI_FRAME,
          0,
          KI_FRAME,
          KI_FRAME,
          -64,
          -64,
          KI_FRAME,
          KI_FRAME
        );
      }
    }
  }

  const PLAYER_SIZE = 84;

  function drawPlayer(t) {
    const bob = Math.sin(t * 6) * (player.moving ? 3 : 1.2);
    const cx = VW / 2;
    const cy = VH / 2 + bob;

    ctx.fillStyle = "rgba(60, 60, 50, 0.18)";
    ctx.beginPath();
    ctx.ellipse(cx, VH / 2 + 34, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!bogiLoaded) return;

    const row = BOGI_DIR_ROW[player.dir];
    const frame = player.moving ? Math.floor(t * 6) % BOGI_FRAMES : 0;

    ctx.drawImage(
      bogiSprite,
      frame * BOGI_CELL,
      row * BOGI_CELL,
      BOGI_CELL,
      BOGI_CELL,
      cx - PLAYER_SIZE / 2,
      cy - PLAYER_SIZE / 2,
      PLAYER_SIZE,
      PLAYER_SIZE
    );
  }

  const WANDERER_SIZE = 76;

  function drawWanderer(camX, camY, t) {
    if (!kiLoaded) return;
    const { sx, sy } = worldToScreen(camX, camY, wanderer.x, wanderer.y);
    if (sx < -60 || sx > VW + 60 || sy < -60 || sy > VH + 60) return;

    const bob = Math.sin(t * 5 + 1.7) * (wanderer.moving ? 2.4 : 1);
    ctx.fillStyle = "rgba(60, 60, 50, 0.16)";
    ctx.beginPath();
    ctx.ellipse(sx, sy + 26, 20, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const frame = wanderer.moving ? Math.floor(t * 4) % KI_COLS : Math.floor(t * 1.5) % KI_COLS;
    const flip = wanderer.dir.includes("west") ? -1 : 1;
    ctx.save();
    ctx.translate(sx, sy + bob);
    ctx.scale(flip, 1);
    ctx.drawImage(
      kiSprite,
      frame * KI_FRAME,
      0,
      KI_FRAME,
      KI_FRAME,
      -WANDERER_SIZE / 2,
      -WANDERER_SIZE / 2,
      WANDERER_SIZE,
      WANDERER_SIZE
    );
    ctx.restore();
  }

  const MANATEE_WANDERER_W = 88;
  const MANATEE_WANDERER_H = 66;

  function drawManateeWanderer(camX, camY, t) {
    if (!manateeLoaded) return;
    const { sx, sy } = worldToScreen(camX, camY, manateeWanderer.x, manateeWanderer.y);
    if (sx < -70 || sx > VW + 70 || sy < -70 || sy > VH + 70) return;

    const bob = Math.sin(t * 6 + 0.6) * (manateeWanderer.moving ? 2.8 : 1.1);
    ctx.fillStyle = "rgba(60, 60, 50, 0.16)";
    ctx.beginPath();
    ctx.ellipse(sx, sy + 30, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const row = MANATEE_DIR_ROW[manateeWanderer.dir];
    const frame = manateeWanderer.moving ? Math.floor(t * 8) % MANATEE_FRAMES : 0;

    ctx.drawImage(
      manateeSprite,
      frame * MANATEE_W,
      row * MANATEE_H,
      MANATEE_W,
      MANATEE_H,
      sx - MANATEE_WANDERER_W / 2,
      sy + bob - MANATEE_WANDERER_H / 2,
      MANATEE_WANDERER_W,
      MANATEE_WANDERER_H
    );
  }

  const TORIBOGIKAA_WANDERER_W = 96;
  const TORIBOGIKAA_WANDERER_H = 75;

  function drawToribogikaaWanderer(camX, camY, t) {
    if (!toribogikaaLoaded) return;
    const { sx, sy } = worldToScreen(camX, camY, toribogikaaWanderer.x, toribogikaaWanderer.y);
    if (sx < -70 || sx > VW + 70 || sy < -70 || sy > VH + 70) return;

    const bob = toribogikaaWanderer.moving ? Math.sin(t * 10) * 1.6 : 0;
    ctx.fillStyle = "rgba(60, 60, 50, 0.16)";
    ctx.beginPath();
    ctx.ellipse(sx, sy + 28, 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    const col = TORIBOGIKAA_DIR_COL[toribogikaaWanderer.dir];

    ctx.drawImage(
      toribogikaaSprite,
      col * TORIBOGIKAA_W,
      0,
      TORIBOGIKAA_W,
      TORIBOGIKAA_H,
      sx - TORIBOGIKAA_WANDERER_W / 2,
      sy + bob - TORIBOGIKAA_WANDERER_H / 2,
      TORIBOGIKAA_WANDERER_W,
      TORIBOGIKAA_WANDERER_H
    );
  }

  const BOGIKAA_WANDERER_W = 96;
  const BOGIKAA_WANDERER_H = 33;

  function drawBogikaaWanderer(camX, camY, t) {
    if (!bogikaaLoaded) return;
    const { sx, sy } = worldToScreen(camX, camY, bogikaaWanderer.x, bogikaaWanderer.y);
    if (sx < -70 || sx > VW + 70 || sy < -70 || sy > VH + 70) return;

    const bob = bogikaaWanderer.moving ? Math.sin(t * 10 + 2.1) * 1.4 : 0;
    ctx.fillStyle = "rgba(60, 60, 50, 0.16)";
    ctx.beginPath();
    ctx.ellipse(sx, sy + 14, 24, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const col = BOGIKAA_DIR_COL[bogikaaWanderer.dir];

    ctx.drawImage(
      bogikaaSprite,
      col * BOGIKAA_W,
      0,
      BOGIKAA_W,
      BOGIKAA_H,
      sx - BOGIKAA_WANDERER_W / 2,
      sy + bob - BOGIKAA_WANDERER_H / 2,
      BOGIKAA_WANDERER_W,
      BOGIKAA_WANDERER_H
    );
  }

  let lastTime = 0;
  function loop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min(0.05, (timestamp - lastTime) / 1000);
    lastTime = timestamp;
    const t = timestamp / 1000;

    update(dt, t);

    const camX = player.x;
    const camY = player.y;
    drawVoid(camX, camY);
    for (const frag of FRAGMENTS) drawFragment(frag, camX, camY, t);
    drawWanderer(camX, camY, t);
    drawManateeWanderer(camX, camY, t);
    drawToribogikaaWanderer(camX, camY, t);
    drawBogikaaWanderer(camX, camY, t);
    drawPlayer(t);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
