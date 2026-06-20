export interface LessonFormData {
  id?: number;
  title: string;
  description: string;
  videoUrl?: string;
  videoFile?: File | null;
  uploadProgress?: number;
  isFree?: boolean;
  resources?: Array<{
    id?: number;
    name: string;
    url: string;
    type: string;
  }>;
}

export interface ModuleFormData {
  id?: number;
  title: string;
  lessons: LessonFormData[];
}

export interface CourseFormData {
  title: string;
  description: string;
  price: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  categoryId: string;
  imageUrl?: string;
}

export interface Category {
  id: number;
  name: string;
}
