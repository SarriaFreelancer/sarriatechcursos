import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, GraduationCap, ShieldCheck, Image as ImageIcon, FileText } from 'lucide-react';
import { CertificateTemplate, buildCertificateSvg, type CertificateData } from '../../components/certificates/CertificateTemplate';
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
  courseDuration?: string;
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
    course_duration: course.courseDuration || '0 minutos',
    course_level: Math.max(course.courseProgress ?? 0, course.progress ?? 0) >= 100 || course.status === 'COMPLETED' ? 'Aprobado' : 'En progreso',
    certificate_id: id,
    verification_url: `https://sarriatech.com/certificados/${id}`,
    instructor_name: course.instructorName,
    admin_name: 'SarriaTech Admin',
  };
}

function buildPrintHtml(svg: string) {
  const src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>Certificado SarriaTech</title>
      <style>
        html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #050505; }
        body { display: grid; place-items: center; overflow: hidden; }
        img { width: 100vw; height: 100vh; object-fit: contain; display: block; }
        @page { size: letter landscape; margin: 0; }
        @media print {
          html, body { width: 279.4mm; height: 215.9mm; }
          img { width: 279.4mm; height: 215.9mm; }
        }
      </style>
      <script>
        window.addEventListener('load', () => {
          const waitForFonts = document.fonts?.ready ? document.fonts.ready : Promise.resolve();
          waitForFonts.finally(() => setTimeout(() => window.print(), 150));
        });
      </script>
    </head>
    <body>
      <img src="${src}" alt="Certificado SarriaTech" />
    </body>
  </html>`;
}

async function svgToPng(svg: string, width = 2480, height = 2010) {
  const src = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  const img = new Image();
  img.decoding = 'async';
  img.src = src;

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('No se pudo renderizar el certificado.'));
  });

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo crear el lienzo.');

  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('No se pudo exportar el PNG.'));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });
}

export function Certificates() {
  const { user } = useAuthStore();
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

  const handlePrintCertificate = () => {
    if (!courseCompleted) return;
    const html = buildPrintHtml(buildCertificateSvg(previewData));
    const win = window.open('', '_blank', 'noopener,noreferrer,width=1600,height=1100');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
  };

  const handleDownloadImage = async () => {
    if (!courseCompleted) return;
    const svg = buildCertificateSvg(previewData);
    const blob = await svgToPng(svg);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificado-${previewData.certificate_id}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
    <div className="mx-auto max-w-[1600px] space-y-6 px-4 pb-12 sm:px-6 lg:px-8">
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
            Selecciona un curso tuyo para generar el certificado oficial. La vista, la impresión y la descarga usan la misma plantilla.
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
            onClick={handlePrintCertificate}
            disabled={!courseCompleted}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary"
          >
            <FileText className="h-4 w-4" />
            {courseCompleted ? 'Imprimir certificado' : 'Completa el curso'}
          </button>
          <button
            onClick={handleDownloadImage}
            disabled={!courseCompleted}
            className="inline-flex items-center gap-2 rounded-xl border border-lime-400/30 bg-lime-400/10 px-4 py-2.5 text-sm font-semibold text-lime-500 transition-colors hover:bg-lime-400/15 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ImageIcon className="h-4 w-4" />
            {courseCompleted ? 'Descargar imagen' : 'Bloqueado'}
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
              <div className="w-full max-w-[1120px]">
                {courseCompleted ? (
                  <CertificateTemplate data={previewData} />
                ) : (
                  <div className="flex min-h-[620px] flex-col items-center justify-center gap-4 rounded-[28px] border border-dashed border-lime-400/30 bg-card px-8 py-16 text-center">
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

        </div>
      </div>
    </div>
  );
}
