# Managing Humidity in the Kitchen

> Game web nhỏ về quản lý độ ẩm và bảo quản thực phẩm trong gian bếp Việt.
> Người chơi nhập vai một bếp trưởng, phải phân loại đúng các nhóm thực phẩm vào
> ba kho lưu trữ (Tủ lạnh / Đồ khô / Tủ đồ hộp), lau vũng nước, vứt đồ hỏng và
> giữ độ ẩm – vệ sinh trong tầm kiểm soát.

Demo cục bộ:

```bash
python -m http.server 5500
# mở http://127.0.0.1:5500
```

Không có bước build. Mở trực tiếp `index.html` trong trình duyệt cũng chạy được
(chỉ cần sound/AudioContext có thể yêu cầu user gesture đầu tiên).

---

## Mục lục

- [Ý tưởng](#ý-tưởng)
- [Bố cục giao diện](#bố-cục-giao-diện)
- [Cách chơi](#cách-chơi)
- [Cách tính điểm](#cách-tính-điểm)
- [Tính năng](#tính-năng)
- [Cài đặt](#cài-đặt)
- [Thiết kế code](#thiết-kế-code)
- [Triển khai code](#triển-khai-code)
- [Phát triển thêm](#phát-triển-thêm)

---

## Ý tưởng

Game dạy người chơi 4 kỹ năng bảo quản thực phẩm chống ẩm trong bếp nhà:

1. **Phân nhóm thực phẩm** đúng vùng cất (lạnh / khô / đồ hộp).
2. **Quy tắc 4 giờ ở nhiệt độ phòng** — món nào để ngoài ở khoảng 5–60 °C
   quá 4 giờ thì bắt buộc bỏ.
3. **Tránh ẩm ướt và ánh nắng** — vùng nắng làm món hỏng nhanh gấp đôi;
   vũng nước trên sàn làm tăng độ ẩm và hạ vệ sinh.
4. **Không trộn đồ hỏng vào đồ tươi** — đưa đồ đã hỏng vào tủ là bị phạt nặng.

Mục tiêu thiết kế: gameplay nhẹ, chơi 1-3 phút mỗi ván, có hai chế độ thắng
(điểm số & sống sót), dễ chơi trên cả desktop lẫn cảm ứng.

---

## Bố cục giao diện

```
┌───────────────────────────────────────────────────────────────┐
│ HUD: tiêu đề · Saved · Wasted · Net · Giờ bếp · [Time]        │
│      Độ ẩm  ████████░░   Vệ sinh ███████████░                │
│                                          [Settings] [Start]  │
├───────────────────────────────────────────────────────────────┤
│ Tip-bar (mẹo nhanh)                                           │
├──────────────────────────────────────────────┬────────────────┤
│ Kitchen scene (perspective oblique top-down) │ Side panel     │
│ ┌───────[Counter — món spawn ở đây]────────┐ │ • Top 5        │
│ │ ☀ vùng nắng    ☀ vùng nắng              │ │ • Máy hút ẩm   │
│ │ 🍅 🥩 🥫 🥚 ...                          │ │                │
│ └────────────────────────────────────────────┘ │                │
│  🧊 Tủ lạnh                  Tủ đồ khô 🫙    │                │
│   (meat/dairy/produce)        (grain/nuts)    │                │
│                                               │                │
│         🥫 Tủ đồ hộp (sealed cans)            │                │
│                                               │                │
│  🚿 Bồn rửa (lau vũng)        Thùng rác 🗑    │                │
│  [chef di chuyển tự do giữa các vị trí]      │                │
└──────────────────────────────────────────────┴────────────────┘
```

- **HUD**: 3 chip thống kê chính (Saved / Wasted / Net) + chip Giờ bếp + chip
  Time countdown (chỉ ở Time mode), 2 thanh đo Humidity / Hygiene, nút Start &
  Settings.
- **Tip-bar**: 6 mẹo nhỏ, chỉ là nhắc nhở UI.
- **Kitchen scene**: 1 counter ở trên cùng, 5 vùng cất xếp theo hình chữ U:
  Tủ lạnh (trái-trên), Tủ đồ khô (phải-trên), Tủ đồ hộp (giữa-dưới), Bồn rửa
  (trái-dưới), Thùng rác (phải-dưới). Chef vẽ bằng SVG inline, di chuyển bằng
  cách thay đổi `top%`/`left%` rồi animate qua CSS transition.
- **Side panel**: bảng Top 5 điểm cao trên thiết bị + nút bật/tắt máy hút ẩm.

---

## Cách chơi

1. Bấm **Start** để vào ván.
2. Trên counter sẽ liên tục spawn các món ăn thuộc 5 nhóm khác nhau:
   - 🥩 **Thịt tươi** (gà, bò, cá, tôm) — Tủ lạnh
   - 🥚 **Sữa & trứng** — Tủ lạnh
   - 🥬 **Rau củ quả tươi** — Tủ lạnh
   - 🍚 **Ngũ cốc & hạt khô** (gạo, đậu phộng, hạt điều, miến, đậu) — Đồ khô
   - 🥫 **Đồ hộp & gia vị** (thịt hộp, pa-tê, cá hộp, nước mắm) — Tủ đồ hộp
3. **Nhấp một món** trên counter → các vùng cất đúng sẽ sáng lên + Chef đi tới.
4. **Nhấp tiếp vào vùng cất** đúng để hoàn tất; nếu sai → bị phạt.
5. **Vũng nước** xuất hiện trên sàn theo thời gian — nhấp để lau.
6. **Đồ đã hỏng** (badge `✗`) phải bỏ vào **Thùng rác**, không được cho vào tủ.

### Các trạng thái đặc biệt

| Trạng thái        | Ký hiệu | Hành xử                                         |
|-------------------|---------|-------------------------------------------------|
| Đồ tươi           | ❄ / ◉ / ▣ theo zone | Cất đúng nơi |
| Đồ hộp đã mở      | `!` đỏ | Phải đưa **Tủ lạnh** (chứ không phải tủ đồ hộp), thời hạn chỉ 2 giờ game |
| Đồ trong vùng nắng| ☀ rung | Hỏng nhanh gấp đôi; ưu tiên cất sớm |
| Đồ đã hỏng        | `✗`   | Chỉ được vứt **Thùng rác** |

### Bị thua

- Độ ẩm chạm 100% → **Mold wins**.
- Vệ sinh về 0 → **Hygiene collapsed**.

---

## Cách tính điểm

Game dùng cơ chế **Saved – Wasted – Net** thay cho điểm số rời rạc.

| Hành động                                               | Saved | Wasted | Hygiene |
|---------------------------------------------------------|-------|--------|---------|
| Cất món tươi đúng vùng                                  | +1    | —      | +2      |
| Vứt món đã hỏng vào Thùng rác                           | —     | —      | +6      |
| Lau vũng nước                                           | —     | —      | +6, độ ẩm −4 |
| Để món tự hỏng (quá 4 giờ ở nhiệt độ phòng)             | —     | +1     | −5      |
| Vứt món còn tươi vào Thùng rác (lãng phí)               | —     | +1     | −4      |
| Cất món vào sai vùng (ví dụ thịt vào đồ khô)            | —     | +1     | −4      |
| **Trộn đồ hỏng vào tủ** (cất món hỏng vào fridge/jar/canned) | —     | +1     | **−15** |

**Net = Saved − Wasted**

- **Score mode**: thắng khi `Net ≥ Target` (mặc định 25). HUD hiển thị
  `12 / 25` trên chip Net.
- **Time mode**: chơi đủ N phút thực; thắng nếu sống sót, kết quả là Net.

Khi thắng, Net được lưu vào leaderboard cục bộ (Top 5).

---

## Tính năng

- 🌐 **Đa ngôn ngữ**: Tiếng Việt / English (auto theo trình duyệt).
- 🎚 **3 mức độ khó**: Easy / Normal / Hard. Ảnh hưởng tốc độ ẩm, tốc độ hỏng,
  tần suất spawn.
- 🏆 **Leaderboard cục bộ**: lưu Top 5 trên `localStorage` của thiết bị.
- ⏱ **Hai chế độ thắng**: theo điểm Net (Score) hoặc theo thời gian sống sót (Time).
- 💧 **Máy hút ẩm**: nút bật/tắt ở side panel — giảm tốc độ ẩm, hỏng và spawn.
- ☀ **Vùng nắng**: 1-2 ô vàng trên counter, refresh mỗi ~25 s, làm món bên trong
  hỏng gấp đôi.
- 🥫 **Đồ hộp đã mở**: 25% lon eligible spawn ở trạng thái đã mở, chuyển hướng từ
  tủ đồ hộp sang tủ lạnh.
- ⚠ **Đồ hỏng spawn sẵn**: 12% lượt spawn ra món đã hỏng → buộc người chơi quan
  tâm tới Thùng rác.
- 🕒 **Đồng hồ giờ bếp**: 1 giờ game ≈ 7.5 s thực (Normal), HUD hiển thị `H:MM`.
- 🎨 **Reduce-motion**: tắt animation/transition cho người dùng nhạy cảm chuyển động.
- 🔇 **Toggle âm thanh**: tự tạo bằng `AudioContext`, không cần file âm thanh.

---

## Cài đặt

Mở popup **Settings** từ HUD:

| Mục            | Giá trị                                  | Ghi chú |
|----------------|------------------------------------------|---------|
| Language       | Auto / Tiếng Việt / English              | Auto = đọc `navigator.language` |
| Difficulty     | Easy / Normal / Hard                     | Mặc định Normal |
| Win condition  | Reach saved target / Hold the kitchen    | Toggle giữa Score & Time mode |
| Target net saved | 5–200, mặc định 25                      | Chỉ áp dụng cho Score mode |
| Minutes        | 1–60, mặc định 3                          | Chỉ áp dụng cho Time mode |
| Sound on       | bật/tắt                                  | Bật mặc định |
| Reduce motion  | bật/tắt                                  | Tắt mặc định |

Cài đặt được lưu vào `localStorage` dưới key `mkitchen_settings_v1`.
Top 5 điểm cao lưu ở key `mkitchen_scores_v1`.

---

## Thiết kế code

Game thuần **HTML + CSS + Vanilla JavaScript** (ES2020), không build step,
không framework, không dependency runtime ngoài Google Fonts.

### Cấu trúc thư mục

```
Game-kitchen/
├── index.html          # Markup + cấu trúc DOM
├── style.css           # Toàn bộ style (~1900 dòng, có CSS variables)
├── README.md
├── assets/             # PNG cho food/character/UI (có fallback emoji)
└── js/
    ├── i18n.js         # Bộ string vi/en + helper t(), tf()
    ├── storage.js      # Wrapper localStorage cho settings & scores
    ├── foods.js        # Catalog 22 món + helpers thời gian / spawn
    ├── sprite.js       # (optional) animate spritesheet cho chef
    └── app.js          # Game loop, state, event wiring
```

### Nguyên tắc thiết kế

- **Không framework, không build**: chỉ cần một static server bất kỳ là chạy.
  Mỗi file JS là một IIFE đăng ký vào namespace `window.MKitchen.*`, không
  có module bundler.
- **Tách concern theo file**:
  - `i18n.js` – tất cả string đa ngôn ngữ
  - `storage.js` – persistence (localStorage)
  - `foods.js` – data + công thức thời gian (pure)
  - `app.js` – state máy + game loop + DOM
- **Game state là một object thường** (`game = { saved, wasted, items: Map, ... }`).
  Không reactive, render bằng cách trực tiếp set `textContent` / class trong tick
  hoặc trong handler.
- **Dữ liệu không sống trong DOM**: mỗi món ăn có một bản ghi state trong
  `game.items` (Map id→state) song hành với DOM element. Tham chiếu element
  qua `state.el` để đỡ phải `querySelector` lại.
- **Pixel + percent hybrid**: counter / floor dùng `%` để responsive; vị trí
  món / vũng nước cụ thể dùng `px` (vì cần precise placement). Bounding box
  giao nhau dùng `getBoundingClientRect` cho cả hai để tránh sai số đơn vị.
- **CSS-first animation**: chuyển động dùng CSS transition + keyframes
  (`transform`, `opacity`). JS chỉ thay class hoặc `top%/left%`. Mọi animation
  có thể tắt qua class `body.reduce-motion`.

### Mô hình dữ liệu

```js
// Một món ăn (ngầm hiểu là on-counter)
itemState = {
  def,            // FoodDef từ FOOD_CATALOG
  group,          // 'meat' | 'dairy' | 'produce' | 'grain' | 'canned'
  opened,         // true ⇔ canned đã mở (chỉ áp dụng cho group=canned)
  spoiled,        // true ⇔ quá 4h hoặc spawn pre-spoiled
  age,            // ms đã ở counter
  spoilMs,        // ms tới khi spoil (đã trừ bù dehumidifier)
  zone,           // vùng cất đúng: 'fridge' | 'jar' | 'canned'
  inSun,          // có đang nằm trong sun-patch không
  el,             // HTMLButtonElement
}

// FoodDef (foods.js)
{
  id, emoji, group, zone, nameKey, hours,
  canOpen,        // true cho lon có thể spawn opened (cannedMeat, pate, sardines)
}
```

### Quy tắc 4 giờ — ánh xạ thời gian

```
1 giờ game = 7500 ms thực (ở Normal)
diffMult: easy=0.65, normal=1, hard=1.45
gameHoursToMs(h, diff) = h * 7500 / diffMult(diff)
```

Mỗi nhóm có thời hạn riêng (giờ game) ở nhiệt độ phòng:

| Nhóm     | Hours | spoilMs (Normal) |
|----------|-------|------------------|
| meat     | 2     | 15 s             |
| dairy    | 3     | 22.5 s           |
| produce  | 4     | 30 s             |
| grain    | 8     | 60 s             |
| canned (đóng) | 12 | 90 s          |
| canned (mở)   | 2  | 15 s          |

Khi máy hút ẩm bật, `spoilMs *= 1/1.15` (kéo dài thêm ~15%). Sun patch nhân
spoil rate với 2 (item trong vùng).

### Cơ chế spawn

```js
pickSpawn():
  12%   → pre-spoiled (random món bất kỳ)
  ~29%  → fridge zone (chia đều meat/dairy/produce)
  ~29%  → jar zone (grain)
  ~29%  → canned zone (canned, có 25% chance opened → chuyển sang fridge)
```

Mục tiêu: 3 vùng cất nhận lượng món xấp xỉ bằng nhau, đồng thời luôn có
"lý do" đến Thùng rác.

---

## Triển khai code

### Vòng game

```js
function loop(time) {
  const dt = (time - lastTime) / 1000;
  if (game.running) tick(dt);
  rafId = requestAnimationFrame(loop);
}
```

`tick(dt)` chịu trách nhiệm cho:

1. Cập nhật `game.humidity` theo `humidityRamp(diff) * dt` (giảm 1/2 nếu máy
   hút ẩm bật).
2. Tính `baseSpoilRate = (1/dehumFactor) * (1 + humidity/130)` — ẩm cao thì
   món hỏng nhanh hơn.
3. Quét overlap giữa `food-item` và `sun-patch` để gắn cờ `inSun`.
4. Tăng `age` cho từng món (nhân `sunBoost` 2× nếu in-sun); món nào vượt
   `spoilMs` → `markSpoiled()` (badge thành ✗, +1 wasted, hygiene −5).
5. Trừ vệ sinh theo: số món đã hỏng × 8 + số vũng × 4 + drain mặc định.
6. Spawn món mới (mỗi `spawnEvery` ms, tối đa 7 món trên counter) và vũng
   nước (khi humidity > 28%, tối đa 5 vũng).
7. Refresh sun-patch mỗi ~25 s.
8. Cập nhật đồng hồ giờ bếp + countdown nếu Time mode.
9. Kiểm tra điều kiện thắng/thua.

### Tương tác chọn-cất

Dòng chảy chuẩn khi cất đúng:

```
click món          → selectItem(id)        → highlight các vùng valid + chef walk to food
click vùng cất     → dropToZone(zone)
                     ├─ valid?            → chefPickUp + chefWalkTo(zone) + onDropComplete
                     │                    → registerSaved(): saved++, hygiene+2, pop "+1 cứu"
                     └─ invalid?          → registerWasted(): wasted++, hygiene-X, pop & remove
```

`getValidZones(itemId)` trả về `['trash']` nếu spoiled, ngược lại
`[item.zone, 'trash']`. Logic này tự xử lý cả opened canned (đã đặt
`zone = 'fridge'` từ lúc spawn).

### Chef movement

- Chef là một `<div class="chef-walker">` chứa SVG inline.
- Vị trí được biểu diễn bằng `top%/left%` so với `.floor-stage`.
- `setChefPosition(x, y)`:
  - clamp về `[8, 92]` × `[20, 85]` để không "đi xuyên" khung
  - cập nhật `z-index` theo `Math.floor(y)` để chef tự đè đúng các furniture
    đứng phía trước/sau (depth ordering kiểu top-down)
- `chefWalkTo(targetEl)`: lấy bounding rect của target, đổi sang `%` của
  floor-stage, set vị trí, đợi 720 ms (khớp với CSS transition) rồi resolve.
- Ăn ý với CSS: class `.walking` thêm animation chân; `.chef-carry` floating
  bên trên đầu chef khi đang bưng món.

### Lưu trữ

```js
// storage.js
loadSettings()  // trả AppSettings (đã merge default + migrate cũ)
saveSettings(patch)
loadHighScores()
pushHighScore(row)  // sắp xếp giảm dần theo score, slice(0, 5)
```

Migration: targetScore từ hệ "điểm" cũ (>200) tự reset về 25 cho hệ Net.

### i18n

```js
t(locale, key)        // string đơn giản
tf(locale, key, ...args)  // string template (function)
```

Bundle ngôn ngữ ở `STRINGS = { en: {...}, vi: {...} }`. `applyI18n()` quét
mọi `[data-i18n]` trong DOM và set `textContent` theo bundle hiện tại.

### Sun patches

- Container `.sun-layer` (lazy-init) nằm bên trong `.counter-top`, ngay trước
  `.items-layer` để món hiển thị đè lên hiệu ứng nắng.
- Mỗi patch là `<div class="sun-patch">` với `left%/top%/width%/height%`
  ngẫu nhiên trong khoảng vừa phải.
- Mỗi tick gọi `updateInSunFlags()`: với mỗi món, kiểm tra giao bounding box
  với từng patch (so sánh `left/right/top/bottom` từ `getBoundingClientRect`),
  set hoặc xóa class `.in-sun`.

### Hiệu ứng UI

- **Pop text** (`+1 cứu`, `-1 hỏng`, `Mixed spoiled!`) tạo bằng cách append
  `<div class="pop-text gain|loss|warn|score">` vào `.kitchen-scene`, đặt
  bằng pixel offset rồi tự xóa sau 950 ms.
- **Meter flash**: thêm class `.flash-gain` / `.flash-loss` → CSS keyframes
  `flash-green` / `flash-red` chạy 2 lần.
- **Damp scene**: khi `humidity > 55`, scene gắn class `.is-damp` → mưa rơi
  qua cửa sổ.

---

## Phát triển thêm

Một số hướng có thể mở rộng:

- Thêm cơ chế kéo-thả (drag-and-drop) song song với click-to-place.
- Cho phép **mở lon thủ công**: spawn closed, người chơi tự click "open" nếu
  muốn dùng — nhưng phải refrigerate ngay.
- Thêm **task ngẫu nhiên** (ví dụ "khách đặt bánh mì — cần 1 trứng + 1 rau"
  trong 30 s).
- **Achievement** dựa trên Net cao, số ván liên tục thắng, % hygiene cuối ván…
- Tách `style.css` lớn thành nhiều file con (HUD / scene / furniture / food /
  modal) khi cần dễ maintain.
- Chuyển asset food sang sprite sheet duy nhất để giảm số request.

---

## Giấy phép & ghi nhận

- Code & art trong repo: tự do dùng cho mục đích học tập.
- Spritesheet nhân vật: `assets/character/` lấy từ Pipoya 32×32 — xem
  `assets/character/README_ja.txt` của tác giả gốc để biết điều khoản.
