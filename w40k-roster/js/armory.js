// Weapon armory: a reusable library of weapon profiles, picked from when editing a unit.
(() => {
  let library = W40K.load(W40K.KEYS.WEAPON_LIBRARY, null);

  // First run: seed the library from weapons already typed into any existing roster's units,
  // so this feature doesn't force re-entering everything from scratch.
  if (!library) {
    const rosters = W40K.load(W40K.KEYS.ROSTERS, []);
    const seen = new Set();
    library = [];
    rosters.forEach((roster) => {
      (roster.units || []).forEach((unit) => {
        (unit.weapons || []).forEach((w) => {
          const key = `${w.type}\u0000${w.name}`;
          if (seen.has(key)) return;
          seen.add(key);
          library.push({
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
          });
        });
      });
    });
    W40K.save(W40K.KEYS.WEAPON_LIBRARY, library);
  }

  // Still empty after the roster-seed pass above (no roster units existed to seed from either):
  // fall back to the bundled 11th-edition Adeptus Mechanicus weapon seed, if armory-seed.js is present.
  if (library.length === 0 && W40K.ARMORY_SEED) {
    library = W40K.parseWeapons(W40K.ARMORY_SEED);
    W40K.save(W40K.KEYS.WEAPON_LIBRARY, library);
  }

  const persist = () => W40K.save(W40K.KEYS.WEAPON_LIBRARY, library);

  const escapeHtml = (str) =>
    String(str ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const els = {};

  const render = () => {
    els.list.innerHTML = "";
    if (library.length === 0) {
      els.list.innerHTML = '<p class="empty-state">武器庫が空です。「編集」から登録してください。</p>';
    } else {
      els.list.innerHTML = `
        <table class="weapon-table">
          <thead><tr><th>武器</th><th>射程</th><th>攻</th><th>技</th><th>攻撃力</th><th>貫通</th><th>ダメ</th></tr></thead>
          <tbody>
            ${library
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
        </table>`;
    }
    document.dispatchEvent(new CustomEvent("w40k:armory-changed"));
  };

  const armoryModal = document.getElementById("modal-armory");
  const armoryForm = document.getElementById("form-armory");

  const openArmoryModal = () => {
    document.getElementById("armory-input").value = W40K.serializeWeapons(library);
    armoryModal.showModal();
  };

  armoryForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const parsed = W40K.parseWeapons(document.getElementById("armory-input").value);
    if (!W40K.confirmBulkParseFallbacks(parsed, "無名武器")) return;
    library = parsed;
    persist();
    render();
    armoryModal.close();
  });

  const init = () => {
    els.list = document.getElementById("armory-list");
    document.getElementById("btn-edit-armory").addEventListener("click", () => openArmoryModal());
    render();
  };

  const replaceAll = (newLibrary) => {
    library = Array.isArray(newLibrary) ? newLibrary : [];
    persist();
    render();
  };

  W40K.Armory = { init, getAll: () => library, replaceAll };
})();
