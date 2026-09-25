// 断片世界の定義。1つの断片 = 1つの世界。
// 台詞は say() に渡す配列で書く。文字列はナレーション、[話者, 台詞] は発話。
// ぼぎだぢは流ちょうに話さない。3つか4つの短い文で、口が悪い。
(function () {
  "use strict";

  const T = 64;

  window.BOGI_WORLDS = {
    // 断片: 凍った湖と富士山(きーの記憶の世界)
    // 条件: ちゃんの車の窓から記憶を見る → ほうとうを食べる → 懲罰空間に帰る
    // 次の世界へのカギ: 道具「氷のかけら」、ことば「金星の天気予報」
    lake: {
      id: "lake",
      name: "凍った湖と富士山",
      tile: T,
      bg: "#eaf2f7",
      assetBase: "./assets/worlds/lake/",
      images: {
        tile_ice: "tile_ice.png",
        tile_snow: "tile_snow.png",
        tile_road: "tile_road.png",
        fuji: "fuji.png",
        car: "car.png",
        houtou: "houtou.png",
        tires: "tires.png",
        shard: "shard.png",
        wang_lake: "wang_lake.png",
        ki: "./assets/ki_sprite_sheet.png",
        pi: "./assets/pi_sprite_sheet.png",
      },
      legend: {
        "#": { solid: true, terrain: "lower" }, // 富士山の書き割り。湖が向こうまで続いている扱い
        i: { img: "tile_ice", ice: true, wang: "shore", terrain: "lower" },
        ".": { img: "tile_snow", wang: "shore", terrain: "upper" },
        "=": { img: "tile_road" },
      },
      // 湖岸: 氷(lower) と 雪(upper) のWangタイル。キーは角 NW NE SW SE (1 = 雪)
      wang: {
        shore: {
          img: "wang_lake",
          size: 32,
          lookup: {"1101":[[0,0]],"1010":[[1,0]],"0100":[[2,0]],"1100":[[3,0]],"0110":[[0,1]],"1000":[[1,1]],"0000":[[2,1]],"0001":[[3,1]],"1011":[[0,2]],"0011":[[1,2]],"0010":[[2,2]],"0101":[[3,2]],"1111":[[0,3]],"1110":[[1,3]],"1001":[[2,3]],"0111":[[3,3]]},
        },
      },
      map: [
        "###############",
        "###############",
        "###############",
        "###############",
        "###############",
        "###############",
        "###############",
        "iiiiiiiiiiiiiii",
        "iiiiiiiiiiiiiii",
        ".iiiiiiiiiiiii.",
        "..iiiiiiiiiii..",
        "...iiiiiiiii...",
        "...............",
        "===============",
        "===============",
        "...............",
        "...............",
        "...............",
      ],
      // 富士山は、湖の向こうの書き割り
      backdrop: { img: "fuji", x: 0, y: -32, scale: 3, clipH: 7 * T },
      playerSprite: { img: "ki", cell: 128, frames: 8, rowEast: 1, rowWest: 2 },
      spawn: { x: 60, y: 13.6 * T, facing: "east" },

      onEnter(api) {
        if (api.flag("visited")) return;
        api.setFlag("visited");
        api.say(["凍った湖。むこうに、富士山。", "道路には、だれもいない。"]);
      },

      objects: [
        {
          id: "car",
          img: "car",
          x: 150,
          y: 12 * T - 6,
          w: 128,
          h: 96,
          solid: { w: 108, h: 44, dy: 18 },
          sortDy: 30,
          iy: 30,
          range: 110,
          label: "窓をのぞく",
          interact(api) {
            if (api.flag("memory")) {
              api.say(["窓は、もうくもっていない。", "なかには、だれもいない。"]);
              return;
            }
            api.say(
              [
                "雪をかぶった車。助手席の窓が、くもっている。",
                "窓に、鼻をおしつける。",
                "……あたたかい。",
                "窓のむこうを、湖と富士山がながれていく。",
                "となりから、ちゃんのにおい。音楽みたいなもの。",
                ["きー", "……だざいおさむん。"],
              ],
              () => api.setFlag("memory")
            );
          },
        },
        {
          id: "shard",
          img: "shard",
          x: 7.5 * T,
          y: 9.4 * T,
          w: 32,
          h: 32,
          bob: 3,
          range: 60,
          label: "ひろう",
          hidden: (api) => api.hasItem("氷のかけら"),
          interact(api) {
            api.say(["湖のまんなかに、氷のかけら。", "にぎっても、とけない。", "【氷のかけら】をもった。"], () =>
              api.giveItem("氷のかけら")
            );
          },
        },
        {
          id: "tires",
          img: "tires",
          x: 7 * T,
          y: 15.6 * T,
          w: 64,
          h: 64,
          solid: { w: 50, h: 26, dy: 14 },
          sortDy: 20,
        },
        {
          id: "pi",
          anim: { img: "pi", cell: 128, row: 2, frames: 8, fps: 3 },
          x: 8.3 * T,
          y: 15.5 * T,
          w: 72,
          h: 72,
          shadow: { dy: 26, rx: 20, ry: 6 },
          solid: { w: 40, h: 20, dy: 24 },
          sortDy: 26,
          range: 90,
          label: "はなす",
          interact(api) {
            if (api.flag("ate")) {
              api.say([["ぴー", "はらいっぱいか。"], ["ぴー", "おそいんだよ。"]]);
            } else if (api.flag("memory")) {
              api.say([
                ["ぴー", "車？"],
                ["ぴー", "タイヤ、四つついてたか。"],
                ["ぴー", "ついてたなら、おれのだ。"],
              ]);
            } else {
              api.say([
                ["ぴー", "どけ。"],
                ["ぴー", "そのタイヤ、おれのだ。"],
                ["ぴー", "湖？ しらねえ。すべるだけだ。"],
              ]);
            }
          },
        },
        {
          id: "houtou",
          img: "houtou",
          x: 12.4 * T,
          y: 16.1 * T,
          w: 192,
          h: 160,
          solid: { w: 150, h: 70, dy: 30 },
          sortDy: 60,
          ix: 20,
          iy: 70,
          range: 110,
          label: "のれんをくぐる",
          draw(ctx, sx, sy) {
            // 看板
            ctx.fillStyle = "#6b4a2b";
            ctx.fillRect(sx - 96, sy + 40, 58, 26);
            ctx.fillStyle = "#f3e6c8";
            ctx.fillRect(sx - 93, sy + 43, 52, 20);
            ctx.fillStyle = "#2a1c10";
            ctx.font = "bold 13px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("ほうとう", sx - 67, sy + 53);
          },
          interact(api) {
            if (api.flag("ate")) return;
            if (!api.flag("memory")) {
              api.say(["のれんが出ている。なかから、湯気とラジオの声。", "……はらは、へっていない。"]);
              return;
            }
            const pages = [
              "なかには、だれもいない。鍋だけが煮えている。",
              "鍋のなかで、木星の大気が煮込まれている。",
              "ほうとうを食べた。",
              ["ラジオ", "……あすの金星は、晴れ。最高気温、四百六十度。"],
              ["ラジオ", "おでかけの際は、氷をお持ちください。"],
              "【金星の天気予報】をおぼえた。",
            ];
            if (api.hasItem("氷のかけら")) pages.push("氷のかけらが、ひやりとした。");
            pages.push("湖の氷が、きしんだ。");
            api.say(pages, () => {
              api.learnWord("金星の天気予報");
              api.setFlag("ate");
              api.exit();
            });
          },
        },
      ],
    },
  };
})();
