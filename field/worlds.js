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
    tires: { img: "s_tires", w: 48, h: 48, top: 12, bottom: 37, solid: [22, 10] },
    sign: { img: "s_sign", w: 32, h: 64, top: 2, bottom: 62, solid: [8, 6] },
    shard: { img: "s_shard", w: 32, h: 32, top: 4, bottom: 26 },
    table: { img: "i_table", w: 96, h: 64, top: 7, bottom: 57, solid: [78, 26] },
    chair: { img: "i_chair", w: 32, h: 48, top: 5, bottom: 43, solid: [20, 10] },
    stool: { img: "i_stool", w: 32, h: 32, top: 6, bottom: 26, solid: [16, 8] },
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
  const ROAD_PATH = [[59, 7], [50, 7], [50, 3], [42, 3], [42, 11], [33, 11], [33, 4], [25, 4], [25, 10], [17, 10], [17, 6], [10, 6], [10, 14]];

  function roadGrid() {
    const g = [];
    for (let r = 0; r < ROAD_ROWS; r++) g.push(Array(ROAD_COLS).fill(r < 8 ? "#" : "."));
    const paint = (r, c) => {
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const rr = r + dr;
          const cc = c + dc;
          if (rr >= 8 && rr < ROAD_ROWS && cc >= 0 && cc < ROAD_COLS) g[rr][cc] = "=";
        }
    };
    for (let i = 0; i < ROAD_PATH.length - 1; i++) {
      const [r0, c0] = ROAD_PATH[i];
      const [r1, c1] = ROAD_PATH[i + 1];
      const steps = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
      for (let s = 0; s <= steps; s++) {
        paint(Math.round(r0 + ((r1 - r0) * s) / steps), Math.round(c0 + ((c1 - c0) * s) / steps));
      }
    }
    return g.map((row) => row.join(""));
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
      "=": { wang: "road", lowerOf: ["road"] },
    },
    wang: { road: { img: "wang_road", size: 32, lookup: WANG16 } },
    backdrop: { img: "fuji", x: 0, y: 16, scale: 2 },
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
      at("sign", 9.6 * T, 51.9 * T),
      at("sign", 1.4 * T, 41.9 * T),
      at("sign", 13.4 * T, 34.9 * T),
      at("sign", 2.4 * T, 24.9 * T),
      at("tires", 7.2 * T, 45.4 * T),
      Object.assign(
        {
          id: "pi",
          anim: { img: "pi", cell: 64, row: 3, frames: 1, fps: 1 },
          w: 64,
          h: 64,
          x: 8.6 * T,
          y: 45.3 * T - 13,
          sortDy: 13,
          headY: 12,
          solid: { w: 18, h: 8, dy: 9 },
          range: 36,
          nearRange: 56,
          near(api) {
            api.bubble("pi", "どけ");
          },
          interact(api) {
            api.bubble("pi", "おれのだ");
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

  // ---- ほうとう屋の中 ----
  const SHOP = {
    tile: T,
    bg: "#140f12",
    map: [
      "XUUUUUUUUUUUUUX",
      "XLLLLLLLLLLLLLX",
      "XfffffffffffffX",
      "XfffffffffffffX",
      "XfffffffffffffX",
      "XfffffffffffffX",
      "XfffffffffffffX",
      "XffffffdddffffX",
      "XffffffdddffffX",
      "XXXXXXXdddXXXXX",
    ],
    legend: {
      X: { solid: true, color: "#2b1d17" },
      U: { solid: true, img: "i_wall", crop: [0, 0] },
      L: { solid: true, img: "i_wall", crop: [0, 32] },
      f: { wang: "floor" },
      d: { wang: "floor", lowerOf: ["floor"] },
    },
    wang: { floor: { img: "wang_floor", size: 32, lookup: WANG16 } },
    spawns: { door: { x: 8.5 * T, y: 8.4 * T, facing: "north" } },
    triggers: [{ id: "out", x: 7 * T, y: 9.4 * T, w: 3 * T, h: T, warp: { map: "lake", spawn: "door" } }],
    objects: [
      {
        id: "pot",
        img: "i_counter",
        w: 128,
        h: 64,
        x: 7.5 * T,
        y: 1 * T,
        headY: 10,
        iy: 40,
        range: 34,
        interact(api) {
          api.show("v_pot");
        },
      },
      at("radio", 12.5 * T, 2.6 * T, {
        id: "radio",
        range: 34,
        draw(ctx, sx, sy) {
          ctx.fillStyle = "#5a3b28";
          ctx.fillRect(sx - 18, sy + 11, 36, 4);
        },
        interact(api) {
          api.bubble("radio", "……あすの金星は、晴れ……", 3600);
          if (!api.hasWord("金星の天気予報")) {
            api.learnWord("金星の天気予報");
            api.toast("金星の天気予報");
          }
        },
      }),
      at("chair", 7.5 * T, 4.4 * T, {
        id: "chair",
        range: 36,
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
                api.show("v_road", () => {
                  api.mutter("だざいおさむん", 3000);
                  api.later(2600, () => api.exit());
                })
              );
            })
          );
        },
      }),
      at("table", 7.5 * T, 6.1 * T),
      at("stool", 7.5 * T, 7.2 * T),
      {
        id: "noren",
        x: 8.5 * T,
        y: 9 * T,
        w: 1,
        h: 1,
        sortDy: 40,
        draw(ctx, sx, sy) {
          ctx.fillStyle = "#8c2230";
          ctx.fillRect(sx - 46, sy - 2, 92, 10);
          ctx.fillStyle = "#6b1824";
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
        i_wall: "i_wall.png",
        i_counter: "i_counter.png",
        i_table: "i_table.png",
        i_chair: "i_chair.png",
        i_stool: "i_stool.png",
        i_radio: "i_radio.png",
        v_window: "v_window.png",
        v_table: "v_table.png",
        v_road: "v_road.png",
        v_pot: "v_pot.png",
      },
      playerSprite: { img: "ki", cell: 64, frames: 7, footY: 19 },
      start: "road",
      startSpawn: "start",
      maps: { road: ROAD, lake: LAKE, shop: SHOP },
    },
  };
})();
