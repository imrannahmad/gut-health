const sharp = require("sharp");
const path = require("path");

async function createLuxuryHero() {
  const src = "/Users/user/.gemini/antigravity/brain/7e9bb650-22f7-4662-aae5-1956d6d266ed/gutglow_hero_desktop_clean_1794232941148.jpg";

  // Load high-resolution source (1376 x 768)
  const { data: rawData, info: rawInfo } = await sharp(src)
    .modulate({ brightness: 1.04, saturation: 1.22 })
    .linear(1.05, -3)
    .sharpen({ sigma: 1.0, m1: 1.0, m2: 2.0 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = rawInfo.width;
  const h = rawInfo.height;

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

  function getCountertopLeftEdge(y) {
    if (y < 515) return 9999;
    const t = (y - 515) / (h - 515);
    return 680 - t * 70 + Math.sin(y * 0.05) * 1.5;
  }

  // Generate full master studio buffer (1376 x 768)
  const masterRGB = Buffer.alloc(w * h * 3);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 3;
      const capTop = getCapTop(x);
      const bowlTop = getBowlTop(x);
      const slabL = getCountertopLeftEdge(y);

      const inJarCap = Math.abs(x - capCenterX) <= capRadiusX && y >= capTop && y <= capMinY + 140;
      const inJarBody = Math.abs(x - capCenterX) <= capRadiusX && y > capMinY + 140 && y <= jarBaseY;
      const inJar = inJarCap || inJarBody;
      const inBowl = x >= 740 && x <= 920 && y >= bowlTop && y <= 555;
      const inCountertop = y >= 515 && x >= slabL;
      const isForeground = inJar || inBowl || inCountertop;

      if (isForeground) {
        let r = rawData[idx];
        let g = rawData[idx + 1];
        let b = rawData[idx + 2];

        // Smooth front limestone face near slabL
        if (inCountertop && x < slabL + 50 && y > 530) {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum < 130) {
            const grain = ((Math.sin(x * 14.1 + y * 8.3) + Math.cos(x * 6.2 - y * 13.5)) * 0.5) * 5;
            r = Math.round(212 + grain);
            g = Math.round(193 + grain);
            b = Math.round(175 + grain);
          }
        }

        // Anti-aliasing at top rim
        if (inJarCap && y - capTop < 2.0) {
          const edgeAlpha = Math.max(0, (y - capTop) / 2.0);
          r = Math.round(r * edgeAlpha + 255 * (1 - edgeAlpha));
          g = Math.round(g * edgeAlpha + 255 * (1 - edgeAlpha));
          b = Math.round(b * edgeAlpha + 255 * (1 - edgeAlpha));
        }

        masterRGB[idx] = r;
        masterRGB[idx + 1] = g;
        masterRGB[idx + 2] = b;
      } else {
        // Pure white architectural studio with natural soft daylight shadows
        let bgR = 255, bgG = 255, bgB = 255;

        // Daylight shadow behind jar on white wall
        if (y < 535 && x > 1150 && x < 1370) {
          const dx = (x - 1240) / 75.0;
          const dy = (y - 360) / 140.0;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 2.5) {
            const shadowIntensity = Math.exp(-dist2 * 0.8) * 0.11;
            bgR = Math.round(255 * (1 - shadowIntensity) + 65 * shadowIntensity);
            bgG = Math.round(255 * (1 - shadowIntensity) + 58 * shadowIntensity);
            bgB = Math.round(255 * (1 - shadowIntensity) + 54 * shadowIntensity);
          }
        }

        // Contact ground shadow at left base of limestone countertop
        if (y >= 515 && x < slabL && x >= slabL - 55) {
          const dSlab = slabL - x;
          const tShadow = Math.max(0, 1 - dSlab / 55.0);
          const shadowIntensity = Math.pow(tShadow, 2.0) * 0.16;
          bgR = Math.round(255 * (1 - shadowIntensity) + 65 * shadowIntensity);
          bgG = Math.round(255 * (1 - shadowIntensity) + 58 * shadowIntensity);
          bgB = Math.round(255 * (1 - shadowIntensity) + 54 * shadowIntensity);
        }

        masterRGB[idx] = bgR;
        masterRGB[idx + 1] = bgG;
        masterRGB[idx + 2] = bgB;
      }
    }
  }

  // 1. REFINE DESKTOP HERO ASSET (836 x 638):
  // Balanced crop: cap has 58px top breathing room, jar is 36% width of image,
  // countertop extends across, grounded to bottom right
  await sharp(masterRGB, { raw: { width: w, height: h, channels: 3 } })
    .extract({ left: 540, top: 130, width: 836, height: 638 })
    .webp({ quality: 94, effort: 6 })
    .toFile("public/images/gutglow-hero-desktop.webp");
  console.log("Desktop hero saved: public/images/gutglow-hero-desktop.webp (836x638)");

  await sharp(masterRGB, { raw: { width: w, height: h, channels: 3 } })
    .extract({ left: 540, top: 130, width: 836, height: 638 })
    .png({ compressionLevel: 8 })
    .toFile("public/images/gutglow-hero-desktop.png");

  // 2. REFINE MOBILE HERO ASSET (720 x 623):
  // Tight crop: NO 308px blank top space!
  // Cap starts 43px from top, product composition is centered and prominent,
  // countertop spans bottom
  await sharp(masterRGB, { raw: { width: w, height: h, channels: 3 } })
    .extract({ left: 640, top: 145, width: 720, height: 623 })
    .webp({ quality: 94, effort: 6 })
    .toFile("public/images/gutglow-hero-mobile.webp");
  console.log("Mobile hero saved: public/images/gutglow-hero-mobile.webp (720x623)");

  await sharp(masterRGB, { raw: { width: w, height: h, channels: 3 } })
    .extract({ left: 640, top: 145, width: 720, height: 623 })
    .png({ compressionLevel: 8 })
    .toFile("public/images/gutglow-hero-mobile.png");
}

createLuxuryHero().catch(console.error);
