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

