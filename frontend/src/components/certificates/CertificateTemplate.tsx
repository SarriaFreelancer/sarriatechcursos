export interface CertificateData {
  student_name: string;
  course_name: string;
  course_description: string;
  completion_date: string;
  course_duration: string;
  course_level: string;
  certificate_id: string;
  verification_url: string;
  instructor_name: string;
  instructor_signature?: string;
  admin_name: string;
  admin_signature?: string;
}

interface CertificateTemplateProps {
  data: CertificateData;
}

function esc(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function wrapText(text: string, maxChars: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function buildCertificateSvg(data: CertificateData) {
  const studentSize = data.student_name.length > 24 ? 55 : 75;
  const courseSize = data.course_name.length > 28 ? 40 : 56;
  const courseLines = wrapText(data.course_description, 58);

  const instructorSignature = data.instructor_signature
    ? `<image href="${data.instructor_signature}" x="0" y="-62" width="210" height="56" preserveAspectRatio="xMidYMid meet" />`
    : `<text x="105" y="-22" text-anchor="middle" font-size="28" fill="#ffffff" font-family="'Playfair Display', Georgia, 'Times New Roman', serif" font-style="italic">${esc(data.instructor_name)}</text>`;

  const adminSignature = data.admin_signature
    ? `<image href="${data.admin_signature}" x="0" y="-62" width="210" height="56" preserveAspectRatio="xMidYMid meet" />`
    : `<text x="105" y="-22" text-anchor="middle" font-size="28" fill="#ffffff" font-family="'Playfair Display', Georgia, 'Times New Roman', serif" font-style="italic">${esc(data.admin_name)}</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1480 1280" width="1480" height="1280">
  <defs>
    <!-- Dark Emerald Premium Background -->
    <radialGradient id="bg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#092415"/>
      <stop offset="50%" stop-color="#05140b"/>
      <stop offset="100%" stop-color="#020804"/>
    </radialGradient>
    
    <!-- Metallic Gold Gradient -->
    <linearGradient id="gold" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#AA771C"/>
      <stop offset="30%" stop-color="#D4AF37"/>
      <stop offset="50%" stop-color="#F3E5AB"/>
      <stop offset="70%" stop-color="#D4AF37"/>
      <stop offset="100%" stop-color="#8A5A19"/>
    </linearGradient>

    <!-- Glow Effect for Gold Elements -->
    <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <!-- Drop Shadow -->
    <filter id="dropShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.5"/>
    </filter>

    <!-- Subtle Watermark Pattern -->
    <pattern id="watermark" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <path d="M60 0 L120 60 L60 120 L0 60 Z" fill="none" stroke="#ffffff" stroke-opacity="0.02" stroke-width="1.5"/>
      <path d="M60 20 L100 60 L60 100 L20 60 Z" fill="none" stroke="#ffffff" stroke-opacity="0.015" stroke-width="1"/>
      <path d="M 10 10 L 110 110 M 110 10 L 10 110" fill="none" stroke="#ffffff" stroke-opacity="0.01" stroke-width="1"/>
      <circle cx="60" cy="60" r="4" fill="#ffffff" fill-opacity="0.015"/>
    </pattern>

    <style>
      .title { font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-weight: 700; }
      .sans { font-family: 'Montserrat', Arial, Helvetica, sans-serif; }
      .value { font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; font-weight: 700; }
    </style>
  </defs>

  <!-- Backgrounds -->
  <rect x="0" y="0" width="1480" height="1280" fill="url(#bg)"/>
  <rect x="0" y="0" width="1480" height="1280" fill="url(#watermark)"/>

  <!-- Elegant Gold Borders -->
  <rect x="30" y="30" width="1420" height="1220" fill="none" stroke="url(#gold)" stroke-opacity="0.9" stroke-width="2"/>
  <rect x="40" y="40" width="1400" height="1200" fill="none" stroke="url(#gold)" stroke-opacity="0.4" stroke-width="1"/>
  
  <rect x="60" y="60" width="1360" height="1160" fill="none" stroke="url(#gold)" stroke-width="5" filter="url(#goldGlow)"/>
  <rect x="70" y="70" width="1340" height="1140" fill="none" stroke="url(#gold)" stroke-opacity="0.7" stroke-width="1"/>

  <!-- Corner Ornaments -->
  <!-- Top Left -->
  <path d="M 60 120 L 120 60" stroke="url(#gold)" stroke-width="2" filter="url(#goldGlow)"/>
  <path d="M 60 140 L 140 60" stroke="url(#gold)" stroke-width="1" stroke-opacity="0.6"/>
  <!-- Top Right -->
  <path d="M 1420 120 L 1360 60" stroke="url(#gold)" stroke-width="2" filter="url(#goldGlow)"/>
  <path d="M 1420 140 L 1340 60" stroke="url(#gold)" stroke-width="1" stroke-opacity="0.6"/>
  <!-- Bottom Left -->
  <path d="M 60 1160 L 120 1220" stroke="url(#gold)" stroke-width="2" filter="url(#goldGlow)"/>
  <path d="M 60 1140 L 140 1220" stroke="url(#gold)" stroke-width="1" stroke-opacity="0.6"/>
  <!-- Bottom Right -->
  <path d="M 1420 1160 L 1360 1220" stroke="url(#gold)" stroke-width="2" filter="url(#goldGlow)"/>
  <path d="M 1420 1140 L 1340 1220" stroke="url(#gold)" stroke-width="1" stroke-opacity="0.6"/>

  <!-- Logo and Glowing Dot -->
  <g transform="translate(100 120)">
    <!-- Small bright green dot -->
    <circle cx="20" cy="-12" r="6" fill="#00ff66" filter="url(#goldGlow)"/>
    <circle cx="20" cy="-12" r="3" fill="#ffffff"/>
    
    <text x="38" y="0" font-size="44" fill="#ffffff" class="title">Sarria<tspan fill="url(#gold)">Tech</tspan></text>
    <text x="42" y="24" font-size="12" fill="url(#gold)" class="sans" letter-spacing="0.35em" font-weight="600">SOFTWARE DEV ACADEMY</text>
  </g>

  <!-- Elegant Rocket Illustration (Top Center) -->
  <g transform="translate(740 130) scale(1.6) rotate(15)" filter="url(#goldGlow)">
    <path d="M0 -20 Q 8 -10 8 5 Q 8 15 3 20 L -3 20 Q -8 15 -8 5 Q -8 -10 0 -20 Z" stroke="url(#gold)" fill="none" stroke-width="1.5" />
    <path d="M-8 5 Q -14 12 -12 18 L -3 15" stroke="url(#gold)" fill="none" stroke-width="1.5" />
    <path d="M8 5 Q 14 12 12 18 L 3 15" stroke="url(#gold)" fill="none" stroke-width="1.5" />
    <circle cx="0" cy="-2" r="2.5" stroke="url(#gold)" fill="none" stroke-width="1" />
    <path d="M-3 20 L -5 26 L 0 24 L 5 26 L 3 20" stroke="url(#gold)" fill="none" stroke-width="1" />
  </g>

  <!-- Certificate ID Badge -->
  <g transform="translate(1100 90)" filter="url(#dropShadow)">
    <rect x="0" y="0" width="280" height="70" rx="0" fill="#020804" stroke="url(#gold)" stroke-width="1.5"/>
    <text x="96" y="28" class="sans" fill="url(#gold)" letter-spacing="0.2em" font-size="11" font-weight="600">CERTIFICADO ID</text>
    <text x="96" y="52" class="sans" font-size="16" font-weight="700" fill="#ffffff" letter-spacing="0.05em">${esc(data.certificate_id)}</text>
    <circle cx="44" cy="35" r="16" fill="none" stroke="url(#gold)" stroke-width="1.5"/>
    <circle cx="44" cy="35" r="12" fill="none" stroke="url(#gold)" stroke-width="0.5"/>
    <path d="M44 23 L44 47 M32 35 L56 35" stroke="url(#gold)" stroke-width="1.5"/>
  </g>

  <!-- Main Title -->
  <text x="740" y="270" text-anchor="middle" font-size="76" fill="#ffffff" class="title" letter-spacing="0.25em">CERTIFICADO</text>
  <text x="740" y="340" text-anchor="middle" font-size="68" fill="url(#gold)" class="title" letter-spacing="0.15em" filter="url(#goldGlow)">DE APROBACIÓN</text>

  <!-- Subtitle -->
  <rect x="490" y="400" width="500" height="30" rx="15" fill="none" stroke="url(#gold)" stroke-width="1" stroke-opacity="0.5"/>
  <text x="740" y="420" text-anchor="middle" font-size="11" fill="url(#gold)" letter-spacing="0.25em" class="sans" font-weight="600">SE OTORGA ORGULLOSAMENTE A</text>

  <!-- Student Name -->
  <text x="740" y="520" text-anchor="middle" font-size="${studentSize}" fill="#ffffff" class="title" font-style="italic" filter="url(#dropShadow)">${esc(data.student_name)}</text>
  
  <line x1="340" y1="560" x2="1140" y2="560" stroke="url(#gold)" stroke-width="2" filter="url(#goldGlow)"/>
  <path d="M730 560 L740 550 L750 560 L740 570 Z" fill="url(#gold)" filter="url(#goldGlow)"/>

  <!-- Course Info -->
  <text x="740" y="620" text-anchor="middle" font-size="13" fill="#a0b3a8" class="sans" letter-spacing="0.25em">POR HABER COMPLETADO SATISFACTORIAMENTE EL CURSO</text>
  <text x="740" y="670" text-anchor="middle" font-size="${courseSize}" fill="url(#gold)" class="title" letter-spacing="0.05em" filter="url(#goldGlow)">${esc(data.course_name)}</text>
  
  <text x="740" y="720" text-anchor="middle" font-size="15" fill="#ffffff" class="sans" font-weight="300">
    ${courseLines.map((line, idx) => `<tspan x="740" dy="${idx === 0 ? 0 : 26}">${esc(line)}</tspan>`).join('')}
  </text>

  <!-- Stats Grid -->
  <g transform="translate(220 820)" filter="url(#dropShadow)">
    <rect x="0" y="0" width="316" height="80" rx="0" fill="#020804" fill-opacity="0.6" stroke="url(#gold)" stroke-opacity="0.5" stroke-width="1"/>
    <text x="158" y="30" text-anchor="middle" class="sans" font-size="11" fill="url(#gold)" letter-spacing="0.2em" font-weight="600">FECHA DE FINALIZACIÓN</text>
    <text x="158" y="60" text-anchor="middle" font-size="20" fill="#ffffff" class="value">${esc(data.completion_date)}</text>
  </g>

  <g transform="translate(582 820)" filter="url(#dropShadow)">
    <rect x="0" y="0" width="316" height="80" rx="0" fill="#020804" fill-opacity="0.6" stroke="url(#gold)" stroke-opacity="0.5" stroke-width="1"/>
    <text x="158" y="30" text-anchor="middle" class="sans" font-size="11" fill="url(#gold)" letter-spacing="0.2em" font-weight="600">DURACIÓN</text>
    <text x="158" y="60" text-anchor="middle" font-size="20" fill="#ffffff" class="value">${esc(data.course_duration)}</text>
  </g>

  <g transform="translate(944 820)" filter="url(#dropShadow)">
    <rect x="0" y="0" width="316" height="80" rx="0" fill="#020804" fill-opacity="0.6" stroke="url(#gold)" stroke-opacity="0.5" stroke-width="1"/>
    <text x="158" y="30" text-anchor="middle" class="sans" font-size="11" fill="url(#gold)" letter-spacing="0.2em" font-weight="600">NIVEL</text>
    <text x="158" y="60" text-anchor="middle" font-size="20" fill="#ffffff" class="value">${esc(data.course_level)}</text>
  </g>

  <!-- Signatures and Seals -->
  <g transform="translate(176 1060)">
    ${instructorSignature}
    <line x1="0" y1="-10" x2="210" y2="-10" stroke="url(#gold)" stroke-width="1.5" stroke-dasharray="4 2"/>
    <text x="105" y="10" text-anchor="middle" font-size="12" fill="url(#gold)" class="sans" letter-spacing="0.2em" font-weight="600">INSTRUCTOR</text>
  </g>

  <g transform="translate(590 980)">
    <!-- Premium Seal -->
    <circle cx="150" cy="50" r="75" fill="url(#bg)" stroke="url(#gold)" stroke-width="3" filter="url(#dropShadow)"/>
    <circle cx="150" cy="50" r="65" fill="none" stroke="url(#gold)" stroke-dasharray="3 3" stroke-width="1.5"/>
    <circle cx="150" cy="50" r="58" fill="none" stroke="url(#gold)" stroke-width="1" stroke-opacity="0.5"/>
    <!-- Center text -->
    <text x="150" y="48" text-anchor="middle" font-size="20" fill="#ffffff" class="title">Sarria<tspan fill="url(#gold)">Tech</tspan></text>
    <text x="150" y="68" text-anchor="middle" font-size="10" fill="url(#gold)" class="sans" letter-spacing="0.25em" font-weight="600">EXCELLENCE</text>
    <!-- Little star/diamond -->
    <path d="M 150 15 L 153 23 L 161 26 L 153 29 L 150 37 L 147 29 L 139 26 L 147 23 Z" fill="url(#gold)" filter="url(#goldGlow)"/>
  </g>

  <g transform="translate(1056 1060)">
    ${adminSignature}
    <line x1="0" y1="-10" x2="210" y2="-10" stroke="url(#gold)" stroke-width="1.5" stroke-dasharray="4 2"/>
    <text x="105" y="10" text-anchor="middle" font-size="12" fill="url(#gold)" class="sans" letter-spacing="0.2em" font-weight="600">ADMINISTRADOR</text>
  </g>

  <!-- QR Code / Verify area -->
  

  <!-- Footer text -->
  <text x="740" y="1220" text-anchor="middle" font-size="12" fill="#a0b3a8" class="sans" letter-spacing="0.3em">SARRIATECH IMPULSA TU FUTURO <tspan fill="url(#gold)">·</tspan> SIGUE APRENDIENDO, SIGUE CREANDO</text>
</svg>`;
}

export function CertificateTemplate({ data }: CertificateTemplateProps) {
  const svg = buildCertificateSvg(data);
  const src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  return <img src={src} alt="Certificado de aprobación" className="block h-auto w-full select-none object-contain" draggable={false} />;
}
