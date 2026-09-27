// 懲罰空間。断片の世界と同じRPGエンジン(rpg.js)の上で動く。
// 懲罰空間そのものも1つの世界(worlds.js の void)で、断片に触れると別の世界に入り、条件を満たすと戻ってくる。
(function () {
  "use strict";

  const canvas = document.getElementById("fieldCanvas");
  const ctx = canvas.getContext("2d");
  const VW = canvas.width;
  const VH = canvas.height;

  const introHint = document.getElementById("introHint");
  const progressText = document.getElementById("progressText");
  const inventoryText = document.getElementById("inventoryText");
  const storyOverlay = document.getElementById("storyOverlay");
  const joystick = document.getElementById("joystick");
  const joystickKnob = document.getElementById("joystickKnob");
  const actionBtnA = document.getElementById("actionBtnA");
  const actionBtnB = document.getElementById("actionBtnB");
  const actionBtnC = document.getElementById("actionBtnC");
  const statusOverlay = document.getElementById("statusOverlay");
  const fadeOverlay = document.getElementById("fadeOverlay");
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    joystick.classList.add("touch-enabled");
    actionBtnA.classList.add("touch-enabled");
    actionBtnB.classList.add("touch-enabled");
    actionBtnC.classList.add("touch-enabled");
  }

  const gameFrame = document.querySelector(".game-frame");
  const fieldHeader = document.querySelector(".field-header");
  const fieldWrap = document.querySelector(".field-wrap");
  const fieldStatus = document.querySelector(".field-status");
  const JOY_SIZE = 92;
  const JOY_INSET = 16;
  const BTN_SIZE = 46;
  // Diagonal offset (in each of x/y) from the pair's shared center to each
  // button's center. Distance between the two centers ends up BTN_DIAG*2*sqrt(2)
  // (~62px), safely more than BTN_SIZE (46px) so the circles don't overlap.
  const BTN_DIAG = 22;

  function fitGameFrame() {
    const isCompact = document.body.classList.contains("landscape-compact");
    if (!isCompact) {
      gameFrame.style.width = "";
      gameFrame.style.height = "";
      return;
    }
    // Compute the exact box available for the game-frame directly from the
    // DOM rather than relying on CSS aspect-ratio + flexbox sizing, which
    // resolves inconsistently between browser engines (notably iOS Safari).
    const wrapStyle = getComputedStyle(fieldWrap);
    const wrapPadTop = parseFloat(wrapStyle.paddingTop) || 0;
    const wrapPadBottom = parseFloat(wrapStyle.paddingBottom) || 0;
    const wrapPadLeft = parseFloat(wrapStyle.paddingLeft) || 0;
    const wrapPadRight = parseFloat(wrapStyle.paddingRight) || 0;
    const gap = parseFloat(wrapStyle.rowGap) || 0;

    const headerH = fieldHeader.getBoundingClientRect().height;
    const statusH = fieldStatus.getBoundingClientRect().height;
    const availH = window.innerHeight - headerH - wrapPadTop - wrapPadBottom - gap - statusH;
    const availW = window.innerWidth - wrapPadLeft - wrapPadRight;

    const ratio = 960 / 600;
    let w = Math.max(0, availW);
    let h = w / ratio;
    if (h > availH) {
      h = Math.max(0, availH);
      w = h * ratio;
    }
    gameFrame.style.width = `${w}px`;
    gameFrame.style.height = `${h}px`;
  }

  function diagonalPair(cx, cy) {
    return {
      aLeft: cx - BTN_SIZE / 2 + BTN_DIAG,
      aTop: cy - BTN_SIZE / 2 + BTN_DIAG,
      bLeft: cx - BTN_SIZE / 2 - BTN_DIAG,
      bTop: cy - BTN_SIZE / 2 - BTN_DIAG,
    };
  }
  // Shared margin threshold so the joystick and A/B buttons always agree on
  // whether there's "enough" letterbox space to escape into, given the left
  // and right margins are normally equal. Must clear the larger of the two
  // controls (the joystick) plus a little breathing room.
  const MARGIN_THRESHOLD = JOY_SIZE + 8;

  function positionJoystick() {
    const frameRect = gameFrame.getBoundingClientRect();
    const isCompact = document.body.classList.contains("landscape-compact");
    const leftMargin = frameRect.left;

    let left, top;
    if (isCompact && leftMargin > MARGIN_THRESHOLD) {
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

  function positionActionButtons() {
    const frameRect = gameFrame.getBoundingClientRect();
    const isCompact = document.body.classList.contains("landscape-compact");
    const rightMargin = window.innerWidth - frameRect.right;

    let aLeft, aTop, bLeft, bTop;
    if (isCompact && rightMargin > MARGIN_THRESHOLD) {
      // enough letterbox space beside the game view: rest the buttons there,
      // diagonally, instead of covering the field
      const cx = frameRect.right + rightMargin / 2;
      const cy = frameRect.top + frameRect.height / 2;
      ({ aLeft, aTop, bLeft, bTop } = diagonalPair(cx, cy));
    } else {
      // overlay the bottom-right corner of the game view: pick the pair's
      // center so its bounding box corner lands at the inset point
      const cx = frameRect.right - JOY_INSET - BTN_SIZE / 2 - BTN_DIAG;
      const cy = frameRect.bottom - JOY_INSET - BTN_SIZE / 2 - BTN_DIAG;
      ({ aLeft, aTop, bLeft, bTop } = diagonalPair(cx, cy));
    }
    actionBtnA.style.left = `${aLeft}px`;
    actionBtnA.style.top = `${aTop}px`;
    actionBtnB.style.left = `${bLeft}px`;
    actionBtnB.style.top = `${bTop}px`;
    // C(ステータス)は A の上に
    actionBtnC.style.left = `${aLeft}px`;
    actionBtnC.style.top = `${aTop - 70}px`;
  }

  function updateLayoutMode() {
    const isLandscape = window.innerWidth > window.innerHeight;
    const compact = isTouchDevice && isLandscape;
    document.body.classList.toggle("landscape-compact", compact);
    document.documentElement.classList.toggle("landscape-compact", compact);
    fitGameFrame();
    positionJoystick();
    positionActionButtons();
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
      fullscreenBtn.classList.toggle("is-full", isFullscreen());
    });
    document.addEventListener("webkitfullscreenchange", () => {
      fullscreenBtn.classList.toggle("is-full", isFullscreen());
    });
  }

  // ---- 会話(文字の出る窓) ----
  // 画面下の黒い窓にドット文字で出す(ステータスや吹き出しと同じ文字と窓)。1 ページは 3 行まで、あふれたら次のページへ
  const STORY_REVEAL_CHARS_PER_SEC = 38;
  const MSG = { x: 12, y: 186, w: 456, h: 102, lines: 3, textW: 420 }; // 480×300 の単位(マップの絵と同じドット)
  let story = null; // { pages, index, lines, total, revealed, onDone }

  // pages: 文字列(ナレーション) / [話者, 台詞] / { title, text, face, choices } の配列
  // face: 顔の絵(今の世界の画像の名前)。窓の左に出す。choices: 選択肢(最後のページで選ぶ)。onDone(選んだ番号)
  const FACE_W = 88; // 顔の窓の幅(480×300 の単位)
  function startDialog(pages, onDone) {
    const norm = [];
    for (const p of pages) {
      const page = typeof p === "string" ? { title: "", text: p } : Array.isArray(p) ? { title: p[0], text: p[1] } : p;
      const textW = MSG.textW - (page.face ? FACE_W + 6 : 0);
      const lines = window.bogiPix.wrap(page.text, textW);
      for (let i = 0; i < lines.length; i += MSG.lines) {
        const last = i + MSG.lines >= lines.length;
        norm.push({ title: page.title, face: page.face, lines: lines.slice(i, i + MSG.lines), choices: last ? page.choices : null });
      }
    }
    story = { pages: norm, index: 0, lines: [], total: 0, revealed: 0, choice: 0, onDone: onDone || null };
    showStoryPage();
    storyOverlay.hidden = false;
    resetJoy();
    joystick.style.display = "none";
  }

  function showStoryPage() {
    const page = story.pages[story.index];
    story.lines = page.lines;
    story.title = page.title;
    story.face = page.face;
    story.choices = page.choices;
    story.choice = 0;
    story.total = page.lines.join("").length;
    story.revealed = 0;
    // 選択肢のあるページでは、スマホのジョイスティックで選べるように出しておく
    joystick.style.display = page.choices ? "" : "none";
  }

  function updateStory(dt) {
    story.revealed = Math.min(story.total, story.revealed + STORY_REVEAL_CHARS_PER_SEC * dt);
  }

  // 選択肢が出ているか(文字を出し終わったあと)
  const choosing = () => story && story.choices && story.revealed >= story.total;

  function drawStory(t) {
    const P = window.bogiPix;
    const S = 2;
    // 顔の窓(左)。文字の窓はその右
    let tx = MSG.x;
    if (story.face) {
      P.win(ctx, MSG.x * S, MSG.y * S, FACE_W * S, MSG.h * S, S);
      const im = rpg.image(story.face);
      if (im) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(im, (MSG.x + (FACE_W - 64) / 2) * S, (MSG.y + (MSG.h - 64) / 2) * S, 64 * S, 64 * S);
        ctx.restore();
      }
      tx = MSG.x + FACE_W + 6;
    }
    const tw = MSG.x + MSG.w - tx;
    // 話者(題)は窓の上に小さな窓で
    if (story.title) {
      const tw2 = P.width(story.title) + 20;
      P.win(ctx, tx * S, (MSG.y - 30) * S, tw2 * S, 30 * S, S);
      P.text(ctx, story.title, (tx + 10) * S, (MSG.y - 23) * S, S, "#ffe08a");
    }
    P.win(ctx, tx * S, MSG.y * S, tw * S, MSG.h * S, S);
    let left = Math.floor(story.revealed);
    story.lines.forEach((line, i) => {
      if (left <= 0) return;
      const part = line.slice(0, left);
      left -= line.length;
      P.text(ctx, part, (tx + 16) * S, (MSG.y + 12 + i * 26) * S, S);
    });
    if (choosing()) {
      // 選択肢の窓(文字の窓の右上に重ねる)。▶ で選ぶ
      const cw = Math.max(...story.choices.map((c) => P.width(c))) + 44;
      const ch = 16 + story.choices.length * 24;
      const cx = MSG.x + MSG.w - cw;
      const cy = MSG.y - ch - 4;
      P.win(ctx, cx * S, cy * S, cw * S, ch * S, S);
      story.choices.forEach((c, i) => {
        P.text(ctx, c, (cx + 28) * S, (cy + 9 + i * 24) * S, S);
        if (i === story.choice) {
          ctx.fillStyle = "#fff";
          for (let k = 0; k < 6; k++) ctx.fillRect((cx + 12 + k) * S, (cy + 12 + i * 24 + k) * S, S, (13 - k * 2) * S);
        }
      });
    } else if (story.revealed >= story.total && Math.floor(t * 2.5) % 2 === 0) {
      // 読み終わったら ▼ を点滅(次へ)
      P.text(ctx, "▼", (MSG.x + MSG.w - 26) * S, (MSG.y + MSG.h - 24) * S, S);
    }
  }

  // 選択肢: 上下で選ぶ
  function moveChoice(d) {
    if (!choosing()) return;
    const n = story.choices.length;
    story.choice = (story.choice + d + n) % n;
  }
  // スマホ: 選択肢のあいだはジョイスティックを倒すたびに 1 つ動く
  let choiceJoyDir = 0;
  function choiceJoystick() {
    if (!choosing()) return;
    const d = joyActive ? (joyVec.y < -0.6 ? -1 : joyVec.y > 0.6 ? 1 : 0) : 0;
    if (d && d !== choiceJoyDir) moveChoice(d);
    choiceJoyDir = d;
  }

  function closeStory(choice) {
    const done = story.onDone;
    story = null;
    storyOverlay.hidden = true;
    joystick.style.display = "";
    if (done) done(choice);
  }

  function advanceStory() {
    if (!story) return;
    if (story.revealed < story.total) {
      story.revealed = story.total;
      return;
    }
    if (story.index < story.pages.length - 1) {
      story.index += 1;
      showStoryPage();
      return;
    }
    closeStory(story.choices ? story.choice : undefined);
  }

  // Bは会話を飛ばす。飛ばしても、会話の結果(道具・フラグ)は反映する
  function skipStory() {
    if (!story) return;
    // 選択肢があるなら B は「いいえ」(最後の選択肢)
    const last = story.pages[story.pages.length - 1];
    closeStory(last.choices ? last.choices.length - 1 : undefined);
  }

  // ---- 保存 ----
  const SAVE_KEY = "bogidachi.field.v1";
  const gameState = loadState();

  function loadState() {
    const empty = { items: [], words: [], cleared: [], flags: {} };
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return empty;
      return Object.assign(empty, JSON.parse(raw));
    } catch (e) {
      return empty;
    }
  }

  function saveState() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    } catch (e) {
      // 保存できない環境(プライベートモードなど)では、その回かぎり
    }
    updateStatus();
  }

  // ---- 世界の出入り ----
  const HUB = "void";
  let transitioning = false;

  function transition(fn) {
    transitioning = true;
    resetJoy();
    fadeOverlay.classList.add("on");
    setTimeout(() => {
      fn();
      // 画像を読み終わるまで暗いまま。読み終わったらフェードイン
      rpg.whenReady(() => {
        // 読み終わってからも少しだけ暗いまま待つ(入った直後に位置を決め直す人や車椅子が、一瞬ワープして見えないように)
        setTimeout(() => {
          fadeOverlay.classList.remove("on");
          setTimeout(() => {
            transitioning = false;
          }, 300);
        }, 350);
      });
    }, 480);
  }

  const rpg = window.createBogiRPG({
    ctx,
    VW,
    VH,
    host: {
      say: startDialog,
      state: gameState,
      save: saveState,
      fade: (fn) => transition(fn),
      // 懲罰空間の断片から、その断片の世界へ
      enterWorld(id) {
        if (!window.BOGI_WORLDS[id]) return;
        transition(() => {
          rpg.enter(window.BOGI_WORLDS[id]);
          updateStatus();
        });
      },
      // 断片の世界から、懲罰空間のその断片の前へ
      exit(id) {
        transition(() => {
          rpg.enter(window.BOGI_WORLDS[HUB], `from_${id}`);
          updateStatus();
        });
      },
    },
  });

  if (/[?&]debug\b/.test(location.search)) {
    window.bogiDebug = { rpg, gameState, enterWorld: (id) => rpg.enter(window.BOGI_WORLDS[id]) };
  }

  function updateStatus() {
    const hub = window.BOGI_WORLDS[HUB];
    const frags = hub.fragments || [];
    const found = frags.filter((id) => gameState.flags[`${HUB}.found.${id}`]).length;
    progressText.textContent = rpg.isHub ? `見つけた断片: ${found} / ${frags.length}` : `断片のなか: ${rpg.worldName}`;
    const parts = [];
    if (gameState.items.length) parts.push(`もちもの: ${gameState.items.join("、")}`);
    if (gameState.words.length) parts.push(`ことば: ${gameState.words.join("、")}`);
    inventoryText.textContent = parts.join("　／　");
    inventoryText.hidden = parts.length === 0;
  }

  // ---- ステータス画面 ----
  // スーファミのドラクエ風: 320×200 に描き、文字は白黒の2値にしてから CSS でぼかさず拡大する
  let statusOpen = false;
  const stCanvas = document.getElementById("statusCanvas");
  const stCtx = stCanvas.getContext("2d");
  // 文字はほかの画面と同じ(window.bogiPix)。このキャンバスは 1 倍で描いて CSS で拡大する
  const ST_FONT = () => "";
  const stTmpCtx = { measureText: (t) => ({ width: window.bogiPix.width(t) }), set font(v) {} };
  function stText(text, x, y, color = "#ffffff", maxW = 999) {
    const P = window.bogiPix;
    let t = text;
    while (t.length > 1 && P.width(t) > maxW) t = t.slice(0, -1);
    if (t !== text) t = t.slice(0, -1) + "…";
    P.text(stCtx, t, x, y, 1, color);
  }
  // 白い二重枠の窓(角を 1 ドット落とす)
  function stWindow(x, y, w, h) {
    window.bogiPix.win(stCtx, x, y, w, h, 1);
  }

  // 2段構え(スーファミのドラクエ風): 左のコマンドで選ぶ → 一覧(あふれたらページ送り)。右は数だけの要約
  const ST_PAGE = 5; // 一覧の1ページの行数
  const stMenu = { mode: "top", cmd: 0, cur: 0 };
  const ST_CMDS = [
    { key: "items", label: "どうぐ" },
    { key: "words", label: "ことば" },
    { key: "skills", label: "とくぎ" },
    { key: "frags", label: "断片" },
  ];
  function stRows(key) {
    const hub = window.BOGI_WORLDS[HUB];
    if (key === "items") return gameState.items.map((t) => ({ text: t }));
    if (key === "words") return gameState.words.map((t) => ({ text: t }));
    if (key === "skills") {
      const jumped = Object.keys(gameState.flags).some((k) => /\.jump$/.test(k) && gameState.flags[k]);
      return jumped ? [{ text: "ジャンプ", note: "Bボタン / Xキーで　とぶ。" }] : [];
    }
    const texts = hub.fragmentTexts || {};
    return (hub.fragments || []).map((id) =>
      gameState.flags[`${HUB}.found.${id}`]
        ? { text: window.BOGI_WORLDS[id].name, done: gameState.cleared.includes(id), note: texts[id] }
        : { text: "？？？？", dim: true }
    );
  }
  function stCursor(x, y) {
    // ▶ をドットで描く
    stCtx.fillStyle = "#fff";
    for (let i = 0; i < 6; i++) stCtx.fillRect(x + i, y + i, 1, 13 - i * 2);
  }
  function renderStatus() {
    const hub = window.BOGI_WORLDS[HUB];
    stCtx.fillStyle = "#000";
    stCtx.fillRect(0, 0, 480, 300);
    // 左: コマンド
    stWindow(12, 12, 156, 118);
    ST_CMDS.forEach((c, i) => {
      stText(c.label, 42, 24 + i * 24);
      if (stMenu.cmd === i) stCursor(24, 27 + i * 24);
    });
    // 右: 要約(数だけ。いくつ増えてもあふれない)
    const frags = hub.fragments || [];
    const found = frags.filter((id) => gameState.flags[`${HUB}.found.${id}`]).length;
    stWindow(176, 12, 292, 118);
    stText("きー", 192, 24);
    stText(`ばしょ：${rpg.isHub ? hub.name : rpg.worldName}`, 192, 48, "#ffffff", 264);
    stText(`断片　${found}/${frags.length}`, 192, 72);
    stText(`どうぐ　${gameState.items.length}　ことば　${gameState.words.length}`, 192, 96);
    if (stMenu.mode === "list") {
      const cmd = ST_CMDS[stMenu.cmd];
      const rows = stRows(cmd.key);
      const pages = Math.max(1, Math.ceil(rows.length / ST_PAGE));
      const page = Math.floor(stMenu.cur / ST_PAGE);
      stWindow(12, 138, 456, 150);
      stText(cmd.label, 28, 150);
      if (pages > 1) stText(`${page + 1}/${pages}`, 420, 150, "#8a8a8a");
      if (!rows.length) stText("なし", 50, 174, "#8a8a8a");
      rows.slice(page * ST_PAGE, page * ST_PAGE + ST_PAGE).forEach((r, i) => {
        const ty = 174 + i * 22;
        if (page * ST_PAGE + i === stMenu.cur) stCursor(28, ty + 2);
        if (r.done) stText("✓", 40, ty);
        stText(r.text, 58, ty, r.dim ? "#8a8a8a" : "#ffffff", 220);
      });
      if (page < pages - 1) stText("▼", 440, 264);
      // 選んでいるものの説明(あれば)
      const sel = rows[stMenu.cur];
      if (sel && sel.note) {
        stWindow(290, 164, 168, 96);
        wrapText(sel.note, 302, 176, 146, 3);
      }
    } else {
      stText("A でひらく　C でとじる", 262, 276, "#8a8a8a");
    }
  }
  // 窓の幅で折り返す
  function wrapText(text, x, y, w, maxLines) {
    window.bogiPix
      .wrap(text, w)
      .slice(0, maxLines)
      .forEach((line, i) => stText(line, x, y + i * 22));
  }
  // スマホ: ジョイスティックを倒すたびに1つ動く(倒しっぱなしなら少しずつ送る)
  let stJoyDir = null;
  let stJoyNext = 0;
  function statusJoystick() {
    const now = performance.now();
    let dir = null;
    if (joyActive) {
      if (joyVec.y < -0.6) dir = "up";
      else if (joyVec.y > 0.6) dir = "down";
      else if (joyVec.x < -0.6) dir = "left";
      else if (joyVec.x > 0.6) dir = "right";
    }
    if (dir && (dir !== stJoyDir || now >= stJoyNext)) {
      statusInput(dir);
      stJoyNext = now + (dir !== stJoyDir ? 420 : 160);
    }
    stJoyDir = dir;
  }
  // 操作: 上下で選ぶ、A でひらく、B / C でひとつ戻る(最初の画面ならとじる)
  function statusInput(action) {
    if (stMenu.mode === "top") {
      if (action === "up") stMenu.cmd = (stMenu.cmd + ST_CMDS.length - 1) % ST_CMDS.length;
      else if (action === "down") stMenu.cmd = (stMenu.cmd + 1) % ST_CMDS.length;
      else if (action === "a") {
        stMenu.mode = "list";
        stMenu.cur = 0;
      } else if (action === "b" || action === "c") return toggleStatus(false);
    } else {
      const n = stRows(ST_CMDS[stMenu.cmd].key).length;
      if (action === "up" && n) stMenu.cur = (stMenu.cur + n - 1) % n;
      else if (action === "down" && n) stMenu.cur = (stMenu.cur + 1) % n;
      else if (action === "left" && n) stMenu.cur = Math.max(0, stMenu.cur - ST_PAGE);
      else if (action === "right" && n) stMenu.cur = Math.min(n - 1, stMenu.cur + ST_PAGE);
      else if (action === "b" || action === "c") stMenu.mode = "top"; // 一覧からは C でもひとつ戻る
    }
    renderStatus();
  }
  function toggleStatus(open = !statusOpen) {
    if (open && (story || transitioning || rpg.viewing)) return;
    statusOpen = open;
    if (open) {
      stMenu.mode = "top";
      stMenu.cur = 0;
      renderStatus();
      resetJoy();
      for (const k in keys) keys[k] = false;
    }
    statusOverlay.hidden = !open;
    document.body.classList.toggle("status-open", open);
  }

  // 最初の一言(……ここには、まだ何もない。)。ほかの文字と同じ窓とドット文字で、歩き出すと消えていく
  const INTRO_TEXT = "……ここには、まだ何もない。";
  let moved = false;
  let introFade = 1;
  function dismissIntro() {
    moved = true;
  }
  function drawIntro(dt) {
    if (moved) introFade = Math.max(0, introFade - dt / 0.9);
    if (introFade <= 0) return;
    const P = window.bogiPix;
    const S = 2;
    const w = (P.width(INTRO_TEXT) + 24) * S;
    const h = 30 * S;
    const x = Math.round((VW - w) / 2 / S) * S;
    const y = Math.round((VH / 2 - h / 2) / S) * S;
    ctx.save();
    ctx.globalAlpha = introFade;
    P.win(ctx, x, y, w, h, S);
    P.text(ctx, INTRO_TEXT, x + 12 * S, y + 7 * S, S);
    ctx.restore();
  }

  // ---- 入力 ----
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
    const isAction = e.code === "Enter" || e.code === "Space" || e.code === "KeyZ";
    // ステータス画面: C で開閉。開いているあいだは C・B(X)・Esc・決定でとじ、ほかの操作は止める
    if (statusOpen) {
      const dir = KEY_MAP[e.code];
      if (dir) statusInput(dir);
      else if (!e.repeat) {
        if (isAction) statusInput("a");
        else if (e.code === "KeyX" || e.code === "Escape" || e.code === "Backspace") statusInput("b");
        else if (e.code === "KeyC") statusInput("c");
      }
      if (!e.code.startsWith("F")) e.preventDefault();
      return;
    }
    if (e.code === "KeyC" && !story) {
      if (!e.repeat) toggleStatus(true);
      e.preventDefault();
      return;
    }
    if (story) {
      if (isAction) {
        advanceStory();
        e.preventDefault();
      } else if (choosing() && (KEY_MAP[e.code] === "up" || KEY_MAP[e.code] === "down")) {
        moveChoice(KEY_MAP[e.code] === "up" ? -1 : 1);
        e.preventDefault();
      } else if (e.code === "KeyX" || e.code === "Escape") {
        if (!e.repeat) skipStory();
        e.preventDefault();
      }
      return;
    }
    if (isAction) {
      if (!transitioning && !e.repeat) rpg.interact();
      e.preventDefault();
      return;
    }
    if (e.code === "KeyX" || e.code === "ShiftLeft" || e.code === "ShiftRight") {
      if (!transitioning && !e.repeat) rpg.jump();
      e.preventDefault();
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

  // pointerdown (not click) so touch input reacts immediately, matching the
  // joystick's own event handling rather than waiting on click synthesis
  actionBtnA.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (statusOpen) statusInput("a");
    else if (story) advanceStory();
    else if (!transitioning) rpg.interact();
  });
  actionBtnC.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (statusOpen) statusInput("c");
    else toggleStatus(true);
  });
  actionBtnB.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (statusOpen) return statusInput("b");
    if (story) skipStory();
    else if (!transitioning) rpg.jump(); // B: ジャンプ(覚えたあと)
  });

  function readInput() {
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
    const len = Math.hypot(dx, dy);
    if (len > 1) {
      dx /= len;
      dy /= len;
    }
    return { x: dx, y: dy };
  }

  // ---- ループ ----
  // 起きたエラーを画面に出す(スマホでも原因がわかるように)。最初の1件だけ
  let reportedError = false;
  function reportError(e) {
    if (reportedError) return;
    reportedError = true;
    introHint.textContent = `エラー: ${(e && e.message) || e}`;
    introHint.classList.remove("hidden");
    introHint.style.whiteSpace = "normal";
    introHint.style.maxWidth = "90%";
  }
  window.bogiReportError = reportError;
  window.addEventListener("error", (ev) => reportError(ev.error || ev.message));

  let lastTime = 0;
  function loop(timestamp) {
    requestAnimationFrame(loop);
    try {
      frame(timestamp);
    } catch (e) {
      reportError(e);
    }
  }

  function frame(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = Math.min(0.05, (timestamp - lastTime) / 1000);
    lastTime = timestamp;
    const t = timestamp / 1000;

    if (statusOpen) statusJoystick();
    if (story) {
      updateStory(dt);
      choiceJoystick();
    }
    else if (!transitioning && !statusOpen) {
      const input = readInput();
      if (input.x || input.y) dismissIntro();
      rpg.update(dt, t, input);
    } else if (transitioning) {
      // 暗転しているあいだも世界の時間は進める(入った直後に動き出す人や車椅子が、明ける前に位置についておくように)
      rpg.update(dt, t, { x: 0, y: 0 });
    }
    rpg.draw(t);
    drawIntro(dt);
    if (story) drawStory(t);
    document.body.classList.toggle("viewing", rpg.viewing);
  }

  rpg.enter(window.BOGI_WORLDS[HUB]);
  updateStatus();
  // 最初も、画像を読み終わってからフェードイン
  rpg.whenReady(() => fadeOverlay.classList.remove("on"));
  requestAnimationFrame(loop);
})();
