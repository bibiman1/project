(function () {
  "use strict";

  const SPRITE_URL = "./assets/yusha_sprite_sheet.png";
  const FRAME_SIZE = 128;
  const COLS = 8;
  const ROW_IDLE = 0;
  const ROW_WALK_RIGHT = 1;
  const ROW_WALK_LEFT = 2;
  const FRAME_INTERVAL = 150;
  const MOVE_SPEED = 0.7;
  const SIDE_MARGIN = 24;

  function initCharacter() {
    const canvas = document.getElementById("characterCanvas");
    const wrapper = document.querySelector(".character-module");
    if (!canvas || !wrapper || canvas.dataset.initialized === "true") return;

    canvas.dataset.initialized = "true";
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sprite = new Image();
    let frame = 0;
    let row = ROW_IDLE;
    let direction = -1;
    let x = Math.max(SIDE_MARGIN, window.innerWidth - FRAME_SIZE - SIDE_MARGIN);
    let lastFrameTime = 0;
    let lastTimestamp = 0;
    let behaviorUntil = performance.now() + 1500;

    function maxX() {
      return Math.max(SIDE_MARGIN, window.innerWidth - FRAME_SIZE - SIDE_MARGIN);
    }

    function setPosition() {
      wrapper.style.left = x + "px";
      wrapper.style.right = "auto";
    }

    function draw() {
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
      if (!lastTimestamp) lastTimestamp = timestamp;
      const delta = Math.min(32, timestamp - lastTimestamp);
      lastTimestamp = timestamp;

      if (timestamp >= behaviorUntil) {
        if (row === ROW_IDLE) {
          row = direction > 0 ? ROW_WALK_RIGHT : ROW_WALK_LEFT;
          behaviorUntil = timestamp + 3500;
        } else {
          row = ROW_IDLE;
          behaviorUntil = timestamp + 1400;
        }
      }

      if (row !== ROW_IDLE) {
        x += direction * MOVE_SPEED * (delta / 16.67);
        if (x <= SIDE_MARGIN) {
          x = SIDE_MARGIN;
          direction = 1;
          row = ROW_WALK_RIGHT;
        } else if (x >= maxX()) {
          x = maxX();
          direction = -1;
          row = ROW_WALK_LEFT;
        }
      }

      if (!lastFrameTime || timestamp - lastFrameTime >= FRAME_INTERVAL) {
        frame = (frame + 1) % COLS;
        lastFrameTime = timestamp;
      }

      setPosition();
      draw();
      requestAnimationFrame(animate);
    }

    sprite.onload = function () {
      setPosition();
      draw();
      requestAnimationFrame(animate);
    };

    sprite.onerror = function () {
      console.error("画像を読み込めませんでした:", SPRITE_URL);
    };

    window.addEventListener("resize", function () {
      x = Math.min(Math.max(x, SIDE_MARGIN), maxX());
      setPosition();
    });

    sprite.src = SPRITE_URL;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCharacter);
  } else {
    initCharacter();
  }
})();
