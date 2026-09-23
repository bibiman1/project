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
    els.scoreSetup = document.getElementById("score-setup");
    els.scoreActive = document.getElementById("score-active");
    els.rosterSelect = document.getElementById("game-roster-select");
    els.heading = document.getElementById("tracker-heading");
    els.meta = document.getElementById("tracker-meta");
    els.scoreHeading = document.getElementById("score-heading");
    els.scoreMeta = document.getElementById("score-meta");
    els.roundValue = document.getElementById("round-value");
    els.cpMe = document.getElementById("cp-me");
    els.cpOpponent = document.getElementById("cp-opponent");
    els.baseScoreMe = document.getElementById("basescore-me");
    els.baseScoreOpponent = document.getElementById("basescore-opponent");
    els.scoreboardPrimary = document.getElementById("scoreboard-primary");
    els.scoreboardSecondary = document.getElementById("scoreboard-secondary");
    els.vpTotalMe = document.getElementById("vp-total-me");
    els.vpTotalOpponent = document.getElementById("vp-total-opponent");
    els.unitList = document.getElementById("tracker-unit-list");
    els.logList = document.getElementById("log-list");
    els.phaseTabs = document.getElementById("phase-tabs");
    els.phaseItems = document.getElementById("phase-checklist-items");
    els.stratagemSelect = document.getElementById("stratagem-use-select");
    els.groupBuffCard = document.getElementById("group-buff-card");
    els.groupBuffTrackerList = document.getElementById("group-buff-tracker-list");
    els.doctrinaSelect = document.getElementById("doctrina-imperative-select");
    els.btnFirstMe = document.getElementById("btn-first-me");
    els.btnFirstOpponent = document.getElementById("btn-first-opponent");
    els.btnSwitchTurn = document.getElementById("btn-switch-turn");
    els.turnStatus = document.getElementById("turn-status");
  };

  const persist = () => W40K.save(W40K.KEYS.GAME, game);

  const escapeHtml = (str) =>
    String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const defaultUnitStatus = (unit) => ({ destroyed: false, notes: "", battleShock: false, modelsRemaining: unit.models });

  // Shared by the live VP card and the battle report image, so the two never disagree on the total.
  // Includes バトルレディ's base score - it's a one-off, whole-battle value (not recorded per round like
  // 主要目標/副次目標), but it still counts toward the final result comparison.
  const getScoreTotals = (game) => {
    const roundNumbers = Object.keys(game.scores || {})
      .map(Number)
      .sort((a, b) => a - b);
    const base = game.baseScore || { me: 0, opponent: 0 };
    const totals = roundNumbers.reduce(
      (acc, r) => {
        const s = game.scores[r];
        acc.me += (s.primaryMe || 0) + (s.secondaryMe || 0);
        acc.opponent += (s.primaryOpponent || 0) + (s.secondaryOpponent || 0);
        return acc;
      },
      { me: base.me || 0, opponent: base.opponent || 0 }
    );
    return { roundNumbers, totals };
  };

  // Shared by the live scoreboard table and the battle report image: rounds reached so far, a
  // value getter and a row-total getter for one objective type ("primary"/"secondary").
  const getScoreboardData = (game, kind) => {
    const scores = game.scores || {};
    const rounds = [];
    for (let r = 1; r <= game.round; r++) rounds.push(r);
    const fieldFor = (who) => `${kind}${who === "me" ? "Me" : "Opponent"}`;
    const valueAt = (r, who) => (scores[r] && scores[r][fieldFor(who)]) || 0;
    const totalFor = (who) => rounds.reduce((acc, r) => acc + valueAt(r, who), 0);
    return { rounds, fieldFor, valueAt, totalFor };
  };

  // One baseball-scoreboard-style table per objective type (主要目標/副次目標): a row per side, a
  // column per round reached so far, plus a running 計 column. Only the current round's cells are
  // editable (via the +/- steppers wired by wireScoreboardSteppers after each render); earlier
  // rounds are locked-in history, same as the previous per-round entry form was.
  const buildScoreboardHtml = (game, kind) => {
    const { rounds, fieldFor, valueAt, totalFor } = getScoreboardData(game, kind);

    const cell = (r, who) => {
      const value = valueAt(r, who);
      if (r !== game.round) return `<td>${value}</td>`;
      return `<td class="scoreboard-cell-editable">
        <div class="scoreboard-stepper">
          <button type="button" class="btn btn-round btn-xs" data-score-field="${fieldFor(who)}" data-delta="-1">−</button>
          <span class="scoreboard-value">${value}</span>
          <button type="button" class="btn btn-round btn-xs" data-score-field="${fieldFor(who)}" data-delta="1">＋</button>
        </div>
      </td>`;
    };

    return `
      <thead>
        <tr><th></th>${rounds.map((r) => `<th>R${r}</th>`).join("")}<th>計</th></tr>
      </thead>
      <tbody>
        <tr><th>自分</th>${rounds.map((r) => cell(r, "me")).join("")}<td class="scoreboard-total">${totalFor("me")}</td></tr>
        <tr><th>相手</th>${rounds.map((r) => cell(r, "opponent")).join("")}<td class="scoreboard-total">${totalFor("opponent")}</td></tr>
      </tbody>
    `;
  };

  const wireScoreboardSteppers = (tableEl, game) => {
    tableEl.querySelectorAll("[data-score-field]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const field = btn.dataset.scoreField;
        const delta = Number(btn.dataset.delta);
        if (!game.scores[game.round]) {
          game.scores[game.round] = { primaryMe: 0, primaryOpponent: 0, secondaryMe: 0, secondaryOpponent: 0 };
        }
        game.scores[game.round][field] = Math.max(0, (game.scores[game.round][field] || 0) + delta);
        persist();
        render();
      });
    });
  };

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
      els.scoreSetup.hidden = false;
      els.scoreActive.hidden = true;
      refreshRosterOptions();
      return;
    }
    els.setup.hidden = true;
    els.active.hidden = false;
    els.scoreSetup.hidden = true;
    els.scoreActive.hidden = false;

    const roster = W40K.Roster.getById(game.rosterId);
    const headingText = `${roster ? roster.name : "ロスター不明"} vs ${game.opponentName || "対戦相手"}`;
    const metaText = `${game.missionName || "ミッション未設定"} ・ ${game.pointsLimit || "?"} pts ・ 第${game.round}R`;
    els.heading.textContent = headingText;
    els.meta.textContent = `${game.missionName || "ミッション未設定"} ・ ${game.pointsLimit || "?"} pts`;
    els.scoreHeading.textContent = headingText;
    els.scoreMeta.textContent = metaText;

    els.roundValue.textContent = game.round;
    els.doctrinaSelect.value = game.doctrinaImperative || "";

    els.btnFirstMe.classList.toggle("is-active", game.firstPlayer === "me");
    els.btnFirstOpponent.classList.toggle("is-active", game.firstPlayer === "opponent");
    els.btnSwitchTurn.disabled = !game.firstPlayer;
    if (!game.firstPlayer) {
      els.turnStatus.textContent = "先攻（このラウンドで先に番が来る側）を選んでください";
      els.turnStatus.classList.remove("is-set");
    } else {
      const isTop = game.activeTurn === game.firstPlayer;
      const activeLabel = game.activeTurn === "me" ? "自分" : "相手";
      els.turnStatus.textContent = `${isTop ? "表" : "裏"}：${activeLabel}の番`;
      els.turnStatus.classList.add("is-set");
    }
    els.cpMe.textContent = game.cp.me;
    els.cpOpponent.textContent = game.cp.opponent;

    // VP is recorded per round (主要目標/副次目標 scored that round) as a baseball-scoreboard-style
    // table per objective type, not a single running total, so the breakdown by round - and by
    // objective type - survives instead of being lost the moment it's added to a lump sum.
    // game.scores is keyed by round number; only the current round's cells are editable.
    if (!game.scores) game.scores = {};
    if (!game.baseScore) game.baseScore = { me: 0, opponent: 0 };
    els.baseScoreMe.textContent = game.baseScore.me;
    els.baseScoreOpponent.textContent = game.baseScore.opponent;

    els.scoreboardPrimary.innerHTML = buildScoreboardHtml(game, "primary");
    els.scoreboardSecondary.innerHTML = buildScoreboardHtml(game, "secondary");
    wireScoreboardSteppers(els.scoreboardPrimary, game);
    wireScoreboardSteppers(els.scoreboardSecondary, game);

    const { totals } = getScoreTotals(game);
    els.vpTotalMe.textContent = totals.me;
    els.vpTotalOpponent.textContent = totals.opponent;

    els.unitList.innerHTML = "";
    if (roster && roster.units.length) {
      // Group joined units (same `group`) next to each other instead of listing them in whatever
      // order they were added to the roster, so a joined character/squad reads as one block. Each
      // group is placed at its first member's original position; ungrouped units and the relative
      // order within a group are otherwise unchanged.
      const groupFirstIndex = {};
      roster.units.forEach((u, i) => {
        if (u.group && !(u.group in groupFirstIndex)) groupFirstIndex[u.group] = i;
      });
      const orderedUnits = roster.units
        .map((u, i) => ({ u, sortKey: u.group ? groupFirstIndex[u.group] : i, i }))
        .sort((a, b) => a.sortKey - b.sortKey || a.i - b.i)
        .map((x) => x.u);

      orderedUnits.forEach((unit) => {
        const status = game.unitStatus[unit.id] || defaultUnitStatus(unit);
        const row = document.createElement("article");
        row.className = "tracker-unit-row" + (status.destroyed ? " is-destroyed" : "");

        const { profile, profileChanges, weapons, buffNotes } = W40K.computeUnitBuffs(roster, unit, {
          doctrinaImperative: game.doctrinaImperative,
          battleShock: status.battleShock,
          groupBuffSelections: game.groupBuffSelections,
        });
        const hasProfile = profile && (profile.move || profile.toughness || profile.save || profile.invSave || profile.wounds || profile.leadership || profile.oc);
        const profileCell = (field) => buffCell(profileChanges[field] ?? profile[field], profileChanges[field] !== undefined ? profile[field] : undefined);

        // Always show the full weapon table (not just buff-changed weapons) - the tracker is the
        // main screen used during play, so unit stats/weapons should be readable there without also
        // needing the roster screen open. Buff-changed cells still highlight via buffCell.
        const weaponsHtml = weapons.length
          ? `<table class="weapon-table">
              <thead><tr><th>武器</th><th>射程</th><th>攻</th><th>技</th><th>攻撃力</th><th>貫通</th><th>ダメ</th></tr></thead>
              <tbody>
                ${weapons
                  .map(
                    (w) => `<tr>
                      <td>${w.type === "melee" ? "⚔" : "🔫"} ${escapeHtml(w.name)}${w.abilities ? ` <span class="weapon-ability">[${escapeHtml(w.abilities)}]</span>` : ""}${(w._addedAbilities || [])
                        .map((a) => ` <span class="weapon-ability weapon-ability-added">[${escapeHtml(a)}]</span>`)
                        .join("")}</td>
                      <td>${escapeHtml(w.range)}</td>
                      <td>${buffCell(w._changed.attacks ?? w.attacks, w._changed.attacks !== undefined ? w.attacks : undefined)}</td>
                      <td>${buffCell(w._changed.skill ?? w.skill, w._changed.skill !== undefined ? w.skill : undefined)}</td>
                      <td>${buffCell(w._changed.strength ?? w.strength, w._changed.strength !== undefined ? w.strength : undefined)}</td>
                      <td>${buffCell(w._changed.ap ?? w.ap, w._changed.ap !== undefined ? w.ap : undefined)}</td>
                      <td>${buffCell(w._changed.damage ?? w.damage, w._changed.damage !== undefined ? w.damage : undefined)}</td>
                    </tr>`
                  )
                  .join("")}
              </tbody>
            </table>`
          : "";

        // "Data-severed"-style ability: if this unit is named a partner unit's keyword swaps when that partner is absent/destroyed.
        const keywordSwapNote = ((unit.abilities || []).some((a) => (a.name || "").includes("データ切断")) && unit.group)
          ? (() => {
              const hasActivePartner = roster.units.some(
                (u) => u.id !== unit.id && u.group === unit.group && u.name.includes("カステラン・ロボット") && !(game.unitStatus[u.id] || defaultUnitStatus(u)).destroyed
              );
              return hasActivePartner ? null : "データ切断: 合流ロボット不在のため【ビークル】を失い【インファントリー】を持つ";
            })()
          : null;

        // Buff/ability explanation text is collapsed by default (▶ 効果 (N)) so it doesn't eat up
        // scroll space for every unit during play - the weapon table above already shows the numbers
        // at a glance; this is just the "why", read on demand.
        const noteCount = buffNotes.length + (keywordSwapNote ? 1 : 0);
        const notesHtml = noteCount
          ? `<details class="notes-details">
              <summary>効果 (${noteCount})</summary>
              <p class="unit-buff-notes">${[...buffNotes.map((n) => `🔺${escapeHtml(n)}`), ...(keywordSwapNote ? [`🔻${escapeHtml(keywordSwapNote)}`] : [])].join("<br>")}</p>
            </details>`
          : "";

        const statsHtml =
          hasProfile || buffNotes.length || keywordSwapNote || weapons.length
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
                ${weaponsHtml}
                ${notesHtml}
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
      firstPlayer: null,
      activeTurn: null,
      cp: { me: 0, opponent: 0 },
      baseScore: { me: 0, opponent: 0 },
      scores: {},
      unitStatus: {},
      log: [],
      currentPhase: PHASES[0],
      checkedItems: {},
      groupBuffSelections: {},
    };
    persist();
    render();
  };

  // Battle report: a standalone PNG image summarizing the finished (or in-progress) game, so it can
  // be handed to the opponent. Drawn with the Canvas 2D API directly (no html-to-image dependency)
  // for reliability across phones/browsers. Layout is measured against a throwaway context first so
  // the canvas can be created at exactly the content's height, then redrawn for real - canvas
  // resizing clears pixels, so the final height must be known before the real canvas exists.
  const REPORT_COLORS = {
    bg: "#05100a",
    panel: "#0a1a10",
    border: "#24462e",
    gold: "#5be88f",
    goldBright: "#9dffc4",
    redBright: "#ff5c5c",
    text: "#3fdd76",
    textDim: "#2f8a52",
  };
  const REPORT_FONT = '"MS Gothic","Osaka-Mono","Courier New",monospace';

  // Canvas has no CJK-aware line breaking, so wrap per-character once a line exceeds maxWidth -
  // fine for Japanese (no inter-word spaces to lose) and good enough for the occasional ASCII word.
  const wrapText = (ctx, str, maxWidth) => {
    const lines = [];
    let line = "";
    for (const ch of String(str)) {
      const test = line + ch;
      if (line && ctx.measureText(test).width > maxWidth) {
        lines.push(line);
        line = ch;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const makePen = (ctx, draw, x0, width) => {
    const pen = { ctx, draw, x0, width, state: { y: 0 } };
    const setFont = (size, weight) => { ctx.font = `${weight || 400} ${size}px ${REPORT_FONT}`; };
    pen.text = (str, size, opts = {}) => {
      setFont(size, opts.weight);
      if (draw) {
        ctx.fillStyle = opts.color || REPORT_COLORS.text;
        ctx.textAlign = opts.align || "left";
        ctx.textBaseline = "alphabetic";
        const x =
          opts.align === "center" ? x0 + width / 2 : opts.align === "right" ? x0 + width - (opts.indent || 0) : x0 + (opts.indent || 0);
        ctx.fillText(str, x, pen.state.y + size * 0.85);
      }
      pen.state.y += size * (opts.lineHeight || 1.5);
    };
    pen.wrapped = (str, size, opts = {}) => {
      setFont(size, opts.weight);
      const maxWidth = width - (opts.indent || 0);
      wrapText(ctx, str, maxWidth).forEach((l) => pen.text(l, size, opts));
    };
    pen.spacer = (h) => { pen.state.y += h; };
    pen.rule = (color) => {
      if (draw) {
        ctx.fillStyle = color || REPORT_COLORS.border;
        ctx.fillRect(x0, pen.state.y, width, 2);
      }
      pen.state.y += 2;
    };
    pen.row = (cells, colWidths, size, opts = {}) => {
      setFont(size, opts.weight);
      if (draw) {
        ctx.fillStyle = opts.color || REPORT_COLORS.text;
        ctx.textBaseline = "alphabetic";
        let cx = x0;
        cells.forEach((cellText, i) => {
          const align = (opts.aligns && opts.aligns[i]) || "left";
          ctx.textAlign = align;
          const cellX = align === "center" ? cx + colWidths[i] / 2 : align === "right" ? cx + colWidths[i] : cx;
          ctx.fillText(cellText, cellX, pen.state.y + size * 0.85);
          cx += colWidths[i];
        });
      }
      pen.state.y += size * (opts.lineHeight || 1.6);
    };
    return pen;
  };

  // Draws bodyFn's content inside a rounded card background sized to fit it exactly - measures
  // bodyFn's output height with a non-drawing pen first, then (if actually drawing) paints the
  // background and replays bodyFn for real at the same coordinates.
  const reportCard = (pen, bodyFn, opts = {}) => {
    const inset = opts.pad ?? 18;
    const innerX0 = pen.x0 + inset;
    const innerWidth = pen.width - inset * 2;
    const measurePen = makePen(pen.ctx, false, innerX0, innerWidth);
    bodyFn(measurePen);
    const cardHeight = measurePen.state.y + inset * 2;
    const top = pen.state.y;
    if (pen.draw) {
      pen.ctx.fillStyle = opts.bg || REPORT_COLORS.panel;
      pen.ctx.beginPath();
      if (pen.ctx.roundRect) pen.ctx.roundRect(pen.x0, top, pen.width, cardHeight, 10);
      else pen.ctx.rect(pen.x0, top, pen.width, cardHeight);
      pen.ctx.fill();
    }
    const bodyPen = makePen(pen.ctx, pen.draw, innerX0, innerWidth);
    bodyPen.state.y = top + inset;
    bodyFn(bodyPen);
    pen.state.y = top + cardHeight + (opts.gap ?? 18);
  };

  const buildReportCanvas = (roster, game) => {
    const WIDTH = 960;
    const PAD = 40;
    const contentWidth = WIDTH - PAD * 2;
    const { totals } = getScoreTotals(game);
    const units = roster ? roster.units : [];
    const dateStr = new Date().toLocaleDateString("ja-JP", { year: "numeric", month: "long", day: "numeric" });
    const rosterName = roster ? roster.name : "ロスター不明";
    const opponentName = game.opponentName || "対戦相手";

    const buildBody = (pen) => {
      pen.text("WARHAMMER 40,000 — 対戦記録", 15, { color: REPORT_COLORS.redBright, weight: 700 });
      pen.spacer(4);
      pen.wrapped(`${rosterName}  vs  ${opponentName}`, 30, { color: REPORT_COLORS.goldBright, weight: 700 });
      pen.spacer(4);
      pen.text(
        `${game.missionName || "ミッション未設定"} ・ ${game.pointsLimit || "?"}pts ・ 第${game.round}ラウンドで終了 ・ ${dateStr}`,
        15,
        { color: REPORT_COLORS.textDim }
      );
      pen.spacer(8);
      pen.rule();
      pen.spacer(20);

      const baseScore = game.baseScore || { me: 0, opponent: 0 };

      reportCard(pen, (p) => {
        p.text("対戦結果", 15, { weight: 700, color: REPORT_COLORS.textDim });
        p.spacer(8);
        const winner = totals.me > totals.opponent ? "me" : totals.opponent > totals.me ? "opponent" : null;
        const resultLabel = winner === "me" ? "🏆 自分の勝利" : winner === "opponent" ? "🏆 相手の勝利" : "引き分け";
        p.text(`合計VP　自分 ${totals.me}　-　相手 ${totals.opponent}　　${resultLabel}`, 22, {
          weight: 700,
          color: REPORT_COLORS.goldBright,
        });
        p.spacer(6);
        const firstLabel = game.firstPlayer === "me" ? "自分" : game.firstPlayer === "opponent" ? "相手" : "未定";
        p.text(
          `先攻: ${firstLabel}　　最終CP　自分 ${game.cp.me} ／ 相手 ${game.cp.opponent}　　バトルレディ　自分 ${baseScore.me} ／ 相手 ${baseScore.opponent}`,
          16,
          { color: REPORT_COLORS.text }
        );
      });

      // Two baseball-scoreboard-style tables (rows: 自分/相手, columns: R1..終了ラウンド + 計),
      // mirroring the live スコア tab exactly so the report never disagrees with what's on screen.
      [
        { kind: "primary", title: "主要目標スコアボード" },
        { kind: "secondary", title: "副次目標スコアボード" },
      ].forEach(({ kind, title }) => {
        const { rounds, valueAt, totalFor } = getScoreboardData(game, kind);
        if (!rounds.length) return;
        reportCard(pen, (p) => {
          p.text(title, 15, { weight: 700, color: REPORT_COLORS.textDim });
          p.spacer(10);
          const labelWidth = p.width * 0.14;
          const colWidth = (p.width - labelWidth) / (rounds.length + 1);
          const colWidths = [labelWidth, ...rounds.map(() => colWidth), colWidth];
          const aligns = ["left", ...rounds.map(() => "center"), "center"];
          p.row(["", ...rounds.map((r) => `R${r}`), "計"], colWidths, 14, { weight: 700, color: REPORT_COLORS.textDim, aligns });
          p.rule();
          p.spacer(6);
          p.row(["自分", ...rounds.map((r) => String(valueAt(r, "me"))), String(totalFor("me"))], colWidths, 15, { aligns });
          p.row(["相手", ...rounds.map((r) => String(valueAt(r, "opponent"))), String(totalFor("opponent"))], colWidths, 15, { aligns });
        });
      });

      if (units.length) {
        reportCard(pen, (p) => {
          p.text("自軍ユニット状態", 15, { weight: 700, color: REPORT_COLORS.textDim });
          p.spacer(10);
          units.forEach((unit) => {
            const status = game.unitStatus[unit.id] || defaultUnitStatus(unit);
            const modelsRemaining = status.modelsRemaining ?? unit.models;
            const icon = status.destroyed ? "💀" : status.battleShock ? "⚠️" : "✅";
            const countTxt = unit.models > 1 ? ` (${modelsRemaining}/${unit.models}体)` : "";
            p.text(`${icon} ${unit.name}${countTxt}`, 15, { color: status.destroyed ? REPORT_COLORS.textDim : REPORT_COLORS.text });
            if (status.notes) p.wrapped(`　　${status.notes}`, 13, { color: REPORT_COLORS.textDim, indent: 20 });
          });
        });
      }

      if (game.log && game.log.length) {
        reportCard(pen, (p) => {
          p.text("ラウンドログ", 15, { weight: 700, color: REPORT_COLORS.textDim });
          p.spacer(10);
          game.log.forEach((entry) => {
            p.wrapped(`R${entry.round}　${entry.text}`, 14, { color: REPORT_COLORS.text });
          });
        }, { gap: 8 });
      }

      pen.spacer(6);
      pen.text("Generated by W40K Roster & Battle Log", 12, { color: REPORT_COLORS.textDim, align: "center" });
    };

    const measurePen = makePen(document.createElement("canvas").getContext("2d"), false, PAD, contentWidth);
    measurePen.state.y = PAD;
    buildBody(measurePen);
    const totalHeight = Math.ceil(measurePen.state.y + PAD);

    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = totalHeight;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = REPORT_COLORS.bg;
    ctx.fillRect(0, 0, WIDTH, totalHeight);

    const drawPen = makePen(ctx, true, PAD, contentWidth);
    drawPen.state.y = PAD;
    buildBody(drawPen);

    return canvas;
  };

  // ASCII-only filename: some browsers silently fall back to a generic "download" name when the
  // `download` attribute value contains non-ASCII (e.g. Japanese roster/opponent names) on a blob: URL.
  const reportFileName = (game) => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    const datePart = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    return `w40k-battle-report_${datePart}_R${game.round}.png`;
  };

  const saveReportImage = () => {
    if (!game) return;
    const roster = W40K.Roster.getById(game.rosterId);
    const canvas = buildReportCanvas(roster, game);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = reportFileName(game);
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const endGame = () => {
    if (!confirm("この対戦を終了しますか？記録はクリアされます。（先に「レポート画像を保存」しておくと安心です）")) return;
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
    document.getElementById("btn-save-report").addEventListener("click", saveReportImage);

    // 先攻/後攻 is decided once for the whole battle (like which team bats first in baseball) and
    // never changes round to round - only which half of the round is active does. So a new round
    // always starts back at 表 (先攻's turn), never flips who 先攻 is.
    document.getElementById("round-dec").addEventListener("click", () => {
      if (!game || game.round <= 1) return;
      game.round -= 1;
      game.checkedItems = {};
      game.doctrinaImperative = null;
      game.activeTurn = game.firstPlayer;
      persist();
      render();
    });
    document.getElementById("round-inc").addEventListener("click", () => {
      if (!game) return;
      game.round += 1;
      game.checkedItems = {};
      game.doctrinaImperative = null;
      game.activeTurn = game.firstPlayer;
      persist();
      render();
    });

    // 先攻・手番: who has priority (goes first) this battle - decided once and fixed for the whole
    // game, and whose turn is currently active within the round. Picking a first player also starts
    // their turn (表); 手番交代 flips to the other player's turn (裏) once their turn ends, and a new
    // round resets back to 表 above. The buttons stay available for a manual correction/override.
    // Purely a record for the player, not wired into any auto-apply logic.
    els.btnFirstMe.addEventListener("click", () => {
      if (!game) return;
      game.firstPlayer = "me";
      game.activeTurn = "me";
      persist();
      render();
    });
    els.btnFirstOpponent.addEventListener("click", () => {
      if (!game) return;
      game.firstPlayer = "opponent";
      game.activeTurn = "opponent";
      persist();
      render();
    });
    els.btnSwitchTurn.addEventListener("click", () => {
      if (!game || !game.firstPlayer) return;
      game.activeTurn = game.activeTurn === "me" ? "opponent" : "me";
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
    // バトルレディ's base score is entered once for the whole battle (not per round like
    // 主要目標/副次目標), so it's a plain +/- counter just like CP above.
    document.querySelectorAll("[data-basescore]").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!game) return;
        if (!game.baseScore) game.baseScore = { me: 0, opponent: 0 };
        const side = btn.dataset.basescore;
        const delta = Number(btn.dataset.delta);
        game.baseScore[side] = Math.max(0, (game.baseScore[side] || 0) + delta);
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
