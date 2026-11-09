const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public', 'images');
const logoBase64 = fs.readFileSync(path.join(publicDir, 'gutglow-logo-maroon.png')).toString('base64');

// PALETTE
// Deep Maroon: #54232F
// Warm Cream: #F0E5D5
// Soft Beige: #E8DCCB
// Dark Maroon: #3D1822

async function generateAll() {
  console.log('Generating 4 new Deep Maroon + Warm Cream GutGlow product photographs...');

  // 1. FRONT-FACING PRODUCT JAR
  await generateFrontShot();

  // 2. THREE-QUARTER ANGLE PRODUCT SHOT
  await generateAngleShot();

  // 3. CLOSE-UP PACKAGING DETAIL (MACRO)
  await generateMacroShot();

  // 4. LIFESTYLE PRODUCT PHOTOGRAPH (ROUTINE)
  await generateLifestyleShot();

  console.log('All product imagery generated successfully!');
}

/* =========================================================================
   1. FRONT-FACING PRODUCT JAR (1200 x 900)
   ========================================================================= */
async function generateFrontShot() {
  const w = 1200;
  const h = 900;

  const svg = `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Background studio gradient -->
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FCFAF7" />
        <stop offset="40%" stop-color="#F5F1EB" />
        <stop offset="100%" stop-color="#E8E2D8" />
      </linearGradient>

      <!-- Pedestal gradient -->
      <linearGradient id="pedestalTop" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#F7F3ED" />
        <stop offset="50%" stop-color="#FAF7F2" />
        <stop offset="100%" stop-color="#EDE7DD" />
      </linearGradient>
      <linearGradient id="pedestalFront" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#EDE6DC" />
        <stop offset="100%" stop-color="#DCD4C7" />
      </linearGradient>

      <!-- Contact shadows -->
      <radialGradient id="jarContactOcclusion" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#1B120E" stop-opacity="0.55" />
        <stop offset="50%" stop-color="#2D211A" stop-opacity="0.25" />
        <stop offset="100%" stop-color="#2D211A" stop-opacity="0" />
      </radialGradient>
      <radialGradient id="jarDirectionalShadow" cx="30%" cy="40%" r="60%">
        <stop offset="0%" stop-color="#2D211A" stop-opacity="0.32" />
        <stop offset="60%" stop-color="#3D3028" stop-opacity="0.12" />
        <stop offset="100%" stop-color="#4D4038" stop-opacity="0" />
      </radialGradient>

      <!-- Dappled botanical window shadow filter -->
      <filter id="softBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="38" />
      </filter>
      <filter id="shadowBlur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
      <filter id="tightBlur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4" />
      </filter>

      <!-- JAR BODY CYLINDER GRADIENT (Warm Cream #F0E5D5) -->
      <linearGradient id="jarBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#E5D9C8" />
        <stop offset="8%" stop-color="#FDFBF7" />
        <stop offset="22%" stop-color="#FAF5EE" />
        <stop offset="55%" stop-color="#F0E5D5" />
        <stop offset="82%" stop-color="#DECFC0" />
        <stop offset="94%" stop-color="#CEBFB0" />
        <stop offset="100%" stop-color="#E2D4C4" />
      </linearGradient>

      <!-- JAR LID GRADIENT (Deep Maroon #54232F / Dark Maroon #3D1822) -->
      <linearGradient id="lidCylinderGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#3D1822" />
        <stop offset="7%" stop-color="#6F2E3E" />
        <stop offset="18%" stop-color="#7E3748" />
        <stop offset="35%" stop-color="#652A38" />
        <stop offset="65%" stop-color="#54232F" />
        <stop offset="85%" stop-color="#3D1822" />
        <stop offset="96%" stop-color="#2A0F17" />
        <stop offset="100%" stop-color="#3D1822" />
      </linearGradient>

      <!-- Lid Bevel/Rim Highlight -->
      <linearGradient id="lidBevelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#4A1D29" />
        <stop offset="14%" stop-color="#8F3E51" />
        <stop offset="40%" stop-color="#6D2B3A" />
        <stop offset="80%" stop-color="#461A25" />
        <stop offset="100%" stop-color="#2A0F17" />
      </linearGradient>

      <!-- LABEL TEXTURED PAPER GRADIENT -->
      <linearGradient id="labelPaperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#E8DDD0" />
        <stop offset="8%" stop-color="#FDFBF7" />
        <stop offset="25%" stop-color="#FAF6EF" />
        <stop offset="60%" stop-color="#F2E8DC" />
        <stop offset="85%" stop-color="#E2D6C7" />
        <stop offset="95%" stop-color="#D4C7B7" />
        <stop offset="100%" stop-color="#E2D5C6" />
      </linearGradient>
    </defs>

    <!-- 1. Background studio wall -->
    <rect width="${w}" height="${h}" fill="url(#bgGrad)" />

    <!-- 2. Soft botanical window shadow in background for editorial depth -->
    <g filter="url(#softBlur)" opacity="0.18">
      <path d="M-80,-40 Q150,120 380,80 T750,220 Q550,420 300,340 Z" fill="#2E2018" />
      <path d="M850,-60 Q1050,160 1180,380 Q980,450 780,260 Z" fill="#2E2018" />
      <circle cx="220" cy="180" r="140" fill="#2E2018" />
    </g>

    <!-- 3. Honed Travertine Pedestal -->
    <!-- Pedestal Top Surface -->
    <polygon points="260,680 940,680 1020,740 180,740" fill="url(#pedestalTop)" />
    <!-- Pedestal Front Face -->
    <polygon points="180,740 1020,740 1020,880 180,880" fill="url(#pedestalFront)" />
    <!-- Bevel highlight line -->
    <line x1="180" y1="740" x2="1020" y2="740" stroke="#FFF" stroke-width="1.2" opacity="0.75" />
    <line x1="260" y1="680" x2="940" y2="680" stroke="#FFF" stroke-width="0.8" opacity="0.45" />

    <!-- 4. Contact Shadows on Pedestal -->
    <!-- Directional soft shadow -->
    <ellipse cx="660" cy="710" rx="220" ry="44" fill="url(#jarDirectionalShadow)" filter="url(#shadowBlur)" transform="rotate(6, 660, 710)" />
    <!-- Deep contact ambient occlusion -->
    <ellipse cx="600" cy="695" rx="172" ry="24" fill="url(#jarContactOcclusion)" filter="url(#tightBlur)" />

    <!-- 5. JAR ASSEMBLY -->
    <!-- Center of Jar: X = 600, Y Base = 692, Width = 340 -->

    <!-- A. Jar Base Bottom Curve / Rim -->
    <ellipse cx="600" cy="688" rx="168" ry="14" fill="#DECFC0" />

    <!-- B. Main Jar Body (Warm Cream #F0E5D5) -->
    <!-- Jar Body Height: from Y=350 to Y=688 (338px tall) -->
    <path d="M 432,352 
             L 768,352 
             Q 770,520 768,684 
             A 168 14 0 0 1 432 684 
             Q 430,520 432,352 Z" 
          fill="url(#jarBodyGrad)" />

    <!-- Subtle jar glass/ceramic shoulder roundness -->
    <ellipse cx="600" cy="352" rx="168" ry="12" fill="#E8DCCB" />

    <!-- C. Neck of Jar connecting to lid -->
    <rect x="444" y="336" width="312" height="18" fill="#4A1D29" />

    <!-- D. Deep Maroon Twist-Off Cap / Lid -->
    <!-- Lid Dimensions: Width = 346, Height = 100 (from Y=240 to Y=340) -->
    <!-- Lid Shadow on Jar Shoulder -->
    <ellipse cx="600" cy="342" rx="173" ry="12" fill="#1E0B11" opacity="0.45" filter="url(#tightBlur)" />
    
    <!-- Lid Cylinder Body -->
    <path d="M 427,250 
             L 773,250 
             L 773,338 
             A 173 13 0 0 1 427 338 
             Z" 
          fill="url(#lidCylinderGrad)" />

    <!-- Lid Top Surface (Ellipse) -->
    <ellipse cx="600" cy="250" rx="173" ry="14" fill="url(#lidBevelGrad)" />
    
    <!-- Lid Top Fine Bevel Chamfer -->
    <ellipse cx="600" cy="249" rx="170" ry="12.5" fill="#54232F" />
    <!-- Lid Top Satin Sheen -->
    <ellipse cx="570" cy="248" rx="140" ry="9" fill="#753041" opacity="0.6" />
    <ellipse cx="530" cy="247" rx="80" ry="5.5" fill="#8F3E51" opacity="0.5" />

    <!-- Ultra-fine lid satin grip vertical knurl lines (subtle luxury detail) -->
    <g opacity="0.12" stroke="#FFF" stroke-width="0.8">
      <line x1="480" y1="262" x2="480" y2="330" />
      <line x1="510" y1="264" x2="510" y2="332" />
      <line x1="540" y1="265" x2="540" y2="333" />
      <line x1="570" y1="265" x2="570" y2="333" />
      <line x1="600" y1="265" x2="600" y2="333" />
      <line x1="630" y1="265" x2="630" y2="333" />
      <line x1="660" y1="264" x2="660" y2="332" />
      <line x1="690" y1="263" x2="690" y2="331" />
      <line x1="720" y1="261" x2="720" y2="329" />
    </g>

    <!-- Bottom Rim of Lid Bevel -->
    <path d="M 427,338 A 173 13 0 0 0 773 338 A 173 12 0 0 1 427 338 Z" fill="#240A10" />

    <!-- E. PRODUCT LABEL (WARM CREAM PAPER) -->
    <!-- Label Position: Y=390 to Y=645, Width=316 (X=442 to X=758) -->
    
    <!-- Paper thickness micro-shadow on jar -->
    <rect x="440" y="390" width="320" height="258" rx="3" fill="#BFAF9D" opacity="0.35" filter="url(#tightBlur)" />
    
    <!-- Label Body -->
    <path d="M 442,392 
             L 758,392 
             L 758,642 
             A 158 12 0 0 1 442 642 
             Z" 
          fill="url(#labelPaperGrad)" />
    <!-- Label Top Curve -->
    <ellipse cx="600" cy="392" rx="158" ry="11" fill="#F7F2E9" />
    <!-- Label Left & Right paper edge hairline -->
    <line x1="442" y1="392" x2="442" y2="642" stroke="#D1C3B2" stroke-width="0.8" />
    <line x1="758" y1="392" x2="758" y2="642" stroke="#C2B29F" stroke-width="0.8" />

    <!-- Label Content (Typography in DEEP MAROON #54232F) -->
    <g>
      <!-- Small Eyebrow: NOURISH FROM WITHIN -->
      <text x="600" y="442" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="8.5" 
            font-weight="600" 
            letter-spacing="3.2" 
            fill="#7A3C4A" 
            text-anchor="middle">EVERYDAY GUT WELLNESS</text>

      <!-- Decorative subtle hairline divider -->
      <line x1="540" y1="454" x2="660" y2="454" stroke="#54232F" stroke-width="0.75" opacity="0.3" />

      <!-- Official GutGlow Brand Logo (in Deep Maroon #54232F) -->
      <image href="data:image/png;base64,${logoBase64}" 
             x="490" y="462" width="220" height="74" 
             preserveAspectRatio="xMidYMid meet" />

      <!-- Product Subtitle -->
      <text x="600" y="556" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="11" 
            font-weight="700" 
            letter-spacing="3.8" 
            fill="#54232F" 
            text-anchor="middle">DAILY WELLNESS</text>

      <!-- Descriptor -->
      <text x="600" y="574" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="8" 
            font-weight="600" 
            letter-spacing="2.2" 
            fill="#703442" 
            text-anchor="middle">GUT WELLNESS FORMULA</text>

      <!-- Thin separator -->
      <line x1="510" y1="592" x2="690" y2="592" stroke="#54232F" stroke-width="0.6" opacity="0.25" />

      <!-- Supporting specs -->
      <text x="600" y="612" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="7.5" 
            font-weight="500" 
            letter-spacing="1.8" 
            fill="#804452" 
            text-anchor="middle">PREBIOTIC FIBERS · BOTANICAL EXTRACTS</text>

      <text x="600" y="628" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="7" 
            font-weight="600" 
            letter-spacing="1.5" 
            fill="#54232F" 
            text-anchor="middle">NET WT. 180G · 30 SERVINGS</text>
    </g>

    <!-- Natural botanical sprig resting on pedestal next to jar -->
    <g opacity="0.9" transform="translate(755, 672) rotate(18)">
      <!-- Leaf shadow -->
      <ellipse cx="60" cy="38" rx="70" ry="12" fill="#2E211A" opacity="0.25" filter="url(#shadowBlur)" />
      <!-- Delicate stem -->
      <path d="M0,25 Q45,20 90,32 T160,28" stroke="#48382A" stroke-width="2" fill="none" stroke-linecap="round" />
      <!-- Eucalyptus/Olive leaves in muted natural sage -->
      <path d="M30,22 Q50,6 68,18 Q48,28 30,22 Z" fill="#6B7865" />
      <path d="M65,19 Q85,2 104,15 Q84,26 65,19 Z" fill="#788572" />
      <path d="M98,24 Q122,8 140,22 Q120,32 98,24 Z" fill="#5E6B58" />
      <path d="M45,24 Q60,38 78,32 Q62,24 45,24 Z" fill="#586352" />
      <path d="M85,27 Q102,42 120,36 Q104,26 85,27 Z" fill="#6A7764" />
    </g>

    <!-- Vignette and editorial studio lighting edge falloff -->
    <rect width="${w}" height="${h}" fill="none" stroke="#FAF8F5" stroke-width="14" />
  </svg>
  `;

  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 96, chromaSubsampling: '4:4:4' }).toBuffer();
  fs.writeFileSync(path.join(publicDir, 'product-jar-front.jpg'), buf);
  fs.writeFileSync(path.join(publicDir, 'product-jar-hero.jpg'), buf);
  fs.writeFileSync(path.join(publicDir, 'product-jar-hero.png'), buf);
  console.log('✓ 1. Front-facing product jar created: product-jar-front.jpg & product-jar-hero.jpg');
}

/* =========================================================================
   2. THREE-QUARTER ANGLE PRODUCT SHOT (1200 x 900)
   ========================================================================= */
async function generateAngleShot() {
  const w = 1200;
  const h = 900;

  const svg = `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Background studio gradient -->
      <linearGradient id="bgAngle" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FAF7F2" />
        <stop offset="50%" stop-color="#F1ECE3" />
        <stop offset="100%" stop-color="#E5DED2" />
      </linearGradient>

      <!-- Studio pedestal -->
      <linearGradient id="pedAngleTop" x1="20%" y1="0%" x2="80%" y2="100%">
        <stop offset="0%" stop-color="#F9F6F0" />
        <stop offset="100%" stop-color="#E8E0D4" />
      </linearGradient>
      <linearGradient id="pedAngleSide" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#E2D9CC" />
        <stop offset="100%" stop-color="#D0C5B5" />
      </linearGradient>

      <!-- Cylinder lighting (angled light from top-left) -->
      <linearGradient id="jarAngleCylinder" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#EAE0D2" />
        <stop offset="12%" stop-color="#FFFDF9" />
        <stop offset="30%" stop-color="#F3EAE0" />
        <stop offset="65%" stop-color="#ECDDCF" />
        <stop offset="85%" stop-color="#D6C4B2" />
        <stop offset="96%" stop-color="#C2B09D" />
        <stop offset="100%" stop-color="#D8C8B7" />
      </linearGradient>

      <!-- Maroon Lid Angled Cylinder -->
      <linearGradient id="lidAngleCylinder" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#3D1822" />
        <stop offset="10%" stop-color="#783244" />
        <stop offset="28%" stop-color="#883B4F" />
        <stop offset="55%" stop-color="#642837" />
        <stop offset="80%" stop-color="#4A1C27" />
        <stop offset="95%" stop-color="#2D0F18" />
        <stop offset="100%" stop-color="#421622" />
      </linearGradient>

      <!-- Lid Top Ellipse (3/4 perspective) -->
      <linearGradient id="lidTopEllipse" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#7E3748" />
        <stop offset="35%" stop-color="#6B2D3C" />
        <stop offset="70%" stop-color="#54232F" />
        <stop offset="100%" stop-color="#36131D" />
      </linearGradient>

      <!-- Label Angled Cylinder -->
      <linearGradient id="labelAngleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#EDE2D6" />
        <stop offset="14%" stop-color="#FFFDF8" />
        <stop offset="32%" stop-color="#FAF5ED" />
        <stop offset="70%" stop-color="#F0E5D7" />
        <stop offset="88%" stop-color="#DFCFC0" />
        <stop offset="100%" stop-color="#D0C0B0" />
      </linearGradient>

      <filter id="angleBlur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="16" />
      </filter>
      <filter id="angleOccl" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="4.5" />
      </filter>
    </defs>

    <!-- Studio backdrop -->
    <rect width="${w}" height="${h}" fill="url(#bgAngle)" />

    <!-- Editorial Studio Soft Spot Backdrop -->
    <circle cx="580" cy="420" r="480" fill="#FFF" opacity="0.22" filter="url(#angleBlur)" />

    <!-- Geometric Stone Plinth in perspective -->
    <polygon points="280,660 920,660 1010,760 190,760" fill="url(#pedAngleTop)" />
    <polygon points="190,760 1010,760 1010,880 190,880" fill="url(#pedAngleSide)" />
    <line x1="190" y1="760" x2="1010" y2="760" stroke="#FFF" stroke-width="1.2" opacity="0.6" />

    <!-- 3/4 Directional Cast Shadow -->
    <ellipse cx="690" cy="710" rx="230" ry="46" fill="#291D17" opacity="0.28" filter="url(#angleBlur)" transform="rotate(9, 690, 710)" />
    <ellipse cx="590" cy="690" rx="175" ry="26" fill="#1C130E" opacity="0.55" filter="url(#angleOccl)" />

    <!-- 3/4 JAR CYLINDER -->
    <!-- Center: X=590, Base Y=680 -->

    <!-- Jar Base Bottom Curve -->
    <ellipse cx="590" cy="675" rx="166" ry="17" fill="#D3C3B1" />

    <!-- Jar Body (Warm Cream #F0E5D5) -->
    <path d="M 424,360 
             L 756,360 
             L 756,670 
             A 166 17 0 0 1 424 670 
             Z" 
          fill="url(#jarAngleCylinder)" />

    <!-- Shoulder Ellipse -->
    <ellipse cx="590" cy="360" rx="166" ry="16" fill="#E5D8C7" />

    <!-- Neck Connector -->
    <rect x="438" y="342" width="304" height="20" fill="#421622" />

    <!-- Deep Maroon Lid Body -->
    <path d="M 420,268 
             L 760,268 
             L 760,344 
             A 170 18 0 0 1 420 344 
             Z" 
          fill="url(#lidAngleCylinder)" />

    <!-- 3/4 Perspective Top of Lid (Prominent Ellipse) -->
    <ellipse cx="590" cy="268" rx="170" ry="22" fill="url(#lidTopEllipse)" />
    <!-- Fine concentric embossed lid detail (luxury finish) -->
    <ellipse cx="590" cy="268" rx="156" ry="19" fill="#54232F" stroke="#7A3445" stroke-width="1.2" />
    <ellipse cx="590" cy="268" rx="135" ry="16" fill="#4C1E2A" />
    <!-- Center debossed monogram mark on lid -->
    <ellipse cx="590" cy="268" rx="55" ry="7.5" fill="#3D1822" />
    <text x="590" y="271" 
          font-family="'Playfair Display', serif" 
          font-size="12" 
          font-weight="bold" 
          font-style="italic" 
          fill="#8E4254" 
          text-anchor="middle">GG</text>

    <!-- Angled Warm Cream Label -->
    <path d="M 436,398 
             L 744,398 
             L 744,630 
             A 154 15 0 0 1 436 630 
             Z" 
          fill="url(#labelAngleGrad)" />
    <ellipse cx="590" cy="398" rx="154" ry="14" fill="#FBF7EE" />

    <!-- Label Typography in Deep Maroon (#54232F) -->
    <g transform="translate(-10, 0)">
      <text x="590" y="442" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="8.5" 
            font-weight="600" 
            letter-spacing="3.2" 
            fill="#7A3C4A" 
            text-anchor="middle">EVERYDAY GUT WELLNESS</text>

      <line x1="530" y1="454" x2="650" y2="454" stroke="#54232F" stroke-width="0.75" opacity="0.3" />

      <!-- Official GutGlow Logo -->
      <image href="data:image/png;base64,${logoBase64}" 
             x="480" y="462" width="220" height="74" 
             preserveAspectRatio="xMidYMid meet" />

      <text x="590" y="556" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="11" 
            font-weight="700" 
            letter-spacing="3.8" 
            fill="#54232F" 
            text-anchor="middle">DAILY WELLNESS</text>

      <text x="590" y="574" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="8" 
            font-weight="600" 
            letter-spacing="2.2" 
            fill="#703442" 
            text-anchor="middle">GUT WELLNESS FORMULA</text>

      <line x1="500" y1="590" x2="680" y2="590" stroke="#54232F" stroke-width="0.6" opacity="0.25" />

      <text x="590" y="612" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="7.5" 
            font-weight="500" 
            letter-spacing="1.8" 
            fill="#804452" 
            text-anchor="middle">PREBIOTIC FIBERS · BOTANICAL EXTRACTS</text>

      <text x="590" y="626" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="7" 
            font-weight="600" 
            letter-spacing="1.5" 
            fill="#54232F" 
            text-anchor="middle">NET WT. 180G · 30 SERVINGS</text>
    </g>

    <!-- Refined architectural side accent block -->
    <polygon points="120,540 260,540 220,680 80,680" fill="#EAE2D5" opacity="0.45" />
  </svg>
  `;

  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 96, chromaSubsampling: '4:4:4' }).toBuffer();
  fs.writeFileSync(path.join(publicDir, 'product-jar-angle.jpg'), buf);
  console.log('✓ 2. Three-quarter angle product shot created: product-jar-angle.jpg');
}

/* =========================================================================
   3. CLOSE-UP PACKAGING DETAIL / MACRO (1200 x 900)
   ========================================================================= */
async function generateMacroShot() {
  const w = 1200;
  const h = 900;

  const svg = `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Macro Lid Gradient (Top 40%) -->
      <linearGradient id="macroLidGrad" x1="0%" y1="0%" x2="100%" y2="80%">
        <stop offset="0%" stop-color="#461A25" />
        <stop offset="25%" stop-color="#6F2D3D" />
        <stop offset="50%" stop-color="#7F3547" />
        <stop offset="75%" stop-color="#54232F" />
        <stop offset="100%" stop-color="#36121C" />
      </linearGradient>

      <!-- Lid Edge Bevel Highlight -->
      <linearGradient id="macroLidEdge" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#8F3E51" />
        <stop offset="70%" stop-color="#54232F" />
        <stop offset="100%" stop-color="#240A10" />
      </linearGradient>

      <!-- Macro Paper Texture Gradient (Bottom 60%) -->
      <linearGradient id="macroPaperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FAF5ED" />
        <stop offset="40%" stop-color="#F2E9DE" />
        <stop offset="80%" stop-color="#E8DED1" />
        <stop offset="100%" stop-color="#DDCFBE" />
      </linearGradient>

      <!-- Embossed Deboss Inner Shadow Filter -->
      <filter id="debossShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0.8" dy="1.4" stdDeviation="1" flood-color="#2A0B13" flood-opacity="0.45" />
      </filter>

      <filter id="macroBlur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="24" />
      </filter>
    </defs>

    <!-- Warm ambient background -->
    <rect width="${w}" height="${h}" fill="#F0E5D5" />

    <!-- BOTTOM 62%: TACTILE WARM CREAM COTTON PAPER LABEL -->
    <rect x="0" y="320" width="${w}" height="580" fill="url(#macroPaperGrad)" />

    <!-- Ultra-fine cotton paper texture grain simulation -->
    <g opacity="0.04" stroke="#54232F" stroke-width="0.5">
      ${Array.from({ length: 45 }).map((_, i) => `
        <line x1="${i * 28}" y1="320" x2="${i * 28 + 14}" y2="900" stroke-dasharray="2 6" />
      `).join('')}
    </g>

    <!-- TOP 38%: DEEP MAROON LID WITH MATTE SATIN SHEEN -->
    <rect x="0" y="0" width="${w}" height="320" fill="url(#macroLidGrad)" />
    
    <!-- Precision Lid Seam & Bevel Chamfer (Y = 300 to 324) -->
    <rect x="0" y="304" width="${w}" height="16" fill="url(#macroLidEdge)" />
    <line x1="0" y1="304" x2="${w}" y2="304" stroke="#A84C62" stroke-width="1.2" opacity="0.8" />
    <line x1="0" y1="320" x2="${w}" y2="320" stroke="#1F080E" stroke-width="2.5" />
    <!-- Jar cream rim peeking below lid -->
    <line x1="0" y1="322" x2="${w}" y2="322" stroke="#FFF" stroke-width="1" opacity="0.7" />

    <!-- Vertical knurling grooves on the lid (macro perspective) -->
    <g opacity="0.16" stroke="#FFF" stroke-width="1.2">
      ${Array.from({ length: 30 }).map((_, i) => `
        <line x1="${i * 42 + 20}" y1="40" x2="${i * 42 + 20}" y2="300" />
      `).join('')}
    </g>

    <!-- Raking studio light reflection across lid -->
    <ellipse cx="360" cy="180" rx="340" ry="120" fill="#8F3E51" opacity="0.32" filter="url(#macroBlur)" />

    <!-- CRISP MACRO TYPOGRAPHY ON PAPER LABEL -->
    <g transform="translate(60, 40)">
      <!-- Eyebrow text -->
      <text x="540" y="380" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="12" 
            font-weight="700" 
            letter-spacing="5" 
            fill="#783444" 
            text-anchor="middle">EVERYDAY GUT WELLNESS</text>

      <line x1="420" y1="400" x2="660" y2="400" stroke="#54232F" stroke-width="1" opacity="0.35" />

      <!-- High-res debossed GutGlow brand logo in Deep Maroon -->
      <g filter="url(#debossShadow)">
        <image href="data:image/png;base64,${logoBase64}" 
               x="320" y="420" width="440" height="150" 
               preserveAspectRatio="xMidYMid meet" />
      </g>

      <!-- Subtitle -->
      <text x="540" y="610" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="18" 
            font-weight="800" 
            letter-spacing="6" 
            fill="#54232F" 
            text-anchor="middle">DAILY WELLNESS</text>

      <text x="540" y="642" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="13" 
            font-weight="600" 
            letter-spacing="3.5" 
            fill="#703240" 
            text-anchor="middle">GUT WELLNESS FORMULA</text>

      <line x1="360" y1="670" x2="720" y2="670" stroke="#54232F" stroke-width="1" opacity="0.3" />

      <!-- Macro Details -->
      <text x="540" y="705" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="11.5" 
            font-weight="600" 
            letter-spacing="2.8" 
            fill="#854553" 
            text-anchor="middle">100% PLANT-DERIVED · 30 SERVINGS · 180G</text>

      <text x="540" y="735" 
            font-family="'Playfair Display', serif" 
            font-size="11" 
            font-style="italic" 
            letter-spacing="1" 
            fill="#54232F" 
            opacity="0.8" 
            text-anchor="middle">Formulated for daily digestive equilibrium and gut-skin harmony.</text>
    </g>

    <!-- Shallow depth of field vignette (blur on bottom and edges) -->
    <rect width="${w}" height="${h}" fill="none" stroke="#FAF8F5" stroke-width="16" />
  </svg>
  `;

  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 96, chromaSubsampling: '4:4:4' }).toBuffer();
  fs.writeFileSync(path.join(publicDir, 'product-packaging-macro.jpg'), buf);
  fs.writeFileSync(path.join(publicDir, 'product-jar-detail.jpg'), buf);
  console.log('✓ 3. Close-up packaging detail created: product-packaging-macro.jpg & product-jar-detail.jpg');
}

/* =========================================================================
   4. LIFESTYLE PRODUCT PHOTOGRAPH (ROUTINE) (1200 x 900)
   ========================================================================= */
async function generateLifestyleShot() {
  const w = 1200;
  const h = 900;

  const svg = `
  <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Warm morning linen countertop -->
      <linearGradient id="linenTable" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FDFBF7" />
        <stop offset="40%" stop-color="#F6EFE5" />
        <stop offset="80%" stop-color="#EBE2D4" />
        <stop offset="100%" stop-color="#DECFC0" />
      </linearGradient>

      <!-- Glass of water gradient -->
      <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#FFF" stop-opacity="0.75" />
        <stop offset="15%" stop-color="#E8F1F2" stop-opacity="0.3" />
        <stop offset="50%" stop-color="#FFF" stop-opacity="0.1" />
        <stop offset="85%" stop-color="#E8F1F2" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#FFF" stop-opacity="0.65" />
      </linearGradient>
      <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#EBF4F6" stop-opacity="0.4" />
        <stop offset="100%" stop-color="#D7E8EC" stop-opacity="0.55" />
      </linearGradient>

      <!-- Brass spoon gradient -->
      <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="50%">
        <stop offset="0%" stop-color="#C5A059" />
        <stop offset="35%" stop-color="#F3DC9B" />
        <stop offset="60%" stop-color="#D9B76A" />
        <stop offset="100%" stop-color="#9C7733" />
      </linearGradient>

      <!-- Jar Cylinder gradients for lifestyle setting -->
      <linearGradient id="lifeJarBody" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#E7DCcc" />
        <stop offset="10%" stop-color="#FCFAF6" />
        <stop offset="25%" stop-color="#FAF5ED" />
        <stop offset="60%" stop-color="#EFE3D3" />
        <stop offset="85%" stop-color="#DAC9B7" />
        <stop offset="100%" stop-color="#C8B6A3" />
      </linearGradient>

      <linearGradient id="lifeLid" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#3D1822" />
        <stop offset="12%" stop-color="#732E3E" />
        <stop offset="28%" stop-color="#84384B" />
        <stop offset="60%" stop-color="#54232F" />
        <stop offset="85%" stop-color="#3D1822" />
        <stop offset="100%" stop-color="#240B12" />
      </linearGradient>

      <filter id="lifeBlur" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="22" />
      </filter>
      <filter id="dappledShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="35" />
      </filter>
      <filter id="contactShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="6" />
      </filter>
    </defs>

    <!-- 1. Background Tabletop: Natural Warm Linen -->
    <rect width="${w}" height="${h}" fill="url(#linenTable)" />

    <!-- 2. Morning Dappled Sunlight & Tree Shadows -->
    <g filter="url(#dappledShadow)" opacity="0.28">
      <path d="M-100,-80 Q250,160 520,80 T1050,300 Q800,500 500,400 Z" fill="#3D291D" />
      <path d="M700,-50 Q980,180 1200,100 T1250,600 Q950,550 750,420 Z" fill="#3D291D" />
      <circle cx="280" cy="220" r="180" fill="#3D291D" />
    </g>

    <!-- Warm Morning Sunlight Ray -->
    <polygon points="120,0 600,0 1000,900 350,900" fill="#FFF" opacity="0.15" filter="url(#lifeBlur)" />

    <!-- 3. COMPOSITION ELEMENTS -->

    <!-- A. TALL GLASS OF FRESH WATER (Left Side) -->
    <!-- Glass Position: X = 280, Y Base = 680, Width = 110, Height = 280 -->
    <g transform="translate(190, 360)">
      <!-- Glass Contact Shadow -->
      <ellipse cx="60" cy="335" rx="55" ry="14" fill="#251A14" opacity="0.25" filter="url(#contactShadow)" />
      <!-- Water caustic glow -->
      <ellipse cx="110" cy="340" rx="45" ry="12" fill="#E8F4F8" opacity="0.4" filter="url(#contactShadow)" />

      <!-- Water column inside glass -->
      <path d="M 12,60 L 108,60 L 100,320 A 42 8 0 0 1 20 320 Z" fill="url(#waterGrad)" />
      <!-- Water meniscus top -->
      <ellipse cx="60" cy="60" rx="48" ry="7" fill="#D7E8EC" opacity="0.75" />

      <!-- Glass outer cylinder -->
      <path d="M 8,20 L 112,20 L 102,326 A 44 9 0 0 1 18 326 Z" fill="url(#glassGrad)" />
      <!-- Glass rim top -->
      <ellipse cx="60" cy="20" rx="52" ry="7.5" fill="none" stroke="#FFF" stroke-width="1.8" opacity="0.85" />
      <!-- Heavy glass base -->
      <path d="M 18,300 L 102,300 L 102,326 A 44 9 0 0 1 18 326 Z" fill="#FFF" opacity="0.4" />
      <!-- Specular vertical light streak on glass -->
      <line x1="28" y1="30" x2="28" y2="310" stroke="#FFF" stroke-width="2.5" opacity="0.75" />
      <line x1="34" y1="35" x2="34" y2="305" stroke="#FFF" stroke-width="0.8" opacity="0.5" />
    </g>

    <!-- B. SCULPTED MEASURING SPOON WITH WELLNESS POWDER (Foreground Right) -->
    <g transform="translate(740, 620) rotate(-14)">
      <!-- Spoon shadow -->
      <path d="M 0,30 Q 120,40 260,25" stroke="#251A14" stroke-width="12" fill="none" opacity="0.22" filter="url(#contactShadow)" />
      <ellipse cx="30" cy="30" rx="36" ry="24" fill="#251A14" opacity="0.3" filter="url(#contactShadow)" />

      <!-- Brass Spoon Handle -->
      <path d="M 30,22 Q 130,28 260,18" stroke="url(#brassGrad)" stroke-width="4.5" fill="none" stroke-linecap="round" />
      <!-- Brass Spoon Bowl -->
      <ellipse cx="30" cy="22" rx="34" ry="22" fill="url(#brassGrad)" />
      <ellipse cx="30" cy="20" rx="28" ry="17" fill="#8C6628" />

      <!-- Fine pale wellness powder in spoon bowl -->
      <ellipse cx="30" cy="18" rx="24" ry="14" fill="#F4EDE0" />
      <ellipse cx="28" cy="16" rx="16" ry="9" fill="#FFFDF8" opacity="0.9" />
    </g>

    <!-- C. THE GUTGLOW MAROON & WARM CREAM JAR (Center-Right Hero) -->
    <!-- Jar Center: X = 570, Base Y = 680, Width = 310 -->
    <g>
      <!-- Directional shadow -->
      <ellipse cx="650" cy="700" rx="200" ry="40" fill="#2B1E17" opacity="0.32" filter="url(#lifeBlur)" transform="rotate(7, 650, 700)" />
      <!-- Contact ambient occlusion -->
      <ellipse cx="570" cy="682" rx="155" ry="20" fill="#1C130E" opacity="0.6" filter="url(#contactShadow)" />

      <!-- Jar Body (Warm Cream #F0E5D5) -->
      <ellipse cx="570" cy="676" rx="152" ry="13" fill="#D4C5B3" />
      <path d="M 418,370 
               L 722,370 
               L 722,672 
               A 152 13 0 0 1 418 672 
               Z" 
            fill="url(#lifeJarBody)" />
      <ellipse cx="570" cy="370" rx="152" ry="11" fill="#E6DAC9" />

      <!-- Neck -->
      <rect x="430" y="356" width="280" height="16" fill="#3D1822" />

      <!-- Deep Maroon Lid -->
      <path d="M 414,275 
               L 726,275 
               L 726,358 
               A 156 12 0 0 1 414 358 
               Z" 
            fill="url(#lifeLid)" />
      <ellipse cx="570" cy="275" rx="156" ry="13" fill="#753041" />
      <ellipse cx="570" cy="274" rx="152" ry="11" fill="#54232F" />

      <!-- Warm Cream Label -->
      <path d="M 428,406 
               L 712,406 
               L 712,634 
               A 142 11 0 0 1 428 634 
               Z" 
            fill="url(#lifeJarBody)" />
      <ellipse cx="570" cy="406" rx="142" ry="10" fill="#FAF5ED" />

      <!-- Typography in Deep Maroon (#54232F) -->
      <text x="570" y="446" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="8" 
            font-weight="600" 
            letter-spacing="3" 
            fill="#7A3C4A" 
            text-anchor="middle">EVERYDAY GUT WELLNESS</text>

      <line x1="510" y1="458" x2="630" y2="458" stroke="#54232F" stroke-width="0.7" opacity="0.3" />

      <!-- Official GutGlow Logo -->
      <image href="data:image/png;base64,${logoBase64}" 
             x="470" y="465" width="200" height="68" 
             preserveAspectRatio="xMidYMid meet" />

      <text x="570" y="550" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="10.5" 
            font-weight="700" 
            letter-spacing="3.5" 
            fill="#54232F" 
            text-anchor="middle">DAILY WELLNESS</text>

      <text x="570" y="567" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="7.5" 
            font-weight="600" 
            letter-spacing="2" 
            fill="#703442" 
            text-anchor="middle">GUT WELLNESS FORMULA</text>

      <line x1="490" y1="584" x2="650" y2="584" stroke="#54232F" stroke-width="0.6" opacity="0.25" />

      <text x="570" y="605" 
            font-family="'Inter', -apple-system, sans-serif" 
            font-size="7" 
            font-weight="600" 
            letter-spacing="1.5" 
            fill="#54232F" 
            text-anchor="middle">NET WT. 180G · 30 SERVINGS</text>
    </g>

    <!-- D. FRESH BOTANICAL HERB SPRIG (Chamomile/Eucalyptus) -->
    <g transform="translate(380, 680) rotate(-32)">
      <ellipse cx="60" cy="18" rx="65" ry="12" fill="#20150F" opacity="0.2" filter="url(#contactShadow)" />
      <path d="M 0,10 Q 50,-5 110,8 T 170,4" stroke="#5A4736" stroke-width="2" fill="none" stroke-linecap="round" />
      <path d="M 35,4 Q 52,-14 68,-2 Q 54,6 35,4 Z" fill="#75826E" />
      <path d="M 72,1 Q 90,-18 106,-4 Q 92,4 72,1 Z" fill="#677561" />
      <path d="M 110,4 Q 132,-12 148,0 Q 130,8 110,4 Z" fill="#7A8974" />
      <path d="M 50,6 Q 66,22 82,14 Q 68,6 50,6 Z" fill="#586552" />
    </g>

    <rect width="${w}" height="${h}" fill="none" stroke="#FAF8F5" stroke-width="14" />
  </svg>
  `;

  const buf = await sharp(Buffer.from(svg)).jpeg({ quality: 96, chromaSubsampling: '4:4:4' }).toBuffer();
  fs.writeFileSync(path.join(publicDir, 'product-lifestyle-routine.jpg'), buf);
  fs.writeFileSync(path.join(publicDir, 'product-jar-lifestyle.jpg'), buf);
  console.log('✓ 4. Lifestyle product photograph created: product-lifestyle-routine.jpg & product-jar-lifestyle.jpg');
}

generateAll().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
