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
    els.doctrinaSelect = document.getElementById("doctrina-imperative-select");
  };

  const persist = () => W40K.save(W40K.KEYS.GAME, game);

  const escapeHtml = (str) =>
    String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const defaultUnitStatus = (unit) => ({ destroyed: false, notes: "", battleShock: false, modelsRemaining: unit.models });

  // Cell shows "base→new" (new bolded) when a buff changed it, otherwise just the value. Mirrors roster.js's buffCell.
  const buffCell = (base, changed) => (changed !== undefined ? `${escapeHtml(base || "-")}→<strong>${escapeHtml(changed)}</strong>` : escapeHtml(base || "-"));

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
    els.doctrinaSelect.value = game.doctrinaImperative || "";
    els.cpMe.textContent = game.cp.me;
    els.cpOpponent.textContent = game.cp.opponent;
    els.vpMe.textContent = game.vp.me;
    els.vpOpponent.textContent = game.vp.opponent;

    els.unitList.innerHTML = "";
    if (roster && roster.units.length) {
      roster.units.forEach((unit) => {
        const status = game.unitStatus[unit.id] || defaultUnitStatus(unit);
        const row = document.createElement("article");
        row.className = "tracker-unit-row" + (status.destroyed ? " is-destroyed" : "");

        const { profile, profileChanges, buffNotes } = W40K.computeUnitBuffs(roster, unit, { doctrinaImperative: game.doctrinaImperative });
        const hasProfile = profile && (profile.move || profile.toughness || profile.save || profile.invSave || profile.wounds || profile.leadership || profile.oc);
        const profileCell = (field) => buffCell(profileChanges[field] ?? profile[field], profileChanges[field] !== undefined ? profile[field] : undefined);

        // "Data-severed"-style ability: if this unit is named a partner unit's keyword swaps when that partner is absent/destroyed.
        const keywordSwapNote = ((unit.abilities || []).some((a) => (a.name || "").includes("データ切断")) && unit.group)
          ? (() => {
              const hasActivePartner = roster.units.some(
                (u) => u.id !== unit.id && u.group === unit.group && u.name.includes("カステラン・ロボット") && !(game.unitStatus[u.id] || defaultUnitStatus(u)).destroyed
              );
              return hasActivePartner ? null : "データ切断: 合流ロボット不在のため【ビークル】を失い【インファントリー】を持つ";
            })()
          : null;

        const statsHtml =
          hasProfile || buffNotes.length || keywordSwapNote
            ? `<div class="tracker-unit-row-stats">
                ${
                  hasProfile
                    ? `<p class="unit-profile">
                        <span>移動${profileCell("move")}</span>
                        <span>耐久${profileCell("toughness")}</span>
                        <span>防御${profileCell("save")}</span>
                        ${profile.invSave || profileChanges.invSave ? `<span>特防${profileCell("invSave")}</span>` : ""}
                        <span>傷${profileCell("wounds")}</span>
                        <span>統率${profileCell("leadership")}</span>
                        <span>確保${profileCell("oc")}</span>
                      </p>`
                    : ""
                }
                ${buffNotes.length ? `<p class="unit-buff-notes">${buffNotes.map((n) => `🔺${escapeHtml(n)}`).join("<br>")}</p>` : ""}
                ${keywordSwapNote ? `<p class="unit-buff-notes">🔻${escapeHtml(keywordSwapNote)}</p>` : ""}
              </div>`
            : "";

        const modelsRemaining = status.modelsRemaining ?? unit.models;
        row.innerHTML = `
          <div class="tracker-unit-row-main">
            <label class="unit-destroyed-toggle">
              <input type="checkbox" data-unit-toggle="${unit.id}" ${status.destroyed ? "checked" : ""}>
              <span>${escapeHtml(unit.name)}${unit.group ? ` <span class="unit-group-badge">🔗${escapeHtml(unit.group)}</span>` : ""}</span>
            </label>
            ${
              unit.models > 1
                ? `<div class="unit-models-counter">
                    <button type="button" class="btn btn-round btn-xs" data-unit-model-dec="${unit.id}">−</button>
                    <span class="unit-models-value">${modelsRemaining}/${unit.models}体</span>
                    <button type="button" class="btn btn-round btn-xs" data-unit-model-inc="${unit.id}">＋</button>
                  </div>`
                : ""
            }
            <label class="unit-battleshock-toggle">
              <input type="checkbox" data-unit-battleshock="${unit.id}" ${status.battleShock ? "checked" : ""}>
              <span>戦闘ショック</span>
            </label>
            <input type="text" class="unit-status-notes" data-unit-notes="${unit.id}" placeholder="ダメージ・状態メモ" value="${escapeHtml(status.notes)}">
          </div>
          ${statsHtml}
        `;
        els.unitList.appendChild(row);
      });

      els.unitList.querySelectorAll("[data-unit-toggle]").forEach((cb) => {
        cb.addEventListener("change", () => {
          const id = cb.dataset.unitToggle;
          const unit = roster.units.find((u) => u.id === id);
          game.unitStatus[id] = game.unitStatus[id] || defaultUnitStatus(unit);
          game.unitStatus[id].destroyed = cb.checked;
          persist();
          render();
        });
      });
      els.unitList.querySelectorAll("[data-unit-battleshock]").forEach((cb) => {
        cb.addEventListener("change", () => {
          const id = cb.dataset.unitBattleshock;
          const unit = roster.units.find((u) => u.id === id);
          game.unitStatus[id] = game.unitStatus[id] || defaultUnitStatus(unit);
          game.unitStatus[id].battleShock = cb.checked;
          persist();
          render();
        });
      });
      els.unitList.querySelectorAll("[data-unit-notes]").forEach((input) => {
        input.addEventListener("change", () => {
          const id = input.dataset.unitNotes;
          const unit = roster.units.find((u) => u.id === id);
          game.unitStatus[id] = game.unitStatus[id] || defaultUnitStatus(unit);
          game.unitStatus[id].notes = input.value;
          persist();
        });
      });
      els.unitList.querySelectorAll("[data-unit-model-dec]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.unitModelDec;
          const unit = roster.units.find((u) => u.id === id);
          game.unitStatus[id] = game.unitStatus[id] || defaultUnitStatus(unit);
          const status = game.unitStatus[id];
          status.modelsRemaining = Math.max(0, (status.modelsRemaining ?? unit.models) - 1);
          if (status.modelsRemaining === 0) status.destroyed = true;
          persist();
          render();
        });
      });
      els.unitList.querySelectorAll("[data-unit-model-inc]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = btn.dataset.unitModelInc;
          const unit = roster.units.find((u) => u.id === id);
          game.unitStatus[id] = game.unitStatus[id] || defaultUnitStatus(unit);
          const status = game.unitStatus[id];
          const wasZero = (status.modelsRemaining ?? unit.models) === 0;
          status.modelsRemaining = Math.min(unit.models, (status.modelsRemaining ?? unit.models) + 1);
          if (wasZero && status.modelsRemaining > 0) status.destroyed = false;
          persist();
          render();
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
      els.stratagemSelect.innerHTML = '<option value="">策略未登録</option>';
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
        const allOptions = roster.groupBuffs.filter((o) => o.group === group);
        const alwaysOnOptions = allOptions.filter((o) => o.alwaysOn);
        const selectableOptions = allOptions.filter((o) => !o.alwaysOn);
        const selectedId = game.groupBuffSelections[group] || "";
        const selectHtml = `<select data-buff-group="${escapeHtml(group)}" ${selectableOptions.length === 0 ? "disabled" : ""}>
          <option value="">${selectableOptions.length === 0 ? "バフ未登録" : "なし"}</option>
          ${selectableOptions.map((o) => `<option value="${o.id}" ${o.id === selectedId ? "selected" : ""}>${escapeHtml(o.name)}</option>`).join("")}
        </select>`;
        const selectedOption = selectableOptions.find((o) => o.id === selectedId);
        const alwaysOnHtml = alwaysOnOptions.length
          ? `<p class="group-buff-alwayson-label">🔒 常時: ${alwaysOnOptions.map((o) => escapeHtml(o.name)).join(" / ")}</p>`
          : "";
        const effectsHtml = [...alwaysOnOptions, ...(selectedOption ? [selectedOption] : [])].map((opt) => renderBuffEffects(roster, opt)).join("");
        return `<div class="group-buff-row">
          <div class="group-buff-row-head">🔗 <strong>${escapeHtml(group)}</strong> ${selectHtml}</div>
          ${alwaysOnHtml}
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

  const describeModifierEffectText = (unit, m) => {
    if (m.kind === "note") return `📝 ${m.value}`;
    if (m.kind === "keyword") {
      const scopeLabel = m.scope === "melee" ? "白兵武器" : "射撃武器";
      return `🔖 追加キーワード（${scopeLabel}）: ${m.value}`;
    }
    const delta = Number(m.value) || 0;
    const fieldLabel = m.scope === "profile" ? W40K.PROFILE_FIELD_LABELS[m.field] || m.field : W40K.WEAPON_FIELD_LABELS[m.field] || m.field;
    if (m.scope === "profile") {
      const base = unit?.profile?.[m.field] || "-";
      const newVal = W40K.applyStatDelta(base, delta);
      return `${fieldLabel}: ${base} → ${newVal}`;
    }
    const weapons = (unit?.weapons || []).filter((w) => w.type === m.scope);
    if (weapons.length === 0) return `${fieldLabel}${delta >= 0 ? "+" : ""}${delta}（対象武器が見つかりません）`;
    return weapons
      .map((w) => {
        const base = w[m.field] || "-";
        const newVal = W40K.applyStatDelta(base, delta);
        return `${w.name} ${fieldLabel}: ${base} → ${newVal}`;
      })
      .join(" / ");
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
      doctrinaImperative: null,
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
      game.doctrinaImperative = null;
      persist();
      render();
    });
    document.getElementById("round-inc").addEventListener("click", () => {
      if (!game) return;
      game.round += 1;
      game.checkedItems = {};
      game.doctrinaImperative = null;
      persist();
      render();
    });

    els.doctrinaSelect.addEventListener("change", () => {
      if (!game) return;
      game.doctrinaImperative = els.doctrinaSelect.value || null;
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
      if (game.cp.me < stratagem.cost) {
        alert(`CPが不足しています（必要CP${stratagem.cost} / 保有CP${game.cp.me}）`);
        return;
      }
      game.cp.me -= stratagem.cost;
      game.log.push({ id: W40K.uid(), text: `策略使用: ${stratagem.name} (CP${stratagem.cost})`, round: game.round, ts: Date.now() });
      (stratagem.modifiers || []).forEach((m) => {
        const unit = roster.units.find((u) => u.name === m.targetUnit);
        if (!unit) {
          game.log.push({ id: W40K.uid(), text: `└ ${m.targetUnit || "(未指定)"}: 対象ユニットが見つかりません`, round: game.round, ts: Date.now() });
          return;
        }
        const status = game.unitStatus[unit.id];
        if (status?.battleShock) {
          game.log.push({ id: W40K.uid(), text: `└ ${unit.name}: 戦闘ショック状態のため効果は適用されません`, round: game.round, ts: Date.now() });
          return;
        }
        game.log.push({ id: W40K.uid(), text: `└ ${unit.name}: ${describeModifierEffectText(unit, m)}`, round: game.round, ts: Date.now() });
      });
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
