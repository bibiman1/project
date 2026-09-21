// Shared namespace + localStorage helpers used by all other modules.
window.W40K = window.W40K || {};

W40K.KEYS = {
  ROSTERS: "w40k_rosters",
  GAME: "w40k_active_game",
  NOTES: "w40k_rules_notes",
  PHASE_CHECKLIST: "w40k_phase_checklist_template",
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
