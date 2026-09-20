// Shared namespace + localStorage helpers used by all other modules.
window.W40K = window.W40K || {};

W40K.KEYS = {
  ROSTERS: "w40k_rosters",
  GAME: "w40k_active_game",
  NOTES: "w40k_rules_notes",
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
