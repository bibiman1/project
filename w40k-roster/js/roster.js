// Roster management: create/edit/delete rosters and their units.
(() => {
  const state = {
    rosters: W40K.load(W40K.KEYS.ROSTERS, []),
    selectedRosterId: null,
    editingUnitId: null,
  };

  const persist = () => W40K.save(W40K.KEYS.ROSTERS, state.rosters);

  const getById = (id) => state.rosters.find((r) => r.id === id);

  const totalPoints = (roster) => roster.units.reduce((sum, u) => sum + u.points * u.models, 0);

  // ---- rendering ----

  const els = {};

  const cacheEls = () => {
    els.list = document.getElementById("roster-list");
    els.detailEmpty = document.getElementById("roster-detail-empty");
    els.detail = document.getElementById("roster-detail");
    els.detailName = document.getElementById("roster-detail-name");
    els.detailMeta = document.getElementById("roster-detail-meta");
    els.unitList = document.getElementById("unit-list");
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

    els.unitList.innerHTML = "";
    if (roster.units.length === 0) {
      els.unitList.innerHTML = '<p class="empty-state">ユニットが未登録です。</p>';
      return;
    }
    roster.units.forEach((unit) => {
      const row = document.createElement("article");
      row.className = "unit-card";
      row.innerHTML = `
        <div class="unit-main">
          <h4>${escapeHtml(unit.name)} <span class="unit-models">×${unit.models}</span></h4>
          <p class="meta-line">${escapeHtml(unit.keywords || "")}</p>
          ${unit.notes ? `<p class="unit-notes">${escapeHtml(unit.notes)}</p>` : ""}
        </div>
        <div class="unit-side">
          <span class="unit-points">${unit.points * unit.models} pts</span>
          <div class="unit-actions">
            <button class="btn btn-ghost btn-sm" data-edit-unit="${unit.id}">編集</button>
            <button class="btn btn-danger btn-sm" data-delete-unit="${unit.id}">削除</button>
          </div>
        </div>
      `;
      els.unitList.appendChild(row);
    });

    els.unitList.querySelectorAll("[data-edit-unit]").forEach((btn) => {
      btn.addEventListener("click", () => openUnitModal(btn.dataset.editUnit));
    });
    els.unitList.querySelectorAll("[data-delete-unit]").forEach((btn) => {
      btn.addEventListener("click", () => deleteUnit(btn.dataset.deleteUnit));
    });
  };

  const render = () => {
    renderList();
    renderDetail();
    document.dispatchEvent(new CustomEvent("w40k:rosters-changed"));
  };

  const escapeHtml = (str) =>
    String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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
      units: roster.units.map((u) => ({ ...u, id: W40K.uid() })),
    };
    state.rosters.push(copy);
    state.selectedRosterId = copy.id;
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
          units: data.units.map((u) => ({
            id: W40K.uid(),
            name: u.name || "無名ユニット",
            models: Number(u.models) || 1,
            points: Number(u.points) || 0,
            keywords: u.keywords || "",
            notes: u.notes || "",
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
      const roster = { id: W40K.uid(), name, faction, pointsLimit, units: [] };
      state.rosters.push(roster);
      state.selectedRosterId = roster.id;
    }
    persist();
    render();
    rosterModal.close();
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
    unitModal.showModal();
  };

  unitForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const roster = getById(state.selectedRosterId);
    if (!roster) return;
    const data = {
      name: document.getElementById("unit-form-name").value.trim() || "無名ユニット",
      models: Number(document.getElementById("unit-form-models").value) || 1,
      points: Number(document.getElementById("unit-form-points").value) || 0,
      keywords: document.getElementById("unit-form-keywords").value.trim(),
      notes: document.getElementById("unit-form-notes").value.trim(),
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

  // ---- init ----

  const init = () => {
    cacheEls();

    document.getElementById("btn-new-roster").addEventListener("click", () => openRosterModal());
    document.getElementById("btn-edit-roster").addEventListener("click", () => openRosterModal(state.selectedRosterId));
    document.getElementById("btn-duplicate-roster").addEventListener("click", () => duplicateRoster(state.selectedRosterId));
    document.getElementById("btn-delete-roster").addEventListener("click", () => deleteRoster(state.selectedRosterId));
    document.getElementById("btn-export-roster").addEventListener("click", () => exportRoster(state.selectedRosterId));
    document.getElementById("btn-new-unit").addEventListener("click", () => openUnitModal());

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
