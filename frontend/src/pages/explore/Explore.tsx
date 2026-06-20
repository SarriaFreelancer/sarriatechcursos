import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, Star, StarHalf, X, SlidersHorizontal, Award } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../lib/axios';

type CatalogCourse = {
  id: number;
  title: string;
  description: string;
  price: string | number;
  level: string;
  imageUrl?: string | null;
  instructor?: { name: string };
  category?: { name: string };
  averageRating: number;
  totalReviews: number;
};

// Helper component to render stars based on numeric rating
export function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.3 && rating % 1 < 0.8;
  const roundedStars = rating % 1 >= 0.8 ? fullStars + 1 : fullStars;

  return (
    <div className="flex items-center gap-0.5 text-amber-500">
      {[...Array(5)].map((_, i) => {
        if (i < fullStars) {
          return <Star key={i} size={size} className="fill-amber-500 stroke-amber-500" />;
        } else if (i === fullStars && hasHalf) {
          return <StarHalf key={i} size={size} className="fill-amber-500 stroke-amber-500" />;
        } else if (i < roundedStars) {
          return <Star key={i} size={size} className="fill-amber-500 stroke-amber-500" />;
        } else {
          return <Star key={i} size={size} className="text-muted-foreground/30" />;
        }
      })}
    </div>
  );
}

export function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [courses, setCourses] = useState<CatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchVal, setSearchVal] = useState(urlQuery);

  // Filter States
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [minRating, setMinRating] = useState<number>(0);

  useEffect(() => {
    setSearchVal(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    let cancelled = false;

    api
      .get('/courses')
      .then((response) => {
        if (!cancelled) {
          setCourses(response.data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMsg(error.response?.data?.error || 'No se pudo cargar el catálogo.');
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

  // Compute Categories & Instructors list dynamically for filters
  const categories = useMemo(() => {
    const list = new Set<string>();
    courses.forEach((c) => {
      if (c.category?.name) list.add(c.category.name);
    });
    return Array.from(list);
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      // 1. Text Search matching title, category, instructor, level, description
      const text = searchVal.trim().toLowerCase();
      const matchesText =
        !text ||
        course.title.toLowerCase().includes(text) ||
        course.description.toLowerCase().includes(text) ||
        course.category?.name?.toLowerCase().includes(text) ||
        course.instructor?.name?.toLowerCase().includes(text) ||
        course.level.toLowerCase().includes(text);

      // 2. Category Filter
      const matchesCategory = selectedCategory === 'all' || course.category?.name === selectedCategory;

      // 3. Level Filter
      const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

      // 4. Price Filter
      const matchesPrice = Number(course.price) <= maxPrice;

      // 5. Rating Filter
      const matchesRating = course.averageRating >= minRating;

      return matchesText && matchesCategory && matchesLevel && matchesPrice && matchesRating;
    });
  }, [courses, searchVal, selectedCategory, selectedLevel, maxPrice, minRating]);

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedLevel('all');
    setMaxPrice(200);
    setMinRating(0);
    setSearchVal('');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-card border border-border p-5 sm:p-6 rounded-2xl flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">Catálogo de cursos</h1>
          <p className="text-muted-foreground mt-1 text-sm">Explora nuestra oferta y potencia tus habilidades.</p>
        </div>
        <div className="flex gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => {
                const val = e.target.value;
                setSearchVal(val);
                setSearchParams(val ? { q: val } : {});
              }}
              placeholder="Buscar por título, categoría, instructor o tecnologías..."
              className="w-full bg-secondary text-foreground rounded-xl pl-10 pr-4 py-2.5 border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm transition-all"
            />
          </div>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden bg-secondary px-3 py-2.5 rounded-xl border border-border hover:bg-secondary/80 text-muted-foreground flex items-center gap-1.5 text-sm"
            type="button"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar Filters (Desktop) */}
        <aside className="hidden md:block w-64 bg-card border border-border rounded-2xl p-5 shrink-0 space-y-6">
          <div className="flex justify-between items-center pb-2 border-b border-border">
            <span className="font-bold flex items-center gap-2">
              <Filter className="w-4 h-4 text-primary" /> Filtros
            </span>
            <button onClick={clearFilters} className="text-xs font-semibold text-primary hover:underline">
              Limpiar
            </button>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Categorías</h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              <option value="all">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Level */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Nivel</h3>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              <option value="all">Todos los niveles</option>
              <option value="BEGINNER">Principiante</option>
              <option value="INTERMEDIATE">Intermedio</option>
              <option value="ADVANCED">Avanzado</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
              <span>Precio Máximo</span>
              <span className="text-foreground">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary bg-secondary h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Calificación Mínima</h3>
            <div className="space-y-2">
              {[4, 3, 2].map((stars) => (
                <label key={stars} className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground">
                  <input
                    type="radio"
                    name="minRating"
                    checked={minRating === stars}
                    onChange={() => setMinRating(stars)}
                    className="accent-primary"
                  />
                  <StarRating rating={stars} size={14} />
                  <span className="text-xs text-muted-foreground">o más</span>
                </label>
              ))}
              <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground">
                <input
                  type="radio"
                  name="minRating"
                  checked={minRating === 0}
                  onChange={() => setMinRating(0)}
                  className="accent-primary"
                />
                <span className="text-xs text-muted-foreground">Cualquiera</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Course Grid */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Cargando cursos...</div>
          ) : errorMsg ? (
            <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm">
              {errorMsg}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-border bg-card">
              <p className="text-muted-foreground text-sm mb-4">No se encontraron cursos con los filtros aplicados.</p>
              <button onClick={clearFilters} className="bg-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-xl hover:bg-primary/95 transition-colors">
                Restablecer búsqueda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md hover:border-primary/45 transition-all group flex flex-col"
                >
                  <div className="w-full h-44 bg-gradient-to-br from-secondary to-background relative overflow-hidden flex items-center justify-center border-b border-border">
                    {course.imageUrl ? (
                      <img src={course.imageUrl} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="text-muted-foreground font-bold text-3xl opacity-30 select-none">
                        SarriaTech
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                          {course.level === 'BEGINNER' ? 'Principiante' : course.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}
                        </span>
                        <span className="text-xs text-muted-foreground">{course.category?.name}</span>
                      </div>

                      <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">Por {course.instructor?.name || 'Instructor'}</p>

                      {/* Ratings stars display */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-sm font-bold text-amber-500">{course.averageRating.toFixed(1)}</span>
                        <StarRating rating={course.averageRating} size={14} />
                        <span className="text-xs text-muted-foreground">({course.totalReviews})</span>
                      </div>
                    </div>

                    <div className="pt-5 mt-4 border-t border-border/50 flex items-center justify-between gap-2">
                      <span className="font-extrabold text-xl">${Number(course.price).toFixed(2)}</span>
                      <Link
                        to={`/course/${course.id}`}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-4 py-2 rounded-xl text-xs transition-colors shrink-0"
                      >
                        Ver detalles
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-80 max-w-full bg-card h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-border animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-border">
                <span className="font-bold flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" /> Filtros
                </span>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Categorías</h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="all">Todas las categorías</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Nivel</h3>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="all">Todos los niveles</option>
                  <option value="BEGINNER">Principiante</option>
                  <option value="INTERMEDIATE">Intermedio</option>
                  <option value="ADVANCED">Avanzado</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  <span>Precio Máximo</span>
                  <span className="text-foreground">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary bg-secondary h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Calificación Mínima</h3>
                <div className="space-y-2">
                  {[4, 3, 2].map((stars) => (
                    <label key={stars} className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground">
                      <input
                        type="radio"
                        name="minRatingMobile"
                        checked={minRating === stars}
                        onChange={() => setMinRating(stars)}
                        className="accent-primary"
                      />
                      <StarRating rating={stars} size={14} />
                      <span className="text-xs text-muted-foreground">o más</span>
                    </label>
                  ))}
                  <label className="flex items-center gap-2 text-sm cursor-pointer hover:text-foreground">
                    <input
                      type="radio"
                      name="minRatingMobile"
                      checked={minRating === 0}
                      onChange={() => setMinRating(0)}
                      className="accent-primary"
                    />
                    <span className="text-xs text-muted-foreground">Cualquiera</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border mt-6 flex gap-3">
              <button
                onClick={clearFilters}
                className="flex-1 bg-secondary text-foreground hover:bg-secondary/95 text-xs font-semibold py-2.5 rounded-xl border border-border"
              >
                Limpiar
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-semibold py-2.5 rounded-xl"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
