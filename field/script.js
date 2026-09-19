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

  const FRAGMENTS = [
    {
      id: "lake",
      x: 2000,
      y: 950,
      r: 150,
      color: "#bfe3f0",
      title: "凍った湖と富士山",
      text: "きーが見た風景。",
      icon: "lake",
    },
    {
      id: "suzuki",
      x: 2560,
      y: 1650,
      r: 150,
      color: "#d8b98a",
      title: "鈴木商店",
      text: "荒川区にある宇宙船殻用単結晶の製造販売卸元。超現実爆弾が招いた、現実には存在しない会社の看板。",
      icon: "shop",
    },
    {
      id: "bogicar",
      x: 1440,
      y: 1760,
      r: 150,
      color: "#8fc7c2",
      title: "ぼぎカー",
      text: "「きー」の車。ナイロンの戸板用ベアリングをタイヤに持つ。柿渋が塗られており臭い。ぼぎカーは光速度と慣性に制限を受けない。",
      icon: "car",
    },
    {
      id: "padre",
      x: 2470,
      y: 930,
      r: 160,
      color: "#9a8f95",
      title: "ぱーでれ",
      text: "ぼぎを捕まえる機械。だいにちは、ぱーでれがぼぎをおびき寄せるために見せる紙芝居の主人公。連れ去られたぼぎは戻ってこない。",
      icon: "padre",
    },
    {
      id: "ki",
      x: 1540,
      y: 2220,
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

  document.querySelectorAll(".dpad-btn").forEach((btn) => {
    const dir = btn.dataset.dir;
    const press = (e) => {
      e.preventDefault();
      keys[dir] = true;
    };
    const release = (e) => {
      e.preventDefault();
      keys[dir] = false;
    };
    btn.addEventListener("touchstart", press, { passive: false });
    btn.addEventListener("touchend", release, { passive: false });
    btn.addEventListener("touchcancel", release, { passive: false });
    btn.addEventListener("mousedown", press);
    btn.addEventListener("mouseup", release);
    btn.addEventListener("mouseleave", release);
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
  const MANATEE_ANGLE_DIRS = [
    "east",
    "south-east",
    "south",
    "south-west",
    "west",
    "north-west",
    "north",
    "north-east",
  ];

  const wanderer = {
    x: 1800,
    y: 1400,
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
    return MANATEE_ANGLE_DIRS[idx];
  }

  function updateWanderer(dt, t) {
    if (t > wanderer.changeAt) {
      if (Math.random() < 0.3) {
        wanderer.vx = 0;
        wanderer.vy = 0;
        wanderer.moving = false;
      } else {
        const angle = Math.random() * Math.PI * 2;
        const speed = 35 + Math.random() * 35;
        wanderer.vx = Math.cos(angle) * speed;
        wanderer.vy = Math.sin(angle) * speed;
        wanderer.moving = true;
        wanderer.dir = dirFromDelta(wanderer.vx, wanderer.vy);
      }
      wanderer.changeAt = t + 1.5 + Math.random() * 3.5;
    }
    wanderer.x = clamp(wanderer.x + wanderer.vx * dt, 40, WORLD_W - 40);
    wanderer.y = clamp(wanderer.y + wanderer.vy * dt, 40, WORLD_H - 40);
  }

  function update(dt, t) {
    let dx = 0;
    let dy = 0;
    if (keys.up) dy -= 1;
    if (keys.down) dy += 1;
    if (keys.left) dx -= 1;
    if (keys.right) dx += 1;

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

    updateWanderer(dt, t);

    let near = null;
    for (const frag of FRAGMENTS) {
      const dist = Math.hypot(frag.x - player.x, frag.y - player.y);
      if (dist <= frag.r) {
        if (!discovered.has(frag.id)) {
          discovered.add(frag.id);
          progressText.textContent = `見つけた断片: ${discovered.size} / ${FRAGMENTS.length}`;
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
    ctx.fillStyle = "#eef0ee";
    ctx.fillRect(0, 0, VW, VH);

    const spacing = 60;
    const startX = -((camX - VW / 2) % spacing);
    const startY = -((camY - VH / 2) % spacing);
    ctx.fillStyle = "rgba(120, 130, 120, 0.22)";
    for (let x = startX; x < VW; x += spacing) {
      for (let y = startY; y < VH; y += spacing) {
        ctx.beginPath();
        ctx.arc(x, y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function worldToScreen(camX, camY, wx, wy) {
    return { sx: wx - camX + VW / 2, sy: wy - camY + VH / 2 };
  }

  function drawFragment(frag, camX, camY, t) {
    if (!discovered.has(frag.id)) return;
    const { sx, sy } = worldToScreen(camX, camY, frag.x, frag.y);
    if (sx < -frag.r - 40 || sx > VW + frag.r + 40 || sy < -frag.r - 40 || sy > VH + frag.r + 40) {
      return;
    }

    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, frag.r);
    grad.addColorStop(0, frag.color);
    grad.addColorStop(1, "rgba(238, 240, 238, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sx, sy, frag.r, 0, Math.PI * 2);
    ctx.fill();

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

  const PLAYER_W = 96;
  const PLAYER_H = 72;

  function drawPlayer(t) {
    const bob = Math.sin(t * 6) * (player.moving ? 3 : 1.2);
    const cx = VW / 2;
    const cy = VH / 2 + bob;

    ctx.fillStyle = "rgba(60, 60, 50, 0.18)";
    ctx.beginPath();
    ctx.ellipse(cx, VH / 2 + 34, 26, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!manateeLoaded) return;

    const row = MANATEE_DIR_ROW[player.dir];
    const frame = player.moving ? Math.floor(t * 10) % MANATEE_FRAMES : 0;

    ctx.drawImage(
      manateeSprite,
      frame * MANATEE_W,
      row * MANATEE_H,
      MANATEE_W,
      MANATEE_H,
      cx - PLAYER_W / 2,
      cy - PLAYER_H / 2,
      PLAYER_W,
      PLAYER_H
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
    drawPlayer(t);

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
