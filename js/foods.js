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
    canned: 12,        // closed lid
  };
  const OPENED_CANNED_HOURS = 2;

  /** Each group's primary storage zone. */
  const GROUP_ZONE = {
    meat: "fridge",
    dairy: "fridge",
    produce: "fridge",
    grain: "jar",
    canned: "canned",  // closed cans go to the canned-goods cabinet
  };

  /**
   * @typedef {Object} FoodDef
   * @property {string} id
   * @property {string} emoji
   * @property {'meat'|'dairy'|'produce'|'grain'|'canned'} group
   * @property {'fridge'|'jar'|'canned'} zone     primary correct zone (closed canned only)
   * @property {string} nameKey
   * @property {number} hours                     room-temp shelf life in game-hours
   * @property {boolean} [canOpen]                only true for canned: may spawn opened
   */

  /** @type {FoodDef[]} */
  const FOOD_CATALOG = [
    // Thịt tươi (2h)
    { id: "chicken",   emoji: "🍗", group: "meat",    zone: "fridge", nameKey: "fn_chicken",   hours: GROUP_HOURS.meat },
    { id: "beef",      emoji: "🥩", group: "meat",    zone: "fridge", nameKey: "fn_beef",      hours: GROUP_HOURS.meat },
    { id: "fish",      emoji: "🐟", group: "meat",    zone: "fridge", nameKey: "fn_fish",      hours: GROUP_HOURS.meat },
    { id: "shrimp",    emoji: "🦐", group: "meat",    zone: "fridge", nameKey: "fn_shrimp",    hours: GROUP_HOURS.meat },

    // Sữa - trứng - bơ (3h)
    { id: "milk",      emoji: "🥛", group: "dairy",   zone: "fridge", nameKey: "fn_milk",      hours: GROUP_HOURS.dairy },
    { id: "eggs",      emoji: "🥚", group: "dairy",   zone: "fridge", nameKey: "fn_eggs",      hours: GROUP_HOURS.dairy },
    { id: "butter",    emoji: "🧈", group: "dairy",   zone: "fridge", nameKey: "fn_butter",    hours: GROUP_HOURS.dairy },
    { id: "cheese",    emoji: "🧀", group: "dairy",   zone: "fridge", nameKey: "fn_cheese",    hours: GROUP_HOURS.dairy },

    // Rau củ quả tươi (4h)
    { id: "tomato",    emoji: "🍅", group: "produce", zone: "fridge", nameKey: "fn_tomato",    hours: GROUP_HOURS.produce },
    { id: "lettuce",   emoji: "🥬", group: "produce", zone: "fridge", nameKey: "fn_lettuce",   hours: GROUP_HOURS.produce },
    { id: "carrot",    emoji: "🥕", group: "produce", zone: "fridge", nameKey: "fn_carrot",    hours: GROUP_HOURS.produce },
    { id: "banana",    emoji: "🍌", group: "produce", zone: "fridge", nameKey: "fn_banana",    hours: GROUP_HOURS.produce },
    { id: "mango",     emoji: "🥭", group: "produce", zone: "fridge", nameKey: "fn_mango",     hours: GROUP_HOURS.produce },

    // Ngũ cốc, hạt khô (8h)
    { id: "rice",      emoji: "🍚", group: "grain",   zone: "jar",    nameKey: "fn_rice",      hours: GROUP_HOURS.grain },
    { id: "peanuts",   emoji: "🥜", group: "grain",   zone: "jar",    nameKey: "fn_peanuts",   hours: GROUP_HOURS.grain },
    { id: "cashews",   emoji: "🌰", group: "grain",   zone: "jar",    nameKey: "fn_cashews",   hours: GROUP_HOURS.grain },
    { id: "noodles",   emoji: "🍜", group: "grain",   zone: "jar",    nameKey: "fn_noodles",   hours: GROUP_HOURS.grain },
    { id: "blackBeans", emoji: "🫘", group: "grain",  zone: "jar",    nameKey: "fn_blackBeans", hours: GROUP_HOURS.grain },

    // Đồ hộp & gia vị (12h closed, 2h once opened)
    { id: "cannedMeat", emoji: "🥫", group: "canned", zone: "canned", nameKey: "fn_cannedMeat", hours: GROUP_HOURS.canned, canOpen: true },
    { id: "pate",       emoji: "🥫", group: "canned", zone: "canned", nameKey: "fn_pate",       hours: GROUP_HOURS.canned, canOpen: true },
    { id: "sardines",   emoji: "🥫", group: "canned", zone: "canned", nameKey: "fn_sardines",   hours: GROUP_HOURS.canned, canOpen: true },
    { id: "fishSauce",  emoji: "🍶", group: "canned", zone: "canned", nameKey: "fn_fishSauce",  hours: GROUP_HOURS.canned, canOpen: false },
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
   * Goal: balance the three storage zones so no zone is over-loaded.
   * Distribution:
   *   12% pre-spoiled    → must go to Trash
   *   29.3% Fridge zone  → meat / dairy / produce (picked uniformly within fridge group)
   *   29.3% Dry storage  → grain
   *   29.3% Canned zone  → canned & seasonings
   *
   * @returns {{ def: FoodDef, preSpoiled: boolean }}
   */
  function pickSpawn() {
    if (Math.random() < PRE_SPOILED_CHANCE) {
      const def = FOOD_CATALOG[(Math.random() * FOOD_CATALOG.length) | 0];
      return { def, preSpoiled: true };
    }
    const r = Math.random();
    let zone;
    if (r < 1 / 3) zone = "fridge";
    else if (r < 2 / 3) zone = "jar";
    else zone = "canned";
    const pool = FOOD_CATALOG.filter((f) => f.zone === zone);
    const def = pool[(Math.random() * pool.length) | 0];
    return { def, preSpoiled: false };
  }

  window.MKitchen = window.MKitchen || {};
  window.MKitchen.foods = {
    FOOD_CATALOG,
    GROUP_HOURS,
    GROUP_ZONE,
    OPENED_CANNED_HOURS,
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
