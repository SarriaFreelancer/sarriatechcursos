import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, List, X, Star, Send } from 'lucide-react';
import api from '../../lib/axios';
import { useCourseStore } from '../../store/useCourseStore';
import { VideoPlayer } from '../../components/courses/VideoPlayer';
import { CourseSidebar } from '../../components/courses/CourseSidebar';
import { LessonTabs } from '../../components/courses/LessonTabs';
import { CourseDetails } from './CourseDetails';
import { useAuthStore } from '../../store/useAuthStore';
import type { Course } from '../../types/course';

type BackendCourse = {
  id: number;
  title: string;
  description: string;
  imageUrl?: string | null;
  price: string | number;
  level: string;
  category?: { name: string };
  averageRating: number;
  totalReviews: number;
  reviews: any[];
  isEnrolled: boolean;
  instructor: {
    id: number;
    name: string;
    email: string;
  };
  modules: Array<{
    id: number;
    title: string;
    order: number;
    lessons: Array<{
      id: number;
      title: string;
      description: string;
      order: number;
      isFree?: boolean;
      video?: {
        id: number;
        url: string;
        duration?: number | null;
      } | null;
      resources: Array<{
        id: number;
        name: string;
        url: string;
        type: string;
      }>;
    }>;
  }>;
};

export function CourseViewer() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const { course, setCourse, activeLessonId } = useCourseStore();
  const [showSidebar, setShowSidebar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Enrollment & review states
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [fullCourseData, setFullCourseData] = useState<BackendCourse | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Content Protection: Prevent Inspect Hotkeys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U (View Source) or Ctrl+S (Save Page)
      if (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch Course details
  useEffect(() => {
    let cancelled = false;

    if (!id) {
      setErrorMsg('No se encontró el curso solicitado.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    api
      .get(`/courses/${id}`)
      .then((response) => {
        if (cancelled) {
          return;
        }

        const backendCourse = response.data as BackendCourse;
        setIsEnrolled(backendCourse.isEnrolled);
        setFullCourseData(backendCourse);

        const normalizedCourse: Course = {
          id: backendCourse.id,
          title: backendCourse.title,
          description: backendCourse.description,
          instructorName: backendCourse.instructor?.name || 'Instructor',
          price: Number(backendCourse.price),
          level: backendCourse.level,
          imageUrl: backendCourse.imageUrl,
          averageRating: backendCourse.averageRating,
          totalReviews: backendCourse.totalReviews,
          modules: backendCourse.modules.map((module) => ({
            id: module.id,
            title: module.title,
            order: module.order,
            lessons: module.lessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              order: lesson.order,
              isFree: lesson.isFree,
              video: lesson.video
                ? {
                    id: lesson.video.id,
                    url: lesson.video.url,
                    duration: lesson.video.duration ?? undefined,
                  }
                : undefined,
              resources: lesson.resources.map((resource) => ({
                id: resource.id,
                name: resource.name,
                url: resource.url,
                type: resource.type,
              })),
            })),
          })),
        };

        setCourse(normalizedCourse);
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMsg(error.response?.data?.error || 'No se pudo cargar el curso.');
          setCourse(null);
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
  }, [id, setCourse, refreshKey]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmittingReview(true);
    setReviewSuccess('');
    try {
      await api.post(`/courses/${id}/reviews`, { rating, comment });
      setReviewSuccess('¡Gracias por tu reseña!');
      setComment('');
      // Reload stats/reviews
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Error al guardar la reseña.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando curso...</div>;
  }

  // Render purchase/landing details page if not enrolled
  if (isEnrolled === false && fullCourseData) {
    return (
      <CourseDetails
        course={fullCourseData}
        onEnrollSuccess={() => setRefreshKey((prev) => prev + 1)}
      />
    );
  }

  if (errorMsg || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center text-muted-foreground">
        {errorMsg || 'Curso no disponible.'}
      </div>
    );
  }

  let activeLesson = null;
  for (const module of course.modules) {
    const lesson = module.lessons.find((currentLesson) => currentLesson.id === activeLessonId);
    if (lesson) {
      activeLesson = lesson;
      break;
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background" onContextMenu={(e) => e.preventDefault()}>
      <header className="h-12 sm:h-14 bg-card border-b border-border flex items-center px-3 sm:px-4 shrink-0">
        <Link to="/dashboard" className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors mr-3 sm:mr-6 flex-shrink-0">
          <ChevronLeft className="w-5 h-5" />
          <span className="font-medium hidden sm:inline text-sm">Volver</span>
        </Link>
        <div className="h-6 w-px bg-border mx-1 sm:mx-2 flex-shrink-0" />
        <h1 className="font-bold text-xs sm:text-sm md:text-base ml-2 sm:ml-4 truncate flex-1 min-w-0">{course.title}</h1>

        <button
          className="lg:hidden p-2 rounded-lg hover:bg-secondary text-muted-foreground flex-shrink-0 ml-2"
          onClick={() => setShowSidebar((prev) => !prev)}
          aria-label="Ver temario"
        >
          {showSidebar ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <div className="flex-1 overflow-y-auto bg-background/50">
          <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8">
            {activeLesson ? (
              <>
                <div className="mb-3 sm:mb-6">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-1 sm:mb-2">{activeLesson.title}</h2>
                  <p className="text-muted-foreground text-xs sm:text-sm flex items-center gap-2">
                    Profesor: <span className="font-medium text-primary">{course.instructorName}</span>
                  </p>
                </div>

                {/* Content Protected Video Player Container */}
                <div className="relative group/player rounded-2xl overflow-hidden shadow-lg border border-border bg-black">
                  <VideoPlayer lesson={activeLesson} />

                  {/* Anti-copy dynamic watermark overlay */}
                  {user && (
                    <div className="absolute top-8 left-8 text-[9px] sm:text-xs font-bold text-white/10 select-none pointer-events-none select-none tracking-widest font-mono transition-opacity">
                      {user.email} - IP Protegida
                    </div>
                  )}
                  {user && (
                    <div className="absolute bottom-8 right-8 text-[9px] sm:text-xs font-bold text-white/10 select-none pointer-events-none select-none tracking-widest font-mono transition-opacity">
                      SarriaTech E-Learning
                    </div>
                  )}
                </div>

                <LessonTabs lesson={activeLesson} />

                {/* Rating Form section */}
                <div className="mt-8 bg-card border border-border rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
                  <div className="border-b border-border pb-3">
                    <h3 className="font-bold text-base sm:text-lg">Calificar este curso</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Comparte tu opinión con la comunidad de SarriaTech.</p>
                  </div>

                  {reviewSuccess ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-xl p-4 text-sm font-medium flex items-center gap-2">
                      ⭐ {reviewSuccess}
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Tu puntuación</label>
                        <div className="flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(null)}
                              className="text-amber-500 hover:scale-110 transition-transform"
                            >
                              <Star
                                size={28}
                                className={
                                  star <= (hoverRating ?? rating)
                                    ? 'fill-amber-500 stroke-amber-500'
                                    : 'text-muted-foreground/30'
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Tu comentario (Opcional)</label>
                        <textarea
                          rows={3}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Cuéntanos qué te pareció el curso, el contenido y la pedagogía..."
                          className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl hover:bg-primary/95 text-xs sm:text-sm flex items-center gap-2 transition-all disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        {submittingReview ? 'Enviando...' : 'Enviar reseña'}
                      </button>
                    </form>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 sm:py-20 text-muted-foreground">
                Selecciona una lección para comenzar
              </div>
            )}
          </div>
        </div>

        {showSidebar && (
          <div
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        <div className={`
          fixed inset-y-0 right-0 z-50 w-80 sm:w-96 transform transition-transform duration-300 ease-in-out
          lg:static lg:w-[380px] xl:w-[400px] lg:translate-x-0
          shrink-0 border-l border-border bg-card overflow-hidden
          ${showSidebar ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <CourseSidebar course={course} onLessonSelect={() => setShowSidebar(false)} />
        </div>
      </div>
    </div>
  );
}
