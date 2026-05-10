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
      zoneFridgeHint: "Meat, dairy, produce",
      zoneJar: "Dry storage",
      zoneJarHint: "Grains, dry beans, nuts",
      zoneCanned: "Canned pantry",
      zoneCannedHint: "Sealed cans & bottles",
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
      winByTime: "Hold the kitchen (minutes)",
      labelTargetScore: "Target net saved",
      labelTargetMinutes: "Minutes",
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
      groupDairy: "Dairy & eggs",
      groupProduce: "Fresh produce",
      groupGrain: "Grains & nuts",
      groupCanned: "Canned & seasonings",

      // Per-item tooltips (status hints)
      foodTipFridge: "Needs the fridge",
      foodTipJar: "Seal in dry storage",
      foodTipCanned: "Belongs in the canned pantry",
      foodTipSpoiled: "Spoiled — throw away",
      foodTipOk: "Still fresh",
      foodTipOpened: "Opened — refrigerate now!",
      foodTipInSun: "In the sun — store quickly!",

      // Food names
      fn_chicken: "Fresh chicken",
      fn_beef: "Fresh beef",
      fn_fish: "Fresh fish",
      fn_shrimp: "Fresh shrimp",
      fn_milk: "Carton of milk",
      fn_eggs: "Eggs",
      fn_butter: "Butter block",
      fn_cheese: "Cheese wedge",
      fn_tomato: "Tomatoes",
      fn_lettuce: "Lettuce",
      fn_carrot: "Carrots",
      fn_banana: "Bananas",
      fn_mango: "Mango",
      fn_rice: "Bag of rice",
      fn_peanuts: "Roasted peanuts",
      fn_cashews: "Cashews",
      fn_noodles: "Dried noodles",
      fn_blackBeans: "Dried black beans",
      fn_cannedMeat: "Canned meat",
      fn_pate: "Pâté tin",
      fn_sardines: "Canned sardines",
      fn_fishSauce: "Fish sauce bottle",

      // Tip-bar
      tipFridge: "Meat / dairy / produce → Fridge",
      tipJar: "Grains, beans, nuts → Dry storage",
      tipCanned: "Sealed cans → Canned pantry (opened ones must go cold!)",
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
      zoneFridgeHint: "Thịt, sữa-trứng, rau quả",
      zoneJar: "Đồ khô",
      zoneJarHint: "Ngũ cốc, đậu, hạt khô",
      zoneCanned: "Tủ đồ hộp",
      zoneCannedHint: "Lon, hộp, gia vị đậy kín",
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
      winByTime: "Giữ bếp (phút)",
      labelTargetScore: "Mục tiêu (saved-wasted)",
      labelTargetMinutes: "Số phút",
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
      groupDairy: "Sữa & trứng",
      groupProduce: "Rau củ quả tươi",
      groupGrain: "Ngũ cốc & hạt khô",
      groupCanned: "Đồ hộp & gia vị",

      foodTipFridge: "Cần vào tủ lạnh",
      foodTipJar: "Cho vào hộp khô",
      foodTipCanned: "Cất tủ đồ hộp",
      foodTipSpoiled: "Đã hỏng — bỏ rác",
      foodTipOk: "Còn tươi",
      foodTipOpened: "Đã mở — phải vào tủ lạnh!",
      foodTipInSun: "Đang bị nắng — cất nhanh!",

      fn_chicken: "Thịt gà tươi",
      fn_beef: "Thịt bò tươi",
      fn_fish: "Cá tươi",
      fn_shrimp: "Tôm tươi",
      fn_milk: "Hộp sữa",
      fn_eggs: "Trứng",
      fn_butter: "Bơ",
      fn_cheese: "Phô mai",
      fn_tomato: "Cà chua",
      fn_lettuce: "Xà lách",
      fn_carrot: "Cà rốt",
      fn_banana: "Chuối",
      fn_mango: "Xoài",
      fn_rice: "Gạo",
      fn_peanuts: "Đậu phộng rang",
      fn_cashews: "Hạt điều",
      fn_noodles: "Miến / bún khô",
      fn_blackBeans: "Đậu đen khô",
      fn_cannedMeat: "Thịt hộp",
      fn_pate: "Pa-tê hộp",
      fn_sardines: "Cá hộp",
      fn_fishSauce: "Chai nước mắm",

      tipFridge: "Thịt / sữa-trứng / rau quả → Tủ lạnh",
      tipJar: "Ngũ cốc, đậu, hạt → Đồ khô",
      tipCanned: "Đồ hộp đậy kín → Tủ đồ hộp (đồ đã mở phải vào tủ lạnh!)",
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
