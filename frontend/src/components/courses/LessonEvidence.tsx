import { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle2, Clock, XCircle, FileText, ExternalLink, Loader2 } from 'lucide-react';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';

interface LessonEvidenceProps {
  lessonId: number;
}

interface Evidence {
  id: number;
  url: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  feedback: string | null;
  createdAt: string;
}

export function LessonEvidence({ lessonId }: LessonEvidenceProps) {
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchEvidence = async () => {
      try {
        const response = await api.get(`/evidences/lesson/${lessonId}/me`);
        setEvidence(response.data);
      } catch (err: any) {
        if (err.response?.status !== 404) {
          console.error('Error fetching evidence:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvidence();
  }, [lessonId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (Max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 50MB.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Upload to S3/Cloud storage via our /upload/resource endpoint
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await api.post('/upload/resource', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
          setUploadProgress(percentCompleted);
        },
      });

      const fileUrl = uploadRes.data.url;

      // 2. Submit evidence
      const response = await api.post('/evidences', {
        lessonId,
        url: fileUrl,
      });

      setEvidence(response.data);
      toast.success('Evidencia enviada correctamente');
    } catch (err) {
      console.error(err);
      toast.error('Error al subir la evidencia');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (e.target) e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (evidence) {
    return (
      <div className="bg-secondary/10 border border-border rounded-xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium text-lg mb-2">Estado de tu evidencia</h3>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">Enviado el {new Date(evidence.createdAt).toLocaleDateString()}</span>
              <a 
                href={evidence.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
              >
                <FileText className="w-4 h-4" /> Ver Archivo <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <div>
            {evidence.status === 'PENDING' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                <Clock className="w-4 h-4" /> Pendiente de revisión
              </span>
            )}
            {evidence.status === 'APPROVED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" /> Aprobada
              </span>
            )}
            {evidence.status === 'REJECTED' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                <XCircle className="w-4 h-4" /> Rechazada
              </span>
            )}
          </div>
        </div>

        {evidence.feedback && (
          <div className="mt-6 p-4 bg-background border border-border rounded-lg">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Comentarios del Instructor:</h4>
            <p className="text-sm">{evidence.feedback}</p>
          </div>
        )}

        {evidence.status === 'REJECTED' && (
          <div className="mt-6 border-t border-border pt-6">
            <h4 className="font-medium mb-4">Sube una nueva versión</h4>
            <div className="relative">
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                accept=".pdf,.zip,.rar,.jpg,.jpeg,.png,.docx,.xlsx"
              />
              <button 
                disabled={uploading}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm w-full sm:w-auto"
              >
                {uploading ? `Subiendo... ${uploadProgress}%` : 'Seleccionar Nuevo Archivo'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-border rounded-xl p-6 sm:p-8 text-center bg-secondary/10 relative">
      <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground mx-auto mb-3 sm:mb-4" />
      <h3 className="font-medium text-base sm:text-lg mb-1 sm:mb-2">Sube tu evidencia</h3>
      <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
        Para completar esta lección, debes subir tu trabajo.
        <br />
        Soporta ZIP, RAR, PDF o Imágenes (Max 50MB)
      </p>
      
      <div className="relative inline-block w-full sm:w-auto">
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          accept=".pdf,.zip,.rar,.jpg,.jpeg,.png,.docx,.xlsx"
        />
        <button 
          disabled={uploading}
          className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm w-full"
        >
          {uploading ? `Subiendo... ${uploadProgress}%` : 'Seleccionar Archivo'}
        </button>
      </div>
    </div>
  );
}
