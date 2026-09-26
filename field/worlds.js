// 断片世界の定義。1つの断片 = 1つの世界。1つの世界は複数のマップを持つ。
// 言葉は少なく。きーは意味のわからない固有名詞をつぶやくだけで、意味は絵と体験で少しずつ伝える。
// ぼぎだぢは流ちょうに話さない。短く、口が悪い。
(function () {
  "use strict";

  const T = 32;

  // PixelLab の Wang タイルセット(16枚)。キーは角 NW NE SW SE (1 = 上の地形)
  const WANG16 = {"1101":[[0,0]],"1010":[[1,0]],"0100":[[2,0]],"1100":[[3,0]],"0110":[[0,1]],"1000":[[1,1]],"0000":[[2,1]],"0001":[[3,1]],"1011":[[0,2]],"0011":[[1,2]],"0010":[[2,2]],"0101":[[3,2]],"1111":[[0,3]],"1110":[[1,3]],"1001":[[2,3]],"0111":[[3,3]]};

  // 画像の中身の下端(bottom)と上端(top)から、足もと(fx, fy)に置く
  const SPRITES = {
    pine: { img: "s_pine", w: 64, h: 96, top: 5, bottom: 88, solid: [14, 8] },
    bare: { img: "s_pine2", w: 64, h: 96, top: 17, bottom: 77, solid: [12, 8] },
    car: { img: "s_car", w: 96, h: 64, top: 10, bottom: 57, solid: [64, 22] },
    houtou: { img: "s_houtou", w: 160, h: 128, top: 10, bottom: 118, solid: [118, 44] },
    tires: { img: "s_tires", w: 64, h: 48, top: 8, bottom: 40, solid: [44, 12] },
    irori: { img: "k_irori", w: 96, h: 96, top: 7, bottom: 90, solid: [66, 40] },
    sign: { img: "s_sign", w: 32, h: 64, top: 2, bottom: 62, solid: [8, 6] },
    shard: { img: "s_shard", w: 32, h: 32, top: 4, bottom: 26 },
    kamado: { img: "k_kamado", w: 128, h: 64, top: 4, bottom: 60, solid: [72, 26] },
    post: { img: "k_post", w: 32, h: 64, top: 3, bottom: 60, solid: [16, 8] },
    tansu: { img: "k_tansu", w: 64, h: 64, top: 8, bottom: 57, solid: [50, 20] },
    chabudai: { img: "k_table", w: 96, h: 64, top: 6, bottom: 58, solid: [60, 22] },
    zabuton: { img: "k_zabuton", w: 32, h: 32, top: 6, bottom: 27 },
    zabutonS: { img: "k_zabuton_s", w: 32, h: 32, top: 7, bottom: 25 },
    radio: { img: "i_radio", w: 32, h: 32, top: 5, bottom: 27 },
  };

  function at(kind, fx, fy, extra) {
    const s = SPRITES[kind];
    const o = {
      img: s.img,
      w: s.w,
      h: s.h,
      x: fx,
      y: fy - (s.bottom - s.h / 2),
      sortDy: s.bottom - s.h / 2,
      headY: s.h / 2 - s.top,
    };
    if (s.solid) o.solid = { w: s.solid[0], h: s.solid[1], dy: o.sortDy - s.solid[1] / 2 };
    return Object.assign(o, extra || {});
  }

  // 決まった並びの疑似乱数(毎回同じ森になる)
  function rand(r, c, k) {
    const x = Math.sin(r * 127.1 + c * 311.7 + k * 74.7) * 43758.5453;
    return x - Math.floor(x);
  }

  // ---- 峠道: 曲がりくねった道を北へのぼると、富士山が見えてくる ----
  const ROAD_COLS = 15;
  const ROAD_ROWS = 60;
  // 道が通る点(行, 列)。この点をなめらかな曲線(Catmull-Rom)でつなぐ
  const ROAD_POINTS = [[61, 7], [55, 7], [50, 5.5], [46, 3.5], [42, 4], [39, 7], [36, 10.5], [32, 11], [28, 9], [25, 5], [21, 3.5], [17, 5], [14, 8.5], [11.5, 11], [10.5, 13], [10.5, 16]];
  const ROAD_WIDTH = 1.5; // 中心線から道の端まで(マス)

  function catmullRom(points, step) {
    const out = [];
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(points.length - 1, i + 2)];
      for (let t = 0; t < 1; t += step) {
        const t2 = t * t;
        const t3 = t2 * t;
        const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
        out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
      }
    }
    out.push(points[points.length - 1]);
    return out;
  }

  const ROAD_CURVE = catmullRom(ROAD_POINTS, 0.05);

  function roadGrid() {
    const g = [];
    for (let r = 0; r < ROAD_ROWS; r++) g.push(Array(ROAD_COLS).fill(r < 8 ? "#" : "."));
    for (let r = 8; r < ROAD_ROWS; r++) {
      for (let c = 0; c < ROAD_COLS; c++) {
        if (ROAD_CURVE.some(([pr, pc]) => Math.hypot(pr - r, pc - c) <= ROAD_WIDTH)) g[r][c] = "=";
      }
    }
    return g.map((row) => row.join(""));
  }

  // センターライン: 道の中心を点線でなぞる
  function centerLine(ctx, ox, oy, points) {
    ctx.fillStyle = "#e7c34a";
    const DASH = 10;
    const GAP = 8;
    let run = 0;
    for (let i = 0; i < points.length - 1; i++) {
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      const len = Math.hypot(x1 - x0, y1 - y0);
      for (let d = 0; d < len; d += 2) {
        if ((run + d) % (DASH + GAP) < DASH) {
          const x = Math.round(x0 + ((x1 - x0) * d) / len + ox);
          const y = Math.round(y0 + ((y1 - y0) * d) / len + oy);
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }
      }
      run += len;
    }
  }

  // 曲がった道: 曲線を太い線で2回なぞる(外側が雪の土手、内側が道)。
  // マス目のタイルだと縁が階段になるので、道だけは線で描く。
  function drawRoadVector(ctx, ox, oy, tileImg, cache) {
    if (!cache.pattern) {
      const tex = document.createElement("canvas");
      tex.width = T;
      tex.height = T;
      tex.getContext("2d").drawImage(tileImg, 2 * T, 1 * T, T, T, 0, 0, T, T);
      cache.pattern = ctx.createPattern(tex, "repeat");
    }
    ctx.save();
    ctx.translate(ox, oy);
    ctx.beginPath();
    ROAD_CURVE.forEach(([r, c], i) => {
      const x = (c + 0.5) * T;
      const y = Math.max(8 * T, (r + 0.5) * T);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineCap = "butt";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#c4dae6";
    ctx.lineWidth = 96;
    ctx.stroke();
    ctx.strokeStyle = cache.pattern;
    ctx.lineWidth = 88;
    ctx.stroke();
    ctx.restore();
  }

  function nearRoad(grid, r, c, d) {
    for (let dr = -d; dr <= d; dr++)
      for (let dc = -d; dc <= d; dc++) {
        const rr = r + dr;
        const cc = c + dc;
        if (rr >= 0 && rr < grid.length && cc >= 0 && cc < grid[0].length && grid[rr][cc] === "=") return true;
      }
    return false;
  }

  // 森: 道から離れた雪の上に木を立てる。keep に入る場所には立てない
  function forest(grid, fromRow, keep) {
    const trees = [];
    for (let r = fromRow; r < grid.length; r++) {
      for (let c = 0; c < grid[0].length; c++) {
        if (grid[r][c] !== ".") continue;
        if (nearRoad(grid, r, c, 1)) continue;
        if (keep.some(([r0, c0, r1, c1]) => r >= r0 && r <= r1 && c >= c0 && c <= c1)) continue;
        const edge = c === 0 || c === grid[0].length - 1;
        const p = rand(r, c, 1);
        if (!edge && p > 0.55) continue;
        const kind = rand(r, c, 2) < 0.8 ? "pine" : "bare";
        trees.push(at(kind, (c + 0.5) * T + (rand(r, c, 3) - 0.5) * 12, (r + 1) * T - 2));
      }
    }
    return trees;
  }

  const roadMapGrid = roadGrid();

  const ROAD = {
    tile: T,
    bg: "#eef2f6",
    snow: true,
    map: roadMapGrid,
    legend: {
      "#": { solid: true, none: true },
      ".": { wang: "road" },
      "=": { wang: "road" }, // 道そのものは drawGround で描く
    },
    wang: { road: { img: "wang_road", size: 32, lookup: WANG16 } },
    backdrop: { img: "fuji", x: 0, y: 16, scale: 2 },
    drawGround(ctx, ox, oy, img) {
      if (typeof img !== "function") return; // 古い rpg.js と混ざったとき(キャッシュ)に止まらないように
      const tile = img("wang_road");
      if (!tile) return;
      drawRoadVector(ctx, ox, oy, tile, this);
      centerLine(ctx, ox, oy, ROAD_CURVE.filter(([r]) => r > 8).map(([r, c]) => [(c + 0.5) * T, (r + 0.5) * T]));
    },
    spawns: {
      start: { x: 7.5 * T, y: 58.5 * T, facing: "north" },
      pass: { x: 13.2 * T, y: 10.6 * T, facing: "west" },
    },
    triggers: [
      // 峠: 森が切れて、富士山が見えてくる
      {
        id: "vista",
        once: true,
        x: 0,
        y: 12 * T,
        w: ROAD_COLS * T,
        h: T,
        run(api) {
          api.pan(0, 2200);
        },
      },
      { id: "toLake", x: 14.3 * T, y: 8 * T, w: T, h: 4 * T, warp: { map: "lake", spawn: "west" } },
    ],
    objects: [
      // カーブの外側の標識(道の上に来るものは置かない)
      ...[[48.9, 1.5], [37.9, 13.4], [26.9, 8.6], [19.9, 1.3], [13.9, 12.4]]
        .filter(([r, c]) => roadMapGrid[Math.floor(r)][Math.floor(c)] === ".")
        .map(([r, c]) => at("sign", c * T, r * T)),
      at("tires", 7 * T, 45.5 * T),
      Object.assign(
        {
          id: "pi",
          anim: { img: "pi", cell: 64, row: 3, frames: 1, fps: 1 },
          w: 64,
          h: 64,
          x: 8.6 * T,
          y: 45.3 * T - 15,
          sortDy: 15,
          headY: 14,
          solid: { w: 18, h: 8, dy: 9 },
          range: 36,
          nearRange: 56,
          near(api) {
            api.bubble("pi", "どけ");
          },
          interact(api) {
            api.bubble("pi", "古タイヤをみつけたらおしえろ", 3600);
          },
        },
        {}
      ),
    ].concat(forest(roadMapGrid, 8, [[8, 0, 13, 14], [44, 5, 46, 10]])),
  };

  // ---- 湖畔: 凍った湖、ちゃんの車、ほうとう屋 ----
  const LAKE_GRID = [
    "###############",
    "###############",
    "###############",
    "###############",
    "###############",
    "###############",
    "###############",
    "###############",
    "...............",
    ".iiiiiiiii.....",
    "iiiiiiiiiii....",
    "iiiiiiiiiii....",
    "iiiiiiiiii.....",
    ".iiiiiiii......",
    "..iiiiii.......",
    "...............",
    "...............",
    "===============",
    "===============",
    "...............",
    "...............",
    "...............",
  ];

  const houtou = at("houtou", 12 * T, 16.4 * T, { id: "houtou" });

  const LAKE = {
    tile: T,
    bg: "#eef2f6",
    snow: true,
    map: LAKE_GRID,
    legend: {
      "#": { solid: true, none: true },
      ".": { wang: "road" },
      "=": { wang: "road", lowerOf: ["road"] },
      i: { wang: "ice", lowerOf: ["ice"], ice: true },
    },
    wang: {
      road: { img: "wang_road", size: 32, lookup: WANG16 },
      ice: { img: "wang_ice", size: 32, lookup: WANG16 },
    },
    backdrop: { img: "fuji", x: 0, y: 16, scale: 2 },
    drawGround(ctx, ox, oy) {
      centerLine(ctx, ox, oy, [[-T, 18 * T], [16 * T, 18 * T]]);
    },
    spawns: {
      west: { x: 0.9 * T, y: 18 * T, facing: "east" },
      door: { x: 9.3 * T, y: 17 * T, facing: "south" },
    },
    triggers: [{ id: "toRoad", x: -T, y: 16.5 * T, w: 1.3 * T, h: 3 * T, warp: { map: "road", spawn: "pass" } }],
    objects: [
      at("car", 2.6 * T, 16.7 * T, {
        id: "car",
        range: 44,
        interact(api) {
          api.mutter("ちゃん");
          if (api.flag("memory")) return;
          api.later(1300, () => api.show("v_window", () => api.setFlag("memory")));
        },
      }),
      at("shard", 5 * T, 11.8 * T, {
        id: "shard",
        bob: 1,
        range: 26,
        hidden: (api) => api.hasItem("氷のかけら"),
        interact(api) {
          api.giveItem("氷のかけら");
        },
      }),
      houtou,
      // のれんの前
      {
        id: "door",
        x: 9.7 * T,
        y: 16 * T,
        w: 1,
        h: 1,
        headY: 30,
        range: 30,
        nearRange: 64,
        near(api) {
          if (api.flag("saidHoutou")) return;
          api.setFlag("saidHoutou");
          api.mutter("ほうとう");
        },
        interact(api) {
          api.warp("shop", "door");
        },
      },
      at("pine", 13.6 * T, 9 * T),
      at("pine", 12.2 * T, 8.8 * T),
      at("bare", 14.4 * T, 11 * T),
      at("pine", 0.4 * T, 21 * T),
      at("pine", 3.1 * T, 21.2 * T),
      at("bare", 6.5 * T, 21 * T),
      at("pine", 10.2 * T, 21.1 * T),
      at("pine", 13.8 * T, 21.3 * T),
    ],
  };

  // ---- ほうとう屋の中(古民家): 左が土間とかまど、右が板の間とちゃぶ台 ----
  const TANSU_FOOT = [12 * T, 2.9 * T];
  const SHOP = {
    tile: T,
    bg: "#140f12",
    map: [
      "XUUUUUUUUUUUUUX",
      "XLLLLLLLLLLLLLX",
      "XdddddffffffffX",
      "XdddddffffffffX",
      "XdddddffffffffX",
      "XdddddffffffffX",
      "XdddddffffffffX",
      "XdddddffffffffX",
      "XdddddffffffffX",
      "XXdddXXXXXXXXXX",
    ],
    legend: {
      X: { solid: true, color: "#1e1511" },
      U: { solid: true, img: "k_wall", crop: [0, 0] },
      L: { solid: true, img: "k_wall", crop: [0, 32] },
      f: { wang: "floor" },
      d: { wang: "floor", lowerOf: ["floor"] },
    },
    wang: { floor: { img: "wang_floor", size: 32, lookup: WANG16 } },
    spawns: { door: { x: 3.5 * T, y: 8.4 * T, facing: "north" } },
    triggers: [{ id: "out", x: 2 * T, y: 9.4 * T, w: 3 * T, h: T, warp: { map: "lake", spawn: "door" } }],
    objects: [
      at("kamado", 3 * T, 3.9 * T),
      // 囲炉裏。自在鉤に吊った土鍋で、土星を煮ている(水に浮くから)
      at("irori", 11.9 * T, 7.4 * T, {
        id: "pot",
        headY: 40,
        range: 44,
        interact(api) {
          api.show("v_pot");
        },
      }),
      at("post", 6 * T, 3 * T),
      at("post", 6 * T, 8.9 * T),
      at("tansu", TANSU_FOOT[0], TANSU_FOOT[1]),
      // たんすの上のラジオ
      Object.assign(at("radio", TANSU_FOOT[0] + 6, TANSU_FOOT[1] - 38), {
        id: "radio",
        sortDy: 60,
        iy: 49,
        range: 40,
        interact(api) {
          api.bubble("radio", "……あすの金星は、晴れ……", 3600);
          if (!api.hasWord("金星の天気予報")) {
            api.learnWord("金星の天気予報");
            api.toast("金星の天気予報");
          }
        },
      }),
      // ちゃんの座布団
      at("zabuton", 8.3 * T, 4.4 * T, {
        id: "chair",
        sortDy: -20,
        range: 30,
        interact(api) {
          if (!api.flag("memory")) {
            api.mutter("……");
            return;
          }
          api.mutter("ちゃん");
          if (api.flag("ate")) return;
          api.later(1300, () =>
            api.show("v_table", () => {
              api.setFlag("ate");
              api.later(500, () =>
                api.show("v_road", () => api.later(700, () => api.exit()))
              );
            })
          );
        },
      }),
      at("chabudai", 8.3 * T, 6.3 * T),
      // きーの小さな座布団
      at("zabutonS", 8.3 * T, 7.7 * T, { sortDy: -20 }),
      {
        id: "noren",
        x: 3.5 * T,
        y: 9 * T,
        w: 1,
        h: 1,
        sortDy: 40,
        draw(ctx, sx, sy) {
          ctx.fillStyle = "#1f2e52";
          ctx.fillRect(sx - 46, sy - 2, 92, 10);
          ctx.fillStyle = "#16213d";
          for (let i = -46; i < 46; i += 23) ctx.fillRect(sx + i + 21, sy - 2, 2, 10);
        },
      },
    ],
  };

  // ---- 懲罰空間: 何もない、白い空間。断片に近づくと、何もなかった場所に何かが見えてくる ----
  const VOID_COLS = 44;
  const VOID_ROWS = 36;

  function voidGrid() {
    // 床のところどころに、うっすら段差のある場所(まばらに)
    const g = [];
    for (let r = 0; r < VOID_ROWS; r++) g.push(Array(VOID_COLS).fill("."));
    const blobs = [[6, 7, 2], [9, 33, 3], [20, 5, 2], [27, 36, 2], [31, 14, 3], [4, 20, 1], [16, 38, 1]];
    for (const [br, bc, rad] of blobs) {
      for (let r = br - rad; r <= br + rad; r++)
        for (let c = bc - rad - 1; c <= bc + rad + 1; c++) {
          if (r < 0 || c < 0 || r >= VOID_ROWS || c >= VOID_COLS) continue;
          if (Math.hypot((r - br) * 1.3, c - bc) <= rad + 0.6 * rand(r, c, 9)) g[r][c] = ",";
        }
    }
    return g.map((row) => row.join(""));
  }

  // 断片: 台座の上の小さな模型。触れると、その断片の世界に入る
  // requires: この断片が現れる前に終えておく断片の世界
  function fragment(id, title, text, icon, col, row, requires) {
    const fx = col * T;
    const fy = row * T;
    const found = (api) => api.flag(`found.${id}`);
    const present = (api) => !requires || api.cleared(requires);
    return {
      object: {
        id: `frag_${id}`,
        x: fx,
        y: fy,
        w: 1,
        h: 1,
        headY: 86,
        solid: { w: 44, h: 18, dy: -8 },
        range: 46,
        hidden: (api) => !present(api),
        canInteract: found,
        interact(api) {
          api.enterWorld(id);
        },
        draw(ctx, sx, sy, t, api) {
          const p = api.player();
          const d = Math.hypot(p.x - fx, p.y - fy);
          const a = found(api) ? 1 : Math.max(0, Math.min(1, (190 - d) / 90));
          if (a <= 0) return;
          const ped = api.image("pedestal");
          const ico = api.image(icon);
          ctx.save();
          ctx.globalAlpha = a;
          const glow = ctx.createRadialGradient(sx, sy - 40, 4, sx, sy - 40, 60);
          glow.addColorStop(0, "rgba(200, 225, 240, 0.55)");
          glow.addColorStop(1, "rgba(200, 225, 240, 0)");
          ctx.fillStyle = glow;
          ctx.fillRect(sx - 60, sy - 100, 120, 120);
          if (ped) ctx.drawImage(ped, sx - 32, sy - 58);
          if (ico) ctx.drawImage(ico, sx - 24, sy - 86 + Math.round(Math.sin(t * 2) * 2));
          ctx.restore();
        },
      },
      // 最初に触れたとき: 断片の名前と言葉を出して、そのまま中へ
      trigger: {
        id: `touch_${id}`,
        x: fx - 50,
        y: fy - 44,
        w: 100,
        h: 80,
        enabled: present,
        run(api) {
          if (found(api)) return;
          api.setFlag(`found.${id}`);
          api.say([{ title, text }], () => api.enterWorld(id));
        },
      },
      spawn: { x: fx, y: fy + 1.6 * T, facing: "south" },
    };
  }

  const VOID_FRAGMENTS = [
    fragment("lake", "凍った湖と富士山", "きーが見た風景。", "frag_lake", 22, 12),
    fragment("haihei", "廃兵院", "Hi Hey Win！", "frag_haihei", 33, 21, "lake"),
  ];

  const VOID = {
    tile: T,
    bg: "#f7f7f9",
    map: voidGrid(),
    legend: {
      ".": { wang: "void", lowerOf: ["void"] },
      ",": { wang: "void" },
    },
    wang: { void: { img: "wang_void", size: 32, lookup: WANG16 } },
    spawns: Object.assign(
      { start: { x: 22 * T, y: 26 * T, facing: "north" } },
      ...VOID_FRAGMENTS.map((f) => ({ [`from_${f.object.id.slice(5)}`]: f.spawn }))
    ),
    triggers: VOID_FRAGMENTS.map((f) => f.trigger),
    objects: VOID_FRAGMENTS.map((f) => f.object),
  };

  // ======== 廃兵院(Hi Hey Win！) ========
  // フィールドは今(夕方)。死人に話しかけると、生きていた頃の文化祭の日の思い出(一枚絵)が起きる。
  // リリカルで、物悲しいが怖くない。サナトリウムのように穏やか。激戦があったことは匂わせるだけ。
  const HS = {
    facade: { img: "facade", w: 320, h: 160, top: 13, bottom: 147 },
    arch: { img: "arch", w: 128, h: 96, top: 3, bottom: 93 },
    yakisoba: { img: "yakisoba", w: 96, h: 96, top: 13, bottom: 85, solid: [72, 24] },
    wataame: { img: "wataame", w: 96, h: 96, top: 17, bottom: 87, solid: [62, 24] },
    shateki: { img: "shateki", w: 128, h: 96, top: 10, bottom: 85, solid: [92, 28] },
    uketsuke: { img: "uketsuke", w: 96, h: 64, top: 4, bottom: 60, solid: [64, 20] },
    ginkgo: { img: "ginkgo", w: 64, h: 96, top: 5, bottom: 91, solid: [14, 8] },
    stage: { img: "stage", w: 256, h: 96, top: 2, bottom: 96, solid: [156, 64] },
    exhibit1: { img: "exhibit1", w: 96, h: 48, top: 5, bottom: 48, solid: [80, 18] },
    exhibit2: { img: "exhibit2", w: 96, h: 48, top: 6, bottom: 48, solid: [84, 18] },
    wheelchair: { img: "wheelchair", w: 32, h: 32, top: 2, bottom: 30, solid: [18, 8] },
    telescope: { img: "telescope", w: 32, h: 48, top: 8, bottom: 48, solid: [16, 8] },
    tv: { img: "tv", w: 48, h: 48, top: 6, bottom: 43, solid: [30, 12] },
    iv: { img: "iv", w: 32, h: 64, top: 3, bottom: 62, solid: [12, 6] },
    legshelf: { img: "legshelf", w: 64, h: 64, top: 3, bottom: 56, solid: [46, 14] },
    nursedesk: { img: "nursedesk", w: 96, h: 64, top: 9, bottom: 56, solid: [52, 18] },
    oxyvase: { img: "oxyvase", w: 32, h: 32, top: 5, bottom: 31 },
    starchart: { img: "starchart", w: 32, h: 32, top: 0, bottom: 30 },
    stairs: { img: "stairs", w: 64, h: 64, top: 0, bottom: 62 },
    cot: { img: "cot", w: 32, h: 32, top: 2, bottom: 32, solid: [20, 10] },
    radio: { img: "radio", w: 32, h: 32, top: 5, bottom: 27 },
    d_uketsuke: { img: "d_uketsuke", w: 64, h: 64, top: 9, bottom: 55 },
    d_shateki: { img: "d_shateki", w: 64, h: 64, top: 6, bottom: 57, solid: [24, 10] },
    d_yakisoba: { img: "d_yakisoba", w: 64, h: 64, top: 3, bottom: 61, solid: [24, 10] },
    d_carver: { img: "d_carver", w: 64, h: 64, top: 7, bottom: 57, solid: [28, 10] },
    d_band1: { img: "d_band1", w: 64, h: 64, top: 9, bottom: 56 },
    d_band2: { img: "d_band2", w: 64, h: 64, top: 9, bottom: 57 },
    d_wheel: { img: "d_wheel", w: 64, h: 64, top: 8, bottom: 58, solid: [26, 10] },
    d_bedman: { img: "d_bedman", w: 48, h: 64, top: 12, bottom: 55, solid: [36, 40] },
    d_scope: { img: "d_scope", w: 64, h: 64, top: 4, bottom: 61, solid: [30, 12] },
  };

  function hat(kind, fx, fy, extra) {
    const s = HS[kind];
    const o = { img: s.img, w: s.w, h: s.h, x: fx, y: fy - (s.bottom - s.h / 2), sortDy: s.bottom - s.h / 2, headY: s.h / 2 - s.top };
    if (s.solid) o.solid = { w: s.solid[0], h: s.solid[1], dy: o.sortDy - s.solid[1] / 2 };
    return Object.assign(o, extra || {});
  }

  // スタンプラリー(屋台・展示・舞台)
  const STAMPS = ["stall", "exhibit", "stage"];
  function stampCount(api) {
    return STAMPS.filter((k) => api.flag(`stamp.${k}`)).length;
  }
  function stamp(api, key) {
    if (api.flag(`stamp.${key}`)) return;
    api.setFlag(`stamp.${key}`);
    const n = stampCount(api);
    api.toast(`スタンプ ${"●".repeat(n)}${"○".repeat(STAMPS.length - n)}`);
  }
  // 死人: 話しかけると、その人との思い出
  function dead(kind, id, fx, fy, memory, after, extra) {
    return hat(kind, fx, fy, Object.assign({
      id,
      range: 40,
      interact(api) {
        api.show(memory, () => after && after(api));
      },
    }, extra || {}));
  }
  // 掛け声: その場にいる死人たちから、いっせいに
  function hiHeyWin(api, ids) {
    ids.forEach((id, i) => api.later(i * 180, () => api.bubble(id, "Hi Hey Win！", 2600)));
  }

  // 万国旗(色あせた三角の旗を、たるませて吊る)
  function bunting(ctx, ox, oy, x0, y0, x1, y1, t) {
    const cols = ["#c8766a", "#d6b46a", "#7fa7b8", "#9cb07a", "#c99ab2"];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.floor(len / 12);
    ctx.strokeStyle = "rgba(60, 40, 30, 0.7)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      const x = x0 + (x1 - x0) * k + ox;
      const y = y0 + (y1 - y0) * k + Math.sin(k * Math.PI) * 18 + oy;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    for (let i = 0; i < n; i++) {
      const k = (i + 0.5) / n;
      const x = Math.round(x0 + (x1 - x0) * k + ox);
      const y = Math.round(y0 + (y1 - y0) * k + Math.sin(k * Math.PI) * 18 + oy);
      const sway = Math.round(Math.sin(t * 2 + i) * 1);
      ctx.fillStyle = cols[i % cols.length];
      ctx.beginPath();
      ctx.moveTo(x - 4, y);
      ctx.lineTo(x + 4, y);
      ctx.lineTo(x + sway, y + 8);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ひとりでに競争している、からの車椅子
  function racer(id, row, speed, phase) {
    const x0 = 3.5 * T;
    const x1 = 14.5 * T;
    return {
      id,
      x: x0,
      y: row * T - 14,
      w: 32,
      h: 32,
      sortDy: 14,
      dir: 1,
      update(dt, t) {
        const span = x1 - x0;
        const p = ((t * speed + phase) % (span * 2) + span * 2) % (span * 2);
        this.dir = p < span ? 1 : -1;
        this.x = x0 + (p < span ? p : span * 2 - p);
      },
      draw(ctx, sx, sy, t, api) {
        const im = api.image("wheelchair");
        if (!im) return;
        ctx.save();
        ctx.translate(sx, sy + Math.round(Math.sin(t * 12 + phase) * 1));
        ctx.scale(this.dir, 1);
        ctx.drawImage(im, -16, -16);
        ctx.restore();
      },
    };
  }

  // ---- 中庭(門、受付、屋台) ----
  function yardGrid() {
    const g = [];
    for (let r = 0; r < 20; r++) {
      const row = [];
      for (let c = 0; c < 18; c++) {
        let ch = ",";
        if (r < 5) ch = "G";
        else if ((c === 8 || c === 9) && r >= 5) ch = ".";
        else if (r >= 9 && r <= 15 && c >= 3 && c <= 14) ch = ".";
        row.push(ch);
      }
      g.push(row.join(""));
    }
    return g;
  }

  const YARD = {
    tile: T,
    bg: "#3d5a2e",
    tintMul: "#f2b48a",
    tint: "rgba(255, 150, 70, 0.10)",
    map: yardGrid(),
    legend: {
      ".": { wang: "yard", lowerOf: ["yard"] },
      ",": { wang: "yard" },
      G: { wang: "yard", solid: true },
    },
    wang: { yard: { img: "wang_yard", size: 32, lookup: WANG16 } },
    spawns: {
      gate: { x: 9 * T, y: 18.6 * T, facing: "north" },
      door: { x: 9 * T, y: 6 * T, facing: "south" },
    },
    onEnter(api) {
      if (api.flag("heard")) return;
      api.setFlag("heard");
      api.later(900, () => api.mutter("はい　へい　うぃん", 3200));
    },
    triggers: [{ id: "toHall", x: 8 * T, y: 4.6 * T, w: 2 * T, h: 0.8 * T, warp: { map: "hall", spawn: "south" } }],
    drawOverlay(ctx, ox, oy, t) {
      bunting(ctx, ox, oy, 3 * T, 4.2 * T, 3.5 * T, 17.5 * T, t);
      bunting(ctx, ox, oy, 15 * T, 4.2 * T, 14.5 * T, 17.5 * T, t);
      bunting(ctx, ox, oy, 2 * T, 8.5 * T, 16 * T, 8.5 * T, t);
      bunting(ctx, ox, oy, 2 * T, 12.5 * T, 16 * T, 12.5 * T, t);
    },
    objects: [
      hat("facade", 9 * T, 5 * T),
      hat("ginkgo", 1.2 * T, 7 * T),
      hat("ginkgo", 16.8 * T, 7.4 * T),
      hat("ginkgo", 1.4 * T, 17 * T),
      hat("ginkgo", 16.6 * T, 16.8 * T),
      hat("arch", 9 * T, 19.6 * T, { sortDy: 60 }),
      hat("uketsuke", 12.6 * T, 17.2 * T),
      dead("d_uketsuke", "uketsuke", 12.6 * T, 16.5 * T, "v_uketsuke", null, {
        sortDy: 20,
        range: 64, // 受付の机ごしに話しかける
        interact(api) {
          if (!api.flag("card")) {
            api.show("v_uketsuke", () => {
              api.setFlag("card");
              api.giveItem("スタンプ台紙");
            });
          } else if (stampCount(api) === STAMPS.length && !api.flag("prize")) {
            api.setFlag("prize");
            api.giveItem("宇宙船殻用単結晶");
          } else {
            api.show("v_uketsuke");
          }
        },
      }),
      hat("yakisoba", 4.5 * T, 11 * T),
      dead("d_yakisoba", "yakisoba", 6.2 * T, 11.6 * T, "v_yakisoba"),
      hat("wataame", 4.5 * T, 15 * T),
      hat("shateki", 13 * T, 11 * T, {
        // 景品棚の、見たことのないもの(鈴木商店の宇宙船殻用単結晶)。景品として受け取ると消える
        draw(ctx, sx, sy, t, api) {
          if (api.flag("prize")) return;
          const a = 0.55 + Math.sin(t * 3) * 0.35;
          ctx.fillStyle = `rgba(170, 230, 255, ${a})`;
          ctx.fillRect(sx + 12, sy - 11, 4, 6);
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillRect(sx + 13, sy - 10, 1, 2);
        },
      }),
      dead("d_shateki", "shateki", 15.6 * T, 11.7 * T, "v_stall", (api) => stamp(api, "stall")),
      racer("racer1", 13.3, 46, 0),
      racer("racer2", 14.1, 61, 90),
      racer("racer3", 14.9, 38, 200),
    ],
  };

  // ---- 講堂(舞台、作品展示) ----
  const HALL = {
    tile: T,
    bg: "#1c1411",
    tintMul: "#f0c09a",
    tint: "rgba(255, 150, 70, 0.08)",
    map: [
      "UUUUUUUUUUUUUUUU",
      "LLLLLLLLLLLLLLLL",
      "X..............X",
      "X..............X",
      "X..............X",
      "X..............X",
      "X..............X",
      "X...............",
      "X...............",
      "X..............X",
      "X..............X",
      "XXXXXXX..XXXXXXX",
    ],
    legend: {
      X: { solid: true, color: "#2a1d17", lowerOf: ["ward"] },
      U: { solid: true, img: "wall2", crop: [0, 0], lowerOf: ["ward"] },
      L: { solid: true, img: "wall2", crop: [0, 32], lowerOf: ["ward"] },
      ".": { wang: "ward", lowerOf: ["ward"] },
    },
    wang: { ward: { img: "wang_ward", size: 32, lookup: WANG16 } },
    spawns: {
      south: { x: 8 * T, y: 10.4 * T, facing: "north" },
      east: { x: 15 * T, y: 8 * T, facing: "west" },
    },
    triggers: [
      { id: "toYard", x: 7 * T, y: 11.3 * T, w: 2 * T, h: T, warp: { map: "yard", spawn: "door" } },
      { id: "toWard", x: 15.4 * T, y: 7 * T, w: T, h: 2 * T, warp: { map: "ward", spawn: "west" } },
    ],
    objects: [
      hat("stage", 8 * T, 4.3 * T),
      dead("d_band1", "band1", 6.6 * T, 3.5 * T, "v_stage", (api) => {
        stamp(api, "stage");
        hiHeyWin(api, ["band1", "band2", "carver"]);
      }, { sortDy: 60, iy: 60, range: 56 }),
      dead("d_band2", "band2", 9.4 * T, 3.5 * T, "v_stage", (api) => {
        stamp(api, "stage");
        hiHeyWin(api, ["band2", "band1", "carver"]);
      }, { sortDy: 60, iy: 60, range: 56 }),
      hat("wheelchair", 6 * T, 6.4 * T),
      hat("wheelchair", 8 * T, 6.4 * T),
      hat("wheelchair", 10 * T, 6.4 * T),
      hat("exhibit1", 3.4 * T, 8.6 * T),
      // 作りかけのおたかポッポ(手すさび)が並ぶ台
      hat("exhibit2", 11.4 * T, 8.6 * T, {
        id: "exhibit2",
        range: 36,
        interact(api) {
          api.mutter("ちゃん");
        },
      }),
      dead("d_carver", "carver", 13.6 * T, 9.8 * T, "v_carver", (api) => stamp(api, "exhibit")),
    ],
  };

  // ---- 病棟(談話室、病室、詰所、屋上への階段) ----
  const WARD = {
    tile: T,
    bg: "#1c1411",
    tintMul: "#f0c09a",
    tint: "rgba(255, 150, 70, 0.08)",
    map: [
      "UuUuUuUuUuUuUuUuUuUuUuUuUu",
      "LlLlLlLlLlLlLlLlLlLlLlLlLl",
      "X,,,,,,,,,,,,,,,,,,,,,,,,X",
      "X,,,,,,,,,,,,,,,,,,,,,,,,X",
      "X,,,,,,,,,,,,,,,,,,,,,,,,X",
      "..........................",
      "..........................",
      "X........................X",
      "XXXXXXXXXXXXXXXXXXXXXXXXXX",
    ].map((r, i) => (i === 5 || i === 6 ? "." + r.slice(1, -1) + "X" : r)),
    legend: {
      X: { solid: true, color: "#2a1d17", lowerOf: ["ward"] },
      U: { solid: true, img: "wall", crop: [0, 0] },
      L: { solid: true, img: "wall", crop: [0, 32] },
      u: { solid: true, img: "wall2", crop: [0, 0] },
      l: { solid: true, img: "wall2", crop: [0, 32] },
      ".": { wang: "ward", lowerOf: ["ward"] },
      ",": { wang: "ward" },
    },
    wang: { ward: { img: "wang_ward", size: 32, lookup: WANG16 } },
    spawns: { west: { x: 1 * T, y: 6 * T, facing: "east" } },
    triggers: [{ id: "toHall", x: -T, y: 5 * T, w: 1.5 * T, h: 2 * T, warp: { map: "hall", spawn: "east" } }],
    objects: [
      // 談話室: 誰もいないのに「バナナ農園」を映しているテレビ
      hat("tv", 3 * T, 3.2 * T, {
        id: "tv",
        range: 40,
        interact(api) {
          api.bubble("tv", "……バナナ農園……", 3000);
        },
      }),
      dead("d_wheel", "wheel", 5.6 * T, 6.9 * T, "v_wheel"),
      // 病室
      hat("oxyvase", 7.6 * T, 2.9 * T),
      dead("d_bedman", "bedman", 9.2 * T, 4.3 * T, "v_bed"),
      hat("iv", 10.8 * T, 3.6 * T, {
        id: "iv",
        range: 34,
        interact(api) {
          api.bubble("iv", "ちりん", 1800);
        },
      }),
      hat("starchart", 12.5 * T, 1.9 * T, { sortDy: -40 }),
      // 窓辺: 空の一点を向いた望遠鏡。枕元に、焦げたぼぎのマスコット(コックピットの御守り)
      hat("cot", 14 * T, 4 * T, {
        id: "charm",
        range: 34,
        interact(api) {
          api.show("v_cockpit");
        },
      }),
      dead("d_scope", "scope", 15.6 * T, 4.2 * T, "v_cockpit"),
      hat("telescope", 17.2 * T, 3.4 * T),
      // 叩くと木琴のように鳴る義足の棚
      hat("legshelf", 12 * T, 7.9 * T, {
        id: "legshelf",
        range: 40,
        interact(api) {
          api.bubble("legshelf", "ぽろん　ぽろん", 2200);
        },
      }),
      // 詰所: ナースコールを押すと、遠くでプロペラの音(ぼぎボマー)。ラジオは金星の天気予報
      hat("nursedesk", 20.5 * T, 3.8 * T, {
        id: "nursecall",
        range: 44,
        interact(api) {
          api.bubble("nursecall", "……ぶうううん……", 3000);
        },
      }),
      hat("radio", 22.4 * T, 3.2 * T, {
        id: "radio",
        range: 34,
        interact(api) {
          api.bubble("radio", "……あすの金星は、晴れ……", 3600);
          if (!api.hasWord("金星の天気予報")) {
            api.learnWord("金星の天気予報");
            api.toast("金星の天気予報");
          }
        },
      }),
      // 屋上への階段: 景品をもらったら上がれる
      hat("stairs", 24.4 * T, 4.4 * T, {
        id: "stairs",
        range: 44,
        interact(api) {
          if (!api.hasItem("宇宙船殻用単結晶")) {
            api.mutter("……");
            return;
          }
          api.show("v_roof", () => {
            api.mutter("はい　へい　うぃん", 3000);
            api.later(2600, () => api.exit());
          });
        },
      }),
    ],
  };

  window.BOGI_WORLDS = {
    // 懲罰空間(ハブ)。ここから断片の世界に入り、戻ってくる
    void: {
      id: "void",
      name: "懲罰空間",
      hub: true,
      fragments: ["lake", "haihei"],
      assetBase: "./assets/worlds/void/",
      images: {
        wang_void: "wang_void.png",
        pedestal: "pedestal.png",
        frag_lake: "frag_lake.png",
        frag_haihei: "frag_haihei.png",
        ki: "./assets/worlds/lake/ki_walk.png",
      },
      playerSprite: { img: "ki", cell: 64, frames: 7, footY: 17 },
      start: "void",
      startSpawn: "start",
      maps: { void: VOID },
    },
    // 断片: 凍った湖と富士山(きーの記憶の世界)
    // 条件: ちゃんの車の窓をのぞく → ほうとう屋で、ちゃんの席を見る → 懲罰空間に帰る
    // 次の世界へのカギ: 道具「氷のかけら」、ことば「金星の天気予報」
    lake: {
      id: "lake",
      name: "凍った湖と富士山",
      assetBase: "./assets/worlds/lake/",
      images: {
        wang_road: "wang_road.png",
        wang_ice: "wang_ice.png",
        wang_floor: "wang_floor.png",
        fuji: "fuji.png",
        ki: "ki_walk.png",
        pi: "pi_walk.png",
        s_pine: "s_pine.png",
        s_pine2: "s_pine2.png",
        s_car: "s_car.png",
        s_houtou: "s_houtou.png",
        s_tires: "s_tires.png",
        s_sign: "s_sign.png",
        s_shard: "s_shard.png",
        k_wall: "k_wall.png",
        k_kamado: "k_kamado.png",
        k_table: "k_table.png",
        k_zabuton: "k_zabuton.png",
        k_zabuton_s: "k_zabuton_s.png",
        k_tansu: "k_tansu.png",
        k_post: "k_post.png",
        k_irori: "k_irori.png",
        i_radio: "i_radio.png",
        v_window: "v_window.png",
        v_table: "v_table.png",
        v_road: "v_road.png",
        v_pot: "v_pot.png",
      },
      playerSprite: { img: "ki", cell: 64, frames: 7, footY: 17 },
      start: "road",
      startSpawn: "start",
      maps: { road: ROAD, lake: LAKE, shop: SHOP },
    },
    // 断片: 廃兵院(Hi Hey Win！)。きーの記憶の世界。凍った湖と富士山を終えると、懲罰空間に現れる
    // 条件: スタンプを3つ集めて景品をもらう → 屋上から文化祭を見る → 懲罰空間に帰る
    // 次の世界へのカギ: 道具「宇宙船殻用単結晶」
    haihei: {
      id: "haihei",
      name: "廃兵院",
      assetBase: "./assets/worlds/haihei/",
      images: Object.fromEntries(
        ["facade", "arch", "yakisoba", "wataame", "shateki", "uketsuke", "wheelchair", "ginkgo", "stage", "exhibit1", "exhibit2", "bed", "telescope", "tv", "iv", "legshelf", "nursedesk", "oxyvase", "starchart", "stairs", "cot", "radio", "wall", "wall2", "wang_yard", "wang_ward",
          "d_uketsuke", "d_shateki", "d_yakisoba", "d_carver", "d_band1", "d_band2", "d_wheel", "d_bedman", "d_scope",
          "v_uketsuke", "v_yakisoba", "v_stall", "v_carver", "v_stage", "v_wheel", "v_bed", "v_cockpit", "v_roof"]
          .map((k) => [k, `${k}.png`])
          .concat([["ki", "./assets/worlds/lake/ki_walk.png"]])
      ),
      playerSprite: { img: "ki", cell: 64, frames: 7, footY: 17 },
      start: "yard",
      startSpawn: "gate",
      maps: { yard: YARD, hall: HALL, ward: WARD },
    },
  };
})();
