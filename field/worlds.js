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
    irori: { img: "k_irori", w: 128, h: 176, top: 0, bottom: 174, solid: [96, 84] },
    sign: { img: "s_sign_r", w: 32, h: 64, top: 1, bottom: 62, solid: [8, 6] },
    closed: { img: "s_closed", w: 64, h: 48, top: 1, bottom: 47, solid: [54, 8] }, // 冬期通行止の看板
    signL: { img: "s_sign_l", w: 32, h: 64, top: 1, bottom: 62, solid: [8, 6] },
    shard: { img: "s_shard", w: 32, h: 32, top: 4, bottom: 26 },
    stove: { img: "k_stove", w: 64, h: 144, top: 0, bottom: 133, solid: [34, 14] }, // 鋳鉄のだるまストーブ
    post: { img: "k_post", w: 32, h: 64, top: 3, bottom: 60, solid: [16, 8] },
    tansu: { img: "k_tansu", w: 64, h: 64, top: 8, bottom: 57, solid: [50, 20] },
    chabudai: { img: "k_table", w: 96, h: 64, top: 6, bottom: 58, solid: [60, 22] },
    zabuton: { img: "k_zabuton", w: 32, h: 32, top: 6, bottom: 27 },
    zabutonS: { img: "k_zabuton_s", w: 32, h: 32, top: 7, bottom: 25 },
    radio: { img: "i_radio", w: 32, h: 32, top: 5, bottom: 27 },
    poster: { img: "k_poster", w: 20, h: 24, top: 0, bottom: 23 },
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
    ctx.fillStyle = "#f4f6f8";
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


  // ガードレール: 点列にそって、支柱と白いレールを描く(3/4見下ろしなので、レールは少し上に浮かせる)
  function guardrail(ctx, ox, oy, pts) {
    if (pts.length < 2) return;
    const H = 7;
    ctx.save();
    ctx.translate(ox, oy);
    ctx.fillStyle = "#4f5863"; // 支柱
    let run = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const len = Math.hypot(x1 - x0, y1 - y0);
      for (let d = (20 - (run % 20)) % 20; d < len; d += 20) {
        const x = x0 + ((x1 - x0) * d) / len;
        const y = y0 + ((y1 - y0) * d) / len;
        ctx.fillRect(Math.round(x) - 1, Math.round(y) - H, 3, H + 2);
      }
      run += len;
    }
    const line = (dy, col, w) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = w;
      ctx.beginPath();
      pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y - dy) : ctx.moveTo(x, y - dy)));
      ctx.stroke();
    };
    ctx.lineJoin = "round";
    line(H - 1, "#4f5863", 6);
    line(H - 1, "#f4f7f9", 3);
    line(H - 2, "#aab4bd", 1);
    ctx.restore();
  }
  // 峠道のガードレール: カーブの外側にだけ
  const ROAD_RAILS = (() => {
    const px = ROAD_CURVE.map(([r, c]) => [(c + 0.5) * T, (r + 0.5) * T]);
    const off = ROAD_WIDTH * T + 10;
    const runs = [];
    let cur = [];
    const K = 5;
    for (let i = K; i < px.length - K; i++) {
      const [ax, ay] = px[i - K];
      const [bx, by] = px[i];
      const [cx, cy] = px[i + K];
      const tx = cx - ax;
      const ty = cy - ay;
      const tl = Math.hypot(tx, ty) || 1;
      const nx = -ty / tl;
      const ny = tx / tl;
      const l1 = Math.hypot(bx - ax, by - ay) || 1;
      const l2 = Math.hypot(cx - bx, cy - by) || 1;
      const turn = ((bx - ax) * (cy - by) - (by - ay) * (cx - bx)) / (l1 * l2); // 曲がる向き(sin)
      const outer = turn > 0 ? -1 : 1;
      const ok = by > 12.5 * T && by < 58 * T && Math.abs(turn) > 0.12;
      if (ok) {
        const p = [bx + nx * off * outer, by + ny * off * outer];
        if (cur.length && cur.side !== outer) {
          runs.push(cur);
          cur = [];
        }
        cur.side = outer;
        cur.push(p);
      } else if (cur.length) {
        runs.push(cur);
        cur = [];
      }
    }
    if (cur.length) runs.push(cur);
    return runs.filter((r) => r.length > 4);
  })();
  // 帰り道(ほうとうを食べたあと): 道に雪が積もって、つるつるすべる
  // 行きは雪のない道。ほうとうを食べると、その回の帰り道だけ雪が積もる(入り直すと行きに戻る)
  const homeward = (api) => api.flag("homeward");
  const HOMEWARD_SLIP = 0.45; // 湖の氷(1.6)より、ずっとつるつる
  // 峠の待避所(行と列)。崖の縁にガードレール、谷の向こうに富士山
  const LAYBY = { c0: 3.5, c1: 13.5, r0: 8.35, r1: 11 };

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
    rails: [[[LAYBY.c0 * T - 2, 8.55 * T], [LAYBY.c1 * T + 2, 8.55 * T]], ...ROAD_RAILS],
    slippery(api, x, y) {
      if (!homeward(api)) return false;
      const r = Math.floor(y / T);
      const c = Math.floor(x / T);
      const inLayby = x > LAYBY.c0 * T && x < LAYBY.c1 * T && y > LAYBY.r0 * T && y < LAYBY.r1 * T;
      return inLayby || (roadMapGrid[r] && roadMapGrid[r][c] === "=") ? HOMEWARD_SLIP : false;
    },
    drawGround(ctx, ox, oy, img, api) {
      if (typeof img !== "function") return; // 古い rpg.js と混ざったとき(キャッシュ)に止まらないように
      const tile = img("wang_road");
      if (!tile) return;
      // 谷の靄: 背景の森の裾をぼかし、崖の縁へつなぐ
      const g = ctx.createLinearGradient(0, 6.9 * T + oy, 0, 8.05 * T + oy);
      g.addColorStop(0, "rgba(238, 242, 246, 0)");
      g.addColorStop(1, "rgba(238, 242, 246, 0.95)");
      ctx.fillStyle = g;
      ctx.fillRect(ox, 6.9 * T + oy, ROAD_COLS * T, 1.15 * T);
      // 崖の縁(雪の土手)
      ctx.fillStyle = "#d6e4ec";
      ctx.fillRect(ox, 8 * T + oy, ROAD_COLS * T, 5);
      ctx.fillStyle = "#b8ccd8";
      ctx.fillRect(ox, 8 * T + 5 + oy, ROAD_COLS * T, 2);
      // 待避所: 道からふくらんだ舗装
      {
        const { c0, c1, r0, r1 } = LAYBY;
        ctx.save();
        ctx.translate(ox, oy);
        ctx.fillStyle = "#c4dae6";
        ctx.beginPath();
        ctx.roundRect(c0 * T - 4, r0 * T - 4, (c1 - c0) * T + 8, (r1 - r0) * T + 8, 18);
        ctx.fill();
        ctx.restore();
        drawRoadVector(ctx, ox, oy, tile, this); // 道と待避所の舗装をつなげる
        ctx.save();
        ctx.translate(ox, oy);
        ctx.fillStyle = this.pattern;
        ctx.beginPath();
        ctx.roundRect(c0 * T, r0 * T, (c1 - c0) * T, (r1 - r0) * T, 14);
        ctx.fill();
        ctx.restore();
      }
      if (api && homeward(api)) {
        // 積もった雪: 道の上を白くなぞる(センターラインは雪の下)
        ctx.save();
        ctx.translate(ox, oy);
        ctx.beginPath();
        ROAD_CURVE.forEach(([r, c], i) => {
          const x = (c + 0.5) * T;
          const y = Math.max(8 * T, (r + 0.5) * T);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.lineJoin = "round";
        ctx.strokeStyle = "rgba(243, 246, 249, 0.88)";
        ctx.lineWidth = 90;
        ctx.stroke();
        ctx.fillStyle = "rgba(243, 246, 249, 0.88)";
        ctx.beginPath();
        ctx.roundRect(LAYBY.c0 * T, LAYBY.r0 * T, (LAYBY.c1 - LAYBY.c0) * T, (LAYBY.r1 - LAYBY.r0) * T, 14);
        ctx.fill();
        // わだち
        ctx.strokeStyle = "rgba(170, 190, 204, 0.5)";
        ctx.lineWidth = 3;
        for (const off of [-12, 12]) {
          ctx.beginPath();
          ROAD_CURVE.forEach(([r, c], i) => {
            const x = (c + 0.5) * T + off;
            const y = Math.max(8 * T, (r + 0.5) * T);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          });
          ctx.stroke();
        }
        ctx.restore();
      } else {
        centerLine(ctx, ox, oy, ROAD_CURVE.filter(([r]) => r > 10.9).map(([r, c]) => [(c + 0.5) * T, (r + 0.5) * T]));
      }
      // ガードレール: 待避所の崖側と、峠道のカーブの外側
      guardrail(ctx, ox, oy, [[LAYBY.c0 * T - 2, 8.55 * T], [LAYBY.c1 * T + 2, 8.55 * T]]);
      ROAD_RAILS.forEach((run) => guardrail(ctx, ox, oy, run));
    },
    spawns: {
      start: { x: 7.5 * T, y: 58.5 * T, facing: "north" },
      pass: { x: 13.2 * T, y: 10.6 * T, facing: "west" },
    },
    triggers: [
      // 道のはじまり(来たところ)から、懲罰空間へ戻る
      {
        id: "leave",
        x: 5.5 * T,
        y: 59.35 * T,
        w: 4 * T,
        h: T,
        run(api) {
          // 帰り道: エリアを出る前に、ちゃんの車で帰っていく絵
          if (homeward(api)) api.show("v_road", () => api.exit());
          else api.exit();
        },
      },
      // 峠: 森が切れて、富士山が見えてくる(北へ越えるたびに)
      {
        id: "vista",
        x: 0,
        y: 12 * T,
        w: ROAD_COLS * T,
        h: T,
        run(api) {
          if (api.player().facing !== "north") return;
          api.pan(0, 2200);
        },
      },
      { id: "toLake", x: 14.3 * T, y: 8 * T, w: T, h: 4 * T, warp: { map: "lake", spawn: "west" } },
    ],
    objects: [
      // カーブの外側の標識(道の上に来るものは置かない)
      ...[[48.9, 1.5], [37.9, 13.4], [26.9, 8.6], [19.9, 1.3], [13.9, 12.4]]
        .filter(([r, c]) => roadMapGrid[Math.floor(r)][Math.floor(c)] === ".")
        .map(([r, c]) => {
          // 警戒標識(右方/左方屈曲): この先、北へ進むと道がどちらへ曲がるか
          const colAt = (row) => {
            let best = ROAD_CURVE[0];
            for (const p of ROAD_CURVE) if (Math.abs(p[0] - row) < Math.abs(best[0] - row)) best = p;
            return best[1];
          };
          const right = colAt(r - 5) > colAt(r);
          return at(right ? "sign" : "signL", c * T, r * T);
        }),
      at("tires", 7 * T, 45.5 * T),
      // 待避所のガードレール: 調べると、何回でも富士山の全景を見わたせる
      {
        id: "lookout",
        x: 8 * T,
        y: 8.6 * T,
        w: 4 * T,
        h: 8,
        range: 60,
        interact(api) {
          api.pan(0, 2600);
        },
      },
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
  const GATE_X = 13.6 * T; // ほうとう屋の先の冬期通行止ゲート

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
    slippery(api, x, y) {
      return homeward(api) && y > 17 * T && y < 19 * T ? HOMEWARD_SLIP : false;
    },
    // ほうとう屋の先は冬期通行止: ゲートで行けない(ぶつかるとはじかれる)
    rails: [[[GATE_X, 8 * T], [GATE_X, 22 * T]]],
    drawGround(ctx, ox, oy, img, api) {
      if (api && homeward(api)) {
        ctx.fillStyle = "rgba(243, 246, 249, 0.88)";
        ctx.fillRect(ox, 17 * T + oy, 16 * T, 2 * T);
      } else {
        centerLine(ctx, ox, oy, [[-T, 18 * T], [GATE_X - 6, 18 * T]]);
      }
      // ゲートの先: 除雪されず、深い雪に埋もれた道
      const gx = GATE_X + ox;
      const g = ctx.createLinearGradient(gx, 0, gx + 1.2 * T, 0);
      g.addColorStop(0, "rgba(244, 247, 250, 0.7)");
      g.addColorStop(1, "rgba(244, 247, 250, 1)");
      ctx.fillStyle = g;
      ctx.fillRect(gx, 16.8 * T + oy, 16 * T - GATE_X, 2.4 * T);
      // ゲートバー(道を横切る、黄と黒のしま)と支柱
      const y0 = 16.6 * T + oy;
      const y1 = 19.4 * T + oy;
      for (let y = y0; y < y1; y += 8) {
        ctx.fillStyle = Math.floor((y - y0) / 8) % 2 ? "#1e1e22" : "#f0c020";
        ctx.fillRect(gx - 3, y - 10, 6, Math.min(8, y1 - y));
      }
      ctx.strokeStyle = "#1a1a1e";
      ctx.lineWidth = 1;
      ctx.strokeRect(gx - 3.5, y0 - 10.5, 7, y1 - y0 + 1);
      ctx.fillStyle = "#f7f9fb"; // バーに積もった雪
      ctx.fillRect(gx - 4, y0 - 12, 8, 3);
      for (const py of [y0, y1]) {
        ctx.fillStyle = "#8a9099";
        ctx.fillRect(gx - 4, py - 16, 8, 18);
        ctx.fillStyle = "#b8bec6";
        ctx.fillRect(gx - 4, py - 16, 2, 18);
        ctx.fillStyle = "#f7f9fb";
        ctx.fillRect(gx - 5, py - 18, 10, 3);
      }
    },
    spawns: {
      west: { x: 0.9 * T, y: 18 * T, facing: "east" },
      door: { x: 9.3 * T, y: 17 * T, facing: "south" },
    },
    // 左の端から、ワインディングロードへ戻る
    triggers: [{ id: "toRoad", x: -T, y: 16.5 * T, w: 1.6 * T, h: 3 * T, warp: { map: "road", spawn: "pass" } }],
    objects: [
      at("car", 2.6 * T, 16.7 * T, {
        id: "car",
        range: 44,
        interact(api) {
          api.mutter("ちゃん");
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
      // 冬期通行止の看板(道ばた)
      at("closed", 12.6 * T, 20.3 * T, {
        id: "closed",
        range: 40,
        interact(api) {
          api.mutter("……");
        },
      }),
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
  const TANSU_FOOT = [8.2 * T, 2.9 * T];
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
      // 土間: 鋳鉄のだるまストーブ(上にやかん、煙突は天井へ)
      at("stove", 3 * T, 3.9 * T),
      // 囲炉裏。自在鉤に吊った土鍋で、土星を煮ている(水に浮くから)
      at("irori", 11.4 * T, 7.6 * T, {
        id: "pot",
        headY: 40,
        range: 44,
        interact(api) {
          api.show("v_pot");
        },
      }),
      // 板壁の文化祭のポスター(廃兵院の十月の文化祭。ここは冬)
      at("poster", 13.2 * T, 1.75 * T, {
        id: "poster",
        range: 40,
        interact(api) {
          api.show("v_poster");
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
      at("zabuton", 7.6 * T, 4.5 * T, {
        id: "chair",
        sortDy: -20,
        range: 30,
        interact(api) {
          if (!api.flag("memory")) {
            api.mutter("……");
            return;
          }
          api.mutter("ちゃん");
          // 何度でも見られる。はじめて見たときに断片の条件を満たす
          api.later(1300, () =>
            api.show("v_table", () => {
              api.setFlag("ate");
              api.setFlag("homeward");
              api.clear();
            })
          );
        },
      }),
      at("chabudai", 7.6 * T, 6.3 * T),
      // 囲炉裏のまわりの座布団(奥は自在鉤の竿がかかるので空ける)
      at("zabuton", 9.5 * T, 6.4 * T, { sortDy: -20 }),
      at("zabuton", 13.4 * T, 6.4 * T, { sortDy: -20 }),
      at("zabuton", 11.4 * T, 8.7 * T, { sortDy: -20 }),
      // きーの小さな座布団
      at("zabutonS", 7.6 * T, 7.7 * T, { sortDy: -20 }),
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

  // テストプレイ用: true のあいだは、先の断片を終えていなくても全部の断片が現れる(本番の順番に戻すときは false)
  const SHOW_ALL_FRAGMENTS = true;

  // 断片: 台座の上の小さな模型。触れると、その断片の世界に入る
  // requires: この断片が現れる前に終えておく断片の世界
  function fragment(id, title, text, icon, col, row, requires) {
    const fx = col * T;
    const fy = row * T;
    const found = (api) => api.flag(`found.${id}`);
    const present = (api) => SHOW_ALL_FRAGMENTS || !requires || api.cleared(requires);
    return {
      id,
      text, // ステータス画面の断片の説明にも使う
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
      // 最初に触れたとき: そのまま中へ(名前や言葉は出さない。ネタバレになるので)
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
          api.enterWorld(id);
        },
      },
      spawn: { x: fx, y: fy + 1.6 * T, facing: "south" },
    };
  }

  const VOID_FRAGMENTS = [
    fragment("lake", "凍った湖と富士山", "きーが見た風景。", "frag_lake", 22, 12),
    fragment("haihei", "アンバリッド・ホテル", "Hi Hey Win！", "frag_haihei", 33, 21, "lake"),
    fragment("kasumi", "霞ヶ浦のエクラノプラン", "ミイラさまの遊覧飛行。", "frag_kasumi", 12, 22, "haihei"),
    fragment("banana", "南極のバナナ農園", "けさの気温 28℃。", "frag_banana", 31, 30, "kasumi"), // 説明の文面は仮
    fragment("suzuki", "荒川の鈴木商店", "宛先がにじんで読めない。", "frag_suzuki", 9, 30, "banana"), // 説明の文面は仮
    fragment("takarabune", "宝舟と首振りエンジン", "何も描かれていない。", "frag_takarabune", 22, 33, "suzuki"), // 説明の文面は仮
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
    facade: { img: "facade", w: 544, h: 176, top: 0, bottom: 168 }, // 右端は東の病棟への渡り廊下
    arch: { img: "arch", w: 128, h: 96, top: 3, bottom: 93 },
    yakisoba: { img: "yakisoba", w: 96, h: 96, top: 12, bottom: 82, solid: [72, 20] },
    wataame: { img: "wataame", w: 96, h: 96, top: 12, bottom: 84, solid: [66, 20] },
    shateki: { img: "shateki", w: 128, h: 96, top: 9, bottom: 87, solid: [86, 24] },
    uketsuke: { img: "uketsuke", w: 96, h: 64, top: 4, bottom: 60, solid: [64, 20] },
    ginkgo_big: { img: "ginkgo_big", w: 86, h: 100, top: 0, bottom: 98, solid: [47, 14] }, // 中庭の真ん中の大銀杏(石の植え込み)
    ginkgo: { img: "ginkgo", w: 64, h: 96, top: 5, bottom: 91, solid: [14, 8] },
    stage: { img: "stage", w: 256, h: 96, top: 0, bottom: 96, solid: [240, 64] },
    prosthetic_rack: { img: "prosthetic_rack", w: 64, h: 64, top: 6, bottom: 58, solid: [56, 12] },
    workbench: { img: "workbench", w: 64, h: 32, top: 3, bottom: 30, solid: [54, 14] },
    arm_stand: { img: "arm_stand", w: 32, h: 64, top: 3, bottom: 61, solid: [16, 8] },
    exhibit1: { img: "exhibit1", w: 96, h: 48, top: 5, bottom: 48, solid: [80, 18] },
    exhibit2: { img: "exhibit2", w: 96, h: 48, top: 6, bottom: 48, solid: [84, 18] },
    wheelchair_back: { img: "wheelchair_back", w: 48, h: 48, top: 5, bottom: 43, solid: [30, 10] },
    wheelchair: { img: "wheelchair", w: 48, h: 48, top: 5, bottom: 44, solid: [26, 10] },
    telescope: { img: "telescope", w: 32, h: 48, top: 8, bottom: 48, solid: [16, 8] },
    radio: { img: "radio", w: 32, h: 32, top: 5, bottom: 27 },
    tv: { img: "tv_off", w: 48, h: 48, top: 6, bottom: 43, solid: [30, 12] },
    iv: { img: "iv", w: 20, h: 58, top: 0, bottom: 57, solid: [10, 6] },
    legshelf: { img: "legshelf", w: 64, h: 64, top: 3, bottom: 56, solid: [46, 14] },
    oxyvase: { img: "oxyvase", w: 32, h: 32, top: 5, bottom: 31 },
    starchart: { img: "starchart", w: 32, h: 37, top: 0, bottom: 36 },
    photo_wedding: { img: "photo_wedding", w: 32, h: 32, top: 0, bottom: 30 },
    guestbook: { img: "guestbook", w: 32, h: 32, top: 12, bottom: 23 }, // 来場者ノート
    noticeboard: { img: "noticeboard", w: 64, h: 64, top: 5, bottom: 62, solid: [48, 8] }, // 掲示板(ガリ版刷りの文化祭のビラ、献立表、消灯時刻)
    photo_fighter: { img: "photo_fighter", w: 32, h: 32, top: 0, bottom: 30 },
    art_fuji: { img: "art_fuji", w: 32, h: 32, top: 4, bottom: 23 },
    art_moon: { img: "art_moon", w: 32, h: 32, top: 4, bottom: 23 },
    art_ginkgo: { img: "art_ginkgo", w: 32, h: 32, top: 4, bottom: 23 },
    art_blob: { img: "art_blob", w: 32, h: 32, top: 4, bottom: 23 },
    art_self: { img: "art_self", w: 32, h: 32, top: 4, bottom: 23 },
    art_group: { img: "art_group", w: 32, h: 32, top: 4, bottom: 23 },
    art_banana: { img: "art_banana", w: 32, h: 32, top: 4, bottom: 23 },
    art_squad: { img: "art_squad", w: 32, h: 32, top: 4, bottom: 23 },
    art_roof: { img: "art_roof", w: 32, h: 32, top: 4, bottom: 23 },
    d_family: { img: "d_family", w: 96, h: 64, top: 17, bottom: 55, solid: [60, 14] },
    d_visitors: { img: "d_visitors", w: 64, h: 64, top: 4, bottom: 60 },
    tansu: { img: "tansu", w: 32, h: 64, top: 3, bottom: 61, solid: [28, 12] },
    futon: { img: "futon", w: 32, h: 64, top: 8, bottom: 56 },
    hibachi: { img: "hibachi", w: 32, h: 32, top: 6, bottom: 28, solid: [18, 8] },
    tricycle: { img: "tricycle", w: 32, h: 32, top: 5, bottom: 27 },
    kyodai: { img: "kyodai", w: 32, h: 48, top: 5, bottom: 47, solid: [22, 8] },
    stairs: { img: "stairs", w: 64, h: 64, top: 0, bottom: 64 },
    door: { img: "door", w: 32, h: 64, top: 10, bottom: 56 },
    bonsai_table1: { img: "bonsai_table1", w: 128, h: 48, top: 12, bottom: 45, solid: [124, 14] },
    bonsai_table2: { img: "bonsai_table2", w: 128, h: 48, top: 12, bottom: 45, solid: [124, 14] },
    bed_h: { img: "bed_h", w: 64, h: 54, top: 0, bottom: 53, solid: [58, 16] },
    d_bedman_h: { img: "d_bedman_h", w: 64, h: 54, top: 0, bottom: 53, solid: [58, 16] },
    cabinet_radio: { img: "cabinet_radio", w: 28, h: 55, top: 0, bottom: 54, solid: [24, 10] },
    bed_f: { img: "bed_f", w: 32, h: 64, top: 5, bottom: 59, solid: [26, 40] },
    cot: { img: "cot", w: 32, h: 32, top: 2, bottom: 32, solid: [20, 10] },
    d_uketsuke: { img: "d_uketsuke", w: 64, h: 64, top: 11, bottom: 54 },
    d_shateki: { img: "d_shateki", w: 64, h: 64, top: 5, bottom: 58, solid: [24, 10] },
    d_yakisoba: { img: "d_yakisoba", w: 64, h: 64, top: 4, bottom: 61, solid: [24, 10] },
    d_carver: { img: "d_carver", w: 48, h: 48, top: 4, bottom: 45, solid: [28, 10] }, // 畳の上で正座
    plane: { img: "plane", w: 128, h: 64, top: 8, bottom: 60, solid: [110, 18] },
    workbench: { img: "workbench", w: 96, h: 48, top: 10, bottom: 46, solid: [86, 14] },
    drums: { img: "drums", w: 96, h: 48, top: 10, bottom: 44, solid: [88, 12] },
    gondola: { img: "gondola", w: 160, h: 72, top: 14, bottom: 62, solid: [150, 20] },
    crew_hawk: { img: "crew_hawk", w: 32, h: 40, top: 0, bottom: 39, solid: [14, 8] },
    crew_wagtail: { img: "crew_wagtail", w: 30, h: 39, top: 0, bottom: 38, solid: [14, 8] },
    crew_rooster: { img: "crew_rooster", w: 30, h: 39, top: 0, bottom: 38, solid: [14, 8] },
    seat: { img: "seat", w: 48, h: 64, top: 4, bottom: 56, solid: [34, 14] },
    mummy: { img: "mummy", w: 48, h: 64, top: 2, bottom: 56, solid: [34, 14] },
    poppo_row: { img: "poppo_row", w: 40, h: 12, top: 1, bottom: 11 },
    bench: { img: "bench", w: 60, h: 26, top: 0, bottom: 25, solid: [56, 10] },
    clock: { img: "clock", w: 12, h: 29, top: 0, bottom: 28 },
    firebucket: { img: "firebucket", w: 28, h: 23, top: 0, bottom: 22, solid: [24, 8] },
    plant: { img: "plant", w: 18, h: 24, top: 0, bottom: 23, solid: [12, 6] },
    portrait: { img: "portrait", w: 32, h: 32, top: 2, bottom: 26 },
    d_wheel: { img: "d_wheel", w: 64, h: 64, top: 7, bottom: 58, solid: [26, 10] },
    d_bedman: { img: "d_bedman", w: 32, h: 64, top: 3, bottom: 62, solid: [26, 40] },
    d_band1: { img: "d_band1", w: 48, h: 64, top: 11, bottom: 61 },
    d_band2: { img: "d_band2", w: 48, h: 64, top: 8, bottom: 58 },
    d_band3: { img: "d_band3", w: 48, h: 64, top: 7, bottom: 57 },
    d_band4: { img: "d_band4", w: 48, h: 64, top: 7, bottom: 59 },
    d_band5: { img: "d_band5", w: 48, h: 64, top: 14, bottom: 54 },
    wx_bed: { img: "wx_bed", w: 48, h: 64, top: 4, bottom: 60, solid: [38, 44] },
    wx_chair: { img: "wx_chair", w: 32, h: 32, top: 3, bottom: 30, solid: [22, 10] },
    wx_gramophone: { img: "wx_gramophone", w: 32, h: 48, top: 2, bottom: 45, solid: [20, 10] },
    wx_lamp: { img: "wx_lamp", w: 32, h: 64, top: 5, bottom: 59, solid: [12, 6] },
    wx_teatable: { img: "wx_teatable", w: 32, h: 32, top: 3, bottom: 30, solid: [22, 10] },
    deskphoto: { img: "deskphoto", w: 32, h: 48, top: 5, bottom: 44, solid: [26, 10] },
    d_scope: { img: "d_scope", w: 64, h: 64, top: 8, bottom: 56, solid: [30, 12] },
  };

  // 掲示板: 自治会のガリ版刷りの文化祭のビラと、献立表・消灯時刻・尋ね人(調べるとアップ)
  function board(id, fx, fy) {
    return hat("noticeboard", fx, fy, {
      id,
      range: 44,
      interact(api) {
        api.show("v_board");
      },
    });
  }
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
  // 台紙の絵: 押した場所の枠にハンコ(屋台=1, 展示=2, 舞台=4 のビットで 8 通り)
  const cardImage = (api) => `v_card_${STAMPS.reduce((m, k, i) => m | (api.flag(`stamp.${k}`) ? 1 << i : 0), 0)}`;
  // 押すたびに台紙を見せる。押してある場所をもう一度調べても、今の台紙を見せる(押したかどうか確かめられる)
  function stamp(api, key, delayMs = 0) {
    api.setFlag(`stamp.${key}`);
    api.later(delayMs, () => api.show(cardImage(api)));
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
      y: row * T - 20,
      w: 48,
      h: 48,
      sortDy: 20,
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
        ctx.drawImage(im, -24, -24);
        ctx.restore();
      },
    };
  }

  // 松葉杖だけが歩いている(使っていた人は見えない)。杖を前について、からだを振り出す歩き方
  function crutchWalker(id, row, x0, x1, speed) {
    const S = 26; // ひと足の幅
    return {
      id,
      x: x0,
      y: row * T,
      w: 32,
      h: 48,
      sortDy: 0,
      dir: 1,
      update(dt, t) {
        const span = x1 - x0;
        const p = (t * speed) % (span * 2);
        this.dir = p < span ? 1 : -1;
        this.x = x0 + (p < span ? p : span * 2 - p);
        this.d = (p % S + S) % S;
      },
      draw(ctx, sx, sy, t, api) {
        const im = api.image("crutch");
        if (!im) return;
        // 杖の先の、脇からの前後のずれ: 地面についているあいだは後ろへ流れ、浮いたら前へ振り出す
        const d = this.d || 0;
        const stance = 0.7 * S;
        let rel;
        let lift = 0;
        if (d < stance) rel = 0.35 * S - d;
        else {
          const u = (d - stance) / (S - stance);
          rel = -0.35 * S + u * 0.7 * S;
          lift = Math.sin(u * Math.PI) * 2;
        }
        const ang = -Math.atan2(rel * this.dir, 40);
        const bob = d < stance ? -Math.sin((d / stance) * Math.PI) * 2 : 0;
        // 地面の影(杖の先と、見えない人の足もと)
        ctx.fillStyle = "rgba(40, 30, 20, 0.18)";
        ctx.beginPath();
        ctx.ellipse(sx, sy, 9, 3, 0, 0, Math.PI * 2);
        ctx.fill();
        for (const [dx, dy, dark] of [[3, -5, true], [0, 1, false]]) {
          ctx.save();
          ctx.translate(Math.round(sx + dx * this.dir), Math.round(sy - 40 + dy + bob));
          ctx.rotate(ang);
          if (dark) ctx.filter = "brightness(0.7)";
          ctx.drawImage(im, -6, -2 - lift);
          ctx.restore();
        }
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
        else if (r >= 16 && r <= 18 && c >= 7 && c <= 13) ch = "."; // 門を入った前庭(受付)
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
    triggers: [
      { id: "toHall", x: 8 * T, y: 4.6 * T, w: 2 * T, h: 0.8 * T, warp: { map: "hall", spawn: "south" } },
      // 門(来たところ)から、懲罰空間へ戻る
      { id: "leave", x: 7.5 * T, y: 19.35 * T, w: 3 * T, h: T, run: (api) => api.exit() },
    ],
    drawOverlay(ctx, ox, oy, t) {
      bunting(ctx, ox, oy, 3 * T, 4.2 * T, 3.5 * T, 17.5 * T, t);
      bunting(ctx, ox, oy, 15 * T, 4.2 * T, 14.5 * T, 17.5 * T, t);
      bunting(ctx, ox, oy, 2 * T, 8.5 * T, 16 * T, 8.5 * T, t);
      bunting(ctx, ox, oy, 2 * T, 12.5 * T, 16 * T, 12.5 * T, t);
    },
    objects: [
      hat("facade", 9.5 * T, 5 * T), // 玄関が 9 列目の中央に来る
      board("board_gate", 7 * T, 9.3 * T), // 中庭の奥、病棟への道の脇の掲示板(正面から見える)
      hat("ginkgo_big", 9 * T, 12.6 * T), // 中庭の真ん中の大銀杏
      hat("ginkgo", 1.2 * T, 7 * T),
      hat("ginkgo", 16.8 * T, 7.4 * T),
      hat("ginkgo", 1.4 * T, 17 * T),
      hat("ginkgo", 16.6 * T, 16.8 * T),
      hat("arch", 9 * T, 19.6 * T, { sortDy: 60 }),
      // 受付: 門を入ってすぐ、道の右わきの机。道を歩いてくると正面に向かい合う
      hat("uketsuke", 11.7 * T, 17.7 * T),
      // 来場者ノート(かすれた縦書き。宇宙海軍の部隊名がほのかに読める)
      hat("guestbook", 11.3 * T, 17.1 * T, {
        id: "guestbook",
        sortDy: 30,
        iy: 30,
        range: 40,
        interact(api) {
          api.show("v_guestbook");
        },
      }),
      dead("d_uketsuke", "uketsuke", 12.2 * T, 16.9 * T, "v_uketsuke", null, {
        sortDy: 20,
        range: 64, // 受付の机ごしに話しかける
        interact(api) {
          if (!api.flag("card")) {
            api.show("v_uketsuke", () => {
              api.setFlag("card");
              api.giveItem("スタンプ台紙");
              api.show(cardImage(api)); // もらった台紙
            });
          } else if (stampCount(api) === STAMPS.length && !api.flag("prize")) {
            api.show(cardImage(api), () => {
              api.setFlag("prize");
              api.giveItem("おたかぽっぽ"); // スタンプの特典: 展示で彫られていたのと同じ、小さな一刀彫
            });
          } else {
            api.show("v_uketsuke", () => api.show(cardImage(api))); // 今の台紙
          }
        },
      }),
      hat("yakisoba", 4.5 * T, 11 * T),
      dead("d_yakisoba", "yakisoba", 6.2 * T, 11.6 * T, "v_yakisoba"),
      hat("wataame", 4.5 * T, 15 * T),
      // 祭に来ていた市民: 綿あめを持った子と母
      dead("d_visitors", "visitors", 6.6 * T, 15.2 * T, "v_wataame"),
      hat("shateki", 13 * T, 11 * T),
      dead("d_shateki", "shateki", 15.6 * T, 11.7 * T, "v_stall", (api) => stamp(api, "stall")),
      racer("racer1", 14.1, 40, 90),
      crutchWalker("crutches", 15.3, 8 * T, 12.5 * T, 12),
    ],
  };

  // 手前(南)のガラス窓から、床に落ちる夕日の帯。西日なので右上へ斜めにのびる
  function southLight(ctx, ox, oy, x0, x1, yWall) {
    ctx.fillStyle = "rgba(255, 196, 120, 0.13)";
    for (let x = x0 + 8; x < x1 - T; x += 2 * T) {
      ctx.beginPath();
      ctx.moveTo(x + ox, yWall + oy);
      ctx.lineTo(x + 1.3 * T + ox, yWall + oy);
      ctx.lineTo(x + 2.1 * T + ox, yWall - 1.6 * T + oy);
      ctx.lineTo(x + 0.8 * T + ox, yWall - 1.6 * T + oy);
      ctx.closePath();
      ctx.fill();
    }
  }

  // ---- 大広場(建物に入ってすぐ。舞台、客席の車椅子、作品展示、談話のテレビ。右へ進むと廊下) ----
  // マップチップに揃える: 物の中心は升目の中心、足もとは升目の境目に置く
  // 談話のすみのテレビ(最初は消えている)。調べるたびに入/切、つけると画面を見る
  let tvOn = false;
  const TV = hat("tv", 13.5 * T, 3 * T, {
    id: "tv",
    range: 40,
    interact(api) {
      tvOn = !tvOn;
      if (tvOn) api.later(300, () => api.show("v_tv"));
    },
  });
  Object.defineProperty(TV, "img", { get: () => (tvOn ? "tv_on" : "tv_off") });

  const HALL = {
    tile: T,
    bg: "#1c1411",
    tintMul: "#f0c09a",
    tint: "rgba(255, 150, 70, 0.08)",
    map: [
      "UVUVUUUUUUUUVUVU",
      "LvLvLLLLLLLLvLvL",
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
      // 腰板と漆喰の壁に、文化祭の紙の輪飾り。北の外壁なので上げ下げ窓がある
      U: { solid: true, img: "aw_g", crop: [0, 0], lowerOf: ["ward"] },
      L: { solid: true, img: "aw_g", crop: [0, 32], lowerOf: ["ward"] },
      V: { solid: true, img: "aw_wg", crop: [0, 0], lowerOf: ["ward"] },
      v: { solid: true, img: "aw_wg", crop: [0, 32], lowerOf: ["ward"] },
      ".": { wang: "ward", lowerOf: ["ward"] },
    },
    wang: { ward: { img: "wang_ward", size: 32, lookup: WANG16 } },
    drawGround(ctx, ox, oy) {
      southLight(ctx, ox, oy, T, 15 * T, 11 * T); // 玄関の両わきの窓から
    },
    spawns: {
      south: { x: 8 * T, y: 10.4 * T, facing: "north" },
      east: { x: 15 * T, y: 8 * T, facing: "west" },
    },
    triggers: [
      { id: "toYard", x: 7 * T, y: 11.3 * T, w: 2 * T, h: T, warp: { map: "yard", spawn: "door" } },
      { id: "toWard", x: 15.4 * T, y: 7 * T, w: T, h: 2 * T, warp: { map: "watari", spawn: "west" } },
    ],
    objects: [
      hat("stage", 8 * T, 5 * T),
      // 舞台の楽団(思い出の絵と同じ5人): アコーディオン、マンドリン、車椅子の大太鼓、ギター、歌
      ...[
        ["d_band1", "band1", 5],
        ["d_band2", "band2", 6.5],
        ["d_band3", "band3", 8],
        ["d_band4", "band4", 9.5],
        ["d_band5", "band5", 11],
      ].map(([kind, id, c], i, all) =>
        dead(kind, id, c * T, 4.6 * T, "v_stage", (api) => {
          stamp(api, "stage", 2800); // 掛け声のあとで台紙
          hiHeyWin(api, [id, ...all.map((b) => b[1]).filter((b) => b !== id)]);
        }, { sortDy: 60, iy: 60, range: 56 })
      ),
      // 客席: 車椅子を一列に
      // 客席: 舞台のほうを向いた車椅子(こちらからは背中が見える)
      ...[5, 6.5, 8, 9.5, 11].map((c) => hat("wheelchair_back", c * T, 7.2 * T)),
      // 作品展示: 白い布を掛けた長机に、盆栽を並べる
      hat("bonsai_table1", 3 * T, 9.3 * T),
      hat("bonsai_table2", 3 * T, 10.9 * T),
      // 作りかけのおたかポッポ(手すさび)が並ぶ台
      // (彫っていた人は、廊下の奥の自分の部屋にいる)
      hat("exhibit2", 11.5 * T, 9.5 * T, {
        id: "exhibit2",
        range: 36,
        interact(api) {
          api.mutter("ちゃん");
          stamp(api, "exhibit");
        },
      }),
      board("board_hall", 2.3 * T, 3.3 * T), // 大広場の奥の壁ぎわの掲示板
      // 談話のすみのテレビ。調べるたびに電源が入/切。つけると南極のバナナ農園の中継
      TV,
    ],
  };

  // 畳を敷く(横長の畳を、段ごとにずらして)
  function tatami(ctx, x0, y0, cols, rows) {
    const w = cols * T;
    const h = rows * T;
    ctx.fillStyle = "#c2a86e";
    ctx.fillRect(x0, y0, w, h);
    ctx.fillStyle = "rgba(120, 96, 50, 0.25)";
    for (let x = x0 + 1; x < x0 + w; x += 3) ctx.fillRect(x, y0, 1, h); // い草の目
    ctx.fillStyle = "#3d5238";
    for (let r = 0; r < rows; r++) {
      const y = y0 + r * T;
      ctx.fillRect(x0, y, w, 2);
      for (let x = x0 + (r % 2 ? T : 0); x <= x0 + w; x += 2 * T) ctx.fillRect(Math.min(x, x0 + w - 2), y, 2, T);
    }
    ctx.fillRect(x0, y0 + h - 2, w, 2);
  }

  const wallPhoto = (kind, x, vignette) =>
    hat(kind, x, 1.3 * T, {
      id: kind,
      sortDy: -40,
      iy: 20,
      range: 40,
      interact(api) {
        api.show(vignette);
      },
    });
  // ---- 渡り廊下(大広場から東の病棟へ。屋根付きで、両側は手すりごしに中庭の草地) ----
  const WATARI_W = 9;
  const WATARI = {
    tile: T,
    bg: "#1c1411",
    tintMul: "#f2b48a",
    tint: "rgba(255, 150, 70, 0.10)",
    map: ["G".repeat(WATARI_W), "R".repeat(WATARI_W), ".".repeat(WATARI_W), ".".repeat(WATARI_W), "R".repeat(WATARI_W), "G".repeat(WATARI_W)],
    legend: {
      G: { wang: "yard", solid: true, lowerOf: ["ward"] },
      R: { wang: "ward", solid: true, lowerOf: ["ward"] },
      ".": { wang: "ward", lowerOf: ["ward"] },
    },
    wang: {
      yard: { img: "wang_yard", size: 32, lookup: WANG16 },
      ward: { img: "wang_ward", size: 32, lookup: WANG16 },
    },
    drawGround(ctx, ox, oy, img) {
      const W = WATARI_W * T;
      // 屋根の影(床の上だけ、少し暗く)と、西日の差し込み
      ctx.fillStyle = "rgba(40, 24, 16, 0.18)";
      ctx.fillRect(ox, T + oy, W, 4 * T);
      southLight(ctx, ox, oy, 0, W, 5 * T);
      // 手すり(北と南): 柱と横木の絵を、2マスごとに並べる
      const rail = typeof img === "function" && img("rail");
      if (rail) {
        for (const y of [T - 2, 4 * T - 14]) {
          for (let x = 0; x < W; x += rail.width) {
            const w = Math.min(rail.width, W - x); // 端ではみ出さないように切る
            ctx.drawImage(rail, 0, 0, w, rail.height, x + ox, y + oy, w, rail.height);
          }
        }
      }
    },
    spawns: {
      west: { x: 0.8 * T, y: 3 * T, facing: "east" },
      east: { x: (WATARI_W - 0.8) * T, y: 3 * T, facing: "west" },
    },
    triggers: [
      { id: "toHall", x: -T, y: 2 * T, w: 1.8 * T, h: 2 * T, warp: { map: "hall", spawn: "east" } },
      { id: "toWard", x: (WATARI_W - 0.8) * T, y: 2 * T, w: 1.8 * T, h: 2 * T, warp: { map: "ward", spawn: "west" } },
    ],
    objects: [],
  };

  // 廊下の作品展: 患者たちの絵と、写真
  const CORRIDOR_ARTS = [["fuji", 1.4], ["moon", 6.6], ["ginkgo", 9.4], ["roof", 14.6], ["blob", 17.4], ["self", 22.6], ["group", 25.4], ["banana", 30.6], ["squad", 33.4]];
  // ---- 廊下(個室のドアと、絵や写真の展示が並ぶ。途中に詰所、突き当たりに屋上への階段) ----
  // 病棟の片廊下: 北側に個室が幅8マス(内法7マス+仕切り)で並び、ドアは各部屋の中央。南側は一面のガラス窓
  const WARD_W = 52;
  const ROOM_MOD = 8;
  const DOORS = { sick: 4, window: 12, room1: 20, room2: 28, workshop: 36, carver: 44 }; // ドアの列
  const STAIR_C = 49; // 突き当たりの階段(2マス)
  const wardWallRow = (a, b) => {
    let r = "";
    for (let c = 0; c < WARD_W; c++) {
      if (c === WARD_W - 1) r += "X";
      else if (c === STAIR_C || c === STAIR_C + 1) r += "O";
      else if (c % ROOM_MOD === 0) r += b; // 部屋の仕切りの柱
      else r += a;
    }
    return r;
  };
  const WARD = {
    tile: T,
    bg: "#1c1411",
    tintMul: "#f0c09a",
    tint: "rgba(255, 150, 70, 0.08)",
    map: [
      wardWallRow("U", "P"),
      wardWallRow("L", "p"),
      "." + ".".repeat(WARD_W - 2) + "X",
      "." + ".".repeat(WARD_W - 2) + "X",
      "X" + ".".repeat(WARD_W - 2) + "X",
      "X".repeat(WARD_W),
    ],
    legend: {
      X: { solid: true, color: "#2a1d17", lowerOf: ["ward"] },
      // 奥の壁は個室との間の内壁(窓はない。外が見えるのは個室の窓と、手前(南)のガラス窓)
      U: { solid: true, img: "aw_g", crop: [0, 0], lowerOf: ["ward"] },
      L: { solid: true, img: "aw_g", crop: [0, 32], lowerOf: ["ward"] },
      P: { solid: true, img: "aw_pg", crop: [0, 0], lowerOf: ["ward"] },
      p: { solid: true, img: "aw_pg", crop: [0, 32], lowerOf: ["ward"] },
      O: { solid: true, color: "#1a120d", lowerOf: ["ward"] }, // 階段の口
      ".": { wang: "ward", lowerOf: ["ward"] },
    },
    wang: { ward: { img: "wang_ward", size: 32, lookup: WANG16 } },
    // 廊下の端を閉じる: 突き当たりの側壁、大広場への入口の枠、手前の壁の見切り
    drawGround(ctx, ox, oy) {
      const wallTop = (x, y, w, h) => {
        ctx.fillStyle = "#3a261b";
        ctx.fillRect(x + ox, y + oy, w, h);
        ctx.fillStyle = "#7a5638";
        if (w < h) ctx.fillRect(x + ox + (x > T ? 0 : w - 2), y + oy, 2, h);
        else ctx.fillRect(x + ox, y + oy, w, 2);
      };
      const E = (WARD_W - 1) * T;
      southLight(ctx, ox, oy, 0, E, 5 * T);
      wallTop(E, 0, 8, 5 * T + 8); // 突き当たりの側壁
      wallTop(0, 5 * T, E + 8, 8); // 手前の見切り
      wallTop(T - 8, 4 * T, 8, T + 8); // 入口の下側の壁
      // 入口の枠(柱と鴨居)
      ctx.fillStyle = "#5b3d2a";
      ctx.fillRect(T - 8 + ox, 2 * T - 6 + oy, 8, 6);
      ctx.fillRect(T - 8 + ox, 4 * T - 4 + oy, 8, 4);
      ctx.fillStyle = "rgba(0, 0, 0, 0.25)"; // 大広場のほうへ落ちる影
      ctx.fillRect(ox, 2 * T + oy, T - 8, 2 * T);
    },
    spawns: Object.assign(
      { west: { x: 1 * T, y: 3.4 * T, facing: "east" }, stairs: { x: (STAIR_C + 1) * T, y: 2.8 * T, facing: "south" } },
      Object.fromEntries(Object.entries(DOORS).map(([k, c]) => [k, { x: (c + 0.5) * T, y: 2.8 * T, facing: "south" }]))
    ),
    triggers: [
      { id: "toHall", x: -T, y: 2 * T, w: 1.5 * T, h: 2 * T, warp: { map: "watari", spawn: "east" } },
      // 個室のドア: 入ると部屋に切り替わる
      // 突き当たりの階段: 歩いて上がると屋上へ
      { id: "toRoof", x: (STAIR_C + 0.2) * T, y: 1.9 * T, w: 1.6 * T, h: 0.45 * T, warp: { map: "roof", spawn: "up" } },
      ...Object.entries(DOORS).map(([k, c]) => ({ id: `to_${k}`, x: (c + 0.1) * T, y: 1.9 * T, w: 0.8 * T, h: 0.45 * T, warp: { map: k, spawn: "door" } })),
    ],
    objects: [
      ...Object.values(DOORS).map((c) => hat("door", (c + 0.5) * T, 2 * T, { sortDy: -40 })),
      ...CORRIDOR_ARTS.map(([k, c]) => wallPhoto(`art_${k}`, (c + 0.5) * T, `v_art_${k}`)),
      // からの車椅子が、廊下を走っていた
      dead("d_wheel", "wheel", 6.5 * T, 4.9 * T, "v_wheel"),
      // 廊下の奥: 壁ぎわの長椅子、止まったままの柱時計、防火用水、葉蘭の鉢
      hat("bench", 38.9 * T, 2.9 * T),
      hat("clock", 40 * T + 3, 1.25 * T, { sortDy: -40 }),
      hat("firebucket", 42.5 * T, 2.85 * T),
      hat("plant", 46.6 * T, 2.85 * T),
      // 屋上への階段(壁の開口部)
      hat("stairs", (STAIR_C + 1) * T, 2 * T, { sortDy: -40 }),
    ],
  };

  // ---- 個室(ドアから入り、下の出口から廊下へ戻る)。floor: "tatami" | "wood" | "western"(和室を洋風に改装) ----
  function room(key, floor, objects, wallRow = "PWWWPWWWP") {
    const western = floor === "western";
    const wood = floor === "wood" || western;
    const wall = western ? "rwallx" : wood ? "aw" : "rwall";
    return {
      tile: T,
      bg: "#1c1411",
      tintMul: "#f0c09a",
      tint: "rgba(255, 150, 70, 0.08)",
      map: [wallRow, wallRow.toLowerCase(), "X.......X", "X.......X", "X.......X", "X.......X", "XXXX.XXXX"],
      legend: {
        X: { solid: true, color: "#2a1d17", lowerOf: ["ward"] },
        P: { solid: true, img: `${wall}_p`, crop: [0, 0], lowerOf: ["ward"] },
        p: { solid: true, img: `${wall}_p`, crop: [0, 32], lowerOf: ["ward"] },
        A: { solid: true, img: wall, crop: [0, 0], lowerOf: ["ward"] },
        a: { solid: true, img: wall, crop: [0, 32], lowerOf: ["ward"] },
        W: { solid: true, img: `${wall}_w`, crop: [0, 0], lowerOf: ["ward"] },
        w: { solid: true, img: `${wall}_w`, crop: [0, 32], lowerOf: ["ward"] },
        ".": wood ? { wang: "ward", lowerOf: ["ward"] } : { color: "#c2a86e" },
      },
      wang: { ward: { img: "wang_ward", size: 32, lookup: WANG16 } },
      drawGround(ctx, ox, oy, img) {
        if (!wood) tatami(ctx, T + ox, 2 * T + oy, 7, 4);
        const rug = western && typeof img === "function" && img("wx_rug");
        if (rug) ctx.drawImage(rug, 3 * T + ox, 3.1 * T + oy, 3 * T, 2 * T);
        ctx.fillStyle = "#6b4a33"; // 出口の敷居
        ctx.fillRect(4 * T + ox, 6 * T + oy, T, 4);
      },
      spawns: { door: { x: 4.5 * T, y: 5.4 * T, facing: "north" } },
      triggers: [{ id: "out", x: 4 * T, y: 6.4 * T, w: T, h: T, warp: { map: "ward", spawn: key } }],
      objects,
    };
  }
  // 病室: 壁ぎわのベッド、点滴スタンドの風鈴、酸素マスクの花瓶、×印の星図
  // 病室(洋室): 一枚絵と同じく、ベッドは窓と平行に並ぶ。星図は窓のない壁に
  const ROOM_SICK = room("sick", "wood", [
    hat("bed_h", 2.3 * T, 3.6 * T),
    // 床頭台の上のラジオ。金星の天気予報
    hat("cabinet_radio", 4.1 * T, 3.4 * T, {
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
    dead("d_bedman_h", "bedman", 5.9 * T, 3.6 * T, "v_bed"),
    hat("starchart", 7.45 * T, 1.45 * T, { sortDy: -40 }),
  ], "PWWWPWWAP");
  // 窓辺の部屋: 机の上のコックピットの写真(焦げたぼぎのマスコット)、ロッキングチェアのガイコツ、宇宙戦闘機の写真
  const ROOM_WINDOW = room("window", "wood", [
    // 机の上の写真: コックピット(焦げたぼぎのマスコットが下がっている)
    hat("deskphoto", 1.5 * T, 3.2 * T, {
      id: "charm",
      range: 34,
      interact(api) {
        api.show("v_cockpit");
      },
    }),
    // ロッキングチェアで、ゆっくり揺れている
    hat("d_scope", 4.5 * T, 4.4 * T, {
      id: "scope",
      img: null,
      range: 40,
      draw(ctx, sx, sy, t, api) {
        const im = api.image("d_scope");
        if (!im) return;
        const s = HS.d_scope;
        const a = Math.sin(t * 1.4) * 0.07;
        ctx.save();
        ctx.translate(sx, sy + s.bottom - s.h / 2);
        ctx.rotate(a);
        ctx.drawImage(im, -s.w / 2, -s.bottom, s.w, s.h);
        ctx.restore();
      },
      interact(api) {
        api.bubble("scope", "ぎい……　ぎい……", 2600);
      },
    }),
    wallPhoto("photo_fighter", 4.5 * T, "v_photo_fighter"),
  ]);
  // 義肢装具室: 木の義足が掛かったラック(叩くと木琴のように鳴る)、作りかけの機械の義手の作業台、義手のスタンド
  const ROOM_WORKSHOP = room("workshop", "wood", [
    hat("prosthetic_rack", 2 * T, 3 * T, {
      id: "legshelf",
      range: 40,
      interact(api) {
        api.bubble("legshelf", "ぽろん　ぽろん", 2200);
      },
    }),
    hat("workbench", 5 * T, 3 * T),
    hat("arm_stand", 7.5 * T, 3 * T),
  ]);
  // 家族の部屋: 卓袱台を囲む一家。箪笥、鏡台、三輪車
  // 木彫りの人の部屋(和室): 障子の窓辺で正座して、おたかポッポを彫っていた
  // 左は障子の窓、右は写真を掛けた壁(思い出の絵と同じ並び)
  const ROOM_CARVER = room("carver", "tatami", [
    hat("portrait", 6.5 * T, 1.3 * T, { sortDy: -40 }), // 壁の写真(若い頃の軍服)
    hat("poppo_row", 2.7 * T, 4.2 * T),
    dead("d_carver", "carver", 4.4 * T, 4.1 * T, "v_carver"),
  ], "PWWWPAAAP");
  const ROOM1 = room("room1", "tatami", [
    hat("tansu", 1.5 * T, 3 * T),
    hat("kyodai", 7.5 * T, 3 * T),
    dead("d_family", "family", 4.5 * T, 4 * T, "v_family"),
    hat("tricycle", 2.5 * T, 5 * T),
  ]);
  // 和室を西洋人が改装して住んでいた部屋: 板の床に絨毯、壁紙とレースのカーテン、真鍮のベッド、蓄音機。壁に結婚写真(宇宙軍の礼装と花嫁)
  const ROOM2 = room("room2", "western", [
    hat("wx_bed", 1.9 * T, 4 * T),
    hat("wx_lamp", 3.2 * T, 3 * T),
    hat("wx_teatable", 4.5 * T, 4.3 * T),
    hat("wx_chair", 5.4 * T, 4.3 * T), // テーブルのほうを向いた肘掛け椅子
    hat("wx_gramophone", 7.4 * T, 3.1 * T),
    wallPhoto("photo_wedding", 4.5 * T, "v_photo_wedding"),
  ]);

  // ---- 屋上(物干し台。望遠鏡、洗濯物。手すりから高原を見わたす) ----
  const ROOF = {
    tile: T,
    bg: "#1c1411",
    tintMul: "#f2b48a",
    tint: "rgba(255, 140, 60, 0.10)",
    map: [
      "SSSSSSSSSSSSSS",
      "SSSSSSSSSSSSSS",
      "SSSSSSSSSSSSSS",
      "X............X",
      "X............X",
      "X............X",
      "X............X",
      "X............X",
      "XXXXXXXXXXXXXX",
    ],
    legend: {
      S: { solid: true, color: "#e7a27a", lowerOf: ["ward"] },
      X: { solid: true, color: "#2a1d17", lowerOf: ["ward"] },
      ".": { wang: "ward", lowerOf: ["ward"] },
    },
    wang: { ward: { img: "wang_ward", size: 32, lookup: WANG16 } },
    drawGround(ctx, ox, oy, img) {
      const W = 14 * T;
      // 夕日が山なみの向こうへ落ちていく(高原の夕焼け)
      const sun = typeof img === "function" && img("sunset");
      if (sun) {
        const x0 = ox + (W - sun.width) / 2;
        ctx.drawImage(sun, 0, 0, 1, sun.height, ox, oy, x0 - ox, 3 * T); // 左右は端の色をのばす
        ctx.drawImage(sun, sun.width - 1, 0, 1, sun.height, x0 + sun.width, oy, W - sun.width - (x0 - ox), 3 * T);
        ctx.drawImage(sun, x0, oy, sun.width, 3 * T);
      }
      // 手すり
      ctx.fillStyle = "#5a3b28";
      ctx.fillRect(T + ox, 3 * T - 4 + oy, 12 * T, 4);
      for (let x = T; x <= 13 * T; x += 16) ctx.fillRect(x + ox, 3 * T - 4 + oy, 3, 14);
      // 階段の口
      ctx.fillStyle = "#1a120d";
      ctx.fillRect(T + ox, 7 * T + oy, T, T);
      ctx.fillStyle = "#4a3222";
      for (let y = 0; y < T; y += 6) ctx.fillRect(T + 2 + ox, 7 * T + y + oy, T - 4, 2);
    },
    spawns: { up: { x: 1.5 * T, y: 6.4 * T, facing: "north" } },
    triggers: [{ id: "down", x: T, y: 7.55 * T, w: T, h: 0.6 * T, warp: { map: "ward", spawn: "stairs" } }],
    objects: [
      // 物干し竿と洗濯物(生活の場)
      {
        x: 4.5 * T,
        y: 4.6 * T,
        w: 4 * T,
        h: 2 * T,
        sortDy: 16,
        solid: { w: 4 * T, h: 8, dy: 16 },
        draw(ctx, sx, sy, t) {
          ctx.fillStyle = "#4a3222";
          ctx.fillRect(sx - 2 * T, sy - 36, 3, 52);
          ctx.fillRect(sx + 2 * T - 3, sy - 36, 3, 52);
          ctx.fillStyle = "#8a8070";
          ctx.fillRect(sx - 2 * T, sy - 34, 4 * T, 2);
          const cloth = ["#f1ece0", "#dfe6ee", "#f1ece0", "#e8d9c4", "#f1ece0"];
          cloth.forEach((c, i) => {
            const sw = Math.round(Math.sin(t * 2 + i) * 2);
            ctx.fillStyle = c;
            ctx.fillRect(sx - 2 * T + 8 + i * 24 + sw, sy - 32, 18, 22 + (i % 2) * 6);
          });
        },
      },
      // 望遠鏡: 覗くと、月のまわりに輪
      hat("telescope", 10.5 * T, 4.5 * T, {
        id: "telescope",
        range: 36,
        interact(api) {
          api.show("v_moon");
        },
      }),
      // 手すりから見わたす: いまの高原の景色 → 文化祭の日の屋上の記憶 → 懲罰空間へ
      {
        id: "railing",
        x: 7 * T,
        y: 3.3 * T,
        w: 2 * T,
        h: 8,
        range: 44,
        interact(api) {
          // 景品(次の世界へのカギ)を持っていれば、屋上の記憶へ(断片の条件を満たす。帰りは門から)
          if (!api.hasItem("おたかぽっぽ") && !api.flag("prize")) { // 以前の版で景品をもらった人も通れるように
            api.show("v_view");
            return;
          }
          // いまの高原の景色だけ(文化祭の日の屋上からの絵は、廊下に掛けてある)
          api.show("v_view", () => {
            api.mutter("はい　へい　うぃん", 3000);
            api.clear();
          });
        },
      },
    ],
  };


  // ================================================================
  // 断片: 霞ヶ浦のエクラノプラン(晩秋の明け方)。廃兵院を終えると懲罰空間に現れる
  // 条件: 格納庫で地上ぼぎクルー(笹野一刀彫)にジャンプを教わる → 傾斜路の先から翼へ跳び乗る
  //       → 機体の上を歩いて乗降口へ → 機内を通って操縦席へ → ミイラさまの遊覧飛行 → 懲罰空間に帰る
  // 背景は docs/assets/kasumi の設計図と下絵(*_blockout.png)から生成
  // ================================================================
  const kGrid = (cols, rows, solidAt) => {
    const g = [];
    for (let r = 0; r < rows; r++) {
      let row = "";
      for (let c = 0; c < cols; c++) row += solidAt(c, r) ? "#" : ".";
      g.push(row);
    }
    return g;
  };
  const K_LEGEND = { "#": { solid: true }, ".": {} };
  const kImage = (key, w, h) => (ctx, ox, oy, img) => {
    const im = typeof img === "function" && img(key);
    if (im) ctx.drawImage(im, ox, oy, w, h);
  };
  // 床に立つ物の切り出し(fg_<map>.png の x0, y0, w, h)を、足もとの y(base)できーと前後させる
  // 2026-10-03、作者「重ね合わせみてね」。切り出しは docs/assets/kasumi/fg_kasumi.py
  const kFg = (img, x0, y0, w, h, base) => ({
    id: `fg${x0}_${y0}`,
    x: x0 + w / 2,
    y: base,
    w: 1,
    h: 1,
    draw(ctx, sx, sy, t, api) {
      const im = api.image(img);
      if (im) ctx.drawImage(im, x0, y0, w, h, sx - this.x + x0, sy - this.y + y0, w, h);
    },
  });
  const kWall = (x0, y0, x1, y1) => ({ id: `wall${x0}_${y0}`, x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: 1, h: 1, solid: { w: x1 - x0, h: y1 - y0 } });

  // A 蓮田のあぜ道(入口。北の門柱の先が基地跡)
  const K_LOTUS = {
    tile: T,
    bg: "#6b5f3e",
    tint: "rgba(255, 190, 150, 0.06)",
    map: kGrid(12, 14, (c) => c < 5 || c > 6),
    legend: K_LEGEND,
    drawGround: kImage("bg_lotus", 12 * T, 14 * T),
    spawns: {
      start: { x: 6 * T, y: 12.6 * T, facing: "north" },
      north: { x: 6 * T, y: 1.4 * T, facing: "south" },
    },
    triggers: [
      { id: "toShore", x: 5 * T, y: -T, w: 2 * T, h: 1.3 * T, warp: { map: "shore", spawn: "gate" } },
      { id: "leave", x: 5 * T, y: 13.6 * T, w: 2 * T, h: T, run: (api) => api.exit() },
    ],
    objects: [], // 案山子は背景の絵に描いてある(田の中なので歩いては行けない)
  };

  // B 基地跡の岸(背景は一枚絵。当たり判定は背景に合わせる)
  const SHORE_SOLID = (c, r) => {
    if (r <= 8 && !(c >= 15 && c <= 17 && r >= 8)) return true; // 湖(傾斜路の先端まで歩ける)
    if (r >= 17 && !(c === 15 || c === 16)) return true; // 塀と蓮田(門だけ通れる)
    if (c >= 1 && c <= 13 && r >= 9 && r <= 15) return true; // 格納庫
    if (c >= 19 && c <= 21 && r === 16) return true; // 衛兵所
    if (c >= 20 && c <= 23 && r === 13) return true; // 燃料ドラム
    if ((c === 25 || c === 26) && r === 14) return true; // 見張り台の脚
    return false;
  };
  const K_SHORE = {
    tile: T,
    bg: "#3a4a58",
    map: kGrid(32, 20, SHORE_SOLID),
    legend: K_LEGEND,
    drawGround: kImage("bg_shore", 32 * T, 20 * T),
    spawns: {
      gate: { x: 16 * T, y: 16.4 * T, facing: "north" },
      hangar: { x: 9 * T, y: 16.5 * T, facing: "south" },
      slip: { x: 16.5 * T, y: 9.6 * T, facing: "south" },
    },
    triggers: [
      { id: "toLotus", x: 15 * T, y: 17.2 * T, w: 2 * T, h: T, warp: { map: "lotus", spawn: "north" } },
      { id: "toHangar", x: 8 * T, y: 15.8 * T, w: 2.4 * T, h: 0.5 * T, warp: { map: "hangar", spawn: "door" } },
    ],
    onEnter() {
      hintB(false);
    },
    // 傾斜路の先端で北を向いて跳ぶと、エクラノプランの翼に跳び移る(渡り板は落ちている)
    onJump(api, p) {
      if (p.facing === "north" && p.x > 15 * T && p.x < 18 * T && p.y < 9.8 * T) {
        api.later(420, () => api.warp("wing", "land"));
      }
    },
    objects: [
      // 門(門柱 2 本と上の看板)、衛兵所、見張り台、吹き流しは、足もとの y できーと前後。門柱と吹き流しの根もと、右はしのドラム缶はふさぐ
      kFg("fg_shore", 463, 476, 96, 80, 553),
      kFg("fg_shore", 603, 489, 106, 68, 555),
      kFg("fg_shore", 799, 318, 78, 162, 478),
      kFg("fg_shore", 941, 318, 72, 136, 452),
      kWall(463, 540, 488, 556),
      kWall(533, 540, 559, 556),
      kWall(940, 444, 950, 454),
      kWall(764, 416, 786, 448),
      {
        id: "slipTip",
        x: 16.5 * T,
        y: 9.2 * T,
        w: 1,
        h: 1,
        range: 40,
        interact(api) {
          if (api.flag("jump")) api.mutter("……", 1400); // 跳べばとどく
          else api.bubble("slipTip", "とどかない", 1800);
        },
      },
    ],
  };

  // C 格納庫の中(地上ぼぎクルーが、今朝も整備している。ここでジャンプを教わる)
  // 当たり判定は背景の絵に合わせる(奥の壁、機体、燃料ドラム、木、整備台、ゴンドラ)
  const HANGAR_SOLID = (c, r) =>
    r <= 2 ||
    c === 0 ||
    c === 13 ||
    (r === 9 && !(c === 6 || c === 7)) ||
    (r === 3 && c >= 1 && c <= 10) ||
    (r === 4 && c >= 1 && c <= 11) || // 機体の模型とドラム缶の手前まで(うしろに回りこまない)
    (r === 6 && c >= 5 && c <= 7) ||
    (r === 7 && c >= 8 && c <= 12);
  const crewMember = (id, img, fx, fy, phase) =>
    Object.assign(hat(img, fx, fy), {
      id,
      bob: 0,
      update(dt, t) {
        this.hopping = this.hopUntil && t < this.hopUntil;
      },
      draw(ctx, sx, sy, t) {
        // 教える場面では、順番に跳んでみせる
        if (!this.hopUntil || t > this.hopUntil || t < this.hopFrom) return;
        const u = (t - this.hopFrom) / (this.hopUntil - this.hopFrom);
        this.y = this.baseY - Math.sin(u * Math.PI) * 14;
      },
    });
  const CREW = [
    crewMember("crew1", "crew_hawk", 5.3 * T, 5.6 * T, 0),
    crewMember("crew2", "crew_wagtail", 6.4 * T, 5.7 * T, 1),
    crewMember("crew3", "crew_rooster", 7.5 * T, 5.6 * T, 2),
  ];
  CREW.forEach((c) => (c.baseY = c.y));
  // ジャンプの習い方: クルーが順番に跳んでみせる → どのボタンで跳ぶかを出す → きーが自分で跳べたら覚える
  // どのボタンで跳ぶか: 最後にキーボードを使っていれば「Xキー」、画面をさわっていれば「Bボタン」
  let lastInputTouch = false;
  window.addEventListener("keydown", () => (lastInputTouch = false), true);
  window.addEventListener("touchstart", () => (lastInputTouch = true), { capture: true, passive: true });
  const jumpKey = () => (lastInputTouch ? "Bボタン" : "Xキー");
  const hintB = (on) => {
    const b = document.getElementById("actionBtnB");
    if (b) b.classList.toggle("hint", on);
  };
  const crewHop = (delay) => {
    const now = performance.now() / 1000 + delay;
    CREW.forEach((c, i) => {
      c.hopFrom = now + i * 0.55;
      c.hopUntil = c.hopFrom + 0.5;
    });
  };
  function teachJump(api) {
    crewHop(0);
    api.later(1900, () => {
      CREW.forEach((c) => (c.y = c.baseY));
      if (api.flag("jumpLearned")) return;
      api.setFlag("jump"); // ここから跳べる(まだ覚えてはいない)
      api.toast(`${jumpKey()}で　とんでみよう`, 8);
      hintB(true);
    });
  }
  function learnedJump(api) {
    if (api.flag("jumpLearned")) return;
    hintB(false);
    api.later(500, () => {
      crewHop(0); // クルーも一緒に跳ぶ
      api.setFlag("jumpLearned");
      api.learnAbility("jump"); // ここで習得。ほかのフィールドでも跳べるようになる
      api.toast(`ジャンプ（${jumpKey()}）`, 3.2);
    });
  }
  const K_HANGAR = {
    tile: T,
    bg: "#2a2622",
    tint: "rgba(255, 190, 150, 0.05)",
    map: kGrid(14, 10, HANGAR_SOLID),
    legend: K_LEGEND,
    drawGround: kImage("bg_hangar", 14 * T, 10 * T),
    spawns: { door: { x: 7 * T, y: 8.6 * T, facing: "north" } },
    triggers: [{ id: "out", x: 6 * T, y: 9.4 * T, w: 2 * T, h: T, warp: { map: "shore", spawn: "hangar" } }],
    onJump(api) {
      learnedJump(api);
    },

    objects: [
      // 木、整備台、ゴンドラは、足もとの y できーと前後
      kFg("fg_hangar", 318, 86, 74, 96, 178),
      kFg("fg_hangar", 156, 186, 102, 48, 231),
      kFg("fg_hangar", 266, 200, 150, 72, 258),
      // ドラム缶の上の波板の壁に、夏の日の集合写真(機体とパイロットと整備兵。黒い台紙)
      {
        id: "photo",
        img: "photo_summer",
        w: 22,
        h: 15,
        x: 8.4 * T,
        y: 2.6 * T,
        sortDy: -30,
        iy: 76, // 調べる場所はドラム缶の手前(ドラム缶のうしろへは回りこまない)
        range: 44,
        interact(api) {
          api.show("v_summer");
        },
      },
      {
        id: "bench",
        x: 6.4 * T,
        y: 7.1 * T,
        w: 1,
        h: 1,
        range: 52,
        interact(api) {
          teachJump(api); // 整備台のまわりで、跳んでみせてくれる
        },
      },
      ...CREW.map((c) =>
        Object.assign(c, {
          range: 44,
          interact(api) {
            api.bubble(c.id, "……", 1200);
            teachJump(api);
          },
        })
      ),
    ],
  };

  // C' エクラノプランの上(翼に跳び乗ってから、背中を歩いて乗降口へ。機首から尾翼まで歩ける)
  // 背景は設計図(全長24マス・翼幅12マス)から、ほかのマップと同じ斜め上から見た下絵を描いて生成。歩けるのは胴体と主翼の上だけ
  const WING_POLYS = [
    [[11, 6], [17, 6], [15.6, 1.5], [13.2, 1.5]], // 北の主翼(奥)
    [[11, 10], [17.9, 10], [17.9, 10.9], [15.6, 14.8], [13.2, 14.8]], // 南の主翼(手前、岸の側)。付け根の後ろのすみ(発射筒とジェットの間)から胴体の上へ上がれる
    [[6, 6], [22.5, 6], [22.5, 10], [6, 10]], // 胴体の上面(T字尾翼の下と、操縦席の窓には上がらない)
  ];
  // 背中の発射筒(一段高い筒)は歩けない
  // 南の列のいちばん後ろ(翼の付け根の上)は、翼から胴体へ上がる通り道として2マス分あける
  const WING_TUBES = [8, 11.1, 14.2].flatMap((x0) => [[x0, 6, x0 + 2.6, 6.8], [x0, 8.8, x0 === 14.2 ? 16.2 : x0 + 2.6, 9.6]]);

  const inPoly = (x, y, poly) => {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i];
      const [xj, yj] = poly[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const WING_SOLID = (c, r) =>
    !WING_POLYS.some((p) => inPoly(c + 0.5, r + 0.5, p)) ||
    WING_TUBES.some(([x0, y0, x1, y1]) => c + 0.5 > x0 && c + 0.5 < x1 && r + 0.5 > y0 && r + 0.5 < y1);
  // 機体の脇で、地上ぼぎクルーが直している(カン、カン)
  const repairCrew = (id, img, fx, fy, phase) =>
    hat(img, fx, fy, {
      id,
      range: 44,
      update(dt, t) {
        const u = (t + phase) % 1.3;
        this.y = this.baseY - (u < 0.12 ? 2 : 0);
      },
      draw(ctx, sx, sy, t) {
        const u = (t + phase) % 1.3;
        if (u < 0.1 || u > 0.75) return;
        const k = (u - 0.1) / 0.65;
        ctx.save();
        ctx.globalAlpha = 1 - k;
        ctx.font = "bold 10px sans-serif";
        ctx.textAlign = "center";
        ctx.lineWidth = 3;
        ctx.strokeStyle = "rgba(30, 30, 40, 0.8)";
        ctx.fillStyle = "#fff6d8";
        const ty = sy - this.h / 2 - 4 - k * 8;
        ctx.strokeText("カン", sx + 12, ty);
        ctx.fillText("カン", sx + 12, ty);
        ctx.fillStyle = "#ffe27a";
        ctx.fillRect(sx + 9, sy - 2, 2, 2);
        ctx.restore();
      },
      interact(api) {
        api.bubble(id, "カン", 900);
      },
    });
  const WING_CREW = [
    repairCrew("fix1", "crew_hawk", 19.6 * T, 9.7 * T, 0), // 南のジェットの付け根
    repairCrew("fix2", "crew_wagtail", 15.4 * T, 11.4 * T, 0.45), // 主翼の錆
    repairCrew("fix3", "crew_rooster", 6.7 * T, 7.6 * T, 0.8), // 尾翼の付け根
  ];
  WING_CREW.forEach((c) => (c.baseY = c.y));
  const K_WING = {
    tile: T,
    bg: "#6f8fa6",
    tint: "rgba(255, 190, 150, 0.05)",
    map: kGrid(28, 16, WING_SOLID),
    legend: K_LEGEND,
    drawGround: kImage("bg_wing", 28 * T, 16 * T),
    spawns: {
      land: { x: 14.4 * T, y: 13.6 * T, facing: "north" }, // 南の主翼の先
      hatch: { x: 16.4 * T, y: 8.1 * T, facing: "west" }, // 乗降口のわき
    },
    triggers: [{ id: "hatch", x: 17.2 * T, y: 7.55 * T, w: 0.7 * T, h: 0.9 * T, warp: { map: "cabin", spawn: "aft" } }],
    // 南の主翼の先から南へ跳ぶと、傾斜路にもどる
    onJump(api, p) {
      if (p.facing === "south" && p.y > 13 * T && p.x > 12.5 * T && p.x < 16.5 * T) {
        api.later(420, () => api.warp("shore", "slip"));
      }
    },
    objects: WING_CREW,
  };

  // C'' 機内(背中の乗降口から、はしごで胴体の中の通路へ。機関士席と通信士席の横を抜け、右へそのまま進むと操縦席)
  // 当たり判定は背景の絵に合わせる(奥の壁、酸素ボンベの架台、機関士の座席、通信士の腰掛け、ロッカー)
  const CABIN_SOLID = (c, r) =>
    r <= 2 ||
    r >= 7 ||
    ((r === 3 || r === 4) && (c === 3 || c === 4 || c === 5 || c === 6 || c === 9 || c === 12));
  const K_CABIN = {
    tile: T,
    bg: "#141414",
    map: kGrid(15, 8, CABIN_SOLID),
    legend: K_LEGEND,
    drawGround: kImage("bg_cabin", 15 * T, 8 * T),
    spawns: {
      aft: { x: 2 * T, y: 3.8 * T, facing: "south" }, // 後ろのはしごの下
      fore: { x: 13.6 * T, y: 5.5 * T, facing: "west" }, // 操縦席から出たところ(右端)
    },
    // 後ろのはしごは、歩いて触れるのではなく、調べて上る(入った直後に上を押したままでも、戻されない)
    // 前(右)はそのまま操縦席へ抜ける
    triggers: [{ id: "cockpit", x: 14.6 * T, y: 3 * T, w: T, h: 4 * T, warp: { map: "cockpit", spawn: "door" } }],
    objects: [
      { id: "ladderAft", x: 2 * T, y: 3.1 * T, w: 1, h: 1, range: 44, interact: (api) => api.warp("wing", "hatch") },
      // 酸素ボンベの架台、機関士の座席、通信機の台と腰掛け、ロッカーは、足もとの y できーと前後
      kFg("fg_cabin", 98, 30, 56, 122, 150),
      kFg("fg_cabin", 163, 90, 59, 76, 163),
      kFg("fg_cabin", 268, 30, 76, 136, 163),
      kFg("fg_cabin", 381, 8, 46, 148, 154),
    ],
  };

  // D 操縦席(左の機長席にミイラさま。右席にきー)
  const K_COCKPIT = {
    tile: T,
    bg: "#1d201f",
    // 背景の絵に合わせる: 計器盤と2つの座席の間(操縦桿の台の手前)と、床の乗降口のまわりだけ歩ける
    map: kGrid(10, 7, (c, r) => c === 0 || c === 9 || (r <= 5 && !(r === 5 && (c === 4 || c === 5)))),
    legend: K_LEGEND,
    drawGround: kImage("bg_cockpit", 10 * T, 7 * T),
    spawns: { door: { x: 5 * T, y: 5.5 * T, facing: "north" } },
    // 床の乗降口(下の段)に下りると外へ
    triggers: [{ id: "out", x: 3.6 * T, y: 6 * T, w: 2.8 * T, h: T, warp: { map: "cabin", spawn: "fore" } }],
    objects: [
      // 2 つの座席(左はミイラさまごと)は、足もとの y できーと前後
      kFg("fg_cockpit", 44, 70, 88, 128, 196),
      kFg("fg_cockpit", 188, 94, 90, 104, 196),
      // 左の機長席のミイラさま(背景に描いてある)。話しかけると遊覧飛行
      {
        id: "mummy",
        x: 2.8 * T,
        y: 5.6 * T,
        w: 1,
        h: 1,
        headY: 90,
        range: 70,
        interact(api) {
          // ミイラさまはロシア語(キリル文字)で話す。「こんにちは、小さな友だち。遊覧飛行をするかい？」はい / いいえ
          api.say(
            [
              {
                face: "face_mummy",
                text: "Здравствуй, маленький друг!\nХочешь совершить прогулочный полёт?",
                choices: ["Да", "Нет"],
              },
            ],
            (choice) => {
              if (choice === 0) api.warp("flight", "view");
            }
          );
        },
      },
    ],
  };

  // E 遊覧飛行: ① 飛び立つ多重スクロール(空・山なみ・水面) → ② 湖を一周する地図 → ③ キメの一枚絵 → 乗りこむ前の桟橋
  let flightT0 = 0;
  // 止まった機体が走り出して、3秒で巡航の速さになる(進んだ量)
  const runDist = (t) => (t < 3 ? (t * t * t) / 27 : 1 + (t - 3));
  const K_FLIGHT = {
    tile: T,
    bg: "#000",
    hidePlayer: true,
    map: kGrid(15, 10, () => false),
    legend: K_LEGEND,
    drawGround(ctx, ox, oy, img) {
      const t = performance.now() / 1000 - flightT0;
      const d = runDist(t);
      const get = (k) => (typeof img === "function" ? img(k) : null);
      const layer = (k, y, speed) => {
        const im = get(k);
        if (!im) return;
        const off = (d * speed) % im.width;
        for (let x = -off; x < 15 * T; x += im.width) ctx.drawImage(im, Math.round(x + ox), y + oy);
      };
      const sky = get("fl_sky");
      if (sky) ctx.drawImage(sky, ox, oy); // 空と朝日は動かない
      layer("fl_hills", 100, 12); // 遠い対岸の山なみ(ゆっくり)
      const wb = get("fl_wbase");
      if (wb) ctx.drawImage(wb, ox, 170 + oy); // 水面の色と朝日のきらめき(太陽の真下で動かない)
      const hl = get("fl_hills");
      if (hl) {
        // 水面に映る山なみ: 山と同じ速さで流れる(上下を返して薄く)
        const off = (d * 12) % hl.width;
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.scale(1, -1);
        for (let x = -off; x < 15 * T; x += hl.width) ctx.drawImage(hl, Math.round(x + ox), -(170 + oy) - 50, hl.width, 50);
        ctx.restore();
      }
      layer("fl_ripple", 170, 150); // さざ波だけが速く流れる
      layer("fl_mist", 160, 220);
      const ek = get("fl_ekrano");
      const lift = Math.min(1, t / 3) * 8; // 走り出して、湖面すれすれに浮く(高くは舞い上がれない)
      if (ek) ctx.drawImage(ek, 96 + Math.round(Math.sin(t * 0.7) * 6 * Math.min(1, t / 3)) + ox, 150 - Math.round(lift) + Math.round(Math.sin(t * 1.3) * 2) + oy);
      layer("fl_mist", 196, 300);
    },
    spawns: { view: { x: 7 * T, y: 5 * T, facing: "east" } },
    onEnter(api) {
      flightT0 = performance.now() / 1000;
      api.later(7000, () => api.warp("tour", "view"));
    },
    triggers: [],
    objects: [],
  };
  // 湖を一周(南岸の上空から北を見下ろす鳥瞰図。基地跡の傾斜路から出て、ぐるりと回って帰ってくる)
  // 画面(480×300)ちょうどの絵。機体は横から見た姿で、奥へ行くほど小さく
  let tourT0 = 0;
  const TOUR_TIME = 13;
  const K_TOUR = {
    tile: T,
    bg: "#000",
    hidePlayer: true,
    map: kGrid(15, 10, () => false), // 高さ320にしておくと、カメラが上端(0〜300)にそろう
    legend: K_LEGEND,
    drawGround(ctx, ox, oy, img) {
      const get = (k) => (typeof img === "function" ? img(k) : null);
      const lake = get("fl_lake");
      if (lake) ctx.drawImage(lake, ox, oy);
      const t = Math.min(1, (performance.now() / 1000 - tourT0) / TOUR_TIME);
      const u = t * t * (3 - 2 * t); // ゆっくり出て、ゆっくり帰る
      const a = Math.PI / 2 - u * Math.PI * 2; // 手前(南岸)から、右回りに奥へ、左から手前へ
      const x = 240 + Math.cos(a) * 170;
      const y = 178 + Math.sin(a) * 78; // 奥行きがつぶれて見える
      const ek = get("fl_ekrano");
      if (!ek) return;
      const s = 0.1 + ((y - 100) / 160) * 0.14; // 手前ほど大きい
      const east = Math.sin(a) >= 0; // 画面の右へ進んでいるか
      const w = ek.width * s;
      const h = ek.height * s;
      ctx.save();
      ctx.fillStyle = "rgba(60, 60, 90, 0.25)"; // 湖面すれすれなので、影がすぐ下にある
      ctx.beginPath();
      ctx.ellipse(Math.round(x + ox), Math.round(y + oy + h * 0.35), w * 0.45, Math.max(1.5, h * 0.12), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.translate(Math.round(x + ox), Math.round(y + oy));
      if (!east) ctx.scale(-1, 1); // 機首を進む向きへ
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(ek, -w / 2, -h / 2, w, h);
      ctx.restore();
    },
    spawns: { view: { x: 7 * T, y: 5 * T, facing: "east" } },
    onEnter(api) {
      tourT0 = performance.now() / 1000;
      api.later(TOUR_TIME * 1000 + 600, () =>
        api.show(
          "v_flight",
          () => {
            api.clear();
            api.warp("shore", "slip"); // 乗りこむ前の傾斜路にもどってくる
          },
          { full: true } // キメの一枚絵は画面いっぱいに
        )
      );
    },
    triggers: [],
    objects: [],
  };


  // ======== 南極のバナナ農園 ========
  // 今の南極・キングジョージ島。ぼぎたちが、人間のテレビ番組をまねて撮り続けている(見ている人はもういない)。
  // 条件: マンゴーを食べに来たきこりを、ちりんと一緒に追いかける → 氷の段々をジャンプで上り、マンゴーに届く → 一枚絵
  // 次の世界へのカギ: 道具「マンゴー」
  // 台詞や鳴き声はすべて仮(文面は作者が決める)。キャラクターの絵も仮(作者が決めて差し替える)

  // きこり: 近づくと、道すじの次の点へ逃げる。最後の点(マップの外)まで行くと、次のマップへ消える
  function kikoriRunner(route, goneFlag, shownIf, speed) {
    return {
      id: "kikori",
      img: "kikori",
      w: 32,
      h: 34,
      x: route[0][0] * T,
      y: route[0][1] * T,
      sortDy: 15,
      headY: 30,
      range: 50,
      i: 0,
      dir: 1,
      hidden: (api) => api.flag(goneFlag) || !shownIf(api),
      update(dt, t, api) {
        if (api.flag(goneFlag) || !shownIf(api)) return;
        const [tx, ty] = route[this.i].map((v) => v * T);
        const dx = tx - this.x;
        const dy = ty - this.y;
        const dist = Math.hypot(dx, dy);
        const p = api.player();
        if (dist < 3) {
          if (this.i === route.length - 1) {
            api.setFlag(goneFlag);
            return;
          }
          if (Math.hypot(p.x - this.x, p.y - this.y) < 96) {
            if (this.i === 0) api.bubble("kikori", "！", 900); // 仮
            this.i++;
          }
          return;
        }
        const step = Math.min(dist, speed * dt);
        this.x += (dx / dist) * step;
        this.y += (dy / dist) * step;
        if (Math.abs(dx) > 1) this.dir = dx > 0 ? -1 : 1; // 絵は左向き
      },
      interact(api) {
        api.bubble("kikori", "！", 900); // 仮
      },
      draw() {},
    };
  }
  // きこりの絵(走るときは跳ねる)。img の描画を止めて、向きと跳ねを付けて描く
  function drawKikori(o) {
    const base = o.img;
    o.img = null;
    o.draw = function (ctx, sx, sy, t, api) {
      const im = api.image(base);
      if (!im) return;
      const hop = Math.round(Math.abs(Math.sin(t * 14)) * 3);
      ctx.save();
      ctx.translate(sx, sy - hop);
      ctx.scale(this.dir || 1, 1);
      ctx.drawImage(im, -im.width / 2, -im.height / 2);
      ctx.restore();
    };
    o.shadow = { dy: 15, rx: 11, ry: 3 };
    return o;
  }

  // ちりん: 最初に近づくと、きーについてくる(きこりに執着している)
  function chirinFollower(home) {
    return {
      id: "chirin",
      img: null,
      w: 12,
      h: 44,
      x: home ? home[0] * T : 0,
      y: home ? home[1] * T : 0,
      sortDy: 22,
      headY: 40,
      range: 56,
      near(api) {
        if (api.flag("chirinJoined")) return;
        api.setFlag("chirinJoined");
        api.bubble("chirin", "ちりん", 1600);
      },
      hidden: (api) => !home && !api.flag("chirinJoined"),
      update(dt, t, api) {
        if (!api.flag("chirinJoined")) return;
        const p = api.player();
        if (this._fresh !== api) {
          this._fresh = api;
        }
        if (this._reset) {
          this.x = p.x - 20;
          this.y = p.y + 4;
          this._reset = false;
        }
        const k = Math.min(1, dt * 3);
        this.x += (p.x - 24 - this.x) * k;
        this.y += (p.y + 6 - this.y) * k;
      },
      draw(ctx, sx, sy, t, api) {
        const im = api.image("chirin");
        if (!im) return;
        const sway = Math.sin(t * 2.4) * 0.12;
        ctx.save();
        ctx.translate(sx, sy - 44 + Math.round(Math.sin(t * 1.7) * 2));
        ctx.rotate(sway);
        ctx.drawImage(im, -im.width / 2, 0);
        ctx.restore();
      },
    };
  }
  const bSprite = (id, img, fx, fy, w, h, text) => ({
    id,
    img,
    w,
    h,
    x: fx,
    y: fy - h / 2 + 4,
    sortDy: h / 2 - 4,
    headY: h - 6,
    solid: { w: w * 0.7, h: 12, dy: h / 2 - 8 },
    range: 52,
    interact(api) {
      api.bubble(id, text, 1600); // 仮
    },
  });
  const chirinEnter = (objs) => () => {
    const c = objs.find((o) => o.id === "chirin");
    if (c) c._reset = true;
  };

  // 前後の重なり: 背景の絵から切り出した木・小屋・看板などを、根もとの高さで、きーと前後を並べて描く。
  // きーが根もとより奥にいると、葉の後ろに隠れる。切り出しと数字は docs/assets/banana/blockout2.py が書き出す
  // B_FG の一件は [絵の中の x, y, 幅, 高さ, マップの x, y, 根もとの y]
  const B_FG = {
    shore: [[0,0,92,64,777,0,64],[93,0,85,79,537,0,79],[179,0,88,79,591,0,79],[268,0,60,82,0,0,82],[329,0,86,82,36,1,83],[416,0,71,74,214,9,83],[488,0,78,82,266,4,86],[567,0,75,69,499,17,86],[643,0,84,86,145,1,87],[728,0,68,74,99,14,88],[797,0,80,88,332,1,89],[878,0,86,83,659,6,89],[0,89,68,92,294,80,172],[69,89,79,99,619,86,185],[149,89,73,96,47,115,211],[223,89,85,101,499,116,217],[309,89,71,90,209,134,224]],
    farm: [[0,0,57,30,351,0,30],[58,0,38,30,858,0,30],[97,0,51,31,481,0,31],[149,0,55,31,682,0,31],[205,0,48,31,747,0,31],[254,0,57,31,805,0,31],[312,0,53,32,611,0,32],[366,0,49,33,0,0,33],[416,0,56,33,416,0,33],[473,0,62,34,224,0,34],[536,0,52,36,289,0,36],[589,0,54,36,551,0,36],[644,0,81,67,521,0,67],[726,0,92,67,578,0,67],[819,0,76,67,775,0,67],[896,0,67,68,210,0,68],[964,0,59,69,648,0,69],[0,70,80,73,8,0,73],[81,70,77,73,713,0,73],[159,70,52,70,844,70,140],[212,70,42,66,0,94,160],[255,70,70,82,80,88,170],[326,70,81,79,140,91,170],[408,70,86,89,5,82,171],[495,70,79,82,264,93,175],[575,70,137,69,521,127,196],[713,70,131,97,671,127,224],[845,70,42,71,854,223,294],[888,70,73,71,75,223,294],[0,168,73,83,137,211,294],[74,168,99,90,704,204,294],[174,168,73,80,9,215,295],[248,168,92,93,261,203,296],[341,168,88,90,776,207,297],[430,168,46,76,0,228,304],[477,168,70,80,331,313,393],[548,168,75,86,142,310,396],[624,168,79,88,648,308,396],[704,168,84,82,777,314,396],[789,168,83,82,196,315,397],[873,168,78,81,724,316,397],[0,262,77,87,262,311,398],[78,262,81,87,521,312,399],[160,262,67,59,487,355,414],[228,262,44,65,0,370,435],[273,262,57,74,839,367,441]],
    canal: [[0,0,52,30,237,0,30],[53,0,56,30,561,0,30],[110,0,45,31,0,0,31],[156,0,46,31,175,0,31],[203,0,51,31,493,0,31],[255,0,48,32,308,0,32],[304,0,53,33,619,0,33],[358,0,57,34,50,0,34],[416,0,55,34,114,0,34],[472,0,64,35,363,0,35],[537,0,57,35,433,0,35],[595,0,56,36,682,0,36],[652,0,41,38,855,0,38],[694,0,56,58,228,6,64],[751,0,75,92,37,16,108],[827,0,74,88,528,27,115],[902,0,81,99,650,19,118],[0,100,70,85,739,139,224],[71,100,74,85,540,158,243],[146,100,69,82,208,167,249],[216,100,40,62,0,254,316],[257,100,69,69,203,247,316],[327,100,68,72,273,244,316],[396,100,81,73,320,243,316],[478,100,63,63,463,253,316],[542,100,67,76,528,240,316],[610,100,69,65,594,251,316],[680,100,69,66,658,250,316],[750,100,62,59,721,257,316],[813,100,74,64,782,252,316],[888,100,48,69,848,247,316]],
    steps: [[0,0,43,63,0,129,192],[44,0,49,60,463,138,198],[94,0,151,175,147,53,228],[246,0,46,48,28,227,275],[293,0,48,43,437,238,281],[342,0,36,57,0,275,332],[379,0,40,61,472,278,339],[420,0,70,86,395,330,416],[491,0,70,85,39,337,422],[562,0,53,64,0,416,480],[616,0,48,64,464,422,486],[665,0,71,89,393,455,544],[737,0,60,77,72,479,556],[798,0,40,62,0,565,627],[839,0,44,57,468,576,633]],
  };
  const bFront = (img, list) =>
    list.map(([ax, ay, w, h, x0, y0, base]) => ({
      x: x0 + w / 2,
      y: base,
      draw(ctx, sx, sy, t, api) {
        const im = api.image(img);
        if (im) ctx.drawImage(im, ax, ay, w, h, sx - w / 2, sy - (base - y0), w, h);
      },
    }));

  // A 浜(入口。湾に突き出た桟橋から上がる。北の密林の切れ目の道の先が農園)
  // 「熱帯雨林に一日だけドカ雪が積もった」南極。マップの絵と当たり判定は docs/assets/banana/blockout2.py から
  const B_SHORE_OBJS = [chirinFollower(null), ...bFront("fg_shore", B_FG.shore)];
  const B_SHORE = {
    tile: T,
    bg: "#e8eef6",
    map: [
      "#############..#############",
      "#############..#############",
      "#############..#############",
      "......................######",
      "......................######",
      "..........#.........#.######",
      "...#...#.........#....######",
      "......................######",
      "#############..#############",
      "#############..#############",
      "#############..#############",
    ],
    legend: K_LEGEND,
    drawGround: kImage("bg_shore", 28 * T, 11 * T),
    snow: 2,
    spawns: {
      start: { x: 14 * T, y: 10.2 * T, facing: "north" },
      north: { x: 14 * T, y: 1.2 * T, facing: "south" },
    },
    triggers: [
      { id: "toFarm", x: 13 * T, y: -T, w: 2 * T, h: 1.3 * T, warp: { map: "farm", spawn: "south" } },
      { id: "leave", x: 13 * T, y: 10.75 * T, w: 2 * T, h: T, run: (api) => api.exit() },
    ],
    onEnter: chirinEnter(B_SHORE_OBJS),
    objects: B_SHORE_OBJS,
  };

  // B 第三バナナ農園(当たり判定は、下絵で描いたバナナの株の根もと・小屋・撮影の道具・看板)
  const B_FARM_GRID = [
    "##.....#####################",
    ".......#.........#.#.#...#..",
    ".#.....................#....",
    "............................",
    "#..........................#",
    ".#.#.#...#......#########...",
    ".....................####...",
    "............................",
    "............................",
    "##.#.#...#.............#.#.#",
    "............................",
    "............................",
    ".....#.#.#.#.....#...#.#.#..",
    "#..............##..........#",
  ];
  const B_FARM_OBJS = [
    drawKikori(kikoriRunner([[8, 8], [12.5, 8], [12.5, 3.2], [7, 3.2], [4.5, 1.2], [4.5, -1.5]], "fledFarm", () => true, 170)),
    chirinFollower([9.5, 8.6]),
    bSprite("kikikori", "kikikori", 16.6 * T, 7.6 * T, 47, 47, "……"),
    bSprite("goron", "goron", 20.2 * T, 7.8 * T, 40, 34, "……"),
    ...bFront("fg_farm", B_FG.farm),
  ];
  const B_FARM = {
    tile: T,
    bg: "#e8eef6",
    map: B_FARM_GRID,
    legend: K_LEGEND,
    drawGround: kImage("bg_farm", 28 * T, 14 * T),
    snow: 2,
    spawns: {
      south: { x: 14 * T, y: 12.6 * T, facing: "north" },
      north: { x: 4.5 * T, y: 1.4 * T, facing: "south" },
    },
    triggers: [
      { id: "toShore", x: 13 * T, y: 13.6 * T, w: 2 * T, h: T, warp: { map: "shore", spawn: "north" } },
      { id: "toCanal", x: 3 * T, y: -T, w: 3 * T, h: 1.3 * T, warp: { map: "canal", spawn: "south" } },
    ],
    onEnter: chirinEnter(B_FARM_OBJS),
    objects: B_FARM_OBJS,
  };

  // C 雪に埋もれかけた用水路(丸木橋で渡る)
  const B_CANAL_OBJS = [
    drawKikori(kikoriRunner([[7, 7.3], [12.9, 7.3], [12.9, 2.6], [19, 2.6], [25.5, 2.6], [25.5, -1.5]], "fledCanal", (api) => api.flag("fledFarm"), 230)),
    chirinFollower(null),
    ...bFront("fg_canal", B_FG.canal),
  ];
  const B_CANAL = {
    tile: T,
    bg: "#e8eef6",
    map: [
      "########################...#",
      "........#..................#",
      "............................",
      "..#..............#...#......",
      "############..##############",
      "############..##############",
      ".......................#....",
      "..................#.........",
      "............................",
      "###....#####################",
    ],
    legend: K_LEGEND,
    drawGround: kImage("bg_canal", 28 * T, 10 * T),
    snow: 2,
    spawns: {
      south: { x: 4.5 * T, y: 8.6 * T, facing: "north" },
      north: { x: 25.5 * T, y: 1.2 * T, facing: "south" },
    },
    triggers: [
      { id: "toFarm", x: 3 * T, y: 9.6 * T, w: 3 * T, h: T, warp: { map: "farm", spawn: "north" } },
      { id: "toSteps", x: 24 * T, y: -T, w: 3 * T, h: 1.3 * T, warp: { map: "steps", spawn: "south" } },
    ],
    onEnter: chirinEnter(B_CANAL_OBJS),
    objects: B_CANAL_OBJS,
  };

  // D 雪の棚田とマンゴーの丘。段の石垣は、手前で北を向いて跳ぶと上がれる(南を向いて跳ぶと下りる)
  // 歩ける所: 下の雪原(15〜19 行)、段 1 の上(11〜13 行)、段 2 の上(7〜9 行)。段 3 はマンゴーの木の下で上がれない
  const STEPS_GRID = [
    "################",
    "################",
    "################",
    "################",
    "################",
    "################",
    "################",
    "###...##.....###",
    "###..........###",
    "###..........###",
    "################",
    "##............##",
    "##............##",
    "##............##",
    "################",
    "#..............#",
    "#...........#..#",
    "#..#...........#",
    "#..............#",
    "#..............#",
  ];
  const B_STEPS_OBJS = [
    Object.assign(
      drawKikori({
        id: "kikori",
        img: "kikori",
        w: 32,
        h: 34,
        x: 9.2 * T,
        y: 8.2 * T,
        sortDy: 15,
        headY: 30,
        range: 56,
        dir: 1,
        hidden: (api) => !api.flag("fledCanal"),
        update() {},
        interact(api) {
          api.bubble("kikori", "！", 900); // 仮
        },
      }),
      {}
    ),
    chirinFollower(null),
    ...bFront("fg_steps", B_FG.steps),
  ];
  // きこりは木の下で、とどかないマンゴーに跳びつき続けている
  (() => {
    const k = B_STEPS_OBJS[0];
    const d0 = k.draw;
    k.draw = function (ctx, sx, sy, t, api) {
      const u = (t * 1.3) % 1;
      const lift = api.flag("gotMango") ? 0 : Math.round(Math.max(0, Math.sin(u * Math.PI * 2)) * 10);
      d0.call(this, ctx, sx, sy - lift, t, api);
    };
  })();
  const B_STEPS = {
    tile: T,
    bg: "#e8eef6",
    map: STEPS_GRID,
    legend: K_LEGEND,
    drawGround: kImage("bg_steps", 16 * T, 20 * T),
    snow: 2,
    spawns: {
      south: { x: 8 * T, y: 18.6 * T, facing: "north" },
    },
    triggers: [{ id: "toCanal", x: 7 * T, y: 19.6 * T, w: 2 * T, h: T, warp: { map: "canal", spawn: "north" } }],
    onEnter: chirinEnter(B_STEPS_OBJS),
    onJump(api, p) {
      const up = (y) => api.later(240, () => api.place(p.x, y));
      if (p.facing === "north") {
        if (p.y >= 15 * T && p.y < 16 * T && p.x > 2 * T && p.x < 14 * T) up(13.4 * T);
        else if (p.y >= 11 * T && p.y < 12 * T && p.x > 3 * T && p.x < 13 * T) up(9.4 * T);
        else if (p.y < 8.8 * T && p.x > 4.6 * T && p.x < 10 * T && !api.flag("gotMango") && api.flag("fledCanal")) {
          // マンゴーに届く → きこりが追いつき、かぶりつく(一枚絵)
          api.setFlag("gotMango");
          api.later(300, () => {
            api.giveItem("マンゴー");
            api.later(900, () => api.show("v_final", () => api.clear(), { full: true }));
          });
        }
      } else if (p.facing === "south") {
        if (p.y >= 13 * T && p.y < 14 * T) up(15.5 * T);
        else if (p.y >= 9 * T && p.y < 10 * T) up(11.5 * T);
      }
    },
    objects: B_STEPS_OBJS,
  };


  // ======== 荒川の鈴木商店 ========
  // 今の雨上がりの夕方、荒川区の下町(D73〜D76)。マップの絵と当たり判定は docs/assets/suzuki/blockout.py から
  // 条件: 店で伝票 → 印刷屋で荷札 → 単結晶(両端に穴の空いた透明な筒)の穴で荷札を結んで中へ(一枚絵)→ 上昇(成層圏、熱圏)→ 衛星軌道で
  // 筒の端の穴から出る → 流れ星(一枚絵)→ 夜、河川敷のクレーターの真ん中 → 店で納品書 → 都電で帰る
  const S_GRIDS = {
    stop: [
      "############...#############",
      "############...#############",
      "............................",
      "............................",
      "##########........##########",
      "###################.########",
      "############################",
      "############################",
      "############################",
      "############################",
    ],
    alley: [
      "############...#############",
      "############...#############",
      "############...#############",
      "############...#############",
      "############...#############",
      "############...#############",
      "############...#############",
      "....##......................",
      "............................",
      "############...#############",
      "############...#############",
      "############...#############",
      "############...#############",
      "############...#############",
      "............................",
      "............................",
    ],
    shop: [
      "################",
      "################",
      "#..............#",
      "#####......#####",
      "#####......#####",
      "#####......#####",
      "#....######....#",
      "#..............#",
      "####........####",
      "####........####",
      "####........####",
      "#######..#######",
    ],
    river: [
      "############################",
      "############################",
      "............................",
      "....####################....",
      "...######################...",
      "...######################...",
      "...######################...",
      "....####################....",
      "............................",
      "............................",
      "............................",
      "............................",
      "############...#############",
      "............................",
    ],
    crater: [
      "############################",
      "############################",
      "............................",
      "............................",
      "............................",
      "............................",
      "............................",
      "............................",
      "............................",
      "............................",
      "............................",
      "............................",
      "############...#############",
      "............................",
    ],
    orbit: [
      "############################",
      "############################",
      "############################",
      "############################",
      "############################",
      "##..........................",
      "##..........................",
      "############################",
      "############################",
      "############################",
    ],
  };
  const sMap = (key, cols, rows, extra) =>
    Object.assign({ tile: T, bg: "#2e2838", map: S_GRIDS[key], legend: K_LEGEND, drawGround: kImage(`bg_${key}`, cols * T, rows * T) }, extra);
  // 流れ星のあとは夜。町のマップに夜の色を重ねる
  const sNight = (cols, rows) => (ctx, ox, oy, t, api) => {
    if (!api.flag("fallen")) return;
    ctx.fillStyle = "rgba(14, 22, 64, 0.5)";
    ctx.fillRect(ox, oy, cols * T, rows * T);
  };
  const sSpot = (id, x, y, interact, extra) => Object.assign({ id, x, y, w: 1, h: 1, range: 44, headY: 40, interact }, extra);

  // A 都電の停留場(入口で出口。北の路地の先が町工場の路地)
  const S_STOP = sMap("stop", 28, 10, {
    drawOverlay: sNight(28, 10),
    spawns: {
      start: { x: 11 * T, y: 4.7 * T, facing: "north" },
      north: { x: 13.5 * T, y: 1.2 * T, facing: "south" },
    },
    triggers: [{ id: "toAlley", x: 12 * T, y: -T, w: 3 * T, h: 1.3 * T, warp: { map: "alley", spawn: "south" } }],
    objects: [
      // 都電は、納品書を持つまで乗れない(D75)
      sSpot("tram", 11 * T, 5.4 * T, (api) => {
        if (api.hasItem("納品書")) api.exit();
        else api.mutter("まだ帰れない。", 1600); // 仮
      }),
    ],
  });

  let sPrinting = false;
  // B 町工場と長屋の路地(北の階段の先が土手。入口はどれも南の小道に向く)
  const S_ALLEY = sMap("alley", 28, 16, {
    drawOverlay: sNight(28, 16),
    spawns: {
      south: { x: 13.5 * T, y: 15.2 * T, facing: "north" },
      north: { x: 13.5 * T, y: 1.2 * T, facing: "south" },
      shop: { x: 19.25 * T, y: 7.6 * T, facing: "south" },
    },
    triggers: [
      { id: "toStop", x: 12 * T, y: 15.75 * T, w: 3 * T, h: T, warp: { map: "stop", spawn: "north" } },
      // 流れ星のあとは、夜のクレーターの河川敷へ
      { id: "toRiver", x: 12 * T, y: -T, w: 3 * T, h: 1.3 * T, run: (api) => api.warp(api.flag("fallen") ? "crater" : "river", "south") },
    ],
    objects: [
      sSpot("shopDoor", 19.25 * T, 7.15 * T, (api) => api.warp("shop", "door")),
      // 印刷屋は無人。伝票を差しこむと、印刷機がひとりでに荷札を刷る(D75)
      sSpot("printer", 8.5 * T, 7.15 * T, (api) => {
        if (api.hasItem("荷札") || !api.hasItem("伝票") || sPrinting) return api.mutter("……", 1200); // 仮
        // 刷っているあいだにもう一度調べても、2 枚目は刷らない(2026-10-03、作者「荷札が2回でる」)
        sPrinting = true;
        api.bubble("printer", "ガシャン ガシャン", 1400); // 仮
        api.later(1500, () => {
          sPrinting = false;
          if (api.hasItem("荷札")) return;
          api.giveItem("荷札");
          api.show("v_nifuda");
        });
      }),
    ],
  });

  // C 鈴木商店の中(外より広い)。店番は鉄瓶(絵は仮、D70)。しゃべらず、怒ると湯気がふき出す
  const S_SHOP = sMap("shop", 16, 12, {
    drawOverlay: sNight(16, 12),
    bg: "#3a3230",
    spawns: { door: { x: 8 * T, y: 10.5 * T, facing: "north" } },
    triggers: [{ id: "out", x: 7 * T, y: 11.7 * T, w: 2 * T, h: T, warp: { map: "alley", spawn: "shop" } }],
    objects: [
      {
        id: "tetsubin",
        w: 32,
        h: 32,
        x: 8 * T,
        y: 5.9 * T,
        sortDy: 12,
        headY: 22,
        range: 56,
        interact(api) {
          if (api.flag("charred")) {
            // 真っ黒にこげたきーに、お湯を注ぐ → クリーム色にもどる
            api.bubble("tetsubin", "シューッ！", 1400); // 仮
            this._pourT0 = performance.now() / 1000;
            api.later(1500, () => api.setFlag("charred", false));
            return;
          }
          api.bubble("tetsubin", api.flag("fallen") ? "……" : "シューッ！", 1400); // 仮
          this._puff = 2;
        },
        // 怒っているあいだ、口から湯気(流れ星のあとは止む)
        draw(ctx, sx, sy, t, api) {
          // お湯を注ぐときは、鉄瓶がきーのほうへ傾き(0.3 秒)、注ぎ口からお湯が出て、注ぎ終わると戻る(2026-10-03、作者)
          const pe = this._pourT0 ? performance.now() / 1000 - this._pourT0 : 99;
          const pl0 = api.player();
          const side = pl0.x >= this.x ? 1 : -1; // 注ぎ口はきーのほう
          const tilt = pe < 1.9 ? side * 0.7 * Math.min(1, pe / 0.3, (1.9 - pe) / 0.3) : 0;
          const im = api.image("tetsubin");
          if (im) {
            ctx.save();
            ctx.translate(sx, sy + 14); // 底のまわりで傾ける
            ctx.rotate(tilt);
            if (side > 0) ctx.scale(-1, 1); // 絵の注ぎ口は左。きーが右なら左右を返す
            ctx.drawImage(im, -16, -30, 32, 32);
            ctx.restore();
          }
          if (pe < 1.5) {
            const pl = api.player();
            const tx = sx + (pl.x - this.x);
            const ty = sy + (pl.y - this.y) - 30;
            // 注ぎ口(傾いた鉄瓶の口の先)
            const ca = Math.cos(tilt);
            const sa = Math.sin(tilt);
            const lx = 9 * side;
            const ly = -14;
            const x0 = sx + lx * ca - ly * sa;
            const y0 = sy + 14 + lx * sa + ly * ca;
            ctx.fillStyle = "rgba(220, 240, 255, 1)";
            for (let k = 0; k < 18; k++) {
              const u = ((pe * 1.6 + k / 14) % 1);
              const x = x0 + (tx - x0) * u;
              const y = y0 + (ty - y0) * u - Math.sin(u * Math.PI) * 18;
              ctx.fillRect(Math.round(x), Math.round(y), 3, 4);
            }
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            for (let k = 0; k < 6; k++) {
              const u = (pe * 0.8 + k / 6) % 1;
              ctx.fillRect(Math.round(tx - 10 + k * 4), Math.round(ty - 4 - u * 24), 4, 4);
            }
          }
          if (api.flag("fallen")) return;
          ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
          const n = this._puff ? 6 : 3;
          for (let k = 0; k < n; k++) {
            const u = (t * 0.7 + k / n) % 1;
            const s = 2 + Math.floor(u * 3);
            ctx.fillRect(Math.round(sx + 10 + u * 8), Math.round(sy - 8 - u * 22), s, s);
          }
        },
      },
      // カウンターの紙: 流れ星の前は伝票、あとは納品書(宛先がにじんで読めない)
      sSpot(
        "counter",
        6.1 * T,
        6.4 * T,
        (api) => {
          if (api.flag("fallen")) {
            if (api.hasItem("納品書")) return;
            api.giveItem("納品書");
            api.clear();
            api.show("v_nouhin");
          } else if (!api.hasItem("伝票")) {
            api.giveItem("伝票");
            api.show("v_denpyo");
          }
        },
        { canInteract: (api) => (api.flag("fallen") ? !api.hasItem("納品書") : !api.hasItem("伝票")), range: 50 }
      ),
    ],
  });

  // D 土手と河川敷。単結晶は、両端が狭まった透明な円柱(作者)。両端に穴が空いている
  // 荷札を持って穴を調べると、荷札を結んで中へ入る → 一枚絵 → 上昇(成層圏、熱圏)→ 衛星軌道
  // 筒の中の絵を閉じると、暗転せずに、絵の上から上昇の場面へじかに重ねる(D91。前のマップを見せない)
  const sEnter = (api) => {
    api.setFlag("launched");
    api.show("v_inside", null, { full: true, into: { map: "rise", spawn: "view" } });
  };
  const sHole = (id, x) =>
    sSpot(id, x, 5.6 * T, sEnter, { range: 50, canInteract: (api) => api.hasItem("荷札") && !api.flag("launched") });
  const S_RIVER = sMap("river", 28, 14, {
    spawns: { south: { x: 13.5 * T, y: 13.3 * T, facing: "north" } },
    triggers: [{ id: "toAlley", x: 12 * T, y: 13.75 * T, w: 3 * T, h: T, warp: { map: "alley", spawn: "north" } }],
    objects: [sHole("holeW", 2.4 * T), sHole("holeE", 25.6 * T)],
  });
  // 上昇: 外から見る。単結晶は画面のまんなかに止まり、背景(荒川の町 → 夕焼けの雲 → 成層圏 → 熱圏 → 宇宙)が下へ流れる。
  // 手前の雲は空より速く流れる。はじめゆっくり、だんだん速く。軌道に出たら、筒の中の絵をもう一度見せる(作者)
  const RISE_DUR = 9;
  let riseT0 = 0;
  const S_RISE = {
    tile: T,
    bg: "#04060f",
    hidePlayer: true,
    map: Array(10).fill(".".repeat(15)),
    legend: K_LEGEND,
    drawGround(ctx, ox, oy, img) {
      const get = (k) => (typeof img === "function" ? img(k) : null);
      const t = Math.max(0, Math.min(RISE_DUR, performance.now() / 1000 - riseT0));
      const p = Math.pow(t / RISE_DUR, 1.7);
      const sky = get("rise_sky");
      const VWm = 15 * T;
      const VHm = 10 * T;
      if (!sky) return;
      const pos = (sky.height - VHm) * (1 - p);
      ctx.drawImage(sky, 0, Math.round(pos), VWm, VHm, ox, oy, VWm, VHm);
      // 手前の雲(空の雲の帯の高さを、1.5 倍の速さで通り過ぎる)
      const cl = get("rise_cloud");
      if (cl) {
        for (const [band, dx] of [[1360, 0], [1720, -170], [1900, 120]]) {
          const y = (band - pos) * 1.5 - VHm * 0.25;
          if (y > -cl.height && y < VHm) for (let x = dx - cl.width; x < VWm; x += cl.width) ctx.drawImage(cl, Math.round(x + ox), Math.round(y + oy));
        }
      }
      // 宇宙に出ると、下に地球のふちがせり上がる
      const ea = get("rise_earth");
      if (ea && p > 0.82) ctx.drawImage(ea, ox, Math.round(oy + VHm - ea.height * Math.min(1, (p - 0.82) / 0.18)));
      // 単結晶(透明な筒)と、中のきー。小さくゆれる
      const tube = get("rise_tube");
      const shake = Math.round(Math.sin(t * 23) * (1 + 1.5 * p));
      const cx = VWm / 2 + ox + shake;
      const cy = VHm / 2 + oy;
      const ki = get("ki");
      if (ki) ctx.drawImage(ki, 0, 2 * 64, 64, 64, Math.round(cx - 32), Math.round(cy - 26), 64, 64);
      if (tube) ctx.drawImage(tube, Math.round(cx - tube.width / 2), Math.round(cy - tube.height / 2));
    },
    spawns: { view: { x: 7 * T, y: 5 * T, facing: "east" } },
    onEnter(api) {
      // 筒の中の絵が薄くなりきってから(0.8 秒)、上がりはじめる
      riseT0 = performance.now() / 1000 + 0.8;
      api.later(RISE_DUR * 1000 + 1200, () => api.show("v_rise3", null, { full: true, into: { map: "orbit", spawn: "west" } }));
    },
    triggers: [],
    objects: [],
  };
  // 衛星軌道: 単結晶の中。透明な床を歩いて、右の端の穴から外へ出ると、宇宙をただよって落ち、流れ星になる
  // 右の穴から出ると、暗転せずに宇宙へ(船殻を見せ直さない。テンポを切らない)。左の穴からは出られない(流れ星の右下がりに合わせる)
  const sOut = (api) => {
    if (api.flag("fallen") || !api.flag("launched")) return;
    api.cut("space", "view");
  };
  // 宇宙を遊泳するきー。右の穴から出たときの画面(衛星軌道のマップの右端)とまったく同じ絵から始め、
  // 船殻は左上へ遠ざかって小さくなり、きーは右へただよいながら、引力に引かれてじわじわ右下へ落ちていく。最後は赤く光って流れ星の絵へ
  const SPACE_DUR = 9;
  let spaceT0 = 0;
  const ease = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
  const S_SPACE = {
    tile: T,
    bg: "#04060f",
    hidePlayer: true,
    map: Array(10).fill(".".repeat(15)),
    legend: K_LEGEND,
    drawGround(ctx, ox, oy, img) {
      const get = (k) => (typeof img === "function" ? img(k) : null);
      const t = Math.min(SPACE_DUR, performance.now() / 1000 - spaceT0);
      const VWm = 15 * T;
      const VHm = 300; // 画面の高さ(ドット)
      const CX = 28 * T - VWm; // 衛星軌道のマップの右端で、カメラが見ていた範囲
      const CY = 10 * T - VHm;
      const orb = get("bg_orbit");
      const sky = get("rise_sky");
      // 星空(ゆっくり上へ流れる = きーが落ちていく)
      const fall = ease((t - 2) / (SPACE_DUR - 2));
      if (sky) ctx.drawImage(sky, 0, Math.round(40 * fall), VWm, VHm, ox, oy, VWm, VHm);
      // カメラはきーを追って右へ動く(船殻と地球は左へ流れる)。きーは右下へ落ちていく
      const pan = 240 * ease((t - 0.8) / 5);
      // 地球: はじめは衛星軌道のマップの地球と同じ場所。落ちるにつれて大きく、上へ(遠いので、流れはゆっくり)
      if (orb) {
        const sx0 = CX, sy0 = 252, sw = VWm, sh = 10 * T - 252;
        const k = 1 + 1.4 * fall;
        const w = sw * k, h = sh * k;
        const ex = ox + (VWm - w) / 2 - pan * 0.35;
        const ey = oy + (sy0 - CY) - 120 * fall;
        ctx.fillStyle = "#2a5a9e"; // 地球の下の海(大きくなっても下が抜けないように)
        ctx.fillRect(Math.round(ex), Math.round(ey + h - 2), Math.round(w), VHm);
        ctx.drawImage(orb, sx0, sy0, sw, sh, Math.round(ex), Math.round(ey), Math.round(w), Math.round(h));
      }
      // 船殻: はじめは衛星軌道のマップと同じ大きさ・位置。左上へ遠ざかって小さくなり、消える
      const tube = get("rise_tube");
      const lv = ease(t / 3.2);
      if (tube && lv < 1) {
        const sc = 2 * (1 - 0.8 * lv); // rise_tube は半分の大きさなので 2 倍から
        const hx = ox + (27 * T - CX) - pan, hy = oy + (5 * T - CY); // 右の穴の位置
        const px = hx - 120 * lv, py = hy - 90 * lv;
        ctx.globalAlpha = 1 - ease((t - 2) / 1.4);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tube, Math.round(px - tube.width * sc + 6 * sc), Math.round(py - (tube.height * sc) / 2), Math.round(tube.width * sc), Math.round(tube.height * sc));
        ctx.globalAlpha = 1;
      }
      // 最初の一瞬は、衛星軌道のマップの絵そのものを重ねて、つなぎ目をなくす
      if (orb && t < 0.7) {
        ctx.globalAlpha = 1 - t / 0.7;
        ctx.drawImage(orb, CX, CY, VWm, VHm, ox, oy, VWm, VHm);
        ctx.globalAlpha = 1;
      }
      // きー: 穴を出たところから、右へただよい、だんだん右下へ落ちる
      const ki = get("ki");
      const x0 = ox + (26.8 * T - CX), y0 = oy + (6 * T - CY);
      const drift = ease(t / 3);
      const kx = x0 + 50 * drift + 110 * fall - pan + Math.sin(t * 1.1) * 4 * drift; // 右下がり(カメラが追う)
      const ky = y0 + 6 * drift + 90 * fall + Math.sin(t * 0.8) * 3 * drift;
      const glow = ease((t - (SPACE_DUR - 2.6)) / 2.2);
      if (glow > 0) {
        const gr = ctx.createRadialGradient(kx, ky - 8, 2, kx, ky - 8, 26 + 30 * glow);
        gr.addColorStop(0, `rgba(255, 240, 200, ${0.9 * glow})`);
        gr.addColorStop(0.4, `rgba(255, 140, 60, ${0.6 * glow})`);
        gr.addColorStop(1, "rgba(255, 80, 30, 0)");
        ctx.fillStyle = gr;
        ctx.fillRect(kx - 70, ky - 78, 140, 140);
      }
      if (ki) {
        ctx.save();
        ctx.translate(Math.round(kx), Math.round(ky - 8));
        ctx.rotate(0.9 * Math.max(0, t - 1.5) * (0.4 + 0.6 * fall)); // 穴を出てしばらくしてから、ゆっくり回りはじめる
        const walk = t < 0.6 ? 1 + (Math.floor(t * 10) % 6) : 0; // 出た瞬間は歩いている
        ctx.drawImage(ki, walk * 64, 2 * 64, 64, 64, -32, -64 + 17 + 8, 64, 64);
        ctx.restore();
      }
    },
    spawns: { view: { x: 7 * T, y: 4 * T, facing: "south" } }, // カメラが画面のいちばん上(oy = 0)に来る位置
    onEnter(api) {
      spaceT0 = performance.now() / 1000;
      // 流れ星 → 爆発(D91): ボタンを待たない。流れ星の絵から、流れ星の頭へ寄る絵を、だんだん短く切りかえる(1.3 → 0.6 → 0.3 → 0.15 秒)
      // → 白く光った裏で、夜の河川敷のクレーターへ(暗転しない)
      const HX = 212; // 流れ星の頭(v_fall の中のドット)
      const HY = 91;
      api.later(SPACE_DUR * 1000, () =>
        api.burst(
          [
            { img: "v_fall", sec: 1.6, z0: 1, z1: 1.12, cx: 160, cy: 96, fadeIn: 0.3 },
            { img: "v_fall", sec: 0.6, z0: 1.7, z1: 1.9, cx: HX + 4, cy: HY + 3 },
            { img: "v_fall", sec: 0.3, z0: 2.8, z1: 3.1, cx: HX + 4, cy: HY + 3 },
            { img: "v_fall", sec: 0.15, z0: 4.5, z1: 5, cx: HX + 3, cy: HY + 2 },
            { white: true, sec: 0.08 },
          ],
          () => {
            api.setFlag("fallen");
            api.setFlag("charred"); // 着地のあと、きーは真っ黒
            api.setFlag("landing");
            api.cut("crater", "center");
          }
        )
      );
    },
    triggers: [],
    objects: [],
  };
  const S_ORBIT = sMap("orbit", 28, 10, {
    bg: "#060814",
    spawns: { west: { x: 3 * T, y: 6 * T, facing: "east" } },
    triggers: [
      { id: "outE", x: 26.8 * T, y: 5 * T, w: 2.2 * T, h: 2 * T, run: sOut },
    ],
    objects: [],
  });
  // 夜の河川敷。単結晶が寝ていた所が、クレーターになっている。きーは、その真ん中にいる
  // 着地の爆発: 白い光、飛び散る土、広がる煙の輪(1.6 秒)
  let boomT0 = -1;
  const S_CRATER = sMap("crater", 28, 14, {
    bg: "#101830",
    onEnter(api) {
      if (api.flag("landing")) {
        // 白が引くと、もう火の玉が上がっている。画面がゆれ、煙が晴れるまで、きーは動かない(D91)
        api.setFlag("landing", false);
        boomT0 = performance.now() / 1000;
        api.shake(0.7, 7);
        api.freeze(1.9);
      }
    },
    drawOverlay(ctx, ox, oy) {
      if (boomT0 < 0) return;
      const e = performance.now() / 1000 - boomT0;
      if (e < 0 || e > 2.2) return;
      const cx = ox + 14 * T;
      const cy = oy + 5.8 * T;
      // 白い光(一瞬)
      if (e < 0.35) {
        ctx.fillStyle = `rgba(255, 250, 230, ${1 - e / 0.35})`;
        ctx.fillRect(ox - 20 * T, oy - 20 * T, 70 * T, 60 * T);
      }
      // 火の玉
      const a = Math.max(0, 1 - e / 1.6);
      const r = 30 + 120 * Math.min(1, e / 0.5);
      const gr = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
      gr.addColorStop(0, `rgba(255, 250, 210, ${a})`);
      gr.addColorStop(0.3, `rgba(255, 170, 60, ${0.9 * a})`);
      gr.addColorStop(0.7, `rgba(200, 70, 30, ${0.6 * a})`);
      gr.addColorStop(1, "rgba(120, 40, 20, 0)");
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      // 衝撃の輪(地面を走る)
      const rr = 40 + 420 * e;
      ctx.strokeStyle = `rgba(255, 230, 190, ${Math.max(0, 0.8 - e / 1.2)})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 6, rr, rr * 0.45, 0, 0, Math.PI * 2);
      ctx.stroke();
      // 立ちのぼる煙
      for (let k = 0; k < 7; k++) {
        const sx = cx + (k - 3) * 22;
        const sy = cy - 20 - 70 * e - (k % 2) * 10;
        const sr = 14 + 30 * e;
        ctx.fillStyle = `rgba(70, 60, 64, ${Math.max(0, 0.55 - e / 4)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
      // 飛び散る土くれ
      ctx.fillStyle = `rgba(80, 56, 38, ${Math.min(1, 2 - e)})`;
      for (let k = 0; k < 40; k++) {
        const ang = (k / 40) * Math.PI * 2 + k * 0.7;
        const sp = 120 + ((k * 37) % 110);
        const x = cx + Math.cos(ang) * sp * e;
        const y = cy + Math.sin(ang) * sp * 0.5 * e - 180 * e + 220 * e * e;
        ctx.fillRect(Math.round(x), Math.round(y), 4, 4);
      }
    },
    spawns: {
      center: { x: 14 * T, y: 5.8 * T, facing: "south" },
      south: { x: 13.5 * T, y: 13.3 * T, facing: "north" },
    },
    triggers: [{ id: "toAlley", x: 12 * T, y: 13.75 * T, w: 3 * T, h: T, warp: { map: "alley", spawn: "north" } }],
    objects: [],
  });


  // ======== 宝舟と首振りエンジン ========
  // 今の夜、欠けて輪のある月。名前のない小さな漁港と、岬の上の止まった発電所(D84〜D88)。絵と当たり判定は docs/assets/takarabune/
  // 条件(D88): 発電所の奥(正門 → 管理棟 → タービン建屋 → 原子炉建屋 → 炉心)のプールに飛び込んで「ペレット」→ 暗転して港へ
  // → 鋳造工房のぼぎにペレットを渡す(炉が青白く燃え、るつぼの金属くずが溶ける。一枚絵)→ 道具「首振りエンジンの部品」
  // → 宝舟の機関室で部品を取り付け → ボイラーの火室にペレット → 首振りエンジンが動く → 甲板で沖へ → ペレットを海に投げ込む → 青く光る海(一枚絵)
  // → 港で「白紙の海図」。ペレットは一つで、鋳造・エンジン・海に使いまわす。西の坂道からいつでも帰れる。きーは警告に反応しない(D84)
  const TK_GRIDS = {
    port: [
      "############################",
      "############################",
      "########################....",
      "########################....",
      "########################....",
      "..#######..#####..#####.....",
      "..#######...................",
      "...##.......................",
      "............................",
      "............................",
      "############################",
      "############################",
      "############################",
      "############################",
    ],
    gate: [
      "###########....#############",
      "###########....#############",
      "###########....#############",
      "###########....#############",
      "###########....#############",
      ".................####.......",
      ".................####.......",
      "............................",
      "............................",
      "############################",
    ],
    admin: [
      "########################",
      "########################",
      "#.############.........#",
      "#.############..######.#",
      "#.############..######.#",
      "#......................#",
      "#......................#",
      "#......................#",
      "#.......................",
      "#.......................",
      "#......................#",
      "####..##################",
    ],
    turbine: [
      "############################",
      "############################",
      "............................",
      "............................",
      "...######################...",
      "...######################...",
      "...######################...",
      "...######################...",
      "............................",
      "............................",
      "############################",
      "############################",
    ],
    reactor: [
      "####################",
      "####################",
      "#..................#",
      "#.#..............#.#",
      "#.......####.......#",
      "#.....########.....#",
      "#.....########.....#",
      "#....##########....#",
      "#....##########....#",
      "#....##########....#",
      "#.#...########...#.#",
      "#.....########.....#",
      "........####.......#",
      "...................#",
      "..##################",
      "####################",
    ],
    core: [
      "################",
      "################",
      "#.....####.....#",
      "#...########...#",
      "#..##########..#",
      "#..##########..#",
      "#..##########..#",
      "#..##########..#",
      "#...########...#",
      "#....######....#",
      "#..............#",
      "#..............#",
      "#..............#",
      "#######..#######",
    ],
    deck: [
      "####################",
      "####################",
      "####################",
      "#####............###",
      "####..###.#.......##",
      "####..###.#.......##",
      "##...............###",
      "####################",
      "####################",
      "####################",
    ],
    workshop: [
      "################",
      "################",
      "#####......#####",
      "#####......#####",
      "#####......#####",
      "####...####.####",
      "####...####.####",
      "##.....####.####",
      "##.....####.####",
      "####........####",
      "####........####",
      "#######..#######",
    ],
    engineroom: [
      "################",
      "################",
      "####...####..###",
      "####...####..###",
      "####...####....#",
      "####...####....#",
      "#......####....#",
      "#......####....#",
      "#..............#",
      "################",
    ],
  };
  const tkMap = (key, cols, rows, extra) =>
    Object.assign({ tile: T, bg: "#0c1220", map: TK_GRIDS[key], legend: K_LEGEND, drawGround: kImage(`bg_${key}`, cols * T, rows * T) }, extra);
  const tkSpot = (id, x, y, interact, extra) => Object.assign({ id, x, y, w: 1, h: 1, range: 48, headY: 40, interact }, extra);
  // 灯りのゆらぎ(非常灯、回転灯、炉の火)を、絵の上に光の輪として重ねる
  const tkLight = (ctx, x, y, r, rgb, a) => {
    const g = ctx.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0, `rgba(${rgb}, ${a})`);
    g.addColorStop(1, `rgba(${rgb}, 0)`);
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, 2 * r, 2 * r);
  };
  const tkNow = () => performance.now() / 1000;
  // 湯気のかたまり(上へのぼりながら広がって消える)
  const tkPuffs = [];
  const tkPuff = (x, y, vx, vy, life, size) => tkPuffs.push({ x, y, vx, vy, t0: tkNow(), life, size });
  const tkDrawPuffs = (ctx, ox, oy) => {
    const now = tkNow();
    for (let k = tkPuffs.length - 1; k >= 0; k--) {
      const p = tkPuffs[k];
      const u = (now - p.t0) / p.life;
      if (u >= 1) {
        tkPuffs.splice(k, 1);
        continue;
      }
      const s = Math.round(p.size * (0.6 + u * 1.4));
      ctx.fillStyle = `rgba(232, 236, 244, ${0.75 * (1 - u)})`;
      ctx.fillRect(Math.round(ox + p.x + p.vx * u * p.life - s / 2), Math.round(oy + p.y + p.vy * u * p.life - s / 2), s, s);
    }
  };

  // ---- 首振りエンジン(首振り式の蒸気機関、D88)----
  // しくみ: ピストン棒の先がクランクピンに直につながる。クランクが回ると、ピンを追ってシリンダー全体が下の軸(トラニオン)で首を振る。
  // 首を振ると、軸の面の口が蒸気の入口と出口に交互に重なる(弁の仕掛けがいらない)。複動式なので、1 回転に 2 回、蒸気を吐く(上と下の死点)。
  // 回転は、ペレットを火室に入れてから、圧力が上がるのを待って(TK_PRESS 秒)、ゆっくり回りはじめ、TK_SPIN 秒で全速になる
  const TK_PRESS = 2.6;
  const TK_SPIN = 4;
  const TK_OMEGA = 2 * Math.PI * 1.1; // 全速(1 秒に 1.1 回転)
  let tkFireT0 = -1; // ペレットを火室に入れた時刻(読みこみ直したあとは、すでに全速として扱う)
  const tkFireAge = (api) => (!api.flag("running") ? -1 : tkFireT0 < 0 ? 999 : tkNow() - tkFireT0);
  const tkCrank = (api) => {
    const a = tkFireAge(api) - TK_PRESS;
    if (a <= 0) return 0;
    return a < TK_SPIN ? (TK_OMEGA * a * a) / (2 * TK_SPIN) : TK_OMEGA * (a - TK_SPIN / 2);
  };
  // 死点をまたいだら蒸気を吐く(甲板の煙突、機関室のシリンダーの口)
  let tkLastHalf = -1;
  const tkExhaust = (api) => {
    const h = Math.floor(tkCrank(api) / Math.PI);
    if (h !== tkLastHalf) {
      const fire = tkLastHalf >= 0 && h > tkLastHalf;
      tkLastHalf = h;
      return fire;
    }
    return false;
  };
  // 機関室の首振りエンジン(前から見る)。クランク軸の中心 C、シリンダーの軸 O(map のドット)
  const TK_C = [288, 79];
  const TK_O = [288, 214];
  const TK_R = 26; // クランクの半径(首の振れ幅が見えるように、実物の比より少し大きく)
  const tkEngineObj = {
    id: "engine",
    x: 9 * T,
    y: 7.4 * T,
    w: 1,
    h: 1,
    sortDy: 0,
    headY: 6.2 * T,
    draw(ctx, sx, sy, t, api) {
      const ok = api.flag("installed"); // コンロッドが付くまでは、シリンダーとクランクのあいだが空いている
      const ox = sx - this.x;
      const oy = sy - this.y;
      const th = tkCrank(api);
      const cx = ox + TK_C[0];
      const cy = oy + TK_C[1];
      const px = cx + TK_R * Math.sin(th);
      const py = cy - TK_R * Math.cos(th);
      const qx = ox + TK_O[0];
      const qy = oy + TK_O[1];
      const phi = Math.atan2(px - qx, qy - py); // シリンダーの傾き
      const cyl = api.image("cyl");
      const fly = api.image("fly");
      ctx.imageSmoothingEnabled = false;
      // はずみ車(クランク軸といっしょに回る)
      if (fly) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(th);
        ctx.drawImage(fly, -fly.width / 2, -fly.height / 2);
        ctx.restore();
      }
      // シリンダー(下の軸で首を振る)と、ピストン棒(シリンダーの先からクランクピンまで)
      const SC = 1.6; // シリンダーの絵の倍率
      const L = cyl ? cyl.height * SC - 8 : 88;
      const tx = qx + L * Math.sin(phi);
      const ty = qy - L * Math.cos(phi);
      const rod = api.image("conrod");
      if (ok && rod) {
        // コンロッドの絵: 上の目玉をクランクピンに合わせ、シリンダーの軸の向きに下へのばす(下のはしはシリンダーの中に隠れる)
        const RS = 1.4;
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(phi);
        ctx.drawImage(rod, (-rod.width * RS) / 2, -4 * RS, rod.width * RS, rod.height * RS);
        ctx.restore();
      }
      if (cyl) {
        ctx.save();
        ctx.translate(qx, qy);
        ctx.rotate(phi);
        ctx.drawImage(cyl, (-cyl.width * SC) / 2, -cyl.height * SC + 6, cyl.width * SC, cyl.height * SC);
        ctx.restore();
      }
      // 蒸気を吐くたびに、シリンダーの口(軸のところ)から湯気
      if (tkExhaust(api)) tkPuff(TK_O[0] + (Math.sin(phi) > 0 ? -12 : 12), TK_O[1] - 6, Math.sin(phi) > 0 ? -14 : 14, -16, 0.9, 8);
    },
  };

  // A 漁港と岸壁(入口で出口。西の坂道。東の坂道の先が岬の発電所)
  // 切り出した絵(fg_*.png の x0, y0, w, h)を、足もとの y(base)できーと前後させる。bob は絵のゆれ(甲板)
  const tkFg = (img, x0, y0, w, h, base, bob) => ({
    id: `fg${x0}_${y0}`,
    x: x0 + w / 2,
    y: base,
    w: 1,
    h: 1,
    draw(ctx, sx, sy, t, api) {
      const im = api.image(img);
      const dy = bob ? bob() : 0;
      if (im) ctx.drawImage(im, x0, y0, w, h, sx - this.x + x0, sy - this.y + y0 + dy, w, h);
    },
  });
  const tkWall = (x0, y0, x1, y1) => ({ id: `wall${x0}`, x: (x0 + x1) / 2, y: (y0 + y1) / 2, w: 1, h: 1, solid: { w: x1 - x0, h: y1 - y0 } });
  const TK_PORT = tkMap("port", 28, 14, {
    spawns: {
      start: { x: 1.2 * T, y: 6.6 * T, facing: "east" },
      east: { x: 26.4 * T, y: 4 * T, facing: "west" },
      boat: { x: 11.2 * T, y: 9.2 * T, facing: "south" },
      shop: { x: 5.6 * T, y: 7.9 * T, facing: "south" },
    },
    drawOverlay(ctx, ox, oy, t, api) {
      // 宝舟のボイラーが焚けているあいだ、煙突から湯気(エンジンと同じ調子で)
      if (api.flag("running") && tkExhaust(api)) tkPuff(10 * T + 6, 10.3 * T, -10, -26, 1.4, 10);
      tkDrawPuffs(ctx, ox, oy);
    },
    triggers: [
      { id: "toGate", x: 27.6 * T, y: 2 * T, w: 1.4 * T, h: 4.6 * T, warp: { map: "gate", spawn: "west" } },
      // 西の坂道から、いつでも帰れる(D88)
      { id: "leave", x: -T, y: 5 * T, w: 1.45 * T, h: 3 * T, run: (api) => api.exit() },
    ],
    objects: [
      // 宝舟は岸壁より手前(水の上)。帆・帆柱・竜頭・煙突は、岸壁を歩くきーより手前に描く(fg_port。docs/assets/takarabune/fg_port.py)
      // 帆と竜頭のうしろの岸壁も通れる。うしろに入ると、きーは帆に隠れる(2026-10-03、作者「帆の後ろは通り抜けるが、きーが隠れるはできる？」)
      // 切り出しは物ごとに分けて、それぞれの x に置く(一枚のまま x: 0 に置くと、画面が右へ動いたとき画面の外の物として描かれなかった)
      tkFg("fg_port", 412, 254, 136, 108, 11.6 * T), // 帆
      tkFg("fg_port", 472, 248, 13, 149, 11.6 * T), // 帆柱
      tkFg("fg_port", 612, 245, 128, 125, 11.6 * T), // 竜頭と首
      tkFg("fg_port", 316, 318, 24, 64, 11.6 * T), // 煙突
      // 鋳物小屋(鋳造工房)の大戸
      tkSpot("shopDoor", 5.6 * T, 7.2 * T, (api) => api.warp("workshop", "door"), { range: 44 }),
      // 宝舟: 乗りこむと機関室。沖から帰ってきたら、舵のそばに白紙の海図
      tkSpot(
        "boat",
        11.2 * T,
        9.8 * T,
        (api) => {
          if (api.flag("glowed")) {
            if (api.hasItem("白紙の海図")) return;
            api.giveItem("白紙の海図");
            api.clear();
            api.show("v_kaizu");
            return;
          }
          api.warp("engineroom", "ladder");
        },
        { range: 56, canInteract: (api) => !api.hasItem("白紙の海図") }
      ),
    ],
  });

  // 鋳造工房(鋳物小屋の中)。るつぼ炉、トングとシャンク、二つ割の木の鋳枠と砂型、込め台、鋳物砂の山、型ばらしの格子、仕上げ台
  // ぼぎ(仮の絵、D70)にペレットを渡すと、炉が青白く燃え、るつぼの中の金属くずが溶ける → 鋳造の一枚絵 → コンロッド(D95)
  let tkForgeT0 = -1;
  const TK_WORKSHOP = tkMap("workshop", 16, 12, {
    bg: "#14121a",
    spawns: { door: { x: 7.9 * T, y: 10.4 * T, facing: "north" } },
    drawOverlay(ctx, ox, oy, t, api) {
      const fx = ox + 3 * T;
      const fy = oy + 4 * T;
      const e = tkForgeT0 < 0 ? (api.flag("cast") ? 99 : -1) : tkNow() - tkForgeT0;
      if (e < 0) return;
      // ペレットの熱で、炉が青白く燃える(鋳造のあとは、ゆっくり冷めていく)
      const heat = api.flag("cast") && e > 6 ? 0.35 : Math.min(1, e / 1.2);
      tkLight(ctx, fx, fy, 130, "120, 220, 255", 0.55 * heat * (0.9 + 0.1 * Math.sin(t * 9)));
      tkLight(ctx, fx, fy, 40, "230, 255, 255", 0.8 * heat);
      // るつぼの中の金属くずが溶けていく(赤 → 橙 → 白っぽい黄)
      const melt = Math.min(1, Math.max(0, (e - 0.8) / 1.6));
      if (melt > 0 && !(api.flag("cast") && e > 6)) {
        ctx.fillStyle = `rgba(255, ${Math.round(120 + 100 * melt)}, ${Math.round(40 + 60 * melt)}, ${0.85 * melt})`;
        ctx.beginPath();
        ctx.ellipse(fx, fy + 1, 15, 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    triggers: [{ id: "out", x: 7 * T, y: 11.5 * T, w: 2 * T, h: T, warp: { map: "port", spawn: "shop" } }],
    objects: [
      {
        id: "bogi",
        img: "bogi",
        w: 48,
        h: 48,
        x: 5.6 * T,
        y: 3.9 * T,
        sortDy: 18,
        headY: 30,
        range: 56,
        interact(api) {
          if (api.flag("cast") || !api.hasItem("ペレット")) return api.bubble("bogi", "……", 1200); // 仮
          tkForgeT0 = tkNow();
          api.bubble("bogi", "……！", 1400); // 仮
          api.later(3000, () =>
            api.show("v_cast", () => {
              api.setFlag("cast");
              // 鋳あがったコンロッドを、きーが頭の上にななめに掲げる(D92、D95)
              api.hold("conrod", 1.8, () => api.giveItem("コンロッド"), { rot: -0.7 });
            }, { full: true })
          );
        },
      },
    ],
  });

  // B 正門(西から坂道で上がってくる。鎖の切れた門を抜けて北へ)
  // 正門の前後(fg_gate。docs/assets/takarabune/fg_gate.py)。2026-10-03、作者「金網フェンスは？前後関係」
  // フェンスの根もと(y 158)より北へは行けない。門は半開きで、2 枚の扉のあいだだけ通れる(扉の足もとの線の奥はふさぐ)。
  // 扉は地面に斜めに立つので、幅 6 の縦の帯に切って、帯ごとの足もとの y できーと前後を決める。守衛所と立て札は足もとの y で
  const TK_GATE_FG = [];
  for (let x = 356; x < 414; x += 6) TK_GATE_FG.push(tkFg("fg_gate", x, 68, 6, 136, 160 + ((x + 3 - 355) * 40) / 55));   // 左の扉: (355,160)→(410,200)
  for (let x = 424; x < 478; x += 6) TK_GATE_FG.push(tkFg("fg_gate", x, 68, 6, 136, 158 + ((478 - x - 3) * 32) / 51));   // 右の扉: (478,158)→(427,190)
  TK_GATE_FG.push(tkFg("fg_gate", 537, 125, 113, 90, 214), tkFg("fg_gate", 646, 174, 32, 43, 216));   // 守衛所、立て札
  const TK_GATE = tkMap("gate", 28, 10, {
    spawns: {
      west: { x: 1.2 * T, y: 7.4 * T, facing: "east" },
      north: { x: 419, y: 1.3 * T, facing: "south" },
    },
    triggers: [
      { id: "toPort", x: -T, y: 6 * T, w: 1.45 * T, h: 3 * T, warp: { map: "port", spawn: "east" } },
      { id: "toAdmin", x: 11 * T, y: -T, w: 4 * T, h: 1.45 * T, warp: { map: "admin", spawn: "south" } },
    ],
    // 門の通り道(x 404〜432)の左右: 扉の足もとの線より奥を、段々にふさぐ
    objects: [...TK_GATE_FG, tkWall(352, 0, 378, 180), tkWall(378, 0, 404, 200), tkWall(432, 0, 455, 192), tkWall(455, 0, 480, 175)],
  });

  // C 管理棟(南の玄関から入り、東の扉から出る)。非常灯の緑だけが、ゆっくり明滅する
  const TK_ADMIN = tkMap("admin", 24, 12, {
    spawns: {
      south: { x: 5 * T, y: 10.3 * T, facing: "north" },
      east: { x: 22 * T, y: 9 * T, facing: "west" },
    },
    drawOverlay(ctx, ox, oy, t) {
      const a = 0.16 + 0.08 * Math.sin(t * 1.7);
      for (const [x, y] of [[23 * T, 7.2 * T], [5 * T, 10.7 * T], [9 * T, 1.2 * T]]) tkLight(ctx, ox + x, oy + y, 90, "90, 255, 140", a);
    },
    triggers: [
      { id: "toGate", x: 4 * T, y: 11.5 * T, w: 2 * T, h: T, warp: { map: "gate", spawn: "north" } },
      { id: "toTurbine", x: 23.55 * T, y: 8 * T, w: 1.45 * T, h: 2 * T, warp: { map: "turbine", spawn: "west" } },
    ],
    objects: [],
  });

  // D タービン建屋(西から入り、東の扉から出る)。止まったタービンの南北に 2 マスの通路
  const TK_TURBINE = tkMap("turbine", 28, 12, {
    spawns: {
      west: { x: 1.2 * T, y: 9 * T, facing: "east" },
      east: { x: 26.6 * T, y: 3 * T, facing: "west" },
    },
    drawOverlay(ctx, ox, oy, t) {
      // 切れかけた灯り(ときどき、ちらつく)
      const flick = Math.sin(t * 13) > 0.92 ? 0.05 : 0.22;
      for (const x of [6 * T, 16 * T]) tkLight(ctx, ox + x, oy + 2 * T, 100, "255, 140, 60", flick);
    },
    triggers: [
      { id: "toAdmin", x: -T, y: 8 * T, w: 1.45 * T, h: 2 * T, warp: { map: "admin", spawn: "east" } },
      { id: "toReactor", x: 27.55 * T, y: 2 * T, w: 1.45 * T, h: 2 * T, warp: { map: "reactor", spawn: "west" } },
    ],
    // 床に立つ操作盤と立て看板(fg_turbine。docs/assets/takarabune/fg_more.py)。足もとはふさぐ
    objects: [
      tkFg("fg_turbine", 393, 240, 27, 61, 300),
      tkFg("fg_turbine", 812, 238, 39, 47, 284),
      tkWall(392, 284, 420, 300),
      tkWall(812, 226, 851, 285), // 看板のうしろもふさぐ(きーが看板にすっかり隠れるので)
    ],
  });

  // E 原子炉建屋(西から入る。北の二重扉の先が炉心)。赤い回転灯が回り、警報が鳴りっぱなし
  let tkAlarmT = -99;
  let tkDoorT0 = -1; // 二重扉が開きはじめた時刻(一度開いたら、開いたまま)
  const tkDoorOpen = (api) => api.flag("airlock");
  const TK_DOOR = { x0: 279, y0: 3, x1: 361, y1: 68, fx0: 262, fx1: 380 }; // 扉の板と、それが引きこまれる枠(背景の絵のドット)
  // 床に立つものは、きーとの前後を足もとの y で決める(fg_reactor。docs/assets/takarabune/fg_reactor.py)。
  // [x0, y0, w, h, 足もとの y]。回転灯は通れない(マスをふさぐ)。標識の列も通れない(うしろに入ると、きーが板にすっかり隠れるので)。格納容器は北半分(盛り上がったふち)
  // 2026-10-03、作者「原子炉建屋内の前後関係もみて」
  const TK_REACTOR_FG = [
    ...[[2, 3], [17, 3], [2, 10], [17, 10]].map(([c, r]) => [c * T - 4, r * T - 6, 41, 44, r * T + 32]),
    ...[82, 178, 400, 495].map((x0) => [x0, 444, 54, 36, 480]),
    [157, 130, 326, 144, 274],
  ].map(([x0, y0, w, h, base], i) => ({
    id: "fg" + i,
    x: x0 + w / 2,
    y: base,
    w: 1,
    h: 1,
    draw(ctx, sx, sy, t, api) {
      const im = api.image("fg_reactor");
      if (im) ctx.drawImage(im, x0, y0, w, h, sx - this.x + x0, sy - this.y + y0, w, h);
    },
  }));
  const TK_REACTOR = tkMap("reactor", 20, 16, {
    spawns: {
      west: { x: 1.2 * T, y: 13.5 * T, facing: "east" },
      north: { x: 10 * T, y: 2.4 * T, facing: "south" },
    },
    drawOverlay(ctx, ox, oy, t, api) {
      // 回転灯: 光の筋がぐるぐる回る
      for (const [c, r, ph] of [[2, 3, 0], [17, 3, 1.6], [2, 10, 3.1], [17, 10, 4.7]]) {
        const x = ox + c * T + 16;
        const y = oy + r * T + 16;
        const ang = t * 3.2 + ph;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        const g = ctx.createLinearGradient(0, 0, 150, 0);
        g.addColorStop(0, "rgba(255, 50, 30, 0.5)");
        g.addColorStop(1, "rgba(255, 50, 30, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, 150, -0.22, 0.22);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = `rgba(255, 30, 20, ${0.06 + 0.06 * Math.max(0, Math.sin(t * 6.4))})`;
      ctx.fillRect(ox, oy, 20 * T, 16 * T);
      if (t - tkAlarmT > 3.2) {
        tkAlarmT = t;
        api.bubble("alarm", "ウーー　ウーー", 2400); // 仮
      }
    },
    triggers: [
      { id: "toTurbine", x: -T, y: 12 * T, w: 1.45 * T, h: 3 * T, warp: { map: "turbine", spawn: "east" } },

    ],
    objects: [
      ...TK_REACTOR_FG,
      { id: "alarm", x: 10 * T, y: 1.4 * T, w: 1, h: 1, headY: 4 },
      // 二重扉: 調べると、重い扉が右の壁へすべって開く(0.9 秒)。開いた奥は暗く、炉心の青い光がもれる
      // 二重扉が開いているときだけ、炉心へ入れる(2026-10-03、作者「プール前の扉が閉まったまま入れたりするのは変」)。
      // 開いたあとは、A でも、扉へ向かって歩きつづけても入る。扉の絵はきーより奥に描く(y を壁ぎわに置き、調べる場所は iy で手前に)
      {
        id: "airlock",
        x: 10 * T,
        y: 1 * T,
        iy: 1.6 * T,
        w: 1,
        h: 1,
        range: 46,
        headY: 0,
        interact(api) {
          if (tkDoorOpen(api)) return api.warp("core", "south");
          tkDoorT0 = tkNow();
          api.setFlag("airlock");
          api.bubble("airlock", "ゴゴゴ……", 1200); // 仮
          api.freeze(0.9);
        },
        update(dt, t, api) {
          if (!tkDoorOpen(api) || tkNow() - tkDoorT0 < 0.9) return;
          const pl = api.player();
          const at = Math.abs(pl.x - this.x) < 0.9 * T && pl.y < 2.5 * T && pl.facing === "north";
          const still = this._ly === pl.y;
          this._ly = pl.y;
          this._push = at && still ? (this._push || 0) + dt : 0;
          if (this._push > 0.2) {
            this._push = -99;
            api.warp("core", "south");
          }
        },
        draw(ctx, sx, sy, t, api) {
          if (!tkDoorOpen(api)) return;
          const bg = api.image("bg_reactor");
          if (!bg) return;
          const ox = sx - this.x;
          const oy = sy - this.y;
          const D = TK_DOOR;
          const u = tkDoorT0 < 0 ? 1 : Math.min(1, (tkNow() - tkDoorT0) / 0.9);
          const k = u * u * (3 - 2 * u);
          // 開いた奥: 暗がりと、炉心の青い光
          ctx.fillStyle = "#06080e";
          ctx.fillRect(ox + D.x0, oy + D.y0, D.x1 - D.x0, D.y1 - D.y0);
          tkLight(ctx, ox + (D.x0 + D.x1) / 2, oy + D.y1, 50, "120, 210, 255", 0.55 * k);
          // 扉の板(背景の絵の扉を切り出して)を、右の枠の中へすべらせる。枠の外ははみ出さない
          ctx.save();
          ctx.beginPath();
          ctx.rect(ox + D.fx0, oy + D.y0, D.fx1 - D.fx0, D.y1 - D.y0);
          ctx.clip();
          const dx = Math.round((D.x1 - D.x0 + 4) * k);
          ctx.drawImage(bg, D.x0, D.y0, D.x1 - D.x0, D.y1 - D.y0, ox + D.x0 + dx, oy + D.y0, D.x1 - D.x0, D.y1 - D.y0);
          ctx.restore();
        },
      },
    ],
  });

  // F 格納容器の中(炉心)。行き止まり。ふたの開いた炉はプール。ふちで調べると飛び込んで、ペレットを抱えて上がってくる → 暗転して港へ(D88)
  let tkDiveT0 = -1;
  let tkDiveFrom = [8 * T, 10.4 * T]; // 飛び込んだ場所(ふちのどこからでも)
  const TK_DIVE = 2.4;
  // プールのふち(だ円)。きーにいちばん近いふちの点
  const TK_POOL = { cx: 8 * T, cy: 6 * T + 5, rx: 5 * T + 10, ry: 4 * T + 16 };
  const tkRim = (x, y) => {
    const a = Math.atan2((y - TK_POOL.cy) / TK_POOL.ry, (x - TK_POOL.cx) / TK_POOL.rx);
    return [TK_POOL.cx + TK_POOL.rx * Math.cos(a), TK_POOL.cy + TK_POOL.ry * Math.sin(a)];
  };
  const tkDive = (api) => {
    if (tkDiveT0 >= 0) return;
    const pl = api.player();
    tkDiveFrom = [pl.x, pl.y];
    tkDiveT0 = tkNow();
    TK_CORE._ki = api.image("ki");
    api.freeze(TK_DIVE + 0.2);
    api.later(TK_DIVE * 1000, () => {
      tkDiveT0 = -1;
      // 上がってきたきーが、ペレットを頭の上に掲げる(D92)→ 名前 → 暗転して港へ
      api.hold("pellet", 1.8, () => {
        api.giveItem("ペレット");
        api.later(900, () => api.warp("port", "shop"));
      });
    });
  };
  const TK_CORE = tkMap("core", 16, 14, {
    spawns: { south: { x: 8 * T, y: 12.3 * T, facing: "north" } },
    drawOverlay(ctx, ox, oy, t) {
      tkLight(ctx, ox + 8 * T, oy + 6 * T, 7 * T, "120, 210, 255", 0.14 + 0.06 * Math.sin(t * 2.1));
      if (tkDiveT0 < 0) return;
      const e = tkNow() - tkDiveT0;
      // 跳びこむ先: ふちから、プールの水の上へ 3 マス
      const [fx, fy] = tkDiveFrom;
      const dx = TK_POOL.cx - fx;
      const dy = TK_POOL.cy - fy;
      const dl = Math.hypot(dx, dy) || 1;
      const x = ox + fx + (dx / dl) * 3 * T;
      const y = oy + fy + (dy / dl) * 3 * T;
      // 跳びこむ(弧)→ しぶきと波紋 → 水の中で光る → ペレットを抱えて上がってくる
      const ki = this._ki;
      if (e < 0.5 && ki) {
        const u = e / 0.5;
        const row = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 2 : 3) : dy < 0 ? 1 : 0;
        const kx = ox + fx + (x - ox - fx) * u;
        const footY = oy + fy + (y - oy - fy) * u - Math.sin(u * Math.PI) * 30;
        ctx.drawImage(ki, 0, row * 64, 64, 64, Math.round(kx - 32), Math.round(footY - 64 + 17), 64, 64);
      }
      if (e > 0.45 && e < 2.2) {
        const u = (e - 0.45) / 1.75;
        ctx.strokeStyle = `rgba(220, 250, 255, ${1 - u})`;
        ctx.lineWidth = 2;
        for (const k of [0, 0.3, 0.6]) {
          const r = 6 + (u + k) * 50;
          ctx.beginPath();
          ctx.ellipse(x, y, r, r * 0.45, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        if (u < 0.35) {
          ctx.fillStyle = `rgba(230, 250, 255, ${1 - u / 0.35})`;
          for (let k = 0; k < 14; k++) {
            const a = (k / 14) * Math.PI * 2;
            ctx.fillRect(Math.round(x + Math.cos(a) * 20 * (u / 0.35 + 0.3)), Math.round(y - 10 * Math.sin((u / 0.35) * Math.PI) + Math.sin(a) * 8), 3, 3);
          }
        }
        tkLight(ctx, x, y, 60, "200, 250, 255", 0.6 * Math.sin(u * Math.PI));
      }
    },
    triggers: [{ id: "toReactor", x: 7 * T, y: 13.5 * T, w: 2 * T, h: T, warp: { map: "reactor", spawn: "north" } }],
    objects: [
      // プールのふち: どこからでも、調べると飛び込む。水に向かって歩きつづけても飛び込む(作者「プールに入れない」2026-10-03)
      {
        id: "pool",
        x: 8 * T,
        y: 10.4 * T,
        w: 1,
        h: 1,
        range: 54,
        headY: 30,
        canInteract: (api) => !api.hasItem("ペレット") && !api.flag("cast") && tkDiveT0 < 0,
        interact: (api) => tkDive(api),
        update(dt, t, api) {
          // ▼ と調べる場所を、きーにいちばん近いふちに置く
          const pl = api.player();
          const [rx, ry] = tkRim(pl.x, pl.y);
          this.x = rx;
          this.y = ry;
          if (api.hasItem("ペレット") || api.flag("cast") || tkDiveT0 >= 0) return;
          // ふちで、水のほうを向いて立ち止まったまま(壁を押している)なら飛び込む
          const near = Math.hypot(pl.x - rx, pl.y - ry) < 26;
          const fx = { east: 1, west: -1 }[pl.facing] || 0;
          const fy = { south: 1, north: -1 }[pl.facing] || 0;
          const tx = TK_POOL.cx - pl.x;
          const ty = TK_POOL.cy - pl.y;
          const toward = (fx * tx + fy * ty) / (Math.hypot(tx, ty) || 1) > 0.5;
          const still = this._lx === pl.x && this._ly === pl.y;
          this._lx = pl.x;
          this._ly = pl.y;
          this._push = near && toward && still ? (this._push || 0) + dt : 0;
          if (this._push > 0.35) {
            this._push = 0;
            tkDive(api);
          }
        },
      },
    ],
  });
  // 飛び込んでいるあいだは、きーを消す(水の中)
  Object.defineProperty(TK_CORE, "hidePlayer", { get: () => tkDiveT0 >= 0 });

  // 宝舟の機関室(舳先は東)。西にボイラー、まんなかに首振りエンジンの台、東にはしご(甲板へ)
  // 首振りエンジンは最初から据わっていて、コンロッドだけが欠けている(D92、D95)。コンロッドを取り付け、火室にペレットを入れると、圧力計の針が上がり、安全弁が鳴り、エンジンが動きだす
  const TK_ENGINE = tkMap("engineroom", 16, 10, {
    bg: "#1a120c",
    spawns: { ladder: { x: 12 * T, y: 4.6 * T, facing: "south" } },
    drawOverlay(ctx, ox, oy, t, api) {
      const age = tkFireAge(api);
      // 火室: ペレットの青白い光
      if (age >= 0) {
        const k = Math.min(1, age / 1);
        tkLight(ctx, ox + 75, oy + 182, 80, "120, 220, 255", 0.6 * k * (0.9 + 0.1 * Math.sin(t * 11)));
        tkLight(ctx, ox + 75, oy + 182, 22, "235, 255, 255", 0.9 * k);
      }
      // 圧力計の針(0 から、圧力が上がると右へ)
      const p = age < 0 ? 0 : Math.min(1, age / TK_PRESS);
      const ga = -2.4 + 2.9 * p + (age > TK_PRESS ? Math.sin(t * 13) * 0.04 : 0);
      ctx.strokeStyle = "#b02020";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(ox + 80, oy + 132);
      ctx.lineTo(ox + 80 + Math.sin(ga) * 9, oy + 132 - Math.cos(ga) * 9);
      ctx.stroke();
      // 安全弁: 圧力が上がりきると、シューッと吹く
      if (age > TK_PRESS - 0.6 && age < TK_PRESS + 1.4 && Math.random() < 0.5) tkPuff(100, 70, (Math.random() - 0.5) * 20, -40, 0.8, 6);
      tkDrawPuffs(ctx, ox, oy);
    },
    triggers: [],
    objects: [
      tkEngineObj,
      // エンジンの台: コンロッドが欠けている(▼ が出る)。コンロッドを持って調べると取り付ける
      tkSpot(
        "mount",
        9 * T,
        8.1 * T,
        (api) => {
          if (!api.hasItem("コンロッド")) return api.mutter("……", 1200); // 仮
          api.takeItem("コンロッド");
          api.setFlag("installed");
          api.bubble("mount", "ガチャン", 1400); // 仮
        },
        { range: 50, headY: 30, canInteract: (api) => !api.flag("installed") }
      ),
      // ボイラーの火室: ペレットを入れる
      tkSpot(
        "firebox",
        2.4 * T,
        6.6 * T,
        (api) => {
          tkFireT0 = tkNow();
          tkLastHalf = -1;
          api.setFlag("running");
          api.later(TK_PRESS * 1000 - 400, () => api.bubble("valve", "シューッ", 1600)); // 仮
        },
        { range: 50, canInteract: (api) => api.flag("installed") && api.hasItem("ペレット") && !api.flag("running") }
      ),
      { id: "valve", x: 100, y: 80, w: 1, h: 1, headY: 6 },
      // はしご: エンジンが動いていれば甲板へ(沖へ出る)。動いていなければ、港へ降りる
      tkSpot(
        "ladder",
        12.4 * T,
        4.2 * T,
        (api) => {
          if (api.flag("running") && !api.flag("glowed")) api.warp("deck", "stern");
          else api.warp("port", "boat");
        },
        { range: 50 }
      ),
    ],
  });

  // G 宝舟の甲板。海が西へ流れる(舳先は東)。煙突から、エンジンが蒸気を吐くたびに湯気。外輪がかく水しぶき
  // 舳先で調べると、きーがペレットを海に投げ込む → 沈んで、底から青い光が広がる → 一枚絵(D88)
  let tkThrowT0 = -1;
  const tkDeckBob = () => Math.round(Math.sin(tkNow() * 1.3) * 1); // 甲板のゆれ
  const TK_DECK = {
    tile: T,
    bg: "#0a1430",
    map: TK_GRIDS.deck,
    legend: K_LEGEND,
    drawGround(ctx, ox, oy, img, api) {
      const get = (k) => (typeof img === "function" ? img(k) : null);
      const t = tkNow();
      const sea = get("sea");
      if (sea) {
        const off = (t * 36) % sea.width;
        for (let x = -off - sea.width; x < 20 * T + sea.width; x += sea.width) ctx.drawImage(sea, Math.round(ox + x), oy, sea.width, 10 * T);
      }
      // ペレットが沈んだところから、青い光が広がる
      if (tkThrowT0 > 0) {
        const e = t - tkThrowT0 - 1.0;
        if (e > 0) {
          const r = 30 + 300 * Math.min(1, e / 3.2);
          tkLight(ctx, ox + 19.6 * T, oy + 5 * T, r, "60, 200, 255", Math.min(0.85, e / 1.4));
          tkLight(ctx, ox + 19.6 * T, oy + 5 * T, r * 0.45, "210, 252, 255", Math.min(0.7, e / 2));
        }
      }
      const deck = get("bg_deck");
      if (deck) ctx.drawImage(deck, ox, oy + tkDeckBob(), 20 * T, 10 * T);
      // 外輪がかく水しぶき(エンジンの回転といっしょ)
      const th = tkCrank(api);
      ctx.fillStyle = "rgba(220, 235, 255, 0.75)";
      for (let k = 0; k < 6; k++) {
        const u = (th / (Math.PI * 2) + k / 6) % 1;
        for (const y of [1.5 * T, 8.4 * T]) ctx.fillRect(Math.round(ox + 6 * T - u * 44), Math.round(oy + y + (k % 3) * 6), 3, 2);
      }
      // 煙突(ボイラーの上)から、蒸気を吐くたびに湯気
      if (tkExhaust(api)) tkPuff(3 * T + 6, 5 * T - 8, -46, -22, 1.6, 9);
      tkDrawPuffs(ctx, ox, oy);
    },
    drawOverlay(ctx, ox, oy) {
      // ペレットを投げる(弧を描いて舳先の先の海へ)→ しぶき
      if (tkThrowT0 < 0) return;
      const e = tkNow() - tkThrowT0;
      const x0 = ox + 17.4 * T;
      const y0 = oy + 4.4 * T;
      const x1 = ox + 19.6 * T;
      const y1 = oy + 5 * T;
      const pel = this._pel;
      if (e < 0.8 && pel) {
        const u = e / 0.8;
        ctx.drawImage(pel, Math.round(x0 + (x1 - x0) * u - pel.width / 2), Math.round(y0 + (y1 - y0) * u - Math.sin(u * Math.PI) * 40 - pel.height / 2));
      } else if (e < 1.8) {
        const u = (e - 0.8) / 1;
        ctx.fillStyle = `rgba(230, 250, 255, ${1 - u})`;
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2;
          ctx.fillRect(Math.round(x1 + Math.cos(a) * 14 * (u + 0.3)), Math.round(y1 - 12 * Math.sin(u * Math.PI) + Math.sin(a) * 5), 3, 3);
        }
      }
    },
    spawns: { stern: { x: 4.8 * T, y: 6.5 * T, facing: "east" } },
    onEnter() {
      tkThrowT0 = -1;
    },
    triggers: [],
    objects: [
      // 煙突のついた丸い窯と、ろうそく(fg_deck。docs/assets/takarabune/fg_more.py)。窯のうしろとろうそくのマスはふさぐ
      tkFg("fg_deck", 62, 82, 69, 117, 197, tkDeckBob),
      tkFg("fg_deck", 143, 85, 19, 29, 113, tkDeckBob),
      // 帆は帆桁から頭の上に張られている。きーはその下をくぐるので、帆はいつもきーより手前。下にいるあいだは透かす
      // 2026-10-03、作者「宝船の帆の前後がおかしい。船の中も、港も。」
      {
        id: "sail",
        x: 361,
        y: 9.9 * T, // マップのいちばん下(いつもきーより手前)
        w: 1,
        h: 1,
        draw(ctx, sx, sy, t, api) {
          const im = api.image("fg_deck");
          if (!im) return;
          const pl = api.player();
          const under = pl.x > 331 - 14 && pl.x < 392 + 14 && pl.y > 48 && pl.y - 34 < 250;
          const ox = sx - this.x;
          const oy = sy - this.y + tkDeckBob();
          ctx.save();
          ctx.globalAlpha = under ? 0.45 : 1;
          ctx.drawImage(im, 330, 40, 64, 212, ox + 330, oy + 40, 64, 212);
          ctx.restore();
        },
      },
      tkSpot(
        "bow",
        17.4 * T,
        5 * T,
        (api) => {
          api.setFlag("sowing");
          api.takeItem("ペレット");
          tkThrowT0 = tkNow();
          TK_DECK._pel = api.image("pellet");
          // しぶきのあと、水の中へ。光りながら沈んでいくペレットを、水面から追いかけて最後の絵へ(D92)
          // 水面から寄ってきた絵が、そのままキメの一枚絵になる(A で閉じる)。一枚絵を出しなおさない(2026-10-03、作者「最後の絵の出方が2回でる」)
          api.later(2600, () =>
            api.burst(
              [{ img: "v_glow", sec: 3.2, z0: 2.4, z1: 1, cx: 240, cy: 36, cy1: 144, fadeIn: 0.9, ease: "out" }],
              () => {
                api.setFlag("sowing", false);
                api.setFlag("glowed");
                api.warp("port", "boat");
              },
              { hold: true }
            )
          );
        },
        { range: 56, canInteract: (api) => api.hasItem("ペレット") && !api.flag("sowing") && !api.flag("glowed") }
      ),
    ],
  };

  window.BOGI_WORLDS = {
    // 懲罰空間(ハブ)。ここから断片の世界に入り、戻ってくる
    void: {
      id: "void",
      name: "懲罰空間",
      hub: true,
      fragments: ["lake", "haihei", "kasumi", "banana", "suzuki", "takarabune"],
      fragmentTexts: Object.fromEntries(VOID_FRAGMENTS.map((f) => [f.id, f.text])),
      assetBase: "./assets/worlds/void/",
      images: {
        wang_void: "wang_void.png",
        pedestal: "pedestal.png",
        frag_lake: "frag_lake.png",
        frag_haihei: "frag_haihei.png",
        frag_kasumi: "frag_kasumi.png",
        frag_banana: "frag_banana.png",
        frag_suzuki: "frag_suzuki.png",
        frag_takarabune: "frag_takarabune.png",
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
      onEnterWorld(api) {
        api.setFlag("homeward", false);
      },
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
        s_sign_r: "s_sign_r.png",
        s_closed: "s_closed.png",
        s_sign_l: "s_sign_l.png",
        s_shard: "s_shard.png",
        k_wall: "k_wall.png",
        k_stove: "k_stove.png",
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
        k_poster: "k_poster.png",
        v_poster: "v_poster.png",
      },
      playerSprite: { img: "ki", cell: 64, frames: 7, footY: 17 },
      start: "road",
      startSpawn: "start",
      maps: { road: ROAD, lake: LAKE, shop: SHOP },
    },
    // 断片: 廃兵院(Hi Hey Win！)。きーの記憶の世界。凍った湖と富士山を終えると、懲罰空間に現れる
    // 条件: スタンプを3つ集めて景品をもらう → 屋上から文化祭を見る → 懲罰空間に帰る
    // 次の世界へのカギ: 道具「おたかぽっぽ」(スタンプの特典)
    haihei: {
      id: "haihei",
      name: "アンバリッド・ホテル", // ゲームの中では「廃兵院」と書かない(Hi Hey Win とアンバリッドのことば遊びで気づかせる)
      assetBase: "./assets/worlds/haihei/",
      images: Object.fromEntries(
        ["facade", "arch", "yakisoba", "wataame", "shateki", "uketsuke", "wheelchair", "crutch", "ginkgo", "ginkgo_big", "stage", "exhibit1", "exhibit2", "telescope", "tv_on", "tv_off", "iv", "legshelf", "oxyvase", "starchart", "photo_wedding", "photo_fighter", "d_family", "d_visitors", "poppo_row", "portrait", "bench", "clock", "firebucket", "plant", "rail", "tansu", "futon", "hibachi", "tricycle", "kyodai", "stairs", "door", "bed_f", "bonsai_table1", "bonsai_table2", "bed_h", "d_bedman_h", "cabinet_radio", "rwall", "rwall_p", "rwall_w", "aw", "aw_g", "aw_p", "aw_pg", "aw_w", "aw_wg", "aw_pw", "wheelchair_back", "prosthetic_rack", "workbench", "arm_stand", "deskphoto", "sunset", "noticeboard", "v_board", "guestbook", "v_guestbook", "wx_bed", "wx_chair", "wx_gramophone", "wx_lamp", "wx_teatable", "wx_rug", "rwallx", "rwallx_p", "rwallx_w", "art_fuji", "art_moon", "art_ginkgo", "art_blob", "art_self", "art_group", "art_banana", "art_squad", "art_roof", "cot", "radio", "wang_yard", "wang_ward",
          "d_uketsuke", "d_shateki", "d_yakisoba", "d_carver", "d_band1", "d_band2", "d_band3", "d_band4", "d_band5", "d_wheel", "d_bedman", "d_scope",
          "v_uketsuke", "v_yakisoba", "v_stall", "v_carver", "v_stage", "v_wheel", "v_bed", "v_cockpit", "v_photo_wedding", "v_photo_fighter", "v_view", "v_moon", "v_family", "v_wataame", "v_art_fuji", "v_art_moon", "v_art_ginkgo", "v_art_blob", "v_art_self", "v_art_group", "v_art_banana", "v_art_squad", "v_art_roof", "v_tv", "v_card_0", "v_card_1", "v_card_2", "v_card_3", "v_card_4", "v_card_5", "v_card_6", "v_card_7"]
          .map((k) => [k, `${k}.png`])
          .concat([["ki", "./assets/worlds/lake/ki_walk.png"]])
      ),
      playerSprite: { img: "ki", cell: 64, frames: 7, footY: 17 },
      start: "yard",
      startSpawn: "gate",
      maps: { yard: YARD, hall: HALL, watari: WATARI, ward: WARD, sick: ROOM_SICK, window: ROOM_WINDOW, room1: ROOM1, room2: ROOM2, workshop: ROOM_WORKSHOP, carver: ROOM_CARVER, roof: ROOF },
    },
    // 断片: 霞ヶ浦のエクラノプラン。廃兵院を終えると懲罰空間に現れる
    kasumi: {
      id: "kasumi",
      name: "霞ヶ浦のエクラノプラン",
      assetBase: "./assets/worlds/kasumi/",
      images: Object.fromEntries(
        ["bg_lotus", "bg_hangar", "bg_wing", "bg_cabin", "bg_cockpit", "fg_shore", "fg_hangar", "fg_cabin", "fg_cockpit", "crew_hawk", "crew_wagtail", "crew_rooster", "fl_sky", "fl_hills", "fl_wbase", "fl_ripple", "fl_mist", "fl_ekrano", "fl_ekrano_top", "fl_ekrano_shadow", "fl_lake", "v_flight", "v_summer", "photo_summer", "face_mummy"]
          .map((k) => [k, `${k}.png`])
          .concat([["bg_shore", "bg_shore.png"], ["ki", "./assets/worlds/lake/ki_walk.png"]])
      ),
      playerSprite: { img: "ki", cell: 64, frames: 7, footY: 17 },
      start: "lotus",
      startSpawn: "start",
      maps: { lotus: K_LOTUS, shore: K_SHORE, hangar: K_HANGAR, wing: K_WING, cabin: K_CABIN, cockpit: K_COCKPIT, flight: K_FLIGHT, tour: K_TOUR },
    },
    // 断片: 南極のバナナ農園。霞ヶ浦を終えると懲罰空間に現れる
    banana: {
      id: "banana",
      name: "南極のバナナ農園",
      assetBase: "./assets/worlds/banana/",
      onEnterWorld(api) {
        // 追いかけっこは入るたびに最初から(マンゴーを手に入れたあとは、そのまま)
        if (!api.flag("gotMango")) ["fledFarm", "fledCanal", "chirinJoined"].forEach((f) => api.setFlag(f, false));
      },
      images: Object.fromEntries(
        ["bg_shore", "bg_farm", "bg_canal", "bg_steps", "fg_shore", "fg_farm", "fg_canal", "fg_steps", "kikori", "chirin", "kikikori", "goron", "v_final"]
          .map((k) => [k, `${k}.png`])
          .concat([["ki", "./assets/worlds/lake/ki_walk.png"]])
      ),
      playerSprite: { img: "ki", cell: 64, frames: 7, footY: 17 },
      start: "shore",
      startSpawn: "start",
      maps: { shore: B_SHORE, farm: B_FARM, canal: B_CANAL, steps: B_STEPS },
    },
    // 断片: 荒川の鈴木商店。南極のバナナ農園を終えると懲罰空間に現れる
    suzuki: {
      id: "suzuki",
      name: "荒川の鈴木商店",
      assetBase: "./assets/worlds/suzuki/",
      images: Object.fromEntries(
        ["bg_stop", "bg_alley", "bg_shop", "bg_river", "bg_crater", "bg_orbit", "tetsubin", "v_inside", "v_rise3", "v_fall", "rise_sky", "rise_tube", "rise_earth", "rise_cloud", "v_denpyo", "v_nifuda", "v_nouhin"]
          .map((k) => [k, `${k}.png`])
          .concat([["ki", "./assets/worlds/lake/ki_walk.png"]])
      ),
      playerSprite: { img: "ki", cell: 64, frames: 7, footY: 17 },
      start: "stop",
      startSpawn: "start",
      maps: { stop: S_STOP, alley: S_ALLEY, shop: S_SHOP, river: S_RIVER, rise: S_RISE, orbit: S_ORBIT, space: S_SPACE, crater: S_CRATER },
      // 着地のあと、鉄瓶にお湯を注いでもらうまで、きーは真っ黒
      playerTint: (api) => (api.flag("charred") ? "rgba(22, 18, 18, 0.97)" : null),
      // 単結晶に入ってから流れ星になるまでの途中でやめていたら、入るところからやり直せるようにする
      onEnterWorld(api) {
        if (api.flag("launched") && !api.flag("fallen")) api.setFlag("launched", false);
      },
    },
    // 断片: 宝舟と首振りエンジン。荒川の鈴木商店を終えると懲罰空間に現れる
    takarabune: {
      id: "takarabune",
      name: "宝舟と首振りエンジン",
      assetBase: "./assets/worlds/takarabune/",
      images: Object.fromEntries(
        ["bg_port", "fg_port", "bg_workshop", "bg_gate", "fg_gate", "bg_admin", "bg_turbine", "fg_turbine", "bg_reactor", "fg_reactor", "bg_core", "bg_engineroom", "bg_deck", "fg_deck", "sea", "cyl", "fly", "bogi", "pellet", "conrod", "v_cast", "v_glow", "v_kaizu"]
          .map((k) => [k, `${k}.png`])
          .concat([["ki", "./assets/worlds/lake/ki_walk.png"]])
      ),
      playerSprite: { img: "ki", cell: 64, frames: 7, footY: 17 },
      start: "port",
      startSpawn: "start",
      maps: { port: TK_PORT, workshop: TK_WORKSHOP, gate: TK_GATE, admin: TK_ADMIN, turbine: TK_TURBINE, reactor: TK_REACTOR, core: TK_CORE, engineroom: TK_ENGINE, deck: TK_DECK },
      onEnterWorld(api) {
        // 作り直し(D88)の前に遊んだ記録は、最初から遊び直せるように消す(古い道具「燃料」と、その流れのフラグ)
        if (!api.flag("v2")) {
          ["cast", "fueled", "glowed", "sowing", "running", "installed"].forEach((f) => api.setFlag(f, false));
          ["燃料", "白紙の海図", "ペレット", "首振りエンジンの部品"].forEach((n) => api.takeItem(n));
          api.setFlag("v2");
        }
        // 道具の名前を「コンロッド」にした(D92 → D95)
        for (const old of ["首振りエンジンの部品", "ピストン"]) {
          if (api.hasItem(old)) {
            api.takeItem(old);
            api.giveItem("コンロッド");
          }
        }
        // 沖でペレットを投げている途中でやめていたら、投げるところからやり直せるようにする
        if (api.flag("sowing")) {
          api.setFlag("sowing", false);
          if (!api.flag("glowed")) api.giveItem("ペレット");
        }
      },
    },
  };
})();
