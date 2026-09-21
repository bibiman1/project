// Ability library: reusable ability lines (e.g. 命令教条), picked from when editing a unit
// instead of typing the full "[category] name: text" line by hand each time.
(() => {
  const SEED = ["[陣営] 命令教条: 選択した命令に応じたアビリティを得る"];

  let library = W40K.load(W40K.KEYS.ABILITY_LIBRARY, null);

  // First run: seed from the built-in list plus abilities already typed into any existing roster's
  // units, so this feature doesn't force re-entering everything from scratch.
  if (!library) {
    const rosters = W40K.load(W40K.KEYS.ROSTERS, []);
    const seen = new Set();
    library = [];
    const addLine = (line) => {
      if (!line || seen.has(line)) return;
      seen.add(line);
      library.push(line);
    };
    SEED.forEach(addLine);
    const CATEGORY_TAGS = { core: "コア", faction: "陣営", detachment: "デタッチメント" };
    rosters.forEach((roster) => {
      (roster.units || []).forEach((unit) => {
        (unit.abilities || []).forEach((a) => {
          const prefix = CATEGORY_TAGS[a.category] ? `[${CATEGORY_TAGS[a.category]}] ` : "";
          addLine(a.text ? `${prefix}${a.name}: ${a.text}` : `${prefix}${a.name}`);
        });
      });
    });
    W40K.save(W40K.KEYS.ABILITY_LIBRARY, library);
  }

  const persist = () => W40K.save(W40K.KEYS.ABILITY_LIBRARY, library);

  const addAbility = (line) => {
    const l = line.trim();
    if (!l || library.includes(l)) return;
    library.push(l);
    persist();
  };

  const init = () => {
    document.getElementById("btn-edit-ability-library").addEventListener("click", () => {
      document.getElementById("ability-library-input").value = library.join("\n");
      document.getElementById("modal-ability-library").showModal();
    });
    document.getElementById("form-ability-library").addEventListener("submit", (e) => {
      e.preventDefault();
      library = document
        .getElementById("ability-library-input")
        .value.split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
      persist();
      document.getElementById("modal-ability-library").close();
      document.dispatchEvent(new CustomEvent("w40k:abilities-changed"));
    });
  };

  const replaceAll = (newLibrary) => {
    library = Array.isArray(newLibrary) ? newLibrary : [];
    persist();
    document.dispatchEvent(new CustomEvent("w40k:abilities-changed"));
  };

  W40K.Abilities = { init, getAll: () => library, addAbility, replaceAll };
})();
