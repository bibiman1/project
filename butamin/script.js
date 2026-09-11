(() => {
  "use strict";

  const SPRITE_URL = "./assets/piggybank_simple_sprite_sheet.png";
  const FRAME_SIZE = 128;
  const COLS = 8;
  const ROW_IDLE = 0;
  const ROW_WALK_RIGHT = 1;
  const ROW_WALK_LEFT = 2;
  const ROW_JUMP = 3;
  const ROW_BOW = 4;
  const SIDE_MARGIN = 24;
  const LANE_OFFSET_FROM_BOTTOM = 180;

  function initializeButamin(wrapper) {
    if (wrapper.dataset.initialized === "true") return;

    const canvas = wrapper.querySelector(".butamin-canvas");
    if (!canvas) return;

    wrapper.dataset.initialized = "true";

    const ctx = canvas.getContext("2d");
    const sprite = new Image();
    let frame = 0;
    let row = ROW_IDLE;
    let x = Math.floor((window.innerWidth - FRAME_SIZE) / 2);
    let y = window.innerHeight - FRAME_SIZE - LANE_OFFSET_FROM_BOTTOM;
    let vx = 1;
    let vy = 0;
    let direction = 1;
    let isJumping = false;
    let lastFrameTime = 0;
    let lastBehaviorChange = Date.now();
    let pauseUntil = 0;

    function bounds() {
      const minX = Math.min(SIDE_MARGIN, Math.max(0, window.innerWidth - FRAME_SIZE));
      const maxX = Math.max(minX, window.innerWidth - FRAME_SIZE - SIDE_MARGIN);
      const groundY = Math.max(0, window.innerHeight - FRAME_SIZE - LANE_OFFSET_FROM_BOTTOM);
      return { minX, maxX, groundY };
    }

    function setWrapperPosition() {
      wrapper.style.left = `${x}px`;
      wrapper.style.top = `${y}px`;
      wrapper.style.right = "auto";
      wrapper.style.bottom = "auto";
      wrapper.style.display = "block";
      wrapper.style.visibility = "visible";
    }

    function updatePosition() {
      const { minX, maxX, groundY } = bounds();
      x += vx * direction;

      if (x >= maxX) {
        x = maxX;
        direction = -1;
      } else if (x <= minX) {
        x = minX;
        direction = 1;
      }

      if (isJumping) {
        y += vy;
        vy += 0.45;
        if (y >= groundY) {
          y = groundY;
          vy = 0;
          isJumping = false;
        }
      } else {
        y = groundY;
      }

      row = isJumping ? ROW_JUMP : direction > 0 ? ROW_WALK_RIGHT : ROW_WALK_LEFT;
      setWrapperPosition();
    }

    function maybeChangeBehavior(now) {
      if (now < pauseUntil || now - lastBehaviorChange < 3000) return;
      lastBehaviorChange = now;
      const r = Math.random();

      if (r < 0.2 && !isJumping) {
        isJumping = true;
        vy = -8;
        row = ROW_JUMP;
      } else if (r < 0.4) {
        row = ROW_BOW;
        pauseUntil = now + 1200;
      } else if (r < 0.6) {
        row = ROW_IDLE;
        pauseUntil = now + 1200;
      } else {
        direction *= -1;
      }
    }

    function drawSprite() {
      ctx.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE);
      ctx.drawImage(
        sprite,
        frame * FRAME_SIZE,
        row * FRAME_SIZE,
        FRAME_SIZE,
        FRAME_SIZE,
        0,
        0,
        FRAME_SIZE,
        FRAME_SIZE
      );
    }

    function animate(timestamp) {
      if (!lastFrameTime) lastFrameTime = timestamp;
      if (timestamp - lastFrameTime > 120) {
        frame = (frame + 1) % COLS;
        lastFrameTime = timestamp;
      }

      const now = Date.now();
      maybeChangeBehavior(now);
      if (now >= pauseUntil || isJumping) updatePosition();
      drawSprite();
      requestAnimationFrame(animate);
    }

    sprite.onload = () => {
      const { groundY } = bounds();
      x = Math.floor((window.innerWidth - FRAME_SIZE) / 2);
      y = groundY;
      setWrapperPosition();
      drawSprite();
      requestAnimationFrame(animate);
    };

    sprite.onerror = () => {
      console.error("ブタミン画像を読み込めませんでした:", SPRITE_URL);
    };

    window.addEventListener("resize", () => {
      const { minX, maxX, groundY } = bounds();
      x = Math.min(Math.max(x, minX), maxX);
      y = groundY;
      setWrapperPosition();
    });

    sprite.src = SPRITE_URL;
  }

  function init() {
    document.querySelectorAll("[data-butamin-app]").forEach(initializeButamin);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
