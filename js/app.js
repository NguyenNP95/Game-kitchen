const { browserLocale, resolveLocale, t, tf, difficultyLabel, winModeLabel } = window.MKitchen.i18n;
const { loadSettings, saveSettings, loadHighScores, pushHighScore } = window.MKitchen.storage;
const { FOOD_CATALOG, diffMult, humidityRamp } = window.MKitchen.foods;

/** @typedef {'fridge'|'jar'} FoodZone */

let settings = loadSettings();
let locale = resolveLocale(settings.languagePref, navigator.language || "en");

const els = {
  score: /** @type {HTMLElement} */ (document.getElementById("scoreValue")),
  goal: /** @type {HTMLElement} */ (document.getElementById("goalValue")),
  goalStat: /** @type {HTMLElement} */ (document.getElementById("goalStat")),
  timerStat: /** @type {HTMLElement} */ (document.getElementById("timerStat")),
  timer: /** @type {HTMLElement} */ (document.getElementById("timerValue")),
  humidity: /** @type {HTMLElement} */ (document.getElementById("humidityBar")),
  hygiene: /** @type {HTMLElement} */ (document.getElementById("hygieneBar")),
  itemsLayer: /** @type {HTMLElement} */ (document.getElementById("itemsLayer")),
  puddlesLayer: /** @type {HTMLElement} */ (document.getElementById("puddlesLayer")),
  dropCounter: /** @type {HTMLElement} */ (document.getElementById("dropCounter")),
  btnDehumidifier: /** @type {HTMLButtonElement} */ (document.getElementById("btnDehumidifier")),
  dehumidifierStatus: /** @type {HTMLElement} */ (document.getElementById("dehumidifierStatus")),
  zoneFridge: /** @type {HTMLElement} */ (document.getElementById("zoneFridge")),
  zoneJar: /** @type {HTMLElement} */ (document.getElementById("zoneJar")),
  zoneTrash: /** @type {HTMLElement} */ (document.getElementById("zoneTrash")),
  highScoreList: /** @type {HTMLOListElement} */ (document.getElementById("highScoreList")),
  modalSettings: /** @type {HTMLElement} */ (document.getElementById("modalSettings")),
  formSettings: /** @type {HTMLFormElement} */ (document.getElementById("formSettings")),
  inputTargetScore: /** @type {HTMLInputElement} */ (document.getElementById("inputTargetScore")),
  inputTargetMinutes: /** @type {HTMLInputElement} */ (document.getElementById("inputTargetMinutes")),
  checkSound: /** @type {HTMLInputElement} */ (document.getElementById("checkSound")),
  checkReduceMotion: /** @type {HTMLInputElement} */ (document.getElementById("checkReduceMotion")),
  overlayEnd: /** @type {HTMLElement} */ (document.getElementById("overlayEnd")),
  endTitle: /** @type {HTMLElement} */ (document.getElementById("endTitle")),
  endMessage: /** @type {HTMLElement} */ (document.getElementById("endMessage")),
};

let audioCtx = null;

function beep(freq, duration, vol = 0.06) {
  if (!settings.sound) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || /** @type {*} */ (window).webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + duration);
  } catch {
    /* ignore */
  }
}

function applyReduceMotion() {
  document.body.classList.toggle("reduce-motion", settings.reduceMotion);
}

function applyI18n() {
  document.documentElement.lang = locale === "vi" ? "vi" : "en";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const key = node.getAttribute("data-i18n");
    if (key) node.textContent = t(locale, key);
  });
  document.title = t(locale, "title");
  renderHighScores();
  updateDehumidifierUi();
}

function updateDehumidifierUi() {
  const on = game.dehumidifierOn;
  els.btnDehumidifier.setAttribute("aria-pressed", on ? "true" : "false");
  els.dehumidifierStatus.textContent = on ? t(locale, "statusOn") : t(locale, "statusOff");
  els.dehumidifierStatus.classList.toggle("on", on);
  els.dehumidifierStatus.classList.toggle("off", !on);
}

const game = {
  running: false,
  score: 0,
  humidity: 22,
  hygiene: 100,
  dehumidifierOn: false,
  winMode: "score",
  targetScore: 1000,
  targetMs: 180000,
  elapsedMs: 0,
  difficulty: /** @type {'easy'|'normal'|'hard'} */ ("normal"),
  spawnAcc: 0,
  puddleAcc: 0,
  /** @type {Map<string, any>} */
  items: new Map(),
  /** @type {Map<string, any>} */
  puddles: new Map(),
  raf: /** @type {number|null} */ (null),
  lastT: 0,
};

function placeItemEl(/** @type {HTMLElement} */ el, x, y) {
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

function randomSpot(/** @type {{ width: number; height: number }} */ counterRect) {
  const pad = 16;
  const w = counterRect.width - 52 - pad * 2;
  const h = counterRect.height - 52 - pad * 2;
  return {
    x: pad + Math.random() * Math.max(8, w),
    y: pad + Math.random() * Math.max(8, h),
  };
}

function tipForItem(/** @type {any} */ state) {
  if (state.spoiled) return t(locale, "foodTipSpoiled");
  if (state.zone === "fridge") return t(locale, "foodTipFridge");
  return t(locale, "foodTipJar");
}

function renderFoodItem(id, state) {
  let el = document.querySelector(`[data-item-id="${id}"]`);
  if (!el) {
    el = document.createElement("div");
    el.className = "food-item";
    el.dataset.itemId = id;
    el.tabIndex = 0;

    const badge = document.createElement("span");
    badge.className = "food-target";
    el.appendChild(badge);

    const tip = document.createElement("span");
    tip.className = "food-tip";
    el.appendChild(tip);

    const emojiSpan = document.createElement("span");
    emojiSpan.className = "emoji-food";
    emojiSpan.textContent = state.def.emoji;
    el.appendChild(emojiSpan);

    const ageBar = document.createElement("div");
    ageBar.className = "age-bar";
    const ageFill = document.createElement("div");
    ageFill.className = "age-fill";
    ageBar.appendChild(ageFill);
    el.appendChild(ageBar);

    bindPointerDrag(el, id);
    els.itemsLayer.appendChild(el);
  }
  el.classList.toggle("spoiled", state.spoiled);
  el.classList.toggle("target-fridge", !state.spoiled && state.zone === "fridge");
  el.classList.toggle("target-jar", !state.spoiled && state.zone === "jar");
  el.classList.toggle("target-trash", !!state.spoiled);

  const badge = el.querySelector(".food-target");
  if (badge) {
    badge.textContent = state.spoiled ? "🗑️" : state.zone === "fridge" ? "🧊" : "🫙";
  }

  const ratio = state.spoiled ? 1 : Math.min(1, (state.age || 0) / state.spoilMs);
  el.style.setProperty("--age", ratio.toFixed(3));
  el.classList.toggle("aging", !state.spoiled && ratio >= 0.5 && ratio < 0.85);
  el.classList.toggle("critical", !state.spoiled && ratio >= 0.85);

  const tip = el.querySelector(".food-tip");
  const tipText = t(locale, state.def.nameKey) + " · " + tipForItem(state);
  el.setAttribute("title", `${t(locale, state.def.nameKey)} — ${tipForItem(state)}`);
  if (tip) tip.textContent = tipText;
  placeItemEl(el, state.x, state.y);
}

function removeItem(id) {
  const el = document.querySelector(`[data-item-id="${id}"]`);
  el?.remove();
  game.items.delete(id);
}

function bindPointerDrag(/** @type {HTMLElement} */ el, id) {
  let dragging = false;
  let pointerId = /** @type {number|null} */ (null);
  // pointer offset relative to top-left of the chip (in viewport coords)
  let pOffX = 0;
  let pOffY = 0;

  const onMove = (/** @type {PointerEvent} */ ev) => {
    if (!dragging || ev.pointerId !== pointerId) return;
    if (!game.running) return;
    // Free movement in viewport coordinates (chip is position:fixed during drag)
    el.style.left = `${ev.clientX - pOffX}px`;
    el.style.top = `${ev.clientY - pOffY}px`;
    highlightZones(ev.clientX, ev.clientY);
  };

  const end = (/** @type {PointerEvent} */ ev) => {
    if (!dragging || ev.pointerId !== pointerId) return;
    dragging = false;
    el.classList.remove("dragging");
    document.body.classList.remove(
      "is-dragging-food",
      "is-dragging-fridge",
      "is-dragging-jar",
      "is-dragging-trash",
    );
    try {
      el.releasePointerCapture(/** @type {number} */ (pointerId));
    } catch {
      /* */
    }
    pointerId = null;
    clearZoneHighlight();
    if (!game.running) {
      // Game stopped mid-drag: restore visual to counter coords
      restoreToCounter(el, id, ev.clientX, ev.clientY);
      return;
    }

    handleDrop(id, ev.clientX, ev.clientY);

    // If item still exists (no drop, or wrong-zone drop without removal),
    // re-parent it back into the counter so it remains a draggable target.
    if (game.items.has(id) && el.isConnected) {
      restoreToCounter(el, id, ev.clientX, ev.clientY);
    }
  };

  el.addEventListener("pointerdown", (ev) => {
    if (!game.running) return;
    ev.preventDefault();
    dragging = true;
    pointerId = ev.pointerId;

    // Snapshot screen-space pos so we can switch to fixed positioning seamlessly
    const rect = el.getBoundingClientRect();
    pOffX = ev.clientX - rect.left;
    pOffY = ev.clientY - rect.top;

    // Move chip out of the counter so it can travel freely across the scene
    document.body.appendChild(el);
    el.style.position = "fixed";
    el.style.left = `${rect.left}px`;
    el.style.top = `${rect.top}px`;

    el.classList.add("dragging");

    const st = game.items.get(id);
    document.body.classList.add("is-dragging-food");
    if (st) {
      document.body.classList.toggle("is-dragging-fridge", !st.spoiled && st.zone === "fridge");
      document.body.classList.toggle("is-dragging-jar", !st.spoiled && st.zone === "jar");
      document.body.classList.toggle("is-dragging-trash", !!st.spoiled);
    }

    el.setPointerCapture(ev.pointerId);
  });
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
}

function restoreToCounter(/** @type {HTMLElement} */ el, id, clientX, clientY) {
  el.style.position = "";
  el.style.left = "";
  el.style.top = "";
  els.itemsLayer.appendChild(el);

  const counterRect = els.dropCounter.getBoundingClientRect();
  let x = clientX - counterRect.left - 26; // center the 52px chip on cursor
  let y = clientY - counterRect.top - 26;
  x = Math.max(4, Math.min(counterRect.width - 56, x));
  y = Math.max(4, Math.min(counterRect.height - 56, y));
  const st = game.items.get(id);
  if (st) {
    st.x = x;
    st.y = y;
    placeItemEl(el, x, y);
  }
}

function zoneRects() {
  return [
    { key: "fridge", el: els.zoneFridge },
    { key: "jar", el: els.zoneJar },
    { key: "trash", el: els.zoneTrash },
  ].map((z) => ({ key: z.key, r: z.el.getBoundingClientRect() }));
}

function hitZone(clientX, clientY) {
  for (const { key, r } of zoneRects()) {
    if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) return key;
  }
  return null;
}

function highlightZones(cx, cy) {
  const z = hitZone(cx, cy);
  els.zoneFridge.classList.toggle("highlight", z === "fridge");
  els.zoneJar.classList.toggle("highlight", z === "jar");
  els.zoneTrash.classList.toggle("highlight", z === "trash");
}

function clearZoneHighlight() {
  els.zoneFridge.classList.remove("highlight");
  els.zoneJar.classList.remove("highlight");
  els.zoneTrash.classList.remove("highlight");
}

function handleDrop(id, cx, cy) {
  const st = game.items.get(id);
  if (!st) return;
  const z = hitZone(cx, cy);
  if (z === "trash") {
    if (!st.spoiled) {
      game.hygiene = Math.max(0, game.hygiene - 6);
      popText(cx, cy - 12, "-6", "loss");
      flashMeter("humidity");
      beep(180, 0.08, 0.05);
    } else {
      addScore(60);
      game.hygiene = Math.min(100, game.hygiene + 6);
      popText(cx, cy - 28, "+6 ✨", "gain");
      popText(cx, cy - 12, "+60", "score");
      flashMeter("hygiene");
      beep(520, 0.07);
    }
    removeItem(id);
    return;
  }
  if (st.spoiled) return;

  if (z === "fridge" && st.zone === "fridge") {
    addScore(85);
    game.hygiene = Math.min(100, game.hygiene + 2);
    popText(cx, cy - 28, "+2 ✨", "gain");
    popText(cx, cy - 12, "+85", "score");
    flashMeter("hygiene");
    beep(660, 0.06);
    removeItem(id);
    return;
  }
  if (z === "jar" && st.zone === "jar") {
    addScore(75);
    game.hygiene = Math.min(100, game.hygiene + 2);
    popText(cx, cy - 28, "+2 ✨", "gain");
    popText(cx, cy - 12, "+75", "score");
    flashMeter("hygiene");
    beep(600, 0.06);
    removeItem(id);
    return;
  }
  if ((z === "fridge" && st.zone === "jar") || (z === "jar" && st.zone === "fridge")) {
    game.hygiene = Math.max(0, game.hygiene - 3);
    popText(cx, cy - 12, "-3", "loss");
    flashMeter("humidity");
    beep(220, 0.06);
  }
}

function addScore(n) {
  game.score += n;
  els.score.textContent = String(game.score);
  checkWin();
}

function popText(x, y, text, kind) {
  if (settings.reduceMotion) return;
  const el = document.createElement("div");
  el.className = `pop-text ${kind}`;
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function flashMeter(which) {
  const el = which === "hygiene" ? els.hygiene : els.humidity;
  el.classList.remove("flash-gain", "flash-loss");
  // force reflow so the animation can re-trigger
  void el.offsetWidth;
  el.classList.add(which === "hygiene" ? "flash-gain" : "flash-loss");
}

function checkWin() {
  if (!game.running) return;
  if (game.winMode === "score" && game.score >= game.targetScore) endGame(true, "score");
}

function spawnItem() {
  const counterRect = els.dropCounter.getBoundingClientRect();
  const def = FOOD_CATALOG[(Math.random() * FOOD_CATALOG.length) | 0];
  const id = `it_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const pos = randomSpot({ width: counterRect.width, height: counterRect.height });
  const dm = diffMult(game.difficulty);
  const spoilMs = def.spoilBaseMs / dm / (game.dehumidifierOn ? 1.15 : 1);

  // Some items arrive already partway aged ("leftovers" from earlier in the day).
  // After the initial 3 chips, ~22% of new spawns start 35-75% aged so the player
  // reliably sees food spoil and learns the trash mechanic.
  let initialAge = 0;
  if (game.items.size >= 3 && Math.random() < 0.22) {
    initialAge = spoilMs * (0.35 + Math.random() * 0.4);
  }

  const state = {
    def,
    x: pos.x,
    y: pos.y,
    spoiled: false,
    age: initialAge,
    spoilMs,
    zone: def.zone,
  };
  game.items.set(id, state);
  renderFoodItem(id, state);
}

function spawnPuddle() {
  const counterRect = els.dropCounter.getBoundingClientRect();
  const id = `pd_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
  const pos = randomSpot({ width: counterRect.width, height: counterRect.height });
  const el = document.createElement("div");
  el.className = "puddle";
  el.dataset.puddleId = id;
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y}px`;
  el.addEventListener("pointerup", (e) => {
    e.preventDefault();
    wipePuddle(id);
  });
  els.puddlesLayer.appendChild(el);
  game.puddles.set(id, { el });
}

function wipePuddle(id) {
  if (!game.running) return;
  const p = game.puddles.get(id);
  if (!p) return;
  const rect = p.el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top;
  p.el.remove();
  game.puddles.delete(id);
  addScore(50);
  game.humidity = Math.max(0, game.humidity - 4);
  game.hygiene = Math.min(100, game.hygiene + 8);
  popText(cx, cy - 18, "+8 ✨", "gain");
  popText(cx, cy - 2, "+50", "score");
  flashMeter("hygiene");
  beep(500, 0.05);
}

function tick(ts) {
  if (!game.running) return;
  if (!game.lastT) game.lastT = ts;
  const dt = Math.min(80, ts - game.lastT);
  game.lastT = ts;

  const dm = diffMult(game.difficulty);
  const hr = humidityRamp(game.difficulty);
  let hRamp = (hr * dt) / 1000;
  if (game.dehumidifierOn) hRamp *= 0.52;
  game.humidity = Math.min(100, game.humidity + hRamp);

  let spoilRate = 1 / (game.dehumidifierOn ? 1.2 : 1);
  spoilRate *= 1 + game.humidity / 130;

  for (const [_id, st] of game.items) {
    if (st.spoiled) continue;
    st.age += dt * spoilRate;

    const el = document.querySelector(`[data-item-id="${_id}"]`);
    if (st.age >= st.spoilMs) {
      st.spoiled = true;
      if (el) {
        const tip = el.querySelector(".food-tip");
        if (tip) tip.textContent = t(locale, st.def.nameKey) + " · " + tipForItem(st);
        el.setAttribute("title", `${t(locale, st.def.nameKey)} — ${tipForItem(st)}`);
        el.classList.add("spoiled", "target-trash");
        el.classList.remove("target-fridge", "target-jar", "aging", "critical");
        el.style.setProperty("--age", "1");
        const badge = el.querySelector(".food-target");
        if (badge) badge.textContent = "🗑️";
      }
      beep(140, 0.12, 0.07);
    } else if (el) {
      const ratio = Math.min(1, st.age / st.spoilMs);
      el.style.setProperty("--age", ratio.toFixed(3));
      el.classList.toggle("aging", ratio >= 0.5 && ratio < 0.85);
      el.classList.toggle("critical", ratio >= 0.85);
    }
  }

  let hygieneDrain = 0;
  for (const [_id, st] of game.items) {
    if (st.spoiled) hygieneDrain += (8 * dt) / 1000;
  }
  hygieneDrain += (game.puddles.size * 4 * dt) / 1000;
  if (!game.dehumidifierOn) hygieneDrain += ((game.difficulty === "hard" ? 1.4 : 0.6) * dt) / 1000;
  game.hygiene = Math.max(0, game.hygiene - hygieneDrain);

  game.spawnAcc += dt;
  const spawnEvery = game.dehumidifierOn ? 3600 / dm : 2800 / dm;
  if (game.spawnAcc >= spawnEvery && game.items.size < 7) {
    game.spawnAcc = 0;
    spawnItem();
  }

  game.puddleAcc += dt;
  const puddleEvery = (game.dehumidifierOn ? 5000 : 4200) / dm;
  if (game.humidity > 28 && game.puddleAcc >= puddleEvery && game.puddles.size < 5) {
    game.puddleAcc = 0;
    spawnPuddle();
  }

  if (game.winMode === "time") {
    game.elapsedMs += dt;
    const left = Math.max(0, game.targetMs - game.elapsedMs);
    els.timer.textContent = tf(locale, "goalTimeCountdown", left);
    if (game.elapsedMs >= game.targetMs) endGame(true, "time");
  }

  updateMeters();

  if (game.humidity >= 100) endGame(false, "humidity");
  if (game.hygiene <= 0) endGame(false, "hygiene");

  game.raf = requestAnimationFrame(tick);
}

function updateMeters() {
  els.humidity.style.width = `${game.humidity}%`;
  els.hygiene.style.width = `${game.hygiene}%`;
}

function resetRound() {
  game.running = false;
  if (game.raf) cancelAnimationFrame(game.raf);
  game.raf = null;
  game.lastT = 0;
  game.score = 0;
  game.humidity = 18 + Math.random() * 8;
  game.hygiene = 100;
  game.dehumidifierOn = false;
  game.spawnAcc = 0;
  game.puddleAcc = 0;
  game.elapsedMs = 0;
  els.score.textContent = "0";
  game.items.clear();
  // Remove any food chips that may have been re-parented to <body> mid-drag
  document.querySelectorAll(".food-item").forEach((n) => n.remove());
  els.itemsLayer.innerHTML = "";
  game.puddles.clear();
  els.puddlesLayer.innerHTML = "";
  document.body.classList.remove(
    "is-dragging-food",
    "is-dragging-fridge",
    "is-dragging-jar",
    "is-dragging-trash",
  );
  updateDehumidifierUi();
  updateMeters();
}

function startGame() {
  settings = loadSettings();
  locale = resolveLocale(settings.languagePref, navigator.language || "en");
  applyI18n();
  applyReduceMotion();

  resetRound();
  game.running = true;
  game.difficulty = settings.difficulty;
  game.winMode = settings.winMode;
  game.targetScore = Math.max(50, settings.targetScore);
  game.targetMs = Math.max(60000, settings.targetMinutes * 60000);
  els.goalStat.hidden = settings.winMode === "time";
  els.timerStat.hidden = settings.winMode !== "time";

  if (settings.winMode === "score") {
    els.goal.textContent = tf(locale, "goalScore", game.targetScore);
  } else {
    els.timer.textContent = tf(locale, "goalTimeCountdown", game.targetMs);
    els.goal.textContent = tf(locale, "goalTime", settings.targetMinutes);
  }

  document.getElementById("btnStart")?.setAttribute("disabled", "true");
  for (let i = 0; i < 3; i++) spawnItem();
  game.raf = requestAnimationFrame(tick);
  beep(440, 0.05);
}

function endGame(win, reason) {
  if (!game.running) return;
  game.running = false;
  if (game.raf) cancelAnimationFrame(game.raf);
  game.raf = null;
  document.getElementById("btnStart")?.removeAttribute("disabled");
  clearZoneHighlight();

  if (win) {
    beep(880, 0.1);
    setTimeout(() => beep(990, 0.08), 120);
    els.endTitle.textContent = t(locale, "victoryTitle");
    els.endMessage.textContent =
      reason === "time" ? t(locale, "victoryTime") : t(locale, "victoryScore");
    pushHighScore({
      score: game.score,
      at: Date.now(),
      difficulty: settings.difficulty,
      winMode: settings.winMode,
    });
    renderHighScores();
  } else {
    beep(120, 0.2);
    els.endTitle.textContent =
      reason === "humidity" ? t(locale, "defeatHumidity") : t(locale, "defeatHygiene");
    els.endMessage.textContent =
      reason === "humidity" ? t(locale, "defeatSubHumidity") : t(locale, "defeatSubHygiene");
  }

  els.overlayEnd.hidden = false;
}

function renderHighScores() {
  const rows = loadHighScores();
  if (!rows.length) {
    els.highScoreList.innerHTML = `<li class="muted">${locale === "vi" ? "Chưa có điểm" : "No scores yet"}</li>`;
    return;
  }
  els.highScoreList.innerHTML = rows
    .map((r, i) => {
      const line = tf(
        locale,
        "scoreLine",
        r.score,
        difficultyLabel(locale, r.difficulty),
        winModeLabel(locale, r.winMode),
      );
      return `<li>${i + 1}. ${line}</li>`;
    })
    .join("");
}

function openSettings() {
  const s = loadSettings();
  els.formSettings.querySelectorAll(`input[name="language"]`).forEach((inp) => {
    const i = /** @type {HTMLInputElement} */ (inp);
    i.checked = i.value === s.languagePref;
  });
  els.formSettings.querySelectorAll(`input[name="difficulty"]`).forEach((inp) => {
    const i = /** @type {HTMLInputElement} */ (inp);
    i.checked = i.value === s.difficulty;
  });
  els.formSettings.querySelectorAll(`input[name="winMode"]`).forEach((inp) => {
    const i = /** @type {HTMLInputElement} */ (inp);
    i.checked = i.value === s.winMode;
  });
  els.inputTargetScore.value = String(s.targetScore);
  els.inputTargetMinutes.value = String(s.targetMinutes);
  els.checkSound.checked = s.sound;
  els.checkReduceMotion.checked = s.reduceMotion;
  els.modalSettings.hidden = false;
}

function closeSettings() {
  els.modalSettings.hidden = true;
}

document.getElementById("btnSettings")?.addEventListener("click", openSettings);
document.getElementById("btnCancelSettings")?.addEventListener("click", closeSettings);
els.modalSettings.querySelector("[data-close]")?.addEventListener("click", closeSettings);
document.getElementById("btnStart")?.addEventListener("click", () => {
  if (game.running) return;
  startGame();
});

els.btnDehumidifier.addEventListener("click", () => {
  if (!game.running) return;
  game.dehumidifierOn = !game.dehumidifierOn;
  updateDehumidifierUi();
  beep(game.dehumidifierOn ? 600 : 320, 0.04);
});

els.formSettings.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(els.formSettings);
  const lang = fd.get("language");
  const diff = fd.get("difficulty");
  const wm = fd.get("winMode");
  settings = saveSettings({
    languagePref: lang === "vi" || lang === "en" ? lang : "auto",
    difficulty: diff === "easy" || diff === "hard" ? diff : "normal",
    winMode: wm === "time" ? "time" : "score",
    targetScore: Math.max(50, Number(els.inputTargetScore.value) || 1000),
    targetMinutes: Math.max(1, Number(els.inputTargetMinutes.value) || 3),
    sound: els.checkSound.checked,
    reduceMotion: els.checkReduceMotion.checked,
  });
  locale = resolveLocale(settings.languagePref, navigator.language || "en");
  applyI18n();
  applyReduceMotion();
  closeSettings();
});

document.getElementById("btnOverlayClose")?.addEventListener("click", () => {
  els.overlayEnd.hidden = true;
});

function init() {
  settings = loadSettings();
  if (settings.languagePref === "auto") {
    locale = browserLocale(navigator.language || "en");
  } else {
    locale = settings.languagePref;
  }
  applyReduceMotion();
  applyI18n();
  renderHighScores();
}

init();
