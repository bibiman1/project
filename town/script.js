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
      roof: "#c96a4c",
      wall: "#f6ead9",
      hp: 14,
      atkMin: 3,
      atkMax: 6,
      defeated: false,
      isAlly: false,
      magic: "water",
      preLine: "貯金は だれにも わたさない!",
      lowHpLine: "ま、まって!貯金箱は こわさないで……!",
      deathLine: "うわぁぁ、貯金が……!",
      dropItem: { name: "コツコツ貯金箱", hpBonus: 4, atkBonus: 0 },
      lines: ["コツコツ貯金するのが趣味なんだ。", "いつか大きな貯金箱になるのが夢さ!"],
      accusingLines: ["……どうして あんな ことを したんだ。", "しばらく 貯金箱に かくれて いるよ。"],
    },
    {
      id: "fukurin",
      name: "フクリン",
      sprite: "../fukurin/assets/fukurin_sprite_sheet_v2.png",
      x: 340,
      y: 175,
      roof: "#4f7f77",
      wall: "#eee3c8",
      hp: 20,
      atkMin: 4,
      atkMax: 8,
      defeated: false,
      isAlly: false,
      magic: "lightning",
      preLine: "夜は これからだよ。",
      lowHpLine: "ま、まって……お願い、見逃して……!",
      deathLine: "夜が……あけて……いく……",
      dropItem: { name: "夜目のお守り", hpBonus: 6, atkBonus: 0 },
      lines: ["夜になると目が冴えちゃうんだよね。", "静かな町がお気に入りなんだ。"],
      accusingLines: ["町が 赤く 染まってる…… こわいよ。", "しばらく そっとしておいて ほしい。"],
    },
    {
      id: "kanepiyo",
      name: "カネピヨ",
      sprite: "../kanepiyo/assets/kanepiyo_sprite_sheet_v2.png",
      x: 560,
      y: 170,
      roof: "#d9a441",
      wall: "#f6efdb",
      hp: 16,
      atkMin: 3,
      atkMax: 6,
      defeated: false,
      isAlly: false,
      magic: "lightning",
      preLine: "ピヨピヨ!かかってこい!",
      lowHpLine: "ピヨ……お願い、命だけは……!",
      deathLine: "ピ、ピヨォ……",
      dropItem: { name: "こがねの羽根", hpBonus: 0, atkBonus: 2 },
      lines: ["ピヨ!今日の運勢は絶好調だよ!", "見つけてくれてうれしいピヨ。"],
      accusingLines: ["ピヨ……もう いっしょに あそべないよ。", "モンスターは わるい 子じゃ なかったのに。"],
    },
    {
      id: "kokeshin",
      name: "コケシン",
      sprite: "../kokeshin/assets/kokeshin_sprite_sheet_v4_no_arms.png",
      x: 780,
      y: 150,
      roof: "#a8524a",
      wall: "#f2e4d3",
      hp: 18,
      atkMin: 4,
      atkMax: 7,
      defeated: false,
      isAlly: false,
      magic: "water",
      preLine: "……(だまって しずかに かまえた)",
      lowHpLine: "……た、たすけて……",
      deathLine: "……。",
      dropItem: { name: "こけしの魂", hpBonus: 5, atkBonus: 0 },
      lines: ["じっとしているのが得意なんだ。", "たまには町を見て回るのもいいね。"],
      accusingLines: ["……。", "(だまって そっと 目を そらした)"],
    },
    {
      id: "moneymask",
      name: "マネーマスク",
      sprite: "../moneymask/assets/moneymask_luchador_sprite_sheet.png",
      x: 890,
      y: 260,
      roof: "#4c6fa5",
      wall: "#eee6d3",
      hp: 32,
      atkMin: 6,
      atkMax: 11,
      defeated: false,
      isAlly: false,
      magic: "lightning",
      preLine: "王者の ちからを みせてやる!",
      lowHpLine: "ば、ばかな……この 俺が……ま、まて、たのむ……!",
      deathLine: "王者の ほこりが……くずれ……る……",
      dropItem: { name: "王者のベルト", hpBonus: 6, atkBonus: 4 },
      lines: ["ファイトマネーは全部貯金してるぜ!", "強さもお金も磨き続けるのさ。"],
      accusingLines: ["力を 見せつける ためだけに 命を うばうなんて。", "強さの いみを はきちがえてるんじゃないか?"],
    },
    {
      id: "monster",
      name: "モンスター",
      sprite: "../monster/assets/custom_module_monster_sprite_transparent.png",
      x: 860,
      y: 460,
      roof: "#6b7a4f",
      wall: "#e9e8d6",
      hp: 24,
      atkMin: 4,
      atkMax: 9,
      defeated: false,
      isAlly: false,
      magic: "explosion",
      preLine: "ガオー!……あ、いや、こわくないよ?でも たたかうよ!",
      lowHpLine: "ま、待って!ぼく やさしいモンスターなんだ……お願い!",
      deathLine: "こんな はずじゃ……",
      dropItem: { name: "モンスターの爪", hpBonus: 3, atkBonus: 3 },
      lines: ["驚かせてごめんね、実はやさしいんだ。", "友達になってくれる?"],
      graveLines: ["……。", "ここに しずかに ねむっている。"],
    },
    {
      id: "negiduck",
      name: "ネギダック",
      sprite: "../negiduck/assets/negiduck_sprite_sheet_v4_back_negi.png",
      x: 640,
      y: 510,
      roof: "#5a9463",
      wall: "#eee6d3",
      hp: 16,
      atkMin: 3,
      atkMax: 7,
      defeated: false,
      isAlly: false,
      magic: "explosion",
      preLine: "ねぎを なめるなよ!",
      lowHpLine: "ま、まって!ねぎなら いくらでも あげるから!",
      deathLine: "グワァ……ねぎが……",
      dropItem: { name: "ねぎの剣", hpBonus: 0, atkBonus: 3 },
      lines: ["ねぎ、持っていく?", "新鮮なねぎ、自慢なんだ。"],
      accusingLines: ["今は ねぎを わたす 気分じゃ ないよ。", "……少し ひとりに させて。"],
    },
    {
      id: "okame-hibachi",
      name: "オカメ火鉢",
      sprite: "../okame-hibachi/assets/okame_hibachi_sprite_sheet.png",
      x: 400,
      y: 500,
      roof: "#b0563f",
      wall: "#f0e2cf",
      hp: 18,
      atkMin: 4,
      atkMax: 7,
      defeated: false,
      isAlly: false,
      magic: "explosion",
      preLine: "あたたかく もてなして やろう……いや、やっつけてやる!",
      lowHpLine: "ま、まって!火鉢の火が きえちゃう……お願い!",
      deathLine: "あぁ、火が……",
      dropItem: { name: "火鉢の残り火", hpBonus: 0, atkBonus: 3 },
      lines: ["火鉢であったまっていってね。", "寒い日はここに集まるんだ。"],
      accusingLines: ["火鉢の 火も、なんだか 冷たく 感じるよ。", "みんな おびえて しまった。"],
    },
    {
      id: "retrobo",
      name: "レトロボ",
      sprite: "../retrobo/assets/retrobo_sprite_sheet_v2.png",
      x: 150,
      y: 420,
      roof: "#6f6f78",
      wall: "#e7e4da",
      hp: 22,
      atkMin: 5,
      atkMax: 9,
      defeated: false,
      isAlly: false,
      magic: "lightning",
      preLine: "せんとう モード、きどう。",
      lowHpLine: "け、けいこく……バッテリーが……たすけて……ください……",
      deathLine: "き……のう……ていし……",
      dropItem: { name: "レトロ回路", hpBonus: 0, atkBonus: 3 },
      lines: ["ピポパポ…なつかしい音がするでしょ?", "町の見回りが仕事なんだ。"],
      accusingLines: ["けいこく:勇者の せっきんを けんち。", "みまもりを きょうかします……。"],
    },
  ];

  const GRAVE_LINES = ["……。", "ここで しずかに ねむっている。"];

  const ALLY_BONUS = { hpBonus: 3, atkBonus: 1 };

  const RIVAL_TAUNTS = [
    (name) => `${name}は 四天王最弱。 われらの 面汚しよ。`,
    (name) => `${name}などに てこずるとは、なさけない。`,
    (name) => `${name}の ぶんまで、たおしてくれる!`,
  ];

  const MAGIC_INFO = {
    explosion: { verb: "ばくえんじゅつ", flash: "rgba(255, 140, 40, 0.45)" },
    water: { verb: "すいりゅうじゅつ", flash: "rgba(60, 140, 220, 0.4)" },
    lightning: { verb: "らいめいじゅつ", flash: "rgba(255, 240, 120, 0.5)" },
  };

  const SQUAT_TARGET = 20;
  const SQUAT_DURATION = 6000;

  const CREDITS = [
    "勇者の町",
    "",
    "─ おわり ─",
    "",
    "企画・演出",
    "勇者",
    "",
    "キャラクターデザイン",
    "ブタミン / フクリン / カネピヨ",
    "コケシン / マネーマスク / モンスター",
    "ネギダック / オカメ火鉢 / レトロボ",
    "",
    "特別出演",
    "町のみんな",
    "",
    "音楽",
    "静寂",
    "",
    "そして",
    "だれも いない 町で",
    "",
    "Thank you for playing",
    "",
    "THE END",
  ];

  const FRIENDSHIP_CREDITS = [
    "勇者の町",
    "",
    "─ なかまエンディング ─",
    "",
    "勇者は",
    "町の みんなと",
    "なかまに なった",
    "",
    "出演",
    "ブタミン / フクリン / カネピヨ",
    "コケシン / マネーマスク / モンスター",
    "ネギダック / オカメ火鉢 / レトロボ",
    "",
    "特別出演",
    "マネーマスク(四天王最強)",
    "",
    "これからも みんなで",
    "たびを つづける……",
    "",
    "Thank you for playing",
    "",
    "THE END",
  ];

  const PLAZA_X = WORLD_W / 2;
  const PLAZA_Y = 330;
  const PLAZA_RADIUS = 78;

  const BUSHES = [
    { x: 40, y: 60, r: 16 },
    { x: 70, y: 80, r: 12 },
    { x: 960, y: 60, r: 16 },
    { x: 930, y: 85, r: 12 },
    { x: 40, y: 560, r: 16 },
    { x: 70, y: 585, r: 12 },
    { x: 960, y: 560, r: 16 },
    { x: 930, y: 585, r: 12 },
    { x: 500, y: 55, r: 14 },
    { x: 460, y: 40, r: 10 },
    { x: 540, y: 40, r: 10 },
    { x: 60, y: 300, r: 14 },
    { x: 940, y: 360, r: 14 },
    { x: 230, y: 300, r: 12 },
    { x: 720, y: 350, r: 12 },
  ];

  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const talkHint = document.getElementById("talkHint");
  const dialogBox = document.getElementById("dialogBox");
  const dialogName = document.getElementById("dialogName");
  const dialogText = document.getElementById("dialogText");
  const progressText = document.getElementById("progressText");
  const statsText = document.getElementById("statsText");
  const talkButton = document.getElementById("talkButton");
  const dpadButtons = document.querySelectorAll(".dpad-btn");
  const transitionFlash = document.getElementById("transitionFlash");
  const battleMenu = document.getElementById("battleMenu");
  const battleCmdButtons = document.querySelectorAll(".battle-cmd");
  const restartButton = document.getElementById("restartButton");

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
  let activeDialogLines = [];
  let squatResultActive = false;

  let scene = "town";
  let battle = null;
  let squat = null;
  let ending = null;
  let lastDefeatedName = null;
  let pendingFriendshipEnding = false;

  const BASE_PLAYER_STATS = { maxHp: 30, atkMin: 6, atkMax: 11 };
  const playerStats = { ...BASE_PLAYER_STATS };

  const PARTY_TRAIL_SPACING = 26;
  const PARTY_TRAIL_MAX = 300;
  let partyOrder = [];
  let partyTrail = [];

  function recordPartyTrail() {
    partyTrail.unshift({ x: player.x, y: player.y, row: player.row, frame: player.frame });
    if (partyTrail.length > PARTY_TRAIL_MAX) partyTrail.length = PARTY_TRAIL_MAX;
  }

  function updatePartyPositions() {
    partyOrder.forEach((id, index) => {
      const npc = NPCS.find((n) => n.id === id);
      if (!npc || !npc.isAlly) return;
      const trailIndex = Math.min(partyTrail.length - 1, (index + 1) * PARTY_TRAIL_SPACING);
      const pos = partyTrail[trailIndex] || { x: player.x, y: player.y, row: ROW_IDLE, frame: 0 };
      npc.x = pos.x;
      npc.y = pos.y;
      npc.allyRow = pos.row;
      npc.allyFrame = pos.frame;
    });
  }

  function isMonsterDefeated() {
    const monster = NPCS.find((npc) => npc.id === "monster");
    return !!(monster && monster.defeated);
  }

  const BLOOD_SPLATS = [
    { x: 860, y: 460, r: 46 },
    { x: 905, y: 500, r: 26 },
    { x: 805, y: 500, r: 22 },
    { x: 930, y: 425, r: 20 },
    { x: 500, y: 330, r: 18 },
    { x: 300, y: 250, r: 16 },
    { x: 700, y: 250, r: 16 },
    { x: 200, y: 480, r: 16 },
    { x: 600, y: 560, r: 18 },
    { x: 120, y: 300, r: 14 },
    { x: 950, y: 220, r: 14 },
    { x: 450, y: 500, r: 16 },
  ];

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

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function flashTransition() {
    transitionFlash.classList.add("active");
    window.setTimeout(() => transitionFlash.classList.remove("active"), 90);
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
    if (dialogOpen || squatResultActive) {
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
      if (npc.isAlly) continue;
      if (distance(x, y, npc.x, npc.y) < SOLID_RADIUS) return true;
    }
    return false;
  }

  function findActiveNpc() {
    let nearest = null;
    let nearestDist = TALK_RADIUS;
    for (const npc of NPCS) {
      if (npc.isAlly) continue;
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
    activeDialogLines = npc.isAlly ? npc.lines : npc.graveLines || GRAVE_LINES;
    showDialogLine();
    dialogBox.hidden = false;
    talkHint.hidden = true;
  }

  function showDialogLine() {
    dialogName.textContent = dialogNpc.name;
    dialogText.textContent = activeDialogLines[dialogLineIndex];
  }

  function advanceDialog() {
    dialogLineIndex += 1;
    if (dialogLineIndex >= activeDialogLines.length) {
      closeDialog();
    } else {
      showDialogLine();
    }
  }

  function closeDialog() {
    dialogOpen = false;
    const npc = dialogNpc;
    dialogNpc = null;
    dialogBox.hidden = true;
    if (npc && npc.defeated) {
      startSquat(npc);
    }
  }

  function handleTalkPress() {
    if (scene === "battle") {
      handleBattleConfirm();
      return;
    }
    if (scene === "squat") {
      if (squat && !squat.resolved) squat.count += 1;
      return;
    }
    if (squatResultActive) {
      squatResultActive = false;
      dialogBox.hidden = true;
      if (pendingFriendshipEnding) {
        pendingFriendshipEnding = false;
        startFriendshipEnding();
      }
      return;
    }
    if (dialogOpen) {
      advanceDialog();
    } else if (activeNpc) {
      if (activeNpc.defeated || activeNpc.isAlly) {
        openDialog(activeNpc);
      } else {
        startBattle(activeNpc);
      }
    }
  }

  function updateProgress() {
    progressText.textContent = `話した人数: ${visited.size} / ${NPCS.length}`;
  }

  function updateStatsDisplay() {
    if (statsText) {
      statsText.textContent = `ちから: ${playerStats.atkMin}-${playerStats.atkMax} / さいだいHP: ${playerStats.maxHp}`;
    }
  }

  function startBattle(npc) {
    scene = "battle";
    document.body.classList.add("battle-active");
    flashTransition();
    dialogOpen = false;
    talkHint.hidden = true;

    battle = {
      npc,
      playerHp: playerStats.maxHp,
      playerMaxHp: playerStats.maxHp,
      enemyHp: npc.hp,
      enemyMaxHp: npc.hp,
      lowHpTriggered: false,
      flashColor: null,
      flashUntil: 0,
      turn: "message",
      selection: 0,
      defending: false,
      queue: [],
      onQueueDone: null,
      shakeEnemy: 0,
      shakePlayer: 0,
    };

    const introLines = [`${npc.name}が あらわれた!`];
    if (npc.preLine) introLines.push(npc.preLine);
    if (lastDefeatedName) {
      const taunt = RIVAL_TAUNTS[Math.floor(Math.random() * RIVAL_TAUNTS.length)](lastDefeatedName);
      introLines.push(taunt);
    }

    pushBattleMessages(introLines, () => {
      battle.turn = "select";
      showBattleMenu();
    });
  }

  function pushBattleMessages(lines, onDone) {
    battle.queue = lines.slice();
    battle.onQueueDone = onDone || null;
    battle.turn = "message";
    battleMenu.hidden = true;
    advanceBattleMessage();
  }

  function advanceBattleMessage() {
    if (battle.queue.length === 0) {
      dialogBox.hidden = true;
      const cb = battle.onQueueDone;
      battle.onQueueDone = null;
      if (cb) cb();
      return;
    }
    const line = battle.queue.shift();
    dialogName.textContent = "⚔ バトル";
    dialogText.textContent = line;
    dialogBox.hidden = false;
  }

  function showBattleMenu() {
    dialogBox.hidden = true;
    battleMenu.hidden = false;
    renderBattleMenu();
  }

  function renderBattleMenu() {
    battleCmdButtons.forEach((btn, i) => {
      btn.classList.toggle("selected", i === battle.selection);
    });
  }

  function handleBattleConfirm() {
    if (!battle) return;
    if (battle.turn === "message") {
      advanceBattleMessage();
    } else if (battle.turn === "select") {
      chooseCommand(battle.selection);
    }
  }

  function chooseCommand(index) {
    if (!battle || battle.turn !== "select") return;
    battle.selection = index;
    battle.turn = "resolving";
    battleMenu.hidden = true;

    if (index === 0) {
      const dmg = randInt(playerStats.atkMin, playerStats.atkMax);
      battle.enemyHp = Math.max(0, battle.enemyHp - dmg);
      battle.shakeEnemy = 10;
      const lines = ["勇者の こうげき!", `${battle.npc.name}に ${dmg} の ダメージ!`];
      if (
        !battle.lowHpTriggered &&
        battle.enemyHp > 0 &&
        battle.enemyHp <= battle.enemyMaxHp * 0.3 &&
        battle.npc.lowHpLine
      ) {
        battle.lowHpTriggered = true;
        lines.push(battle.npc.lowHpLine);
      }
      pushBattleMessages(lines, () => afterPlayerAction());
    } else if (index === 1) {
      battle.defending = true;
      pushBattleMessages(["勇者は みを まもっている。"], () => afterPlayerAction(true));
    } else {
      if (Math.random() < 0.6) {
        pushBattleMessages(["うまく にげきれた!"], () => endBattle("flee"));
      } else {
        pushBattleMessages(["にげられなかった!"], () => afterPlayerAction(true));
      }
    }
  }

  function afterPlayerAction(skipWinCheck) {
    if (!skipWinCheck && battle.enemyHp <= 0) {
      const npc = battle.npc;
      const lines = [];
      if (npc.deathLine) lines.push(npc.deathLine);
      lines.push(`${npc.name}を たおした!`);
      const item = npc.dropItem;
      if (item) {
        lines.push(`${item.name}を てにいれた!`);
        if (item.hpBonus) lines.push(`さいだいHPが ${item.hpBonus} あがった!`);
        if (item.atkBonus) lines.push(`こうげきりょくが ${item.atkBonus} あがった!`);
      }
      pushBattleMessages(lines, () => endBattle("win"));
      return;
    }

    const npc = battle.npc;
    const useMagic = !!npc.magic && Math.random() < 0.4;
    let dmg;
    let attackLine;

    if (useMagic) {
      const info = MAGIC_INFO[npc.magic];
      dmg = randInt(npc.atkMin + 2, npc.atkMax + 4);
      attackLine = `${npc.name}の ${info.verb}!`;
      battle.flashColor = info.flash;
      battle.flashUntil = performance.now() + 260;
    } else {
      dmg = randInt(npc.atkMin, npc.atkMax);
      attackLine = `${npc.name}の こうげき!`;
    }

    const finalDmg = battle.defending ? Math.max(1, Math.ceil(dmg / 2)) : dmg;
    battle.defending = false;
    battle.playerHp = Math.max(0, battle.playerHp - finalDmg);
    battle.shakePlayer = 10;

    pushBattleMessages(
      [attackLine, `勇者は ${finalDmg} の ダメージを うけた!`],
      () => {
        if (battle.playerHp <= 0) {
          pushBattleMessages(["勇者は たおれてしまった…"], () => endBattle("lose"));
        } else {
          battle.turn = "select";
          showBattleMenu();
        }
      }
    );
  }

  function endBattle(result) {
    const npc = battle.npc;
    dialogBox.hidden = true;
    battleMenu.hidden = true;
    talkHint.hidden = true;

    let allDefeated = false;
    if (result === "win") {
      visited.add(npc.id);
      updateProgress();
      npc.defeated = true;
      lastDefeatedName = npc.name;
      const item = npc.dropItem;
      if (item) {
        playerStats.maxHp += item.hpBonus || 0;
        playerStats.atkMin += item.atkBonus || 0;
        playerStats.atkMax += item.atkBonus || 0;
        updateStatsDisplay();
      }
      allDefeated = NPCS.every((n) => n.defeated);
    } else if (result === "lose") {
      player.x = PLAZA_X;
      player.y = PLAZA_Y + 40;
    }

    battle = null;

    if (allDefeated) {
      startEnding();
      return;
    }

    scene = "town";
    document.body.classList.remove("battle-active");
    flashTransition();
  }

  function startSquat(npc) {
    scene = "squat";
    flashTransition();
    squat = {
      npc,
      count: 0,
      target: SQUAT_TARGET,
      startedAt: performance.now(),
      duration: SQUAT_DURATION,
      resolved: false,
    };
  }

  function finishSquat(success) {
    if (!squat || squat.resolved) return;
    squat.resolved = true;
    const npc = squat.npc;

    if (success) {
      npc.defeated = false;
      npc.isAlly = true;
      partyOrder.push(npc.id);
      playerStats.maxHp += ALLY_BONUS.hpBonus;
      playerStats.atkMin += ALLY_BONUS.atkBonus;
      playerStats.atkMax += ALLY_BONUS.atkBonus;
      updateStatsDisplay();
      if (NPCS.every((n) => n.isAlly)) {
        pendingFriendshipEnding = true;
      }
    }

    scene = "town";
    flashTransition();
    squat = null;

    dialogName.textContent = npc.name;
    dialogText.textContent = success
      ? `${npc.name}が よみがえり、なかまに なった!`
      : "贖罪が たりなかった……。";
    dialogBox.hidden = false;
    squatResultActive = true;
  }

  function startEnding() {
    scene = "ending";
    document.body.classList.remove("battle-active");
    flashTransition();
    ending = {
      type: "lonely",
      phase: "vanish",
      phaseStart: performance.now(),
      doneShown: false,
    };
  }

  function startFriendshipEnding() {
    scene = "ending";
    document.body.classList.remove("battle-active");
    flashTransition();
    ending = {
      type: "friendship",
      phase: "celebrate",
      phaseStart: performance.now(),
      doneShown: false,
    };
  }

  function updateEnding(timestamp) {
    if (!ending) return;
    const elapsed = timestamp - ending.phaseStart;

    if (ending.type === "friendship") {
      if (ending.phase === "celebrate" && elapsed > 2600) {
        ending.phase = "credits";
        ending.phaseStart = timestamp;
      } else if (ending.phase === "credits" && !ending.doneShown) {
        const totalHeight = FRIENDSHIP_CREDITS.length * 34 + WORLD_H;
        const scrolled = (elapsed / 1000) * 40;
        if (scrolled > totalHeight) {
          ending.doneShown = true;
          restartButton.hidden = false;
        }
      }
      return;
    }

    if (ending.phase === "vanish" && elapsed > 2200) {
      ending.phase = "void";
      ending.phaseStart = timestamp;
    } else if (ending.phase === "void" && elapsed > 4200) {
      ending.phase = "credits";
      ending.phaseStart = timestamp;
    } else if (ending.phase === "credits" && !ending.doneShown) {
      const totalHeight = CREDITS.length * 34 + WORLD_H;
      const scrolled = (elapsed / 1000) * 40;
      if (scrolled > totalHeight) {
        ending.doneShown = true;
        restartButton.hidden = false;
      }
    }
  }

  function resetGame() {
    NPCS.forEach((npc) => {
      npc.defeated = false;
      npc.isAlly = false;
      npc.x = npc.homeX;
      npc.y = npc.homeY;
    });
    partyOrder = [];
    partyTrail = [];
    pendingFriendshipEnding = false;
    visited.clear();
    updateProgress();
    playerStats.maxHp = BASE_PLAYER_STATS.maxHp;
    playerStats.atkMin = BASE_PLAYER_STATS.atkMin;
    playerStats.atkMax = BASE_PLAYER_STATS.atkMax;
    updateStatsDisplay();
    lastDefeatedName = null;
    ending = null;
    restartButton.hidden = true;
    player.x = WORLD_W / 2;
    player.y = WORLD_H / 2 + 60;
    scene = "town";
    flashTransition();
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

  function drawPaths() {
    ctx.strokeStyle = "#ddcda8";
    ctx.lineWidth = 30;
    ctx.lineCap = "round";
    for (const npc of NPCS) {
      ctx.beginPath();
      ctx.moveTo(PLAZA_X, PLAZA_Y);
      ctx.lineTo(npc.homeX, npc.homeY + 6);
      ctx.stroke();
    }
    ctx.strokeStyle = "#e8dcbc";
    ctx.lineWidth = 20;
    for (const npc of NPCS) {
      ctx.beginPath();
      ctx.moveTo(PLAZA_X, PLAZA_Y);
      ctx.lineTo(npc.homeX, npc.homeY + 6);
      ctx.stroke();
    }
  }

  function drawPlaza() {
    ctx.fillStyle = "#e9dfc4";
    ctx.beginPath();
    ctx.arc(PLAZA_X, PLAZA_Y, PLAZA_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#cbb888";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.strokeStyle = "#d8cba3";
    ctx.lineWidth = 2;
    for (let r = 20; r < PLAZA_RADIUS; r += 18) {
      ctx.beginPath();
      ctx.arc(PLAZA_X, PLAZA_Y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    const waterColor = isMonsterDefeated() ? "#8a2620" : "#9cc4d1";
    const waterEdge = isMonsterDefeated() ? "#651c17" : "#7ea9b6";
    const waterHighlight = isMonsterDefeated() ? "#a8433c" : "#c7e0e8";

    ctx.fillStyle = waterColor;
    ctx.beginPath();
    ctx.arc(PLAZA_X, PLAZA_Y, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = waterEdge;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = waterHighlight;
    ctx.beginPath();
    ctx.arc(PLAZA_X, PLAZA_Y, 9, 0, Math.PI * 2);
    ctx.fill();

    if (!isMonsterDefeated()) {
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.beginPath();
      ctx.moveTo(PLAZA_X, PLAZA_Y - 26);
      ctx.lineTo(PLAZA_X + 4, PLAZA_Y - 10);
      ctx.lineTo(PLAZA_X - 4, PLAZA_Y - 10);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawBloodSplat(x, y, r) {
    ctx.fillStyle = "rgba(108, 20, 18, 0.55)";
    for (let i = 0; i < 5; i++) {
      const ang = (i / 5) * Math.PI * 2;
      const dx = Math.cos(ang) * r * 0.4;
      const dy = Math.sin(ang) * r * 0.4;
      ctx.beginPath();
      ctx.ellipse(
        x + dx,
        y + dy,
        r * (0.3 + (i % 2) * 0.15),
        r * (0.22 + (i % 2) * 0.1),
        ang,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    ctx.fillStyle = "rgba(84, 14, 12, 0.6)";
    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.5, r * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawGrave(npc) {
    const cx = npc.x;
    const baseY = npc.y;

    ctx.fillStyle = "rgba(32,32,32,0.18)";
    ctx.beginPath();
    ctx.ellipse(cx, baseY + 2, 30, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#9a9a92";
    ctx.strokeStyle = "#63635c";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 22, baseY);
    ctx.lineTo(cx - 22, baseY - 34);
    ctx.arc(cx, baseY - 34, 22, Math.PI, 0);
    ctx.lineTo(cx + 22, baseY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "#70706a";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, baseY - 46);
    ctx.lineTo(cx, baseY - 14);
    ctx.moveTo(cx - 10, baseY - 34);
    ctx.lineTo(cx + 10, baseY - 34);
    ctx.stroke();
  }

  function drawBush(x, y, r) {
    ctx.fillStyle = "#7fa06a";
    ctx.beginPath();
    ctx.arc(x - r * 0.5, y, r * 0.7, 0, Math.PI * 2);
    ctx.arc(x + r * 0.5, y, r * 0.7, 0, Math.PI * 2);
    ctx.arc(x, y - r * 0.4, r * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#6a8f57";
    ctx.beginPath();
    ctx.arc(x, y + r * 0.15, r * 0.9, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.fill();
  }

  function drawBuilding(npc) {
    const width = 108;
    const wallHeight = 56;
    const roofHeight = 46;
    const cx = npc.homeX;
    const baseY = npc.homeY - 6;
    const wallTop = baseY - wallHeight;

    ctx.fillStyle = "rgba(32,32,32,0.08)";
    ctx.beginPath();
    ctx.ellipse(cx, baseY + 4, width / 2 + 6, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = npc.wall;
    ctx.strokeStyle = "rgba(32,32,32,0.15)";
    ctx.lineWidth = 1.5;
    roundRect(cx - width / 2, wallTop, width, wallHeight, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#8a5a3a";
    const doorW = 26;
    const doorH = 30;
    roundRect(cx - doorW / 2, baseY - doorH, doorW, doorH, 4);
    ctx.fill();

    ctx.fillStyle = npc.roof;
    ctx.beginPath();
    ctx.moveTo(cx - width / 2 - 10, wallTop);
    ctx.lineTo(cx + width / 2 + 10, wallTop);
    ctx.lineTo(cx, wallTop - roofHeight);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(32,32,32,0.18)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const winSize = 16;
    const winY = wallTop + 10;
    ctx.fillStyle = "#fdf6e6";
    ctx.strokeStyle = "rgba(32,32,32,0.2)";
    [cx - width / 2 + 18, cx + width / 2 - 18 - winSize].forEach((wx) => {
      roundRect(wx, winY, winSize, winSize, 3);
      ctx.fill();
      ctx.stroke();
    });
  }

  function drawFence() {
    ctx.strokeStyle = "#c9c0a6";
    ctx.lineWidth = 4;
    ctx.setLineDash([2, 10]);
    ctx.strokeRect(10, 10, WORLD_W - 20, WORLD_H - 20);
    ctx.setLineDash([]);
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

  function drawTown() {
    if (!pattern) pattern = groundPattern();
    ctx.clearRect(0, 0, WORLD_W, WORLD_H);

    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    drawFence();

    for (const bush of BUSHES) {
      drawBush(bush.x, bush.y, bush.r);
    }

    if (isMonsterDefeated()) {
      for (const splat of BLOOD_SPLATS) {
        drawBloodSplat(splat.x, splat.y, splat.r);
      }
    }

    drawPaths();
    drawPlaza();

    for (const npc of NPCS) {
      drawBuilding(npc);
    }

    ctx.fillStyle = "rgba(255, 253, 248, 0.85)";
    roundRect(10, 10, 96, 24, 8);
    ctx.fill();
    ctx.fillStyle = isMonsterDefeated() ? "#8a2620" : "#66645f";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(isMonsterDefeated() ? "荒れた町" : "勇者の町", 20, 23);

    for (const npc of NPCS) {
      if (npc.defeated) {
        drawSign({ ...npc, name: "🪦 おはか" });
      } else if (npc.isAlly) {
        drawSign({ ...npc, name: `💚 ${npc.name}` });
      } else {
        drawSign(npc);
      }
    }

    const entities = [player, ...NPCS].slice().sort((a, b) => a.y - b.y);
    for (const entity of entities) {
      if (entity === player) {
        drawSprite(player.img, player.frame, player.row, player.x, player.y);
      } else if (entity.defeated) {
        drawGrave(entity);
      } else if (entity.isAlly) {
        drawSprite(entity.img, entity.allyFrame ?? 0, entity.allyRow ?? ROW_IDLE, entity.x, entity.y);
      } else {
        drawSprite(entity.img, entity.frame || 0, ROW_IDLE, entity.x, entity.y);
      }
    }

    if (activeNpc && !dialogOpen) {
      drawTalkBubble(activeNpc);
    }

    if (isMonsterDefeated()) {
      ctx.fillStyle = "rgba(120, 20, 20, 0.1)";
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);
    }
  }

  function drawBigSprite(img, frame, row, cx, cy, size) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    ctx.drawImage(
      img,
      frame * FRAME_SIZE,
      row * FRAME_SIZE,
      FRAME_SIZE,
      FRAME_SIZE,
      cx - size / 2,
      cy - size / 2,
      size,
      size
    );
  }

  function drawHpBar(x, y, w, label, hp, maxHp, color) {
    const h = 40;
    ctx.fillStyle = "rgba(255, 253, 248, 0.94)";
    roundRect(x, y, w, h, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(32,32,32,0.2)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#202020";
    ctx.font = "bold 13px sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(label, x + 12, y + 6);

    const barX = x + 12;
    const barY = y + 24;
    const barW = w - 24;
    const barH = 8;
    ctx.fillStyle = "#e4ded0";
    roundRect(barX, barY, barW, barH, 4);
    ctx.fill();

    const ratio = Math.max(0, hp) / maxHp;
    if (ratio > 0) {
      ctx.fillStyle = color;
      roundRect(barX, barY, Math.max(2, barW * ratio), barH, 4);
      ctx.fill();
    }

    ctx.fillStyle = "#66645f";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(`${Math.max(0, hp)}/${maxHp}`, x + w - 12, y + 6);
  }

  function drawBattle() {
    ctx.clearRect(0, 0, WORLD_W, WORLD_H);

    const grad = ctx.createRadialGradient(
      WORLD_W * 0.5,
      WORLD_H * 0.42,
      60,
      WORLD_W * 0.5,
      WORLD_H * 0.42,
      WORLD_W * 0.8
    );
    grad.addColorStop(0, "#4a3530");
    grad.addColorStop(1, "#1e1512");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    ctx.fillStyle = "rgba(0,0,0,0.28)";
    ctx.beginPath();
    ctx.ellipse(WORLD_W * 0.28, WORLD_H * 0.82, 150, 30, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(WORLD_W * 0.72, WORLD_H * 0.4, 160, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!battle) return;

    const shakeE = battle.shakeEnemy > 0 ? (Math.random() - 0.5) * battle.shakeEnemy : 0;
    const shakeP = battle.shakePlayer > 0 ? (Math.random() - 0.5) * battle.shakePlayer : 0;
    if (battle.shakeEnemy > 0) battle.shakeEnemy -= 1;
    if (battle.shakePlayer > 0) battle.shakePlayer -= 1;

    drawBigSprite(
      battle.npc.img,
      player.frame,
      ROW_IDLE,
      WORLD_W * 0.72 + shakeE,
      WORLD_H * 0.42,
      DRAW_SIZE * 1.7
    );

    const allies = NPCS.filter((n) => n.isAlly);
    allies.forEach((npc, i) => {
      const offsetX = -46 - (i % 3) * 32;
      const offsetY = 24 + Math.floor(i / 3) * 30;
      drawBigSprite(
        npc.img,
        player.frame,
        ROW_IDLE,
        WORLD_W * 0.28 + offsetX,
        WORLD_H * 0.82 + offsetY,
        DRAW_SIZE * 0.55
      );
    });

    drawBigSprite(
      player.img,
      player.frame,
      ROW_RIGHT,
      WORLD_W * 0.28 + shakeP,
      WORLD_H * 0.82,
      DRAW_SIZE * 1.35
    );

    drawHpBar(WORLD_W * 0.05, 24, 230, "勇者", battle.playerHp, battle.playerMaxHp, "#5a9463");
    drawHpBar(WORLD_W * 0.95 - 230, 24, 230, battle.npc.name, battle.enemyHp, battle.enemyMaxHp, "#b7442a");

    if (battle.flashColor && performance.now() < battle.flashUntil) {
      ctx.fillStyle = battle.flashColor;
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);

      if (battle.npc.magic === "lightning") {
        ctx.strokeStyle = "rgba(255,255,255,0.9)";
        ctx.lineWidth = 3;
        for (let i = 0; i < 3; i++) {
          const bx = WORLD_W * 0.2 + i * 80;
          ctx.beginPath();
          ctx.moveTo(bx, 0);
          ctx.lineTo(bx - 20, 90);
          ctx.lineTo(bx + 15, 130);
          ctx.lineTo(bx - 10, WORLD_H * 0.5);
          ctx.stroke();
        }
      }
    }
  }

  function drawSquat() {
    ctx.clearRect(0, 0, WORLD_W, WORLD_H);
    const grad = ctx.createLinearGradient(0, 0, 0, WORLD_H);
    grad.addColorStop(0, "#2c2620");
    grad.addColorStop(1, "#141210");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    if (!squat) return;

    const elapsed = performance.now() - squat.startedAt;
    const remaining = Math.max(0, squat.duration - elapsed);
    const timeRatio = remaining / squat.duration;

    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ctx.fillStyle = "#fdf6e6";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("贖罪の ヒンズースクワット", WORLD_W / 2, 56);

    ctx.font = "14px sans-serif";
    ctx.fillStyle = "#cfc6b8";
    ctx.fillText("スペースキーを 連打せよ!", WORLD_W / 2, 92);

    ctx.font = "bold 96px sans-serif";
    ctx.fillStyle = squat.count >= squat.target ? "#7fbf6a" : "#f2c14e";
    ctx.fillText(`${squat.count}`, WORLD_W / 2, 150);

    ctx.font = "20px sans-serif";
    ctx.fillStyle = "#cfc6b8";
    ctx.fillText(`/ ${squat.target}`, WORLD_W / 2, 270);

    const barW = 400;
    const barX = WORLD_W / 2 - barW / 2;
    const barY = 320;
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    roundRect(barX, barY, barW, 14, 7);
    ctx.fill();
    ctx.fillStyle = timeRatio > 0.3 ? "#f2c14e" : "#c0453a";
    roundRect(barX, barY, Math.max(2, barW * timeRatio), 14, 7);
    ctx.fill();

    const bobRow = squat.count % 2 === 0 ? ROW_IDLE : ROW_RIGHT;
    drawBigSprite(player.img, player.frame, bobRow, WORLD_W / 2, WORLD_H - 90, DRAW_SIZE * 1.2);
  }

  function drawEnding() {
    ctx.clearRect(0, 0, WORLD_W, WORLD_H);
    if (!ending) return;

    const elapsed = performance.now() - ending.phaseStart;

    if (ending.type === "friendship") {
      if (ending.phase === "celebrate") {
        drawFriendshipCelebrate(elapsed);
      } else {
        drawFriendshipCredits(elapsed);
      }
      return;
    }

    if (ending.phase === "vanish") {
      drawEndingVanish(elapsed);
    } else if (ending.phase === "void") {
      drawEndingVoid(elapsed);
    } else {
      drawEndingCredits(elapsed);
    }
  }

  function drawFriendshipCelebrate(elapsed) {
    drawTown();
    const t = Math.min(1, elapsed / 1500);
    ctx.fillStyle = `rgba(255, 220, 140, ${t * 0.35})`;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    for (let i = 0; i < 24; i++) {
      const seedX = (i * 97) % WORLD_W;
      const speed = 60 + (i % 5) * 20;
      const fallT = ((elapsed / 1000) * speed + i * 40) % (WORLD_H + 40);
      const hue = (i * 37) % 360;
      ctx.fillStyle = `hsla(${hue}, 70%, 65%, 0.85)`;
      ctx.beginPath();
      ctx.arc(seedX, fallT - 20, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "rgba(90, 60, 20, 0.92)";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("町の みんなが なかまに なった!", WORLD_W / 2, 26);
  }

  function drawFriendshipCredits(elapsed) {
    const grad = ctx.createLinearGradient(0, 0, 0, WORLD_H);
    grad.addColorStop(0, "#fff3d6");
    grad.addColorStop(1, "#ffe1a8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    const lineHeight = 34;
    const scrollY = (elapsed / 1000) * 40;
    ctx.textAlign = "center";
    FRIENDSHIP_CREDITS.forEach((line, i) => {
      const y = WORLD_H + i * lineHeight - scrollY;
      if (y < -20 || y > WORLD_H + 20) return;
      const isEnd = line === "THE END";
      const isHeading = i === 0 || line.startsWith("─");
      ctx.fillStyle = isEnd || isHeading ? "#b7442a" : "#5a4227";
      ctx.font = isEnd ? "bold 28px sans-serif" : isHeading ? "bold 22px sans-serif" : "16px sans-serif";
      ctx.fillText(line, WORLD_W / 2, y);
    });
  }

  function drawEndingVanish(elapsed) {
    drawTown();
    const t = Math.min(1, elapsed / 2200);
    ctx.fillStyle = `rgba(10, 8, 8, ${t * 0.95})`;
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    for (let i = 0; i < 10; i++) {
      const seedX = (i * 137) % WORLD_W;
      const puffT = (elapsed / 1800 + i * 0.13) % 1;
      const y = WORLD_H - puffT * (WORLD_H + 100);
      const alpha = (1 - puffT) * 0.4;
      ctx.fillStyle = `rgba(200,200,200,${alpha})`;
      ctx.beginPath();
      ctx.arc(seedX, y, 30 + i * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawEndingVoid(elapsed) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    ctx.globalAlpha = 0.8;
    drawBigSprite(player.img, 0, ROW_IDLE, WORLD_W / 2, WORLD_H / 2 + 60, DRAW_SIZE * 0.6);
    ctx.globalAlpha = 1;

    const lines = ["……。", "だれも いない。", "勇者は 永遠に、ひとり。"];
    const perLine = 1300;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    lines.forEach((line, i) => {
      const lineStart = i * perLine;
      if (elapsed < lineStart) return;
      const localT = Math.min(1, (elapsed - lineStart) / 500);
      ctx.fillStyle = `rgba(220,220,220,${localT * 0.9})`;
      ctx.font = "18px sans-serif";
      ctx.fillText(line, WORLD_W / 2, WORLD_H / 2 - 60 + i * 30);
    });
  }

  function drawEndingCredits(elapsed) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, WORLD_W, WORLD_H);

    const lineHeight = 34;
    const scrollY = (elapsed / 1000) * 40;
    ctx.textAlign = "center";
    CREDITS.forEach((line, i) => {
      const y = WORLD_H + i * lineHeight - scrollY;
      if (y < -20 || y > WORLD_H + 20) return;
      const isEnd = line === "THE END";
      const isHeading = i === 0 || line.startsWith("─");
      ctx.fillStyle = isEnd || isHeading ? "#f2c14e" : "#e8e4da";
      ctx.font = isEnd ? "bold 28px sans-serif" : isHeading ? "bold 22px sans-serif" : "16px sans-serif";
      ctx.fillText(line, WORLD_W / 2, y);
    });
  }

  function draw() {
    if (scene === "battle") {
      drawBattle();
    } else if (scene === "squat") {
      drawSquat();
    } else if (scene === "ending") {
      drawEnding();
    } else {
      drawTown();
    }
  }

  function loop(timestamp) {
    updateAnimationFrame(timestamp);

    if (scene === "town") {
      updatePlayer();
      recordPartyTrail();
      updatePartyPositions();
      const blocked = dialogOpen || squatResultActive;
      activeNpc = blocked ? null : findActiveNpc();
      talkHint.hidden = !activeNpc || blocked;
      if (activeNpc) {
        talkHint.textContent = activeNpc.defeated || activeNpc.isAlly
          ? "Enter / Space / Z で話す"
          : "Enter / Space / Z で たたかう";
      }
    } else if (scene === "squat") {
      if (squat && !squat.resolved) {
        if (squat.count >= squat.target) {
          finishSquat(true);
        } else if (performance.now() - squat.startedAt >= squat.duration) {
          finishSquat(false);
        }
      }
      activeNpc = null;
    } else if (scene === "ending") {
      updateEnding(timestamp);
      activeNpc = null;
    } else {
      activeNpc = null;
    }

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
  const UP_KEYS = new Set(["ArrowUp", "w", "W"]);
  const DOWN_KEYS = new Set(["ArrowDown", "s", "S"]);

  window.addEventListener("keydown", (event) => {
    if (scene === "battle") {
      if (battle && battle.turn === "select") {
        if (UP_KEYS.has(event.key)) {
          battle.selection = (battle.selection + 2) % 3;
          renderBattleMenu();
          event.preventDefault();
          return;
        }
        if (DOWN_KEYS.has(event.key)) {
          battle.selection = (battle.selection + 1) % 3;
          renderBattleMenu();
          event.preventDefault();
          return;
        }
      }
      if (TALK_KEYS.has(event.key)) {
        if (!event.repeat) talkKeyEdge = true;
        event.preventDefault();
        return;
      }
      if (KEY_MAP[event.key]) event.preventDefault();
      return;
    }

    if (scene === "squat" || scene === "ending") {
      if (TALK_KEYS.has(event.key)) {
        if (!event.repeat) talkKeyEdge = true;
        event.preventDefault();
        return;
      }
      if (KEY_MAP[event.key]) event.preventDefault();
      return;
    }

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

  battleCmdButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      if (scene === "battle" && battle && battle.turn === "select") {
        chooseCommand(i);
      }
    });
  });

  restartButton.addEventListener("click", () => {
    resetGame();
  });

  async function init() {
    updateProgress();
    updateStatsDisplay();
    NPCS.forEach((npc) => {
      npc.homeX = npc.x;
      npc.homeY = npc.y;
    });
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
