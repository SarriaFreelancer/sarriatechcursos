import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronDown, GraduationCap, Layers3, PlusCircle, TrendingUp, Users, Pencil } from 'lucide-react';
import api from '../../lib/axios';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';

type InstructorStudent = {
  studentId: number;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
  lastProgressAt: string | null;
  status: string;
};

type InstructorCourse = {
  id: number;
  title: string;
  status: string;
  category: { id: number; name: string };
  instructor: { id: number; name: string; email: string };
  enrolledStudents: number;
  moduleCount: number;
  averageProgress: number;
  students: InstructorStudent[];
};

type InstructorOverview = {
  totals: {
    totalCourses: number;
    totalEnrollments: number;
    totalStudents: number;
    averageProgress: number;
  };
  courses: InstructorCourse[];
};

function formatDate(value: string | null) {
  if (!value) return 'Sin datos';
  return new Date(value).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function InstructorDashboard() {
  const [data, setData] = useState<InstructorOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [expandedCourses, setExpandedCourses] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    api
      .get('/courses/mine/overview')
      .then((response) => {
        if (!cancelled) {
          setData(response.data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMsg(error.response?.data?.error || 'No se pudo cargar el panel del instructor.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleCourse = (courseId: number) => {
    setExpandedCourses((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const summaryCards = useMemo(() => {
    if (!data) return [];

    return [
      { label: 'Cursos creados', value: data.totals.totalCourses, icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10' },
      { label: 'Inscripciones totales', value: data.totals.totalEnrollments, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
      { label: 'Estudiantes únicos', value: data.totals.totalStudents, icon: GraduationCap, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      { label: 'Progreso promedio', value: `${data.totals.averageProgress}%`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando panel del instructor...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm">
        {errorMsg || 'No se encontraron datos del instructor.'}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Panel de Formador</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Cursos, estudiantes inscritos y progreso de tus propios cursos.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-4 sm:mt-0">
            <Link
              to="/instructor/evidences"
              className="bg-secondary text-foreground font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 border border-border hover:bg-secondary/80 transition-colors text-sm sm:text-base justify-center sm:justify-start"
            >
              <BookOpen className="w-5 h-5" /> Revisar Evidencias
            </Link>
            <Link
              to="/instructor/create-course"
              className="bg-primary text-primary-foreground font-medium px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors text-sm sm:text-base justify-center sm:justify-start"
            >
              <PlusCircle className="w-5 h-5" /> Crear Nuevo Curso
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{card.label}</p>
                  <p className="text-2xl font-bold mt-0.5">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border">
            <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
              <Layers3 className="w-5 h-5 text-primary" />
              Tus cursos y estudiantes
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Solo se muestran los cursos que te pertenecen.
            </p>
          </div>

          {data.courses.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">
              Aún no has creado cursos. Cuando publiques el primero aparecerá aquí automáticamente.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.courses.map((course) => {
                const isExpanded = expandedCourses[course.id];

                return (
                  <div key={course.id}>
                    <button
                      onClick={() => toggleCourse(course.id)}
                      className="w-full flex items-center justify-between gap-4 p-4 sm:p-5 text-left hover:bg-secondary/10 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <BookOpen className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base truncate">{course.title}</h3>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {course.category.name} · {course.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                              </p>
                            </div>
                          </div>

                          <Link
                            to={`/instructor/edit-course/${course.id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="inline-flex items-center gap-1.5 self-start mt-1 sm:mt-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Editar curso
                          </Link>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="hidden sm:flex gap-2 text-xs">
                          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {course.enrolledStudents} est.
                          </span>
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                            {course.averageProgress}%
                          </span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="bg-secondary/5 border-t border-border">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5">
                          <div className="rounded-xl border border-border bg-card p-3">
                            <p className="text-xs text-muted-foreground">Estudiantes inscritos</p>
                            <p className="text-xl font-bold mt-1">{course.enrolledStudents}</p>
                          </div>
                          <div className="rounded-xl border border-border bg-card p-3">
                            <p className="text-xs text-muted-foreground">Módulos</p>
                            <p className="text-xl font-bold mt-1">{course.moduleCount}</p>
                          </div>
                          <div className="rounded-xl border border-border bg-card p-3">
                            <p className="text-xs text-muted-foreground">Progreso promedio</p>
                            <p className="text-xl font-bold mt-1">{course.averageProgress}%</p>
                          </div>
                        </div>

                        <div className="overflow-x-auto border-t border-border">
                          <table className="min-w-full">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Estudiante</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Progreso</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Inscrito</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden xl:table-cell">Último avance</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground hidden xl:table-cell">Estado</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                              {course.students.length === 0 ? (
                                <tr>
                                  <td colSpan={6} className="px-4 py-6 text-sm text-muted-foreground text-center">
                                    Sin estudiantes inscritos.
                                  </td>
                                </tr>
                              ) : (
                                course.students.map((student) => (
                                  <tr key={student.studentId} className="hover:bg-secondary/10 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium">{student.name}</td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground hidden sm:table-cell">{student.email}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden min-w-[90px] max-w-[180px]">
                                          <div
                                            className="h-full bg-primary rounded-full transition-all"
                                            style={{ width: `${Math.min(100, student.progress)}%` }}
                                          />
                                        </div>
                                        <span className="text-xs font-medium w-10 text-right">{student.progress}%</span>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                                      {formatDate(student.enrolledAt)}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">
                                      {formatDate(student.lastProgressAt)}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">
                                      {student.status}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
