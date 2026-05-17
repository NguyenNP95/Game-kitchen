(function () {
  "use strict";

  /**
   * Time mapping: 1 in-game hour = 7500 ms real time at normal difficulty.
   * The "4-hour room-temp rule" therefore means a generic item lasts ~30s on the counter.
   * Each group has its own room-temp shelf life (in game-hours):
   *   meat       → 2h  (very perishable: chicken, beef, fish, pork, shrimp)
   *   dairy      → 3h  (milk, eggs, butter, cheese)
   *   produce    → 4h  (fresh fruits & veggies)
   *   grain      → 8h  (rice, peanuts, cashews, dry noodles, beans)
   *   canned     → 12h closed / 2h opened
   */
  const MS_PER_GAME_HOUR = 7500;

  const GROUP_HOURS = {
    meat: 2,
    dairy: 3,
    produce: 4,
    grain: 8,
  };

  /** Each group's primary storage zone. */
  const GROUP_ZONE = {
    meat: "fridge",
    dairy: "jar",
    produce: "jar",
    grain: "jar",
  };

  /**
   * @typedef {Object} FoodDef
   * @property {string} id
   * @property {string} emoji
   * @property {'meat'|'dairy'|'produce'|'grain'} group
   * @property {'fridge'|'jar'} zone
   * @property {string} nameKey
   * @property {number} hours                     room-temp shelf life in game-hours
   */

  /** @type {FoodDef[]} */
  const FOOD_CATALOG = [
    // Thịt tươi — Tủ lạnh (2h)
    { id: "pork",          emoji: "🍖", group: "meat",    zone: "fridge", nameKey: "fn_pork",          hours: GROUP_HOURS.meat },
    { id: "beef",          emoji: "🥩", group: "meat",    zone: "fridge", nameKey: "fn_beef",          hours: GROUP_HOURS.meat },
    { id: "chicken",       emoji: "🍗", group: "meat",    zone: "fridge", nameKey: "fn_chicken",       hours: GROUP_HOURS.meat },
    { id: "snakeheadFish", emoji: "🐟", group: "meat",    zone: "fridge", nameKey: "fn_snakeheadFish", hours: GROUP_HOURS.meat },

    // Rau củ quả — Tủ đồ khô (4h)
    { id: "sweetCabbage",  emoji: "🥬", group: "produce", zone: "jar",    nameKey: "fn_sweetCabbage",  hours: GROUP_HOURS.produce },
    { id: "carrot",        emoji: "🥕", group: "produce", zone: "jar",    nameKey: "fn_carrot",        hours: GROUP_HOURS.produce },
    { id: "potato",        emoji: "🥔", group: "produce", zone: "jar",    nameKey: "fn_potato",        hours: GROUP_HOURS.produce },
    { id: "tomato",        emoji: "🍅", group: "produce", zone: "jar",    nameKey: "fn_tomato",        hours: GROUP_HOURS.produce },
    { id: "banana",        emoji: "🍌", group: "produce", zone: "jar",    nameKey: "fn_banana",        hours: GROUP_HOURS.produce },

    // Sữa & chế phẩm — Tủ đồ khô (3h)
    { id: "milk",          emoji: "🥛", group: "dairy",   zone: "jar",    nameKey: "fn_milk",          hours: GROUP_HOURS.dairy },
    { id: "yogurt",        emoji: "🥣", group: "dairy",   zone: "jar",    nameKey: "fn_yogurt",        hours: GROUP_HOURS.dairy },
    { id: "cheese",        emoji: "🧀", group: "dairy",   zone: "jar",    nameKey: "fn_cheese",        hours: GROUP_HOURS.dairy },
    { id: "butter",        emoji: "🧈", group: "dairy",   zone: "jar",    nameKey: "fn_butter",        hours: GROUP_HOURS.dairy },

    // Ngũ cốc, hạt khô — Tủ đồ khô (8h)
    { id: "rice",          emoji: "🍚", group: "grain",   zone: "jar",    nameKey: "fn_rice",          hours: GROUP_HOURS.grain },
    { id: "mungBeans",     emoji: "🫘", group: "grain",   zone: "jar",    nameKey: "fn_mungBeans",     hours: GROUP_HOURS.grain },
    { id: "flour",         emoji: "🌾", group: "grain",   zone: "jar",    nameKey: "fn_flour",         hours: GROUP_HOURS.grain },
    { id: "noodles",       emoji: "🍜", group: "grain",   zone: "jar",    nameKey: "fn_noodles",       hours: GROUP_HOURS.grain },

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

  /** Convert in-game hours → real ms, scaled by difficulty (harder ⇒ time runs faster). */
  function gameHoursToMs(hours, difficulty) {
    return (hours * MS_PER_GAME_HOUR) / diffMult(difficulty);
  }

  /** Convert elapsed real ms → in-game hours, scaled by difficulty. */
  function msToGameHours(ms, difficulty) {
    return (ms * diffMult(difficulty)) / MS_PER_GAME_HOUR;
  }

  /** Format in-game hours as "Hh:MM" — e.g. 1.5 → "1:30". */
  function formatGameClock(hours) {
    const total = Math.max(0, hours);
    const h = Math.floor(total);
    const m = Math.floor((total - h) * 60);
    return `${h}:${String(m).padStart(2, "0")}`;
  }

  /**
   * Probability of spawning an item that's already spoiled — must be trashed.
   * Keeps Trash relevant even when the player is on top of fresh stock.
   */
  const PRE_SPOILED_CHANCE = 0.12;

  /**
   * Decide what to spawn next.
   * Distribution: 12% pre-spoiled, 44% fridge zone, 44% dry storage.
   * @returns {{ def: FoodDef, preSpoiled: boolean }}
   */
  function pickSpawn() {
    if (Math.random() < PRE_SPOILED_CHANCE) {
      const def = FOOD_CATALOG[(Math.random() * FOOD_CATALOG.length) | 0];
      return { def, preSpoiled: true };
    }
    const zone = Math.random() < 0.5 ? "fridge" : "jar";
    const pool = FOOD_CATALOG.filter((f) => f.zone === zone);
    const def = pool[(Math.random() * pool.length) | 0];
    return { def, preSpoiled: false };
  }

  window.MKitchen = window.MKitchen || {};
  window.MKitchen.foods = {
    FOOD_CATALOG,
    GROUP_HOURS,
    GROUP_ZONE,
    MS_PER_GAME_HOUR,
    PRE_SPOILED_CHANCE,
    diffMult,
    humidityRamp,
    gameHoursToMs,
    msToGameHours,
    formatGameClock,
    pickSpawn,
  };
})();
