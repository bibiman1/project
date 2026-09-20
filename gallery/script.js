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

  const GLOSSARY_INTRO =
    "偶然と手違いが積み重なり、時空連続体の泡として投下された超現実爆弾は、事象の蓋然性を攪乱する。\n" +
    "やがて世界は静まり、人が遠くに去ったあとの時代。\n" +
    "自助努力と交雑した民芸品や玩具達が、囁いたり、徘徊したりする物語。";

  const GLOSSARY_SECTIONS = [
    {
      title: "用語",
      terms: [
        ["ぼぎ", "①人が遠くに去ったあとの時代(アフターマンエイジ)を徘徊する、主に動物を模した器物。②「ちゃん」と一次接触した古いぼぎ。"],
        ["ぼぎだぢ", "ぼぎを含む、器物の総称。"],
        ["ちゃん", "人間。"],
        ["ださいおさむん", "ちゃんが「きー」に言い残した言葉。"],
        ["ぼぎカー", "「きー」の車。ナイロンの戸板用ベアリングをタイヤに持つ。柿渋が塗られており臭い。ぼぎカーは光速度と慣性に制限を受けない。"],
        ["とりぼぎかー", "アヒルの頭がついた木製の手押し車型ぼぎだぢ。丸いタライ状の荷台に卵型の乗客(白い卵も混ざる)を乗せている。柿渋染めの木目調。"],
        ["車箪笥", "「みとん」の家であり乗物。ヘミV8スーパーチャージャーをスワップされている。燃費が悪いが、ガソリンがなくてもみとんが望めば走行する。"],
        ["鉄瓶", "ぼぎだぢ。怒れる南部鉄器。"],
        ["おばけ", "形而アップダウンクイズの過程で露出した物自体が、ぼぎに認識された姿。ぼぎとは仲が良い。"],
        ["マトリョーシカ", "ぼぎだぢ。交戦的。"],
        ["リンガボガー (Lingua boga)", "ぼぎだちとのコミュニケーションに使われる言葉、ゼスチャー、儀式。"],
        ["きー", "最古のぼぎ。「ちゃん」と別れ、生老病死と万物流転の意味を理解するが、忘失。ただ一つ記憶している「ださいおさむん」を探しながら世界を徘徊するが、やがて、目的からも衝動からも解放され、あるがままを感じる事に勤めだす。遥か後に時空検閲官となり、「ちゃん」のいる世界を再建する。"],
        ["ぴー", "最古のぼぎ。きーの邪魔をすることに執着する。別名、悪魔。"],
        ["ルチ将軍", "知能指数1300の人形。まだドロドロして形をなしていなかった、きーの心に植えつけられたトラウマ。"],
        ["鈴木商店", "荒川区にある宇宙船殻用単結晶の製造販売卸元。超現実爆弾が招いた、現実には存在しない会社の看板。"],
        ["南極", "気候も日照も意味を問われなくなったので、やる気のある植物が繁茂している。「きこり」「ちりん」がマンゴーの実を食べに頻繁に訪れる。"],
        ["きこり", "最古のぼぎ。リモコンの豚。動きが素早く、気まぐれ。"],
        ["ちりん", "最古のぼぎ。割れた所を漆で金継ぎされた風鈴。きこりに執着する。"],
        ["ききこり", "最古のぼぎ。電動の豚。自分の大きさに執着する。"],
        ["ごろん", "最古のぼぎ。ピギーバンク。"],
        ["凍った湖と富士山", "きーが見た風景。"],
        ["ほうとう", "きーが凍った湖と富士山をみたあとに食べた食事。"],
        ["呪いの野犬", "フリーウェイにのさばる荒くれぼぎだぢのチーム名"],
        ["アリ・カカウロ", "魔法のロバの口と尻の穴から砂金を吐き出させる呪文。"],
        ["ミイラさま", "霞ヶ浦に停泊する戦闘エクラノプランのコックピットに座っている死体。ぼぎを乗せて、遊覧飛行をしてくれる。"],
        ["エクラノプラン", "船と飛行機の中間の乗物。"],
        ["青い光漁(チェレンコフ光)", "ぼぎが炉心内部の燃料ペレットをもて遊び、海に投げ込んだ事件。"],
      ],
    },
    {
      title: "追記",
      terms: [
        ["なつうらをこへたるでうす", "→ でうす"],
        ["でうす", "→ だいにち"],
        ["だいにち", "ばーでれがぼぎをおびき寄せるために見せる紙芝居の主人公"],
        ["ぱーでれ", "ぼぎを捕まえる機械。ぱーでれに連れ去られたぼぎは戻ってこない。"],
        ["首振りエンジン", "宝舟の主機関。ぼぎが青銅で鋳造する。"],
        ["宝舟", "未踏海域を調査するためにぼぎが片手間でつくった木造船。"],
        ["インターネット", "調べものが捗る仕組み"],
        ["まろうど", "アフターマンエイジのさざ波。実体化した三人称。"],
        ["バナナ農園", "ぼぎのテレビ企画。いわゆるダッシュ村的なやつ。"],
        ["ぼぎボマー", "古い命令に従い未だに爆装して飛び立つ無人機。どこかに爆弾を投棄して、基地に戻ってくる。"],
        ["地上ぼぎクルー", "古い命令に従い未だにぼぎボマーを整備している笹野一刀彫。"],
        ["爆弾", "ガチの爆弾。大変危ない"],
      ],
    },
    {
      title: "断片の見取り図(最古のぼぎたち)",
      terms: [["きー・ぴー・きこり・ちりん・ききこり・ごろん・ルチ将軍", "きーとぴーが中心軸で、きこり・ちりん・ききこり・ごろんはもう少し牧歌的な一群に見える。ルチ将軍だけ「トラウマ」という内面的な存在で、他の最古のぼぎとは少し種類が違う。"]],
    },
    {
      title: "断片の見取り図(器物としてのぼぎだぢ)",
      terms: [["ぼぎ・ぼぎだぢ・鉄瓶・マトリョーシカ・おばけ", "「怒れる」「交戦的」など、気性の強さが目立つ。おばけだけは「認識のされ方」の話で、モノというより現象に近い。"]],
    },
    {
      title: "断片の見取り図(乗り物)",
      terms: [["ぼぎカー・車箪笥・エクラノプラン(とミイラさま)・宝舟・首振りエンジン・ぼぎボマー", "乗り物がやたら多い。しかもどれも一癖ある(光速に縛られない、ガソリンがいらない、片手間で作られた、古い命令のまま飛び続ける)。「移動そのものが目的から外れている」感じがある。"]],
    },
    {
      title: "断片の見取り図(土地・風景)",
      terms: [["南極・凍った湖と富士山・ほうとう・鈴木商店・霞ヶ浦", "どれも「本来そこにあるはずがないもの」がある場所(南極の植物、実在しない看板の商店)。"]],
    },
    {
      title: "断片の見取り図(ことば・儀式)",
      terms: [["ださいおさむん・リンガボガー・アリ・カカウロ", "失われた言葉(ださいおさむん)と、今も使われている言葉(リンガボガー)の対比がある。"]],
    },
    {
      title: "断片の見取り図(対立・脅威)",
      terms: [["呪いの野犬・だいにち/でうす/ぱーでれ・爆弾・地上ぼぎクルー", "「呪いの野犬」は荒くれもの同士の対立、「ぱーでれ」は外からの捕獲装置、「爆弾」はただ純粋に危険なもの――脅威にもいくつか温度差がある。"]],
    },
    {
      title: "断片の見取り図(出来事)",
      terms: [["青い光漁・バナナ農園・インターネット・まろうど", "事件と呼べるほど大きいもの(青い光漁)から、日常の道具(インターネット)まで、スケールがばらばらのまま並んでいる。"]],
    },
    {
      title: "断片の見取り図(ちゃんの気配)",
      terms: [["ちゃん・ださいおさむん・鈴木商店・インターネット", "ちゃん自体はほとんど登場せず、言葉や看板や仕組みといった「痕跡」としてだけ世界に残っている。"]],
    },
  ];

  const grid = document.getElementById("galleryGrid");
  const glossaryPanel = document.getElementById("glossaryPanel");
  const tabImages = document.getElementById("tabImages");
  const tabGlossary = document.getElementById("tabGlossary");
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

  const introEl = document.createElement("p");
  introEl.className = "glossary-intro";
  introEl.textContent = GLOSSARY_INTRO;
  glossaryPanel.appendChild(introEl);

  GLOSSARY_SECTIONS.forEach((section) => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "glossary-section";
    const h2 = document.createElement("h2");
    h2.textContent = section.title;
    sectionEl.appendChild(h2);

    const list = document.createElement("dl");
    list.className = "glossary-list";
    section.terms.forEach(([term, def]) => {
      const item = document.createElement("div");
      item.className = "glossary-term";
      const dt = document.createElement("dt");
      dt.textContent = term;
      const dd = document.createElement("dd");
      dd.textContent = def;
      item.appendChild(dt);
      item.appendChild(dd);
      list.appendChild(item);
    });
    sectionEl.appendChild(list);
    glossaryPanel.appendChild(sectionEl);
  });

  function showImages() {
    grid.hidden = false;
    glossaryPanel.hidden = true;
    tabImages.classList.add("active");
    tabGlossary.classList.remove("active");
  }

  function showGlossary() {
    grid.hidden = true;
    glossaryPanel.hidden = false;
    tabImages.classList.remove("active");
    tabGlossary.classList.add("active");
  }

  tabImages.addEventListener("click", showImages);
  tabGlossary.addEventListener("click", showGlossary);

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
