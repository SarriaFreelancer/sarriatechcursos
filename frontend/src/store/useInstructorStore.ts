import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModuleFormData, LessonFormData } from '../types/instructor';

const createClientId = () =>
  (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `client-${Date.now()}-${Math.random().toString(36).slice(2)}`);

interface CourseApiData {
  id: number;
  title: string;
  description: string;
  price: number;
  level: string;
  categoryId: number;
  imageUrl?: string | null;
  modules?: Array<{
    id: number;
    title: string;
    lessons: Array<{
      id: number;
      title: string;
      description: string;
      isFree: boolean;
      requiresEvidence?: boolean;
      video?: { url: string } | null;
      resources?: Array<{
        id?: number;
        name: string;
        url: string;
        type: string;
      }>;
    }>;
  }>;
}

interface InstructorState {
  courseId: number | null;
  modules: ModuleFormData[];
  deletedModuleIds: number[];
  deletedLessonIds: number[];
  setCourseId: (id: number) => void;
  setModules: (modules: ModuleFormData[]) => void;
  loadFromCourse: (course: CourseApiData) => void;
  addModule: () => void;
  removeModule: (index: number) => void;
  updateModuleTitle: (index: number, title: string) => void;
  addLesson: (moduleIndex: number) => void;
  removeLesson: (moduleIndex: number, lessonIndex: number) => void;
  updateLesson: (moduleIndex: number, lessonIndex: number, data: Partial<LessonFormData>) => void;
  reset: () => void;
}

const defaultLesson = (): LessonFormData => ({
  clientId: createClientId(),
  title: '',
  description: '',
  videoUrl: undefined,
  videoFile: null,
  uploadProgress: 0,
  isFree: false,
  requiresEvidence: false,
  resources: [],
});

const defaultModule = (): ModuleFormData => ({
  clientId: createClientId(),
  title: '',
  lessons: [defaultLesson()],
});

export const useInstructorStore = create<InstructorState>()(
  persist(
    (set) => ({
      courseId: null,
      modules: [defaultModule()],
      deletedModuleIds: [],
      deletedLessonIds: [],

      setCourseId: (id) => set({ courseId: id }),
      setModules: (modules) => set({ modules }),

      loadFromCourse: (course) => {
        const modules: ModuleFormData[] =
          course.modules && course.modules.length > 0
            ? course.modules.map((mod) => ({
                clientId: createClientId(),
                id: mod.id,
                title: mod.title,
                lessons: mod.lessons.map((lesson) => ({
                  clientId: createClientId(),
                  id: lesson.id,
                  title: lesson.title,
                  description: lesson.description || '',
                  isFree: lesson.isFree,
                  requiresEvidence: lesson.requiresEvidence || false,
                  videoUrl: lesson.video?.url,
                  resources: lesson.resources || [],
                })),
              }))
            : [defaultModule()];

        set({ courseId: course.id, modules, deletedModuleIds: [], deletedLessonIds: [] });
      },

      addModule: () =>
        set((state) => ({ modules: [...state.modules, defaultModule()] })),

      removeModule: (index) =>
        set((state) => {
          const mod = state.modules[index];
          const newDeletedModuleIds = mod?.id
            ? [...state.deletedModuleIds, mod.id]
            : state.deletedModuleIds;
          // Also track deleted lessons inside this module
          const deletedLessonIds = [
            ...state.deletedLessonIds,
            ...(mod?.lessons?.filter((l) => l.id).map((l) => l.id!) ?? []),
          ];
          return {
            modules: state.modules.filter((_, i) => i !== index),
            deletedModuleIds: newDeletedModuleIds,
            deletedLessonIds,
          };
        }),

      updateModuleTitle: (index, title) =>
        set((state) => {
          const modules = [...state.modules];
          modules[index] = { ...modules[index], title };
          return { modules };
        }),

      addLesson: (moduleIndex) =>
        set((state) => {
          const modules = [...state.modules];
          modules[moduleIndex] = {
            ...modules[moduleIndex],
            lessons: [...modules[moduleIndex].lessons, defaultLesson()],
          };
          return { modules };
        }),

      removeLesson: (moduleIndex, lessonIndex) =>
        set((state) => {
          const modules = [...state.modules];
          const lesson = modules[moduleIndex].lessons[lessonIndex];
          const deletedLessonIds = lesson?.id
            ? [...state.deletedLessonIds, lesson.id]
            : state.deletedLessonIds;
          modules[moduleIndex] = {
            ...modules[moduleIndex],
            lessons: modules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex),
          };
          return { modules, deletedLessonIds };
        }),

      updateLesson: (moduleIndex, lessonIndex, data) =>
        set((state) => {
          const modules = [...state.modules];
          const lessons = [...modules[moduleIndex].lessons];
          lessons[lessonIndex] = { ...lessons[lessonIndex], ...data };
          modules[moduleIndex] = { ...modules[moduleIndex], lessons };
          return { modules };
        }),

      reset: () =>
        set({ courseId: null, modules: [defaultModule()], deletedModuleIds: [], deletedLessonIds: [] }),
    }),
    {
      name: 'instructor-store',
      partialize: (state) => ({
        courseId: state.courseId,
        modules: state.modules,
        deletedModuleIds: state.deletedModuleIds,
        deletedLessonIds: state.deletedLessonIds,
      }),
    }
  )
);
