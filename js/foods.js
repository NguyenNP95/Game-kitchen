(function () {
  "use strict";

  /** @typedef {{ id: string, emoji: string, zone: 'fridge'|'jar', nameKey: string, spoilBaseMs: number }} FoodDef */

/** @type {FoodDef[]} */
const FOOD_CATALOG = [
  { id: "peanuts", emoji: "🥜", zone: "jar", nameKey: "fn_peanuts", spoilBaseMs: 28000 },
  { id: "cashews", emoji: "🌰", zone: "jar", nameKey: "fn_cashews", spoilBaseMs: 26000 },
  { id: "blackBeans", emoji: "🫘", zone: "jar", nameKey: "fn_blackBeans", spoilBaseMs: 32000 },
  { id: "mung", emoji: "🟢", zone: "jar", nameKey: "fn_mung", spoilBaseMs: 30000 },
  { id: "noodles", emoji: "🍜", zone: "jar", nameKey: "fn_noodles", spoilBaseMs: 24000 },
  { id: "rice", emoji: "🍚", zone: "jar", nameKey: "fn_rice", spoilBaseMs: 35000 },
  { id: "banhChung", emoji: "🍙", zone: "fridge", nameKey: "fn_banhChung", spoilBaseMs: 22000 },
  { id: "comTam", emoji: "🍛", zone: "fridge", nameKey: "fn_comTam", spoilBaseMs: 20000 },
  { id: "pho", emoji: "🥣", zone: "fridge", nameKey: "fn_pho", spoilBaseMs: 18000 },
  { id: "springRolls", emoji: "🥟", zone: "fridge", nameKey: "fn_springRolls", spoilBaseMs: 19000 },
  { id: "stew", emoji: "🍲", zone: "fridge", nameKey: "fn_stew", spoilBaseMs: 21000 },
  { id: "braisedEggs", emoji: "🥚", zone: "fridge", nameKey: "fn_braisedEggs", spoilBaseMs: 23000 },
  { id: "papayaSalad", emoji: "🥗", zone: "fridge", nameKey: "fn_papayaSalad", spoilBaseMs: 16000 },
  { id: "banhMi", emoji: "🥖", zone: "fridge", nameKey: "fn_banhMi", spoilBaseMs: 17000 },
  { id: "sweetSoup", emoji: "🍨", zone: "fridge", nameKey: "fn_sweetSoup", spoilBaseMs: 15000 },
];

/** @param {'easy'|'normal'|'hard'} d */
function diffMult(d) {
  if (d === "easy") return 0.65;
  if (d === "hard") return 1.45;
  return 1;
}

/** @param {'easy'|'normal'|'hard'} d */
function humidityRamp(d) {
  if (d === "easy") return 1.35;
  if (d === "hard") return 2.85;
  return 2.05;
}

window.MKitchen = window.MKitchen || {};
window.MKitchen.foods = { FOOD_CATALOG, diffMult, humidityRamp };
})();
