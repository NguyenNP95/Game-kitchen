/** @typedef {'vi'|'en'} Locale */

(function () {
  "use strict";

  const STRINGS = {
    en: {
      title: "Managing Humidity in the Kitchen",
      labelScore: "Score",
      labelSaved: "Saved",
      labelWasted: "Wasted",
      labelNet: "Net",
      labelGoal: "Goal",
      labelTime: "Time",
      labelGameClock: "Kitchen time",
      meterHumidity: "Humidity",
      meterHygiene: "Hygiene",
      btnSettings: "Settings",
      btnStart: "Start",
      btnCancel: "Close",
      btnSave: "Save",
      btnPlayAgain: "Play again",
      dehumidifier: "Dehumidifier",
      statusOn: "On",
      statusOff: "Off",
      hintCounter: "Counter",
      zoneFridge: "Fridge",
      zoneFridgeHint: "Fresh meat only",
      zoneJar: "Dry storage",
      zoneJarHint: "Produce, dairy & grains",
      zoneTrash: "Trash",
      zoneTrashHint: "Spoiled only",
      sink: "Sink",
      sinkHint: "Tap puddles on the floor to wipe",
      panelHighScores: "Top 5",
      highScoreNote: "Stored locally on this device.",
      settingsTitle: "Settings",
      setLanguage: "Language",
      langAuto: "Auto (browser)",
      setDifficulty: "Difficulty",
      diffEasy: "Easy",
      diffNormal: "Normal",
      diffHard: "Hard",
      setWin: "Win condition",
      winByScore: "Reach saved target",
      winByTime: "Hold the kitchen (seconds)",
      labelTargetScore: "Target net saved",
      labelTargetSeconds: "Seconds",
      setAudio: "Audio",
      soundEnabled: "Sound on",
      setAccessibility: "Display",
      reduceMotion: "Reduce motion",
      victoryTitle: "You made it!",
      victoryScore: "Net saved target reached — great job!",
      victoryTime: "Time's up — kitchen under control.",
      defeatHumidity: "Too damp — mold wins.",
      defeatHygiene: "Hygiene collapsed — smells took over.",
      defeatSubHumidity: "Use the dehumidifier, wipe puddles, and store food faster.",
      defeatSubHygiene: "Toss spoiled items and keep dry goods sealed.",
      endStats: (saved, wasted, net) => `Saved ${saved} · Wasted ${wasted} · Net ${net}`,
      goalScore: (n) => `+${n} net`,
      goalTime: (m) => `${m}:00`,
      goalTimeCountdown: (s) => formatTimeMs(s),
      scoreLine: (s, d, mode) => `${s} net · ${d} · ${mode}`,
      winModeShortScore: "Net Saved",
      winModeShortTime: "Time",

      // Group labels
      groupMeat: "Fresh meat",
      groupDairy: "Dairy products",
      groupProduce: "Fresh produce",
      groupGrain: "Grains & legumes",
      // Per-item tooltips (status hints)
      foodTipFridge: "Needs the fridge",
      foodTipJar: "Seal in dry storage",
      foodTipSpoiled: "Spoiled — throw away",
      foodTipOk: "Still fresh",
      foodTipOpened: "Opened — refrigerate now!",
      foodTipInSun: "In the sun — store quickly!",

      // Food names
      fn_pork: "Fresh pork",
      fn_beef: "Fresh beef",
      fn_chicken: "Fresh chicken",
      fn_snakeheadFish: "Snakehead fish",
      fn_sweetCabbage: "Bok choy",
      fn_carrot: "Carrots",
      fn_potato: "Potatoes",
      fn_tomato: "Tomatoes",
      fn_banana: "Bananas",
      fn_milk: "Carton of milk",
      fn_yogurt: "Yogurt",
      fn_cheese: "Cheese wedge",
      fn_butter: "Butter block",
      fn_rice: "Bag of rice",
      fn_mungBeans: "Mung beans",
      fn_flour: "Flour",
      fn_noodles: "Instant noodles",

      // Tip-bar
      tipFridge: "Meat → Fridge",
      tipJar: "Produce, dairy, grains → Dry storage",
      tipPuddle: "Click puddles on the floor to wipe",
      tipTrash: "Spoiled or past 4-hour limit → Trash",
      tipSun: "Sunny patches on the counter spoil food twice as fast",
      tipFourHour: "Food sitting at room temperature for over 4 game-hours must be discarded",

      // Pop-text labels
      popSaved: "+1 saved",
      popWasted: "-1 wasted",
      popMixed: "Mixed spoiled!",
      popOpened: "Opened!",
    },
    vi: {
      title: "Quản lý độ ẩm trong bếp",
      labelScore: "Điểm",
      labelSaved: "Cứu được",
      labelWasted: "Hỏng",
      labelNet: "Ròng",
      labelGoal: "Mục tiêu",
      labelTime: "Thời gian",
      labelGameClock: "Giờ bếp",
      meterHumidity: "Độ ẩm",
      meterHygiene: "Vệ sinh bếp",
      btnSettings: "Cài đặt",
      btnStart: "Bắt đầu",
      btnCancel: "Đóng",
      btnSave: "Lưu",
      btnPlayAgain: "Chơi lại",
      dehumidifier: "Máy hút ẩm",
      statusOn: "Bật",
      statusOff: "Tắt",
      hintCounter: "Bàn bếp",
      zoneFridge: "Tủ lạnh",
      zoneFridgeHint: "Chỉ thịt tươi",
      zoneJar: "Đồ khô",
      zoneJarHint: "Rau củ, sữa & ngũ cốc",
      zoneTrash: "Thùng rác",
      zoneTrashHint: "Chỉ đồ hỏng",
      sink: "Bồn rửa",
      sinkHint: "Chạm vũng nước trên sàn để lau",
      panelHighScores: "Top 5",
      highScoreNote: "Lưu trên máy này.",
      settingsTitle: "Cài đặt",
      setLanguage: "Ngôn ngữ",
      langAuto: "Tự động (trình duyệt)",
      setDifficulty: "Độ khó",
      diffEasy: "Dễ",
      diffNormal: "Bình thường",
      diffHard: "Khó",
      setWin: "Cách thắng",
      winByScore: "Đạt số món cứu",
      winByTime: "Giữ bếp (giây)",
      labelTargetScore: "Mục tiêu (saved-wasted)",
      labelTargetSeconds: "Số giây",
      setAudio: "Âm thanh",
      soundEnabled: "Bật âm thanh",
      setAccessibility: "Hiển thị",
      reduceMotion: "Giảm chuyển động",
      victoryTitle: "Xong xuôi!",
      victoryScore: "Đạt mục tiêu cứu món — quá đỉnh!",
      victoryTime: "Hết giờ — bếp vẫn trong tầm kiểm soát.",
      defeatHumidity: "Ẩm quá — nấm mốc thắng rồi.",
      defeatHygiene: "Vệ sinh sụp đổ — mùi lan khắp nhà.",
      defeatSubHumidity: "Bật hút ẩm, lau vũng nước và cất thực phẩm nhanh hơn.",
      defeatSubHygiene: "Bỏ đồ hỏng và nhớ đậy kín đồ khô.",
      endStats: (saved, wasted, net) => `Cứu ${saved} · Hỏng ${wasted} · Ròng ${net}`,
      goalScore: (n) => `+${n} ròng`,
      goalTime: (m) => `${m}:00`,
      goalTimeCountdown: (s) => formatTimeMs(s),
      scoreLine: (s, d, mode) => `${s} ròng · ${d} · ${mode}`,
      winModeShortScore: "Cứu món",
      winModeShortTime: "Thời gian",

      groupMeat: "Thịt tươi",
      groupDairy: "Sữa & chế phẩm",
      groupProduce: "Rau củ quả tươi",
      groupGrain: "Ngũ cốc & đậu khô",
      foodTipFridge: "Cần vào tủ lạnh",
      foodTipJar: "Cho vào hộp khô",
      foodTipSpoiled: "Đã hỏng — bỏ rác",
      foodTipOk: "Còn tươi",
      foodTipOpened: "Đã mở — phải vào tủ lạnh!",
      foodTipInSun: "Đang bị nắng — cất nhanh!",

      fn_pork: "Thịt heo tươi",
      fn_beef: "Thịt bò tươi",
      fn_chicken: "Thịt gà tươi",
      fn_snakeheadFish: "Cá lóc tươi",
      fn_sweetCabbage: "Rau cải ngọt",
      fn_carrot: "Cà rốt",
      fn_potato: "Khoai tây",
      fn_tomato: "Cà chua",
      fn_banana: "Chuối",
      fn_milk: "Sữa tươi hộp",
      fn_yogurt: "Sữa chua",
      fn_cheese: "Phô mai",
      fn_butter: "Bơ",
      fn_rice: "Gạo",
      fn_mungBeans: "Đậu xanh (nấu chè)",
      fn_flour: "Bột mì",
      fn_noodles: "Mì gói",

      tipFridge: "Thịt tươi → Tủ lạnh",
      tipJar: "Rau củ, sữa, ngũ cốc → Đồ khô",
      tipPuddle: "Chạm vũng nước trên sàn để lau",
      tipTrash: "Đồ hỏng hoặc quá 4 giờ → Thùng rác",
      tipSun: "Vùng nắng trên bàn làm món hỏng nhanh gấp 2",
      tipFourHour: "Quá 4 giờ ở nhiệt độ phòng (5–60°C) là phải bỏ",

      popSaved: "+1 cứu",
      popWasted: "-1 hỏng",
      popMixed: "Lẫn đồ hỏng!",
      popOpened: "Đã mở!",
    },
  };

  function formatTimeMs(ms) {
    const t = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  /** @param {string} tag */
  function browserLocale(tag) {
    const t = (tag || "en").toLowerCase();
    if (t.startsWith("vi")) return "vi";
    return "en";
  }

  /** @param {string|null} pref 'auto' | 'vi' | 'en' */
  function resolveLocale(pref, navigatorLanguage) {
    if (pref === "vi" || pref === "en") return pref;
    return browserLocale(navigatorLanguage || "en");
  }

  /** @param {Locale} locale */
  function t(locale, key) {
    const bundle = STRINGS[locale] || STRINGS.en;
    const v = bundle[key];
    return typeof v === "string" ? v : STRINGS.en[key] ?? key;
  }

  function tf(locale, key, ...args) {
    const bundle = STRINGS[locale] || STRINGS.en;
    const fn = bundle[key];
    if (typeof fn === "function") return fn(...args);
    const f = STRINGS.en[key];
    return typeof f === "function" ? f(...args) : String(key);
  }

  /** @param {Locale} locale @param {string} d */
  function difficultyLabel(locale, d) {
    if (d === "easy") return t(locale, "diffEasy");
    if (d === "hard") return t(locale, "diffHard");
    return t(locale, "diffNormal");
  }

  /** @param {Locale} locale @param {string} wm */
  function winModeLabel(locale, wm) {
    return wm === "time" ? t(locale, "winModeShortTime") : t(locale, "winModeShortScore");
  }

  window.MKitchen = window.MKitchen || {};
  window.MKitchen.i18n = {
    browserLocale,
    resolveLocale,
    t,
    tf,
    difficultyLabel,
    winModeLabel,
  };
})();
