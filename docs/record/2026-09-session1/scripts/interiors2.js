  // ---- 廊下(個室のドアが並ぶ。途中に詰所、突き当たりに屋上への階段) ----
  const WARD_W = 32;
  const DOORS = { sick: 4, window: 8, room1: 17, room2: 21 }; // ドアの列
  const WARD = {
    tile: T,
    bg: "#1c1411",
    tintMul: "#f0c09a",
    tint: "rgba(255, 150, 70, 0.08)",
    map: [
      "Uu".repeat(WARD_W / 2),
      "Ll".repeat(WARD_W / 2),
      "." + ".".repeat(WARD_W - 2) + "X",
      "." + ".".repeat(WARD_W - 2) + "X",
      "X" + ".".repeat(WARD_W - 2) + "X",
      "X".repeat(WARD_W),
    ],
    legend: {
      X: { solid: true, color: "#2a1d17", lowerOf: ["ward"] },
      U: { solid: true, img: "wall", crop: [0, 0], lowerOf: ["ward"] },
      L: { solid: true, img: "wall", crop: [0, 32], lowerOf: ["ward"] },
      u: { solid: true, img: "wall2", crop: [0, 0], lowerOf: ["ward"] },
      l: { solid: true, img: "wall2", crop: [0, 32], lowerOf: ["ward"] },
      ".": { wang: "ward", lowerOf: ["ward"] },
    },
    wang: { ward: { img: "wang_ward", size: 32, lookup: WANG16 } },
    spawns: Object.assign(
      { west: { x: 1 * T, y: 3.4 * T, facing: "east" } },
      Object.fromEntries(Object.entries(DOORS).map(([k, c]) => [k, { x: (c + 0.5) * T, y: 2.8 * T, facing: "south" }]))
    ),
    triggers: [
      { id: "toHall", x: -T, y: 2 * T, w: 1.5 * T, h: 2 * T, warp: { map: "hall", spawn: "east" } },
      // 個室のドア: 入ると部屋に切り替わる
      ...Object.entries(DOORS).map(([k, c]) => ({ id: `to_${k}`, x: (c + 0.1) * T, y: 1.9 * T, w: 0.8 * T, h: 0.45 * T, warp: { map: k, spawn: "door" } })),
    ],
    objects: [
      ...Object.values(DOORS).map((c) => hat("door", (c + 0.5) * T, 2 * T, { sortDy: -40 })),
      // からの車椅子が、廊下を走っていた
      dead("d_wheel", "wheel", 6.5 * T, 4.9 * T, "v_wheel"),
      // 詰所: ナースコールを押すと、遠くでプロペラの音(ぼぎボマー)。ラジオは金星の天気予報
      hat("nursedesk", 12 * T, 3 * T, {
        id: "nursecall",
        range: 44,
        interact(api) {
          api.bubble("nursecall", "……ぶうううん……", 3000);
        },
      }),
      hat("radio", 14 * T, 3 * T, {
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
      hat("legshelf", 25 * T, 3.4 * T, {
        id: "legshelf",
        range: 40,
        interact(api) {
          api.bubble("legshelf", "ぽろん　ぽろん", 2200);
        },
      }),
      // 屋上への階段: 景品をもらったら上がれる
      hat("stairs", 29 * T, 2 * T, {
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

  // ---- 個室(ドアから入り、下の出口から廊下へ戻る)。floor: "tatami" | "wood" ----
  function room(key, floor, objects) {
    const wood = floor === "wood";
    return {
      tile: T,
      bg: "#1c1411",
      tintMul: "#f0c09a",
      tint: "rgba(255, 150, 70, 0.08)",
      map: ["PAWAPAWAP", "papwapawp", "X.......X", "X.......X", "X.......X", "X.......X", "XXXX.XXXX"],
      legend: {
        X: { solid: true, color: "#2a1d17", lowerOf: ["ward"] },
        P: { solid: true, img: "rwall_p", crop: [0, 0], lowerOf: ["ward"] },
        p: { solid: true, img: "rwall_p", crop: [0, 32], lowerOf: ["ward"] },
        A: { solid: true, img: "rwall", crop: [0, 0], lowerOf: ["ward"] },
        a: { solid: true, img: "rwall", crop: [0, 32], lowerOf: ["ward"] },
        W: { solid: true, img: "rwall_w", crop: [0, 0], lowerOf: ["ward"] },
        w: { solid: true, img: "rwall_w", crop: [0, 32], lowerOf: ["ward"] },
        ".": wood ? { wang: "ward", lowerOf: ["ward"] } : { color: "#c2a86e" },
      },
      wang: { ward: { img: "wang_ward", size: 32, lookup: WANG16 } },
      drawGround(ctx, ox, oy) {
        if (!wood) tatami(ctx, T + ox, 2 * T + oy, 7, 4);
        ctx.fillStyle = "#6b4a33"; // 出口の敷居
        ctx.fillRect(4 * T + ox, 6 * T + oy, T, 4);
      },
      spawns: { door: { x: 4.5 * T, y: 5.4 * T, facing: "north" } },
      triggers: [{ id: "out", x: 4 * T, y: 6.4 * T, w: T, h: T, warp: { map: "ward", spawn: key } }],
      objects,
    };
  }
  const wallPhoto = (kind, x, vignette) =>
    hat(kind, x, 1.95 * T, {
      id: kind,
      sortDy: -40,
      iy: 20,
      range: 40,
      interact(api) {
        api.show(vignette);
      },
    });
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
  ]);
  // 窓辺の部屋: 枕元に焦げたぼぎのマスコット(コックピットの御守り)、空の一点を向いた望遠鏡、宇宙戦闘機の写真
  const ROOM_WINDOW = room("window", "wood", [
    hat("cot", 1.5 * T, 3 * T, {
      id: "charm",
      range: 34,
      interact(api) {
        api.show("v_cockpit");
      },
    }),
    dead("d_scope", "scope", 3.5 * T, 4.2 * T, "v_cockpit"),
    hat("telescope", 6.5 * T, 3.5 * T, {
      id: "telescope",
      range: 36,
      interact(api) {
        api.show("v_moon");
      },
    }),
    wallPhoto("photo_fighter", 4.5 * T, "v_photo_fighter"),
  ]);
  // 家族の部屋: 卓袱台を囲む一家。箪笥、鏡台、三輪車
  const ROOM1 = room("room1", "tatami", [
    hat("tansu", 1.5 * T, 3 * T),
    hat("kyodai", 7.5 * T, 3 * T),
    dead("d_family", "family", 4.5 * T, 4 * T, "v_family"),
    hat("tricycle", 2.5 * T, 5 * T),
  ]);
  // 家族の部屋: たたんだ布団、火鉢、壁に結婚写真(宇宙軍の礼装と花嫁)
  const ROOM2 = room("room2", "tatami", [
    hat("futon", 2.5 * T, 5 * T),
    hat("hibachi", 6.5 * T, 4 * T),
    wallPhoto("photo_wedding", 4.5 * T, "v_photo_wedding"),
  ]);

