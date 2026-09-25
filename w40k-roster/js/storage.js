// Shared namespace + localStorage helpers used by all other modules.
window.W40K = window.W40K || {};

W40K.KEYS = {
  ROSTERS: "w40k_rosters",
  GAME: "w40k_active_game",
  NOTES: "w40k_rules_notes",
  PHASE_CHECKLIST: "w40k_phase_checklist_template",
  WEAPON_LIBRARY: "w40k_weapon_library",
  KEYWORD_LIBRARY: "w40k_keyword_library",
  ABILITY_LIBRARY: "w40k_ability_library",
  UNIT_LIBRARY: "w40k_unit_library",
  DETACHMENT_LIBRARY: "w40k_detachment_library",
  CORE_STRATAGEM_LIBRARY: "w40k_core_stratagem_library",
};

W40K.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

W40K.load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Failed to read ${key} from localStorage`, err);
    return fallback;
  }
};

W40K.save = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to write ${key} to localStorage`, err);
  }
};

// Shared field-name maps for group buffs (roster.js parses/serializes them, tracker.js computes with them).
W40K.PROFILE_FIELD_MAP = { "移動": "move", "耐久": "toughness", "防御": "save", "特防": "invSave", "傷": "wounds", "統率": "leadership", "確保": "oc" };
W40K.PROFILE_FIELD_LABELS = Object.fromEntries(Object.entries(W40K.PROFILE_FIELD_MAP).map(([label, key]) => [key, label]));
W40K.WEAPON_FIELD_MAP = { "攻撃回数": "attacks", "技能": "skill", "攻撃力": "strength", "貫通": "ap", "ダメージ": "damage" };
W40K.WEAPON_FIELD_LABELS = Object.fromEntries(Object.entries(W40K.WEAPON_FIELD_MAP).map(([label, key]) => [key, label]));

// Converts full-width digits/plus/minus (e.g. "２", "－") to half-width ("2", "-"), since Japanese
// IME auto-conversion easily leaves these in a number field and Number("２") is NaN, not 2 - silently
// zeroing out any buff/stat delta typed that way. Safe to run on any short numeric-ish value string.
W40K.toHalfWidthDigits = (str) =>
  String(str ?? "")
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .replace(/＋/g, "+")
    .replace(/－/g, "-");

// Confirms with the user before saving bulk-text-parsed items that include entries which fell back
// to a default name - a likely sign a line didn't split into the expected columns (e.g. a stray
// comma, or a column short), rather than something the user actually meant to leave blank. Returns
// true if it's fine to proceed (no issues found, or the user confirmed anyway).
W40K.confirmBulkParseFallbacks = (items, fallbackName) => {
  const count = (items || []).filter((item) => item.name === fallbackName).length;
  if (count === 0) return true;
  return confirm(`${count}件の行が正しく読み取れず「${fallbackName}」になっています。列の区切り（カンマ）が正しいか確認してください。このまま保存しますか？`);
};

// Adds `delta` to the leading integer of a stat string (e.g. "6\"" -> "7\"", "3+" -> "2+"), keeping any suffix.
// Dice-notation stats (e.g. attacks characteristics written as "D6"/"2D6") have no leading integer to
// add to, so the delta is instead folded into a trailing "+N"/"-N" modifier (e.g. "D6" -> "D6+2",
// "D6+1" -> "D6+3", accumulating if one is already there; a net-zero modifier is dropped entirely).
W40K.applyStatDelta = (str, delta) => {
  const s = W40K.toHalfWidthDigits(str || "");
  const diceMatch = s.match(/^(\d*D\d+)([+-]\d+)?(.*)$/i);
  if (diceMatch) {
    const [, dice, existingMod, suffix] = diceMatch;
    const newMod = (existingMod ? Number(existingMod) : 0) + delta;
    return `${dice}${newMod === 0 ? "" : newMod > 0 ? `+${newMod}` : newMod}${suffix || ""}`;
  }
  const match = s.match(/^(-?\d+)(.*)$/);
  if (!match) return str;
  return `${Number(match[1]) + delta}${match[2] || ""}`;
};

// Shared weapon bulk-text format (used by unit weapon lists and the weapon armory).
// Each line: "種別(射撃/白兵), 武器名, 射程, 攻撃回数, 技能, 攻撃力, 貫通値, ダメージ[, アビリティ]"
W40K.parseWeapons = (text) =>
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
        range: W40K.toHalfWidthDigits(range || ""),
        attacks: W40K.toHalfWidthDigits(attacks || ""),
        skill: W40K.toHalfWidthDigits(skill || ""),
        strength: W40K.toHalfWidthDigits(strength || ""),
        ap: W40K.toHalfWidthDigits(ap || ""),
        damage: W40K.toHalfWidthDigits(damage || ""),
        abilities: abilities || "",
      };
    });

W40K.serializeWeapons = (weapons) =>
  (weapons || [])
    .map((w) => {
      const fields = [w.type === "melee" ? "白兵" : "射撃", w.name, w.range, w.attacks, w.skill, w.strength, w.ap, w.damage];
      if (w.abilities) fields.push(w.abilities);
      return fields.join(", ");
    })
    .join("\n");

// Shared ability bulk-text format (used by unit ability lists and the unit datasheet library).
// Each line: "[コア/陣営/デタッチメント] アビリティ名: 説明" (tag and description are both optional;
// no tag means a unit-specific ability).
W40K.ABILITY_CATEGORY_TAGS = { core: "コア", faction: "陣営", detachment: "デタッチメント" };

W40K.parseAbilities = (text) =>
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

W40K.serializeAbilities = (abilities) =>
  (abilities || [])
    .map((a) => {
      const prefix = W40K.ABILITY_CATEGORY_TAGS[a.category] ? `[${W40K.ABILITY_CATEGORY_TAGS[a.category]}] ` : "";
      return a.text ? `${prefix}${a.name}: ${a.text}` : `${prefix}${a.name}`;
    })
    .join("\n");

// Checks whether a unit qualifies for an enhancement's `restrict`/`exclude` keyword(s), matched by
// substring against the unit's name and keywords. No restrict means unrestricted (open to any CHARACTER).
W40K.unitMatchesRestriction = (unit, restrict, exclude) => {
  const haystack = `${unit.name || ""} ${unit.keywords || ""}`;
  if (exclude && haystack.includes(exclude)) return false;
  const candidates = Array.isArray(restrict) ? restrict : restrict ? [restrict] : [];
  if (candidates.length === 0) return true;
  return candidates.some((r) => haystack.includes(r));
};

// Applies a roster's always-on army buffs (matched by keyword / unit name / enhancement) to one unit,
// plus (in the tracker) the army-wide Doctrina Imperative currently active for the battle round.
// Shared by the roster screen (unit cards) and the battle tracker (unit rows) so both show identical numbers.
// Returns { profile, profileChanges, weapons (each carrying `_changed`), buffNotes }.
W40K.computeUnitBuffs = (roster, unit, options) => {
  const applicableBuffs = (roster.armyBuffs || []).filter((buff) => {
    if (buff.targetType === "unit") return unit.name === buff.targetValue;
    if (buff.targetType === "enhancement") return unit.enhancement && unit.enhancement.name === buff.targetValue;
    if (buff.targetType === "ability") return (unit.abilities || []).some((a) => (a.name || "").includes(buff.targetValue));
    return (unit.keywords || "").includes(buff.targetValue);
  });

  const profile = { ...unit.profile };
  const profileChanges = {};
  const buffNotes = [];
  const weapons = (unit.weapons || []).map((w) => ({ ...w, _changed: {}, _addedAbilities: [] }));

  const applyModifier = (label, m) => {
    if (m.kind === "note") {
      buffNotes.push(`${label}: ${m.value}`);
      return;
    }
    if (m.scope === "profile") {
      if (m.kind === "numeric") {
        const base = profile[m.field];
        const newVal = W40K.applyStatDelta(base, Number(m.value) || 0);
        if (newVal !== base) {
          profile[m.field] = newVal;
          profileChanges[m.field] = base;
        }
      } else if (m.kind === "keyword") {
        buffNotes.push(`${label}: [${m.value}]`);
      }
      return;
    }
    weapons.forEach((w) => {
      if (w.type !== m.scope) return;
      if (m.kind === "numeric") {
        const base = w[m.field];
        const newVal = W40K.applyStatDelta(base, Number(m.value) || 0);
        if (newVal !== base) {
          w._changed[m.field] = base;
          w[m.field] = newVal;
        }
      } else if (m.kind === "keyword") {
        // Kept separate from the weapon's own (typed-in) abilities so the UI can show buff-added
        // keywords like [ヘヴィ]/[アサルト] in a different color instead of blending into the base text.
        w._addedAbilities.push(m.value);
      }
    });
  };

  applicableBuffs.forEach((buff) => buff.modifiers.forEach((m) => applyModifier(buff.name, m)));

  // 合流バフ (group buffs): options scoped to units sharing a `group` (e.g. a Datasmith's squad),
  // each with its own per-modifier targetUnit. An always-on option always applies; any other option
  // only applies once selected for that group in the tracker (options.groupBuffSelections), so this
  // naturally does nothing extra on the roster screen (which calls computeUnitBuffs with no options).
  if (unit.group) {
    (roster.groupBuffs || [])
      .filter((opt) => opt.group === unit.group)
      .filter((opt) => opt.alwaysOn || (options && options.groupBuffSelections && options.groupBuffSelections[opt.group] === opt.id))
      .forEach((opt) => opt.modifiers.filter((m) => m.targetUnit === unit.name).forEach((m) => applyModifier(opt.name, m)));
  }

  // 命令教条 (Doctrina Imperatives): an army rule, chosen per battle round, active for every unit in a
  // roster that has this army rule set (roster.armyRule) - not something that needs tagging per unit.
  // Improving a Skill characteristic means a *lower* number, hence delta -1. Both imperatives also carry a
  // conditional effect (active only for BATTLELINE units, or units within 6" of a friendly AdMech BATTLELINE
  // unit) that the app has no positional data to check automatically; that part is recorded as a text note
  // only, for the player to apply by hand.
  const doctrinaImperative = options && options.doctrinaImperative;
  if (doctrinaImperative && roster.armyRule === "doctrina_imperatives") {
    if (doctrinaImperative === "protector") {
      applyModifier("迎撃命令", { kind: "numeric", scope: "ranged", field: "skill", value: -1 });
      applyModifier("迎撃命令", { kind: "keyword", scope: "ranged", value: "ヘヴィ" });
      buffNotes.push("迎撃命令: 射撃武器の技能+1、[ヘヴィ]を得る");
      buffNotes.push("迎撃命令(条件付き・要手動反映): バトルラインか、自軍バトルライン6\"以内なら、被白兵ヒット-1");
    } else if (doctrinaImperative === "conqueror") {
      applyModifier("征服命令", { kind: "numeric", scope: "melee", field: "skill", value: -1 });
      applyModifier("征服命令", { kind: "keyword", scope: "ranged", value: "アサルト" });
      buffNotes.push("征服命令: 白兵武器の技能+1、射撃武器に[アサルト]を得る");
      // The conditional AP+1 bonus applies whenever the unit is itself BATTLELINE, no positional data
      // needed - so auto-apply it in that case instead of leaving it as a manual reminder. The "within
      // 6\" of a friendly BATTLELINE unit" half of the condition still has no positional data to check,
      // so that case (a non-BATTLELINE unit) still falls back to a text-only reminder.
      if ((unit.keywords || "").includes("バトルライン")) {
        applyModifier("征服命令(バトルライン)", { kind: "numeric", scope: "melee", field: "ap", value: -1 });
        buffNotes.push("征服命令(バトルライン自動適用): 白兵武器の貫通値+1");
      } else {
        buffNotes.push("征服命令(条件付き・要手動反映): 自軍バトルライン6\"以内なら、攻撃の貫通値+1");
      }
    }

    // エラディケーション・コホートの「殺戮命令」: どちらの命令教条が有効かに応じて友軍スキタリの
    // 命中/ウーンドロールの1がリロール可になる。これも命令教条のラウンド選択に連動する効果なので、
    // ruleModifiers（キーワード一致のみで判定する仕組み）ではなくここで一緒に扱う。
    if (roster.detachment && roster.detachment.name === "エラディケーション・コホート" && (unit.keywords || "").includes("スキタリ")) {
      if (doctrinaImperative === "protector") {
        buffNotes.push("殺戮命令: 攻撃の命中ロールの1をリロール可");
      } else if (doctrinaImperative === "conqueror") {
        buffNotes.push("殺戮命令: 攻撃のウーンドロールの1をリロール可");
      }
    }
  }

  // Detachment-wide rule: some detachment rules are simple flat stat buffs for any unit matching a
  // keyword (e.g. コホート・サイバネティカ's "レギオ・サイバネティカ units get +2 move"); auto-apply
  // those instead of requiring the user to recreate them by hand as an army buff. Most detachment
  // rules are situational and have no `ruleModifiers`, so they stay text-only (shown at the roster
  // header). `requiresNotBattleShock` modifiers only apply outside the tracker's battle-shock state.
  if (roster.detachment && roster.detachment.name) {
    const detachment = W40K.Detachments.getByName(roster.detachment.name);
    if (detachment && (detachment.ruleModifiers || []).length && (unit.keywords || "").includes(detachment.ruleRestrict || "")) {
      const battleShocked = !!(options && options.battleShock);
      detachment.ruleModifiers.forEach((m) => {
        if (m.requiresNotBattleShock && battleShocked) return;
        applyModifier(detachment.name, m);
      });
    }
  }

  // Enhancement equipped on this unit: show its effect text, and apply its modifiers (only a
  // handful of simple flat stat/weapon buffs have them; most enhancements are situational and are
  // shown as text only) if it's found in the roster's current detachment master data.
  if (unit.enhancement && unit.enhancement.name && roster.detachment && roster.detachment.name) {
    const detachment = W40K.Detachments.getByName(roster.detachment.name);
    const masterEnh = detachment ? detachment.enhancements.find((e) => e.name === unit.enhancement.name) : null;
    if (masterEnh) {
      (masterEnh.modifiers || []).forEach((m) => applyModifier(masterEnh.name, m));
      if (masterEnh.text) buffNotes.push(`${masterEnh.name}: ${masterEnh.text}`);
    }
  }

  return { profile, profileChanges, weapons, buffNotes };
};
