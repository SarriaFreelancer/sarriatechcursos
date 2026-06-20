import { useState } from 'react';
import type { Course } from '../../types/course';
import { useCourseStore } from '../../store/useCourseStore';
import { ChevronDown, ChevronUp, PlayCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CourseSidebarProps {
  course: Course;
  onLessonSelect?: () => void;
}

export function CourseSidebar({ course, onLessonSelect }: CourseSidebarProps) {
  const { activeLessonId, setActiveLesson, completedLessons } = useCourseStore();
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({
    [course.modules[0]?.id]: true // Expand first module by default
  });

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const handleLessonClick = (lessonId: number) => {
    setActiveLesson(lessonId);
    onLessonSelect?.();
  };

  return (
    <div className="w-full h-full bg-card flex flex-col overflow-hidden">
      <div className="p-3 sm:p-4 border-b border-border bg-secondary/50 flex-shrink-0">
        <h2 className="font-bold text-base sm:text-lg">Contenido del Curso</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {course.modules.map(module => (
          <div key={module.id} className="border-b border-border">
            <button
              className="w-full flex items-center justify-between p-3 sm:p-4 bg-secondary/20 hover:bg-secondary/40 transition-colors"
              onClick={() => toggleModule(module.id)}
            >
              <div className="flex flex-col items-start text-left min-w-0 flex-1 mr-2">
                <span className="font-semibold text-xs sm:text-sm">Módulo {module.order}</span>
                <span className="text-muted-foreground text-xs sm:text-sm truncate w-full">{module.title}</span>
              </div>
              {expandedModules[module.id] ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />}
            </button>

            {expandedModules[module.id] && (
              <div className="bg-background">
                {module.lessons.map(lesson => {
                  const isActive = activeLessonId === lesson.id;
                  const isCompleted = completedLessons.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => handleLessonClick(lesson.id)}
                      className={cn(
                        "w-full flex items-start p-3 sm:p-4 text-left transition-colors hover:bg-secondary/50",
                        isActive && "bg-primary/10 border-l-4 border-primary"
                      )}
                    >
                      <div className="mr-2 sm:mr-3 mt-0.5 flex-shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                        ) : (
                          <PlayCircle className={cn("w-4 h-4 sm:w-5 sm:h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs sm:text-sm", isActive ? "font-medium text-primary" : "text-foreground")}>
                          {lesson.order}. {lesson.title}
                        </p>
                        {lesson.video?.duration && (
                          <p className="text-xs text-muted-foreground mt-0.5 sm:mt-1">
                            {Math.floor(lesson.video.duration / 60)} min
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
