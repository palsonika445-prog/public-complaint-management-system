import React from 'react'

export const BeforeRepairGraphic = ({ className = 'w-100 h-100 object-fit-cover', style = {} }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 800 500"
    className={className}
    style={{ display: 'block', width: '100%', height: '100%', ...style }}
  >
    <defs>
      <linearGradient id="skyGradB" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" />
        <stop offset="70%" stopColor="#bae6fd" />
        <stop offset="100%" stopColor="#e0f2fe" />
      </linearGradient>
      <linearGradient id="roadGradB" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#475569" />
        <stop offset="100%" stopColor="#334155" />
      </linearGradient>
      <radialGradient id="potholeGradB" cx="45%" cy="40%" r="60%">
        <stop offset="0%" stopColor="#020617" />
        <stop offset="60%" stopColor="#0f172a" />
        <stop offset="90%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#334155" />
      </radialGradient>
      <linearGradient id="curbGradB" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#94a3b8" />
        <stop offset="100%" stopColor="#64748b" />
      </linearGradient>
    </defs>

    {/* Sky */}
    <rect x="0" y="0" width="800" height="220" fill="url(#skyGradB)" />

    {/* Distant Skyline & Foliage */}
    <path d="M 0 220 L 40 180 L 90 220 L 150 170 L 220 220 L 290 190 L 360 220 L 450 175 L 530 220 L 620 185 L 710 220 L 800 170 L 800 220 Z" fill="#0284c7" opacity="0.25" />
    <circle cx="80" cy="205" r="35" fill="#15803d" />
    <circle cx="120" cy="210" r="28" fill="#166534" />
    <circle cx="680" cy="205" r="35" fill="#15803d" />
    <circle cx="730" cy="210" r="30" fill="#166534" />
    <rect x="0" y="215" width="800" height="15" fill="#15803d" />

    {/* Sidewalks (Perspective) */}
    <polygon points="0,230 280,230 120,500 0,500" fill="url(#curbGradB)" />
    <polygon points="520,230 800,230 800,500 680,500" fill="url(#curbGradB)" />

    {/* Main Road Surface */}
    <polygon points="280,230 520,230 680,500 120,500" fill="url(#roadGradB)" />

    {/* Worn Center Line */}
    <polygon points="395,240 405,240 407,270 393,270" fill="#fef08a" opacity="0.6" />
    <polygon points="392,290 408,290 411,335 389,335" fill="#fef08a" opacity="0.6" />
    <polygon points="387,365 413,365 418,430 382,430" fill="#fef08a" opacity="0.4" />

    {/* Jagged Pothole Crater */}
    <path d="M 280 340 Q 320 320 400 325 Q 490 320 540 355 Q 560 395 500 425 Q 410 445 340 435 Q 260 415 280 340 Z" fill="#1e293b" opacity="0.9" />
    <path d="M 295 348 C 340 330, 470 332, 520 360 C 545 390, 485 418, 440 425 C 380 435, 300 410, 295 348 Z" fill="url(#potholeGradB)" />

    {/* Rubble in Pothole */}
    <ellipse cx="380" cy="375" rx="12" ry="7" fill="#64748b" />
    <ellipse cx="430" cy="385" rx="16" ry="8" fill="#475569" />
    <ellipse cx="340" cy="370" rx="9" ry="5" fill="#94a3b8" />
    <ellipse cx="480" cy="378" rx="14" ry="7" fill="#64748b" />
    <ellipse cx="410" cy="398" rx="18" ry="9" fill="#334155" />
    <ellipse cx="365" cy="395" rx="10" ry="6" fill="#94a3b8" />

    {/* Radiating Asphalt Cracks */}
    <path d="M 295 350 L 240 335 L 210 345 M 240 335 L 255 315" stroke="#0f172a" strokeWidth="3" fill="none" opacity="0.8" />
    <path d="M 525 365 L 590 355 L 630 370 M 590 355 L 605 330" stroke="#0f172a" strokeWidth="3" fill="none" opacity="0.8" />
    <path d="M 440 425 L 460 465 L 490 480" stroke="#0f172a" strokeWidth="4" fill="none" opacity="0.8" />
    <path d="M 330 425 L 290 460 L 260 475" stroke="#0f172a" strokeWidth="4" fill="none" opacity="0.8" />

    {/* Traffic Hazard Cone */}
    <g transform="translate(490, 275)">
      <polygon points="10,65 60,65 50,75 0,75" fill="#1e293b" />
      <polygon points="30,5 40,5 55,65 15,65" fill="#f97316" />
      <polygon points="26,22 44,22 47,33 23,33" fill="#ffffff" />
      <polygon points="21,43 49,43 52,53 18,53" fill="#ffffff" />
    </g>

    {/* Header Alert */}
    <rect x="20" y="20" width="340" height="42" rx="8" fill="#991b1b" opacity="0.92" />
    <text x="35" y="46" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14" fontWeight="bold" fill="#ffffff">
      🚩 BEFORE: DEEP POTHOLE REPORTED
    </text>

    {/* Location Footer */}
    <rect x="20" y="445" width="460" height="36" rx="6" fill="#0f172a" opacity="0.9" />
    <text x="32" y="468" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fill="#e2e8f0">
      📍 Ward 14, A.B. Road, Indore &bull; GPS: 22.7196° N, 75.8577° E
    </text>
  </svg>
)

export const AfterRepairGraphic = ({ className = 'w-100 h-100 object-fit-cover', style = {} }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 800 500"
    className={className}
    style={{ display: 'block', width: '100%', height: '100%', ...style }}
  >
    <defs>
      <linearGradient id="sunnySkyA" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="40%" stopColor="#38bdf8" />
        <stop offset="85%" stopColor="#7dd3fc" />
        <stop offset="100%" stopColor="#e0f2fe" />
      </linearGradient>
      <linearGradient id="newRoadGradA" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#334155" />
        <stop offset="40%" stopColor="#1e293b" />
        <stop offset="100%" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="cleanCurbA" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#e2e8f0" />
        <stop offset="100%" stopColor="#cbd5e1" />
      </linearGradient>
    </defs>

    {/* Sunny Blue Sky */}
    <rect x="0" y="0" width="800" height="220" fill="url(#sunnySkyA)" />

    {/* Warm Morning Sun */}
    <circle cx="720" cy="60" r="38" fill="#fef08a" opacity="0.9" />
    <circle cx="720" cy="60" r="54" fill="#fef08a" opacity="0.3" />

    {/* Modern City Skyline */}
    <rect x="180" y="140" width="55" height="80" fill="#94a3b8" opacity="0.4" />
    <rect x="245" y="120" width="45" height="100" fill="#64748b" opacity="0.45" />
    <rect x="520" y="130" width="60" height="90" fill="#64748b" opacity="0.45" />
    <rect x="590" y="150" width="50" height="70" fill="#94a3b8" opacity="0.4" />

    {/* Lush Green Trees */}
    <circle cx="60" cy="195" r="42" fill="#16a34a" />
    <circle cx="110" cy="205" r="34" fill="#15803d" />
    <circle cx="150" cy="210" r="28" fill="#166534" />
    <circle cx="650" cy="205" r="32" fill="#166534" />
    <circle cx="700" cy="195" r="40" fill="#15803d" />
    <circle cx="750" cy="205" r="35" fill="#16a34a" />
    <rect x="0" y="215" width="800" height="15" fill="#15803d" />

    {/* Clean Tiled Sidewalks */}
    <polygon points="0,230 280,230 120,500 0,500" fill="url(#cleanCurbA)" />
    <polygon points="520,230 800,230 800,500 680,500" fill="url(#cleanCurbA)" />

    <line x1="280" y1="230" x2="120" y2="500" stroke="#94a3b8" strokeWidth="4" />
    <line x1="520" y1="230" x2="680" y2="500" stroke="#94a3b8" strokeWidth="4" />
    <line x1="0" y1="360" x2="200" y2="360" stroke="#94a3b8" strokeWidth="1.5" opacity="0.5" />
    <line x1="600" y1="360" x2="800" y2="360" stroke="#94a3b8" strokeWidth="1.5" opacity="0.5" />

    {/* Painted Yellow & Black Curbs */}
    <polygon points="275,230 280,230 230,300 223,300" fill="#facc15" />
    <polygon points="223,300 230,300 178,390 170,390" fill="#0f172a" />
    <polygon points="170,390 178,390 120,500 110,500" fill="#facc15" />

    <polygon points="520,230 525,230 577,300 570,300" fill="#facc15" />
    <polygon points="570,300 577,300 630,390 622,390" fill="#0f172a" />
    <polygon points="622,390 630,390 690,500 680,500" fill="#facc15" />

    {/* Flawless, Newly Paved Smooth Asphalt Road */}
    <polygon points="280,230 520,230 680,500 120,500" fill="url(#newRoadGradA)" />
    <polygon points="360,230 440,230 510,500 290,500" fill="#ffffff" opacity="0.04" />

    {/* Bright Reflective White Lane Markings */}
    <polygon points="397,235 403,235 405,260 395,260" fill="#ffffff" />
    <polygon points="395,280 405,280 408,325 392,325" fill="#ffffff" />
    <polygon points="391,350 409,350 414,415 386,415" fill="#ffffff" />
    <polygon points="383,445 417,445 423,500 377,500" fill="#ffffff" />

    <polygon points="295,235 298,235 158,500 152,500" fill="#ffffff" opacity="0.85" />
    <polygon points="502,235 505,235 648,500 642,500" fill="#ffffff" opacity="0.85" />

    {/* Municipal PWD Van in Distance */}
    <g transform="translate(470, 218) scale(0.65)">
      <rect x="0" y="5" width="55" height="24" rx="3" fill="#0284c7" />
      <rect x="36" y="8" width="16" height="12" rx="2" fill="#bae6fd" />
      <circle cx="14" cy="29" r="6" fill="#0f172a" />
      <circle cx="44" cy="29" r="6" fill="#0f172a" />
      <rect x="18" y="1" width="8" height="4" fill="#facc15" />
    </g>

    {/* Green Success Stamp Overlay */}
    <rect x="20" y="20" width="370" height="42" rx="8" fill="#15803d" opacity="0.94" />
    <text x="35" y="46" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="14" fontWeight="bold" fill="#ffffff">
      ✓ AFTER: RECTIFIED &amp; NEWLY PAVED
    </text>

    {/* Bottom Certification Stamp */}
    <rect x="20" y="445" width="540" height="36" rx="6" fill="#0f172a" opacity="0.92" />
    <text x="32" y="468" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif" fontSize="12" fontWeight="600" fill="#4ade80">
      ✓ Certified by Municipal Junior Engineer &bull; 100% Quality Pass &bull; Road Opened
    </text>
  </svg>
)
