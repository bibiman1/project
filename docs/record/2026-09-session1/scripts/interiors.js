  // ---- 講堂(舞台、客席の車椅子、作品展示) ----
  // マップチップに揃える: 物の中心は升目の中心、足もとは升目の境目に置く
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
      hat("stage", 8 * T, 5 * T),
      dead("d_band1", "band1", 6.5 * T, 4.2 * T, "v_stage", (api) => {
        stamp(api, "stage");
        hiHeyWin(api, ["band1", "band2", "carver"]);
      }, { sortDy: 60, iy: 60, range: 56 }),
      dead("d_band2", "band2", 9.5 * T, 4.2 * T, "v_stage", (api) => {
        stamp(api, "stage");
        hiHeyWin(api, ["band2", "band1", "carver"]);
      }, { sortDy: 60, iy: 60, range: 56 }),
      // 客席: 車椅子を一列に
      ...[5.5, 6.5, 7.5, 8.5, 9.5, 10.5].map((c) => hat("wheelchair", c * T, 7 * T)),
      // 作品展示: 盆栽をずらりと二列
      ...[1.5, 2.5, 3.5, 4.5, 5.5].map((c, i) => hat(`bonsai${(i % 5) + 1}`, c * T, 9 * T)),
      ...[1.5, 2.5, 3.5, 4.5, 5.5].map((c, i) => hat(`bonsai${((i + 2) % 5) + 1}`, c * T, 10.6 * T)),
      // 作りかけのおたかポッポ(手すさび)が並ぶ台
      hat("exhibit2", 11.5 * T, 9.5 * T, {
        id: "exhibit2",
        range: 36,
        interact(api) {
          api.mutter("ちゃん");
        },
      }),
      dead("d_carver", "carver", 13.5 * T, 10.5 * T, "v_carver", (api) => stamp(api, "exhibit")),
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

  // ---- 病棟(談話室、病室、窓辺、詰所、個室のドア、屋上への階段) ----
  const WARD_W = 38;
  const WARD = {
    tile: T,
    bg: "#1c1411",
    tintMul: "#f0c09a",
    tint: "rgba(255, 150, 70, 0.08)",
    map: [
      "Uu".repeat(WARD_W / 2),
      "Ll".repeat(WARD_W / 2),
      ...[2, 3, 4, 5, 6, 7].map((r) => (r === 5 || r === 6 ? "." : "X") + ".".repeat(WARD_W - 2) + "X"),
      "X".repeat(WARD_W),
    ],
    legend: {
      X: { solid: true, color: "#2a1d17", lowerOf: ["ward"] },
      U: { solid: true, img: "wall", crop: [0, 0] },
      L: { solid: true, img: "wall", crop: [0, 32] },
      u: { solid: true, img: "wall2", crop: [0, 0] },
      l: { solid: true, img: "wall2", crop: [0, 32] },
      ".": { wang: "ward", lowerOf: ["ward"] },
    },
    wang: { ward: { img: "wang_ward", size: 32, lookup: WANG16 } },
    spawns: {
      west: { x: 1 * T, y: 6 * T, facing: "east" },
      room1: { x: 27.5 * T, y: 2.8 * T, facing: "south" },
      room2: { x: 31.5 * T, y: 2.8 * T, facing: "south" },
    },
    triggers: [
      { id: "toHall", x: -T, y: 5 * T, w: 1.5 * T, h: 2 * T, warp: { map: "hall", spawn: "east" } },
      // 個室のドア: 入ると部屋に切り替わる
      { id: "toRoom1", x: 27.1 * T, y: 1.9 * T, w: 0.8 * T, h: 0.45 * T, warp: { map: "room1", spawn: "door" } },
      { id: "toRoom2", x: 31.1 * T, y: 1.9 * T, w: 0.8 * T, h: 0.45 * T, warp: { map: "room2", spawn: "door" } },
    ],
    objects: [
      // 談話室: 誰もいないのに「バナナ農園」を映しているテレビ
      hat("tv", 2.5 * T, 3 * T, {
        id: "tv",
        range: 40,
        interact(api) {
          api.bubble("tv", "……バナナ農園……", 3000);
        },
      }),
      dead("d_wheel", "wheel", 4.5 * T, 6 * T, "v_wheel"),
      // 病室: 壁ぎわにベッドを並べる
      hat("bed_f", 7.5 * T, 4 * T),
      hat("oxyvase", 8.5 * T, 3 * T),
      dead("d_bedman", "bedman", 9.5 * T, 4 * T, "v_bed"),
      hat("iv", 10.5 * T, 3.9 * T, {
        id: "iv",
        range: 34,
        interact(api) {
          api.bubble("iv", "ちりん", 1800);
        },
      }),
      hat("bed_f", 11.5 * T, 4 * T),
      hat("starchart", 12.5 * T, 1.95 * T, { sortDy: -40 }),
      // 窓辺: 枕元に焦げたぼぎのマスコット(コックピットの御守り)。空の一点を向いた望遠鏡
      hat("cot", 13.5 * T, 3 * T, {
        id: "charm",
        range: 34,
        interact(api) {
          api.show("v_cockpit");
        },
      }),
      dead("d_scope", "scope", 15 * T, 4 * T, "v_cockpit"),
      // 望遠鏡: 覗くと、月のまわりに輪
      hat("telescope", 16.5 * T, 3.5 * T, {
        id: "telescope",
        range: 36,
        interact(api) {
          api.show("v_moon");
        },
      }),
      // 窓辺の壁: クラシックな宇宙戦闘機の写真
      hat("photo_fighter", 15.5 * T, 1.95 * T, {
        id: "photo_fighter",
        sortDy: -40,
        iy: 20,
        range: 40,
        interact(api) {
          api.show("v_photo_fighter");
        },
      }),
      // 詰所: ナースコールを押すと、遠くでプロペラの音(ぼぎボマー)。ラジオは金星の天気予報
      hat("nursedesk", 20 * T, 3 * T, {
        id: "nursecall",
        range: 44,
        interact(api) {
          api.bubble("nursecall", "……ぶうううん……", 3000);
        },
      }),
      hat("radio", 22.5 * T, 3 * T, {
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
      // 叩くと木琴のように鳴る義足の棚
      hat("legshelf", 20 * T, 7.9 * T, {
        id: "legshelf",
        range: 40,
        interact(api) {
          api.bubble("legshelf", "ぽろん　ぽろん", 2200);
        },
      }),
      // 家族の個室のドア(廃兵院は生活の場。家族と暮らしていた)
      hat("door", 27.5 * T, 2 * T, { sortDy: -40 }),
      hat("door", 31.5 * T, 2 * T, { sortDy: -40 }),
      // 屋上への階段: 景品をもらったら上がれる
      hat("stairs", 36 * T, 2 * T, {
        id: "stairs",
        sortDy: -40,
        iy: 44,
        range: 44,
        interact(api) {
          if (!api.hasItem("宇宙船殻用単結晶")) {
            api.mutter("……");
            return;
          }
          // 二階: いまの高原の景色 → 文化祭の日の屋上の記憶
          api.show("v_view", () => {
            api.show("v_roof", () => {
              api.mutter("はい　へい　うぃん", 3000);
              api.later(2600, () => api.exit());
            });
          });
        },
      }),
    ],
  };

  // ---- 個室(畳の部屋。ドアから入り、下の出口から廊下へ戻る) ----
  function familyRoom(backSpawn, objects) {
    return {
      tile: T,
      bg: "#1c1411",
      tintMul: "#f0c09a",
      tint: "rgba(255, 150, 70, 0.08)",
      map: ["PAWAPAWAP", "papwapawp", "X.......X", "X.......X", "X.......X", "X.......X", "XXXX.XXXX"],
      legend: {
        X: { solid: true, color: "#2a1d17" },
        P: { solid: true, img: "rwall_p", crop: [0, 0] },
        p: { solid: true, img: "rwall_p", crop: [0, 32] },
        A: { solid: true, img: "rwall", crop: [0, 0] },
        a: { solid: true, img: "rwall", crop: [0, 32] },
        W: { solid: true, img: "rwall_w", crop: [0, 0] },
        w: { solid: true, img: "rwall_w", crop: [0, 32] },
        ".": { color: "#c2a86e" },
      },
      drawGround(ctx, ox, oy) {
        tatami(ctx, T + ox, 2 * T + oy, 7, 4);
        ctx.fillStyle = "#6b4a33"; // 出口の敷居
        ctx.fillRect(4 * T + ox, 6 * T + oy, T, 4);
      },
      spawns: { door: { x: 4.5 * T, y: 5.4 * T, facing: "north" } },
      triggers: [{ id: "out", x: 4 * T, y: 6.4 * T, w: T, h: T, warp: { map: "ward", spawn: backSpawn } }],
      objects,
    };
  }
  // 卓袱台を囲む一家。箪笥、鏡台、三輪車
  const ROOM1 = familyRoom("room1", [
    hat("tansu", 1.5 * T, 3 * T),
    hat("kyodai", 7.5 * T, 3 * T),
    dead("d_family", "family", 4.5 * T, 4 * T, "v_family"),
    hat("tricycle", 2.5 * T, 5 * T),
  ]);
  // たたんだ布団、火鉢、壁に結婚写真(宇宙軍の礼装と花嫁)
  const ROOM2 = familyRoom("room2", [
    hat("futon", 2.5 * T, 5 * T),
    hat("hibachi", 6.5 * T, 4 * T),
    hat("photo_wedding", 4.5 * T, 1.95 * T, {
      id: "photo_wedding",
      sortDy: -40,
      iy: 20,
      range: 40,
      interact(api) {
        api.show("v_photo_wedding");
      },
    }),
  ]);

