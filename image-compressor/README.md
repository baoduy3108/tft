# Free Image Compressor & Converter

A privacy-first image compressor and converter that runs **100% in the browser**.
No uploads, no backend, no limits — built as a single static `index.html`.

**Live demo (after you enable Pages):** `https://baoduy3108.github.io/photo-tools/image-compressor/`

## Why this can reach a global audience
- Targets huge worldwide search terms: *compress image*, *image converter*, *reduce image size*, *jpg to webp*.
- Real differentiator: images never leave the user's device (private, fast, works offline, unlimited).
- Zero hosting cost — static site on GitHub Pages.

## Features
- Compress JPG / PNG / WebP with an adjustable quality slider
- Convert between formats (WebP gives the smallest files)
- Optional max-width resize
- Batch: drop many files, compress, download all
- Before/after size + % saved

## How to make it live (and earn from it)
1. **Enable GitHub Pages**: repo → Settings → Pages → deploy from `main`.
   Then replace every `YOUR-USERNAME` in `index.html` with your GitHub username.
2. **Donations (fastest money, no approval)**: create a free [Ko-fi](https://ko-fi.com)
   account and replace the donate link.
3. **Google AdSense**: sign up, and once approved, uncomment the AdSense script tag
   in `<head>` and paste your `<ins>` ad units into the two `ad-slot` divs.
4. **Get traffic**: share on Reddit, Discord servers, and write the page to rank on Google.
   Traffic is what turns this into income — the tool is just the hook.

## Tech
Vanilla HTML/CSS/JS. Compression uses the browser Canvas API (`canvas.toBlob`).
No dependencies, no build step.
