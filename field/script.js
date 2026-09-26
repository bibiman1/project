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
  const storyTitleEl = document.getElementById("storyTitle");
  const storyTextEl = document.getElementById("storyText");
  const joystick = document.getElementById("joystick");
  const joystickKnob = document.getElementById("joystickKnob");
  const actionBtnA = document.getElementById("actionBtnA");
  const actionBtnB = document.getElementById("actionBtnB");
  const fadeOverlay = document.getElementById("fadeOverlay");
  const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    joystick.classList.add("touch-enabled");
    actionBtnA.classList.add("touch-enabled");
    actionBtnB.classList.add("touch-enabled");
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
      fullscreenBtn.textContent = isFullscreen() ? "⤢" : "⛶";
    });
    document.addEventListener("webkitfullscreenchange", () => {
      fullscreenBtn.textContent = isFullscreen() ? "⤢" : "⛶";
    });
  }

  // ---- 会話(文字の出る窓) ----
  const STORY_REVEAL_CHARS_PER_SEC = 38;
  let story = null; // { pages, index, text, revealed, onDone }

  // pages: 文字列(ナレーション) / [話者, 台詞] / { title, text } の配列
  function startDialog(pages, onDone) {
    const norm = pages.map((p) => {
      if (typeof p === "string") return { title: "", text: p };
      if (Array.isArray(p)) return { title: p[0], text: p[1] };
      return p;
    });
    story = { pages: norm, index: 0, text: "", revealed: 0, onDone: onDone || null };
    showStoryPage();
    storyOverlay.hidden = false;
    resetJoy();
    joystick.style.display = "none";
  }

  function showStoryPage() {
    const page = story.pages[story.index];
    story.text = page.text;
    story.revealed = 0;
    storyTitleEl.textContent = page.title;
    storyTitleEl.hidden = !page.title;
    storyTextEl.textContent = "";
  }

  function updateStory(dt) {
    story.revealed = Math.min(story.text.length, story.revealed + STORY_REVEAL_CHARS_PER_SEC * dt);
    storyTextEl.textContent = story.text.slice(0, Math.floor(story.revealed));
  }

  function closeStory() {
    const done = story.onDone;
    story = null;
    storyOverlay.hidden = true;
    joystick.style.display = "";
    if (done) done();
  }

  function advanceStory() {
    if (!story) return;
    if (story.revealed < story.text.length) {
      story.revealed = story.text.length;
      storyTextEl.textContent = story.text;
      return;
    }
    if (story.index < story.pages.length - 1) {
      story.index += 1;
      showStoryPage();
      return;
    }
    closeStory();
  }

  // Bは会話を飛ばす。飛ばしても、会話の結果(道具・フラグ)は反映する
  function skipStory() {
    if (story) closeStory();
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
      fadeOverlay.classList.remove("on");
      setTimeout(() => {
        transitioning = false;
      }, 300);
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

  let moved = false;
  function dismissIntro() {
    if (!moved) {
      moved = true;
      introHint.classList.add("hidden");
    }
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
    if (story) {
      if (isAction) {
        advanceStory();
        e.preventDefault();
      }
      return;
    }
    if (isAction) {
      if (!transitioning && !e.repeat) rpg.interact();
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
    if (story) advanceStory();
    else if (!transitioning) rpg.interact();
  });
  actionBtnB.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    skipStory();
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

    if (story) updateStory(dt);
    else if (!transitioning) {
      const input = readInput();
      if (input.x || input.y) dismissIntro();
      rpg.update(dt, t, input);
    }
    rpg.draw(t);
    document.body.classList.toggle("viewing", rpg.viewing);
  }

  rpg.enter(window.BOGI_WORLDS[HUB]);
  updateStatus();
  requestAnimationFrame(loop);
})();
