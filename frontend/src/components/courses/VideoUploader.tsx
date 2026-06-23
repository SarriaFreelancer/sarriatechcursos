import { useCallback, useEffect, useId, useState, type ChangeEvent, type DragEvent } from 'react';
import { UploadCloud, Film, CheckCircle2, XCircle, Link2 } from 'lucide-react';
import api from '../../lib/axios';
import { cn } from '../../lib/utils';

interface VideoUploaderProps {
  lessonTitle: string;
  currentUrl?: string;
  onUploaded: (url: string) => void;
}

export function VideoUploader({ lessonTitle, currentUrl, onUploaded }: VideoUploaderProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedUrl, setUploadedUrl] = useState(currentUrl || '');
  const [mode, setMode] = useState<'upload' | 'url'>(currentUrl ? 'url' : 'upload');
  const [manualUrl, setManualUrl] = useState(currentUrl || '');

  useEffect(() => {
    setUploadedUrl(currentUrl || '');
    setManualUrl(currentUrl || '');
    if (currentUrl) {
      setMode('url');
    }
  }, [currentUrl]);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file) return;
      setError('');
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append('video', file);

      try {
        const response = await api.post('/upload/video', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(pct);
            }
          },
        });

        const url: string = response.data.url;
        setUploadedUrl(url);
        onUploaded(url);
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Error al subir el video');
      } finally {
        setUploading(false);
      }
    },
    [onUploaded]
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleUrlSave = () => {
    const nextUrl = manualUrl.trim();
    if (!nextUrl) {
      setError('Escribe una URL válida o sube un archivo.');
      return;
    }

    setError('');
    setUploadedUrl(nextUrl);
    onUploaded(nextUrl);
  };

  const handleClear = () => {
    setUploadedUrl('');
    setManualUrl('');
    setProgress(0);
    setError('');
    setMode('upload');
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground truncate">{lessonTitle}</p>

      {uploadedUrl ? (
        <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">
              {mode === 'url' ? 'URL guardada' : 'Video subido'}
            </p>
            <p className="text-xs text-muted-foreground truncate">{uploadedUrl}</p>
          </div>
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground underline flex-shrink-0"
            onClick={handleClear}
          >
            Cambiar
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors border',
                mode === 'upload'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/50 text-muted-foreground border-border hover:text-foreground'
              )}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Subir archivo
            </button>
            <button
              type="button"
              onClick={() => setMode('url')}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors border',
                mode === 'url'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary/50 text-muted-foreground border-border hover:text-foreground'
              )}
            >
              <Link2 className="w-3.5 h-3.5" />
              Usar URL
            </button>
          </div>

          {mode === 'url' ? (
            <div className="space-y-3 p-4 sm:p-5 rounded-xl border border-border bg-secondary/20">
              <label className="block text-sm font-medium text-foreground">URL del video</label>
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://..."
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleUrlSave}
                  className="bg-primary text-primary-foreground font-medium px-4 py-2.5 rounded-lg text-sm hover:bg-primary/90 transition-colors"
                >
                  Guardar URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualUrl('');
                    setUploadedUrl('');
                    setError('');
                  }}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2.5 rounded-lg border border-border"
                >
                  Limpiar
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Usa esta opción si todavía no subiste el archivo. Después puedes reemplazarla por un video subido.
              </p>
            </div>
          ) : (
            <div
              className={cn(
                'border-2 border-dashed rounded-xl p-4 sm:p-6 text-center transition-colors cursor-pointer bg-secondary/10',
                isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-secondary/30'
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && document.getElementById(inputId)?.click()}
            >
              <input
                id={inputId}
                type="file"
                accept="video/mp4,video/webm,video/mov,video/avi,video/mkv"
                className="hidden"
                onChange={handleInputChange}
                disabled={uploading}
              />

              {uploading ? (
                <div className="space-y-3">
                  <Film className="w-8 h-8 text-primary mx-auto animate-pulse" />
                  <p className="text-sm font-medium text-foreground">Subiendo video...</p>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">{progress}%</p>
                </div>
              ) : (
                <>
                  <UploadCloud className={cn('w-8 h-8 mx-auto mb-2', isDragging ? 'text-primary' : 'text-muted-foreground')} />
                  <p className="text-sm font-medium mb-1">Arrastra tu video aquí</p>
                  <p className="text-xs text-muted-foreground">MP4, WebM, MOV o MKV hasta 500MB</p>
                  <button
                    type="button"
                    className="mt-3 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    Seleccionar archivo
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-destructive text-xs">
          <XCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
