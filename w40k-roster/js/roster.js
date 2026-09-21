// Roster management: create/edit/delete rosters and their units.
(() => {
  const state = {
    rosters: W40K.load(W40K.KEYS.ROSTERS, []),
    selectedRosterId: null,
    editingUnitId: null,
  };

  const persist = () => W40K.save(W40K.KEYS.ROSTERS, state.rosters);

  // Fills in fields added after a roster/unit may have been created, so older saved data keeps working.
  const normalizeRoster = (roster) => {
    if (!roster.detachment) roster.detachment = { name: "", rule: "" };
    if (roster.armyRule === undefined) roster.armyRule = "";
    if (!roster.stratagems) roster.stratagems = [];
    roster.stratagems.forEach((s) => {
      if (!s.modifiers) s.modifiers = [];
    });
    if (!roster.groupBuffs) roster.groupBuffs = [];
    if (!roster.armyBuffs) roster.armyBuffs = [];
    roster.units.forEach((u) => {
      if (u.enhancement === undefined) u.enhancement = null;
      if (!u.profile) u.profile = { move: "", toughness: "", save: "", invSave: "", wounds: "", leadership: "", oc: "" };
      if (u.profile.invSave === undefined) u.profile.invSave = "";
      if (!u.weapons) u.weapons = [];
      if (!u.abilities) u.abilities = [];
      u.abilities.forEach((a) => {
        if (!a.category) a.category = "unit";
      });
      if (u.group === undefined) u.group = "";
      if (u.isWarlord === undefined) u.isWarlord = false;
    });
    return roster;
  };
  state.rosters.forEach(normalizeRoster);

  const getById = (id) => state.rosters.find((r) => r.id === id);

  // Unit points are the total cost for the unit (as printed in the codex), not a per-model cost.
  const totalPoints = (roster) =>
    roster.units.reduce((sum, u) => sum + u.points + (u.enhancement ? u.enhancement.points : 0), 0);

  // ---- rendering ----

  const els = {};

  const cacheEls = () => {
    els.list = document.getElementById("roster-list");
    els.detailEmpty = document.getElementById("roster-detail-empty");
    els.detail = document.getElementById("roster-detail");
    els.detailName = document.getElementById("roster-detail-name");
    els.detailMeta = document.getElementById("roster-detail-meta");
    els.unitList = document.getElementById("unit-list");
    els.detachmentName = document.getElementById("detachment-name");
    els.detachmentRule = document.getElementById("detachment-rule");
    els.armyRuleSelect = document.getElementById("army-rule-select");
    els.stratagemList = document.getElementById("stratagem-list");
    els.groupBuffList = document.getElementById("group-buff-list");
    els.armyBuffList = document.getElementById("army-buff-list");
  };

  const renderList = () => {
    els.list.innerHTML = "";
    if (state.rosters.length === 0) {
      els.list.innerHTML = '<p class="empty-state">まだロスターがありません。</p>';
      return;
    }
    state.rosters.forEach((roster) => {
      const card = document.createElement("article");
      card.className = "roster-card" + (roster.id === state.selectedRosterId ? " is-active" : "");
      const pts = totalPoints(roster);
      const overLimit = roster.pointsLimit > 0 && pts > roster.pointsLimit;
      card.innerHTML = `
        <h3>${escapeHtml(roster.name)}</h3>
        <p class="meta-line">${escapeHtml(roster.faction || "ファクション未設定")}</p>
        <p class="points-line ${overLimit ? "is-over" : ""}">${pts} / ${roster.pointsLimit || "?"} pts</p>
      `;
      card.addEventListener("click", () => selectRoster(roster.id));
      els.list.appendChild(card);
    });
  };

  const renderDetail = () => {
    const roster = getById(state.selectedRosterId);
    if (!roster) {
      els.detailEmpty.hidden = false;
      els.detail.hidden = true;
      return;
    }
    els.detailEmpty.hidden = true;
    els.detail.hidden = false;
    els.detailName.textContent = roster.name;
    const pts = totalPoints(roster);
    els.detailMeta.textContent = `${roster.faction || "ファクション未設定"} ・ ${pts} / ${roster.pointsLimit || "?"} pts`;

    els.detachmentName.textContent = roster.detachment.name || "デタッチメント未設定";
    els.detachmentRule.textContent = roster.detachment.rule || "";
    els.detachmentRule.hidden = !roster.detachment.rule;
    els.armyRuleSelect.value = roster.armyRule || "";

    els.stratagemList.innerHTML = "";
    if (roster.stratagems.length === 0) {
      els.stratagemList.innerHTML = '<p class="empty-state">策略が未登録です。</p>';
    } else {
      roster.stratagems.forEach((strat) => {
        const row = document.createElement("article");
        row.className = "stratagem-card";
        row.innerHTML = `
          <div class="unit-main">
            <h4>${escapeHtml(strat.name)} <span class="unit-models">CP${strat.cost}</span></h4>
            ${strat.phase ? `<p class="meta-line">${escapeHtml(strat.phase)}</p>` : ""}
            ${strat.text ? `<p class="unit-notes">${escapeHtml(strat.text)}</p>` : ""}
          </div>
          <div class="unit-actions">
            <button class="btn btn-ghost btn-sm" data-edit-stratagem="${strat.id}">編集</button>
            <button class="btn btn-danger btn-sm" data-delete-stratagem="${strat.id}">削除</button>
          </div>
        `;
        els.stratagemList.appendChild(row);
      });
      els.stratagemList.querySelectorAll("[data-edit-stratagem]").forEach((btn) => {
        btn.addEventListener("click", () => openStratagemModal(btn.dataset.editStratagem));
      });
      els.stratagemList.querySelectorAll("[data-delete-stratagem]").forEach((btn) => {
        btn.addEventListener("click", () => deleteStratagem(btn.dataset.deleteStratagem));
      });
    }

    els.armyBuffList.innerHTML = "";
    if (roster.armyBuffs.length === 0) {
      els.armyBuffList.innerHTML = '<p class="empty-state">常時バフが未登録です。</p>';
    } else {
      els.armyBuffList.innerHTML = `
        <ul class="ability-list">
          ${roster.armyBuffs
            .map(
              (buff) =>
                `<li><strong>${escapeHtml(buff.name)}</strong> <span class="tag">${escapeHtml(TARGET_TYPE_TAGS[buff.targetType])}: ${escapeHtml(buff.targetValue)}</span>: ${buff.modifiers.map(summarizeArmyModifier).join(" / ")}</li>`
            )
            .join("")}
        </ul>`;
    }

    els.groupBuffList.innerHTML = "";
    if (roster.groupBuffs.length === 0) {
      els.groupBuffList.innerHTML = '<p class="empty-state">合流バフが未登録です。</p>';
    } else {
      const byGroup = {};
      roster.groupBuffs.forEach((opt) => {
        (byGroup[opt.group] = byGroup[opt.group] || []).push(opt);
      });
      Object.entries(byGroup).forEach(([group, options]) => {
        const section = document.createElement("div");
        section.className = "group-buff-group";
        section.innerHTML = `
          <p class="meta-line">🔗 ${escapeHtml(group)}</p>
          <ul class="ability-list">
            ${options.map((opt) => `<li><strong>${escapeHtml(opt.name)}</strong>${opt.alwaysOn ? ' <span class="tag">常時</span>' : ""}: ${opt.modifiers.map(summarizeModifier).join(" / ")}</li>`).join("")}
          </ul>
        `;
        els.groupBuffList.appendChild(section);
      });
    }

    els.unitList.innerHTML = "";
    if (roster.units.length === 0) {
      els.unitList.innerHTML = '<p class="empty-state">ユニットが未登録です。</p>';
      return;
    }

    const rendered = new Set();
    roster.units.forEach((unit) => {
      if (rendered.has(unit.id)) return;
      if (unit.group) {
        const groupUnits = roster.units.filter((u) => u.group === unit.group);
        groupUnits.forEach((u) => rendered.add(u.id));
        const groupTotal = groupUnits.reduce((sum, u) => sum + u.points + (u.enhancement ? u.enhancement.points : 0), 0);
        const wrapper = document.createElement("div");
        wrapper.className = "unit-group";
        wrapper.innerHTML = `<div class="unit-group-header">🔗 ${escapeHtml(unit.group)}（合流ユニット・計${groupTotal}pts）</div>`;
        groupUnits.forEach((u) => wrapper.appendChild(buildUnitCard(u, roster)));
        els.unitList.appendChild(wrapper);
      } else {
        rendered.add(unit.id);
        els.unitList.appendChild(buildUnitCard(unit, roster));
      }
    });

    els.unitList.querySelectorAll("[data-edit-unit]").forEach((btn) => {
      btn.addEventListener("click", () => openUnitModal(btn.dataset.editUnit));
    });
    els.unitList.querySelectorAll("[data-duplicate-unit]").forEach((btn) => {
      btn.addEventListener("click", () => duplicateUnit(btn.dataset.duplicateUnit));
    });
    els.unitList.querySelectorAll("[data-toggle-warlord]").forEach((btn) => {
      btn.addEventListener("click", () => toggleWarlord(btn.dataset.toggleWarlord));
    });
    els.unitList.querySelectorAll("[data-delete-unit]").forEach((btn) => {
      btn.addEventListener("click", () => deleteUnit(btn.dataset.deleteUnit));
    });
  };

  // Cell shows "base→new" (new bolded) when a buff changed it, otherwise just the value.
  const buffCell = (base, changed) => (changed !== undefined ? `${escapeHtml(base || "-")}→<strong>${escapeHtml(changed)}</strong>` : escapeHtml(base || "-"));

  const buildUnitCard = (unit, roster) => {
    const row = document.createElement("article");
    row.className = "unit-card";
    const unitTotal = unit.points + (unit.enhancement ? unit.enhancement.points : 0);

    const { profile, profileChanges, weapons, buffNotes } = W40K.computeUnitBuffs(roster, unit);

    const hasProfile = profile && (profile.move || profile.toughness || profile.save || profile.invSave || profile.wounds || profile.leadership || profile.oc);
    const profileCell = (field) => buffCell(profileChanges[field] ?? profile[field], profileChanges[field] !== undefined ? profile[field] : undefined);
    const profileHtml = hasProfile
      ? `<p class="unit-profile">
          <span>移動${profileCell("move")}</span>
          <span>耐久${profileCell("toughness")}</span>
          <span>防御${profileCell("save")}</span>
          ${profile.invSave || profileChanges.invSave ? `<span>特防${profileCell("invSave")}</span>` : ""}
          <span>傷${profileCell("wounds")}</span>
          <span>統率${profileCell("leadership")}</span>
          <span>確保${profileCell("oc")}</span>
        </p>`
      : "";
    const buffNotesHtml = buffNotes.length
      ? `<p class="unit-buff-notes">${buffNotes.map((n) => `🔺${escapeHtml(n)}`).join("<br>")}</p>`
      : "";
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
    const tagAbilities = unit.abilities.filter((a) => a.category === "core" || a.category === "faction");
    const listAbilities = unit.abilities.filter((a) => a.category === "detachment" || a.category === "unit");
    const tagAbilitiesHtml = tagAbilities.length
      ? `<p class="rule-tags">
          ${tagAbilities.map((a) => `<span class="tag">${escapeHtml(ABILITY_CATEGORY_TAGS[a.category])}: ${escapeHtml(a.name)}</span>`).join("")}
        </p>`
      : "";
    const listAbilitiesHtml = listAbilities.length
      ? `<ul class="ability-list">
          ${listAbilities
            .map(
              (a) =>
                `<li>${a.category === "detachment" ? `<span class="tag">デタッチメント</span> ` : ""}<strong>${escapeHtml(a.name)}</strong>${a.text ? `: ${escapeHtml(a.text)}` : ""}</li>`
            )
            .join("")}
        </ul>`
      : "";
    row.innerHTML = `
      <div class="unit-main">
        <h4>${unit.isWarlord ? '<span class="warlord-star" title="ウォーロード">⭐</span> ' : ""}${escapeHtml(unit.name)} <span class="unit-models">×${unit.models}</span></h4>
        ${profileHtml}
        ${buffNotesHtml}
        ${weaponsHtml}
        ${tagAbilitiesHtml}
        ${listAbilitiesHtml}
        <p class="meta-line">${escapeHtml(unit.keywords || "")}</p>
        ${unit.notes ? `<p class="unit-notes">${escapeHtml(unit.notes)}</p>` : ""}
        ${unit.enhancement ? `<p class="unit-enhancement">✦ ${escapeHtml(unit.enhancement.name)} (+${unit.enhancement.points}pts)</p>` : ""}
      </div>
      <div class="unit-side">
        <span class="unit-points">${unitTotal} pts</span>
        <div class="unit-actions">
          <button class="btn btn-ghost btn-sm" data-toggle-warlord="${unit.id}">${unit.isWarlord ? "★ 解除" : "☆ ウォーロード"}</button>
          <button class="btn btn-ghost btn-sm" data-edit-unit="${unit.id}">編集</button>
          <button class="btn btn-ghost btn-sm" data-duplicate-unit="${unit.id}">複製</button>
          <button class="btn btn-danger btn-sm" data-delete-unit="${unit.id}">削除</button>
        </div>
      </div>
    `;
    return row;
  };

  const render = () => {
    renderList();
    renderDetail();
    document.dispatchEvent(new CustomEvent("w40k:rosters-changed"));
  };

  const escapeHtml = (str) =>
    String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // Each line: "種別(射撃/白兵), 武器名, 射程, 攻撃回数, 技能, 攻撃力, 貫通値, ダメージ[, アビリティ]"
  // Each line: "アビリティ名: 説明"（説明は省略可）
  const ABILITY_CATEGORY_TAGS = { core: "コア", faction: "陣営", detachment: "デタッチメント" };

  const parseAbilities = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        let category = "unit";
        const tagMatch = line.match(/^\[(.+?)\]\s*/);
        if (tagMatch) {
          const tag = tagMatch[1];
          if (tag.includes("コア")) category = "core";
          else if (tag.includes("陣営")) category = "faction";
          else if (tag.includes("デタッチメント")) category = "detachment";
          line = line.slice(tagMatch[0].length);
        }
        const sepIndex = [line.indexOf(":"), line.indexOf("：")].filter((i) => i >= 0).sort((a, b) => a - b)[0];
        if (sepIndex === undefined) return { id: W40K.uid(), category, name: line, text: "" };
        return { id: W40K.uid(), category, name: line.slice(0, sepIndex).trim(), text: line.slice(sepIndex + 1).trim() };
      });

  const serializeAbilities = (abilities) =>
    (abilities || [])
      .map((a) => {
        const prefix = ABILITY_CATEGORY_TAGS[a.category] ? `[${ABILITY_CATEGORY_TAGS[a.category]}] ` : "";
        return a.text ? `${prefix}${a.name}: ${a.text}` : `${prefix}${a.name}`;
      })
      .join("\n");

  // ---- group buffs (合流バフ) ----

  // Each line: "グループ名, オプション名, 種類(数値/キーワード/メモ), 対象ユニット, 対象範囲(プロフィール/射撃/白兵), 項目, 値"
  // Lines sharing the same group+option name are merged into one option with multiple modifiers.
  // Each line: "対象ユニット, 種類(数値/キーワード/メモ), 対象範囲(プロフィール/射撃/白兵), 項目, 値"
  const parseStratagemModifiers = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [targetUnit, kindLabel, scopeLabel, fieldLabel, value] = line.split(/\t|,/).map((p) => p.trim());
        const kind = kindLabel === "キーワード" ? "keyword" : kindLabel === "メモ" ? "note" : "numeric";
        const scope = scopeLabel === "射撃" ? "ranged" : scopeLabel === "白兵" ? "melee" : "profile";
        const field = scope === "profile" ? W40K.PROFILE_FIELD_MAP[fieldLabel] || fieldLabel : W40K.WEAPON_FIELD_MAP[fieldLabel] || fieldLabel;
        return { id: W40K.uid(), targetUnit: targetUnit || "", kind, scope, field, value: value || "" };
      });

  const serializeStratagemModifiers = (modifiers) =>
    (modifiers || [])
      .map((m) => {
        const kindLabel = m.kind === "keyword" ? "キーワード" : m.kind === "note" ? "メモ" : "数値";
        const scopeLabel = m.scope === "ranged" ? "射撃" : m.scope === "melee" ? "白兵" : "プロフィール";
        const fieldLabel =
          m.kind === "note" ? "" : m.scope === "profile" ? W40K.PROFILE_FIELD_LABELS[m.field] || m.field : W40K.WEAPON_FIELD_LABELS[m.field] || m.field;
        return [m.targetUnit, kindLabel, m.kind === "note" ? "" : scopeLabel, fieldLabel, m.value].join(", ");
      })
      .join("\n");

  const parseGroupBuffs = (text) => {
    const optionsByKey = new Map();
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .forEach((line) => {
        const [group, name, kindLabel, targetUnit, scopeLabel, fieldLabel, value, alwaysOnLabel] = line.split(/\t|,/).map((p) => p.trim());
        if (!group || !name) return;
        const key = `${group}\u0000${name}`;
        if (!optionsByKey.has(key)) optionsByKey.set(key, { id: W40K.uid(), group, name, alwaysOn: false, modifiers: [] });
        if (alwaysOnLabel === "常時") optionsByKey.get(key).alwaysOn = true;
        const kind = kindLabel === "キーワード" ? "keyword" : kindLabel === "メモ" ? "note" : "numeric";
        const scope = scopeLabel === "射撃" ? "ranged" : scopeLabel === "白兵" ? "melee" : "profile";
        const field = scope === "profile" ? W40K.PROFILE_FIELD_MAP[fieldLabel] || fieldLabel : W40K.WEAPON_FIELD_MAP[fieldLabel] || fieldLabel;
        optionsByKey.get(key).modifiers.push({ id: W40K.uid(), kind, targetUnit: targetUnit || "", scope, field, value: value || "" });
      });
    return Array.from(optionsByKey.values());
  };

  const serializeGroupBuffs = (groupBuffs) =>
    (groupBuffs || [])
      .flatMap((opt) =>
        opt.modifiers.map((m) => {
          const kindLabel = m.kind === "keyword" ? "キーワード" : m.kind === "note" ? "メモ" : "数値";
          const scopeLabel = m.scope === "ranged" ? "射撃" : m.scope === "melee" ? "白兵" : "プロフィール";
          const fieldLabel =
            m.kind === "note" ? "" : m.scope === "profile" ? W40K.PROFILE_FIELD_LABELS[m.field] || m.field : W40K.WEAPON_FIELD_LABELS[m.field] || m.field;
          const fields = [opt.group, opt.name, kindLabel, m.targetUnit, m.kind === "note" ? "" : scopeLabel, fieldLabel, m.value];
          if (opt.alwaysOn) fields.push("常時");
          return fields.join(", ");
        })
      )
      .join("\n");

  // Static (non-computed) description of a modifier, for the roster-side summary list.
  const summarizeModifier = (m) => {
    if (m.kind === "note") return `📝${escapeHtml(m.value)}`;
    if (m.kind === "keyword") {
      const scopeLabel = m.scope === "melee" ? "白兵武器" : "射撃武器";
      return `${escapeHtml(m.targetUnit)}の${scopeLabel}に[${escapeHtml(m.value)}]追加`;
    }
    const scopeLabel = m.scope === "profile" ? "" : m.scope === "melee" ? "白兵武器の" : "射撃武器の";
    const fieldLabel = m.scope === "profile" ? W40K.PROFILE_FIELD_LABELS[m.field] : W40K.WEAPON_FIELD_LABELS[m.field];
    const sign = Number(m.value) >= 0 ? "+" : "";
    return `${escapeHtml(m.targetUnit)}の${scopeLabel}${fieldLabel || m.field}${sign}${escapeHtml(m.value)}`;
  };

  const TARGET_TYPE_TAGS = { keyword: "キーワード", unit: "ユニット", enhancement: "強化", ability: "アビリティ" };

  // Same as summarizeModifier but without a per-modifier target prefix (the buff's target is shown once, via a tag).
  const summarizeArmyModifier = (m) => {
    if (m.kind === "note") return `📝${escapeHtml(m.value)}`;
    if (m.kind === "keyword") {
      const scopeLabel = m.scope === "melee" ? "白兵武器" : "射撃武器";
      return `${scopeLabel}に[${escapeHtml(m.value)}]追加`;
    }
    const scopeLabel = m.scope === "profile" ? "" : m.scope === "melee" ? "白兵武器の" : "射撃武器の";
    const fieldLabel = m.scope === "profile" ? W40K.PROFILE_FIELD_LABELS[m.field] : W40K.WEAPON_FIELD_LABELS[m.field];
    const sign = Number(m.value) >= 0 ? "+" : "";
    return `${scopeLabel}${fieldLabel || m.field}${sign}${escapeHtml(m.value)}`;
  };

  // Each line: "バフ名, 対象タイプ(キーワード/ユニット/強化/アビリティ), 対象値, 種類(数値/キーワード/メモ), 対象範囲(プロフィール/射撃/白兵), 項目, 値"
  const parseArmyBuffs = (text) => {
    const buffsByName = new Map();
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .forEach((line) => {
        const [name, targetTypeLabel, targetValue, kindLabel, scopeLabel, fieldLabel, value] = line.split(/\t|,/).map((p) => p.trim());
        if (!name) return;
        if (!buffsByName.has(name)) {
          const targetType =
            targetTypeLabel === "ユニット" ? "unit" : targetTypeLabel === "強化" ? "enhancement" : targetTypeLabel === "アビリティ" ? "ability" : "keyword";
          buffsByName.set(name, { id: W40K.uid(), name, targetType, targetValue: targetValue || "", modifiers: [] });
        }
        const kind = kindLabel === "キーワード" ? "keyword" : kindLabel === "メモ" ? "note" : "numeric";
        const scope = scopeLabel === "射撃" ? "ranged" : scopeLabel === "白兵" ? "melee" : "profile";
        const field = scope === "profile" ? W40K.PROFILE_FIELD_MAP[fieldLabel] || fieldLabel : W40K.WEAPON_FIELD_MAP[fieldLabel] || fieldLabel;
        buffsByName.get(name).modifiers.push({ id: W40K.uid(), kind, scope, field, value: value || "" });
      });
    return Array.from(buffsByName.values());
  };

  const serializeArmyBuffs = (armyBuffs) =>
    (armyBuffs || [])
      .flatMap((buff) =>
        buff.modifiers.map((m) => {
          const kindLabel = m.kind === "keyword" ? "キーワード" : m.kind === "note" ? "メモ" : "数値";
          const scopeLabel = m.scope === "ranged" ? "射撃" : m.scope === "melee" ? "白兵" : "プロフィール";
          const fieldLabel =
            m.kind === "note" ? "" : m.scope === "profile" ? W40K.PROFILE_FIELD_LABELS[m.field] || m.field : W40K.WEAPON_FIELD_LABELS[m.field] || m.field;
          return [buff.name, TARGET_TYPE_TAGS[buff.targetType], buff.targetValue, kindLabel, m.kind === "note" ? "" : scopeLabel, fieldLabel, m.value].join(
            ", "
          );
        })
      )
      .join("\n");

  // ---- CSV backup (units) ----

  const CSV_HEADER = [
    "name", "models", "points", "keywords", "notes",
    "enh_name", "enh_points",
    "move", "toughness", "save", "inv_save", "wounds", "leadership", "oc",
    "weapons", "abilities", "group", "is_warlord",
  ];

  const csvEscapeField = (value) => {
    const str = String(value ?? "");
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
  };

  const toCsvRow = (fields) => fields.map(csvEscapeField).join(",");

  // Minimal RFC4180-style parser: handles quoted fields with embedded commas/newlines and "" escapes.
  const parseCsv = (text) => {
    const rows = [];
    let row = [];
    let field = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') {
            field += '"';
            i++;
          } else {
            inQuotes = false;
          }
        } else {
          field += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n") {
        row.push(field);
        field = "";
        rows.push(row);
        row = [];
      } else if (c !== "\r") {
        field += c;
      }
    }
    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }
    return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
  };

  const unitToCsvRow = (u) => [
    u.name,
    u.models,
    u.points,
    u.keywords,
    u.notes,
    u.enhancement?.name || "",
    u.enhancement ? u.enhancement.points : "",
    u.profile?.move || "",
    u.profile?.toughness || "",
    u.profile?.save || "",
    u.profile?.invSave || "",
    u.profile?.wounds || "",
    u.profile?.leadership || "",
    u.profile?.oc || "",
    W40K.serializeWeapons(u.weapons),
    serializeAbilities(u.abilities),
    u.group || "",
    u.isWarlord ? "TRUE" : "",
  ];

  const csvRowToUnit = (cols) => {
    const [name, models, points, keywords, notes, enhName, enhPoints, move, toughness, save, invSave, wounds, leadership, oc, weaponsText, abilitiesText, group, isWarlord] = cols;
    return {
      id: W40K.uid(),
      name: name || "無名ユニット",
      models: Number(models) || 1,
      points: Number(points) || 0,
      keywords: keywords || "",
      notes: notes || "",
      group: group || "",
      isWarlord: /^(true|1|yes)$/i.test((isWarlord || "").trim()),
      enhancement: enhName ? { name: enhName, points: Number(enhPoints) || 0 } : null,
      profile: {
        move: move || "",
        toughness: toughness || "",
        save: save || "",
        invSave: invSave || "",
        wounds: wounds || "",
        leadership: leadership || "",
        oc: oc || "",
      },
      weapons: W40K.parseWeapons(weaponsText || ""),
      abilities: parseAbilities(abilitiesText || ""),
    };
  };

  // ---- actions ----

  const selectRoster = (id) => {
    state.selectedRosterId = id;
    render();
  };

  const deleteRoster = (id) => {
    if (!confirm("このロスターを削除しますか？元に戻せません。")) return;
    state.rosters = state.rosters.filter((r) => r.id !== id);
    if (state.selectedRosterId === id) state.selectedRosterId = null;
    persist();
    render();
  };

  const duplicateRoster = (id) => {
    const roster = getById(id);
    if (!roster) return;
    const copy = {
      ...roster,
      id: W40K.uid(),
      name: `${roster.name} (コピー)`,
      detachment: { ...roster.detachment },
      stratagems: roster.stratagems.map((s) => ({ ...s, id: W40K.uid(), modifiers: (s.modifiers || []).map((m) => ({ ...m, id: W40K.uid() })) })),
      groupBuffs: roster.groupBuffs.map((opt) => ({ ...opt, id: W40K.uid(), modifiers: opt.modifiers.map((m) => ({ ...m, id: W40K.uid() })) })),
      armyBuffs: roster.armyBuffs.map((buff) => ({ ...buff, id: W40K.uid(), modifiers: buff.modifiers.map((m) => ({ ...m, id: W40K.uid() })) })),
      units: roster.units.map((u) => ({
        ...u,
        id: W40K.uid(),
        enhancement: u.enhancement ? { ...u.enhancement } : null,
        profile: { ...u.profile },
        weapons: u.weapons.map((w) => ({ ...w, id: W40K.uid() })),
        abilities: u.abilities.map((a) => ({ ...a, id: W40K.uid() })),
      })),
    };
    state.rosters.push(copy);
    state.selectedRosterId = copy.id;
    persist();
    render();
  };

  const deleteStratagem = (stratagemId) => {
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    if (!confirm("この策略を削除しますか？")) return;
    roster.stratagems = roster.stratagems.filter((s) => s.id !== stratagemId);
    persist();
    render();
  };

  const duplicateUnit = (unitId) => {
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    const unit = roster.units.find((u) => u.id === unitId);
    if (!unit) return;
    const index = roster.units.indexOf(unit);
    const copy = {
      ...unit,
      id: W40K.uid(),
      isWarlord: false,
      enhancement: unit.enhancement ? { ...unit.enhancement } : null,
      profile: { ...unit.profile },
      weapons: unit.weapons.map((w) => ({ ...w, id: W40K.uid() })),
      abilities: unit.abilities.map((a) => ({ ...a, id: W40K.uid() })),
    };
    roster.units.splice(index + 1, 0, copy);
    persist();
    render();
  };

  const toggleWarlord = (unitId) => {
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    const unit = roster.units.find((u) => u.id === unitId);
    if (!unit) return;
    const makeWarlord = !unit.isWarlord;
    roster.units.forEach((u) => {
      u.isWarlord = false;
    });
    unit.isWarlord = makeWarlord;
    persist();
    render();
  };

  const deleteUnit = (unitId) => {
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    if (!confirm("このユニットを削除しますか？")) return;
    roster.units = roster.units.filter((u) => u.id !== unitId);
    persist();
    render();
  };

  const exportRoster = (id) => {
    const roster = getById(id);
    if (!roster) return;
    const blob = new Blob([JSON.stringify(roster, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${roster.name || "roster"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportUnitsCsv = (id) => {
    const roster = getById(id);
    if (!roster) return;
    const rows = [CSV_HEADER, ...roster.units.map(unitToCsvRow)].map(toCsvRow).join("\n");
    // Leading BOM so Excel opens the Japanese text as UTF-8 instead of guessing Shift-JIS.
    const blob = new Blob(["﻿" + rows], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${roster.name || "roster"}_units.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importUnitsCsv = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const roster = getById(state.selectedRosterId);
        if (!roster) {
          alert("先にロスターを選択してください。");
          return;
        }
        let rows = parseCsv(reader.result);
        if (rows.length && rows[0][0]?.trim().toLowerCase() === "name") rows = rows.slice(1);
        const units = rows.map(csvRowToUnit);
        if (units.length === 0) return;
        roster.units.push(...units);
        persist();
        render();
      } catch (err) {
        alert("CSVの読み込みに失敗しました。");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const importRoster = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.name || !Array.isArray(data.units)) throw new Error("invalid format");
        const roster = {
          id: W40K.uid(),
          name: data.name,
          faction: data.faction || "",
          pointsLimit: Number(data.pointsLimit) || 0,
          detachment: { name: data.detachment?.name || "", rule: data.detachment?.rule || "" },
          stratagems: Array.isArray(data.stratagems)
            ? data.stratagems.map((s) => ({
                id: W40K.uid(),
                name: s.name || "無名策略",
                cost: Number(s.cost) || 0,
                phase: s.phase || "",
                text: s.text || "",
                modifiers: Array.isArray(s.modifiers)
                  ? s.modifiers.map((m) => ({
                      id: W40K.uid(),
                      targetUnit: m.targetUnit || "",
                      kind: m.kind || "numeric",
                      scope: m.scope || "profile",
                      field: m.field || "",
                      value: m.value || "",
                    }))
                  : [],
              }))
            : [],
          groupBuffs: Array.isArray(data.groupBuffs)
            ? data.groupBuffs.map((opt) => ({
                id: W40K.uid(),
                group: opt.group || "",
                name: opt.name || "無名オプション",
                alwaysOn: !!opt.alwaysOn,
                modifiers: Array.isArray(opt.modifiers)
                  ? opt.modifiers.map((m) => ({
                      id: W40K.uid(),
                      kind: m.kind || "numeric",
                      targetUnit: m.targetUnit || "",
                      scope: m.scope || "profile",
                      field: m.field || "",
                      value: m.value || "",
                    }))
                  : [],
              }))
            : [],
          armyBuffs: Array.isArray(data.armyBuffs)
            ? data.armyBuffs.map((buff) => ({
                id: W40K.uid(),
                name: buff.name || "無名バフ",
                targetType: buff.targetType || "keyword",
                targetValue: buff.targetValue || "",
                modifiers: Array.isArray(buff.modifiers)
                  ? buff.modifiers.map((m) => ({
                      id: W40K.uid(),
                      kind: m.kind || "numeric",
                      scope: m.scope || "profile",
                      field: m.field || "",
                      value: m.value || "",
                    }))
                  : [],
              }))
            : [],
          units: data.units.map((u) => ({
            id: W40K.uid(),
            name: u.name || "無名ユニット",
            models: Number(u.models) || 1,
            points: Number(u.points) || 0,
            keywords: u.keywords || "",
            notes: u.notes || "",
            group: u.group || "",
            isWarlord: !!u.isWarlord,
            enhancement: u.enhancement ? { name: u.enhancement.name || "", points: Number(u.enhancement.points) || 0 } : null,
            profile: {
              move: u.profile?.move || "",
              toughness: u.profile?.toughness || "",
              save: u.profile?.save || "",
              invSave: u.profile?.invSave || "",
              wounds: u.profile?.wounds || "",
              leadership: u.profile?.leadership || "",
              oc: u.profile?.oc || "",
            },
            weapons: Array.isArray(u.weapons)
              ? u.weapons.map((w) => ({
                  id: W40K.uid(),
                  type: w.type === "melee" ? "melee" : "ranged",
                  name: w.name || "無名武器",
                  range: w.range || "",
                  attacks: w.attacks || "",
                  skill: w.skill || "",
                  strength: w.strength || "",
                  ap: w.ap || "",
                  damage: w.damage || "",
                  abilities: w.abilities || "",
                }))
              : [],
            abilities: Array.isArray(u.abilities)
              ? u.abilities.map((a) => ({ id: W40K.uid(), category: a.category || "unit", name: a.name || "", text: a.text || "" }))
              : [],
          })),
        };
        state.rosters.push(roster);
        state.selectedRosterId = roster.id;
        persist();
        render();
      } catch (err) {
        alert("インポートに失敗しました。JSONファイルの形式を確認してください。");
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  // ---- modals ----

  const rosterModal = document.getElementById("modal-roster");
  const rosterForm = document.getElementById("form-roster");
  let editingRosterId = null;

  const openRosterModal = (id) => {
    editingRosterId = id || null;
    const roster = id ? getById(id) : null;
    document.getElementById("modal-roster-title").textContent = roster ? "ロスター編集" : "新規ロスター";
    document.getElementById("roster-form-name").value = roster?.name || "";
    document.getElementById("roster-form-faction").value = roster?.faction || "";
    document.getElementById("roster-form-points").value = roster?.pointsLimit ?? 2000;
    rosterModal.showModal();
  };

  rosterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("roster-form-name").value.trim();
    if (!name) return;
    const faction = document.getElementById("roster-form-faction").value.trim();
    const pointsLimit = Number(document.getElementById("roster-form-points").value) || 0;

    if (editingRosterId) {
      const roster = getById(editingRosterId);
      Object.assign(roster, { name, faction, pointsLimit });
    } else {
      const roster = {
        id: W40K.uid(),
        name,
        faction,
        pointsLimit,
        detachment: { name: "", rule: "" },
        stratagems: [],
        groupBuffs: [],
        armyBuffs: [],
        units: [],
      };
      state.rosters.push(roster);
      state.selectedRosterId = roster.id;
    }
    persist();
    render();
    rosterModal.close();
  });

  const detachmentModal = document.getElementById("modal-detachment");
  const detachmentForm = document.getElementById("form-detachment");

  const refreshDetachmentMasterPicker = () => {
    const picker = document.getElementById("detachment-master-picker");
    const library = W40K.Detachments.getAll();
    picker.innerHTML =
      '<option value="">選択しない（手入力）</option>' +
      library.map((d) => `<option value="${escapeHtml(d.name)}">${escapeHtml(d.name)}（${escapeHtml(d.forceType)}・${d.dp}DP）</option>`).join("");
    picker.value = "";
  };

  const openDetachmentModal = () => {
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    document.getElementById("detachment-form-name").value = roster.detachment.name || "";
    document.getElementById("detachment-form-rule").value = roster.detachment.rule || "";
    refreshDetachmentMasterPicker();
    detachmentModal.showModal();
  };

  detachmentForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    roster.detachment = {
      name: document.getElementById("detachment-form-name").value.trim(),
      rule: document.getElementById("detachment-form-rule").value.trim(),
    };
    persist();
    render();
    detachmentModal.close();
  });

  const stratagemModal = document.getElementById("modal-stratagem");
  const stratagemForm = document.getElementById("form-stratagem");
  let editingStratagemId = null;

  const refreshStratagemMasterPicker = (roster) => {
    const picker = document.getElementById("stratagem-master-picker");
    const detachment = W40K.Detachments.getByName(roster.detachment.name);
    const stratagems = detachment ? detachment.stratagems : [];
    const coreStratagems = W40K.Detachments.getCoreStratagems();
    const optionHtml = (s) => `<option value="${s.id}">${escapeHtml(s.name)}（CP${s.cost}）</option>`;
    picker.innerHTML =
      '<option value="">選択しない（手入力）</option>' +
      (coreStratagems.length ? `<optgroup label="コア策略（共通）">${coreStratagems.map(optionHtml).join("")}</optgroup>` : "") +
      (stratagems.length
        ? `<optgroup label="デタッチメント策略">${stratagems.map(optionHtml).join("")}</optgroup>`
        : '<option value="" disabled>現在のデタッチメント名と一致するマスタがありません</option>');
    picker.value = "";
  };

  const openStratagemModal = (stratagemId) => {
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    editingStratagemId = stratagemId || null;
    const strat = stratagemId ? roster.stratagems.find((s) => s.id === stratagemId) : null;
    document.getElementById("modal-stratagem-title").textContent = strat ? "策略編集" : "策略追加";
    document.getElementById("stratagem-form-name").value = strat?.name || "";
    document.getElementById("stratagem-form-cost").value = strat?.cost ?? 1;
    document.getElementById("stratagem-form-phase").value = strat?.phase || "";
    document.getElementById("stratagem-form-text").value = strat?.text || "";
    document.getElementById("stratagem-form-modifiers").value = serializeStratagemModifiers(strat?.modifiers);
    refreshStratagemMasterPicker(roster);
    stratagemModal.showModal();
  };

  stratagemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    const data = {
      name: document.getElementById("stratagem-form-name").value.trim() || "無名策略",
      cost: Number(document.getElementById("stratagem-form-cost").value) || 0,
      phase: document.getElementById("stratagem-form-phase").value.trim(),
      text: document.getElementById("stratagem-form-text").value.trim(),
      modifiers: parseStratagemModifiers(document.getElementById("stratagem-form-modifiers").value),
    };
    if (editingStratagemId) {
      const strat = roster.stratagems.find((s) => s.id === editingStratagemId);
      Object.assign(strat, data);
    } else {
      roster.stratagems.push({ id: W40K.uid(), ...data });
    }
    persist();
    render();
    stratagemModal.close();
  });

  const groupBuffsModal = document.getElementById("modal-group-buffs");
  const groupBuffsForm = document.getElementById("form-group-buffs");

  // The 項目(field) options depend on 対象範囲(scope), and only matter when 種類(kind) is 数値.
  const refreshGroupBuffFieldOptions = () => {
    const scope = document.getElementById("group-buff-quick-scope").value;
    const kind = document.getElementById("group-buff-quick-kind").value;
    const fieldSelect = document.getElementById("group-buff-quick-field");
    const labels = scope === "profile" ? W40K.PROFILE_FIELD_MAP : W40K.WEAPON_FIELD_MAP;
    fieldSelect.innerHTML = Object.keys(labels)
      .map((label) => `<option value="${escapeHtml(label)}">${escapeHtml(label)}</option>`)
      .join("");
    fieldSelect.disabled = kind !== "numeric";
  };

  // グループ名 suggestions: groups already used by this roster's units, plus any already registered.
  const refreshGroupBuffGroupList = (roster) => {
    const list = document.getElementById("group-buff-quick-group-list");
    const values = [...new Set([...roster.units.map((u) => u.group).filter(Boolean), ...roster.groupBuffs.map((o) => o.group)])];
    list.innerHTML = values.map((v) => `<option value="${escapeHtml(v)}"></option>`).join("");
  };

  // 対象ユニット suggestions: exact unit names in this roster (targetUnit is matched exactly, not by substring).
  const refreshGroupBuffTargetUnitList = (roster) => {
    const list = document.getElementById("group-buff-quick-target-unit-list");
    list.innerHTML = roster.units.map((u) => `<option value="${escapeHtml(u.name)}"></option>`).join("");
  };

  const refreshGroupBuffQuickAdd = (roster) => {
    refreshGroupBuffFieldOptions();
    refreshGroupBuffGroupList(roster);
    refreshGroupBuffTargetUnitList(roster);
  };

  const openGroupBuffsModal = () => {
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    document.getElementById("group-buffs-input").value = serializeGroupBuffs(roster.groupBuffs);
    refreshGroupBuffQuickAdd(roster);
    groupBuffsModal.showModal();
  };

  groupBuffsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    roster.groupBuffs = parseGroupBuffs(document.getElementById("group-buffs-input").value);
    persist();
    render();
    groupBuffsModal.close();
  });

  const armyBuffsModal = document.getElementById("modal-army-buffs");
  const armyBuffsForm = document.getElementById("form-army-buffs");

  // The 項目(field) options depend on 対象範囲(scope), and only matter when 種類(kind) is 数値.
  const refreshArmyBuffFieldOptions = () => {
    const scope = document.getElementById("army-buff-quick-scope").value;
    const kind = document.getElementById("army-buff-quick-kind").value;
    const fieldSelect = document.getElementById("army-buff-quick-field");
    const labels = scope === "profile" ? W40K.PROFILE_FIELD_MAP : W40K.WEAPON_FIELD_MAP;
    fieldSelect.innerHTML = Object.keys(labels)
      .map((label) => `<option value="${escapeHtml(label)}">${escapeHtml(label)}</option>`)
      .join("");
    fieldSelect.disabled = kind !== "numeric";
  };

  // The 対象値(target value) suggestion list depends on 対象タイプ(target type): keywords from the
  // keyword library, unit names from this roster, or enhancement names from the current detachment.
  const refreshArmyBuffTargetValueList = (roster) => {
    const targetType = document.getElementById("army-buff-quick-target-type").value;
    const list = document.getElementById("army-buff-quick-target-value-list");
    let values = [];
    if (targetType === "unit") {
      values = roster.units.map((u) => u.name);
    } else if (targetType === "enhancement") {
      const detachment = W40K.Detachments.getByName(roster.detachment.name);
      values = detachment ? detachment.enhancements.map((e) => e.name) : [];
    } else if (targetType === "ability") {
      values = [...new Set(roster.units.flatMap((u) => (u.abilities || []).map((a) => a.name)))];
    } else {
      values = W40K.Keywords.getAll();
    }
    list.innerHTML = values.map((v) => `<option value="${escapeHtml(v)}"></option>`).join("");
  };

  const refreshArmyBuffQuickAdd = (roster) => {
    refreshArmyBuffFieldOptions();
    refreshArmyBuffTargetValueList(roster);
  };

  const openArmyBuffsModal = () => {
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    document.getElementById("army-buffs-input").value = serializeArmyBuffs(roster.armyBuffs);
    refreshArmyBuffQuickAdd(roster);
    armyBuffsModal.showModal();
  };

  armyBuffsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    roster.armyBuffs = parseArmyBuffs(document.getElementById("army-buffs-input").value);
    persist();
    render();
    armyBuffsModal.close();
  });

  const unitModal = document.getElementById("modal-unit");
  const unitForm = document.getElementById("form-unit");

  const openUnitModal = (unitId) => {
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    state.editingUnitId = unitId || null;
    const unit = unitId ? roster.units.find((u) => u.id === unitId) : null;
    document.getElementById("modal-unit-title").textContent = unit ? "ユニット編集" : "ユニット追加";
    document.getElementById("unit-form-name").value = unit?.name || "";
    document.getElementById("unit-form-models").value = unit?.models ?? 1;
    document.getElementById("unit-form-points").value = unit?.points ?? 0;
    document.getElementById("unit-form-keywords").value = unit?.keywords || "";
    document.getElementById("unit-form-notes").value = unit?.notes || "";
    document.getElementById("unit-form-group").value = unit?.group || "";
    document.getElementById("unit-form-enh-name").value = unit?.enhancement?.name || "";
    document.getElementById("unit-form-enh-points").value = unit?.enhancement?.points ?? 0;
    document.getElementById("unit-form-move").value = unit?.profile?.move || "";
    document.getElementById("unit-form-toughness").value = unit?.profile?.toughness || "";
    document.getElementById("unit-form-save").value = unit?.profile?.save || "";
    document.getElementById("unit-form-invsave").value = unit?.profile?.invSave || "";
    document.getElementById("unit-form-wounds").value = unit?.profile?.wounds || "";
    document.getElementById("unit-form-leadership").value = unit?.profile?.leadership || "";
    document.getElementById("unit-form-oc").value = unit?.profile?.oc || "";
    document.getElementById("unit-form-weapons").value = W40K.serializeWeapons(unit?.weapons);
    document.getElementById("unit-form-abilities").value = serializeAbilities(unit?.abilities);
    refreshWeaponPicker();
    refreshKeywordPicker();
    refreshAbilityPicker();
    refreshEnhancementMasterPicker(roster);
    unitModal.showModal();
  };

  const refreshWeaponPicker = () => {
    const picker = document.getElementById("unit-form-weapon-picker");
    const library = W40K.Armory.getAll();
    if (library.length === 0) {
      picker.innerHTML = '<option value="" disabled>武器庫が空です（武器庫タブから登録）</option>';
      return;
    }
    picker.innerHTML = library
      .map((w) => `<option value="${w.id}">${w.type === "melee" ? "⚔" : "🔫"} ${escapeHtml(w.name)} (${escapeHtml(w.range || "白兵")})</option>`)
      .join("");
  };

  const refreshKeywordPicker = () => {
    const picker = document.getElementById("unit-form-keyword-picker");
    const library = W40K.Keywords.getAll();
    if (library.length === 0) {
      picker.innerHTML = '<option value="" disabled>キーワード帳が空です</option>';
      return;
    }
    picker.innerHTML = library.map((k) => `<option value="${escapeHtml(k)}">${escapeHtml(k)}</option>`).join("");
  };

  const refreshAbilityPicker = () => {
    const picker = document.getElementById("unit-form-ability-picker");
    const library = W40K.Abilities.getAll();
    if (library.length === 0) {
      picker.innerHTML = '<option value="" disabled>アビリティ辞書が空です</option>';
      return;
    }
    picker.innerHTML = library.map((line) => `<option value="${escapeHtml(line)}">${escapeHtml(line)}</option>`).join("");
  };

  // Filters the current detachment's enhancements to ones this (possibly unsaved) unit actually qualifies
  // for: Enhancements are CHARACTER-only in the core rules, plus each enhancement's own restrict/exclude
  // keyword match against the unit's name/keywords as currently typed in the form.
  const refreshEnhancementMasterPicker = (roster) => {
    const picker = document.getElementById("enhancement-master-picker");
    const detachment = W40K.Detachments.getByName(roster.detachment.name);
    const allEnhancements = detachment ? detachment.enhancements : [];
    const draftUnit = {
      name: document.getElementById("unit-form-name").value,
      keywords: document.getElementById("unit-form-keywords").value,
    };
    const isCharacter = draftUnit.keywords.includes("キャラクター");
    const eligible = isCharacter ? allEnhancements.filter((e) => W40K.unitMatchesRestriction(draftUnit, e.restrict, e.exclude)) : [];
    picker.innerHTML =
      '<option value="">選択しない（手入力）</option>' +
      (!detachment
        ? '<option value="" disabled>現在のデタッチメント名と一致するマスタがありません</option>'
        : !isCharacter
        ? '<option value="" disabled>キャラクターのみ強化を装備できます（キーワードに「キャラクター」の追加が必要）</option>'
        : eligible.length === 0
        ? '<option value="" disabled>このユニットが対象の強化はありません</option>'
        : eligible.map((e) => `<option value="${e.id}">${escapeHtml(e.name)}（${e.points}pt）</option>`).join(""));
    picker.value = "";
  };

  // Appends keywords not already present in the comma-separated keyword field.
  const appendKeywords = (keywords) => {
    const field = document.getElementById("unit-form-keywords");
    const existing = field.value
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
    keywords.forEach((k) => {
      if (!existing.includes(k)) existing.push(k);
    });
    field.value = existing.join(", ");
    const roster = getById(state.selectedRosterId);
    if (roster) refreshEnhancementMasterPicker(roster);
  };

  // Appends full ability lines (raw "[category] name: text" bulk-text format) not already present.
  const appendAbilityLines = (lines) => {
    const field = document.getElementById("unit-form-abilities");
    const existing = field.value
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    lines.forEach((line) => {
      if (!existing.includes(line)) existing.push(line);
    });
    field.value = existing.join("\n");
  };

  unitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    const enhName = document.getElementById("unit-form-enh-name").value.trim();
    const data = {
      name: document.getElementById("unit-form-name").value.trim() || "無名ユニット",
      models: Number(document.getElementById("unit-form-models").value) || 1,
      points: Number(document.getElementById("unit-form-points").value) || 0,
      keywords: document.getElementById("unit-form-keywords").value.trim(),
      notes: document.getElementById("unit-form-notes").value.trim(),
      group: document.getElementById("unit-form-group").value.trim(),
      enhancement: enhName ? { name: enhName, points: Number(document.getElementById("unit-form-enh-points").value) || 0 } : null,
      profile: {
        move: document.getElementById("unit-form-move").value.trim(),
        toughness: document.getElementById("unit-form-toughness").value.trim(),
        save: document.getElementById("unit-form-save").value.trim(),
        invSave: document.getElementById("unit-form-invsave").value.trim(),
        wounds: document.getElementById("unit-form-wounds").value.trim(),
        leadership: document.getElementById("unit-form-leadership").value.trim(),
        oc: document.getElementById("unit-form-oc").value.trim(),
      },
      weapons: W40K.parseWeapons(document.getElementById("unit-form-weapons").value),
      abilities: parseAbilities(document.getElementById("unit-form-abilities").value),
    };
    if (state.editingUnitId) {
      const unit = roster.units.find((u) => u.id === state.editingUnitId);
      Object.assign(unit, data);
    } else {
      roster.units.push({ id: W40K.uid(), ...data });
    }
    persist();
    render();
    unitModal.close();
  });

  const bulkUnitsModal = document.getElementById("modal-bulk-units");
  const bulkUnitsForm = document.getElementById("form-bulk-units");

  // Each line: "name, models, total points[, keywords][, notes]" (tabs also accepted, e.g. pasted from a spreadsheet).
  const parseBulkUnits = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [name, models, points, keywords, notes] = line.split(/\t|,/).map((p) => p.trim());
        return {
          id: W40K.uid(),
          name: name || "無名ユニット",
          models: Number(models) || 1,
          points: Number(points) || 0,
          keywords: keywords || "",
          notes: notes || "",
          group: "",
          enhancement: null,
          profile: { move: "", toughness: "", save: "", invSave: "", wounds: "", leadership: "", oc: "" },
          weapons: [],
          abilities: [],
        };
      });

  bulkUnitsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    const input = document.getElementById("bulk-units-input");
    const units = parseBulkUnits(input.value);
    if (units.length === 0) return;
    roster.units.push(...units);
    persist();
    render();
    input.value = "";
    bulkUnitsModal.close();
  });

  // ---- init ----

  const init = () => {
    cacheEls();

    document.getElementById("btn-new-roster").addEventListener("click", () => openRosterModal());
    document.getElementById("btn-edit-roster").addEventListener("click", () => openRosterModal(state.selectedRosterId));
    document.getElementById("btn-duplicate-roster").addEventListener("click", () => duplicateRoster(state.selectedRosterId));
    document.getElementById("btn-delete-roster").addEventListener("click", () => deleteRoster(state.selectedRosterId));
    document.getElementById("btn-export-roster").addEventListener("click", () => exportRoster(state.selectedRosterId));
    document.getElementById("btn-export-units-csv").addEventListener("click", () => exportUnitsCsv(state.selectedRosterId));
    document.getElementById("btn-new-unit").addEventListener("click", () => openUnitModal());
    document.getElementById("btn-bulk-units").addEventListener("click", () => bulkUnitsModal.showModal());

    document.getElementById("btn-add-picked-weapons").addEventListener("click", () => {
      const picker = document.getElementById("unit-form-weapon-picker");
      const library = W40K.Armory.getAll();
      const picked = Array.from(picker.selectedOptions)
        .map((opt) => library.find((w) => w.id === opt.value))
        .filter(Boolean);
      if (picked.length === 0) return;
      const textarea = document.getElementById("unit-form-weapons");
      const existing = textarea.value.trim();
      const addedLines = W40K.serializeWeapons(picked);
      textarea.value = existing ? `${existing}\n${addedLines}` : addedLines;
      Array.from(picker.options).forEach((opt) => (opt.selected = false));
    });

    document.getElementById("btn-add-picked-keywords").addEventListener("click", () => {
      const picker = document.getElementById("unit-form-keyword-picker");
      const picked = Array.from(picker.selectedOptions).map((opt) => opt.value);
      if (picked.length === 0) return;
      appendKeywords(picked);
      Array.from(picker.options).forEach((opt) => (opt.selected = false));
    });

    document.getElementById("btn-add-new-keyword").addEventListener("click", () => {
      const input = document.getElementById("unit-form-new-keyword");
      const value = input.value.trim();
      if (!value) return;
      W40K.Keywords.addKeyword(value);
      appendKeywords([value]);
      refreshKeywordPicker();
      input.value = "";
    });

    document.addEventListener("w40k:keywords-changed", () => refreshKeywordPicker());

    document.getElementById("btn-add-picked-abilities").addEventListener("click", () => {
      const picker = document.getElementById("unit-form-ability-picker");
      const picked = Array.from(picker.selectedOptions).map((opt) => opt.value);
      if (picked.length === 0) return;
      appendAbilityLines(picked);
      Array.from(picker.options).forEach((opt) => (opt.selected = false));
    });

    document.getElementById("btn-add-new-ability").addEventListener("click", () => {
      const input = document.getElementById("unit-form-new-ability");
      const value = input.value.trim();
      if (!value) return;
      W40K.Abilities.addAbility(value);
      appendAbilityLines([value]);
      refreshAbilityPicker();
      input.value = "";
    });

    document.addEventListener("w40k:abilities-changed", () => refreshAbilityPicker());

    document.getElementById("detachment-master-picker").addEventListener("change", (e) => {
      const detachment = W40K.Detachments.getByName(e.target.value);
      if (!detachment) return;
      document.getElementById("detachment-form-name").value = detachment.name;
      document.getElementById("detachment-form-rule").value = detachment.rule;
    });

    document.getElementById("stratagem-master-picker").addEventListener("change", (e) => {
      const roster = getById(state.selectedRosterId);
      const detachment = roster ? W40K.Detachments.getByName(roster.detachment.name) : null;
      const strat =
        (detachment && detachment.stratagems.find((s) => s.id === e.target.value)) ||
        W40K.Detachments.getCoreStratagems().find((s) => s.id === e.target.value);
      if (!strat) return;
      document.getElementById("stratagem-form-name").value = strat.name;
      document.getElementById("stratagem-form-cost").value = strat.cost;
      document.getElementById("stratagem-form-phase").value = strat.phase;
      document.getElementById("stratagem-form-text").value = strat.text;
    });

    ["unit-form-name", "unit-form-keywords"].forEach((id) => {
      document.getElementById(id).addEventListener("input", () => {
        const roster = getById(state.selectedRosterId);
        if (roster) refreshEnhancementMasterPicker(roster);
      });
    });

    document.getElementById("enhancement-master-picker").addEventListener("change", (e) => {
      const roster = getById(state.selectedRosterId);
      const detachment = roster ? W40K.Detachments.getByName(roster.detachment.name) : null;
      const enh = detachment ? detachment.enhancements.find((en) => en.id === e.target.value) : null;
      if (!enh) return;
      document.getElementById("unit-form-enh-name").value = enh.name;
      document.getElementById("unit-form-enh-points").value = enh.points;
    });

    document.getElementById("units-csv-import-input").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) importUnitsCsv(file);
      e.target.value = "";
    });
    els.armyRuleSelect.addEventListener("change", () => {
      const roster = getById(state.selectedRosterId);
      if (!roster) return;
      roster.armyRule = els.armyRuleSelect.value;
      persist();
    });

    document.getElementById("btn-edit-detachment").addEventListener("click", () => openDetachmentModal());
    document.getElementById("btn-new-stratagem").addEventListener("click", () => openStratagemModal());
    document.getElementById("btn-edit-group-buffs").addEventListener("click", () => openGroupBuffsModal());
    document.getElementById("btn-edit-army-buffs").addEventListener("click", () => openArmyBuffsModal());

    document.getElementById("army-buff-quick-scope").addEventListener("change", refreshArmyBuffFieldOptions);
    document.getElementById("army-buff-quick-kind").addEventListener("change", refreshArmyBuffFieldOptions);
    document.getElementById("army-buff-quick-target-type").addEventListener("change", () => {
      const roster = getById(state.selectedRosterId);
      if (roster) refreshArmyBuffTargetValueList(roster);
    });

    document.getElementById("btn-add-army-buff-line").addEventListener("click", () => {
      const name = document.getElementById("army-buff-quick-name").value.trim();
      if (!name) {
        alert("バフ名を入力してください。");
        return;
      }
      const targetType = document.getElementById("army-buff-quick-target-type").value;
      const targetValue = document.getElementById("army-buff-quick-target-value").value.trim();
      const kind = document.getElementById("army-buff-quick-kind").value;
      const kindLabel = kind === "keyword" ? "キーワード" : kind === "note" ? "メモ" : "数値";
      const scope = document.getElementById("army-buff-quick-scope").value;
      const scopeLabel = scope === "ranged" ? "射撃" : scope === "melee" ? "白兵" : "プロフィール";
      const field = document.getElementById("army-buff-quick-field").value;
      const value = document.getElementById("army-buff-quick-value").value.trim();
      const line = [name, TARGET_TYPE_TAGS[targetType], targetValue, kindLabel, kind === "note" ? "" : scopeLabel, kind === "numeric" ? field : "", value].join(
        ", "
      );
      const textarea = document.getElementById("army-buffs-input");
      textarea.value = textarea.value.trim() ? `${textarea.value.trim()}\n${line}` : line;
      document.getElementById("army-buff-quick-value").value = "";
    });

    document.getElementById("group-buff-quick-scope").addEventListener("change", refreshGroupBuffFieldOptions);
    document.getElementById("group-buff-quick-kind").addEventListener("change", refreshGroupBuffFieldOptions);

    document.getElementById("btn-add-group-buff-line").addEventListener("click", () => {
      const group = document.getElementById("group-buff-quick-group").value.trim();
      const name = document.getElementById("group-buff-quick-name").value.trim();
      if (!group || !name) {
        alert("グループ名とオプション名を入力してください。");
        return;
      }
      const targetUnit = document.getElementById("group-buff-quick-target-unit").value.trim();
      const kind = document.getElementById("group-buff-quick-kind").value;
      const kindLabel = kind === "keyword" ? "キーワード" : kind === "note" ? "メモ" : "数値";
      const scope = document.getElementById("group-buff-quick-scope").value;
      const scopeLabel = scope === "ranged" ? "射撃" : scope === "melee" ? "白兵" : "プロフィール";
      const field = document.getElementById("group-buff-quick-field").value;
      const value = document.getElementById("group-buff-quick-value").value.trim();
      const alwaysOn = document.getElementById("group-buff-quick-always").checked;
      const fields = [group, name, kindLabel, targetUnit, kind === "note" ? "" : scopeLabel, kind === "numeric" ? field : "", value];
      if (alwaysOn) fields.push("常時");
      const line = fields.join(", ");
      const textarea = document.getElementById("group-buffs-input");
      textarea.value = textarea.value.trim() ? `${textarea.value.trim()}\n${line}` : line;
      document.getElementById("group-buff-quick-value").value = "";
    });

    document.getElementById("roster-import-input").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) importRoster(file);
      e.target.value = "";
    });

    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener("click", () => btn.closest("dialog").close());
    });

    render();
  };

  W40K.Roster = {
    init,
    getAll: () => state.rosters,
    getById,
    totalPoints,
  };
})();
