// Shared namespace + localStorage helpers used by all other modules.
window.W40K = window.W40K || {};

W40K.KEYS = {
  ROSTERS: "w40k_rosters",
  GAME: "w40k_active_game",
  NOTES: "w40k_rules_notes",
  PHASE_CHECKLIST: "w40k_phase_checklist_template",
  WEAPON_LIBRARY: "w40k_weapon_library",
  KEYWORD_LIBRARY: "w40k_keyword_library",
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

// Adds `delta` to the leading integer of a stat string (e.g. "6\"" -> "7\"", "3+" -> "2+"), keeping any suffix.
W40K.applyStatDelta = (str, delta) => {
  const match = String(str || "").match(/^(-?\d+)(.*)$/);
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
        range: range || "",
        attacks: attacks || "",
        skill: skill || "",
        strength: strength || "",
        ap: ap || "",
        damage: damage || "",
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

// Applies a roster's always-on army buffs (matched by keyword / unit name / enhancement) to one unit.
// Shared by the roster screen (unit cards) and the battle tracker (unit rows) so both show identical numbers.
// Returns { profile, profileChanges, weapons (each carrying `_changed`), buffNotes }.
W40K.computeUnitBuffs = (roster, unit) => {
  const applicableBuffs = (roster.armyBuffs || []).filter((buff) => {
    if (buff.targetType === "unit") return unit.name === buff.targetValue;
    if (buff.targetType === "enhancement") return unit.enhancement && unit.enhancement.name === buff.targetValue;
    return (unit.keywords || "").includes(buff.targetValue);
  });

  const profile = { ...unit.profile };
  const profileChanges = {};
  const buffNotes = [];
  const weapons = (unit.weapons || []).map((w) => ({ ...w, _changed: {} }));

  applicableBuffs.forEach((buff) => {
    buff.modifiers.forEach((m) => {
      if (m.kind === "note") {
        buffNotes.push(`${buff.name}: ${m.value}`);
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
          buffNotes.push(`${buff.name}: [${m.value}]`);
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
          w.abilities = [w.abilities, m.value].filter(Boolean).join("、");
        }
      });
    });
  });

  return { profile, profileChanges, weapons, buffNotes };
};
