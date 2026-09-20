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

  const ESSAY_INTRO = [
    "以下は、『ぼぎだぢ』の設定資料(あらすじ・用語集・断片の見取り図)を一次資料として、二人の架空の解説者に読ませたものである。一人は比較文化学者(民俗学寄りの、翻訳者の語注に近い書き方をする)。もう一人は理論物理学者。同じ語彙―「ぼぎ」「ちゃん」「ださいおさむん」「超現実爆弾」「チェレンコフ光」―を、まったく別の道具立てで読み解く。",
    "二人の読みは競合しない。むしろ、この作品の語彙が最初から二重の読みに開かれていることを示している。器物が意志を持つという話は、片方の耳では神話の文法で、もう片方の耳では観測問題の比喩で鳴る。どちらか一方が「正解」なのではなく、両方が同時に成立するように語彙が選ばれている、というのがこの解説の立場である。",
  ];

  const ESSAY_SECTIONS = [
    {
      title: "比較文化学者の読み ― 付喪神の倒置",
      blocks: [
        {
          h: "日付けされない付喪神",
          p: "日本の民俗には、器物が百年を経て魂を宿すという「付喪神」の伝承がある。長く人に使われたものが、人の手を離れてもものを言うようになる。ところが『ぼぎだぢ』の世界はこの因果を逆転させている。人間(「ちゃん」)が使い込んだ末に魂を宿らせたのではなく、人間が去ったあとの時代―本文の言う「アフターマンエイジ」―に、器物たちは最初から役割を与えられずに存在している。付喪神が「使い戻されなくなった道具の後日談」だとすれば、ぼぎは「使い手が最初からいない道具の現在進行形」である。この順序の入れ替えは、作品全体の時間感覚を決めている。",
        },
        {
          h: "個体差というアニミズムの粒度",
          p: "鉄瓶は「怒れる」、マトリョーシカは「交戦的」、おばけは器物ではなく「認識のされ方」そのもの――ここには単一のアニミズムではなく、精霊の分類学がある。比較宗教学が精霊や妖怪を発生源・気性・関係性で類型化するのと同じ手つきで、この世界の器物たちも器物性の強弱によって並んでいる。",
        },
        {
          h: "目的を失った乗り物たち",
          p: "ぼぎカーは光速度と慣性に縛られず、車箪笥はガソリンがなくても走る。乗り物の数が異様に多いという資料内の自己言及(「移動そのものが目的から外れている」)は、比較民俗学的には「彷徨う乗り物」のモチーフ――さまよえるオランダ人の幽霊船、行き先のない永遠の巡礼――に近い。到達点のない移動は、目的地よりも移動という状態そのものが存在理由になっている乗り物群を生む。",
        },
        {
          h: "失われたことばと存続することば",
          p: "「ださいおさむん」は失われた言葉として、「リンガボガー」は今も使われる儀式言語として並置される。これは、特定の共同体だけに通じる私的な言語(双子語、あるいはカーゴカルトが外部文明との接触を儀式化して保存することば)の構造に似ている。意味を失った断片が神託の言葉として保存される一方、実用の言語は生きて更新され続ける――両者の対比が、この世界の「宗教」の輪郭を描いている。",
        },
        {
          h: "不在の神",
          p: "「ちゃん」はほとんど登場せず、看板や仕組み、置き去りにされたことばとしてのみ痕跡を残す。これは比較宗教学が「デウス・オティオースス」(隠遁した創造神)と呼ぶ構造そのものである。世界を作った、あるいは去っていった存在は不在であることによってかえって信仰の中心になる。「きー」が生涯かけて「ださいおさむん」という一語を探し求め、やがて目的からも衝動からも解放されて「あるがままを感じる」に至り、最後には「時空検閲官」として「ちゃん」のいる世界を再建する――この弧は、悟りを得たのちに衆生救済のためにこの世へ戻る菩薩の誓願と同型である。探し物は、探すことをやめたときに初めて意味を変える。",
        },
      ],
    },
    {
      title: "理論物理学者の読み ― 用語を真面目に受けとる",
      blocks: [
        {
          h: "超現実爆弾と偽真空崩壊",
          p: "「時空連続体の泡として投下された超現実爆弾は、事象の蓋然性を攪乱する」——この一文を式に起こすなら、場の量子論で言う「偽真空崩壊(false vacuum decay)」に一番近い。真空は安定ではなく準安定な局所極小にすぎず、量子トンネリングで真の真空の泡が核生成すると、その内側では物理定数さえ別の値をとりうる。「事象の蓋然性を攪乱する」とは、確率の前提そのものが内側で書き換わった、と読むのが一番腑に落ちる。以降の世界は、その新しい泡の内側——物理定数が少しずつ違う場所——として読める。",
        },
        {
          h: "チェレンコフ光と誤訳された光速",
          p: "「青い光漁」の別名が「チェレンコフ光」であることは、この資料中で最も物理的に正確な一文だ。チェレンコフ光とは、荷電粒子が媒質(水や発電炉の冷却水など)中を「その媒質中での光速」より速く進むときに発する青白い発光で、真空中の光速を超えるわけではない。実際には原子炉のプールが青く光る現象として一般に知られている。つまりこの一文——「ぼぎが炉心内部の燃料ペレットをもて遊び、海に投げ込んだ」——は、選ばれた語の水準から見ると、子供の遊びの表現をした臨界事故(メルトダウン)の報告でもある。戯れと危険の距離がこの一行だけでなくなる。",
        },
        {
          h: "慣性からの自由",
          p: "「ぼぎカーは光速度と慣性に制限を受けない」——特殊相対性理論とニュートン力学の両方を一行で破棄する宣言である。慣性とは物体が時空の座標系に対して持つ性質のことだが、それがないということは、この乗り物が定義上、物理的な意味では「移動していない」ことを意味する。まばたきの度に座標が書き換わると言った方が正確かもしれない。物語内の乗り物は、物理法則に従う乗り物ではなく、物理法則の外側からレンダリングされている存在——作中人物の目には「走っている」としか見えない、と読むことができる。",
        },
        {
          h: "観測されるまで何もない空間",
          p: "懲罰空間(この書庫のある場所)を直接歩けば、この奇妙さは一層明確になる。何もない平面を歩き、何かに一定距離以内に近づくまでそれは「存在しない」ように見える。これは比喩ではなく、量子力学の測定問題(観測するまで状態が確定しない)をゲームメカニクスのレベルで文字通り実装したものだとも言える。この空間は「何もない」のではなく、「視線が届くまで確定しない」。",
        },
        {
          h: "月の裏側という実在の物理",
          p: "本題とは別に、一つ実際の天体物理を確認しておきたい。月は地球に対して自転周期と公転周期が一致する「潮汐固定(tidal locking)」の状態にあり、その結果、月の裏側は地球から永遠に直接観測できない。人類が月の裏側を初めて目にしたのは1959年のルナ3号の探査機以降である。つまり「永遠に見えない場所」とは、フィクションではなく天文学上実在するカテゴリーである——この事実だけをここでは記しておく。",
        },
      ],
    },
  ];

  const ESSAY_SYNTHESIS = {
    title: "結び ― 二つの視線が交わる場所",
    warning: "⚠️ ここから先は「懲罰空間」の物語の結末に直接触れる内容です。",
    paragraphs: [
      "比較文化学者の読みは「不在の神」で終わった。理論物理学者の読みは「永遠に直接観測できない場所」(月の裏側)で終わった。この二つは、実は同じ一点を指している。",
      "設定上、懲罰空間の正体は月の裏側にある「ださいおさむん」そのものであり、人間(「ちゃん」)が最後に言い残した場所である。つまりこのゲームのフィールドとは、字面通りに「人類が永遠に見られない場所」の中に、その人類の最後の言葉だけが置かれている、という構造だ。民俗学の「不在の神」と、天体力学の「永遠の裏面」が、ここで一致する。",
      "さらに重要なのは、プレイヤーキャラクター(ぼぎだぢ)が、探している「ださいおさむん」の中に最初からいた、という点だ。ゲーム開始時点からすでに、探し求めていた場所の中を歩き回っていた。この一点に、二つの学問の語彙がそれぞれ別の名前を与えている。",
    ],
    list: [
      ["比較宗教学の名前", "「探し物は、探すことをやめたときに初めて意味を変える」——禅の問答や「衆生はすでに仏性を備えている」という本覚思想の構造と同型。探求の終わりは発見ではなく想起である。"],
      ["理論物理学の名前", "系を外部から測定する特権的な観測者は存在しない。量子重力の思想実験でも一般相対性理論でも、観測者は常に系の内側にいる。ゲームの主人公は、対象を外側から探しに行く主体ではなく、最初から系の一部である。"],
    ],
    closing: "開示の瞬間に必要なのは新しい情報ではなく、「あなたは最初からここにいた」という見方の変更だけなのかもしれない。日常の雑多を集めた玩具箱のような体裁をまとったまま、この作品は内側と外側、探索と内在という、かなり古い哲学的問題を、静かに仕掛けている。",
  };

  const grid = document.getElementById("galleryGrid");
  const glossaryPanel = document.getElementById("glossaryPanel");
  const essayPanel = document.getElementById("essayPanel");
  const tabImages = document.getElementById("tabImages");
  const tabGlossary = document.getElementById("tabGlossary");
  const tabEssay = document.getElementById("tabEssay");
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

  ESSAY_INTRO.forEach((text) => {
    const p = document.createElement("p");
    p.className = "essay-intro";
    p.textContent = text;
    essayPanel.appendChild(p);
  });

  ESSAY_SECTIONS.forEach((section) => {
    const sectionEl = document.createElement("section");
    sectionEl.className = "essay-section";
    const h2 = document.createElement("h2");
    h2.textContent = section.title;
    sectionEl.appendChild(h2);
    section.blocks.forEach((block) => {
      const h3 = document.createElement("h3");
      h3.textContent = block.h;
      const p = document.createElement("p");
      p.textContent = block.p;
      sectionEl.appendChild(h3);
      sectionEl.appendChild(p);
    });
    essayPanel.appendChild(sectionEl);
  });

  const synthesisEl = document.createElement("section");
  synthesisEl.className = "essay-section";
  const synthesisH2 = document.createElement("h2");
  synthesisH2.textContent = ESSAY_SYNTHESIS.title;
  synthesisEl.appendChild(synthesisH2);

  const warningEl = document.createElement("p");
  warningEl.className = "essay-warning";
  warningEl.textContent = ESSAY_SYNTHESIS.warning;
  synthesisEl.appendChild(warningEl);

  ESSAY_SYNTHESIS.paragraphs.forEach((text) => {
    const p = document.createElement("p");
    p.textContent = text;
    synthesisEl.appendChild(p);
  });

  const synthesisList = document.createElement("ul");
  ESSAY_SYNTHESIS.list.forEach(([term, def]) => {
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = term;
    li.appendChild(strong);
    li.appendChild(document.createTextNode(`: ${def}`));
    synthesisList.appendChild(li);
  });
  synthesisEl.appendChild(synthesisList);

  const closingEl = document.createElement("p");
  closingEl.textContent = ESSAY_SYNTHESIS.closing;
  synthesisEl.appendChild(closingEl);

  essayPanel.appendChild(synthesisEl);

  function showImages() {
    grid.hidden = false;
    glossaryPanel.hidden = true;
    essayPanel.hidden = true;
    tabImages.classList.add("active");
    tabGlossary.classList.remove("active");
    tabEssay.classList.remove("active");
  }

  function showGlossary() {
    grid.hidden = true;
    glossaryPanel.hidden = false;
    essayPanel.hidden = true;
    tabImages.classList.remove("active");
    tabGlossary.classList.add("active");
    tabEssay.classList.remove("active");
  }

  function showEssay() {
    grid.hidden = true;
    glossaryPanel.hidden = true;
    essayPanel.hidden = false;
    tabImages.classList.remove("active");
    tabGlossary.classList.remove("active");
    tabEssay.classList.add("active");
  }

  tabImages.addEventListener("click", showImages);
  tabGlossary.addEventListener("click", showGlossary);
  tabEssay.addEventListener("click", showEssay);

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
