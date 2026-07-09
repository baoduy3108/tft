# Photo → Art Studio

Turn any photo into striking, shareable art — pop-art, halftone, ASCII, glitch, sketch, pixel.
Runs **100% in the browser** (Canvas API). No upload, no backend, no build step.

**Live (after enabling Pages):** `https://baoduy3108.github.io/tft/photo-studio/`

## Why this can go global / viral
Every exported image carries a small `PhotoFX · your-url` credit. People post their art on
social media → friends see the credit → they visit → they share too. That watermark is the
growth engine. Effect keywords ("pop art generator", "photo to ascii", "glitch photo effect")
are searched worldwide.

## Make it live & earn (no capital)
1. **GitHub Pages**: repo → Settings → Pages → deploy from `main`.
   Replace `YOUR-USERNAME` and the `SITE_URL` constant in `index.html`.
2. **Ko-fi donate** (fastest money, no approval): swap the donate link.
3. **Google AdSense**: after approval, uncomment the head script and paste ad units into the
   two `ad-slot` divs.
4. **Pro unlock** (real paid revenue): sell the unlock code on Gumroad/Ko-fi. Change the
   `UNLOCK_CODE` constant to your own secret. Note: the gate is client-side (not crackproof),
   but that's fine for a cheap digital unlock — most users pay for convenience.
5. **Traffic**: share on Reddit, TikTok, Discord. The tool is the hook; traffic is the income.

## Effects (17)
**Free (11):** Pop-Art, Duotone, Vaporwave, Noir, Sepia, Halftone, ASCII, Glitch/VHS,
Pencil Sketch, Pixel Art, Thermal.
**Pro (6, locked until unlock code):** Neon glow, Comic/cel-shade, Oil Paint, Cyberpunk,
Blueprint, Infrared.

The Pro effects are the paid hook — buyers unlock exclusive styles + watermark removal +
HD export. Add more Pro styles over time to keep the upgrade worth it.

## Extra features
- **📲 Share** — uses the Web Share API to post the image straight to Instagram/TikTok/
  Facebook on mobile (falls back to download on desktop). Big driver of the viral loop.
- **🎲 Surprise** — applies a random unlocked effect at a random intensity for quick fun.

## Tech
Vanilla HTML/CSS/JS. Effects use canvas `getImageData` / `putImageData`. Zero dependencies.
