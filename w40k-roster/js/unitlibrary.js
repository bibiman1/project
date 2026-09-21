// Unit datasheet library: reusable full unit templates (profile/weapons/abilities/keywords), picked
// from when adding a unit to a roster instead of typing every field by hand from the codex each time.
// When a balance dataslate changes a unit's points/stats, fix it once here via "ユニットマスタ編集" -
// units already added to a roster are independent copies (same behavior as the weapon armory/ability
// library) and aren't retroactively changed.
(() => {
  let library = W40K.load(W40K.KEYS.UNIT_LIBRARY, null);
  if (!library) {
    library = [];
    W40K.save(W40K.KEYS.UNIT_LIBRARY, library);
  }

  const persist = () => W40K.save(W40K.KEYS.UNIT_LIBRARY, library);

  // Each line: "ユニット名, モデル数, ポイント, キーワード1/キーワード2/..., 移動, 耐久, 防御, 特防, 傷, 統率, 確保"
  // Keywords are "/"-separated (not comma) within their own column, since a unit normally has several
  // keywords and commas are already the column separator for this line - same convention the
  // detachment master editor uses for an enhancement's "A/B" restrict column.
  const parseBasics = (text) =>
    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, models, points, keywords, move, toughness, save, invSave, wounds, leadership, oc] = line.split(/\t|,/).map((p) => p.trim());
        return {
          name: name || "無名ユニット",
          models: Number(W40K.toHalfWidthDigits(models)) || 1,
          points: Number(W40K.toHalfWidthDigits(points)) || 0,
          keywords: (keywords || "").split("/").map((k) => k.trim()).filter(Boolean).join(", "),
          profile: {
            move: W40K.toHalfWidthDigits(move || ""),
            toughness: W40K.toHalfWidthDigits(toughness || ""),
            save: W40K.toHalfWidthDigits(save || ""),
            invSave: W40K.toHalfWidthDigits(invSave || ""),
            wounds: W40K.toHalfWidthDigits(wounds || ""),
            leadership: W40K.toHalfWidthDigits(leadership || ""),
            oc: W40K.toHalfWidthDigits(oc || ""),
          },
        };
      });

  const serializeBasics = (list) =>
    (list || [])
      .map((u) => {
        const keywordsField = (u.keywords || "").split(",").map((k) => k.trim()).filter(Boolean).join("/");
        return [u.name, u.models, u.points, keywordsField, u.profile.move, u.profile.toughness, u.profile.save, u.profile.invSave, u.profile.wounds, u.profile.leadership, u.profile.oc].join(
          ", "
        );
      })
      .join("\n");

  // Groups bulk-text lines by their leading "ユニット名, " column, then hands each unit's remaining
  // lines to the shared parser (W40K.parseWeapons / W40K.parseAbilities) as one block.
  const groupLinesByUnit = (text) => {
    const byUnit = {};
    text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const commaIdx = line.indexOf(",");
        if (commaIdx < 0) return;
        const unitName = line.slice(0, commaIdx).trim();
        const rest = line.slice(commaIdx + 1).trim();
        (byUnit[unitName] = byUnit[unitName] || []).push(rest);
      });
    return byUnit;
  };

  // Each line: "ユニット名, 種別(射撃/白兵), 武器名, 射程, 攻撃回数, 技能, 攻撃力, 貫通値, ダメージ[, アビリティ]"
  const parseWeaponsByUnit = (text) => {
    const byUnit = groupLinesByUnit(text);
    return Object.fromEntries(Object.entries(byUnit).map(([name, lines]) => [name, W40K.parseWeapons(lines.join("\n"))]));
  };

  const serializeWeaponRows = (list) =>
    (list || []).flatMap((u) => (u.weapons || []).map((w) => `${u.name}, ${W40K.serializeWeapons([w])}`)).join("\n");

  // Each line: "ユニット名, [コア/陣営/デタッチメント] アビリティ名: 説明"
  const parseAbilitiesByUnit = (text) => {
    const byUnit = groupLinesByUnit(text);
    return Object.fromEntries(Object.entries(byUnit).map(([name, lines]) => [name, W40K.parseAbilities(lines.join("\n"))]));
  };

  const serializeAbilityRows = (list) =>
    (list || []).flatMap((u) => (u.abilities || []).map((a) => `${u.name}, ${W40K.serializeAbilities([a])}`)).join("\n");

  const rebuildFromEditedText = (basicsText, weaponsText, abilitiesText) => {
    const basics = parseBasics(basicsText);
    const weaponsByUnit = parseWeaponsByUnit(weaponsText);
    const abilitiesByUnit = parseAbilitiesByUnit(abilitiesText);

    if (!W40K.confirmBulkParseFallbacks(basics, "無名ユニット")) return false;
    const allWeapons = basics.flatMap((b) => weaponsByUnit[b.name] || []);
    if (!W40K.confirmBulkParseFallbacks(allWeapons, "無名武器")) return false;

    library = basics.map((b) => ({
      id: W40K.uid(),
      name: b.name,
      models: b.models,
      points: b.points,
      keywords: b.keywords,
      profile: b.profile,
      weapons: (weaponsByUnit[b.name] || []).map((w) => ({ ...w, id: W40K.uid() })),
      abilities: (abilitiesByUnit[b.name] || []).map((a) => ({ ...a, id: W40K.uid() })),
    }));
    persist();
    return true;
  };

  const openEditModal = () => {
    document.getElementById("unitlibrary-basics-input").value = serializeBasics(library);
    document.getElementById("unitlibrary-weapons-input").value = serializeWeaponRows(library);
    document.getElementById("unitlibrary-abilities-input").value = serializeAbilityRows(library);
    document.getElementById("modal-unitlibrary").showModal();
  };

  // While the library is empty, load the bundled seed of official 11th-edition Adeptus Mechanicus
  // datasheets (if unitlibrary-seed.js is present). Once it holds anything, this never runs again -
  // "ユニットマスタ編集" is the one place the library gets changed from here on.
  const loadSeedIfEmpty = () => {
    if (library.length > 0 || !W40K.UNIT_LIBRARY_SEED) return;
    rebuildFromEditedText(W40K.UNIT_LIBRARY_SEED.basics, W40K.UNIT_LIBRARY_SEED.weapons, W40K.UNIT_LIBRARY_SEED.abilities);
  };

  const init = () => {
    loadSeedIfEmpty();
    document.getElementById("btn-edit-unitlibrary").addEventListener("click", () => openEditModal());
    document.getElementById("form-unitlibrary").addEventListener("submit", (e) => {
      e.preventDefault();
      const saved = rebuildFromEditedText(
        document.getElementById("unitlibrary-basics-input").value,
        document.getElementById("unitlibrary-weapons-input").value,
        document.getElementById("unitlibrary-abilities-input").value
      );
      if (!saved) return;
      document.getElementById("modal-unitlibrary").close();
      document.dispatchEvent(new CustomEvent("w40k:unitlibrary-changed"));
    });
  };

  const replaceAll = (newLibrary) => {
    library = Array.isArray(newLibrary) ? newLibrary : [];
    persist();
    document.dispatchEvent(new CustomEvent("w40k:unitlibrary-changed"));
  };

  // Explicit, user-triggered overwrite (unlike loadSeedIfEmpty, this replaces whatever is there now).
  const resetToSeed = () => {
    if (!W40K.UNIT_LIBRARY_SEED) return false;
    return rebuildFromEditedText(W40K.UNIT_LIBRARY_SEED.basics, W40K.UNIT_LIBRARY_SEED.weapons, W40K.UNIT_LIBRARY_SEED.abilities);
  };

  W40K.UnitLibrary = { init, getAll: () => library, replaceAll, resetToSeed };
})();
