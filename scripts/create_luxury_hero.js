const sharp = require("sharp");
const path = require("path");

async function createLuxuryHero() {
  const src = "/Users/user/.gemini/antigravity/brain/7e9bb650-22f7-4662-aae5-1956d6d266ed/gutglow_hero_desktop_clean_1794232941148.jpg";

  // Load high-resolution source (1376 x 768)
  const { data: rawData, info: rawInfo } = await sharp(src)
    .modulate({ brightness: 1.04, saturation: 1.25 })
    .linear(1.06, -4)
    .sharpen({ sigma: 1.0, m1: 1.0, m2: 2.0 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = rawInfo.width;
  const h = rawInfo.height;
  console.log("Source dimensions:", w, h);

  // Geometric coordinates in source:
  const capCenterX = 1069.5;
  const capRadiusX = 149.5;
  const capMinY = 188;
  const jarBaseY = 539;

  function getCapTop(x) {
    const rx = (x - capCenterX) / capRadiusX;
    if (Math.abs(rx) > 1.02) return 999;
    return capMinY + rx * rx * 14;
  }

  function getBowlTop(x) {
    if (x < 740 || x > 920) return 999;
    if (x <= 825) {
      const t = (x - 740) / (825 - 740);
      return 485 - t * t * 50;
    }
    const t = (x - 825) / (920 - 825);
    return 435 + t * 45;
  }

  // Countertop architectural front-left edge:
  // Starts near x=680, y=520 (just left of bowl), slopes gently down to x=610, y=768
  function getCountertopLeftEdge(y) {
    if (y < 515) return 9999;
    const t = (y - 515) / (h - 515);
    return 680 - t * 70 + Math.sin(y * 0.05) * 1.5;
  }

  // =========================================================================
  // 1. BUILD DESKTOP HERO PHOTOGRAPH (1376 x 768)
  // Countertop extends to right edge (x=1376) and bottom edge (y=768)
  // Background above countertop is pure white architectural studio with soft shadow
  // =========================================================================
  const desktopRGB = Buffer.alloc(w * h * 3);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 3;

      const capTop = getCapTop(x);
      const bowlTop = getBowlTop(x);
      const slabL = getCountertopLeftEdge(y);

      // Is this pixel part of the jar?
      const inJarCap = Math.abs(x - capCenterX) <= capRadiusX && y >= capTop && y <= capMinY + 140;
      const inJarBody = Math.abs(x - capCenterX) <= capRadiusX && y > capMinY + 140 && y <= jarBaseY;
      const inJar = inJarCap || inJarBody;

      // Is this pixel part of the bowl?
      const inBowl = x >= 740 && x <= 920 && y >= bowlTop && y <= 555;

      // Is this pixel part of the limestone countertop?
      // Countertop extends from slabL all the way to w (right edge) and h (bottom edge)
      const inCountertop = y >= 515 && x >= slabL;

      // Is this inside the physical product arrangement?
      const isForeground = inJar || inBowl || inCountertop;

      if (isForeground) {
        let r = rawData[idx];
        let g = rawData[idx + 1];
        let b = rawData[idx + 2];

        // Smooth out any dark holes in the front limestone face (near slabL)
        if (inCountertop && x < slabL + 50 && y > 530) {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum < 130) {
            const grain = ((Math.sin(x * 14.1 + y * 8.3) + Math.cos(x * 6.2 - y * 13.5)) * 0.5) * 5;
            r = Math.round(212 + grain);
            g = Math.round(193 + grain);
            b = Math.round(175 + grain);
          }
        }

        // Anti-aliasing at the top rim of cap and bowl against white studio background
        if (inJarCap && y - capTop < 2.0) {
          const edgeAlpha = Math.max(0, (y - capTop) / 2.0);
          r = Math.round(r * edgeAlpha + 255 * (1 - edgeAlpha));
          g = Math.round(g * edgeAlpha + 255 * (1 - edgeAlpha));
          b = Math.round(b * edgeAlpha + 255 * (1 - edgeAlpha));
        }

        desktopRGB[idx] = r;
        desktopRGB[idx + 1] = g;
        desktopRGB[idx + 2] = b;
      } else {
        // Background: White architectural studio wall & floor
        let bgR = 255;
        let bgG = 255;
        let bgB = 255;

        // 1. Soft architectural daylight shadow cast by the jar on the white wall behind it
        if (y < 535 && x > 1150 && x < 1370) {
          const dx = (x - 1240) / 75.0;
          const dy = (y - 360) / 140.0;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 2.5) {
            const shadowIntensity = Math.exp(-dist2 * 0.8) * 0.11; // subtle 11% max shadow
            bgR = Math.round(255 * (1 - shadowIntensity) + 65 * shadowIntensity);
            bgG = Math.round(255 * (1 - shadowIntensity) + 58 * shadowIntensity);
            bgB = Math.round(255 * (1 - shadowIntensity) + 54 * shadowIntensity);
          }
        }

        // 2. Soft architectural ground shadow beneath the left edge of the countertop
        if (y >= 515 && x < slabL && x >= slabL - 45) {
          const dSlab = slabL - x;
          const tShadow = Math.max(0, 1 - dSlab / 45.0);
          const shadowIntensity = Math.pow(tShadow, 2.0) * 0.16; // subtle 16% max contact shadow
          bgR = Math.round(255 * (1 - shadowIntensity) + 65 * shadowIntensity);
          bgG = Math.round(255 * (1 - shadowIntensity) + 58 * shadowIntensity);
          bgB = Math.round(255 * (1 - shadowIntensity) + 54 * shadowIntensity);
        }

        // 3. Ensure left 50% (x < 550) smoothly fades to 100% pure white #FFFFFF
        if (x < 550) {
          bgR = 255;
          bgG = 255;
          bgB = 255;
        }

        desktopRGB[idx] = bgR;
        desktopRGB[idx + 1] = bgG;
        desktopRGB[idx + 2] = bgB;
      }
    }
  }

  // Save desktop WebP (optimized high quality)
  await sharp(desktopRGB, { raw: { width: w, height: h, channels: 3 } })
    .webp({ quality: 92, effort: 6 })
    .toFile("public/images/gutglow-hero-desktop.webp");
  console.log("Desktop hero saved: public/images/gutglow-hero-desktop.webp (", w, "x", h, ")");

  // Also save PNG version for backwards compatibility
  await sharp(desktopRGB, { raw: { width: w, height: h, channels: 3 } })
    .png({ compressionLevel: 8 })
    .toFile("public/images/gutglow-hero-desktop.png");

  // Save preview for inspection
  await sharp(desktopRGB, { raw: { width: w, height: h, channels: 3 } })
    .jpeg({ quality: 92 })
    .toFile("/Users/user/.gemini/antigravity/brain/7e9bb650-22f7-4662-aae5-1956d6d266ed/luxury_desktop_preview.jpg");
  console.log("Desktop preview saved to luxury_desktop_preview.jpg");

  // =========================================================================
  // 2. BUILD MOBILE HERO PHOTOGRAPH (Dedicated 4:5 Portrait Composition)
  // Closer framing, centered jar, grounded countertop across bottom
  // =========================================================================
  // In source (1376 x 768), jar center is at x=1070.
  // We extract a dedicated crop centered on the jar, bowl, spoon, and countertop:
  // For 4:5 aspect ratio: width ≈ 680, height = 850 (or width 600, height 750)
  // Let us crop from x = 680 to 1376 (width = 696), y = 140 to 768 (height = 628).
  // Then place on a 4:5 portrait canvas (800 x 1000) with pure white top space
  const mobCanvasW = 800;
  const mobCanvasH = 1000;

  // We resize the desktop photograph to fit mobile portrait width with closer framing:
  // Product crop: left=650, top=140, width=726, height=628
  const productCrop = await sharp(desktopRGB, { raw: { width: w, height: h, channels: 3 } })
    .extract({ left: 650, top: 140, width: 726, height: 628 })
    .resize(800, 692, { fit: "cover" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const mobRGB = Buffer.alloc(mobCanvasW * mobCanvasH * 3);
  // Fill top (y < 308) with pure white #FFFFFF
  for (let i = 0; i < mobCanvasW * 308 * 3; i++) {
    mobRGB[i] = 255;
  }
  // Copy product crop to bottom (y = 308..1000)
  const cropData = productCrop.data;
  for (let y = 0; y < 692; y++) {
    for (let x = 0; x < mobCanvasW; x++) {
      const srcIdx = (y * mobCanvasW + x) * 3;
      const dstIdx = ((y + 308) * mobCanvasW + x) * 3;

      let r = cropData[srcIdx];
      let g = cropData[srcIdx + 1];
      let b = cropData[srcIdx + 2];

      // Smooth top blend near y=308
      if (y < 30) {
        const blend = y / 30.0;
        r = Math.round(r * blend + 255 * (1 - blend));
        g = Math.round(g * blend + 255 * (1 - blend));
        b = Math.round(b * blend + 255 * (1 - blend));
      }

      mobRGB[dstIdx] = r;
      mobRGB[dstIdx + 1] = g;
      mobRGB[dstIdx + 2] = b;
    }
  }

  // Save mobile WebP
  await sharp(mobRGB, { raw: { width: mobCanvasW, height: mobCanvasH, channels: 3 } })
    .webp({ quality: 92, effort: 6 })
    .toFile("public/images/gutglow-hero-mobile.webp");
  console.log("Mobile hero saved: public/images/gutglow-hero-mobile.webp (", mobCanvasW, "x", mobCanvasH, ")");

  // Also save PNG version
  await sharp(mobRGB, { raw: { width: mobCanvasW, height: mobCanvasH, channels: 3 } })
    .png({ compressionLevel: 8 })
    .toFile("public/images/gutglow-hero-mobile.png");

  // Save preview for inspection
  await sharp(mobRGB, { raw: { width: mobCanvasW, height: mobCanvasH, channels: 3 } })
    .jpeg({ quality: 92 })
    .toFile("/Users/user/.gemini/antigravity/brain/7e9bb650-22f7-4662-aae5-1956d6d266ed/luxury_mobile_preview.jpg");
  console.log("Mobile preview saved to luxury_mobile_preview.jpg");
}

createLuxuryHero().catch(console.error);
