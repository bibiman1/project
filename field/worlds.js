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

  // 曲がった道を1ドット単位で描いた下絵(一度だけ作る)。
  // マス目のタイルだと縁が階段になるので、道は曲線に沿って円を押していって描く。
  function buildRoadLayer(tileImg, curve, cols, rows, fromRow) {
    const W = cols * T;
    const H = rows * T;
    const tex = document.createElement("canvas");
    tex.width = T;
    tex.height = T;
    const tctx = tex.getContext("2d");
    tctx.drawImage(tileImg, 2 * T, 1 * T, T, T, 0, 0, T, T); // 全面が道のタイル(角 0000)
    const texData = tctx.getImageData(0, 0, T, T).data;
    const mask = new Uint8Array(W * H); // 0: なし 1: 雪の土手 2: 道
    const INNER = 44;
    const OUTER = 48;
    const pts = [];
    for (let i = 0; i < curve.length - 1; i++) {
      const [r0, c0] = curve[i];
      const [r1, c1] = curve[i + 1];
      const x0 = (c0 + 0.5) * T;
      const y0 = (r0 + 0.5) * T;
      const x1 = (c1 + 0.5) * T;
      const y1 = (r1 + 0.5) * T;
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / 2));
      for (let k = 0; k < n; k++) pts.push([x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n]);
    }
    const stamp = (r, v) => {
      for (const [px, py] of pts) {
        for (let y = Math.max(fromRow * T, Math.floor(py - r)); y <= Math.min(H - 1, py + r); y++) {
          for (let x = Math.max(0, Math.floor(px - r)); x <= Math.min(W - 1, px + r); x++) {
            if ((x + 0.5 - px) ** 2 + (y + 0.5 - py) ** 2 <= r * r && mask[y * W + x] < v) mask[y * W + x] = v;
          }
        }
      }
    };
    stamp(INNER, 2);
    stamp(OUTER, 1);
    const out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    const octx = out.getContext("2d");
    const img = octx.createImageData(W, H);
    const d = img.data;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const m = mask[y * W + x];
        if (!m) continue;
        const o = (y * W + x) * 4;
        if (m === 2) {
          const t = ((y % T) * T + (x % T)) * 4;
          d[o] = texData[t];
          d[o + 1] = texData[t + 1];
          d[o + 2] = texData[t + 2];
        } else {
          // 土手: 道に近い側は影、雪との境目は輪郭
          const edge = x > 0 && x < W - 1 && y > 0 && y < H - 1 && [mask[o / 4 - 1], mask[o / 4 + 1], mask[o / 4 - W], mask[o / 4 + W]].includes(0);
          const inner = [mask[o / 4 - 1], mask[o / 4 + 1], mask[o / 4 - W], mask[o / 4 + W]].includes(2);
          const c = edge ? [150, 184, 204] : inner ? [196, 218, 230] : [238, 246, 250];
          d[o] = c[0];
          d[o + 1] = c[1];
          d[o + 2] = c[2];
        }
        d[o + 3] = 255;
      }
    }
    octx.putImageData(img, 0, 0);
    return out;
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
      if (!this.layer) {
        if (typeof img !== "function") return; // 古い rpg.js と混ざったとき(キャッシュ)に止まらないように
        const tile = img("wang_road");
        if (!tile) return;
        this.layer = buildRoadLayer(tile, ROAD_CURVE, ROAD_COLS, ROAD_ROWS, 8);
      }
      ctx.drawImage(this.layer, ox, oy);
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

  window.BOGI_WORLDS = {
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
  };
})();
