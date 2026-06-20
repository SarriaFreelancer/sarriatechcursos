import { ChevronDown, ChevronUp, Plus, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { useInstructorStore } from '../../store/useInstructorStore';

interface ModuleEditorProps {
  moduleIndex: number;
  onRemove: () => void;
  isOnly: boolean;
}

export function ModuleEditor({ moduleIndex, onRemove, isOnly }: ModuleEditorProps) {
  const [expanded, setExpanded] = useState(true);
  const { modules, updateModuleTitle, addLesson, removeLesson, updateLesson } = useInstructorStore();
  const module = modules[moduleIndex];

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Module Header */}
      <div className="flex items-center gap-2 p-3 sm:p-4 bg-secondary/30 border-b border-border">
        <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0 cursor-grab hidden sm:block" />
        <span className="text-xs font-semibold text-muted-foreground flex-shrink-0">M{moduleIndex + 1}</span>
        <input
          type="text"
          value={module.title}
          onChange={(e) => updateModuleTitle(moduleIndex, e.target.value)}
          placeholder={`Módulo ${moduleIndex + 1}: Ej. Introducción`}
          className="flex-1 bg-transparent text-sm font-semibold focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50 min-w-0"
        />
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isOnly && (
            <button
              onClick={onRemove}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              title="Eliminar módulo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Lessons List */}
      {expanded && (
        <div className="p-3 sm:p-4 space-y-3">
          {module.lessons.map((lesson, lessonIndex) => (
            <div
              key={lessonIndex}
              className="bg-background border border-border rounded-lg p-3 sm:p-4 space-y-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
                  {moduleIndex + 1}.{lessonIndex + 1}
                </span>
                <input
                  type="text"
                  value={lesson.title}
                  onChange={(e) => updateLesson(moduleIndex, lessonIndex, { title: e.target.value })}
                  placeholder="Título de la lección"
                  className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-0"
                />
                {module.lessons.length > 1 && (
                  <button
                    onClick={() => removeLesson(moduleIndex, lessonIndex)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
                    title="Eliminar lección"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <textarea
                value={lesson.description}
                onChange={(e) => updateLesson(moduleIndex, lessonIndex, { description: e.target.value })}
                placeholder="Descripción de la lección (opcional)"
                rows={2}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="flex items-center gap-2 pt-1">
                <label className="flex items-center gap-2.5 text-xs font-semibold cursor-pointer text-muted-foreground hover:text-foreground">
                  <input
                    type="checkbox"
                    checked={lesson.isFree || false}
                    onChange={(e) => updateLesson(moduleIndex, lessonIndex, { isFree: e.target.checked })}
                    className="accent-primary rounded border-border w-4 h-4 focus:ring-primary/40"
                  />
                  Disponible como vista previa gratuita
                </label>
              </div>
            </div>
          ))}

          <button
            onClick={() => addLesson(moduleIndex)}
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Plus className="w-4 h-4" /> Añadir Lección
          </button>
        </div>
      )}
    </div>
  );
}
