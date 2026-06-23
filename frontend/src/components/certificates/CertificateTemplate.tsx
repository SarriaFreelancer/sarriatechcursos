import { CalendarDays, Clock3, Gauge, BadgeCheck, QrCode, Award } from 'lucide-react';

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
  previewMode?: boolean;
}

function fitTextClass(text: string, base: string, long: string, extraLong: string) {
  if (text.length > 36) return extraLong;
  if (text.length > 24) return long;
  return base;
}

function signatureBlock(signature?: string, name = '', role = '') {
  return (
    <div className="flex min-w-0 flex-col items-center gap-3">
      <div className="flex h-12 items-end justify-center sm:h-14">
        {signature ? (
          <img src={signature} alt={`${name} signature`} className="max-h-full max-w-[180px] object-contain" />
        ) : (
          <div className="text-center leading-tight">
            <p className="text-xs font-semibold text-white sm:text-sm">{name}</p>
            <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-lime-400 sm:text-xs sm:tracking-[0.35em]">{role}</p>
          </div>
        )}
      </div>
      <div className="h-px w-32 bg-lime-400/70 shadow-[0_0_16px_rgba(168,255,0,0.75)] sm:w-44" />
    </div>
  );
}

export function CertificateTemplate({ data, previewMode = false }: CertificateTemplateProps) {
  const nameClass = fitTextClass(data.student_name, 'text-[20px] sm:text-[32px]', 'text-[18px] sm:text-[28px]', 'text-[16px] sm:text-[24px]');
  const courseClass = fitTextClass(data.course_name, 'text-[16px] sm:text-[24px]', 'text-[15px] sm:text-[20px]', 'text-[14px] sm:text-[18px]');

  return (
    <div className="certificate-shell relative mx-auto aspect-[279.4/215.9] w-full origin-top scale-[0.78] overflow-hidden rounded-[18px] border border-lime-400/35 bg-[#050505] text-white shadow-[0_0_80px_rgba(0,0,0,0.65)] print:scale-100 print:border-0 print:shadow-none sm:scale-100 sm:rounded-[28px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(168,255,0,0.12),transparent_34%),radial-gradient(circle_at_bottom,rgba(168,255,0,0.08),transparent_32%),linear-gradient(180deg,#090909_0%,#050505_100%)]" />
      <div className="absolute inset-0 opacity-35 bg-[linear-gradient(135deg,transparent_0%,transparent_35%,rgba(168,255,0,0.08)_36%,transparent_37%,transparent_100%)]" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-3 top-3 h-16 w-16 rounded-full border border-lime-400/25 border-dashed sm:left-5 sm:top-5 sm:h-24 sm:w-24" />
        <div className="absolute right-3 top-3 h-[4.5rem] w-[4.5rem] rounded-full border border-lime-400/18 border-dashed sm:right-6 sm:top-6 sm:h-28 sm:w-28" />
        <div className="absolute inset-x-6 top-1/2 h-px bg-gradient-to-r from-transparent via-lime-400/15 to-transparent" />
      </div>

      <div className="relative flex h-full w-full flex-col px-2 py-2 sm:px-6 sm:py-6 lg:px-14 lg:py-10">
        <div className="absolute right-2 top-2 rounded-2xl border border-lime-400/35 bg-black/45 px-2 py-1.5 backdrop-blur-sm sm:right-5 sm:top-5 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <BadgeCheck className="h-5 w-5 text-lime-400 drop-shadow-[0_0_10px_rgba(168,255,0,0.7)] sm:h-8 sm:w-8" />
            <div className="text-right">
              <p className="text-[8px] uppercase tracking-[0.22em] text-white/75 sm:text-[11px] sm:tracking-[0.35em]">Certificado ID</p>
              <p className="text-xs font-semibold tracking-wide sm:text-lg">{data.certificate_id}</p>
            </div>
          </div>
        </div>

        <div className="absolute left-2 top-2 flex items-center gap-1.5 text-lime-400 sm:left-5 sm:top-5 sm:gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-lime-400/30 bg-black/35 shadow-[0_0_16px_rgba(168,255,0,0.12)] sm:h-16 sm:w-16">
            <span className="text-sm font-black leading-none sm:text-xl">&lt;/&gt;</span>
          </div>
          <div>
            <p className="text-base font-extrabold tracking-tight sm:text-4xl">
              Sarria<span className="text-lime-400">Tech</span>
            </p>
            <p className="text-[8px] uppercase tracking-[0.2em] text-white/70 sm:text-sm sm:tracking-[0.35em]">Software Dev Academy</p>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center pt-8 sm:pt-14 lg:pt-20">
          <div className="mx-auto w-full max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-black/40 px-2.5 py-0.5 text-[6px] uppercase tracking-[0.12em] text-white/80 sm:px-4 sm:py-1.5 sm:text-[10px] sm:tracking-[0.3em]">
              <span className="h-2 w-2 rounded-full bg-lime-400 shadow-[0_0_12px_rgba(168,255,0,0.9)]" />
              Certificado
            </div>

            <h1 className="mt-2 text-[18px] font-black uppercase tracking-[0.05em] text-white sm:mt-3 sm:text-[48px] lg:text-[64px]">
              Certificado
            </h1>
            <h2 className="mt-1 text-[18px] font-black uppercase tracking-[0.04em] text-lime-400 drop-shadow-[0_0_18px_rgba(168,255,0,0.55)] sm:text-[48px] lg:text-[64px]">
              De Aprobación
            </h2>

            <p className="mt-2 text-[7px] font-medium uppercase tracking-[0.12em] text-white/75 sm:mt-6 sm:text-[11px] sm:tracking-[0.3em]">
              Este certificado se otorga a:
            </p>
            <p
              className={`${nameClass} mt-2 font-[cursive] italic leading-none text-white break-words text-balance drop-shadow-[0_0_14px_rgba(255,255,255,0.22)]`}
              style={{ overflowWrap: 'anywhere' }}
            >
              {data.student_name}
            </p>

            <div className="mx-auto mt-2 max-w-4xl rounded-[14px] border border-lime-400/40 bg-[#111111]/85 px-3 py-2 shadow-[0_0_40px_rgba(168,255,0,0.12)] backdrop-blur-sm sm:mt-6 sm:rounded-[22px] sm:px-6 sm:py-4">
              <p className="text-[6px] uppercase tracking-[0.12em] text-white/70 sm:text-[10px] sm:tracking-[0.28em]">Por haber completado y aprobado el curso</p>
              <h3 className={`${courseClass} mt-2 font-extrabold uppercase tracking-[0.05em] text-white`}>
                {data.course_name}
              </h3>
              <p className="mx-auto mt-1 max-w-3xl text-[8px] leading-snug text-white/72 sm:mt-2 sm:text-[11px] sm:leading-relaxed">
                {data.course_description}
              </p>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-2 sm:mt-6 sm:grid-cols-3 sm:gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/35 px-2.5 py-2 text-left sm:px-4 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <CalendarDays className="h-3 w-3 flex-shrink-0 text-lime-400 sm:h-4 sm:w-4" />
                  <div className="min-w-0">
                    <p className="text-[6px] uppercase tracking-[0.12em] text-white/60 sm:text-[10px] sm:tracking-[0.22em]">Fecha de finalización</p>
                    <p className="mt-1 text-[9px] font-semibold sm:text-sm">{data.completion_date}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/35 px-2.5 py-2 text-left sm:px-4 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Clock3 className="h-3 w-3 flex-shrink-0 text-lime-400 sm:h-4 sm:w-4" />
                  <div className="min-w-0">
                    <p className="text-[6px] uppercase tracking-[0.12em] text-white/60 sm:text-[10px] sm:tracking-[0.22em]">Duración</p>
                    <p className="mt-1 text-[9px] font-semibold sm:text-sm">{data.course_duration}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/35 px-2.5 py-2 text-left sm:px-4 sm:py-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Gauge className="h-3 w-3 flex-shrink-0 text-lime-400 sm:h-4 sm:w-4" />
                  <div className="min-w-0">
                    <p className="text-[6px] uppercase tracking-[0.12em] text-white/60 sm:text-[10px] sm:tracking-[0.22em]">Nivel</p>
                    <p className="mt-1 text-[9px] font-semibold sm:text-sm">{data.course_level}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-2 lg:mt-8 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
              <div className="flex justify-center lg:justify-start">{signatureBlock(data.instructor_signature, data.instructor_name, 'Instructor')}</div>

              <div className="order-first flex justify-center lg:order-none">
                <div className="relative flex h-18 w-18 items-center justify-center rounded-full border border-lime-400/50 bg-[radial-gradient(circle,rgba(168,255,0,0.16)_0%,rgba(0,0,0,0.92)_58%)] shadow-[0_0_40px_rgba(168,255,0,0.18)] sm:h-28 sm:w-28 lg:h-32 lg:w-32">
                  <div className="absolute inset-2 rounded-full border border-lime-400/30 sm:inset-3" />
                  <div className="absolute inset-0 rounded-full border border-lime-400/15" />
                  <div className="absolute inset-3 rounded-full border border-lime-400/20 border-dashed sm:inset-5" />
                  <div className="text-center">
                    <Award className="mx-auto h-3.5 w-3.5 text-lime-400 drop-shadow-[0_0_10px_rgba(168,255,0,0.7)] sm:h-6 sm:w-6" />
                    <p className="mt-1 text-[7px] font-semibold tracking-wide sm:mt-2 sm:text-xs">SarriaTech</p>
                    <p className="text-[5px] uppercase tracking-[0.16em] text-white/65 sm:text-[9px] sm:tracking-[0.32em]">Academy</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center lg:justify-end">{signatureBlock(data.admin_signature, data.admin_name, 'Administrador')}</div>
            </div>

            <div className="mt-3 flex flex-col items-center gap-2 sm:mt-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl rounded-full border border-lime-400/20 bg-black/30 px-3 py-1.5 text-center text-[8px] text-white/80 shadow-[0_0_30px_rgba(168,255,0,0.08)] sm:px-6 sm:py-3 sm:text-sm">
                SarriaTech impulsa tu futuro. Sigue aprendiendo, sigue creando.
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-lime-400/40 bg-black/60 p-2 shadow-[0_0_24px_rgba(168,255,0,0.12)] sm:h-24 sm:w-24">
                  <QrCode className="h-9 w-9 text-white/85 sm:h-16 sm:w-16" />
                </div>
                <p className="text-[6px] font-semibold uppercase tracking-[0.12em] text-white/70 sm:text-[10px] sm:tracking-[0.24em]">Verifica este certificado</p>
              </div>
            </div>

            {previewMode && (
              <p className="mt-2 text-[6px] uppercase tracking-[0.14em] text-lime-400/80 sm:mt-3 sm:text-[10px] sm:tracking-[0.3em]">
                Modo de prueba activado
              </p>
            )}
          </div>
        </div>

        <div className="absolute bottom-3 left-0 right-0 flex justify-center sm:bottom-4">
          <div className="h-px w-[92%] bg-lime-400/25 shadow-[0_0_16px_rgba(168,255,0,0.35)]" />
        </div>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.28)_100%)]" />
      </div>
    </div>
  );
}
