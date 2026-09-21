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
    if (!roster.stratagems) roster.stratagems = [];
    roster.units.forEach((u) => {
      if (u.enhancement === undefined) u.enhancement = null;
      if (!u.profile) u.profile = { move: "", toughness: "", save: "", invSave: "", wounds: "", leadership: "", oc: "" };
      if (u.profile.invSave === undefined) u.profile.invSave = "";
      if (!u.weapons) u.weapons = [];
      if (!u.abilities) u.abilities = [];
      if (u.group === undefined) u.group = "";
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
    els.stratagemList = document.getElementById("stratagem-list");
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

    els.stratagemList.innerHTML = "";
    if (roster.stratagems.length === 0) {
      els.stratagemList.innerHTML = '<p class="empty-state">ストラタジムが未登録です。</p>';
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
        groupUnits.forEach((u) => wrapper.appendChild(buildUnitCard(u)));
        els.unitList.appendChild(wrapper);
      } else {
        rendered.add(unit.id);
        els.unitList.appendChild(buildUnitCard(unit));
      }
    });

    els.unitList.querySelectorAll("[data-edit-unit]").forEach((btn) => {
      btn.addEventListener("click", () => openUnitModal(btn.dataset.editUnit));
    });
    els.unitList.querySelectorAll("[data-delete-unit]").forEach((btn) => {
      btn.addEventListener("click", () => deleteUnit(btn.dataset.deleteUnit));
    });
  };

  const buildUnitCard = (unit) => {
    const row = document.createElement("article");
    row.className = "unit-card";
    const unitTotal = unit.points + (unit.enhancement ? unit.enhancement.points : 0);
    const p = unit.profile;
    const hasProfile = p && (p.move || p.toughness || p.save || p.invSave || p.wounds || p.leadership || p.oc);
    const profileHtml = hasProfile
      ? `<p class="unit-profile">
          <span>移動<strong>${escapeHtml(p.move || "-")}</strong></span>
          <span>耐久<strong>${escapeHtml(p.toughness || "-")}</strong></span>
          <span>防御<strong>${escapeHtml(p.save || "-")}</strong></span>
          ${p.invSave ? `<span>特防<strong>${escapeHtml(p.invSave)}</strong></span>` : ""}
          <span>傷<strong>${escapeHtml(p.wounds || "-")}</strong></span>
          <span>統率<strong>${escapeHtml(p.leadership || "-")}</strong></span>
          <span>確保<strong>${escapeHtml(p.oc || "-")}</strong></span>
        </p>`
      : "";
    const weaponsHtml = unit.weapons.length
      ? `<table class="weapon-table">
          <thead><tr><th>武器</th><th>射程</th><th>攻</th><th>技</th><th>攻撃力</th><th>貫通</th><th>ダメ</th></tr></thead>
          <tbody>
            ${unit.weapons
              .map(
                (w) => `<tr>
                  <td>${w.type === "melee" ? "⚔" : "🔫"} ${escapeHtml(w.name)}${w.abilities ? ` <span class="weapon-ability">[${escapeHtml(w.abilities)}]</span>` : ""}</td>
                  <td>${escapeHtml(w.range)}</td>
                  <td>${escapeHtml(w.attacks)}</td>
                  <td>${escapeHtml(w.skill)}</td>
                  <td>${escapeHtml(w.strength)}</td>
                  <td>${escapeHtml(w.ap)}</td>
                  <td>${escapeHtml(w.damage)}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>`
      : "";
    const abilitiesHtml = unit.abilities.length
      ? `<ul class="ability-list">
          ${unit.abilities.map((a) => `<li><strong>${escapeHtml(a.name)}</strong>${a.text ? `: ${escapeHtml(a.text)}` : ""}</li>`).join("")}
        </ul>`
      : "";
    row.innerHTML = `
      <div class="unit-main">
        <h4>${escapeHtml(unit.name)} <span class="unit-models">×${unit.models}</span></h4>
        <p class="meta-line">${escapeHtml(unit.keywords || "")}</p>
        ${unit.notes ? `<p class="unit-notes">${escapeHtml(unit.notes)}</p>` : ""}
        ${unit.enhancement ? `<p class="unit-enhancement">✦ ${escapeHtml(unit.enhancement.name)} (+${unit.enhancement.points}pts)</p>` : ""}
        ${profileHtml}
        ${weaponsHtml}
        ${abilitiesHtml}
      </div>
      <div class="unit-side">
        <span class="unit-points">${unitTotal} pts</span>
        <div class="unit-actions">
          <button class="btn btn-ghost btn-sm" data-edit-unit="${unit.id}">編集</button>
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
  const parseWeapons = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const [type, name, range, attacks, skill, strength, ap, damage, abilities] = line.split(/\t|,/).map((p) => p.trim());
        return {
          id: W40K.uid(),
          type: type === "白兵" ? "melee" : "ranged",
          name: name || "無名武器",
          range: range || "",
          attacks: attacks || "",
          skill: skill || "",
          strength: strength || "",
          ap: ap || "",
          damage: damage || "",
          abilities: abilities || "",
        };
      });

  const serializeWeapons = (weapons) =>
    (weapons || [])
      .map((w) => {
        const fields = [w.type === "melee" ? "白兵" : "射撃", w.name, w.range, w.attacks, w.skill, w.strength, w.ap, w.damage];
        if (w.abilities) fields.push(w.abilities);
        return fields.join(", ");
      })
      .join("\n");

  // Each line: "アビリティ名: 説明"（説明は省略可）
  const parseAbilities = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const sepIndex = [line.indexOf(":"), line.indexOf("：")].filter((i) => i >= 0).sort((a, b) => a - b)[0];
        if (sepIndex === undefined) return { id: W40K.uid(), name: line, text: "" };
        return { id: W40K.uid(), name: line.slice(0, sepIndex).trim(), text: line.slice(sepIndex + 1).trim() };
      });

  const serializeAbilities = (abilities) =>
    (abilities || []).map((a) => (a.text ? `${a.name}: ${a.text}` : a.name)).join("\n");

  // ---- CSV backup (units) ----

  const CSV_HEADER = [
    "name", "models", "points", "keywords", "notes",
    "enh_name", "enh_points",
    "move", "toughness", "save", "inv_save", "wounds", "leadership", "oc",
    "weapons", "abilities", "group",
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
    serializeWeapons(u.weapons),
    serializeAbilities(u.abilities),
    u.group || "",
  ];

  const csvRowToUnit = (cols) => {
    const [name, models, points, keywords, notes, enhName, enhPoints, move, toughness, save, invSave, wounds, leadership, oc, weaponsText, abilitiesText, group] = cols;
    return {
      id: W40K.uid(),
      name: name || "無名ユニット",
      models: Number(models) || 1,
      points: Number(points) || 0,
      keywords: keywords || "",
      notes: notes || "",
      group: group || "",
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
      weapons: parseWeapons(weaponsText || ""),
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
      stratagems: roster.stratagems.map((s) => ({ ...s, id: W40K.uid() })),
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
    if (!confirm("このストラタジムを削除しますか？")) return;
    roster.stratagems = roster.stratagems.filter((s) => s.id !== stratagemId);
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
                name: s.name || "無名ストラタジム",
                cost: Number(s.cost) || 0,
                phase: s.phase || "",
                text: s.text || "",
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
              ? u.abilities.map((a) => ({ id: W40K.uid(), name: a.name || "", text: a.text || "" }))
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

  const openDetachmentModal = () => {
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    document.getElementById("detachment-form-name").value = roster.detachment.name || "";
    document.getElementById("detachment-form-rule").value = roster.detachment.rule || "";
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

  const openStratagemModal = (stratagemId) => {
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    editingStratagemId = stratagemId || null;
    const strat = stratagemId ? roster.stratagems.find((s) => s.id === stratagemId) : null;
    document.getElementById("modal-stratagem-title").textContent = strat ? "ストラタジム編集" : "ストラタジム追加";
    document.getElementById("stratagem-form-name").value = strat?.name || "";
    document.getElementById("stratagem-form-cost").value = strat?.cost ?? 1;
    document.getElementById("stratagem-form-phase").value = strat?.phase || "";
    document.getElementById("stratagem-form-text").value = strat?.text || "";
    stratagemModal.showModal();
  };

  stratagemForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    const data = {
      name: document.getElementById("stratagem-form-name").value.trim() || "無名ストラタジム",
      cost: Number(document.getElementById("stratagem-form-cost").value) || 0,
      phase: document.getElementById("stratagem-form-phase").value.trim(),
      text: document.getElementById("stratagem-form-text").value.trim(),
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
    document.getElementById("unit-form-weapons").value = serializeWeapons(unit?.weapons);
    document.getElementById("unit-form-abilities").value = serializeAbilities(unit?.abilities);
    unitModal.showModal();
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
      weapons: parseWeapons(document.getElementById("unit-form-weapons").value),
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

    document.getElementById("units-csv-import-input").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) importUnitsCsv(file);
      e.target.value = "";
    });
    document.getElementById("btn-edit-detachment").addEventListener("click", () => openDetachmentModal());
    document.getElementById("btn-new-stratagem").addEventListener("click", () => openStratagemModal());

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
