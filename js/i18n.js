/** @typedef {'vi'|'en'} Locale */

(function () {
  "use strict";

  const STRINGS = {
  en: {
    title: "Managing Humidity in the Kitchen",
    labelScore: "Score",
    labelGoal: "Goal",
    labelTime: "Time",
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
    zoneFridgeHint: "Perishables",
    zoneJar: "Dry storage",
    zoneJarHint: "Jars & dry goods",
    zoneTrash: "Trash",
    zoneTrashHint: "Spoiled only",
    sinkHint: "Tap puddles on the counter to wipe",
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
    winByScore: "Reach score",
    winByTime: "Hold the kitchen (minutes)",
    labelTargetScore: "Target score",
    labelTargetMinutes: "Minutes",
    setAudio: "Audio",
    soundEnabled: "Sound on",
    setAccessibility: "Display",
    reduceMotion: "Reduce motion",
    victoryTitle: "You made it!",
    victoryScore: "Humidity season survived with style.",
    victoryTime: "Timer cleared — kitchen under control.",
    defeatHumidity: "Too damp — mold wins.",
    defeatHygiene: "Hygiene collapsed — smells took over.",
    defeatSubHumidity: "Use the dehumidifier, wipe puddles, and store food faster.",
    defeatSubHygiene: "Toss spoiled items and keep dry goods sealed.",
    goalScore: (n) => `${n} pts`,
    goalTime: (m) => `${m}:00`,
    goalTimeCountdown: (s) => formatTimeMs(s),
    scoreLine: (s, d, mode) => `${s} pts · ${d} · ${mode}`,
    winModeShortScore: "Score",
    winModeShortTime: "Time",
    foodTipFridge: "Needs fridge",
    foodTipJar: "Seal in dry storage",
    foodTipSpoiled: "Throw away",
    foodTipOk: "OK for now",
    // Food names (tooltips)
    fn_peanuts: "Roasted peanuts",
    fn_cashews: "Cashews",
    fn_blackBeans: "Dried black beans",
    fn_mung: "Mung beans",
    fn_noodles: "Dried glass noodles",
    fn_rice: "Bag of rice",
    fn_banhChung: "Bánh chưng (leftover)",
    fn_comTam: "Cơm tấm takeaway",
    fn_pho: "Phở broth bowl",
    fn_springRolls: "Chả giò plate",
    fn_stew: "Thịt kho pot",
    fn_braisedEggs: "Thịt kho trứng",
    fn_papayaSalad: "Gỏi đu đủ",
    fn_banhMi: "Bánh mì sandwich",
    fn_sweetSoup: "Chè đậu",
    tipFridge: "Drag 🧊-tagged food into the Fridge",
    tipJar: "Drag 🫙-tagged food into Dry storage",
    tipPuddle: "Click puddles on the counter to wipe",
    tipTrash: "Drag 🗑️-tagged (spoiled) food to Trash",
  },
  vi: {
    title: "Quản lý độ ẩm trong bếp",
    labelScore: "Điểm",
    labelGoal: "Mục tiêu",
    labelTime: "Thời gian",
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
    zoneFridgeHint: "Đồ dễ hỏng",
    zoneJar: "Đồ khô kín",
    zoneJarHint: "Hộp / lọ đậy kín",
    zoneTrash: "Thùng rác",
    zoneTrashHint: "Chỉ đồ hỏng",
    sinkHint: "Chạm vũng nước trên bàn để lau",
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
    winByScore: "Đạt điểm",
    winByTime: "Giữ bếp (phút)",
    labelTargetScore: "Mục tiêu điểm",
    labelTargetMinutes: "Số phút",
    setAudio: "Âm thanh",
    soundEnabled: "Bật âm thanh",
    setAccessibility: "Hiển thị",
    reduceMotion: "Giảm chuyển động",
    victoryTitle: "Xong xuôi!",
    victoryScore: "Mùa ẩm mà bếp vẫn tươm tất.",
    victoryTime: "Hết giờ — bếp vẫn trong tầm kiểm soát.",
    defeatHumidity: "Ẩm quá — nấm mốc thắng rồi.",
    defeatHygiene: "Vệ sinh sụp đổ — mùi lan khắp nhà.",
    defeatSubHumidity: "Bật hút ẩm, lau vũng nước và cất thực phẩm nhanh hơn.",
    defeatSubHygiene: "Bỏ đồ hỏng và nhớ đậy kín đồ khô.",
    goalScore: (n) => `${n} điểm`,
    goalTime: (m) => `${m}:00`,
    goalTimeCountdown: (s) => formatTimeMs(s),
    scoreLine: (s, d, mode) => `${s} điểm · ${d} · ${mode}`,
    winModeShortScore: "Điểm",
    winModeShortTime: "Thời gian",
    foodTipFridge: "Cần vào tủ",
    foodTipJar: "Cho vào hộp kín",
    foodTipSpoiled: "Bỏ rác",
    foodTipOk: "Tạm ổn",
    fn_peanuts: "Đậu phộng rang",
    fn_cashews: "Hạt điều",
    fn_blackBeans: "Đậu đen khô",
    fn_mung: "Đậu xanh hột",
    fn_noodles: "Miến / bún khô",
    fn_rice: "Gạo / gói cơm",
    fn_banhChung: "Bánh chưng thừa",
    fn_comTam: "Cơm tấm mang về",
    fn_pho: "Tô phở / nước dùng",
    fn_springRolls: "Đĩa chả giò",
    fn_stew: "Nồi thịt kho",
    fn_braisedEggs: "Thịt kho trứng",
    fn_papayaSalad: "Gỏi đu đủ",
    fn_banhMi: "Bánh mì",
    fn_sweetSoup: "Chè đậu",
    tipFridge: "Kéo đồ có nhãn 🧊 vào Tủ lạnh",
    tipJar: "Kéo đồ có nhãn 🫙 vào Hộp khô",
    tipPuddle: "Bấm vào vũng nước trên bàn để lau",
    tipTrash: "Kéo đồ có nhãn 🗑️ (đã hỏng) vào Thùng rác",
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
