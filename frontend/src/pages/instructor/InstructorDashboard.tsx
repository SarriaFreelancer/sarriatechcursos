import { useEffect, useState } from 'react';
import { Users, BookOpen, Layers3, PlusCircle, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

type InstructorCourse = {
  id: number;
  title: string;
  status: string;
  category?: { name: string };
  _count?: { enrollments: number };
  modules?: Array<{ id: number }>;
};

export function InstructorDashboard() {
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .get('/courses/mine')
      .then((response) => {
        if (!cancelled) {
          setCourses(response.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCourses([]);
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

  const totalCourses = courses.length;
  const publishedCourses = courses.filter((course) => course.status === 'PUBLISHED').length;
  const totalEnrollments = courses.reduce((sum, course) => sum + (course._count?.enrollments || 0), 0);
  const totalModules = courses.reduce((sum, course) => sum + (course.modules?.length || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Panel de Formador</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {loading ? 'Cargando tus cursos...' : 'Todo lo que ves aquí viene de tus cursos reales.'}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-2.5 sm:p-3 bg-primary/10 text-primary rounded-lg flex-shrink-0">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Cursos publicados</h3>
            <p className="text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1">{publishedCourses}</p>
          </div>
        </div>
        <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-2.5 sm:p-3 bg-blue-500/10 text-blue-500 rounded-lg flex-shrink-0">
            <Users className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Inscripciones totales</h3>
            <p className="text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1">{totalEnrollments}</p>
          </div>
        </div>
        <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-2.5 sm:p-3 bg-green-500/10 text-green-500 rounded-lg flex-shrink-0">
            <Layers3 className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Módulos creados</h3>
            <p className="text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1">{totalModules}</p>
          </div>
        </div>
        <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="p-2.5 sm:p-3 bg-amber-500/10 text-amber-500 rounded-lg flex-shrink-0">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">Total de cursos</h3>
            <p className="text-xl sm:text-2xl font-bold mt-0.5 sm:mt-1">{totalCourses}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Tus cursos</h2>

        {loading ? (
          <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground">
            Cargando cursos...
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-xl p-6 text-sm text-muted-foreground">
            Aún no has creado cursos. Cuando publiques el primero, aparecerá aquí automáticamente.
          </div>
        ) : (
          <>
            <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-secondary/50 border-b border-border">
                  <tr>
                    <th className="p-4 font-medium text-muted-foreground text-sm">Curso</th>
                    <th className="p-4 font-medium text-muted-foreground text-sm">Estado</th>
                    <th className="p-4 font-medium text-muted-foreground text-sm">Inscripciones</th>
                    <th className="p-4 font-medium text-muted-foreground text-sm">Categoría</th>
                    <th className="p-4 font-medium text-muted-foreground text-sm">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course) => (
                    <tr key={course.id} className="border-b border-border last:border-b-0 hover:bg-secondary/20 transition-colors">
                      <td className="p-4 font-medium">{course.title}</td>
                      <td className="p-4">
                        <span className={course.status === 'PUBLISHED' ? 'px-2.5 py-1 bg-green-500/10 text-green-500 text-xs rounded-full font-medium' : 'px-2.5 py-1 bg-yellow-500/10 text-yellow-500 text-xs rounded-full font-medium'}>
                          {course.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">{course._count?.enrollments || 0}</td>
                      <td className="p-4 text-muted-foreground">{course.category?.name || 'Sin categoría'}</td>
                      <td className="p-4">
                        <Link
                          to={`/instructor/edit-course/${course.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Editar
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {courses.map((course) => (
                <div key={course.id} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold truncate">{course.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={course.status === 'PUBLISHED' ? 'px-2 py-0.5 bg-green-500/10 text-green-500 text-xs rounded-full font-medium' : 'px-2 py-0.5 bg-yellow-500/10 text-yellow-500 text-xs rounded-full font-medium'}>
                          {course.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                        </span>
                        <span className="text-xs text-muted-foreground">{course._count?.enrollments || 0} inscripciones</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{course.category?.name || 'Sin categoría'}</p>
                    </div>
                    <Link
                      to={`/instructor/edit-course/${course.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors flex-shrink-0"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Editar
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
