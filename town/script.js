(function () {
  "use strict";

  const FRAME_SIZE = 128;
  const COLS = 8;
  const ROW_IDLE = 0;
  const ROW_RIGHT = 1;
  const ROW_LEFT = 2;
  const FRAME_INTERVAL = 150;

  const WORLD_W = 1000;
  const WORLD_H = 620;
  const PLAYER_SPEED = 2.6;
  const TALK_RADIUS = 104;
  const SOLID_RADIUS = 60;

  const DRAW_SCALE = 0.85;
  const DRAW_SIZE = FRAME_SIZE * DRAW_SCALE;

  const PLAYER = {
    id: "yusha",
    name: "勇者",
    sprite: "../yusha/assets/yusha_sprite_sheet.png",
  };

  const NPCS = [
    {
      id: "butamin",
      name: "ブタミン",
      sprite: "../butamin/assets/piggybank_simple_sprite_sheet.png",
      x: 140,
      y: 190,
      lines: ["コツコツ貯金するのが趣味なんだ。", "いつか大きな貯金箱になるのが夢さ!"],
    },
    {
      id: "fukurin",
      name: "フクリン",
      sprite: "../fukurin/assets/fukurin_sprite_sheet_v2.png",
      x: 340,
      y: 175,
      lines: ["夜になると目が冴えちゃうんだよね。", "静かな町がお気に入りなんだ。"],
    },
    {
      id: "kanepiyo",
      name: "カネピヨ",
      sprite: "../kanepiyo/assets/kanepiyo_sprite_sheet_v2.png",
      x: 560,
      y: 170,
      lines: ["ピヨ!今日の運勢は絶好調だよ!", "見つけてくれてうれしいピヨ。"],
    },
    {
      id: "kokeshin",
      name: "コケシン",
      sprite: "../kokeshin/assets/kokeshin_sprite_sheet_v4_no_arms.png",
      x: 780,
      y: 150,
      lines: ["じっとしているのが得意なんだ。", "たまには町を見て回るのもいいね。"],
    },
    {
      id: "moneymask",
      name: "マネーマスク",
      sprite: "../moneymask/assets/moneymask_luchador_sprite_sheet.png",
      x: 890,
      y: 260,
      lines: ["ファイトマネーは全部貯金してるぜ!", "強さもお金も磨き続けるのさ。"],
    },
    {
      id: "monster",
      name: "モンスター",
      sprite: "../monster/assets/custom_module_monster_sprite_transparent.png",
      x: 860,
      y: 460,
      lines: ["驚かせてごめんね、実はやさしいんだ。", "友達になってくれる?"],
    },
    {
      id: "negiduck",
      name: "ネギダック",
      sprite: "../negiduck/assets/negiduck_sprite_sheet_v4_back_negi.png",
      x: 640,
      y: 510,
      lines: ["ねぎ、持っていく?", "新鮮なねぎ、自慢なんだ。"],
    },
    {
      id: "okame-hibachi",
      name: "オカメ火鉢",
      sprite: "../okame-hibachi/assets/okame_hibachi_sprite_sheet.png",
      x: 400,
      y: 500,
      lines: ["火鉢であったまっていってね。", "寒い日はここに集まるんだ。"],
    },
    {
      id: "retrobo",
      name: "レトロボ",
      sprite: "../retrobo/assets/retrobo_sprite_sheet_v2.png",
      x: 150,
      y: 420,
      lines: ["ピポパポ…なつかしい音がするでしょ?", "町の見回りが仕事なんだ。"],
    },
  ];

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const talkHint = document.getElementById("talkHint");
  const dialogBox = document.getElementById("dialogBox");
  const dialogName = document.getElementById("dialogName");
  const dialogText = document.getElementById("dialogText");
  const progressText = document.getElementById("progressText");
  const talkButton = document.getElementById("talkButton");
  const dpadButtons = document.querySelectorAll(".dpad-btn");

  const player = {
    x: WORLD_W / 2,
    y: WORLD_H / 2 + 60,
    row: ROW_IDLE,
    frame: 0,
    lastFrameTime: 0,
    facing: ROW_RIGHT,
    img: null,
  };

  const visited = new Set();
  let activeNpc = null;
  let dialogOpen = false;
  let dialogNpc = null;
  let dialogLineIndex = 0;

  const pressed = { up: false, down: false, left: false, right: false };
  let talkKeyEdge = false;

  function loadImage(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(img);
      img.src = src;
    });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function distance(ax, ay, bx, by) {
    return Math.hypot(ax - bx, ay - by);
  }

  function groundPattern() {
    const size = 20;
    const patternCanvas = document.createElement("canvas");
    patternCanvas.width = size * 2;
    patternCanvas.height = size * 2;
    const pctx = patternCanvas.getContext("2d");
    pctx.fillStyle = "#e7ecd8";
    pctx.fillRect(0, 0, size * 2, size * 2);
    pctx.fillStyle = "#dde4cb";
    pctx.fillRect(0, 0, size, size);
    pctx.fillRect(size, size, size, size);
    return ctx.createPattern(patternCanvas, "repeat");
  }

  function updatePlayer() {
    if (dialogOpen) {
      player.row = ROW_IDLE;
      return;
    }

    let dx = 0;
    let dy = 0;
    if (pressed.left) dx -= 1;
    if (pressed.right) dx += 1;
    if (pressed.up) dy -= 1;
    if (pressed.down) dy += 1;

    if (dx !== 0 || dy !== 0) {
      const len = Math.hypot(dx, dy);
      dx = (dx / len) * PLAYER_SPEED;
      dy = (dy / len) * PLAYER_SPEED;

      let nextX = clamp(player.x + dx, 60, WORLD_W - 60);
      if (!collides(nextX, player.y)) player.x = nextX;

      let nextY = clamp(player.y + dy, 150, WORLD_H - 40);
      if (!collides(player.x, nextY)) player.y = nextY;

      if (dx > 0) player.facing = ROW_RIGHT;
      else if (dx < 0) player.facing = ROW_LEFT;
      player.row = player.facing;
    } else {
      player.row = ROW_IDLE;
    }
  }

  function collides(x, y) {
    for (const npc of NPCS) {
      if (distance(x, y, npc.x, npc.y) < SOLID_RADIUS) return true;
    }
    return false;
  }

  function findActiveNpc() {
    let nearest = null;
    let nearestDist = TALK_RADIUS;
    for (const npc of NPCS) {
      const d = distance(player.x, player.y, npc.x, npc.y);
      if (d < nearestDist) {
        nearest = npc;
        nearestDist = d;
      }
    }
    return nearest;
  }

  function openDialog(npc) {
    dialogOpen = true;
    dialogNpc = npc;
    dialogLineIndex = 0;
    visited.add(npc.id);
    updateProgress();
    showDialogLine();
    dialogBox.hidden = false;
    talkHint.hidden = true;
  }

  function showDialogLine() {
    dialogName.textContent = dialogNpc.name;
    dialogText.textContent = dialogNpc.lines[dialogLineIndex];
  }

  function advanceDialog() {
    dialogLineIndex += 1;
    if (dialogLineIndex >= dialogNpc.lines.length) {
      closeDialog();
    } else {
      showDialogLine();
    }
  }

  function closeDialog() {
    dialogOpen = false;
    dialogNpc = null;
    dialogBox.hidden = true;
  }

  function handleTalkPress() {
    if (dialogOpen) {
      advanceDialog();
    } else if (activeNpc) {
      openDialog(activeNpc);
    }
  }

  function updateProgress() {
    progressText.textContent = `話した人数: ${visited.size} / ${NPCS.length}`;
  }

  function updateAnimationFrame(timestamp) {
    if (!player.lastFrameTime || timestamp - player.lastFrameTime >= FRAME_INTERVAL) {
      player.frame = (player.frame + 1) % COLS;
      player.lastFrameTime = timestamp;
      for (const npc of NPCS) {
        npc.frame = (player.frame) % COLS;
      }
    }
  }

  function drawSprite(img, frame, row, x, y) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    ctx.drawImage(
      img,
      frame * FRAME_SIZE,
      row * FRAME_SIZE,
      FRAME_SIZE,
      FRAME_SIZE,
      x - DRAW_SIZE / 2,
      y - DRAW_SIZE,
      DRAW_SIZE,
      DRAW_SIZE
    );
  }

  function drawSign(npc) {
    const text = npc.name;
    ctx.font = "bold 13px sans-serif";
    const padding = 8;
    const textWidth = ctx.measureText(text).width;
    const boxW = textWidth + padding * 2;
    const boxH = 22;
    const boxX = npc.x - boxW / 2;
    const boxY = npc.y - DRAW_SIZE - 14 - boxH;

    ctx.fillStyle = "rgba(255, 253, 248, 0.92)";
    ctx.strokeStyle = "#d8d2c5";
    ctx.lineWidth = 1;
    roundRect(boxX, boxY, boxW, boxH, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#202020";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, npc.x, boxY + boxH / 2 + 1);
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawTalkBubble(npc) {
    const bx = npc.x;
    const by = npc.y - DRAW_SIZE - 26;
    ctx.fillStyle = "#b7442a";
    ctx.beginPath();
    ctx.arc(bx, by, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", bx, by + 1);
  }

  let pattern = null;

  function draw() {
    if (!pattern) pattern = groundPattern();
    ctx.clearRect(0, 0, WORLD_W, WORLD_H);

    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    ctx.fillStyle = "rgba(183, 68, 42, 0.06)";
    ctx.fillRect(0, 0, WORLD_W, 90);

    ctx.fillStyle = "#66645f";
    ctx.font = "12px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText("勇者の町", 16, 14);

    for (const npc of NPCS) {
      drawSign(npc);
    }

    const entities = [player, ...NPCS].slice().sort((a, b) => a.y - b.y);
    for (const entity of entities) {
      if (entity === player) {
        drawSprite(player.img, player.frame, player.row, player.x, player.y);
      } else {
        drawSprite(entity.img, entity.frame || 0, ROW_IDLE, entity.x, entity.y);
      }
    }

    if (activeNpc && !dialogOpen) {
      drawTalkBubble(activeNpc);
    }
  }

  function loop(timestamp) {
    updateAnimationFrame(timestamp);
    updatePlayer();

    activeNpc = dialogOpen ? null : findActiveNpc();
    talkHint.hidden = !activeNpc || dialogOpen;

    if (talkKeyEdge) {
      handleTalkPress();
      talkKeyEdge = false;
    }

    draw();
    requestAnimationFrame(loop);
  }

  const KEY_MAP = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
    W: "up",
    S: "down",
    A: "left",
    D: "right",
  };

  const TALK_KEYS = new Set(["Enter", " ", "z", "Z"]);

  window.addEventListener("keydown", (event) => {
    const dir = KEY_MAP[event.key];
    if (dir) {
      pressed[dir] = true;
      event.preventDefault();
    } else if (TALK_KEYS.has(event.key)) {
      if (!event.repeat) talkKeyEdge = true;
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    const dir = KEY_MAP[event.key];
    if (dir) {
      pressed[dir] = false;
      event.preventDefault();
    }
  });

  dpadButtons.forEach((btn) => {
    const dir = btn.dataset.dir;
    const press = (event) => {
      event.preventDefault();
      pressed[dir] = true;
    };
    const release = (event) => {
      event.preventDefault();
      pressed[dir] = false;
    };
    btn.addEventListener("touchstart", press, { passive: false });
    btn.addEventListener("touchend", release, { passive: false });
    btn.addEventListener("mousedown", press);
    btn.addEventListener("mouseup", release);
    btn.addEventListener("mouseleave", release);
  });

  talkButton.addEventListener("click", () => {
    talkKeyEdge = true;
  });

  dialogBox.addEventListener("click", () => {
    talkKeyEdge = true;
  });

  async function init() {
    updateProgress();
    player.img = await loadImage(PLAYER.sprite);
    await Promise.all(
      NPCS.map(async (npc) => {
        npc.img = await loadImage(npc.sprite);
        npc.frame = 0;
      })
    );
    requestAnimationFrame(loop);
  }

  init();
})();
