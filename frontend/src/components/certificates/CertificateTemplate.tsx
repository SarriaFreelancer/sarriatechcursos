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
  const studentSize = data.student_name.length > 24 ? 19 : 25;
  const courseSize = data.course_name.length > 28 ? 14 : 18;
  const courseLines = wrapText(data.course_description, 58);

  const instructorSignature = data.instructor_signature
    ? `<image href="${data.instructor_signature}" x="0" y="-62" width="210" height="56" preserveAspectRatio="xMidYMid meet" />`
    : `<text x="105" y="-22" text-anchor="middle" font-size="19" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-style="italic">${esc(data.instructor_name)}</text>`;

  const adminSignature = data.admin_signature
    ? `<image href="${data.admin_signature}" x="0" y="-62" width="210" height="56" preserveAspectRatio="xMidYMid meet" />`
    : `<text x="105" y="-22" text-anchor="middle" font-size="19" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-style="italic">${esc(data.admin_name)}</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1480 1280" width="1480" height="1280">
  <defs>
    <radialGradient id="bg" cx="50%" cy="28%" r="92%">
      <stop offset="0%" stop-color="#13201a"/>
      <stop offset="60%" stop-color="#09110d"/>
      <stop offset="100%" stop-color="#050807"/>
    </radialGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#95b428"/>
      <stop offset="100%" stop-color="#d5e2a1"/>
    </linearGradient>
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
    <style>
      .small { font-family: Arial, Helvetica, sans-serif; fill: #e8ece8; letter-spacing: 0.08em; }
      .label { font-family: Arial, Helvetica, sans-serif; fill: #d5dbd7; letter-spacing: 0.12em; }
    </style>
  </defs>

  <rect x="0" y="0" width="1480" height="1280" rx="28" fill="url(#bg)"/>
  <rect x="18" y="18" width="1444" height="1244" rx="24" fill="none" stroke="#a8b857" stroke-opacity="0.42" stroke-width="2"/>
  <rect x="38" y="38" width="1404" height="1204" rx="22" fill="none" stroke="#ffffff" stroke-opacity="0.08" stroke-width="1.4"/>
  <rect x="58" y="58" width="1364" height="1164" rx="20" fill="none" stroke="#95b428" stroke-opacity="0.11" stroke-width="1.2" stroke-dasharray="8 10"/>

  <g transform="translate(96 74)">
    <text x="0" y="0" font-size="24" fill="#b8c961" font-family="Arial, Helvetica, sans-serif" font-weight="900">&lt;/&gt;</text>
    <text x="82" y="-2" font-size="42" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="800">Sarria<tspan fill="#b8c961">Tech</tspan></text>
    <text x="84" y="24" font-size="12" fill="#c9d0cb" font-family="Arial, Helvetica, sans-serif" letter-spacing="0.26em">SOFTWARE DEV ACADEMY</text>
  </g>

  <g transform="translate(1124 56)" filter="url(#softShadow)">
    <rect x="0" y="0" width="290" height="80" rx="18" fill="#0a120e" fill-opacity="0.84" stroke="#a8b857" stroke-opacity="0.42"/>
    <text x="96" y="32" class="label" font-size="13">CERTIFICADO ID</text>
    <text x="90" y="58" class="small" font-size="20" font-weight="700">${esc(data.certificate_id)}</text>
    <circle cx="44" cy="40" r="15" fill="none" stroke="#b8c961" stroke-width="4"/>
    <path d="M44 22 L44 58 M26 40 L62 40" stroke="#b8c961" stroke-width="4"/>
  </g>

  <text x="740" y="214" text-anchor="middle" font-size="58" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-weight="700" letter-spacing="0.22em">CERTIFICADO</text>
  <text x="740" y="282" text-anchor="middle" font-size="56" fill="url(#accent)" font-family="Georgia, 'Times New Roman', serif" font-weight="700" letter-spacing="0.12em">DE APROBACIÓN</text>

  <rect x="454" y="346" width="572" height="36" rx="18" fill="#0b110d" fill-opacity="0.5" stroke="#ffffff" stroke-opacity="0.12"/>
  <text x="740" y="369" text-anchor="middle" font-size="11" fill="#ffffff" fill-opacity="0.84" letter-spacing="0.22em" font-family="Arial, Helvetica, sans-serif">ESTE CERTIFICADO SE OTORGA A</text>

  <text x="740" y="438" text-anchor="middle" font-size="${studentSize}" fill="#ffffff" font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-weight="600">${esc(data.student_name)}</text>
  <line x1="380" y1="470" x2="1100" y2="470" stroke="#b8c961" stroke-width="1.5" stroke-opacity="0.85"/>

  <rect x="220" y="500" width="1040" height="92" rx="18" fill="#0a120e" fill-opacity="0.84" stroke="#a8b857" stroke-opacity="0.28"/>
  <text x="740" y="526" text-anchor="middle" font-size="10.5" fill="#dfe5e0" fill-opacity="0.92" font-family="Arial, Helvetica, sans-serif" letter-spacing="0.2em">POR HABER COMPLETADO Y APROBADO EL CURSO</text>
  <text x="740" y="557" text-anchor="middle" font-size="${courseSize}" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="800" letter-spacing="0.02em">${esc(data.course_name)}</text>
  <text x="740" y="579" text-anchor="middle" font-size="10" fill="#cfd6d1" font-family="Arial, Helvetica, sans-serif">
    ${courseLines.map((line, idx) => `<tspan x="740" dy="${idx === 0 ? 0 : 13}">${esc(line)}</tspan>`).join('')}
  </text>

  <g transform="translate(220 642)" filter="url(#softShadow)">
    <rect x="0" y="0" width="316" height="72" rx="15" fill="#09100d" fill-opacity="0.72" stroke="#ffffff" stroke-opacity="0.1"/>
    <text x="20" y="22" class="label" font-size="9.2">FECHA DE FINALIZACIÓN</text>
    <text x="20" y="48" font-size="15" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="700">${esc(data.completion_date)}</text>
  </g>

  <g transform="translate(582 642)" filter="url(#softShadow)">
    <rect x="0" y="0" width="316" height="72" rx="15" fill="#09100d" fill-opacity="0.72" stroke="#ffffff" stroke-opacity="0.1"/>
    <text x="20" y="22" class="label" font-size="9.2">DURACIÓN</text>
    <text x="20" y="48" font-size="15" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="700">${esc(data.course_duration)}</text>
  </g>

  <g transform="translate(944 642)" filter="url(#softShadow)">
    <rect x="0" y="0" width="316" height="72" rx="15" fill="#09100d" fill-opacity="0.72" stroke="#ffffff" stroke-opacity="0.1"/>
    <text x="20" y="22" class="label" font-size="9.2">NIVEL</text>
    <text x="20" y="48" font-size="15" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="700">${esc(data.course_level)}</text>
  </g>

  <g transform="translate(176 1000)">
    ${instructorSignature}
    <line x1="18" y1="-14" x2="192" y2="-14" stroke="#b8c961" stroke-width="1.5" stroke-opacity="0.88"/>
    <text x="105" y="2" text-anchor="middle" font-size="10.5" fill="#b8c961" font-family="Arial, Helvetica, sans-serif" letter-spacing="0.18em">INSTRUCTOR</text>
  </g>

  <g transform="translate(590 918)">
    <circle cx="150" cy="36" r="52" fill="url(#accent)" fill-opacity="0.08" stroke="#a8b857" stroke-width="2"/>
    <circle cx="150" cy="36" r="43" fill="#0a100d" stroke="#ffffff" stroke-opacity="0.08"/>
    <text x="150" y="35" text-anchor="middle" font-size="13" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-weight="800">Sarria<tspan fill="#b8c961">Tech</tspan></text>
    <text x="150" y="50" text-anchor="middle" font-size="8" fill="#d7ddd8" font-family="Arial, Helvetica, sans-serif" letter-spacing="2.2">ACADEMY</text>
  </g>

  <g transform="translate(1056 1000)">
    ${adminSignature}
    <line x1="18" y1="-14" x2="192" y2="-14" stroke="#b8c961" stroke-width="1.5" stroke-opacity="0.88"/>
    <text x="105" y="2" text-anchor="middle" font-size="10.5" fill="#b8c961" font-family="Arial, Helvetica, sans-serif" letter-spacing="0.18em">ADMINISTRADOR</text>
  </g>

  <g transform="translate(1224 846)">
    <rect x="0" y="0" width="100" height="100" rx="14" fill="#f7f7f7" stroke="#a8b857" stroke-width="4"/>
    <rect x="10" y="10" width="20" height="20" fill="#111"/>
    <rect x="13" y="13" width="13" height="13" fill="#f7f7f7"/>
    <rect x="70" y="10" width="20" height="20" fill="#111"/>
    <rect x="73" y="13" width="13" height="13" fill="#f7f7f7"/>
    <rect x="10" y="70" width="20" height="20" fill="#111"/>
    <rect x="13" y="73" width="13" height="13" fill="#f7f7f7"/>
    <rect x="40" y="13" width="5" height="5" fill="#111"/>
    <rect x="48" y="13" width="5" height="5" fill="#111"/>
    <rect x="40" y="21" width="5" height="5" fill="#111"/>
    <rect x="60" y="40" width="5" height="5" fill="#111"/>
    <rect x="40" y="40" width="5" height="5" fill="#111"/>
    <rect x="34" y="48" width="5" height="5" fill="#111"/>
    <rect x="56" y="56" width="5" height="5" fill="#111"/>
    <rect x="74" y="40" width="5" height="5" fill="#111"/>
    <rect x="40" y="74" width="5" height="5" fill="#111"/>
    <rect x="50" y="48" width="5" height="5" fill="#111"/>
    <text x="50" y="126" text-anchor="middle" font-size="8.5" fill="#d7ddd8" font-family="Arial, Helvetica, sans-serif">VERIFICA ESTE CERTIFICADO</text>
  </g>

  <rect x="252" y="1140" width="976" height="26" rx="13" fill="#000000" fill-opacity="0.24" stroke="#a8b857" stroke-opacity="0.14"/>
  <text x="740" y="1158" text-anchor="middle" font-size="12.5" fill="#d7ddd8" font-family="Arial, Helvetica, sans-serif">SarriaTech impulsa tu futuro. <tspan fill="#b8c961">Sigue aprendiendo, sigue creando.</tspan></text>
</svg>`;
}

export function CertificateTemplate({ data }: CertificateTemplateProps) {
  const svg = buildCertificateSvg(data);
  const src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  return <img src={src} alt="Certificado de aprobación" className="block h-auto w-full select-none object-contain" draggable={false} />;
}
