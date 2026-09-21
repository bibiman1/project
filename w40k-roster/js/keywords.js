// Keyword library: a reusable list of keyword tags, picked from when editing a unit
// instead of typing comma-separated keywords by hand each time.
(() => {
  let library = W40K.load(W40K.KEYS.KEYWORD_LIBRARY, null);

  // First run: seed the library from keywords already typed into any existing roster's units,
  // so this feature doesn't force re-entering everything from scratch.
  if (!library) {
    const rosters = W40K.load(W40K.KEYS.ROSTERS, []);
    const seen = new Set();
    library = [];
    rosters.forEach((roster) => {
      (roster.units || []).forEach((unit) => {
        (unit.keywords || "")
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean)
          .forEach((k) => {
            if (seen.has(k)) return;
            seen.add(k);
            library.push(k);
          });
      });
    });
    W40K.save(W40K.KEYS.KEYWORD_LIBRARY, library);
  }

  // Still empty after the roster-seed pass above: fall back to the bundled 11th-edition Adeptus
  // Mechanicus keyword seed, if keywords-seed.js is present.
  if (library.length === 0 && W40K.KEYWORD_LIBRARY_SEED) {
    library = W40K.KEYWORD_LIBRARY_SEED.split("\n")
      .map((k) => k.trim())
      .filter(Boolean);
    W40K.save(W40K.KEYS.KEYWORD_LIBRARY, library);
  }

  const persist = () => W40K.save(W40K.KEYS.KEYWORD_LIBRARY, library);

  const addKeyword = (keyword) => {
    const k = keyword.trim();
    if (!k || library.includes(k)) return;
    library.push(k);
    persist();
  };

  const init = () => {
    document.getElementById("btn-edit-keywords").addEventListener("click", () => {
      document.getElementById("keywords-input").value = library.join("\n");
      document.getElementById("modal-keywords").showModal();
    });
    document.getElementById("form-keywords").addEventListener("submit", (e) => {
      e.preventDefault();
      library = document
        .getElementById("keywords-input")
        .value.split("\n")
        .map((k) => k.trim())
        .filter(Boolean);
      persist();
      document.getElementById("modal-keywords").close();
      document.dispatchEvent(new CustomEvent("w40k:keywords-changed"));
    });
  };

  const replaceAll = (newLibrary) => {
    library = Array.isArray(newLibrary) ? newLibrary : [];
    persist();
    document.dispatchEvent(new CustomEvent("w40k:keywords-changed"));
  };

  // Explicit, user-triggered overwrite (unlike the first-run seed above, this replaces whatever is there now).
  const resetToSeed = () => {
    if (!W40K.KEYWORD_LIBRARY_SEED) return false;
    library = W40K.KEYWORD_LIBRARY_SEED.split("\n")
      .map((k) => k.trim())
      .filter(Boolean);
    persist();
    document.dispatchEvent(new CustomEvent("w40k:keywords-changed"));
    return true;
  };

  W40K.Keywords = { init, getAll: () => library, addKeyword, replaceAll, resetToSeed };
})();
