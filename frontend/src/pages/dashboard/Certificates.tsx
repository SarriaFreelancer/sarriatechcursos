import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, GraduationCap, ShieldCheck, Image as ImageIcon, FileText } from 'lucide-react';
import html2canvas from 'html2canvas';
import { CertificateTemplate, type CertificateData } from '../../components/certificates/CertificateTemplate';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/axios';

type ProfileCourse = {
  courseId: number;
  title: string;
  imageUrl: string | null;
  instructorName: string;
  category: string;
  progress: number;
  courseProgress?: number;
  status?: string;
  enrolledAt: string;
};

type ProfileResponse = {
  profile: { id: number; name: string; email: string; roleName: string };
  stats: { coursesEnrolled: number; coursesCompleted: number; certificatesCount: number };
  enrollments: ProfileCourse[];
};

function toCertificateData(course: ProfileCourse, studentName: string): CertificateData {
  const date = new Date(course.enrolledAt);
  const id = `ST-${date.getFullYear()}-${String(course.courseId).padStart(4, '0')}`;

  return {
    student_name: studentName,
    course_name: course.title,
    course_description: `Curso de ${course.category} impartido por ${course.instructorName}.`,
    completion_date: date.toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
    course_duration: '30 horas en vivo',
    course_level: Math.max(course.courseProgress ?? 0, course.progress ?? 0) >= 100 || course.status === 'COMPLETED' ? 'Aprobado' : 'En progreso',
    certificate_id: id,
    verification_url: `https://sarriatech.com/certificados/${id}`,
    instructor_name: course.instructorName,
    admin_name: 'SarriaTech Admin',
  };
}

function buildPrintableHtml(data: CertificateData, previewMode: boolean) {
  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Certificado SarriaTech</title>
      <style>
        html, body { margin: 0; padding: 0; background: #050505; }
        body { font-family: Arial, Helvetica, sans-serif; }
        * { box-sizing: border-box; }
        @page { size: 279.4mm 215.9mm; margin: 0; }
        .page {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background:
            radial-gradient(circle at top, rgba(168,255,0,.12), transparent 34%),
            radial-gradient(circle at bottom, rgba(168,255,0,.08), transparent 32%),
            linear-gradient(180deg, #090909 0%, #050505 100%);
          color: #fff;
          overflow: hidden;
        }
        .certificate {
          position: relative;
          width: 279.4mm;
          height: 215.9mm;
          border: 2px solid rgba(168,255,0,.35);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 0 80px rgba(0,0,0,.65);
          background:
            radial-gradient(circle at top, rgba(168,255,0,.12), transparent 34%),
            radial-gradient(circle at bottom, rgba(168,255,0,.08), transparent 32%),
            linear-gradient(180deg, #090909 0%, #050505 100%);
        }
        .grain::before {
          content: "";
          position: absolute; inset: 0;
          background-image: radial-gradient(rgba(168,255,0,.18) 1px, transparent 1px);
          background-size: 18px 18px;
          opacity: .14;
          mask-image: linear-gradient(to right, transparent 0, black 9%, black 91%, transparent 100%);
        }
        .inner { position: absolute; inset: 0; padding: 30px 48px 26px; }
        .top-left, .top-right { position: absolute; top: 26px; }
        .top-left { left: 28px; display: flex; align-items: center; gap: 14px; color: #a8ff00; }
        .top-right { right: 28px; border: 1px solid rgba(168,255,0,.35); border-radius: 22px; padding: 18px 20px; background: rgba(0,0,0,.45); }
        .brand-name { font-size: 58px; line-height: .9; font-weight: 800; letter-spacing: -.04em; }
        .brand-name span { color: #a8ff00; }
        .brand-sub { font-size: 15px; letter-spacing: .34em; text-transform: uppercase; color: rgba(255,255,255,.72); margin-top: 6px; }
        .id-label { font-size: 12px; letter-spacing: .35em; color: rgba(255,255,255,.75); text-transform: uppercase; text-align: right; }
        .id-value { margin-top: 3px; font-size: 25px; font-weight: 700; text-align: right; }
        .center { padding-top: 90px; text-align: center; position: relative; z-index: 1; }
        .chip { display: inline-flex; gap: 10px; align-items: center; border: 1px solid rgba(168,255,0,.25); background: rgba(0,0,0,.45); border-radius: 999px; padding: 10px 22px; font-size: 11px; letter-spacing: .35em; text-transform: uppercase; color: rgba(255,255,255,.8); }
        .title1 { margin: 14px 0 0; font-size: 88px; line-height: .92; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; color: #fff; }
        .title2 { margin: 10px 0 0; font-size: 88px; line-height: .92; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; color: #a8ff00; text-shadow: 0 0 18px rgba(168,255,0,.55); }
        .subtitle { margin-top: 36px; font-size: 18px; letter-spacing: .45em; text-transform: uppercase; color: rgba(255,255,255,.75); }
        .student { margin: 12px auto 0; font-size: clamp(48px, 5vw, 78px); line-height: 1; font-family: "Brush Script MT", "Segoe Script", cursive; font-style: italic; color: #fff; max-width: 92%; word-break: break-word; }
        .course-box { margin: 18px auto 0; max-width: 1100px; border: 1px solid rgba(168,255,0,.4); border-radius: 24px; background: rgba(17,17,17,.9); padding: 16px 28px 18px; box-shadow: 0 0 40px rgba(168,255,0,.12); }
        .course-pre { font-size: 12px; letter-spacing: .35em; text-transform: uppercase; color: rgba(255,255,255,.7); }
        .course-name { margin-top: 10px; font-size: clamp(28px, 2.7vw, 44px); font-weight: 900; letter-spacing: .06em; text-transform: uppercase; }
        .course-name span { color: #a8ff00; }
        .course-desc { margin-top: 10px; font-size: 20px; line-height: 1.25; color: rgba(255,255,255,.74); }
        .stats { margin: 24px auto 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; max-width: 1120px; }
        .stat { border: 1px solid rgba(255,255,255,.1); background: rgba(0,0,0,.36); border-radius: 22px; padding: 18px 20px; text-align: left; min-height: 92px; }
        .stat-label { font-size: 11px; letter-spacing: .28em; text-transform: uppercase; color: rgba(255,255,255,.6); }
        .stat-value { margin-top: 8px; font-size: 22px; font-weight: 700; }
        .bottom { margin-top: 34px; display: grid; grid-template-columns: 1fr 230px 1fr; align-items: end; gap: 16px; }
        .signature { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .sig-line { width: 180px; height: 1px; background: rgba(168,255,0,.75); box-shadow: 0 0 16px rgba(168,255,0,.75); }
        .sig-name { font-size: 20px; font-weight: 700; }
        .sig-role { font-size: 11px; letter-spacing: .35em; color: #a8ff00; text-transform: uppercase; }
        .seal { width: 176px; height: 176px; border-radius: 50%; border: 2px solid rgba(168,255,0,.55); background: radial-gradient(circle, rgba(168,255,0,.16) 0%, rgba(0,0,0,.92) 58%); box-shadow: 0 0 40px rgba(168,255,0,.18); display: grid; place-items: center; margin: 0 auto; }
        .seal-inner { width: 132px; height: 132px; border-radius: 50%; border: 1px dashed rgba(168,255,0,.35); display: grid; place-items: center; text-align: center; }
        .seal-title { font-size: 18px; font-weight: 800; }
        .seal-sub { margin-top: 4px; font-size: 10px; letter-spacing: .5em; color: rgba(255,255,255,.65); text-transform: uppercase; }
        .qr { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .qrbox { width: 118px; height: 118px; border: 2px solid rgba(168,255,0,.4); background: rgba(0,0,0,.62); border-radius: 18px; display: grid; place-items: center; }
        .footer { margin: 18px auto 0; max-width: 1060px; border: 1px solid rgba(168,255,0,.2); background: rgba(0,0,0,.32); border-radius: 18px; padding: 11px 18px; text-align: center; color: rgba(255,255,255,.85); font-size: 20px; }
        .mode { margin-top: 10px; font-size: 11px; letter-spacing: .38em; color: rgba(168,255,0,.8); text-transform: uppercase; }
        .node { position: absolute; border-radius: 50%; border: 1px solid rgba(168,255,0,.16); }
        .n1 { left: 24px; top: 24px; width: 140px; height: 140px; border-style: dashed; }
        .n2 { left: 42px; top: 42px; width: 76px; height: 76px; }
        .n3 { right: 24px; top: 28px; width: 138px; height: 138px; border-style: dashed; }
        .n4 { right: 36px; top: 42px; width: 60px; height: 60px; }
        .line { position: absolute; inset: 52% 28px auto; height: 1px; background: linear-gradient(to right, transparent, rgba(168,255,0,.14), transparent); }
        @media print {
          .page { width: 100vw; height: 100vh; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="certificate grain">
          <div class="node n1"></div>
          <div class="node n2"></div>
          <div class="node n3"></div>
          <div class="node n4"></div>
          <div class="line"></div>
          <div class="inner">
            <div class="top-left">
              <div>
                <div class="brand-name">Sarria<span>Tech</span></div>
                <div class="brand-sub">Software Dev Academy</div>
              </div>
            </div>
            <div class="top-right">
              <div class="id-label">Certificado ID</div>
              <div class="id-value">${data.certificate_id}</div>
            </div>

            <div class="center">
              <div class="chip">Certificado</div>
              <div class="title1">Certificado</div>
              <div class="title2">De Aprobación</div>
              <div class="subtitle">Este certificado se otorga a:</div>
              <div class="student">${data.student_name}</div>
              <div class="course-box">
                <div class="course-pre">Por haber completado y aprobado el curso</div>
                <div class="course-name">${data.course_name}</div>
                <div class="course-desc">${data.course_description}</div>
              </div>
              <div class="stats">
                <div class="stat"><div class="stat-label">Fecha de finalización</div><div class="stat-value">${data.completion_date}</div></div>
                <div class="stat"><div class="stat-label">Duración</div><div class="stat-value">${data.course_duration}</div></div>
                <div class="stat"><div class="stat-label">Nivel</div><div class="stat-value">${data.course_level}</div></div>
              </div>
              <div class="bottom">
                <div class="signature">
                  ${data.instructor_signature ? `<img src="${data.instructor_signature}" style="max-height:70px;max-width:220px;object-fit:contain" />` : `<div class="sig-name">${data.instructor_name}</div><div class="sig-role">Instructor</div>`}
                  <div class="sig-line"></div>
                </div>
                <div class="seal">
                  <div class="seal-inner">
                    <div class="seal-title">Sarria<span style="color:#a8ff00">Tech</span></div>
                    <div class="seal-sub">Academy</div>
                  </div>
                </div>
                <div class="signature">
                  ${data.admin_signature ? `<img src="${data.admin_signature}" style="max-height:70px;max-width:220px;object-fit:contain" />` : `<div class="sig-name">${data.admin_name}</div><div class="sig-role">Administrador</div>`}
                  <div class="sig-line"></div>
                </div>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-top:20px;">
                <div class="footer">SarriaTech impulsa tu futuro. Sigue aprendiendo, sigue creando.</div>
                <div class="qr">
                  <div class="qrbox">
                    <svg viewBox="0 0 120 120" width="90" height="90" aria-hidden="true">
                      <rect width="120" height="120" fill="#fff" rx="10" />
                      <rect x="14" y="14" width="28" height="28" fill="#111" />
                      <rect x="20" y="20" width="16" height="16" fill="#fff" />
                      <rect x="78" y="14" width="28" height="28" fill="#111" />
                      <rect x="84" y="20" width="16" height="16" fill="#fff" />
                      <rect x="14" y="78" width="28" height="28" fill="#111" />
                      <rect x="20" y="84" width="16" height="16" fill="#fff" />
                      <rect x="50" y="14" width="8" height="8" fill="#111" />
                      <rect x="58" y="14" width="8" height="8" fill="#111" />
                      <rect x="50" y="30" width="8" height="8" fill="#111" />
                      <rect x="70" y="50" width="8" height="8" fill="#111" />
                      <rect x="50" y="50" width="8" height="8" fill="#111" />
                      <rect x="38" y="60" width="8" height="8" fill="#111" />
                      <rect x="70" y="70" width="8" height="8" fill="#111" />
                      <rect x="92" y="50" width="8" height="8" fill="#111" />
                      <rect x="50" y="92" width="8" height="8" fill="#111" />
                      <rect x="62" y="60" width="8" height="8" fill="#111" />
                      <rect x="74" y="90" width="8" height="8" fill="#111" />
                      <rect x="84" y="70" width="8" height="8" fill="#111" />
                    </svg>
                  </div>
                  <div style="font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:rgba(255,255,255,.7);">Verifica este certificado</div>
                </div>
              </div>
              ${previewMode ? `<div class="mode">Modo de prueba activado</div>` : ``}
            </div>
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

export function Certificates() {
  const { user } = useAuthStore();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const loadProfile = () => {
    setLoading(true);
    api
      .get('/auth/profile')
      .then((res) => {
        setProfile(res.data);
        setSelectedCourseId(res.data.enrollments?.[0]?.courseId ?? null);
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.error || 'No se pudo cargar tus certificados.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProfile();
    const onProgressUpdate = () => loadProfile();
    window.addEventListener('course-progress-updated', onProgressUpdate as EventListener);
    return () => window.removeEventListener('course-progress-updated', onProgressUpdate as EventListener);
  }, []);

  const selectedCourse = useMemo(() => {
    if (!profile) return null;
    return profile.enrollments.find((enrollment) => enrollment.courseId === selectedCourseId) || profile.enrollments[0] || null;
  }, [profile, selectedCourseId]);

  const selectedCourseProgress = selectedCourse
    ? Math.max(selectedCourse.courseProgress ?? 0, selectedCourse.progress ?? 0, selectedCourse.status === 'COMPLETED' ? 100 : 0)
    : 0;
  const courseCompleted = selectedCourseProgress >= 100;

  const certificateData = useMemo(() => {
    if (!selectedCourse || !profile) return null;
    return toCertificateData(selectedCourse, profile.profile.name || user?.name || 'Estudiante');
  }, [profile, selectedCourse, user?.name]);

  const previewData: CertificateData =
    certificateData || {
      student_name: profile?.profile.name || 'Estudiante',
      course_name: 'Curso de demostración',
      course_description: 'Vista previa del certificado de SarriaTech.',
      completion_date: new Date().toLocaleDateString('es-CO'),
      course_duration: '30 horas',
      course_level: 'Aprobado',
      certificate_id: 'ST-0000-0000',
      verification_url: 'https://sarriatech.com',
      instructor_name: 'SarriaTech Instructor',
      admin_name: 'SarriaTech Admin',
    };

  const handleDownloadPdf = () => {
    if (!courseCompleted) return;
    const html = buildPrintableHtml(previewData, !selectedCourse || !courseCompleted);
    const win = window.open('', '_blank', 'noopener,noreferrer,width=1600,height=1100');
    if (!win) return;

    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => {
      win.print();
    }, 700);
  };

  const handleDownloadPng = async () => {
    if (!certificateRef.current || !courseCompleted) return;

    const canvas = await html2canvas(certificateRef.current, {
      backgroundColor: '#050505',
      scale: Math.min(3, window.devicePixelRatio || 2),
      useCORS: true,
      allowTaint: true,
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `certificado-${previewData.certificate_id}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando certificados...</div>;
  }

  if (errorMsg || !profile) {
    return (
      <div className="mx-auto max-w-3xl rounded-2xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
        {errorMsg || 'No se encontraron datos de certificados.'}
      </div>
    );
  }

  const ownCourses = profile.enrollments || [];

  return (
    <div className="mx-auto max-w-[1700px] space-y-6 px-4 pb-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-lime-500">
            <ShieldCheck className="h-4 w-4" />
            Plantilla maestra
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Certificados de {profile.profile.name}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Selecciona un curso tuyo para generar el certificado oficial. La descarga abre una ventana dedicada para imprimir en A4 horizontal.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
            {profile.stats.coursesEnrolled} cursos inscritos
          </span>
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
            {profile.stats.certificatesCount} certificados
          </span>
          <button
            onClick={handleDownloadPdf}
            disabled={!courseCompleted}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary"
          >
            <FileText className="h-4 w-4" />
            {courseCompleted ? 'Descargar PDF' : 'Completa el curso'}
          </button>
          <button
            onClick={handleDownloadPng}
            disabled={!courseCompleted}
            className="inline-flex items-center gap-2 rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-2.5 text-sm font-semibold text-lime-500 transition-colors hover:bg-lime-400/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImageIcon className="h-4 w-4" />
            {courseCompleted ? 'Descargar PNG' : 'Bloqueado'}
          </button>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <div className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <GraduationCap className="h-4 w-4 text-lime-400" />
            Selecciona un curso
          </div>
          <div className="space-y-3">
            {ownCourses.map((course) => (
              <button
                key={course.courseId}
                onClick={() => setSelectedCourseId(course.courseId)}
                className={`w-full rounded-2xl border p-4 text-left transition-all ${
                  selectedCourseId === course.courseId
                    ? 'border-lime-400/60 bg-lime-400/10 shadow-[0_0_20px_rgba(168,255,0,0.12)]'
                    : 'border-border bg-background hover:border-lime-400/30 hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{course.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Por {course.instructorName}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{course.category}</span>
                  <span>{course.progress}%</span>
                </div>
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-dashed border-border bg-secondary/20 p-4 text-sm text-muted-foreground">
            {courseCompleted
              ? 'El curso ya alcanzó el 100% y el certificado está habilitado.'
              : 'El certificado permanecerá bloqueado hasta completar el 100% del curso.'}
          </div>
        </div>

        <div className="space-y-4">
          <div className="overflow-hidden rounded-[24px] bg-[#050505] p-2 shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:rounded-[32px] sm:p-4">
            <div className="mx-auto flex w-full justify-center">
              <div ref={certificateRef} className="w-full max-w-[1400px]">
                {courseCompleted ? (
                  <CertificateTemplate data={previewData} previewMode={false} />
                ) : (
                  <div className="flex min-h-[760px] flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-lime-400/30 bg-card px-8 py-16 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full border border-lime-400/30 bg-lime-400/10 text-lime-500">
                      <ShieldCheck className="h-10 w-10" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black tracking-tight text-foreground">Certificado bloqueado</h2>
                      <p className="mx-auto max-w-xl text-sm text-muted-foreground">
                        Para visualizar y descargar el certificado, primero debes terminar el curso al 100%.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Estado del certificado</p>
            <p className="mt-1">
              {courseCompleted
                ? 'El curso está completo. Ya puedes generar y descargar el certificado.'
                : 'El certificado permanece bloqueado hasta completar el 100% del curso.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
