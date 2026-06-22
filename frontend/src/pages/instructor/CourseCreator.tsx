import { useState, useEffect } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Save, BookOpen, Plus, Rocket, CheckCircle2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useInstructorStore } from '../../store/useInstructorStore';
import { StepIndicator } from '../../components/courses/StepIndicator';
import { ModuleEditor } from '../../components/courses/ModuleEditor';
import { VideoUploader } from '../../components/courses/VideoUploader';
import { ResourceUploader } from '../../components/courses/ResourceUploader';
import type { CourseFormData, Category } from '../../types/instructor';
import api from '../../lib/axios';
import Swal from 'sweetalert2';

const STEPS = [
  { label: 'Info Básica', description: 'Título y detalles' },
  { label: 'Módulos', description: 'Estructura del curso' },
  { label: 'Videos y Recursos', description: 'Sube el contenido' },
];

export function CourseCreator() {
  const navigate = useNavigate();
  const { id: editId } = useParams<{ id: string }>();
  const isEditMode = Boolean(editId);
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingCourse, setLoadingCourse] = useState(isEditMode);
  const [errorMsg, setErrorMsg] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const {
    courseId,
    setCourseId,
    modules,
    addModule,
    removeModule,
    updateLesson,
    reset,
    loadFromCourse,
    deletedModuleIds,
    deletedLessonIds,
  } = useInstructorStore();

  const { register, handleSubmit, setValue, reset: resetForm, formState: { errors } } = useForm<CourseFormData>({
    defaultValues: { level: 'BEGINNER', price: '0', categoryId: '' },
  });

  useEffect(() => {
    api.get('/courses/categories')
      .then((response) => { setCategories(response.data); })
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEditMode || !editId) {
      // Only reset if there's no persisted courseId for a different course
      const persistedId = useInstructorStore.getState().courseId;
      if (!persistedId) reset();
      return;
    }

    let cancelled = false;
    setLoadingCourse(true);
    setErrorMsg('');

    api.get(`/courses/${editId}`)
      .then((response) => {
        if (cancelled) return;
        const course = response.data;
        if (course.instructorId !== undefined) {
          loadFromCourse(course);
          resetForm({
            title: course.title,
            description: course.description,
            price: String(course.price),
            level: course.level,
            categoryId: String(course.categoryId),
            imageUrl: course.imageUrl || '',
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setErrorMsg(err?.response?.data?.error || 'No se pudo cargar el curso para editar');
      })
      .finally(() => {
        if (!cancelled) setLoadingCourse(false);
      });

    return () => { cancelled = true; };
  }, [editId, isEditMode, loadFromCourse, reset, resetForm]);

  // ─── Paso 0: Guardar Info Básica ────────────────────────────────────────────
  const handleSaveBasicInfo = async (data: CourseFormData) => {
    setSaving(true);
    setErrorMsg('');
    try {
      let catId = Number(data.categoryId);
      if (!catId && categories.length > 0) {
        catId = categories[0].id;
        setValue('categoryId', String(catId));
      }
      if (!catId) { setErrorMsg('Selecciona una categoría para continuar.'); return; }

      const payload = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        level: data.level,
        categoryId: catId,
        imageUrl: data.imageUrl || null,
      };

      let response;
      const currentCourseId = useInstructorStore.getState().courseId;
      if (currentCourseId) {
        response = await api.put(`/courses/${currentCourseId}`, payload);
      } else {
        response = await api.post('/courses', payload);
        setCourseId(response.data.id);
      }
      setStep(1);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || 'Error al guardar el curso');
    } finally {
      setSaving(false);
    }
  };

  // ─── Paso 1: Guardar Módulos y Lecciones ────────────────────────────────────
  const handleSaveModules = async () => {
    const currentCourseId = useInstructorStore.getState().courseId;
    if (!currentCourseId) {
      setErrorMsg('Primero guarda la información básica del curso.');
      return;
    }
    setSaving(true);
    setErrorMsg('');

    try {
      let currentModules = [...useInstructorStore.getState().modules];

      // 1. Eliminar módulos y lecciones removidos del store
      for (const deletedLessonId of useInstructorStore.getState().deletedLessonIds) {
        try { await api.delete(`/lessons/${deletedLessonId}`); } catch { /* ya eliminado */ }
      }
      for (const deletedModuleId of useInstructorStore.getState().deletedModuleIds) {
        try { await api.delete(`/modules/${deletedModuleId}`); } catch { /* ya eliminado */ }
      }

      // 2. Crear o actualizar módulos y lecciones
      for (let mi = 0; mi < currentModules.length; mi++) {
        const mod = currentModules[mi];
        if (!mod.title.trim()) {
          setErrorMsg(`El módulo ${mi + 1} necesita un título`);
          return;
        }

        let moduleId = mod.id;
        if (!moduleId) {
          // Crear nuevo módulo
          const mr = await api.post(`/courses/${currentCourseId}/modules`, { title: mod.title });
          moduleId = mr.data.id;
          useInstructorStore.getState().setModules(
            useInstructorStore.getState().modules.map((m, i) =>
              i === mi ? { ...m, id: moduleId } : m
            )
          );
          currentModules = [...useInstructorStore.getState().modules];
        } else {
          // Actualizar módulo existente
          await api.put(`/modules/${moduleId}`, { title: mod.title });
        }

        for (let li = 0; li < currentModules[mi].lessons.length; li++) {
          const lesson = currentModules[mi].lessons[li];
          if (!lesson.title.trim()) {
            setErrorMsg(`La lección ${li + 1} del módulo ${mi + 1} necesita un título`);
            return;
          }

          if (!lesson.id) {
            // Crear nueva lección
            const lr = await api.post(`/modules/${moduleId}/lessons`, {
              title: lesson.title,
              description: lesson.description,
              isFree: lesson.isFree || false,
              requiresEvidence: lesson.requiresEvidence || false,
            });
            updateLesson(mi, li, { id: lr.data.id });
            currentModules = [...useInstructorStore.getState().modules];
          } else {
            // Actualizar lección existente
            await api.put(`/lessons/${lesson.id}`, {
              title: lesson.title,
              description: lesson.description,
              isFree: lesson.isFree || false,
              requiresEvidence: lesson.requiresEvidence || false,
            });
          }
        }
      }

      await Swal.fire({
        icon: 'success',
        title: '¡Módulos guardados!',
        text: 'La estructura del curso se guardó correctamente.',
        timer: 1500,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || 'Error al guardar los módulos');
    } finally {
      setSaving(false);
    }
  };

  // ─── Video subido ────────────────────────────────────────────────────────────
  const handleVideoUploaded = async (moduleIndex: number, lessonIndex: number, url: string) => {
    const lesson = modules[moduleIndex].lessons[lessonIndex];
    if (!lesson.id) return;
    try {
      await api.post(`/lessons/${lesson.id}/video`, { url });
      updateLesson(moduleIndex, lessonIndex, { videoUrl: url });
    } catch (err) {
      console.error('Error al asociar video a lección', err);
    }
  };

  const handleResourceAdded = (moduleIndex: number, lessonIndex: number, resource: any) => {
    const lesson = modules[moduleIndex].lessons[lessonIndex];
    const newResources = [...(lesson.resources || []), resource];
    updateLesson(moduleIndex, lessonIndex, { resources: newResources });
  };

  const handleResourceRemoved = (moduleIndex: number, lessonIndex: number, indexToRemove: number) => {
    const lesson = modules[moduleIndex].lessons[lessonIndex];
    const newResources = (lesson.resources || []).filter((_, idx) => idx !== indexToRemove);
    updateLesson(moduleIndex, lessonIndex, { resources: newResources });
  };

  // ─── Publicar ────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    const currentCourseId = useInstructorStore.getState().courseId;
    if (!currentCourseId) return;
    setPublishing(true);
    try {
      await api.put(`/courses/${currentCourseId}`, { status: 'PUBLISHED' });
      await Swal.fire({
        icon: 'success',
        title: '¡Curso publicado!',
        text: 'Tu curso ya está disponible para los estudiantes.',
        confirmButtonText: 'Ir al panel',
      });
      reset();
      navigate('/instructor');
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || 'Error al publicar el curso');
    } finally {
      setPublishing(false);
    }
  };

  const handleSaveDraft = async () => {
    await Swal.fire({
      icon: 'info',
      title: 'Borrador guardado',
      text: 'Tu curso queda en borrador. Puedes editarlo cuando quieras.',
      timer: 2000,
      showConfirmButton: false,
      toast: true,
      position: 'top-end',
    });
    reset();
    navigate('/instructor');
  };

  if (loadingCourse) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center text-muted-foreground">
        Cargando curso...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-12 px-0">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <Link to="/instructor" className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl sm:text-3xl font-bold truncate">
            {isEditMode ? 'Editar Curso' : 'Crear Nuevo Curso'}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isEditMode
              ? 'Modifica la información, módulos y videos de tu curso'
              : 'Completa los 3 pasos para publicar tu curso'}
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
        <StepIndicator steps={STEPS} currentStep={step} />
      </div>

      {/* Error */}
      {errorMsg && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive p-3 rounded-lg text-sm flex items-center gap-2">
          <span>⚠️</span> {errorMsg}
        </div>
      )}

      {/* ── Paso 0: Info Básica ── */}
      {step === 0 && (
        <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4 border-b border-border pb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Información Básica
          </h2>
          <form onSubmit={handleSubmit(handleSaveBasicInfo)} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium mb-1.5">Título del Curso <span className="text-destructive">*</span></label>
              <input
                {...register('title', { required: 'El título es obligatorio' })}
                placeholder="Ej: Aprende React desde cero..."
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
              {errors.title && <p className="text-destructive text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Descripción Detallada <span className="text-destructive">*</span></label>
              <textarea
                {...register('description', { required: 'La descripción es obligatoria' })}
                rows={4}
                placeholder="En este curso aprenderás..."
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none"
              />
              {errors.description && <p className="text-destructive text-xs mt-1">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Precio (USD) <span className="text-destructive">*</span></label>
                <input
                  type="number" step="0.01" min="0"
                  {...register('price', { required: true, min: 0 })}
                  placeholder="49.99"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nivel <span className="text-destructive">*</span></label>
                <select
                  {...register('level')}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="BEGINNER">Principiante</option>
                  <option value="INTERMEDIATE">Intermedio</option>
                  <option value="ADVANCED">Avanzado</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Categoría <span className="text-destructive">*</span></label>
                <select
                  {...register('categoryId', { required: 'Selecciona una categoría' })}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                >
                  <option value="">Seleccionar...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-destructive text-xs mt-1">{errors.categoryId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">URL Imagen de Portada</label>
                <input
                  {...register('imageUrl')}
                  type="text"
                  placeholder="https://..."
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary text-primary-foreground font-medium px-6 py-2.5 rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60 text-sm"
              >
                {saving ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                {saving ? 'Guardando...' : 'Continuar'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Paso 1: Módulos ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-1 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Módulos y Lecciones
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Organiza el contenido de tu curso en módulos.</p>

            <div className="space-y-3 sm:space-y-4">
              {modules.map((_, moduleIndex) => (
                <ModuleEditor
                  key={moduleIndex}
                  moduleIndex={moduleIndex}
                  isOnly={modules.length === 1}
                  onRemove={() => removeModule(moduleIndex)}
                />
              ))}
            </div>

            <button
              onClick={addModule}
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="w-4 h-4" /> Añadir Módulo
            </button>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
            <button
              onClick={() => setStep(0)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Atrás
            </button>
            <button
              onClick={handleSaveModules}
              disabled={saving}
              className="bg-primary text-primary-foreground font-medium px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-60 text-sm"
            >
              {saving ? (
                <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              {saving ? 'Guardando...' : 'Guardar y Continuar'}
            </button>
          </div>
        </div>
      )}

      {/* ── Paso 2: Videos ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-1 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-primary" /> Videos y Recursos por Lección
            </h2>
            <p className="text-sm text-muted-foreground mb-5">
              Sube el video y recursos adicionales para cada lección. Puedes publicar sin completarlos todos.
            </p>

            <div className="space-y-6">
              {modules.map((module, mi) => (
                <div key={mi} className="space-y-3">
                  <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide border-b border-border pb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Módulo {mi + 1}: {module.title}
                  </h3>
                  <div className="space-y-6 pl-0 sm:pl-4">
                    {module.lessons.map((lesson, li) => (
                      <div key={li} className="bg-background border border-border rounded-xl p-4 sm:p-5">
                        <VideoUploader
                          lessonTitle={`${mi + 1}.${li + 1} ${lesson.title || 'Sin título'}`}
                          currentUrl={lesson.videoUrl}
                          onUploaded={(url) => handleVideoUploaded(mi, li, url)}
                        />
                        <ResourceUploader
                          lessonId={lesson.id}
                          resources={lesson.resources || []}
                          onAddResource={(res) => handleResourceAdded(mi, li, res)}
                          onRemoveResource={(idx) => handleResourceRemoved(mi, li, idx)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Atrás
            </button>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveDraft}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border text-muted-foreground hover:bg-secondary transition-colors text-sm"
              >
                <Save className="w-4 h-4" /> Guardar Borrador
              </button>
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="bg-green-600 text-white font-semibold px-6 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-60 text-sm shadow-lg shadow-green-500/20"
              >
                {publishing ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <Rocket className="w-4 h-4" />
                )}
                {publishing ? 'Publicando...' : isEditMode ? 'Guardar y Publicar' : 'Publicar Curso'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
