const sharp = require("sharp");
const path = require("path");

async function buildAssets() {
  const src = "/Users/user/.gemini/antigravity/brain/7e9bb650-22f7-4662-aae5-1956d6d266ed/gutglow_hero_desktop_clean_1794232941148.jpg";

  // 1. Crop source
  const cropLeft = 490;
  const cropTop = 135;
  const cropW = 886; // to 1376
  const cropH = 500;

  const enhanced = await sharp(src)
    .modulate({ brightness: 1.05, saturation: 1.28 })
    .linear(1.08, -5)
    .sharpen({ sigma: 1.0, m1: 1.0, m2: 2.0 })
    .extract({ left: cropLeft, top: cropTop, width: cropW, height: cropH })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { data, info } = enhanced;
  const inW = info.width;
  const inH = info.height;

  // Let us find exact Cap center and radius
  let capMinX = 999, capMaxX = 0, capMinY = 999;
  for (let y = 0; y < 150; y++) {
    for (let x = 350; x < 750; x++) {
      const idx = (y * inW + x) * 3;
      if (data[idx] > 50 && data[idx] < 125 && data[idx+1] < 42 && data[idx+2] < 42) {
        if (x < capMinX) capMinX = x;
        if (x > capMaxX) capMaxX = x;
        if (y < capMinY) capMinY = y;
      }
    }
  }
  const capCenter = (capMinX + capMaxX) / 2;
  const capRadius = (capMaxX - capMinX) / 2;
  console.log("Cap bounds:", { capMinX, capMaxX, capCenter, capRadius, capMinY });

  // Output Desktop Canvas (900 x 540)
  const outW = 900;
  const outH = 540;
  const padLeft = 14; // Shift input by 14px to give 900 - 886 - 14 = 0 margin on right, padRight is ample

  // Geometric boundary functions in output canvas coordinates:
  function getCapTop(x) {
    const rx = (x - (capCenter + padLeft)) / capRadius;
    if (Math.abs(rx) > 1.03) return 999;
    return capMinY + 5 + rx * rx * 13;
  }

  function getBowlTop(x) {
    const bowlStart = 230 + padLeft;
    const bowlPeak = 330 + padLeft;
    const bowlEnd = 390 + padLeft;
    if (x < bowlStart || x > bowlEnd) return 999;
    if (x <= bowlPeak) {
      const t = (x - bowlStart) / (bowlPeak - bowlStart);
      return 360 - t * t * 50;
    }
    const t = (x - bowlPeak) / (bowlEnd - bowlPeak);
    return 310 + t * 45;
  }

  // Limestone slab boundaries
  const slabLeftBase = 150 + padLeft; // ~164
  const slabRightBase = 875 + padLeft; // ~889
  const slabTopLeftY = 380;
  const slabTopRightY = 395;
  const slabBottomY = 468;

  function getSlabLeft(y) {
    if (y < slabTopLeftY) return 999;
    const t = Math.min(1, Math.max(0, (y - slabTopLeftY) / (slabBottomY - slabTopLeftY)));
    return slabLeftBase - t * 14 + Math.sin(y * 0.08) * 1.5;
  }

  function getSlabRight(y) {
    if (y < slabTopRightY) return 999;
    const t = Math.min(1, Math.max(0, (y - slabTopRightY) / (slabBottomY - slabTopRightY)));
    return slabRightBase + t * 6 + Math.sin(y * 0.07) * 1.5;
  }

  function getSlabBottom(x) {
    return slabBottomY + Math.sin(x * 0.035) * 1.4 + Math.cos(x * 0.08) * 0.9;
  }

  const desktopRGBA = Buffer.alloc(outW * outH * 4);

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const dstIdx = (y * outW + x) * 4;

      // Map to input coordinates
      const inX = x - padLeft;
      const inY = y;

      const capTop = getCapTop(x);
      const bowlTop = getBowlTop(x);
      const slabL = getSlabLeft(y);
      const slabR = getSlabRight(y);
      const slabBot = getSlabBottom(x);

      // Is it inside the subject?
      let inside = false;
      let alpha = 0;

      // 1. Cap
      if (Math.abs(x - (capCenter + padLeft)) <= capRadius + 1 && y >= capTop && y <= capMinY + 140) {
        inside = true;
        alpha = 255;
        const dTop = y - capTop;
        if (dTop < 2.0) {
          alpha = Math.round((dTop / 2.0) * 255);
        }
      }

      // 2. Jar body & label
      if (Math.abs(x - (capCenter + padLeft)) <= capRadius + 1 && y > capMinY + 140 && y <= slabBot) {
        inside = true;
        alpha = 255;
      }

      // 3. Bowl
      if (x >= 230 + padLeft && x <= 390 + padLeft && y >= bowlTop && y <= slabBot) {
        inside = true;
        alpha = 255;
        const dTop = y - bowlTop;
        if (dTop < 2.0) {
          alpha = Math.min(alpha, Math.round((dTop / 2.0) * 255));
        }
      }

      // 4. Limestone slab body (y >= slabTop to slabBot, within slabL..slabR)
      if (y >= Math.min(slabTopLeftY, slabTopRightY) && y <= slabBot) {
        if (x >= slabL && x <= slabR) {
          inside = true;
          alpha = 255;

          // Smooth chiseled edge anti-aliasing
          const dLeft = x - slabL;
          const dRight = slabR - x;
          const dBot = slabBot - y;
          const minEdge = Math.min(dLeft, dRight, dBot);
          if (minEdge < 2.2) {
            alpha = Math.min(alpha, Math.round((Math.max(0, minEdge) / 2.2) * 255));
          }
        }
      }

      // 5. Ground contact shadow (immediately below slabBot)
      if (!inside && y > slabBot && y <= slabBot + 25 && x >= slabL - 8 && x <= slabR + 8) {
        const dBot = y - slabBot;
        const groundT = Math.max(0, 1 - dBot / 25);
        // Soft contact shadow: max opacity ~42 out of 255
        const shadowAlpha = Math.round(Math.pow(groundT, 2.0) * 44);
        if (shadowAlpha > 0) {
          desktopRGBA[dstIdx] = 65;
          desktopRGBA[dstIdx + 1] = 58;
          desktopRGBA[dstIdx + 2] = 54;
          desktopRGBA[dstIdx + 3] = shadowAlpha;
          continue;
        }
      }

      if (inside && inX >= 0 && inX < inW && inY >= 0 && inY < inH) {
        const srcIdx = (inY * inW + inX) * 3;
        let r = data[srcIdx];
        let g = data[srcIdx + 1];
        let b = data[srcIdx + 2];

        // Refine stone front face: smooth out any rough dark holes/cavities in the limestone face
        if (y >= 445 && y <= slabBot) {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          // If it is not the maroon spoon handle or brass scoop (which have x between 500 and 870, y < 445)
          // Any dark cavity with lum < 130 is an unsightly hole
          if (lum < 130 && (y > 448 || x < 500)) {
            // Replace with beautiful warm ivory limestone tone with natural slight variation
            const grain = ((Math.sin(x * 12.3 + y * 7.1) + Math.cos(x * 5.4 - y * 11.2)) * 0.5) * 6;
            const t = (y - 445) / (slabBot - 445);
            // Gentle directional shading from top of face to bottom
            r = Math.round(214 - t * 16 + grain);
            g = Math.round(195 - t * 16 + grain);
            b = Math.round(176 - t * 16 + grain);
          }
        }

        desktopRGBA[dstIdx] = r;
        desktopRGBA[dstIdx + 1] = g;
        desktopRGBA[dstIdx + 2] = b;
        desktopRGBA[dstIdx + 3] = alpha;
      } else if (!inside) {
        // Pure transparent white background
        desktopRGBA[dstIdx] = 255;
        desktopRGBA[dstIdx + 1] = 255;
        desktopRGBA[dstIdx + 2] = 255;
        desktopRGBA[dstIdx + 3] = 0;
      }
    }
  }

  await sharp(desktopRGBA, { raw: { width: outW, height: outH, channels: 4 } })
    .png({ compressionLevel: 8 })
    .toFile("public/images/gutglow-hero-desktop.png");
  console.log("Desktop hero generated: public/images/gutglow-hero-desktop.png (", outW, "x", outH, ")");

  // Generate preview on white
  const bg = await sharp({
    create: { width: outW, height: outH, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  }).png().toBuffer();

  await sharp(bg)
    .composite([{ input: "public/images/gutglow-hero-desktop.png" }])
    .jpeg({ quality: 95 })
    .toFile("/Users/user/.gemini/antigravity/brain/7e9bb650-22f7-4662-aae5-1956d6d266ed/preview_desktop_refined.jpg");
  console.log("Desktop preview on white saved to brain/preview_desktop_refined.jpg");

  // ==========================================
  // 2. Build Mobile Hero Asset (Centered)
  // ==========================================
  // Mobile composition is centered horizontally around the jar
  const mobW = 720;
  const mobH = 500;
  const mobCenterX = 360;

  // We crop a centered slice from the desktop image
  // Cap center in desktop is (capCenter + padLeft) ≈ 570
  // To center it at 360, we shift by (570 - 360) = 210
  const cropMobileLeft = Math.round(capCenter + padLeft - mobCenterX);
  console.log("Mobile crop left:", cropMobileLeft);

  const mobRGBA = Buffer.alloc(mobW * mobH * 4);
  for (let y = 0; y < mobH; y++) {
    for (let x = 0; x < mobW; x++) {
      const srcX = x + cropMobileLeft;
      const srcY = y + 10; // slight vertical adjustment
      const dstIdx = (y * mobW + x) * 4;

      if (srcX >= 0 && srcX < outW && srcY >= 0 && srcY < outH) {
        const srcIdx = (srcY * outW + srcX) * 4;
        mobRGBA[dstIdx] = desktopRGBA[srcIdx];
        mobRGBA[dstIdx + 1] = desktopRGBA[srcIdx + 1];
        mobRGBA[dstIdx + 2] = desktopRGBA[srcIdx + 2];
        mobRGBA[dstIdx + 3] = desktopRGBA[srcIdx + 3];
      } else {
        mobRGBA[dstIdx] = 255;
        mobRGBA[dstIdx + 1] = 255;
        mobRGBA[dstIdx + 2] = 255;
        mobRGBA[dstIdx + 3] = 0;
      }
    }
  }

  await sharp(mobRGBA, { raw: { width: mobW, height: mobH, channels: 4 } })
    .png({ compressionLevel: 8 })
    .toFile("public/images/gutglow-hero-mobile.png");
  console.log("Mobile hero generated: public/images/gutglow-hero-mobile.png (", mobW, "x", mobH, ")");

  const mobBg = await sharp({
    create: { width: mobW, height: mobH, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
  }).png().toBuffer();

  await sharp(mobBg)
    .composite([{ input: "public/images/gutglow-hero-mobile.png" }])
    .jpeg({ quality: 95 })
    .toFile("/Users/user/.gemini/antigravity/brain/7e9bb650-22f7-4662-aae5-1956d6d266ed/preview_mobile_refined.jpg");
  console.log("Mobile preview on white saved to brain/preview_mobile_refined.jpg");
}

buildAssets().catch(console.error);
