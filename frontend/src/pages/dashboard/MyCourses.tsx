import { BookOpen, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../lib/axios';

interface EnrolledCourse {
  id: number;
  courseId: number;
  title: string;
  imageUrl: string | null;
  instructorName: string;
  category: string;
  progress: number;
}

export function MyCourses() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/profile')
      .then((res) => {
        setCourses(res.data.enrollments || []);
      })
      .catch((err) => {
        console.error('Error loading enrolled courses:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Cargando tus cursos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Mis Cursos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Continúa aprendiendo donde lo dejaste.
          </p>
        </div>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium px-4 py-2.5 rounded-xl hover:bg-primary/90 transition-all text-sm shadow-sm"
        >
          <Compass className="w-4 h-4" />
          Explorar cursos
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-sm">
          <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Todavía no tienes cursos inscritos</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Los cursos publicados aparecen en <span className="font-medium text-foreground">Explorar</span>. Cuando te inscribas,
              los verás aquí para continuar aprendiendo.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-primary text-xl font-bold shrink-0 overflow-hidden border border-border">
                  {course.imageUrl ? (
                    <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    course.title.substring(0, 2).toUpperCase()
                  )}
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-xs font-semibold text-primary uppercase tracking-wider">{course.category}</p>
                  <h3 className="font-bold text-sm sm:text-base leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-xs text-muted-foreground">Por {course.instructorName}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className={course.progress === 100 ? 'text-emerald-500' : 'text-primary'}>
                    {course.progress === 100 ? 'Completado' : `${course.progress}%`}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      course.progress === 100 ? 'bg-emerald-500' : 'bg-primary'
                    }`}
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <Link
                  to={`/course/${course.courseId}`}
                  className="block text-center w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all py-2 rounded-xl text-xs font-semibold mt-2"
                >
                  {course.progress === 100 ? 'Repasar curso' : 'Continuar aprendiendo'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
