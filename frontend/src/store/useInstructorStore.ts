import { create } from 'zustand';
import type { ModuleFormData, LessonFormData } from '../types/instructor';

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
      video?: { url: string } | null;
    }>;
  }>;
}

interface InstructorState {
  courseId: number | null;
  modules: ModuleFormData[];
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
  title: '',
  description: '',
  videoUrl: undefined,
  videoFile: null,
  uploadProgress: 0,
  isFree: false,
});

const defaultModule = (): ModuleFormData => ({
  title: '',
  lessons: [defaultLesson()],
});

export const useInstructorStore = create<InstructorState>((set) => ({
  courseId: null,
  modules: [defaultModule()],

  setCourseId: (id) => set({ courseId: id }),
  setModules: (modules) => set({ modules }),

  loadFromCourse: (course) => {
    const modules: ModuleFormData[] =
      course.modules && course.modules.length > 0
        ? course.modules.map((mod) => ({
            id: mod.id,
            title: mod.title,
            lessons: mod.lessons.map((lesson) => ({
              id: lesson.id,
              title: lesson.title,
              description: lesson.description || '',
              isFree: lesson.isFree,
              videoUrl: lesson.video?.url,
            })),
          }))
        : [defaultModule()];

    set({ courseId: course.id, modules });
  },

  addModule: () =>
    set((state) => ({ modules: [...state.modules, defaultModule()] })),

  removeModule: (index) =>
    set((state) => ({ modules: state.modules.filter((_, i) => i !== index) })),

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
      modules[moduleIndex] = {
        ...modules[moduleIndex],
        lessons: modules[moduleIndex].lessons.filter((_, i) => i !== lessonIndex),
      };
      return { modules };
    }),

  updateLesson: (moduleIndex, lessonIndex, data) =>
    set((state) => {
      const modules = [...state.modules];
      const lessons = [...modules[moduleIndex].lessons];
      lessons[lessonIndex] = { ...lessons[lessonIndex], ...data };
      modules[moduleIndex] = { ...modules[moduleIndex], lessons };
      return { modules };
    }),

  reset: () => set({ courseId: null, modules: [defaultModule()] }),
}));
