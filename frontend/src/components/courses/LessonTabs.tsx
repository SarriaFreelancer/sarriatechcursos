import { useState } from 'react';
import type { Lesson } from '../../types/course';
import { FileText, Download, UploadCloud, MessageSquare } from 'lucide-react';
import { cn } from '../../lib/utils';
import { LessonComments } from './LessonComments';

interface LessonTabsProps {
  lesson: Lesson;
}

export function LessonTabs({ lesson }: LessonTabsProps) {
  const [activeTab, setActiveTab] = useState<'desc' | 'resources' | 'comments' | 'evidence'>('desc');

  return (
    <div className="mt-4 sm:mt-6 md:mt-8 bg-card border border-border rounded-xl overflow-hidden shadow-sm">
      <div className="flex border-b border-border bg-secondary/30 overflow-x-auto">
        <button
          onClick={() => setActiveTab('desc')}
          className={cn(
            "px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0",
            activeTab === 'desc' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-1.5 sm:gap-2"><FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Descripción</div>
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={cn(
            "px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0",
            activeTab === 'resources' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-1.5 sm:gap-2"><Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Recursos</div>
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={cn(
            "px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0",
            activeTab === 'comments' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-1.5 sm:gap-2"><MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Comentarios</div>
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={cn(
            "px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex-shrink-0",
            activeTab === 'evidence' ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <div className="flex items-center gap-1.5 sm:gap-2"><UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Evidencias</div>
        </button>
      </div>

      <div className="p-4 sm:p-6">
        {activeTab === 'desc' && (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-foreground/90 leading-relaxed text-sm sm:text-base">{lesson.description || 'No hay descripción para esta lección.'}</p>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-3 sm:space-y-4">
            {lesson.resources.length > 0 ? (
              lesson.resources.map(res => (
                <div key={res.id} className="flex items-center justify-between p-3 sm:p-4 border border-border rounded-lg bg-secondary/20 hover:bg-secondary/40 transition-colors gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <Download className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-xs sm:text-sm truncate">{res.name}</p>
                      <p className="text-xs text-muted-foreground">{res.type}</p>
                    </div>
                  </div>
                  <a href={res.url} download className="text-xs sm:text-sm font-medium text-primary hover:underline flex-shrink-0">Descargar</a>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">No hay recursos descargables disponibles.</p>
            )}
          </div>
        )}

        {activeTab === 'comments' && (
          <LessonComments lessonId={lesson.id} />
        )}

        {activeTab === 'evidence' && (
          <div className="border-2 border-dashed border-border rounded-xl p-6 sm:p-8 text-center bg-secondary/10">
            <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h3 className="font-medium text-base sm:text-lg mb-1 sm:mb-2">Sube tu evidencia</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">Soporta ZIP, RAR, PDF o Imágenes (Max 50MB)</p>
            <button className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm">
              Seleccionar Archivo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
