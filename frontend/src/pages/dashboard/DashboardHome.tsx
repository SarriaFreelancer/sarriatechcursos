import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';

type PublishedCourse = {
  id: number;
  title: string;
  description: string;
  price: string | number;
  level: string;
  imageUrl?: string | null;
  instructor?: { name: string };
  category?: { name: string };
};

export function DashboardHome() {
  const [featuredCourse, setFeaturedCourse] = useState<PublishedCourse | null>(null);
  const [courses, setCourses] = useState<PublishedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .get('/courses')
      .then((response) => {
        if (!cancelled) {
          setCourses(response.data);
          setFeaturedCourse(response.data[0] || null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCourses([]);
          setFeaturedCourse(null);
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

  const totalPublished = useMemo(() => courses.length, [courses]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Resumen</h1>
        <p className="text-sm text-muted-foreground mt-1">Vista construida con datos reales del catálogo publicado.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-sm sm:text-lg font-medium text-muted-foreground">Cursos publicados</h3>
          <p className="text-3xl sm:text-4xl font-bold text-primary mt-2">{totalPublished}</p>
        </div>
        <div className="bg-card p-4 sm:p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-sm sm:text-lg font-medium text-muted-foreground">Estado</h3>
          <p className="text-3xl sm:text-4xl font-bold mt-2">{loading ? '...' : totalPublished > 0 ? 'Activo' : 'Vacío'}</p>
        </div>
      </div>

      <div className="mt-6 sm:mt-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4">Cursos disponibles</h2>
        {loading ? (
          <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground">
            Cargando cursos publicados...
          </div>
        ) : featuredCourse ? (
          <Link
            to={`/course/${featuredCourse.id}`}
            className="block bg-card border border-border rounded-xl p-3 sm:p-4 hover:border-primary transition-colors cursor-pointer"
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <div className="w-full sm:w-48 h-32 sm:h-32 rounded-lg overflow-hidden bg-gradient-to-br from-secondary via-secondary/80 to-background flex items-center justify-center flex-shrink-0">
                {featuredCourse.imageUrl ? (
                  <img src={featuredCourse.imageUrl} alt={featuredCourse.title} className="w-full h-full object-cover" />
                ) : null}
              </div>
              <div className="flex-1 py-1 sm:py-2 min-w-0">
                <h3 className="text-lg sm:text-xl font-bold truncate">{featuredCourse.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm truncate">
                  {featuredCourse.instructor?.name || 'Instructor'} · {featuredCourse.level}
                </p>
                <p className="text-muted-foreground mt-1 text-sm truncate">
                  {featuredCourse.category?.name || 'Sin categoría'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">${Number(featuredCourse.price).toFixed(2)}</p>
              </div>
            </div>
          </Link>
        ) : (
          <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground">
            Aún no hay cursos publicados.
          </div>
        )}
      </div>
    </div>
  );
}
