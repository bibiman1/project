// 断片世界(見下ろし型RPG)のエンジン。
// 懲罰空間(script.js)の中で、断片に触れたときに遷移する別世界を動かす。
// 世界の中身(マップ・オブジェクト・イベント)は worlds.js に書く。
//
// 1つの世界は複数のマップを持ち、出入口(warp)でつながる。
// 言葉にたよらず見せるための道具: 吹き出し(bubble)、一枚絵(show)、カメラ(pan)。
(function () {
  "use strict";

  const SPEED = 150; // px / sec
  const ICE_ACCEL = 1.6; // 氷の上: 入力への追従がゆるく、すべる
  const FEET_W = 22;
  const FEET_H = 10;
  const DIR_ROW = { south: 0, north: 1, east: 2, west: 3 };
  // 世界は2倍に拡大して描く(スーファミ風に、ドットを大きく見せる)
  const ZOOM = 2;

  function createRPG({ ctx, VW, VH, host }) {
    const vw = VW / ZOOM;
    const vh = VH / ZOOM;
    const images = {};
    let world = null;
    let map = null;
    let player = null;
    let nearObj = null;
    let bubbles = [];
    let cutscene = null; // { img, t0, onDone }
    let pan = null; // { y, t0, hold, onDone }
    let toast = null; // { text, until }
    let clock = 0;
    let lastCamY = null;
    const flakes = [];
    for (let i = 0; i < 90; i++) {
      flakes.push({ x: Math.random() * vw, y: Math.random() * vh, s: 1 + Math.random() * 2, v: 18 + Math.random() * 30, p: Math.random() * 6 });
    }

    function loadImage(key, src) {
      if (images[key]) return;
      const img = new Image();
      images[key] = { img, loaded: false, done: false };
      img.onload = () => {
        images[key].loaded = true;
        images[key].done = true;
      };
      img.onerror = () => {
        images[key].done = true; // 読めなくても待ち続けない
      };
      img.src = src;
    }

    // いまの世界の画像がすべて読み終わったら cb を呼ぶ(最長 maxMs まで待つ)
    function whenReady(cb, maxMs = 8000) {
      const t0 = performance.now();
      const keys = world ? Object.keys(world.images) : [];
      const check = () => {
        const ok = keys.every((k) => !images[k] || images[k].done);
        if (ok || performance.now() - t0 > maxMs) cb();
        else setTimeout(check, 50);
      };
      check();
    }

    function img(key) {
      const e = images[key];
      return e && e.loaded ? e.img : null;
    }

    // ---- イベント側から触る窓口 ----
    function makeApi() {
      const w = world;
      const key = (name) => `${w.id}.${name}`;
      const api = {
        // 吹き出し。who: "player" またはオブジェクトid
        bubble(who, text, ms = 2600) {
          bubbles = bubbles.filter((b) => b.who !== who);
          bubbles.push({ who, text, until: clock + ms / 1000 });
        },
        // きーのつぶやき
        mutter(text, ms) {
          api.bubble("player", text, ms);
        },
        // 一枚絵。A / Enter で閉じる
        show(imgKey, onDone) {
          cutscene = { img: imgKey, t0: clock, onDone: onDone || null };
        },
        // カメラを y まで動かして、しばらく見せてから戻す
        pan(y, holdMs, onDone) {
          pan = { y, t0: clock, hold: holdMs / 1000, onDone: onDone || null, from: lastCamY };
        },
        toast(text) {
          toast = { text, until: clock + 2.4 };
        },
        say(pages, onDone) {
          host.say(pages, onDone);
        },
        later(ms, fn) {
          setTimeout(() => {
            if (world === w) fn();
          }, ms);
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
          api.toast(`${name}`);
        },
        hasWord(word) {
          return host.state.words.includes(word);
        },
        learnWord(word) {
          if (!host.state.words.includes(word)) host.state.words.push(word);
          host.save();
        },
        // 別の世界へ(懲罰空間の断片から)
        enterWorld(id) {
          host.enterWorld(id);
        },
        player() {
          return { x: player.x, y: player.y, facing: player.facing };
        },
        image(key) {
          return img(key);
        },
        // その断片の世界を終えたか
        cleared(id) {
          return host.state.cleared.includes(id);
        },
        warp(mapId, spawn) {
          host.fade(() => loadMap(mapId, spawn));
        },
        // 断片の条件を満たした(記録だけ。退出は出口から)
        clear() {
          if (!host.state.cleared.includes(w.id)) host.state.cleared.push(w.id);
          host.save();
        },
        // 懲罰空間へ戻る
        exit() {
          host.save();
          host.exit(w.id);
        },
      };
      return api;
    }

    function enter(def, spawnName) {
      world = def;
      world.api = makeApi();
      for (const [k, src] of Object.entries(def.images)) {
        loadImage(k, src.startsWith(".") ? src : def.assetBase + src);
      }
      bubbles = [];
      cutscene = null;
      pan = null;
      toast = null;
      if (def.onEnterWorld) def.onEnterWorld(world.api); // 入るたびに、その回だけの状態をリセットする
      loadMap(def.start, spawnName || def.startSpawn);
    }

    function loadMap(mapId, spawnName) {
      map = world.maps[mapId];
      map.id = mapId;
      if (!map.grid) map.grid = typeof map.map === "function" ? map.map() : map.map;
      map.cols = map.grid[0].length;
      map.rows = map.grid.length;
      map.w = map.cols * map.tile;
      map.h = map.rows * map.tile;
      if (!map.wangCells) buildWang(map);
      const sp = map.spawns[spawnName];
      player = { x: sp.x, y: sp.y, vx: 0, vy: 0, facing: sp.facing || "south", moving: false };
      bubbles = [];
      nearObj = null;
      lastCamY = null;
      for (const tr of map.triggers || []) tr.inside = true; // 出現位置で即発火しないように
      if (map.onEnter) map.onEnter(world.api);
    }

    function leave() {
      world = null;
      map = null;
      player = null;
      nearObj = null;
      cutscene = null;
      pan = null;
    }

    // Wangタイル(角ベースのオートタイル)。セルの4つの角が「上の地形」かどうかでタイルを選ぶ。
    // 角は、その角に接するセルのうち1つでも lower でないセルがあれば「上」。
    // 地形のペアごとに別のタイルセットを使うので、セルは自分の wang セットの lower かどうかで判定する。
    function buildWang(m) {
      m.wangCells = [];
      const isLowerFor = (setName, r, c) => {
        const t = m.legend[m.grid[r][c]];
        return !!(t && (t.lowerOf || []).includes(setName));
      };
      const vertexUpper = (setName, vr, vc) => {
        for (const [r, c] of [
          [vr - 1, vc - 1],
          [vr - 1, vc],
          [vr, vc - 1],
          [vr, vc],
        ]) {
          if (r < 0 || c < 0 || r >= m.rows || c >= m.cols) continue;
          if (!isLowerFor(setName, r, c)) return 1;
        }
        return 0;
      };
      for (let r = 0; r < m.rows; r++) {
        const row = [];
        for (let c = 0; c < m.cols; c++) {
          const t = m.legend[m.grid[r][c]];
          if (!t || !t.wang) {
            row.push(null);
            continue;
          }
          const s = t.wang;
          const key = `${vertexUpper(s, r, c)}${vertexUpper(s, r, c + 1)}${vertexUpper(s, r + 1, c)}${vertexUpper(s, r + 1, c + 1)}`;
          const set = m.wang[s];
          const variants = set.lookup[key] || set.lookup["1111"];
          row.push({ set, rect: variants[(r * 7 + c * 13) % variants.length] });
        }
        m.wangCells.push(row);
      }
    }

    function tileAt(px, py) {
      const c = Math.floor(px / map.tile);
      const r = Math.floor(py / map.tile);
      if (c < 0 || r < 0 || c >= map.cols || r >= map.rows) return null;
      return map.legend[map.grid[r][c]] || null;
    }

    function visibleObjects() {
      return map.objects.filter((o) => !o.hidden || !o.hidden(world.api));
    }

    // 線の壁(map.rails: 点列の配列)。ぶつかると、はじき返す
    const RAIL_R = 9;
    function railHit(fx, fy) {
      for (const run of map.rails || []) {
        for (let i = 0; i < run.length - 1; i++) {
          const [ax, ay] = run[i];
          const [bx, by] = run[i + 1];
          const dx = bx - ax;
          const dy = by - ay;
          const l2 = dx * dx + dy * dy || 1;
          const t = Math.max(0, Math.min(1, ((fx - ax) * dx + (fy - ay) * dy) / l2));
          const qx = ax + dx * t;
          const qy = ay + dy * t;
          const d = Math.hypot(fx - qx, fy - qy);
          if (d < RAIL_R) {
            // いまいる側へ、はじく
            let nx = player.x - qx;
            let ny = player.y - qy;
            const nl = Math.hypot(nx, ny) || 1;
            nx /= nl;
            ny /= nl;
            player.kx = nx * 230;
            player.ky = ny * 230;
            player.vx = 0;
            player.vy = 0;
            return true;
          }
        }
      }
      return false;
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
        if (!o.solid) continue;
        const s = o.solid;
        const sx0 = o.x + (s.dx || 0) - s.w / 2;
        const sy0 = o.y + (s.dy || 0) - s.h / 2;
        if (x1 > sx0 && x0 < sx0 + s.w && y1 > sy0 && y0 < sy0 + s.h) return true;
      }
      return false;
    }

    function busy() {
      return !!(cutscene || pan);
    }

    function update(dt, t, input) {
      if (!world) return;
      clock += dt;
      for (const f of flakes) {
        f.y += f.v * dt;
        f.x += Math.sin(clock * 0.8 + f.p) * 12 * dt;
        if (f.y > vh) {
          f.y = -4;
          f.x = Math.random() * vw;
        }
      }
      bubbles = bubbles.filter((b) => b.until > clock);
      for (const o of map.objects) if (o.update) o.update(dt, t, world.api);
      if (toast && toast.until < clock) toast = null;

      if (pan) {
        const el = clock - pan.t0;
        if (el > pan.hold + 2.4) {
          const done = pan.onDone;
          pan = null;
          if (done) done();
        }
        return;
      }
      if (cutscene) return;

      // すべる床: 氷のタイル、または map.slippery(true か、追従の強さの数値。小さいほどつるつる)
      const slip = map.slippery ? map.slippery(world.api, player.x, player.y) : false;
      const iceTile = !!(tileAt(player.x, player.y) || {}).ice;
      const onIce = iceTile || !!slip;
      const iceAccel = !iceTile && typeof slip === "number" ? slip : ICE_ACCEL;
      const tx = input.x * SPEED;
      const ty = input.y * SPEED;
      if (onIce) {
        const k = Math.min(1, iceAccel * dt);
        player.vx += (tx - player.vx) * k;
        player.vy += (ty - player.vy) * k;
      } else {
        player.vx = tx;
        player.vy = ty;
      }

      // はじかれた勢い(ガードレールなど)。少しずつ弱まる
      const kd = Math.exp(-7 * dt);
      player.kx = (player.kx || 0) * kd;
      player.ky = (player.ky || 0) * kd;
      const mvx = player.vx + player.kx;
      const mvy = player.vy + player.ky;

      const nx = player.x + mvx * dt;
      if (!solidAt(nx, player.y) && !railHit(nx, player.y)) player.x = nx;
      else player.vx = 0;
      const ny = player.y + mvy * dt;
      if (!solidAt(player.x, ny) && !railHit(player.x, ny)) player.y = ny;
      else player.vy = 0;

      player.moving = Math.hypot(player.vx, player.vy) > 8;
      if (Math.abs(input.x) > 0.1 || Math.abs(input.y) > 0.1) {
        if (Math.abs(input.x) > Math.abs(input.y)) player.facing = input.x > 0 ? "east" : "west";
        else player.facing = input.y > 0 ? "south" : "north";
      }

      // 範囲に入ると発火する仕掛け(出入口、景色が開ける場所など)
      for (const tr of map.triggers || []) {
        if (tr.enabled && !tr.enabled(world.api)) continue;
        const inside =
          player.x > tr.x && player.x < tr.x + tr.w && player.y > tr.y && player.y < tr.y + tr.h;
        if (inside && !tr.inside) {
          tr.inside = true;
          if (tr.warp) {
            world.api.warp(tr.warp.map, tr.warp.spawn);
            return;
          }
          if (tr.run && !(tr.once && world.api.flag(`trig.${tr.id}`))) {
            if (tr.once) world.api.setFlag(`trig.${tr.id}`);
            tr.run(world.api);
          }
        } else if (!inside) {
          tr.inside = false;
        }
      }

      nearObj = null;
      let best = Infinity;
      for (const o of visibleObjects()) {
        if (!o.interact && !o.near) continue;
        if (o.canInteract && !o.canInteract(world.api)) continue;
        // 距離は足もと(描画の基準点)からはかる
        const ix = o.x + (o.ix || 0);
        const iy = o.y + (o.iy != null ? o.iy : o.sortDy || 0);
        const d = Math.hypot(ix - player.x, iy - player.y);
        const r = o.range || 60;
        if (o.near) {
          const was = !!o._wasNear;
          o._wasNear = d <= (o.nearRange || r);
          if (o._wasNear && !was) o.near(world.api);
        }
        if (o.interact && d <= r && d < best) {
          best = d;
          nearObj = o;
        }
      }
    }

    function interact() {
      if (!world) return false;
      if (cutscene) {
        if (clock - cutscene.t0 < 0.6) return true;
        const done = cutscene.onDone;
        cutscene = null;
        if (done) done();
        return true;
      }
      if (pan || !nearObj) return false;
      player.vx = 0;
      player.vy = 0;
      nearObj.interact(world.api);
      return true;
    }

    function camera() {
      let cx = map.w <= vw ? map.w / 2 : clamp(player.x, vw / 2, map.w - vw / 2);
      let cy = map.h <= vh ? map.h / 2 : clamp(player.y - 12, vh / 2, map.h - vh / 2);
      if (pan) {
        const el = clock - pan.t0;
        const target = clamp(pan.y, vh / 2, Math.max(vh / 2, map.h - vh / 2));
        const from = pan.from == null ? cy : pan.from;
        let k;
        if (el < 1.2) k = ease(el / 1.2);
        else if (el < 1.2 + pan.hold) k = 1;
        else k = 1 - ease((el - 1.2 - pan.hold) / 1.2);
        cy = from + (target - from) * k;
      } else {
        lastCamY = cy;
      }
      return { ox: Math.round(vw / 2 - cx), oy: Math.round(vh / 2 - cy) };
    }

    function draw(t) {
      if (!world) return;
      ctx.imageSmoothingEnabled = false;
      ctx.fillStyle = map.bg || "#1b1a22";
      ctx.fillRect(0, 0, VW, VH);
      ctx.save();
      ctx.scale(ZOOM, ZOOM);
      const { ox, oy } = camera();
      const T = map.tile;

      if (map.backdrop) {
        const b = map.backdrop;
        const im = img(b.img);
        if (im) ctx.drawImage(im, b.x + ox, b.y + oy, im.width * b.scale, im.height * b.scale);
      }

      const r0 = Math.max(0, Math.floor(-oy / T));
      const r1 = Math.min(map.rows - 1, Math.floor((vh - oy) / T));
      const c0 = Math.max(0, Math.floor(-ox / T));
      const c1 = Math.min(map.cols - 1, Math.floor((vw - ox) / T));
      for (let r = r0; r <= r1; r++) {
        for (let c = c0; c <= c1; c++) {
          const tile = map.legend[map.grid[r][c]];
          if (!tile || tile.none) continue;
          const x = c * T + ox;
          const y = r * T + oy;
          const wc = map.wangCells[r][c];
          if (wc) {
            const wim = img(wc.set.img);
            if (wim) {
              const sz = wc.set.size;
              ctx.drawImage(wim, wc.rect[0] * sz, wc.rect[1] * sz, sz, sz, x, y, T, T);
              continue;
            }
          }
          const im = tile.img && img(tile.img);
          if (im) {
            if (tile.crop) ctx.drawImage(im, tile.crop[0], tile.crop[1], T, T, x, y, T, T);
            else ctx.drawImage(im, x, y, T, T);
          } else if (tile.color) {
            ctx.fillStyle = tile.color;
            ctx.fillRect(x, y, T, T);
          }
        }
      }

      if (map.drawGround) map.drawGround(ctx, ox, oy, img, world.api);

      // y順に並べて、手前のものほど後に描く
      const drawables = visibleObjects().map((o) => ({ y: o.y + (o.sortDy || 0), o }));
      drawables.push({ y: player.y, player: true });
      drawables.sort((a, b) => a.y - b.y);
      for (const d of drawables) {
        if (d.player) drawPlayer(ox, oy, t);
        else drawObject(d.o, ox, oy, t);
      }

      if (map.drawOverlay) map.drawOverlay(ctx, ox, oy, t, world.api);
      // 夕方などの色: tintMul は掛け合わせ(暗く、色をのせる)、tint は上から薄く重ねる
      if (map.tintMul) {
        ctx.globalCompositeOperation = "multiply";
        ctx.fillStyle = map.tintMul;
        ctx.fillRect(0, 0, vw, vh);
        ctx.globalCompositeOperation = "source-over";
      }
      if (map.tint) {
        ctx.fillStyle = map.tint;
        ctx.fillRect(0, 0, vw, vh);
      }
      if (map.snow) drawSnow();
      for (const b of bubbles) drawBubble(b, ox, oy);
      if (nearObj && !busy()) drawActionMark(nearObj, ox, oy, t);
      ctx.restore();
      if (toast) drawToast();
      if (cutscene) drawCutscene();
    }

    function drawObject(o, ox, oy, t) {
      const sx = Math.round(o.x + ox);
      const sy = Math.round(o.y + oy);
      if (sx < -200 || sx > vw + 200 || sy < -200 || sy > vh + 200) return;
      if (o.shadow) {
        ctx.fillStyle = "rgba(40, 50, 70, 0.22)";
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
          const bob = o.bob ? Math.round(Math.sin(t * 3) * o.bob) : 0;
          ctx.drawImage(im, sx - o.w / 2, sy - o.h / 2 + bob, o.w, o.h);
        }
      }
      if (o.draw) o.draw(ctx, sx, sy, t, world.api);
    }

    function drawPlayer(ox, oy, t) {
      const p = world.playerSprite;
      const im = img(p.img);
      const sx = Math.round(player.x + ox);
      const sy = Math.round(player.y + oy);
      ctx.fillStyle = "rgba(40, 50, 70, 0.25)";
      ctx.beginPath();
      ctx.ellipse(sx, sy + 1, 9, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      if (!im) return;
      const row = DIR_ROW[player.facing];
      const frame = player.moving ? 1 + (Math.floor(t * 10) % (p.frames - 1)) : 0;
      ctx.drawImage(im, frame * p.cell, row * p.cell, p.cell, p.cell, sx - p.cell / 2, sy - p.cell + p.footY, p.cell, p.cell);
    }

    function headOf(who, ox, oy) {
      if (who === "player") return { x: player.x + ox, y: player.y + oy - 26 };
      const o = map.objects.find((x) => x.id === who);
      if (!o) return null;
      return { x: o.x + ox, y: o.y + oy - (o.headY || o.h / 2) };
    }

    function drawBubble(b, ox, oy) {
      const h = headOf(b.who, ox, oy);
      if (!h) return;
      ctx.font = "bold 9px sans-serif";
      const w = Math.max(20, Math.ceil(ctx.measureText(b.text).width) + 12);
      const bx = Math.round(clamp(h.x - w / 2, 3, vw - w - 3));
      const by = Math.round(h.y - 22);
      const hx = Math.round(h.x);
      ctx.fillStyle = "#fffdf6";
      ctx.strokeStyle = "#2a2230";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx + 0.5, by + 0.5, w, 15, 3);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(hx - 3.5, by + 15.5);
      ctx.lineTo(hx + 0.5, by + 20.5);
      ctx.lineTo(hx + 3.5, by + 15.5);
      ctx.fill();
      ctx.stroke();
      ctx.fillRect(hx - 3, by + 14, 6, 2);
      ctx.fillStyle = "#2a2230";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(b.text, bx + w / 2 + 0.5, by + 8.5);
    }

    // 調べられるものの上に、小さな印を出す(文字は出さない)
    function drawActionMark(o, ox, oy, t) {
      const h = headOf(o.id, ox, oy) || { x: o.x + ox, y: o.y + oy };
      const x = Math.round(h.x);
      const y = Math.round(h.y - 6 + Math.sin(t * 5) * 2);
      ctx.fillStyle = "#fffdf6";
      ctx.strokeStyle = "#2a2230";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x - 4, y - 5);
      ctx.lineTo(x + 4, y - 5);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    function drawSnow() {
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      for (const f of flakes) ctx.fillRect(Math.round(f.x), Math.round(f.y), f.s, f.s);
    }

    function drawToast() {
      ctx.font = "bold 14px sans-serif";
      const w = ctx.measureText(toast.text).width + 36;
      const x = VW / 2 - w / 2;
      ctx.fillStyle = "rgba(20, 18, 30, 0.8)";
      ctx.beginPath();
      ctx.roundRect(x, 18, w, 30, 4);
      ctx.fill();
      ctx.fillStyle = "#e8f4ff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`◆ ${toast.text}`, VW / 2, 33);
    }

    function drawCutscene() {
      const el = clock - cutscene.t0;
      const a = Math.min(1, el / 0.6);
      ctx.fillStyle = `rgba(8, 8, 12, ${0.92 * a})`;
      ctx.fillRect(0, 0, VW, VH);
      const im = img(cutscene.img);
      if (!im) return;
      // 枠の角の丸みやスマホのボタンで端が欠けないよう、まわりに余白を残して描く。
      // 整数倍でくっきり拡大してから、余白に収まる大きさへなめらかに縮める
      const fit = Math.min((VW * 0.9) / im.width, (VH * 0.86) / im.height);
      const s = Math.max(1, Math.ceil(fit));
      if (!cutscene.buf || cutscene.buf.src !== im) {
        const c = document.createElement("canvas");
        c.width = im.width * s;
        c.height = im.height * s;
        const g = c.getContext("2d");
        g.imageSmoothingEnabled = false;
        g.drawImage(im, 0, 0, c.width, c.height);
        cutscene.buf = { src: im, canvas: c };
      }
      const w = Math.round(im.width * fit);
      const h = Math.round(im.height * fit);
      ctx.globalAlpha = a;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(cutscene.buf.canvas, Math.round((VW - w) / 2), Math.round((VH - h) / 2), w, h);
      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = 1;
    }

    function clamp(v, a, b) {
      return Math.max(a, Math.min(b, v));
    }

    function ease(x) {
      const k = clamp(x, 0, 1);
      return k * k * (3 - 2 * k);
    }

    return {
      enter,
      leave,
      whenReady,
      update,
      draw,
      interact,
      get active() {
        return !!world;
      },
      // 一枚絵を見ているあいだ
      get viewing() {
        return !!cutscene;
      },
      get isHub() {
        return !!(world && world.hub);
      },
      get worldName() {
        return world ? world.name : "";
      },
      // テスト用: 現在の状態をのぞく / 位置を動かす
      debug: {
        state: () => ({ map: map && map.id, x: player && player.x, y: player && player.y, near: nearObj && nearObj.id }),
        teleport(x, y) {
          player.x = x;
          player.y = y;
        },
        load: (mapId, spawn) => loadMap(mapId, spawn),
      },
    };
  }

  window.createBogiRPG = createRPG;
})();
