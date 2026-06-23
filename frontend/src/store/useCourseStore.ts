import { create } from 'zustand';
import type { Course } from '../types/course';

interface CourseState {
  course: Course | null;
  activeLessonId: number | null;
  completedLessons: number[];
  setCourse: (course: Course | null) => void;
  setActiveLesson: (id: number) => void;
  markLessonComplete: (id: number) => void;
  setCompletedLessons: (ids: number[]) => void;
}

export const useCourseStore = create<CourseState>((set) => ({
  course: null,
  activeLessonId: null,
  completedLessons: [],
  setCourse: (course) => set({
    course,
    activeLessonId: course?.modules[0]?.lessons[0]?.id || null,
  }),
  setActiveLesson: (id) => set({ activeLessonId: id }),
  markLessonComplete: (id) => set((state) => ({
    completedLessons: state.completedLessons.includes(id) 
      ? state.completedLessons 
      : [...state.completedLessons, id]
  })),
  setCompletedLessons: (ids) => set({ completedLessons: Array.from(new Set(ids)) }),
}));
