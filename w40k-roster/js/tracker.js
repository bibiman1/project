// Battle progress tracker: one active game at a time, autosaved to localStorage.
(() => {
  let game = W40K.load(W40K.KEYS.GAME, null);

  const PHASES = ["指揮フェイズ", "移動フェイズ", "射撃フェイズ", "突撃フェイズ", "白兵フェイズ"];

  const DEFAULT_CHECKLIST = {
    "指揮フェイズ": ["コアCPの獲得を忘れずに", "戦闘ショック状態のユニットの戦闘ショックロールを実行", "使用する指揮アビリティを検討"],
    "移動フェイズ": ["戦略的予備兵力の入場を忘れずに", "移動タイプ（静止・通常移動・全力移動・退却移動）を確認"],
    "射撃フェイズ": ["対応能力（オーバーウォッチ等）を確認", "射線・遮蔽物を確認"],
    "突撃フェイズ": ["突撃距離をロール", "介入の可否を確認"],
    "白兵フェイズ": ["ファイトファースト対象を確認", "戦闘ボーナス発動を確認"],
  };

  let checklistTemplate = W40K.load(W40K.KEYS.PHASE_CHECKLIST, null);
  if (!checklistTemplate) {
    checklistTemplate = {};
    PHASES.forEach((phase) => {
      checklistTemplate[phase] = DEFAULT_CHECKLIST[phase].map((text) => ({ id: W40K.uid(), text }));
    });
  }
  const persistTemplate = () => W40K.save(W40K.KEYS.PHASE_CHECKLIST, checklistTemplate);
  persistTemplate();

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
    els.phaseTabs = document.getElementById("phase-tabs");
    els.phaseItems = document.getElementById("phase-checklist-items");
    els.stratagemSelect = document.getElementById("stratagem-use-select");
    els.groupBuffCard = document.getElementById("group-buff-card");
    els.groupBuffTrackerList = document.getElementById("group-buff-tracker-list");
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
            <span>${escapeHtml(unit.name)}${unit.group ? ` <span class="unit-group-badge">🔗${escapeHtml(unit.group)}</span>` : ""}</span>
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

    const stratagems = roster ? roster.stratagems : [];
    if (stratagems.length === 0) {
      els.stratagemSelect.innerHTML = '<option value="">ストラタジム未登録</option>';
      els.stratagemSelect.disabled = true;
    } else {
      els.stratagemSelect.disabled = false;
      els.stratagemSelect.innerHTML = stratagems
        .map((s) => `<option value="${s.id}">${escapeHtml(s.name)} (CP${s.cost})</option>`)
        .join("");
    }

    renderPhaseChecklist();
    renderGroupBuffs(roster);
  };

  const renderGroupBuffs = (roster) => {
    if (!roster) {
      els.groupBuffCard.hidden = true;
      return;
    }
    const groups = [...new Set(roster.units.filter((u) => u.group).map((u) => u.group))];
    if (groups.length === 0) {
      els.groupBuffCard.hidden = true;
      return;
    }
    els.groupBuffCard.hidden = false;
    if (!game.groupBuffSelections) game.groupBuffSelections = {};

    els.groupBuffTrackerList.innerHTML = groups
      .map((group) => {
        const options = roster.groupBuffs.filter((o) => o.group === group);
        const selectedId = game.groupBuffSelections[group] || "";
        const selectHtml = `<select data-buff-group="${escapeHtml(group)}" ${options.length === 0 ? "disabled" : ""}>
          <option value="">${options.length === 0 ? "バフ未登録" : "なし"}</option>
          ${options.map((o) => `<option value="${o.id}" ${o.id === selectedId ? "selected" : ""}>${escapeHtml(o.name)}</option>`).join("")}
        </select>`;
        const selectedOption = options.find((o) => o.id === selectedId);
        const effectsHtml = selectedOption ? renderBuffEffects(roster, selectedOption) : "";
        return `<div class="group-buff-row">
          <div class="group-buff-row-head">🔗 <strong>${escapeHtml(group)}</strong> ${selectHtml}</div>
          ${effectsHtml}
        </div>`;
      })
      .join("");

    els.groupBuffTrackerList.querySelectorAll("[data-buff-group]").forEach((sel) => {
      sel.addEventListener("change", () => {
        game.groupBuffSelections[sel.dataset.buffGroup] = sel.value;
        persist();
        render();
      });
    });
  };

  const renderBuffEffects = (roster, option) => {
    const byUnit = {};
    option.modifiers.forEach((m) => {
      (byUnit[m.targetUnit] = byUnit[m.targetUnit] || []).push(m);
    });
    return `<ul class="group-buff-effects">
      ${Object.entries(byUnit)
        .map(([unitName, mods]) => {
          const unit = roster.units.find((u) => u.name === unitName);
          const lines = mods.map((m) => describeModifierEffect(unit, m));
          return `<li><strong>${escapeHtml(unitName)}</strong><ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul></li>`;
        })
        .join("")}
    </ul>`;
  };

  const describeModifierEffect = (unit, m) => {
    if (m.kind === "note") return `📝 ${escapeHtml(m.value)}`;
    if (m.kind === "keyword") {
      const scopeLabel = m.scope === "melee" ? "白兵武器" : "射撃武器";
      return `🔖 追加キーワード（${scopeLabel}）: ${escapeHtml(m.value)}`;
    }
    const delta = Number(m.value) || 0;
    const fieldLabel = m.scope === "profile" ? W40K.PROFILE_FIELD_LABELS[m.field] || m.field : W40K.WEAPON_FIELD_LABELS[m.field] || m.field;
    if (m.scope === "profile") {
      const base = unit?.profile?.[m.field] || "-";
      const newVal = W40K.applyStatDelta(base, delta);
      return `${fieldLabel}: ${escapeHtml(base)} → <strong>${escapeHtml(newVal)}</strong>`;
    }
    const weapons = (unit?.weapons || []).filter((w) => w.type === m.scope);
    if (weapons.length === 0) return `${fieldLabel}${delta >= 0 ? "+" : ""}${delta}（対象武器が見つかりません）`;
    return weapons
      .map((w) => {
        const base = w[m.field] || "-";
        const newVal = W40K.applyStatDelta(base, delta);
        return `${escapeHtml(w.name)} ${fieldLabel}: ${escapeHtml(base)} → <strong>${escapeHtml(newVal)}</strong>`;
      })
      .join("<br>");
  };

  const renderPhaseChecklist = () => {
    if (!game.currentPhase) game.currentPhase = PHASES[0];
    if (!game.checkedItems) game.checkedItems = {};

    els.phaseTabs.innerHTML = PHASES.map(
      (phase) =>
        `<button type="button" class="btn btn-ghost btn-sm phase-tab-btn${phase === game.currentPhase ? " is-active" : ""}" data-phase="${escapeHtml(phase)}">${escapeHtml(phase)}</button>`
    ).join("");
    els.phaseTabs.querySelectorAll("[data-phase]").forEach((btn) => {
      btn.addEventListener("click", () => {
        game.currentPhase = btn.dataset.phase;
        persist();
        render();
      });
    });

    const items = checklistTemplate[game.currentPhase] || [];
    const checkedForPhase = game.checkedItems[game.currentPhase] || {};

    els.phaseItems.innerHTML = "";
    if (items.length === 0) {
      els.phaseItems.innerHTML = '<p class="empty-state">このフェイズの項目がまだありません。下のフォームから追加してください。</p>';
      return;
    }
    items.forEach((item) => {
      const checked = !!checkedForPhase[item.id];
      const row = document.createElement("div");
      row.className = "phase-checklist-item" + (checked ? " is-checked" : "");
      row.innerHTML = `
        <label>
          <input type="checkbox" data-check-item="${item.id}" ${checked ? "checked" : ""}>
          <span>${escapeHtml(item.text)}</span>
        </label>
        <button type="button" class="btn btn-danger btn-sm" data-remove-item="${item.id}">削除</button>
      `;
      els.phaseItems.appendChild(row);
    });

    els.phaseItems.querySelectorAll("[data-check-item]").forEach((cb) => {
      cb.addEventListener("change", () => {
        const id = cb.dataset.checkItem;
        game.checkedItems[game.currentPhase] = game.checkedItems[game.currentPhase] || {};
        game.checkedItems[game.currentPhase][id] = cb.checked;
        persist();
        render();
      });
    });
    els.phaseItems.querySelectorAll("[data-remove-item]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.removeItem;
        checklistTemplate[game.currentPhase] = checklistTemplate[game.currentPhase].filter((it) => it.id !== id);
        persistTemplate();
        render();
      });
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
      currentPhase: PHASES[0],
      checkedItems: {},
      groupBuffSelections: {},
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
      game.checkedItems = {};
      persist();
      render();
    });
    document.getElementById("round-inc").addEventListener("click", () => {
      if (!game) return;
      game.round += 1;
      game.checkedItems = {};
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

    document.getElementById("btn-use-stratagem").addEventListener("click", () => {
      if (!game) return;
      const roster = W40K.Roster.getById(game.rosterId);
      const stratagem = roster?.stratagems.find((s) => s.id === els.stratagemSelect.value);
      if (!stratagem) return;
      game.cp.me = Math.max(0, game.cp.me - stratagem.cost);
      game.log.push({ id: W40K.uid(), text: `ストラタジム使用: ${stratagem.name} (CP${stratagem.cost})`, round: game.round, ts: Date.now() });
      persist();
      render();
    });

    document.getElementById("form-phase-item").addEventListener("submit", (e) => {
      e.preventDefault();
      if (!game) return;
      if (!game.currentPhase) game.currentPhase = PHASES[0];
      const input = document.getElementById("phase-item-input");
      const text = input.value.trim();
      if (!text) return;
      checklistTemplate[game.currentPhase] = checklistTemplate[game.currentPhase] || [];
      checklistTemplate[game.currentPhase].push({ id: W40K.uid(), text });
      persistTemplate();
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
