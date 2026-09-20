// Rules quick-reference / memo notes, grouped by category and searchable.
(() => {
  const DEFAULT_CATEGORIES = [
    "指揮フェイズ",
    "移動フェイズ",
    "射撃フェイズ",
    "突撃フェイズ",
    "白兵フェイズ",
    "ミッション・得点",
    "その他",
  ];

  const state = {
    notes: W40K.load(W40K.KEYS.NOTES, []),
    editingId: null,
    search: "",
  };

  const persist = () => W40K.save(W40K.KEYS.NOTES, state.notes);

  const els = {};

  const cacheEls = () => {
    els.list = document.getElementById("rules-list");
    els.search = document.getElementById("rules-search");
    els.categorySelect = document.getElementById("note-form-category");
  };

  const escapeHtml = (str) =>
    String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const populateCategorySelect = () => {
    els.categorySelect.innerHTML = DEFAULT_CATEGORIES.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("");
  };

  const matchesSearch = (note) => {
    if (!state.search) return true;
    const q = state.search.toLowerCase();
    return (
      note.title.toLowerCase().includes(q) ||
      note.text.toLowerCase().includes(q) ||
      note.tags.toLowerCase().includes(q)
    );
  };

  const render = () => {
    els.list.innerHTML = "";
    const grouped = DEFAULT_CATEGORIES.map((cat) => ({
      category: cat,
      notes: state.notes.filter((n) => n.category === cat && matchesSearch(n)),
    })).filter((g) => g.notes.length > 0);

    if (grouped.length === 0) {
      els.list.innerHTML = '<p class="empty-state">該当するメモがありません。「＋ メモ追加」で登録しましょう。</p>';
      return;
    }

    grouped.forEach(({ category, notes }) => {
      const section = document.createElement("section");
      section.className = "rules-category";
      section.innerHTML = `<h3>${escapeHtml(category)}</h3>`;
      const grid = document.createElement("div");
      grid.className = "rules-grid";
      notes.forEach((note) => {
        const card = document.createElement("article");
        card.className = "rule-card";
        card.innerHTML = `
          <div class="rule-card-head">
            <h4>${escapeHtml(note.title)}</h4>
            <div class="unit-actions">
              <button class="btn btn-ghost btn-sm" data-edit-note="${note.id}">編集</button>
              <button class="btn btn-danger btn-sm" data-delete-note="${note.id}">削除</button>
            </div>
          </div>
          ${note.tags ? `<p class="rule-tags">${escapeHtml(note.tags).split(",").map((t) => `<span class="tag">${t.trim()}</span>`).join("")}</p>` : ""}
          <p class="rule-text">${escapeHtml(note.text)}</p>
        `;
        grid.appendChild(card);
      });
      section.appendChild(grid);
      els.list.appendChild(section);
    });

    els.list.querySelectorAll("[data-edit-note]").forEach((btn) => {
      btn.addEventListener("click", () => openNoteModal(btn.dataset.editNote));
    });
    els.list.querySelectorAll("[data-delete-note]").forEach((btn) => {
      btn.addEventListener("click", () => deleteNote(btn.dataset.deleteNote));
    });
  };

  const deleteNote = (id) => {
    if (!confirm("このメモを削除しますか？")) return;
    state.notes = state.notes.filter((n) => n.id !== id);
    persist();
    render();
  };

  const noteModal = document.getElementById("modal-note");
  const noteForm = document.getElementById("form-note");

  const openNoteModal = (id) => {
    state.editingId = id || null;
    const note = id ? state.notes.find((n) => n.id === id) : null;
    document.getElementById("modal-note-title").textContent = note ? "メモ編集" : "メモ追加";
    document.getElementById("note-form-category").value = note?.category || DEFAULT_CATEGORIES[0];
    document.getElementById("note-form-title").value = note?.title || "";
    document.getElementById("note-form-tags").value = note?.tags || "";
    document.getElementById("note-form-text").value = note?.text || "";
    noteModal.showModal();
  };

  noteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {
      category: document.getElementById("note-form-category").value,
      title: document.getElementById("note-form-title").value.trim() || "無題のメモ",
      tags: document.getElementById("note-form-tags").value.trim(),
      text: document.getElementById("note-form-text").value.trim(),
    };
    if (state.editingId) {
      const note = state.notes.find((n) => n.id === state.editingId);
      Object.assign(note, data);
    } else {
      state.notes.push({ id: W40K.uid(), ...data });
    }
    persist();
    render();
    noteModal.close();
  });

  const init = () => {
    cacheEls();
    populateCategorySelect();

    document.getElementById("btn-new-note").addEventListener("click", () => openNoteModal());
    els.search.addEventListener("input", (e) => {
      state.search = e.target.value.trim();
      render();
    });

    render();
  };

  W40K.Rules = { init };
})();
