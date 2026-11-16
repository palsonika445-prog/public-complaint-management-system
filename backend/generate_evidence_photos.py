import os
from PIL import Image, ImageDraw, ImageFont

public_dir = "/Users/parassaini/.gemini/antigravity/scratch/pcms/frontend/public/images"
os.makedirs(public_dir, exist_ok=True)

# 1. CREATE BEFORE SVGs
before_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="70%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>
    <linearGradient id="roadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <radialGradient id="potholeGrad" cx="45%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="60%" stop-color="#0f172a"/>
      <stop offset="90%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
    <linearGradient id="curbGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Sky -->
  <rect x="0" y="0" width="800" height="220" fill="url(#skyGrad)"/>

  <!-- Distant Skyline & Trees -->
  <path d="M 0 220 L 40 180 L 90 220 L 150 170 L 220 220 L 290 190 L 360 220 L 450 175 L 530 220 L 620 185 L 710 220 L 800 170 L 800 220 Z" fill="#0284c7" opacity="0.25"/>
  <!-- Lush Green Trees on Horizon -->
  <circle cx="80" cy="205" r="35" fill="#15803d"/>
  <circle cx="120" cy="210" r="28" fill="#166534"/>
  <circle cx="680" cy="205" r="35" fill="#15803d"/>
  <circle cx="730" cy="210" r="30" fill="#166534"/>
  <rect x="0" y="215" width="800" height="15" fill="#15803d"/>

  <!-- Left & Right Sidewalks (Perspective) -->
  <polygon points="0,230 280,230 120,500 0,500" fill="url(#curbGrad)"/>
  <polygon points="520,230 800,230 800,500 680,500" fill="url(#curbGrad)"/>

  <!-- Main Asphalt Road Surface -->
  <polygon points="280,230 520,230 680,500 120,500" fill="url(#roadGrad)"/>

  <!-- Faded/Worn Lane Divider Markings -->
  <polygon points="395,240 405,240 407,270 393,270" fill="#fef08a" opacity="0.6"/>
  <polygon points="392,290 408,290 411,335 389,335" fill="#fef08a" opacity="0.6"/>
  <polygon points="387,365 413,365 418,430 382,430" fill="#fef08a" opacity="0.4"/>

  <!-- DEEP CRATER POTHOLE -->
  <!-- Outer Broken Asphalt Edge & Cracks -->
  <path d="M 280 340 Q 320 320 400 325 Q 490 320 540 355 Q 560 395 500 425 Q 410 445 340 435 Q 260 415 280 340 Z" fill="#1e293b" opacity="0.9"/>
  <!-- Main Deep Cavity -->
  <path d="M 295 348 C 340 330, 470 332, 520 360 C 545 390, 485 418, 440 425 C 380 435, 300 410, 295 348 Z" fill="url(#potholeGrad)" filter="url(#shadow)"/>
  
  <!-- Exposed Gravel / Stone Rubble in Pothole -->
  <ellipse cx="380" cy="375" rx="12" ry="7" fill="#64748b"/>
  <ellipse cx="430" cy="385" rx="16" ry="8" fill="#475569"/>
  <ellipse cx="340" cy="370" rx="9" ry="5" fill="#94a3b8"/>
  <ellipse cx="480" cy="378" rx="14" ry="7" fill="#64748b"/>
  <ellipse cx="410" cy="398" rx="18" ry="9" fill="#334155"/>
  <ellipse cx="365" cy="395" rx="10" ry="6" fill="#94a3b8"/>

  <!-- Radiating Cracks -->
  <path d="M 295 350 L 240 335 L 210 345 M 240 335 L 255 315" stroke="#0f172a" stroke-width="3" fill="none" opacity="0.8"/>
  <path d="M 525 365 L 590 355 L 630 370 M 590 355 L 605 330" stroke="#0f172a" stroke-width="3" fill="none" opacity="0.8"/>
  <path d="M 440 425 L 460 465 L 490 480" stroke="#0f172a" stroke-width="4" fill="none" opacity="0.8"/>
  <path d="M 330 425 L 290 460 L 260 475" stroke="#0f172a" stroke-width="4" fill="none" opacity="0.8"/>

  <!-- Traffic Hazard Caution Cone -->
  <g transform="translate(490, 275)">
    <!-- Base -->
    <polygon points="10,65 60,65 50,75 0,75" fill="#1e293b"/>
    <!-- Cone Body -->
    <polygon points="30,5 40,5 55,65 15,65" fill="#f97316"/>
    <!-- Reflective Stripes -->
    <polygon points="26,22 44,22 47,33 23,33" fill="#ffffff"/>
    <polygon points="21,43 49,43 52,53 18,53" fill="#ffffff"/>
  </g>

  <!-- Photo Header Overlay: Red Alert Stamp -->
  <rect x="20" y="20" width="340" height="42" rx="8" fill="#991b1b" opacity="0.92"/>
  <text x="35" y="46" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">
    🚩 BEFORE: DEEP POTHOLE REPORTED
  </text>

  <!-- Bottom Location Stamp -->
  <rect x="20" y="445" width="460" height="36" rx="6" fill="#0f172a" opacity="0.9"/>
  <text x="32" y="468" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#e2e8f0">
    📍 Ward 14, A.B. Road, Indore &bull; GPS: 22.7196° N, 75.8577° E
  </text>
</svg>'''

# 2. CREATE AFTER SVGs (Bright, Decent, Clean, Newly Paved Road)
after_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <!-- Vibrant Sunny Sky -->
    <linearGradient id="sunnySky" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="40%" stop-color="#38bdf8"/>
      <stop offset="85%" stop-color="#7dd3fc"/>
      <stop offset="100%" stop-color="#e0f2fe"/>
    </linearGradient>

    <!-- Fresh Smooth Bituminous Asphalt -->
    <linearGradient id="newRoadGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="40%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>

    <!-- Clean Modern Pavement Curbs -->
    <linearGradient id="cleanCurb" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>

    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <!-- Clear Sunny Sky -->
  <rect x="0" y="0" width="800" height="220" fill="url(#sunnySky)"/>

  <!-- Morning Sun -->
  <circle cx="720" cy="60" r="38" fill="#fef08a" opacity="0.9"/>
  <circle cx="720" cy="60" r="54" fill="#fef08a" opacity="0.3"/>

  <!-- Background Modern Smart City Buildings & Green Foliage -->
  <rect x="180" y="140" width="55" height="80" fill="#94a3b8" opacity="0.4"/>
  <rect x="245" y="120" width="45" height="100" fill="#64748b" opacity="0.45"/>
  <rect x="520" y="130" width="60" height="90" fill="#64748b" opacity="0.45"/>
  <rect x="590" y="150" width="50" height="70" fill="#94a3b8" opacity="0.4"/>

  <!-- Lush Landscaped Roadside Green Trees -->
  <circle cx="60" cy="195" r="42" fill="#16a34a"/>
  <circle cx="110" cy="205" r="34" fill="#15803d"/>
  <circle cx="150" cy="210" r="28" fill="#166534"/>
  <circle cx="650" cy="205" r="32" fill="#166534"/>
  <circle cx="700" cy="195" r="40" fill="#15803d"/>
  <circle cx="750" cy="205" r="35" fill="#16a34a"/>
  <!-- Clean Green Belt Divider -->
  <rect x="0" y="215" width="800" height="15" fill="#15803d"/>

  <!-- Left & Right Clean Tiled Sidewalks (Perspective) -->
  <polygon points="0,230 280,230 120,500 0,500" fill="url(#cleanCurb)"/>
  <polygon points="520,230 800,230 800,500 680,500" fill="url(#cleanCurb)"/>

  <!-- Sidewalk Texture Lines -->
  <line x1="280" y1="230" x2="120" y2="500" stroke="#94a3b8" stroke-width="4"/>
  <line x1="520" y1="230" x2="680" y2="500" stroke="#94a3b8" stroke-width="4"/>
  <line x1="0" y1="360" x2="200" y2="360" stroke="#94a3b8" stroke-width="1.5" opacity="0.5"/>
  <line x1="600" y1="360" x2="800" y2="360" stroke="#94a3b8" stroke-width="1.5" opacity="0.5"/>

  <!-- Painted Curb Stones (Yellow & Black Smart City Pattern) -->
  <polygon points="275,230 280,230 230,300 223,300" fill="#facc15"/>
  <polygon points="223,300 230,300 178,390 170,390" fill="#0f172a"/>
  <polygon points="170,390 178,390 120,500 110,500" fill="#facc15"/>

  <polygon points="520,230 525,230 577,300 570,300" fill="#facc15"/>
  <polygon points="570,300 577,300 630,390 622,390" fill="#0f172a"/>
  <polygon points="622,390 630,390 690,500 680,500" fill="#facc15"/>

  <!-- Newly Paved, Flawless, Deep-Charcoal Asphalt Surface -->
  <polygon points="280,230 520,230 680,500 120,500" fill="url(#newRoadGrad)"/>

  <!-- Subtle Fresh Asphalt Bitumen Gloss Highlight -->
  <polygon points="360,230 440,230 510,500 290,500" fill="#ffffff" opacity="0.04"/>

  <!-- Crisp, Brilliant White & Yellow Thermoplastic Lane Markings -->
  <!-- Center Dashed Stripes -->
  <polygon points="397,235 403,235 405,260 395,260" fill="#ffffff"/>
  <polygon points="395,280 405,280 408,325 392,325" fill="#ffffff"/>
  <polygon points="391,350 409,350 414,415 386,415" fill="#ffffff"/>
  <polygon points="383,445 417,445 423,500 377,500" fill="#ffffff"/>

  <!-- Continuous Edge Lines -->
  <polygon points="295,235 298,235 158,500 152,500" fill="#ffffff" opacity="0.85"/>
  <polygon points="502,235 505,235 648,500 642,500" fill="#ffffff" opacity="0.85"/>

  <!-- Municipal PWD Service Van in Distance -->
  <g transform="translate(470, 218) scale(0.65)">
    <!-- Van Body -->
    <rect x="0" y="5" width="55" height="24" rx="3" fill="#0284c7"/>
    <rect x="36" y="8" width="16" height="12" rx="2" fill="#bae6fd"/>
    <circle cx="14" cy="29" r="6" fill="#0f172a"/>
    <circle cx="44" cy="29" r="6" fill="#0f172a"/>
    <!-- Yellow Rooftop Municipal Beacon -->
    <rect x="18" y="1" width="8" height="4" fill="#facc15"/>
  </g>

  <!-- Green Success Stamp Overlay -->
  <rect x="20" y="20" width="370" height="42" rx="8" fill="#15803d" opacity="0.94"/>
  <text x="35" y="46" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">
    ✓ AFTER: RECTIFIED &amp; NEWLY PAVED
  </text>

  <!-- Bottom Certification Stamp -->
  <rect x="20" y="445" width="540" height="36" rx="6" fill="#0f172a" opacity="0.92"/>
  <text x="32" y="468" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" font-weight="600" fill="#4ade80">
    ✓ Certified by Municipal Junior Engineer &bull; 100% Quality Pass &bull; Road Opened
  </text>
</svg>'''

# Save SVGs
with open(os.path.join(public_dir, "before_pothole.svg"), "w") as f:
    f.write(before_svg)

with open(os.path.join(public_dir, "after_repair.svg"), "w") as f:
    f.write(after_svg)

print("Saved SVG files successfully in", public_dir)

# Also create high-res PNGs using Pillow
# BEFORE PNG
img_b = Image.new("RGB", (800, 500), color=(51, 65, 85))
draw_b = ImageDraw.Draw(img_b)
# Sky
draw_b.rectangle([(0, 0), (800, 220)], fill=(56, 189, 248))
# Ground/road
draw_b.polygon([(0, 220), (800, 220), (800, 500), (0, 500)], fill=(71, 85, 105))
draw_b.polygon([(280, 220), (520, 220), (680, 500), (120, 500)], fill=(51, 65, 85))
# Pothole
draw_b.ellipse([(290, 330), (530, 420)], fill=(15, 23, 42), outline=(2, 6, 23), width=4)
draw_b.ellipse([(330, 350), (490, 400)], fill=(2, 6, 23))
# Cracks
draw_b.line([(290, 360), (220, 340), (180, 350)], fill=(15, 23, 42), width=3)
draw_b.line([(530, 360), (610, 345), (650, 360)], fill=(15, 23, 42), width=3)
draw_b.line([(420, 420), (450, 470)], fill=(15, 23, 42), width=4)
# Header
draw_b.rectangle([(20, 20), (360, 62)], fill=(153, 27, 27))
draw_b.text((35, 30), "BEFORE: DAMAGED ROAD / POTHOLE", fill=(255, 255, 255))
# Footer
draw_b.rectangle([(20, 445), (480, 480)], fill=(15, 23, 42))
draw_b.text((32, 455), "Reported Incident Site - Indore PWD Ward 14", fill=(226, 232, 240))

img_b.save(os.path.join(public_dir, "before_pothole.png"))

# AFTER PNG (Bright, newly paved, clean road)
img_a = Image.new("RGB", (800, 500), color=(15, 23, 42))
draw_a = ImageDraw.Draw(img_a)
# Sunny sky
draw_a.rectangle([(0, 0), (800, 220)], fill=(2, 132, 199))
# Sun
draw_a.ellipse([(670, 30), (750, 110)], fill=(254, 240, 138))
# Green trees
draw_a.rectangle([(0, 210), (800, 225)], fill=(21, 128, 61))
for x in [40, 90, 140, 660, 710, 760]:
    draw_a.ellipse([(x-30, 170), (x+30, 220)], fill=(22, 163, 74))
# Sidewalks
draw_a.polygon([(0, 225), (280, 225), (120, 500), (0, 500)], fill=(203, 213, 225))
draw_a.polygon([(520, 225), (800, 225), (800, 500), (680, 500)], fill=(203, 213, 225))
# Newly paved blacktop road
draw_a.polygon([(280, 225), (520, 225), (680, 500), (120, 500)], fill=(30, 41, 59))
# Lane markings (Crisp White Dashes)
for y1, y2 in [(235, 260), (280, 320), (350, 410), (445, 500)]:
    w1 = int(2 + (y1 - 225) * 0.05)
    w2 = int(2 + (y2 - 225) * 0.05)
    draw_a.polygon([(400 - w1, y1), (400 + w1, y1), (400 + w2, y2), (400 - w2, y2)], fill=(255, 255, 255))
# Yellow curb markings
draw_a.line([(280, 225), (120, 500)], fill=(250, 204, 21), width=5)
draw_a.line([(520, 225), (680, 500)], fill=(250, 204, 21), width=5)
# Header
draw_a.rectangle([(20, 20), (380, 62)], fill=(21, 128, 61))
draw_a.text((35, 30), "AFTER: RECTIFIED & NEWLY PAVED", fill=(255, 255, 255))
# Footer
draw_a.rectangle([(20, 445), (540, 480)], fill=(15, 23, 42))
draw_a.text((32, 455), "Certified by Municipal PWD - 100% Quality Pass", fill=(74, 222, 128))

img_a.save(os.path.join(public_dir, "after_repair.png"))

print("Saved PNG files successfully in", public_dir)
