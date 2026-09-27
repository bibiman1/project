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
        // 一枚絵。A / Enter で閉じる。{ full: true } なら余白なしで画面いっぱいに(キメの一枚絵)
        show(imgKey, onDone, opts) {
          cutscene = { img: imgKey, t0: clock, onDone: onDone || null, full: !!(opts && opts.full) };
        },
        // カメラを y まで動かして、しばらく見せてから戻す
        pan(y, holdMs, onDone) {
          pan = { y, t0: clock, hold: holdMs / 1000, onDone: onDone || null, from: lastCamY };
        },
        toast(text, sec) {
          toast = { text, until: clock + (sec || 2.4) };
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
        // ジャンプを演出として跳ばせる(教わる場面など)
        hop() {
          jumpT0 = clock;
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

    // 進もうとした先がふさがっていても、横に少し(CORNER_SLIDE まで)ずらせば通れるなら、そちらへ寄せる。
    // スマホのジョイスティックでは狭い通り道にぴったり合わせにくいので
    const CORNER_SLIDE = 12;
    function slideAround(tx, ty, vertical, dt) {
      const step = SPEED * 0.7 * dt;
      for (let s = 2; s <= CORNER_SLIDE; s += 2) {
        for (const sign of [-1, 1]) {
          const ox = vertical ? tx + sign * s : tx;
          const oy = vertical ? ty : ty + sign * s;
          if (!solidAt(ox, oy) && !railHit(ox, oy)) {
            if (vertical) {
              const nx = player.x + sign * Math.min(step, s);
              if (!solidAt(nx, player.y)) player.x = nx;
            } else {
              const ny = player.y + sign * Math.min(step, s);
              if (!solidAt(player.x, ny)) player.y = ny;
            }
            return;
          }
        }
      }
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

    // ジャンプ(覚えたあと、B ボタン / X キー)。地図は map.onJump(api, player) で受け取れる
    const JUMP_TIME = 0.5;
    let jumpT0 = -1;
    function jumpHeight() {
      if (jumpT0 < 0) return 0;
      const u = (clock - jumpT0) / JUMP_TIME;
      if (u >= 1) return 0;
      return Math.sin(u * Math.PI) * 20;
    }
    function jump() {
      if (!world || !player || cutscene || pan) return false;
      if (!world.api.flag("jump")) return false;
      if (jumpT0 >= 0 && clock - jumpT0 < JUMP_TIME) return false;
      jumpT0 = clock;
      if (map.onJump) map.onJump(world.api, { x: player.x, y: player.y, facing: player.facing });
      return true;
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
      else {
        player.vx = 0;
        if (Math.abs(mvx) > Math.abs(mvy)) slideAround(nx, player.y, false, dt); // 角に少し引っかかったら、あいている側へずらす
      }
      const ny = player.y + mvy * dt;
      if (!solidAt(player.x, ny) && !railHit(player.x, ny)) player.y = ny;
      else {
        player.vy = 0;
        if (Math.abs(mvy) > Math.abs(mvx)) slideAround(player.x, ny, true, dt);
      }

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
      if (!map.hidePlayer) drawables.push({ y: player.y, player: true });
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
      bubblePlaced.length = 0; // 重なる吹き出しは上へ積む(このフレームで置いた位置)
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
      const jz = Math.round(jumpHeight()); // ジャンプ中は体だけ浮く(影は地面に残る)
      ctx.drawImage(im, frame * p.cell, row * p.cell, p.cell, p.cell, sx - p.cell / 2, sy - p.cell + p.footY - jz, p.cell, p.cell);
    }

    function headOf(who, ox, oy) {
      if (who === "player") return { x: player.x + ox, y: player.y + oy - 26 };
      const o = map.objects.find((x) => x.id === who);
      if (!o) return null;
      return { x: o.x + ox, y: o.y + oy - (o.headY || o.h / 2) };
    }

    const bubblePlaced = [];
    function drawBubble(b, ox, oy) {
      const h = headOf(b.who, ox, oy);
      if (!h) return;
      // 世界は ZOOM 倍で描いているので、画面の座標に直してからドット文字の窓を描く
      const s = PIX_S;
      const w = (bogiPix.width(b.text) + 16) * s;
      const hh = 30 * s; // 文字(17 ドット)が上下の真ん中に来る高さ
      const hx = Math.round(h.x * ZOOM);
      const bx = clamp(hx - w / 2, 6, VW - w - 6);
      const by0 = Math.max(4, Math.round(h.y * ZOOM) - hh - 6 * s); // 画面の上端より上には出さない
      // ほかの吹き出しと重なるなら段をずらす(かけ声のように何人もいっせいに話すとき)。
      // まず上へ、画面の上にはみ出すなら下へ。いちばん近い、あいている段に置く
      const step = hh + 2 * s;
      const free = (y) => y >= 4 && y + hh <= VH - 4 && !bubblePlaced.some((p) => bx < p.x + p.w && bx + w > p.x && y < p.y + p.h && y + hh > p.y);
      let by = by0;
      if (!free(by)) {
        for (let k = 1; k <= 6; k++) {
          if (free(by0 - k * step)) {
            by = by0 - k * step;
            break;
          }
          if (free(by0 + k * step)) {
            by = by0 + k * step;
            break;
          }
        }
      }
      by = clamp(by, 4, VH - hh - 4);
      bubblePlaced.push({ x: bx, y: by, w, h: hh });
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      bogiPix.win(ctx, bx, by, w, hh, s);
      // しっぽ(白い三角、ドット)。頭のすぐ上の段にあるときだけ出す
      if (by === by0) {
        ctx.fillStyle = "#fff";
        const tx = Math.round(hx / s) * s;
        const ty = Math.round((by + hh) / s) * s - s;
        for (let i = 0; i < 4; i++) ctx.fillRect(tx - (3 - i) * s, ty + i * s, (7 - i * 2) * s, s);
      }
      bogiPix.text(ctx, b.text, Math.round(bx / s) * s + 8 * s, Math.round(by / s) * s + 7 * s, s);
      ctx.restore();
    }

    // 調べられるものの上に、小さな印を出す(文字は出さない)。ほかの文字と同じく、ドットで描く
    function drawActionMark(o, ox, oy, t) {
      const h = headOf(o.id, ox, oy) || { x: o.x + ox, y: o.y + oy };
      const x = Math.round(h.x);
      const y = Math.round(h.y - 10 + (Math.sin(t * 5) > 0 ? 1 : 0));
      // 黒いふちの白い ▼(幅 7 ドット)。ふちは上辺・左右・下の先まで 1 ドット
      ctx.fillStyle = "#000";
      ctx.fillRect(x - 4, y - 1, 9, 1); // 上辺
      for (let i = 0; i < 5; i++) ctx.fillRect(x - 4 + i, y + i, 9 - i * 2, 1); // 左右と下の先
      ctx.fillStyle = "#fff";
      for (let i = 0; i < 4; i++) ctx.fillRect(x - 3 + i, y + i, 7 - i * 2, 1);
    }

    function drawSnow() {
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      for (const f of flakes) ctx.fillRect(Math.round(f.x), Math.round(f.y), f.s, f.s);
    }

    function drawToast() {
      const s = PIX_S;
      const w = (bogiPix.width(toast.text) + 20) * s;
      const h = 30 * s;
      const x = Math.round((VW - w) / 2 / s) * s;
      bogiPix.win(ctx, x, 8 * s, w, h, s);
      bogiPix.text(ctx, toast.text, x + 10 * s, 15 * s, s);
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
      const fit = cutscene.full
        ? Math.max(VW / im.width, VH / im.height) // 画面を覆う(はみ出した端は少し切れる)
        : Math.min((VW * 0.9) / im.width, (VH * 0.86) / im.height);
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
      jump,
      image: (key) => img(key), // 会話の顔の絵など、今の世界の画像を host から使う
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
        api: () => world && world.api,
      },
    };
  }

  // ---- ドット文字と窓(ゲームの中の文字はすべてこれで描く: スーファミのドラクエ風) ----
  // 12px のゴシックを 1 倍で描いて白黒の 2 値に落とし、s 倍に拡大して描く。窓は黒地に白の二重枠
  const bogiPix = (() => {
    // ドットで作られた字体(DotGothic16)を、その 16 ドットの升目どおりに描く。読み込めるまでは普通のゴシック
    const font = () =>
      `16px ${document.fonts && document.fonts.check("16px DotGothic16") ? '"DotGothic16", ' : ""}"Hiragino Kaku Gothic ProN", "Yu Gothic", "Meiryo", sans-serif`;
    const meas = document.createElement("canvas").getContext("2d");
    const cache = new Map();
    if (document.fonts && document.fonts.load) {
      document.fonts.load("16px DotGothic16").then(() => cache.clear()).catch(() => {});
    }
    function width(text) {
      meas.font = font();
      return Math.ceil(meas.measureText(text).width);
    }
    const GLYPH_PAD = 8;
    const GLYPH_H = 40;
    // この字体で、文字の上端がどの行に描かれるか(見本の文字で一度だけ測る)
    const inkTops = new Map();
    function inkTop() {
      const f = font();
      if (inkTops.has(f)) return inkTops.get(f);
      const c = document.createElement("canvas");
      c.width = 80;
      c.height = GLYPH_H;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.font = f;
      g.textBaseline = "top";
      g.fillStyle = "#fff";
      g.fillText("漢あAgy", 1, GLYPH_PAD);
      const d = g.getImageData(0, 0, c.width, c.height).data;
      let top = GLYPH_PAD;
      for (let y = 0; y < c.height; y++) {
        let hit = false;
        for (let x = 0; x < c.width; x++) if (d[(y * c.width + x) * 4 + 3] > 110) hit = true;
        if (hit) {
          top = y;
          break;
        }
      }
      inkTops.set(f, top);
      return top;
    }
    function glyphs(text, color = "#ffffff") {
      const key = `${color}|${text}`;
      let c = cache.get(key);
      if (c) return c;
      if (cache.size > 400) cache.clear();
      c = document.createElement("canvas");
      c.width = Math.max(1, width(text) + 2);
      // 下が切れないよう高さに余裕をとる(ブラウザによって文字の縦の位置がちがう。上端は inkTop() でそろえる)
      c.height = GLYPH_H;
      const g = c.getContext("2d", { willReadFrequently: true });
      g.font = font();
      g.textBaseline = "top";
      g.fillStyle = "#fff";
      g.fillText(text, 1, GLYPH_PAD);
      const img = g.getImageData(0, 0, c.width, c.height);
      const d = img.data;
      const [cr, cg, cb] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
      for (let i = 0; i < d.length; i += 4) {
        const on = d[i + 3] > 110;
        d[i] = cr;
        d[i + 1] = cg;
        d[i + 2] = cb;
        d[i + 3] = on ? 255 : 0;
      }
      g.putImageData(img, 0, 0);
      cache.set(key, c);
      return c;
    }
    // (x, y) は描く先の座標。s はドット 1 つの大きさ
    function text(ctx, str, x, y, s, color) {
      if (!str) return;
      const c = glyphs(str, color);
      const sm = ctx.imageSmoothingEnabled;
      ctx.imageSmoothingEnabled = false;
      // 文字の上端が (y - s) に来るように置く(どのブラウザでも同じ位置)
      ctx.drawImage(c, Math.round(x - s), Math.round(y - s - inkTop() * s), c.width * s, c.height * s);
      ctx.imageSmoothingEnabled = sm;
    }
    // 窓: (x, y, w, h) は描く先の座標(s の倍数にそろえる)
    function win(ctx, x, y, w, h, s) {
      x = Math.round(x / s) * s;
      y = Math.round(y / s) * s;
      w = Math.round(w / s) * s;
      h = Math.round(h / s) * s;
      // 黒地(四隅の 1 ドットは透かす)
      ctx.fillStyle = "#000";
      ctx.fillRect(x + 2 * s, y, w - 4 * s, h);
      ctx.fillRect(x, y + 2 * s, w, h - 4 * s);
      ctx.fillRect(x + s, y + s, w - 2 * s, h - 2 * s);
      ctx.fillStyle = "#fff";
      ctx.fillRect(x + 2 * s, y, w - 4 * s, 2 * s);
      ctx.fillRect(x + 2 * s, y + h - 2 * s, w - 4 * s, 2 * s);
      ctx.fillRect(x, y + 2 * s, 2 * s, h - 4 * s);
      ctx.fillRect(x + w - 2 * s, y + 2 * s, 2 * s, h - 4 * s);
      ctx.fillRect(x + s, y + s, s, s);
      ctx.fillRect(x + w - 2 * s, y + s, s, s);
      ctx.fillRect(x + s, y + h - 2 * s, s, s);
      ctx.fillRect(x + w - 2 * s, y + h - 2 * s, s, s);
      ctx.fillStyle = "#7a7a7a";
      ctx.fillRect(x + 3 * s, y + 3 * s, w - 6 * s, s);
      ctx.fillRect(x + 3 * s, y + h - 4 * s, w - 6 * s, s);
      ctx.fillRect(x + 3 * s, y + 3 * s, s, h - 6 * s);
      ctx.fillRect(x + w - 4 * s, y + 3 * s, s, h - 6 * s);
    }
    // 1 倍の幅 maxW で折り返した行の配列(改行も守る)
    function wrap(str, maxW) {
      meas.font = font();
      const lines = [];
      for (const para of String(str).split("\n")) {
        let line = "";
        for (const ch of para) {
          if (line && meas.measureText(line + ch).width > maxW) {
            // 句読点は行頭に来ないように前の行へ
            if ("、。」）！？…".includes(ch)) {
              lines.push(line + ch);
              line = "";
              continue;
            }
            lines.push(line);
            line = "";
          }
          line += ch;
        }
        lines.push(line);
      }
      return lines;
    }
    return { width, glyphs, text, win, wrap };
  })();
  window.bogiPix = bogiPix;
  // ゲーム画面の文字のドットの大きさ。マップの絵のドット(ZOOM 2)とそろえる(960×600 のキャンバスで 480×300 相当)
  const PIX_S = 2;

  window.createBogiRPG = createRPG;
})();
