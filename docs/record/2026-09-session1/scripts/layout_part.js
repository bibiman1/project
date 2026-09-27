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
