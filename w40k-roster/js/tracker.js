// Battle progress tracker: one active game at a time, autosaved to localStorage.
(() => {
  let game = W40K.load(W40K.KEYS.GAME, null);

  const els = {};

  const cacheEls = () => {
    els.setup = document.getElementById("tracker-setup");
    els.active = document.getElementById("tracker-active");
    els.rosterSelect = document.getElementById("game-roster-select");
    els.heading = document.getElementById("tracker-heading");
    els.meta = document.getElementById("tracker-meta");
    els.roundValue = document.getElementById("round-value");
    els.cpMe = document.getElementById("cp-me");
    els.cpOpponent = document.getElementById("cp-opponent");
    els.vpMe = document.getElementById("vp-me");
    els.vpOpponent = document.getElementById("vp-opponent");
    els.unitList = document.getElementById("tracker-unit-list");
    els.logList = document.getElementById("log-list");
  };

  const persist = () => W40K.save(W40K.KEYS.GAME, game);

  const escapeHtml = (str) =>
    String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const refreshRosterOptions = () => {
    const rosters = W40K.Roster.getAll();
    els.rosterSelect.innerHTML = rosters
      .map((r) => `<option value="${r.id}">${escapeHtml(r.name)}</option>`)
      .join("");
  };

  const render = () => {
    if (!game) {
      els.setup.hidden = false;
      els.active.hidden = true;
      refreshRosterOptions();
      return;
    }
    els.setup.hidden = true;
    els.active.hidden = false;

    const roster = W40K.Roster.getById(game.rosterId);
    els.heading.textContent = `${roster ? roster.name : "ロスター不明"} vs ${game.opponentName || "対戦相手"}`;
    els.meta.textContent = `${game.missionName || "ミッション未設定"} ・ ${game.pointsLimit || "?"} pts`;

    els.roundValue.textContent = game.round;
    els.cpMe.textContent = game.cp.me;
    els.cpOpponent.textContent = game.cp.opponent;
    els.vpMe.textContent = game.vp.me;
    els.vpOpponent.textContent = game.vp.opponent;

    els.unitList.innerHTML = "";
    if (roster && roster.units.length) {
      roster.units.forEach((unit) => {
        const status = game.unitStatus[unit.id] || { destroyed: false, notes: "" };
        const row = document.createElement("article");
        row.className = "tracker-unit-row" + (status.destroyed ? " is-destroyed" : "");
        row.innerHTML = `
          <label class="unit-destroyed-toggle">
            <input type="checkbox" data-unit-toggle="${unit.id}" ${status.destroyed ? "checked" : ""}>
            <span>${escapeHtml(unit.name)}</span>
          </label>
          <input type="text" class="unit-status-notes" data-unit-notes="${unit.id}" placeholder="ダメージ・状態メモ" value="${escapeHtml(status.notes)}">
        `;
        els.unitList.appendChild(row);
      });

      els.unitList.querySelectorAll("[data-unit-toggle]").forEach((cb) => {
        cb.addEventListener("change", () => {
          const id = cb.dataset.unitToggle;
          game.unitStatus[id] = game.unitStatus[id] || { destroyed: false, notes: "" };
          game.unitStatus[id].destroyed = cb.checked;
          persist();
          render();
        });
      });
      els.unitList.querySelectorAll("[data-unit-notes]").forEach((input) => {
        input.addEventListener("change", () => {
          const id = input.dataset.unitNotes;
          game.unitStatus[id] = game.unitStatus[id] || { destroyed: false, notes: "" };
          game.unitStatus[id].notes = input.value;
          persist();
        });
      });
    } else {
      els.unitList.innerHTML = '<p class="empty-state">ユニットがありません。</p>';
    }

    els.logList.innerHTML = "";
    [...game.log].reverse().forEach((entry) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="log-round">R${entry.round}</span> ${escapeHtml(entry.text)}`;
      els.logList.appendChild(li);
    });
  };

  const startGame = ({ rosterId, opponentName, missionName, pointsLimit }) => {
    game = {
      id: W40K.uid(),
      rosterId,
      opponentName,
      missionName,
      pointsLimit,
      round: 1,
      cp: { me: 0, opponent: 0 },
      vp: { me: 0, opponent: 0 },
      unitStatus: {},
      log: [],
    };
    persist();
    render();
  };

  const endGame = () => {
    if (!confirm("この対戦を終了しますか？記録はクリアされます。")) return;
    game = null;
    W40K.save(W40K.KEYS.GAME, null);
    render();
  };

  const init = () => {
    cacheEls();

    document.getElementById("form-new-game").addEventListener("submit", (e) => {
      e.preventDefault();
      const rosterId = els.rosterSelect.value;
      if (!rosterId) {
        alert("先にロスターを作成してください。");
        return;
      }
      startGame({
        rosterId,
        opponentName: document.getElementById("game-opponent").value.trim(),
        missionName: document.getElementById("game-mission").value.trim(),
        pointsLimit: Number(document.getElementById("game-points").value) || 0,
      });
      e.target.reset();
    });

    document.getElementById("btn-end-game").addEventListener("click", endGame);

    document.getElementById("round-dec").addEventListener("click", () => {
      if (!game || game.round <= 1) return;
      game.round -= 1;
      persist();
      render();
    });
    document.getElementById("round-inc").addEventListener("click", () => {
      if (!game) return;
      game.round += 1;
      persist();
      render();
    });

    document.querySelectorAll("[data-cp]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!game) return;
        const side = btn.dataset.cp;
        const delta = Number(btn.dataset.delta);
        game.cp[side] = Math.max(0, game.cp[side] + delta);
        persist();
        render();
      });
    });
    document.querySelectorAll("[data-vp]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!game) return;
        const side = btn.dataset.vp;
        const delta = Number(btn.dataset.delta);
        game.vp[side] = Math.max(0, game.vp[side] + delta);
        persist();
        render();
      });
    });

    document.getElementById("form-log-entry").addEventListener("submit", (e) => {
      e.preventDefault();
      if (!game) return;
      const input = document.getElementById("log-entry-input");
      const text = input.value.trim();
      if (!text) return;
      game.log.push({ id: W40K.uid(), text, round: game.round, ts: Date.now() });
      persist();
      input.value = "";
      render();
    });

    document.addEventListener("w40k:rosters-changed", () => {
      if (!game) refreshRosterOptions();
    });

    render();
  };

  W40K.Tracker = { init };
})();
