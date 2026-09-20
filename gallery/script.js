(function () {
  "use strict";

  const IMAGES = [
    "218717_1007375036_214large.jpg",
    "218717_1007375048_31large.jpg",
    "218717_1008773116_59large.jpg",
    "218717_1010141439_134large.jpg",
    "218717_979909950_191large.jpg",
    "218717_979909956_119large.jpg",
    "218717_979909959_128large.jpg",
    "218717_979958428_160large.jpg",
    "218717_981153661_213large.jpg",
    "218717_981153663_181large.jpg",
    "218717_988483621_29large.jpg",
    "218717_988483623_73large.jpg",
    "218717_988990795_24large.jpg",
    "218717_988990797_38large.jpg",
    "218717_989129975_3large.jpg",
    "218717_989129980_210large.jpg",
    "218717_989129983_28large.jpg",
    "218717_989130003_54large.jpg",
    "218717_989130033_182large.jpg",
    "218717_989130041_82large.jpg",
    "627c157c.jpg",
    "c1fd15f2.jpg",
  ];

  const grid = document.getElementById("galleryGrid");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCount = document.getElementById("lightboxCount");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");

  let currentIndex = 0;

  IMAGES.forEach((filename, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "gallery-item";
    btn.setAttribute("aria-label", `資料 ${i + 1}`);
    const img = document.createElement("img");
    img.src = `../pic/${filename}`;
    img.loading = "lazy";
    img.alt = `資料 ${i + 1}`;
    btn.appendChild(img);
    btn.addEventListener("click", () => openLightbox(i));
    grid.appendChild(btn);
  });

  function openLightbox(index) {
    currentIndex = index;
    updateLightbox();
    lightbox.hidden = false;
  }

  function updateLightbox() {
    lightboxImg.src = `../pic/${IMAGES[currentIndex]}`;
    lightboxImg.alt = `資料 ${currentIndex + 1}`;
    lightboxCount.textContent = `${currentIndex + 1} / ${IMAGES.length}`;
  }

  function closeLightbox() {
    lightbox.hidden = true;
  }

  function showPrev() {
    currentIndex = (currentIndex - 1 + IMAGES.length) % IMAGES.length;
    updateLightbox();
  }

  function showNext() {
    currentIndex = (currentIndex + 1) % IMAGES.length;
    updateLightbox();
  }

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxPrev.addEventListener("click", showPrev);
  lightboxNext.addEventListener("click", showNext);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  window.addEventListener("keydown", (e) => {
    if (lightbox.hidden) return;
    if (e.code === "Escape") closeLightbox();
    else if (e.code === "ArrowLeft") showPrev();
    else if (e.code === "ArrowRight") showNext();
  });
})();
