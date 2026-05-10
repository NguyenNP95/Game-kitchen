(function () {
  "use strict";

  const KEY_SETTINGS = "mkitchen_settings_v1";
const KEY_SCORES = "mkitchen_scores_v1";

/** @typedef {{
 *  languagePref: 'auto'|'vi'|'en',
 *  difficulty: 'easy'|'normal'|'hard',
 *  winMode: 'score'|'time',
 *  targetScore: number,
 *  targetMinutes: number,
 *  sound: boolean,
 *  reduceMotion: boolean
 * }} AppSettings */

const defaultSettings = () => ({
  languagePref: "auto",
  difficulty: "normal",
  winMode: "score",
  targetScore: 25,        // net saved target (saved − wasted)
  targetMinutes: 3,
  sound: true,
  reduceMotion: false,
});

/** @returns {AppSettings} */
function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    if (!raw) return defaultSettings();
    const o = JSON.parse(raw);
    const merged = { ...defaultSettings(), ...o };
    // Migration: scoring switched from "points" (100-99999) to "net saved" (5-200).
    // Anything above 200 is from the old system — reset to the new default.
    if (typeof merged.targetScore !== "number" || merged.targetScore > 200) {
      merged.targetScore = 25;
    }
    return merged;
  } catch {
    return defaultSettings();
  }
}

/** @param {Partial<AppSettings>} patch */
function saveSettings(patch) {
  const next = { ...loadSettings(), ...patch };
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(next));
  return next;
}

/** @typedef {{ score: number, at: number, difficulty: string, winMode: string }} ScoreRow */

/** @returns {ScoreRow[]} */
function loadHighScores() {
  try {
    const raw = localStorage.getItem(KEY_SCORES);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

/** @param {ScoreRow} row */
function pushHighScore(row) {
  const list = [...loadHighScores(), row]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  localStorage.setItem(KEY_SCORES, JSON.stringify(list));
  return list;
}

window.MKitchen = window.MKitchen || {};
window.MKitchen.storage = {
  loadSettings,
  saveSettings,
  loadHighScores,
  pushHighScore,
};
})();
