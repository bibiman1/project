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
    facade: { img: "facade", w: 512, h: 176, top: 0, bottom: 168 },
    arch: { img: "arch", w: 128, h: 96, top: 3, bottom: 93 },
    yakisoba: { img: "yakisoba", w: 96, h: 96, top: 12, bottom: 82, solid: [72, 20] },
    wataame: { img: "wataame", w: 96, h: 96, top: 12, bottom: 84, solid: [66, 20] },
    shateki: { img: "shateki", w: 128, h: 96, top: 9, bottom: 87, solid: [86, 24] },
    uketsuke: { img: "uketsuke", w: 96, h: 64, top: 4, bottom: 60, solid: [64, 20] },
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
    iv: { img: "iv", w: 32, h: 64, top: 3, bottom: 62, solid: [12, 6] },
    legshelf: { img: "legshelf", w: 64, h: 64, top: 3, bottom: 56, solid: [46, 14] },
    oxyvase: { img: "oxyvase", w: 32, h: 32, top: 5, bottom: 31 },
    starchart: { img: "starchart", w: 32, h: 32, top: 0, bottom: 30 },
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
    bed_f: { img: "bed_f", w: 32, h: 64, top: 5, bottom: 59, solid: [26, 40] },
    cot: { img: "cot", w: 32, h: 32, top: 2, bottom: 32, solid: [20, 10] },
    d_uketsuke: { img: "d_uketsuke", w: 64, h: 64, top: 11, bottom: 54 },
    d_shateki: { img: "d_shateki", w: 64, h: 64, top: 5, bottom: 58, solid: [24, 10] },
    d_yakisoba: { img: "d_yakisoba", w: 64, h: 64, top: 4, bottom: 61, solid: [24, 10] },
    d_carver: { img: "d_carver", w: 64, h: 64, top: 10, bottom: 60, solid: [28, 10] },
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
      hat("facade", 9 * T, 5 * T),
      board("board_gate", 7 * T, 9.3 * T), // 中庭の奥、病棟への道の脇の掲示板(正面から見える)
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
      // 祭に来ていた市民: 綿あめを持った子と母
      dead("d_visitors", "visitors", 6.6 * T, 15.2 * T, "v_wataame"),
      hat("shateki", 13 * T, 11 * T, {
        // 景品棚の、見たことのないもの(鈴木商店の宇宙船殻用単結晶)。景品として受け取ると消える
        draw(ctx, sx, sy, t, api) {
          if (api.flag("prize")) return;
          const a = 0.55 + Math.sin(t * 3) * 0.35;
          ctx.fillStyle = `rgba(170, 230, 255, ${a})`;
          ctx.fillRect(sx - 6, sy - 6, 4, 6);
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          ctx.fillRect(sx - 5, sy - 5, 1, 2);
        },
      }),
      dead("d_shateki", "shateki", 15.6 * T, 11.7 * T, "v_stall", (api) => stamp(api, "stall")),
      racer("racer1", 14.1, 40, 90),
      crutchWalker("crutches", 12.6, 5 * T, 12 * T, 12),
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
      { id: "toWard", x: 15.4 * T, y: 7 * T, w: T, h: 2 * T, warp: { map: "ward", spawn: "west" } },
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
          stamp(api, "stage");
          hiHeyWin(api, [id, ...all.map((b) => b[1]).filter((b) => b !== id), "carver"]);
        }, { sortDy: 60, iy: 60, range: 56 })
      ),
      // 客席: 車椅子を一列に
      // 客席: 舞台のほうを向いた車椅子(こちらからは背中が見える)
      ...[5, 6.5, 8, 9.5, 11].map((c) => hat("wheelchair_back", c * T, 7.2 * T)),
      // 作品展示: 白い布を掛けた長机に、盆栽を並べる
      hat("bonsai_table1", 3 * T, 9.3 * T),
      hat("bonsai_table2", 3 * T, 10.9 * T),
      // 作りかけのおたかポッポ(手すさび)が並ぶ台
      hat("exhibit2", 11.5 * T, 9.5 * T, {
        id: "exhibit2",
        range: 36,
        interact(api) {
          api.mutter("ちゃん");
        },
      }),
      dead("d_carver", "carver", 13.5 * T, 10.5 * T, "v_carver", (api) => stamp(api, "exhibit")),
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
  // 廊下の作品展: 患者たちの絵と、写真
  const CORRIDOR_ARTS = [["fuji", 1.4], ["moon", 6.6], ["ginkgo", 9.4], ["roof", 14.6], ["blob", 17.4], ["self", 22.6], ["group", 25.4], ["banana", 30.6], ["squad", 33.4]];
  // ---- 廊下(個室のドアと、絵や写真の展示が並ぶ。途中に詰所、突き当たりに屋上への階段) ----
  // 病棟の片廊下: 北側に個室が幅8マス(内法7マス+仕切り)で並び、ドアは各部屋の中央。南側は一面のガラス窓
  const WARD_W = 44;
  const ROOM_MOD = 8;
  const DOORS = { sick: 4, window: 12, room1: 20, room2: 28, workshop: 36 }; // ドアの列
  const STAIR_C = 41; // 突き当たりの階段(2マス)
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
      { id: "toHall", x: -T, y: 2 * T, w: 1.5 * T, h: 2 * T, warp: { map: "hall", spawn: "east" } },
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
      // 屋上への階段(壁の開口部)
      hat("stairs", (STAIR_C + 1) * T, 2 * T, { sortDy: -40 }),
    ],
  };

  // ---- 個室(ドアから入り、下の出口から廊下へ戻る)。floor: "tatami" | "wood" | "western"(和室を洋風に改装) ----
  function room(key, floor, objects) {
    const western = floor === "western";
    const wood = floor === "wood" || western;
    const wall = western ? "rwallx" : wood ? "aw" : "rwall";
    return {
      tile: T,
      bg: "#1c1411",
      tintMul: "#f0c09a",
      tint: "rgba(255, 150, 70, 0.08)",
      map: ["PWWWPWWWP", "pwwwpwwwp", "X.......X", "X.......X", "X.......X", "X.......X", "XXXX.XXXX"],
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
  const ROOM_SICK = room("sick", "wood", [
    hat("bed_f", 1.5 * T, 4 * T),
    hat("oxyvase", 2.5 * T, 3 * T),
    dead("d_bedman", "bedman", 4.5 * T, 4 * T, "v_bed"),
    hat("iv", 5.5 * T, 3.9 * T, {
      id: "iv",
      range: 34,
      interact(api) {
        api.bubble("iv", "ちりん", 1800);
      },
    }),
    hat("bed_f", 7.5 * T, 4 * T),
    hat("starchart", 6.5 * T, 1.95 * T, { sortDy: -40 }),
    // 枕もとのラジオ。金星の天気予報
    hat("radio", 6.6 * T, 3.3 * T, {
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
  ]);
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
          if (!api.hasItem("宇宙船殻用単結晶")) {
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
        ["facade", "arch", "yakisoba", "wataame", "shateki", "uketsuke", "wheelchair", "crutch", "ginkgo", "stage", "exhibit1", "exhibit2", "telescope", "tv_on", "tv_off", "iv", "legshelf", "oxyvase", "starchart", "photo_wedding", "photo_fighter", "d_family", "d_visitors", "tansu", "futon", "hibachi", "tricycle", "kyodai", "stairs", "door", "bed_f", "bonsai_table1", "bonsai_table2", "rwall", "rwall_p", "rwall_w", "aw", "aw_g", "aw_p", "aw_pg", "aw_w", "aw_wg", "aw_pw", "wheelchair_back", "prosthetic_rack", "workbench", "arm_stand", "deskphoto", "sunset", "noticeboard", "v_board", "guestbook", "v_guestbook", "wx_bed", "wx_chair", "wx_gramophone", "wx_lamp", "wx_teatable", "wx_rug", "rwallx", "rwallx_p", "rwallx_w", "art_fuji", "art_moon", "art_ginkgo", "art_blob", "art_self", "art_group", "art_banana", "art_squad", "art_roof", "cot", "radio", "wang_yard", "wang_ward",
          "d_uketsuke", "d_shateki", "d_yakisoba", "d_carver", "d_band1", "d_band2", "d_band3", "d_band4", "d_band5", "d_wheel", "d_bedman", "d_scope",
          "v_uketsuke", "v_yakisoba", "v_stall", "v_carver", "v_stage", "v_wheel", "v_bed", "v_cockpit", "v_photo_wedding", "v_photo_fighter", "v_view", "v_moon", "v_family", "v_wataame", "v_art_fuji", "v_art_moon", "v_art_ginkgo", "v_art_blob", "v_art_self", "v_art_group", "v_art_banana", "v_art_squad", "v_art_roof", "v_tv"]
          .map((k) => [k, `${k}.png`])
          .concat([["ki", "./assets/worlds/lake/ki_walk.png"]])
      ),
      playerSprite: { img: "ki", cell: 64, frames: 7, footY: 17 },
      start: "yard",
      startSpawn: "gate",
      maps: { yard: YARD, hall: HALL, ward: WARD, sick: ROOM_SICK, window: ROOM_WINDOW, room1: ROOM1, room2: ROOM2, workshop: ROOM_WORKSHOP, roof: ROOF },
    },
  };
})();
