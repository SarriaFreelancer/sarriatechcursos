import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Search, FileText, Check, X, Clock, ExternalLink } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

interface Evidence {
  id: number;
  url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  feedback: string | null;
  createdAt: string;
  student: {
    id: number;
    name: string;
    email: string;
  };
  lesson: {
    id: number;
    title: string;
    module: {
      course: {
        id: number;
        title: string;
      };
    };
  };
}

export function EvidenceReview() {
  const [evidences, setEvidences] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  const [evaluating, setEvaluating] = useState<Evidence | null>(null);
  const [feedback, setFeedback] = useState('');

  const fetchEvidences = async () => {
    try {
      const response = await api.get('/evidences/instructor');
      setEvidences(response.data);
    } catch (err) {
      toast.error('Error al cargar evidencias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvidences();
  }, []);

  const handleEvaluate = async (status: 'APPROVED' | 'REJECTED') => {
    if (!evaluating) return;
    try {
      await api.put(`/evidences/${evaluating.id}/evaluate`, {
        status,
        feedback,
      });
      toast.success('Evidencia evaluada correctamente');
      setEvaluating(null);
      setFeedback('');
      fetchEvidences();
    } catch (err) {
      toast.error('Error al evaluar evidencia');
    }
  };

  const filtered = evidences.filter(ev => {
    if (filter !== 'ALL' && ev.status !== filter) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!ev.student.name.toLowerCase().includes(s) &&
          !ev.lesson.title.toLowerCase().includes(s) &&
          !ev.lesson.module.course.title.toLowerCase().includes(s)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Revisión de Evidencias</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Evalúa las tareas enviadas por tus estudiantes
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por estudiante, curso o lección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={filter}
          onChange={(e: any) => setFilter(e.target.value)}
          className="bg-card border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-w-[150px]"
        >
          <option value="ALL">Todas</option>
          <option value="PENDING">Pendientes</option>
          <option value="APPROVED">Aprobadas</option>
          <option value="REJECTED">Rechazadas</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando evidencias...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No hay evidencias que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-medium">Estudiante</th>
                  <th className="px-6 py-4 font-medium">Curso / Lección</th>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((ev) => (
                  <tr key={ev.id} className="hover:bg-secondary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{ev.student.name}</div>
                      <div className="text-xs text-muted-foreground">{ev.student.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{ev.lesson.title}</div>
                      <div className="text-xs text-muted-foreground">{ev.lesson.module.course.title}</div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(ev.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      {ev.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                          <Clock className="w-3 h-3" /> Pendiente
                        </span>
                      )}
                      {ev.status === 'APPROVED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                          <Check className="w-3 h-3" /> Aprobado
                        </span>
                      )}
                      {ev.status === 'REJECTED' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                          <X className="w-3 h-3" /> Rechazado
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEvaluating(ev);
                          setFeedback(ev.feedback || '');
                        }}
                        className="text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        Revisar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Evaluate Modal */}
      {evaluating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-lg rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Evaluar Evidencia</h2>
            
            <div className="mb-6 space-y-4 text-sm">
              <div>
                <span className="text-muted-foreground block mb-1">Estudiante:</span>
                <span className="font-medium">{evaluating.student.name} ({evaluating.student.email})</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Lección:</span>
                <span className="font-medium">{evaluating.lesson.title}</span>
              </div>
              <div>
                <span className="text-muted-foreground block mb-1">Archivo Enviado:</span>
                <a 
                  href={evaluating.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
                >
                  <FileText className="w-4 h-4" /> Ver Archivo <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Comentarios / Feedback (opcional)</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Escribe un comentario para el estudiante..."
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary h-24 resize-none"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEvaluating(null)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEvaluate('REJECTED')}
                className="px-4 py-2 text-sm font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 rounded-lg transition-colors flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" /> Rechazar
              </button>
              <button
                onClick={() => handleEvaluate('APPROVED')}
                className="px-4 py-2 text-sm font-medium bg-green-500 text-white hover:bg-green-600 rounded-lg transition-colors flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Aprobar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
