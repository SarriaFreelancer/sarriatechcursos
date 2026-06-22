export interface Resource {
  id: number;
  name: string;
  url: string;
  type: string;
}

export interface Video {
  id: number;
  url: string;
  duration?: number;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  order: number;
  video?: Video;
  resources: Resource[];
  isCompleted?: boolean;
  isFree?: boolean;
  requiresEvidence?: boolean;
}

export interface Module {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructorName: string;
  modules: Module[];
  imageUrl?: string | null;
  price?: number;
  level?: string;
  category?: { id: number; name: string };
  averageRating?: number;
  totalReviews?: number;
}
