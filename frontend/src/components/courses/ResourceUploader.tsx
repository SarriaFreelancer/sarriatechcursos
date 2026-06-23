import { useState, useCallback, useId, type ChangeEvent } from 'react';
import { Paperclip, Plus, Trash2, File as FileIcon, XCircle } from 'lucide-react';
import api from '../../lib/axios';

interface Resource {
  id?: number;
  name: string;
  url: string;
  type: string;
}

interface ResourceUploaderProps {
  lessonId?: number;
  resources: Resource[];
  onAddResource: (resource: Resource) => void;
  onRemoveResource: (index: number, resourceId?: number) => void;
}

export function ResourceUploader({ lessonId, resources, onAddResource, onRemoveResource }: ResourceUploaderProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;
      if (!lessonId) {
        setError('Debes guardar el curso (Paso 1) antes de subir recursos.');
        return;
      }

      setError('');
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('resource', file);

      try {
        // 1. Subir archivo al storage
        const uploadRes = await api.post('/upload/resource', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(pct);
            }
          },
        });

        const { url, originalName } = uploadRes.data;
        const extension = originalName.split('.').pop()?.toUpperCase() || 'FILE';

        // 2. Asociar el recurso a la lección en la DB
        const assocRes = await api.post(`/lessons/${lessonId}/resources`, {
          name: originalName,
          url,
          type: extension,
        });

        onAddResource({
          id: assocRes.data.id,
          name: originalName,
          url,
          type: extension,
        });

      } catch (err: any) {
        setError(err?.response?.data?.error || 'Error al subir el recurso');
      } finally {
        setUploading(false);
      }
    },
    [lessonId, onAddResource]
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ''; // Reset input
  };

  const handleRemove = async (index: number, resourceId?: number) => {
    if (!lessonId) return;
    try {
      if (resourceId) {
        await api.delete(`/lessons/${lessonId}/resources/${resourceId}`);
      }
      onRemoveResource(index, resourceId);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Error al eliminar el recurso');
    }
  };

  return (
    <div className="mt-3 bg-secondary/5 border border-border rounded-lg p-4">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Paperclip className="w-3.5 h-3.5" />
        Recursos Complementarios
      </h4>

      {error && (
        <div className="mb-3 flex items-center gap-2 text-destructive text-xs bg-destructive/10 p-2 rounded">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {resources.length > 0 && (
        <div className="space-y-2 mb-4">
          {resources.map((res, index) => (
            <div key={res.id || index} className="flex items-center justify-between bg-background border border-border rounded-lg p-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <FileIcon className="w-4 h-4 text-primary" />
                </div>
                <div className="min-w-0 pr-2">
                  <p className="text-sm font-medium truncate" title={res.name}>{res.name}</p>
                  <p className="text-xs text-muted-foreground">{res.type}</p>
                </div>
              </div>
              <button
                onClick={() => handleRemove(index, res.id)}
                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                title="Eliminar recurso"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div>
        <input
          id={inputId}
          type="file"
          className="hidden"
          onChange={handleInputChange}
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="flex items-center gap-3 bg-secondary/30 rounded-lg p-3">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium">Subiendo... {progress}%</p>
              <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
                <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => document.getElementById(inputId)?.click()}
            className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Añadir recurso (PDF, ZIP, DOCX, etc.)
          </button>
        )}
      </div>
    </div>
  );
}
