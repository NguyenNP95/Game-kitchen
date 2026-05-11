const { browserLocale, resolveLocale, t, tf, difficultyLabel, winModeLabel } = window.MKitchen.i18n;
const { loadSettings, saveSettings, loadHighScores, pushHighScore } = window.MKitchen.storage;
const {
  OPENED_CANNED_HOURS,
  diffMult,
  humidityRamp,
  gameHoursToMs,
  msToGameHours,
  formatGameClock,
  pickSpawn,
} = window.MKitchen.foods;

let settings = loadSettings();
let locale = resolveLocale(settings.languagePref, navigator.language || "en");

const els = {
  saved: document.getElementById("savedValue"),
  wasted: document.getElementById("wastedValue"),
  score: document.getElementById("scoreValue"),
  goalStat: document.getElementById("goalStat"),
  timerStat: document.getElementById("timerStat"),
  timer: document.getElementById("timerValue"),
  gameClock: document.getElementById("gameClockValue"),
  humidity: document.getElementById("humidityBar"),
  hygiene: document.getElementById("hygieneBar"),
  btnDehumidifier: document.getElementById("btnDehumidifier"),
  dehumidifierStatus: document.getElementById("dehumidifierStatus"),
  highScoreList: document.getElementById("highScoreList"),
  modalSettings: document.getElementById("modalSettings"),
  formSettings: document.getElementById("formSettings"),
  inputTargetScore: document.getElementById("inputTargetScore"),
  inputTargetMinutes: document.getElementById("inputTargetMinutes"),
  checkSound: document.getElementById("checkSound"),
  checkReduceMotion: document.getElementById("checkReduceMotion"),
  overlayEnd: document.getElementById("overlayEnd"),
  endTitle: document.getElementById("endTitle"),
  endMessage: document.getElementById("endMessage"),
  scene: document.querySelector(".kitchen-scene"),
  itemsLayer: document.getElementById("itemsLayer"),
  puddlesLayer: document.getElementById("puddlesLayer"),
  counter: document.getElementById("dropCounter"),
  zoneFridge: document.getElementById("zoneFridge"),
  zoneJar: document.getElementById("zoneJar"),
  zoneCanned: document.getElementById("zoneCanned"),
  zoneTrash: document.getElementById("zoneTrash"),
  zoneSponge: document.getElementById("zoneSponge"),
  chefWalker: document.getElementById("chefWalker"),
  chefSprite: document.getElementById("chefSprite"),
  chefCarry: document.getElementById("chefCarry"),
};

let audioCtx = null;
let sunLayer = null;     // lazily created inside counter-top

function beep(freq, duration, vol = 0.06) {
  if (!settings.sound) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g);
    g.connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + duration);
  } catch { }
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
  els.scene.classList.toggle("is-damp", game.humidity > 55);
}

const game = {
  running: false,
  saved: 0,
  wasted: 0,
  humidity: 22,
  hygiene: 100,
  dehumidifierOn: false,
  winMode: "score",
  targetScore: 25,
  targetMs: 180000,
  elapsedMs: 0,
  difficulty: "normal",
  spawnAcc: 0,
  puddleAcc: 0,
  sunRefreshAcc: 0,
  items: new Map(),     // id → { def, group, opened, spoiled, age, spoilMs, zone, inSun, el }
  puddles: new Map(),   // id → { el }
  sunPatches: new Map(),// id → { el, leftPct, topPct, wPct, hPct }
  selectedItemId: null,
  chefBusy: false,
  chefX: 50,
  chefY: 60,
};

/* =========================================================
   Chef movement
   ========================================================= */

function getFloorStage() {
  return els.chefWalker.parentElement;  // .floor-stage
}

function getPctInStage(el) {
  const er = el.getBoundingClientRect();
  const sr = getFloorStage().getBoundingClientRect();
  const cx = er.left - sr.left + er.width / 2;
  const cy = er.top - sr.top + er.height / 2;
  return {
    x: (cx / Math.max(1, sr.width)) * 100,
    y: (cy / Math.max(1, sr.height)) * 100,
  };
}

function setChefPosition(xPct, yPct) {
  const x = Math.max(8, Math.min(92, xPct));
  const y = Math.max(20, Math.min(85, yPct));
  game.chefX = x;
  game.chefY = y;
  els.chefWalker.style.left = `${x}%`;
  els.chefWalker.style.top = `${y}%`;
  els.chefWalker.style.zIndex = String(Math.floor(y));
}

function chefWalkTo(targetEl) {
  return new Promise((resolve) => {
    if (!els.chefWalker || !targetEl) return resolve();
    const { x, y } = getPctInStage(targetEl);
    const approachY = Math.min(85, y + 14);
    els.chefWalker.classList.add("walking");
    setChefPosition(x, approachY);
    setTimeout(() => {
      els.chefWalker.classList.remove("walking");
      resolve();
    }, 720);
  });
}

function chefPickUp(foodEl, emoji) {
  els.chefCarry.textContent = emoji;
  els.chefCarry.classList.add("carrying");
  foodEl.style.transition = "transform 0.3s ease, opacity 0.3s";
  foodEl.style.transform = "scale(0)";
  foodEl.style.opacity = "0";
}

function chefDrop() {
  els.chefCarry.classList.remove("carrying");
  els.chefCarry.textContent = "";
}

function chefReturnHome() {
  els.chefWalker.classList.add("walking");
  setChefPosition(50, 60);
  setTimeout(() => {
    els.chefWalker.classList.remove("walking");
  }, 720);
}

/* =========================================================
   Selection / drop logic
   ========================================================= */

function getValidZones(itemId) {
  const st = game.items.get(itemId);
  if (!st) return ['trash'];
  if (st.spoiled) return ['trash'];
  return [st.zone, 'trash'];
}

function zoneEl(zone) {
  if (zone === 'fridge') return els.zoneFridge;
  if (zone === 'jar') return els.zoneJar;
  if (zone === 'canned') return els.zoneCanned;
  if (zone === 'trash') return els.zoneTrash;
  return null;
}

function selectItem(id) {
  if (!game.running) return;
  if (game.selectedItemId === id) {
    deselectItem();
    return;
  }
  deselectItem();
  game.selectedItemId = id;
  const st = game.items.get(id);
  if (!st) return;
  st.el.classList.add("selected");
  for (const zone of getValidZones(id)) {
    const el = zoneEl(zone);
    if (el) el.classList.add("highlight");
  }
  chefWalkTo(st.el);
  beep(680, 0.04, 0.04);
}

function deselectItem() {
  if (game.selectedItemId) {
    const st = game.items.get(game.selectedItemId);
    if (st && st.el) st.el.classList.remove("selected");
  }
  game.selectedItemId = null;
  document.querySelectorAll(".drop-zone.highlight").forEach((el) => el.classList.remove("highlight"));
}

function dropToZone(zone) {
  if (!game.running) return;
  const id = game.selectedItemId;
  if (!id) return;
  const st = game.items.get(id);
  if (!st) return;

  const valid = getValidZones(id);
  if (!valid.includes(zone)) {
    // Wrong zone — count as wasted with extra hit if mixing spoiled into storage.
    if (st.spoiled && zone !== 'trash') {
      // Mixing spoiled food into a storage zone — biggest penalty
      registerWasted(st.el, "popMixed", -15);
    } else {
      registerWasted(st.el, "popWasted", -4);
    }
    _removeItem(id);
    deselectItem();
    return;
  }

  const targetEl = zoneEl(zone);
  chefPickUp(st.el, st.def.emoji);
  chefWalkTo(targetEl).then(() => {
    chefDrop();
    setTimeout(chefReturnHome, 220);
  });

  onDropComplete(id, zone);
  deselectItem();
}

function onDropComplete(itemId, zone) {
  const st = game.items.get(itemId);
  if (!st) return;
  const el = st.el;

  if (zone === 'trash') {
    if (st.spoiled) {
      // Cleanup: not "saved" but doesn't add to wasted (already counted when it spoiled).
      game.hygiene = Math.min(100, game.hygiene + 6);
      popText(el, "+6 ✦", "gain");
      flashMeter("hygiene");
      beep(520, 0.07);
    } else {
      // Trashing fresh food → wasted
      registerWasted(el, "popWasted", -4);
    }
    _removeItem(itemId);
    return;
  }

  if (st.spoiled) return; // safety; spoiled can't reach non-trash because of getValidZones

  if (zone === st.zone) {
    registerSaved(el);
    _removeItem(itemId);
  }
}

function registerSaved(el) {
  game.saved += 1;
  game.hygiene = Math.min(100, game.hygiene + 2);
  els.saved.textContent = String(game.saved);
  popText(el, t(locale, "popSaved"), "gain");
  flashMeter("hygiene");
  updateNet();
  beep(660, 0.06);
  checkWin();
}

function registerWasted(el, popKey, hygieneDelta) {
  game.wasted += 1;
  game.hygiene = Math.max(0, game.hygiene + hygieneDelta);
  els.wasted.textContent = String(game.wasted);
  const variant = popKey === "popMixed" ? "warn" : "loss";
  popText(el, t(locale, popKey), variant);
  flashMeter("humidity");
  updateNet();
  beep(180, 0.08, 0.05);
}

function updateNet() {
  const net = game.saved - game.wasted;
  els.score.textContent =
    game.running && game.winMode === "score"
      ? `${net} / ${game.targetScore}`
      : String(net);
}

/* =========================================================
   Spoilage triggered by the 4-hour rule (auto)
   ========================================================= */

function markSpoiled(st) {
  st.spoiled = true;
  st.el.classList.add("spoiled");
  const badge = st.el.querySelector(".food-badge");
  if (badge) {
    badge.textContent = "✗";
    badge.className = "food-badge spoiled";
  }
  // Auto-spoil counts as wasted (player failed to save it in time)
  game.wasted += 1;
  els.wasted.textContent = String(game.wasted);
  game.hygiene = Math.max(0, game.hygiene - 5);
  popText(st.el, t(locale, "popWasted"), "loss");
  flashMeter("humidity");
  updateNet();
  beep(140, 0.12, 0.07);
}

function onWipeComplete(puddleId) {
  if (!game.running) return;
  const p = game.puddles.get(puddleId);
  if (!p) return;

  const targetPos = getPctInStage(p.el);
  popText(p.el, "+6 ✦", "gain");
  game.humidity = Math.max(0, game.humidity - 4);
  game.hygiene = Math.min(100, game.hygiene + 6);
  flashMeter("hygiene");
  beep(500, 0.05);
  removePuddle(puddleId);

  els.chefWalker.classList.add("walking");
  setChefPosition(targetPos.x, Math.min(85, targetPos.y + 6));
  setTimeout(() => {
    els.chefWalker.classList.remove("walking");
    setTimeout(chefReturnHome, 400);
  }, 720);
}

function _removeItem(id) {
  const st = game.items.get(id);
  if (st && st.el) st.el.remove();
  game.items.delete(id);
}

function removePuddle(id) {
  const p = game.puddles.get(id);
  if (p && p.el) p.el.remove();
  game.puddles.delete(id);
}

function popText(anchor, text, kind, offsetY = 0) {
  if (settings.reduceMotion) return;
  const el = document.createElement("div");
  el.className = `pop-text ${kind}`;
  el.textContent = text;
  const anchorRect = anchor.getBoundingClientRect();
  const sceneRect = els.scene.getBoundingClientRect();
  el.style.left = `${anchorRect.left - sceneRect.left + anchorRect.width / 2 - 20}px`;
  el.style.top = `${anchorRect.top - sceneRect.top + offsetY}px`;
  els.scene.appendChild(el);
  setTimeout(() => el.remove(), 950);
}

function flashMeter(which) {
  const el = which === "hygiene" ? els.hygiene : els.humidity;
  el.classList.remove("flash-gain", "flash-loss");
  void el.offsetWidth;
  el.classList.add(which === "hygiene" ? "flash-gain" : "flash-loss");
}

function checkWin() {
  if (!game.running) return;
  const net = game.saved - game.wasted;
  if (game.winMode === "score" && net >= game.targetScore) endGame(true, "score");
}

/* =========================================================
   Sun patches (counter-top)
   ========================================================= */

function ensureSunLayer() {
  if (sunLayer && sunLayer.isConnected) return sunLayer;
  sunLayer = document.createElement("div");
  sunLayer.className = "sun-layer";
  // Insert before items-layer so items render on top of the sun glow
  els.counter.insertBefore(sunLayer, els.itemsLayer);
  return sunLayer;
}

function clearSunPatches() {
  for (const id of [...game.sunPatches.keys()]) {
    const p = game.sunPatches.get(id);
    if (p && p.el) p.el.remove();
    game.sunPatches.delete(id);
  }
}

function spawnSunPatches() {
  ensureSunLayer();
  clearSunPatches();
  const count = Math.random() < 0.35 ? 2 : 1;
  for (let i = 0; i < count; i++) {
    const wPct = 26 + Math.random() * 12;          // 26-38% of counter width
    const hPct = 60 + Math.random() * 25;          // 60-85% of counter height
    const leftPct = Math.random() * (100 - wPct);
    const topPct = Math.random() * (100 - hPct);
    const id = `sun_${Date.now()}_${i}`;
    const el = document.createElement("div");
    el.className = "sun-patch";
    el.style.left = `${leftPct}%`;
    el.style.top = `${topPct}%`;
    el.style.width = `${wPct}%`;
    el.style.height = `${hPct}%`;
    sunLayer.appendChild(el);
    game.sunPatches.set(id, { el, leftPct, topPct, wPct, hPct });
  }
}

function updateInSunFlags() {
  if (!game.sunPatches.size) {
    for (const [, st] of game.items) {
      if (st.inSun) {
        st.inSun = false;
        st.el.classList.remove("in-sun");
      }
    }
    return;
  }
  const patches = [];
  for (const [, p] of game.sunPatches) {
    patches.push(p.el.getBoundingClientRect());
  }
  for (const [, st] of game.items) {
    const ir = st.el.getBoundingClientRect();
    let overlap = false;
    for (const pr of patches) {
      if (ir.left < pr.right && ir.right > pr.left && ir.top < pr.bottom && ir.bottom > pr.top) {
        overlap = true;
        break;
      }
    }
    if (overlap !== st.inSun) {
      st.inSun = overlap;
      st.el.classList.toggle("in-sun", overlap);
    }
  }
}

/* =========================================================
   Spawning food
   ========================================================= */

function randomCounterPos() {
  const rect = els.counter.getBoundingClientRect();
  const w = rect.width || 400;
  const h = rect.height || 130;
  const itemW = 56, itemH = 64;
  const margin = 12;
  return {
    x: margin + Math.random() * Math.max(1, w - margin * 2 - itemW),
    y: margin + Math.random() * Math.max(1, h - margin * 2 - itemH),
  };
}

function randomFloorPos() {
  const rect = els.puddlesLayer.getBoundingClientRect();
  const w = rect.width || 400;
  const h = rect.height || 150;
  return {
    x: 16 + Math.random() * Math.max(1, w - 80),
    y: 10 + Math.random() * Math.max(1, h - 36),
  };
}

function spawnItem() {
  const { def, preSpoiled } = pickSpawn();
  const id = `it_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // 25% of canOpen-eligible cans spawn already opened — must go cold within 2 game-hours.
  // Pre-spoiled items skip the opened roll (the spoil state already overrides routing).
  const opened = !preSpoiled && !!(def.canOpen && Math.random() < 0.25);
  const hours = opened ? OPENED_CANNED_HOURS : def.hours;
  const zone = opened ? "fridge" : def.zone;
  const spoilMs = gameHoursToMs(hours, game.difficulty) / (game.dehumidifierOn ? 1.15 : 1);

  let initialAge = 0;
  if (!preSpoiled && game.items.size >= 3 && Math.random() < 0.22) {
    initialAge = spoilMs * (0.35 + Math.random() * 0.4);
  }

  const pos = randomCounterPos();
  const el = document.createElement("button");
  el.type = "button";
  el.className = "food-item" + (opened ? " opened" : "") + (preSpoiled ? " spoiled" : "");
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y}px`;
  el.dataset.id = id;
  el.setAttribute("aria-label", t(locale, def.nameKey) || def.id);

  const badgeClass = preSpoiled ? "food-badge spoiled" : `food-badge ${def.group}`;
  const badgeIcon = preSpoiled ? "✗" : badgeIconFor(def.group, opened, zone);
  const ageWidth = preSpoiled ? 100 : (initialAge / spoilMs) * 100;
  el.innerHTML = `
    <span class="food-sprite" data-emoji="${def.emoji}"></span>
    <span class="${badgeClass}">${badgeIcon}</span>
    <div class="age-bar"><div class="age-fill" style="width:${ageWidth}%"></div></div>
  `;
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    selectItem(id);
  });
  els.itemsLayer.appendChild(el);

  game.items.set(id, {
    def,
    group: def.group,
    opened,
    spoiled: !!preSpoiled,
    age: preSpoiled ? spoilMs : initialAge,
    spoilMs,
    zone,
    inSun: false,
    el,
  });

  if (preSpoiled) popText(el, t(locale, "foodTipSpoiled"), "loss");
  else if (opened) popText(el, t(locale, "popOpened"), "warn");
}

function badgeIconFor(group, opened, zone) {
  if (opened) return "!";
  if (zone === "fridge") return "❄";
  if (zone === "canned") return "▣";
  if (zone === "jar") return "◉";
  return "•";
}

function spawnPuddle() {
  const id = `pd_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
  const pos = randomFloorPos();
  const el = document.createElement("button");
  el.type = "button";
  el.className = "puddle";
  el.style.left = `${pos.x}px`;
  el.style.top = `${pos.y}px`;
  el.setAttribute("aria-label", "Puddle");
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    onWipeComplete(id);
  });
  els.puddlesLayer.appendChild(el);
  game.puddles.set(id, { id, el });
}

/* =========================================================
   Tick
   ========================================================= */

let lastTime = 0;
let rafId = 0;

function loop(time) {
  if (!lastTime) lastTime = time;
  const dt = Math.min(0.1, (time - lastTime) / 1000);
  lastTime = time;
  if (game.running) tick(dt);
  rafId = requestAnimationFrame(loop);
}

function tick(dt) {
  const dtMs = dt * 1000;
  const dm = diffMult(game.difficulty);
  const hr = humidityRamp(game.difficulty);
  let hRamp = (hr * dtMs) / 1000;
  if (game.dehumidifierOn) hRamp *= 0.52;
  game.humidity = Math.min(100, game.humidity + hRamp);

  let baseSpoilRate = 1 / (game.dehumidifierOn ? 1.2 : 1);
  baseSpoilRate *= 1 + game.humidity / 130;

  updateInSunFlags();

  for (const [, st] of game.items) {
    if (st.spoiled) continue;
    const sunBoost = st.inSun ? 2 : 1;
    st.age += dtMs * baseSpoilRate * sunBoost;
    if (st.age >= st.spoilMs) {
      markSpoiled(st);
      continue;
    }
    const ratio = Math.min(1, st.age / st.spoilMs);
    const fill = st.el.querySelector(".age-fill");
    if (fill) fill.style.width = `${ratio * 100}%`;
    st.el.classList.toggle("aging", ratio >= 0.5 && ratio < 0.85);
    st.el.classList.toggle("critical", ratio >= 0.85 && !st.spoiled);
  }

  let hygieneDrain = 0;
  for (const [, st] of game.items) {
    if (st.spoiled) hygieneDrain += (8 * dtMs) / 1000;
  }
  hygieneDrain += (game.puddles.size * 4 * dtMs) / 1000;
  if (!game.dehumidifierOn) hygieneDrain += ((game.difficulty === "hard" ? 1.4 : 0.6) * dtMs) / 1000;
  game.hygiene = Math.max(0, game.hygiene - hygieneDrain);

  game.spawnAcc += dtMs;
  const spawnEvery = game.dehumidifierOn ? 3600 / dm : 2800 / dm;
  if (game.spawnAcc >= spawnEvery && game.items.size < 7) {
    game.spawnAcc = 0;
    spawnItem();
  }

  game.puddleAcc += dtMs;
  const puddleEvery = (game.dehumidifierOn ? 5000 : 4200) / dm;
  if (game.humidity > 28 && game.puddleAcc >= puddleEvery && game.puddles.size < 5) {
    game.puddleAcc = 0;
    spawnPuddle();
  }

  // Refresh sun patches every ~25 seconds real
  game.sunRefreshAcc += dtMs;
  if (game.sunRefreshAcc >= 25000) {
    game.sunRefreshAcc = 0;
    spawnSunPatches();
  }

  game.elapsedMs += dtMs;
  els.gameClock.textContent = formatGameClock(msToGameHours(game.elapsedMs, game.difficulty));

  if (game.winMode === "time") {
    const left = Math.max(0, game.targetMs - game.elapsedMs);
    els.timer.textContent = tf(locale, "goalTimeCountdown", left);
    if (game.elapsedMs >= game.targetMs) endGame(true, "time");
  }

  updateMeters();
  els.scene.classList.toggle("is-damp", game.humidity > 55);

  if (game.humidity >= 100) endGame(false, "humidity");
  if (game.hygiene <= 0) endGame(false, "hygiene");
}

function updateMeters() {
  els.humidity.style.width = `${game.humidity}%`;
  els.hygiene.style.width = `${game.hygiene}%`;
}

function resetRound() {
  game.running = false;
  game.saved = 0;
  game.wasted = 0;
  game.humidity = 18 + Math.random() * 8;
  game.hygiene = 100;
  game.dehumidifierOn = false;
  game.spawnAcc = 0;
  game.puddleAcc = 0;
  game.sunRefreshAcc = 0;
  game.elapsedMs = 0;
  els.saved.textContent = "0";
  els.wasted.textContent = "0";
  els.score.textContent = "0";
  els.gameClock.textContent = "0:00";
  deselectItem();
  for (const id of [...game.items.keys()]) _removeItem(id);
  for (const id of [...game.puddles.keys()]) removePuddle(id);
  clearSunPatches();
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
  game.targetScore = Math.max(1, settings.targetScore);
  game.targetMs = Math.max(60000, settings.targetMinutes * 60000);
  els.timerStat.hidden = settings.winMode !== "time";

  if (settings.winMode === "score") {
    els.score.textContent = `0 / ${game.targetScore}`;
  } else {
    els.timer.textContent = tf(locale, "goalTimeCountdown", game.targetMs);
  }

  document.getElementById("btnStart")?.setAttribute("disabled", "true");
  spawnSunPatches();
  for (let i = 0; i < 3; i++) spawnItem();
  beep(440, 0.05);
}

function endGame(win, reason) {
  if (!game.running) return;
  game.running = false;
  document.getElementById("btnStart")?.removeAttribute("disabled");
  deselectItem();

  const net = game.saved - game.wasted;
  const stats = tf(locale, "endStats", game.saved, game.wasted, net);

  if (win) {
    beep(880, 0.1);
    setTimeout(() => beep(990, 0.08), 120);
    els.endTitle.textContent = t(locale, "victoryTitle");
    els.endMessage.textContent =
      `${stats}`;
    pushHighScore({
      score: net,
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
      `${stats}`;
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
        locale, "scoreLine", r.score,
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
    inp.checked = inp.value === s.languagePref;
  });
  els.formSettings.querySelectorAll(`input[name="difficulty"]`).forEach((inp) => {
    inp.checked = inp.value === s.difficulty;
  });
  els.formSettings.querySelectorAll(`input[name="winMode"]`).forEach((inp) => {
    inp.checked = inp.value === s.winMode;
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

/* =========================================================
   Event wiring
   ========================================================= */

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

[els.zoneFridge, els.zoneJar, els.zoneCanned, els.zoneTrash].forEach((zoneElNode) => {
  if (!zoneElNode) return;
  zoneElNode.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!game.selectedItemId) return;
    dropToZone(zoneElNode.dataset.zone);
  });
});

els.zoneSponge.addEventListener("click", (e) => {
  e.stopPropagation();
  if (!game.running) return;
  const ids = [...game.puddles.keys()];
  if (ids.length) onWipeComplete(ids[0]);
});

els.scene.addEventListener("click", () => {
  deselectItem();
});

els.formSettings.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(els.formSettings);
  const lang = fd.get("language");
  const diff = fd.get("difficulty");
  const wm = fd.get("winMode");
  const rawTarget = Number(els.inputTargetScore.value);
  const target = Number.isFinite(rawTarget) && rawTarget > 0 ? rawTarget : 25;
  settings = saveSettings({
    languagePref: lang === "vi" || lang === "en" ? lang : "auto",
    difficulty: diff === "easy" || diff === "hard" ? diff : "normal",
    winMode: wm === "time" ? "time" : "score",
    targetScore: Math.max(1, Math.min(200, target)),
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

/* =========================================================
   Init
   ========================================================= */

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
  rafId = requestAnimationFrame(loop);
}

init();
