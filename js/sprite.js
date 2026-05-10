(function () {
  "use strict";

  // PIPOYA RPG character spritesheet layout: 4 cols × 4 rows (3 walk frames + idle, 4 directions)
  // Each frame = 32×32. Total sheet = 128×128. We render at 2x = 64×64 display.
  // Direction rows: 0 = down, 1 = left, 2 = right, 3 = up
  // Frames per row: 0,1,2 = walk cycle; we use 0,1 for idle bob

  const FRAME_W = 32;
  const FRAME_H = 32;
  const SHEET_COLS = 4;

  function animateChef() {
    const chef = document.getElementById("chefSprite");
    if (!chef) return;

    let frame = 0;
    let direction = 0; // facing down

    // Test if the image actually loads. If it fails, the CSS fallback (::before) shows.
    const testImg = new Image();
    testImg.onload = startAnimation;
    testImg.onerror = () => {
      // No spritesheet available — keep CSS fallback static
      chef.classList.add("no-sprite");
    };
    testImg.src = "assets/character/chef.png";

    function startAnimation() {
      // Use background-size based on actual sheet dimensions, scaled 2x for display
      const sheetW = testImg.naturalWidth;
      const sheetH = testImg.naturalHeight;
      const scale = 64 / FRAME_W; // display 32px frame as 64px
      chef.style.backgroundSize = `${sheetW * scale}px ${sheetH * scale}px`;

      setInterval(() => {
        frame = (frame + 1) % 2; // bob between frame 0 and 1
        const x = -frame * FRAME_W * scale;
        const y = -direction * FRAME_H * scale;
        chef.style.backgroundPosition = `${x}px ${y}px`;
      }, 600);
    }
  }

  // Start when DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", animateChef);
  } else {
    animateChef();
  }

  window.MKitchen = window.MKitchen || {};
  window.MKitchen.sprite = { animateChef };
})();
