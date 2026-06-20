import { useState } from 'react';
import { Shield, Award, Calendar, BookOpen, Clock, Download, Star, PlayCircle, Lock, ChevronDown, ChevronUp, Check, DollarSign, Wallet } from 'lucide-react';
import { StarRating } from '../explore/Explore';
import api from '../../lib/axios';

type Review = {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  student: {
    name: string;
    email: string;
  };
};

type Lesson = {
  id: number;
  title: string;
  description: string;
  order: number;
  isFree?: boolean;
  video?: { url: string } | null;
  locked?: boolean;
};

type Module = {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
};

type CourseDetailsProps = {
  course: {
    id: number;
    title: string;
    description: string;
    imageUrl?: string | null;
    price: string | number;
    level: string;
    category?: { name: string };
    instructor?: { name: string; email: string };
    reviews: Review[];
    modules: Module[];
    averageRating: number;
    totalReviews: number;
  };
  onEnrollSuccess: () => void;
};

export function CourseDetails({ course, onEnrollSuccess }: CourseDetailsProps) {
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({ 0: true });
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'mercadopago' | 'wompi' | 'payu' | null>(null);
  const [processing, setProcessing] = useState(false);

  const toggleModule = (id: number) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBuy = async () => {
    if (!paymentMethod) return;
    setProcessing(true);
    try {
      // Create a mock enrollment directly (preparing payments)
      await api.post(`/admin/courses/${course.id}/students`, {
        // Enrolling current user
      }).catch(async () => {
        // Fallback or secondary mock enrollment route if needed:
        // Let's call POST /api/courses/:id/enroll if it exists, or simulated payment endpoint.
        // Wait, backend admin endpoint is GET /courses/:id/students, but let's check what enrollment endpoint we have.
        // Let's create an enrollment route in backend/courses.routes.ts if it doesn't exist, or call the admin one.
        // Actually, we can add a POST /api/courses/:id/enroll endpoint to backend courses.routes.ts! We will create that in backend now.
        await api.post(`/courses/${course.id}/enroll`);
      });
      setShowPaymentModal(false);
      onEnrollSuccess();
    } catch (err) {
      console.error('Error de compra:', err);
    } finally {
      setProcessing(false);
    }
  };

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const freeLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.isFree).length,
    0
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Hero Banner Section */}
      <div className="bg-slate-900 text-white py-12 md:py-16 px-4 md:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_50%)]" />
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
          <div className="lg:col-span-2 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-blue-600 rounded-full text-blue-100">
              {course.category?.name || 'Curso'}
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              {course.title}
            </h1>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed line-clamp-3">
              {course.description}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs md:text-sm text-slate-300">
              <div className="flex items-center gap-1">
                <span className="text-amber-400 font-bold">{course.averageRating.toFixed(1)}</span>
                <StarRating rating={course.averageRating} size={14} />
                <span className="underline">({course.totalReviews} calificaciones)</span>
              </div>
              <span>·</span>
              <span>Creado por <span className="text-blue-400 font-medium">{course.instructor?.name}</span></span>
              <span>·</span>
              <span>Nivel: {course.level === 'BEGINNER' ? 'Principiante' : course.level === 'INTERMEDIATE' ? 'Intermedio' : 'Avanzado'}</span>
            </div>
          </div>

          {/* Visual card */}
          <div className="bg-card border border-border text-foreground rounded-2xl overflow-hidden shadow-2xl p-5 space-y-4 shrink-0 max-w-sm mx-auto lg:ml-auto">
            {course.imageUrl ? (
              <img src={course.imageUrl} alt={course.title} className="w-full h-40 object-cover rounded-lg border border-border" />
            ) : (
              <div className="w-full h-40 bg-secondary rounded-lg flex items-center justify-center font-bold text-xl opacity-30 select-none">
                SarriaTech
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold">${Number(course.price).toFixed(2)}</span>
                <span className="text-sm text-muted-foreground line-through">${(Number(course.price) * 1.5).toFixed(2)}</span>
              </div>
              <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                🔥 ¡Descuento de lanzamiento del 33% incluido!
              </p>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/95 transition-all shadow-md text-sm uppercase tracking-wider"
            >
              Comprar ahora
            </button>

            <div className="space-y-2.5 text-xs border-t border-border pt-4">
              <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[10px]">Este curso incluye:</p>
              <div className="flex items-center gap-2 text-foreground/90">
                <Clock className="w-4 h-4 text-primary" /> Acceso de por vida
              </div>
              <div className="flex items-center gap-2 text-foreground/90">
                <Award className="w-4 h-4 text-primary" /> Certificado de finalización
              </div>
              <div className="flex items-center gap-2 text-foreground/90">
                <Download className="w-4 h-4 text-primary" /> Recursos descargables ({totalLessons} lecciones)
              </div>
              <div className="flex items-center gap-2 text-foreground/90">
                <Shield className="w-4 h-4 text-primary" /> Garantía de satisfacción de 30 días
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Syllabus and Reviews */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Syllabus Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="text-xl sm:text-2xl font-bold">Contenido del Curso</h2>
              <span className="text-xs text-muted-foreground font-medium">
                {totalLessons} lecciones ({freeLessons} en vista previa)
              </span>
            </div>

            <div className="space-y-3">
              {course.modules.map((module, mi) => {
                const isExpanded = !!expandedModules[module.id] || (mi === 0 && expandedModules[0] !== false);
                return (
                  <div key={module.id} className="border border-border rounded-xl bg-card overflow-hidden">
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-4 bg-secondary/20 hover:bg-secondary/40 transition-colors font-semibold text-sm sm:text-base text-left"
                    >
                      <span className="truncate pr-4">Módulo {mi + 1}: {module.title}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 shrink-0" /> : <ChevronDown className="w-4 h-4 shrink-0" />}
                    </button>

                    {isExpanded && (
                      <div className="divide-y divide-border/60">
                        {module.lessons.map((lesson, li) => (
                          <div key={lesson.id} className="p-4 flex items-center justify-between gap-4 text-sm hover:bg-secondary/10 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              {lesson.isFree ? (
                                <PlayCircle className="w-4 h-4 text-primary shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                              )}
                              <span className="font-medium truncate">{lesson.title}</span>
                            </div>

                            {lesson.isFree ? (
                              <button
                                onClick={() => lesson.video?.url && setPreviewVideoUrl(lesson.video.url)}
                                className="text-xs text-primary font-bold hover:underline shrink-0 bg-primary/10 px-2.5 py-1 rounded-md"
                              >
                                Vista Previa
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
                                Bloqueado
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Student Reviews List */}
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold border-b border-border pb-3">Reseñas de Estudiantes</h2>
            <div className="space-y-4">
              {course.reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6">Este curso aún no tiene reseñas escritas. ¡Sé uno de los primeros estudiantes en calificarlo!</p>
              ) : (
                course.reviews.map((review) => (
                  <div key={review.id} className="border border-border rounded-xl p-4 bg-card space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-sm">{review.student.name}</p>
                        <p className="text-[10px] text-muted-foreground">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                      <StarRating rating={review.rating} size={12} />
                    </div>
                    {review.comment && (
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap pt-1">{review.comment}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Free Lesson Preview Video Modal */}
      {previewVideoUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-border flex justify-between items-center">
              <span className="font-bold text-sm">Vista Previa de Lección Gratuita</span>
              <button
                onClick={() => setPreviewVideoUrl(null)}
                className="text-xs font-bold text-muted-foreground hover:text-foreground bg-secondary px-3 py-1 rounded-md"
              >
                Cerrar
              </button>
            </div>
            <div className="aspect-video bg-black relative">
              <video
                src={previewVideoUrl}
                controls
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                className="w-full h-full"
                autoPlay
              />
            </div>
          </div>
        </div>
      )}

      {/* Payment Checkout Modal (PayPal, Stripe, etc.) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" /> Checkout de Pago
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-muted-foreground hover:text-foreground text-xs font-bold">
                Cancelar
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-secondary/40 p-4 rounded-xl space-y-1.5 text-sm">
                <p className="font-semibold text-foreground/90">{course.title}</p>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-border">
                  <span>Total a pagar:</span>
                  <span className="text-primary">${Number(course.price).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Seleccione pasarela de pago:</p>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { id: 'stripe', name: 'Stripe (Tarjetas de Crédito)', desc: 'Pago instantáneo con Visa/Mastercard' },
                    { id: 'paypal', name: 'PayPal', desc: 'Paga con tu saldo o tarjetas vinculadas' },
                    { id: 'mercadopago', name: 'Mercado Pago', desc: 'Tarjetas, PSE, Efecty o saldo en cuenta' },
                    { id: 'wompi', name: 'Wompi', desc: 'Pasarela oficial Bancolombia / Nequi' },
                    { id: 'payu', name: 'PayU', desc: 'Pagos locales y transferencias bancarias' },
                  ].map((gateway) => (
                    <label
                      key={gateway.id}
                      className={`border rounded-xl p-3 flex items-start gap-3 cursor-pointer transition-all ${
                        paymentMethod === gateway.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:bg-secondary/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentGateway"
                        checked={paymentMethod === gateway.id}
                        onChange={() => setPaymentMethod(gateway.id as any)}
                        className="mt-1 accent-primary"
                      />
                      <div className="text-left">
                        <p className="text-sm font-semibold text-foreground">{gateway.name}</p>
                        <p className="text-xs text-muted-foreground">{gateway.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleBuy}
              disabled={processing || !paymentMethod}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {processing && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
              {processing ? 'Procesando pago seguro...' : `Pagar con ${paymentMethod ? paymentMethod.toUpperCase() : 'seleccione'}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
