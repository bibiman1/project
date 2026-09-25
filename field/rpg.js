// 断片世界(見下ろし型RPG)のエンジン。
// 懲罰空間(script.js)の中で、断片に触れたときに遷移する別世界を動かす。
// 世界の中身(マップ・オブジェクト・イベント)は worlds.js に書く。
(function () {
  "use strict";

  const SPEED = 200; // px / sec
  const ICE_ACCEL = 1.4; // 氷の上: 入力への追従がゆるく、すべる
  const GROUND_ACCEL = 18;
  const FEET_W = 30;
  const FEET_H = 14;
  const PLAYER_DRAW = 72;

  function createRPG({ ctx, VW, VH, host }) {
    const images = {};
    let world = null;
    let player = null;
    let nearObj = null;

    function loadImage(key, src) {
      if (images[key]) return;
      const img = new Image();
      images[key] = { img, loaded: false };
      img.onload = () => {
        images[key].loaded = true;
      };
      img.src = src;
    }

    function img(key) {
      const e = images[key];
      return e && e.loaded ? e.img : null;
    }

    // イベント側から触る窓口
    function makeApi() {
      const w = world;
      const key = (name) => `${w.id}.${name}`;
      return {
        say(pages, onDone) {
          host.say(pages, onDone);
        },
        flag(name) {
          return !!host.state.flags[key(name)];
        },
        setFlag(name, value = true) {
          host.state.flags[key(name)] = value;
          host.save();
        },
        hasItem(name) {
          return host.state.items.includes(name);
        },
        giveItem(name) {
          if (!host.state.items.includes(name)) host.state.items.push(name);
          host.save();
        },
        hasWord(word) {
          return host.state.words.includes(word);
        },
        learnWord(word) {
          if (!host.state.words.includes(word)) host.state.words.push(word);
          host.save();
        },
        exit() {
          if (!host.state.cleared.includes(w.id)) host.state.cleared.push(w.id);
          host.save();
          host.exit(w.id);
        },
      };
    }

    function enter(def) {
      world = def;
      world.api = makeApi();
      for (const [k, src] of Object.entries(def.images)) {
        loadImage(k, src.startsWith(".") ? src : def.assetBase + src);
      }
      world.cols = def.map[0].length;
      world.rows = def.map.length;
      world.w = world.cols * def.tile;
      world.h = world.rows * def.tile;
      buildWang();
      player = {
        x: def.spawn.x,
        y: def.spawn.y,
        vx: 0,
        vy: 0,
        facing: def.spawn.facing || "east",
        moving: false,
      };
      nearObj = null;
      if (def.onEnter) def.onEnter(world.api);
    }

    // Wangタイル(角ベースのオートタイル)。セルの4つの角が「上の地形」かどうかでタイルを選ぶ。
    // 角は、その角に接するセルのうち1つでも上の地形(または別の地形)なら「上」。
    function buildWang() {
      world.wangCells = null;
      if (!world.wang) return;
      const isLower = (r, c) => {
        const t = world.legend[world.map[r][c]];
        // 描画しないセル(書き割りなど)も terrain: "lower" なら地続きとして扱う
        return !!(t && t.terrain === "lower");
      };
      const vertexUpper = (vr, vc) => {
        for (const [r, c] of [
          [vr - 1, vc - 1],
          [vr - 1, vc],
          [vr, vc - 1],
          [vr, vc],
        ]) {
          if (r < 0 || c < 0 || r >= world.rows || c >= world.cols) continue;
          if (!isLower(r, c)) return 1;
        }
        return 0;
      };
      world.wangCells = [];
      for (let r = 0; r < world.rows; r++) {
        const row = [];
        for (let c = 0; c < world.cols; c++) {
          const t = world.legend[world.map[r][c]];
          if (!t || !t.wang) {
            row.push(null);
            continue;
          }
          const key = `${vertexUpper(r, c)}${vertexUpper(r, c + 1)}${vertexUpper(r + 1, c)}${vertexUpper(r + 1, c + 1)}`;
          const set = world.wang[t.wang];
          const variants = set.lookup[key] || set.lookup[t.terrain === "lower" ? "0000" : "1111"];
          row.push({ set, rect: variants[(r * 7 + c * 13) % variants.length] });
        }
        world.wangCells.push(row);
      }
    }

    function leave() {
      world = null;
      player = null;
      nearObj = null;
    }

    function tileAt(px, py) {
      const c = Math.floor(px / world.tile);
      const r = Math.floor(py / world.tile);
      if (c < 0 || r < 0 || c >= world.cols || r >= world.rows) return null;
      return world.legend[world.map[r][c]] || null;
    }

    function visibleObjects() {
      return world.objects.filter((o) => !o.hidden || !o.hidden(world.api));
    }

    function solidAt(fx, fy) {
      const x0 = fx - FEET_W / 2;
      const x1 = fx + FEET_W / 2;
      const y0 = fy - FEET_H / 2;
      const y1 = fy + FEET_H / 2;
      for (const [cx, cy] of [
        [x0, y0],
        [x1, y0],
        [x0, y1],
        [x1, y1],
      ]) {
        const t = tileAt(cx, cy);
        if (!t || t.solid) return true;
      }
      for (const o of visibleObjects()) {
        if (solidObjectHit(o, x0, y0, x1, y1)) return true;
      }
      return false;
    }

    function solidObjectHit(o, x0, y0, x1, y1) {
      if (!o.solid) return false;
      const s = o.solid;
      const sx0 = o.x + (s.dx || 0) - s.w / 2;
      const sy0 = o.y + (s.dy || 0) - s.h / 2;
      return x1 > sx0 && x0 < sx0 + s.w && y1 > sy0 && y0 < sy0 + s.h;
    }

    function update(dt, t, input) {
      if (!world) return;
      const onIce = !!(tileAt(player.x, player.y) || {}).ice;
      const accel = onIce ? ICE_ACCEL : GROUND_ACCEL;
      const tx = input.x * SPEED;
      const ty = input.y * SPEED;
      const k = Math.min(1, accel * dt);
      player.vx += (tx - player.vx) * k;
      player.vy += (ty - player.vy) * k;
      if (!onIce && input.x === 0 && input.y === 0) {
        player.vx = 0;
        player.vy = 0;
      }

      const nx = player.x + player.vx * dt;
      if (!solidAt(nx, player.y)) player.x = nx;
      else player.vx = 0;
      const ny = player.y + player.vy * dt;
      if (!solidAt(player.x, ny)) player.y = ny;
      else player.vy = 0;

      player.moving = Math.hypot(player.vx, player.vy) > 8;
      if (input.x > 0.1) player.facing = "east";
      else if (input.x < -0.1) player.facing = "west";

      nearObj = null;
      let best = Infinity;
      for (const o of visibleObjects()) {
        if (!o.interact) continue;
        const ix = o.x + (o.ix || 0);
        const iy = o.y + (o.iy || 0);
        const d = Math.hypot(ix - player.x, iy - player.y);
        if (d <= (o.range || 90) && d < best) {
          best = d;
          nearObj = o;
        }
      }
    }

    function interact() {
      if (!world || !nearObj) return false;
      player.vx = 0;
      player.vy = 0;
      nearObj.interact(world.api);
      return true;
    }

    function camera() {
      const cx = world.w <= VW ? world.w / 2 : clamp(player.x, VW / 2, world.w - VW / 2);
      const cy = world.h <= VH ? world.h / 2 : clamp(player.y - 30, VH / 2, world.h - VH / 2);
      return { ox: Math.round(VW / 2 - cx), oy: Math.round(VH / 2 - cy) };
    }

    function draw(t) {
      if (!world) return;
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = world.bg || "#dfe8ee";
      ctx.fillRect(0, 0, VW, VH);
      const { ox, oy } = camera();
      const T = world.tile;

      const r0 = Math.max(0, Math.floor(-oy / T));
      const r1 = Math.min(world.rows - 1, Math.floor((VH - oy) / T));
      const c0 = Math.max(0, Math.floor(-ox / T));
      const c1 = Math.min(world.cols - 1, Math.floor((VW - ox) / T));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const tile = world.legend[world.map[r][c]];
          if (!tile) continue;
          const x = c * T + ox;
          const y = r * T + oy;
          const wc = world.wangCells && world.wangCells[r][c];
          if (wc) {
            const wim = img(wc.set.img);
            if (wim) {
              const sz = wc.set.size;
              ctx.drawImage(wim, wc.rect[0] * sz, wc.rect[1] * sz, sz, sz, x, y, T, T);
              continue;
            }
          }
          const im = tile.img && img(tile.img);
          if (im) ctx.drawImage(im, x, y, T, T);
          else if (tile.color) {
            ctx.fillStyle = tile.color;
            ctx.fillRect(x, y, T, T);
          }
        }
      }

      if (world.backdrop) {
        const b = world.backdrop;
        const im = img(b.img);
        if (im) {
          ctx.save();
          ctx.beginPath();
          ctx.rect(ox, oy, world.w, b.clipH);
          ctx.clip();
          ctx.drawImage(im, b.x + ox, b.y + oy, im.width * b.scale, im.height * b.scale);
          ctx.restore();
        }
      }

      // y順に並べて、手前のものほど後に描く
      const drawables = visibleObjects().map((o) => ({ y: o.y + (o.sortDy || 0), o }));
      drawables.push({ y: player.y, player: true });
      drawables.sort((a, b) => a.y - b.y);
      for (const d of drawables) {
        if (d.player) drawPlayer(ox, oy, t);
        else drawObject(d.o, ox, oy, t);
      }

      if (nearObj) drawHint(nearObj.label || "しらべる");
      if (world.drawOverlay) world.drawOverlay(ctx, { ox, oy, t, VW, VH, api: world.api });
    }

    function drawObject(o, ox, oy, t) {
      const sx = o.x + ox;
      const sy = o.y + oy;
      if (sx < -300 || sx > VW + 300 || sy < -300 || sy > VH + 300) return;
      if (o.shadow) {
        ctx.fillStyle = "rgba(40, 50, 60, 0.18)";
        ctx.beginPath();
        ctx.ellipse(sx, sy + o.shadow.dy, o.shadow.rx, o.shadow.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      if (o.anim) {
        const a = o.anim;
        const im = img(a.img);
        if (im) {
          const f = Math.floor(t * (a.fps || 4)) % a.frames;
          ctx.drawImage(im, f * a.cell, a.row * a.cell, a.cell, a.cell, sx - o.w / 2, sy - o.h / 2, o.w, o.h);
        }
      } else if (o.img) {
        const im = img(o.img);
        if (im) {
          const bob = o.bob ? Math.sin(t * 3) * o.bob : 0;
          ctx.drawImage(im, sx - o.w / 2, sy - o.h / 2 + bob, o.w, o.h);
        }
      }
      if (o.draw) o.draw(ctx, sx, sy, t, world.api);
    }

    function drawPlayer(ox, oy, t) {
      const p = world.playerSprite;
      const im = img(p.img);
      const sx = player.x + ox;
      const sy = player.y + oy;
      ctx.fillStyle = "rgba(40, 50, 60, 0.2)";
      ctx.beginPath();
      ctx.ellipse(sx, sy + 4, 20, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      if (!im) return;
      const row = player.facing === "west" ? p.rowWest : p.rowEast;
      const frame = Math.floor(t * (player.moving ? 8 : 3)) % p.frames;
      const bob = Math.sin(t * 6) * (player.moving ? 2 : 0.8);
      ctx.drawImage(
        im,
        frame * p.cell,
        row * p.cell,
        p.cell,
        p.cell,
        sx - PLAYER_DRAW / 2,
        sy - PLAYER_DRAW + 14 + bob,
        PLAYER_DRAW,
        PLAYER_DRAW
      );
    }

    function drawHint(label) {
      const text = `A / Enter : ${label}`;
      ctx.font = "bold 14px sans-serif";
      const w = ctx.measureText(text).width + 28;
      const x = VW / 2 - w / 2;
      const y = 16;
      ctx.fillStyle = "rgba(32, 32, 32, 0.72)";
      ctx.beginPath();
      ctx.roundRect(x, y, w, 30, 15);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, VW / 2, y + 15);
    }

    function clamp(v, a, b) {
      return Math.max(a, Math.min(b, v));
    }

    return {
      enter,
      leave,
      update,
      draw,
      interact,
      get active() {
        return !!world;
      },
      get worldName() {
        return world ? world.name : "";
      },
    };
  }

  window.createBogiRPG = createRPG;
})();
