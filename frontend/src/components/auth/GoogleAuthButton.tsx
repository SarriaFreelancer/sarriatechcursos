import { useEffect, useRef, useState } from 'react';

type GoogleAuthButtonProps = {
  label: string;
  onSuccess: (credential: string) => void | Promise<void>;
  onError?: (message: string) => void;
};

const googleScriptId = 'google-identity-services';
let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Google auth requires a browser environment'));
  }

  if (window.google) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(googleScriptId) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')));
      return;
    }

    const script = document.createElement('script');
    script.id = googleScriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export function GoogleAuthButton({ label, onSuccess, onError }: GoogleAuthButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onSuccess, onError });
  const [status, setStatus] = useState<'loading' | 'ready' | 'missing-config' | 'error'>('loading');
  const [statusMessage, setStatusMessage] = useState('Cargando botón de Google...');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    callbacksRef.current = { onSuccess, onError };
  }, [onSuccess, onError]);

  useEffect(() => {
    let cancelled = false;

    if (!clientId) {
      const message = 'Configura VITE_GOOGLE_CLIENT_ID para habilitar Google.';
      setStatus('missing-config');
      setStatusMessage(message);
      callbacksRef.current.onError?.(message);
      return;
    }

    setStatus('loading');
    setStatusMessage('Cargando botón de Google...');

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google) {
          return;
        }

        const parentWidth = buttonRef.current?.parentElement?.clientWidth || 360;
        const isCompactViewport = window.matchMedia('(max-width: 640px)').matches;
        const validWidth = isCompactViewport
          ? Math.min(Math.max(parentWidth, 220), 320)
          : Math.min(Math.max(parentWidth, 280), 440);

        buttonRef.current.innerHTML = '';
        buttonRef.current.style.width = '100%';
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response.credential) {
              callbacksRef.current.onError?.('No se pudo obtener la credencial de Google.');
              return;
            }

            void callbacksRef.current.onSuccess(response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: false,
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'filled_blue',
          size: isCompactViewport ? 'medium' : 'large',
          text: label.includes('Registrar') ? 'signup_with' : 'continue_with',
          shape: 'pill',
          width: validWidth,
          logo_alignment: 'left',
        });

        setStatus('ready');
        setStatusMessage('');
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setStatus('error');
          setStatusMessage('No se pudo cargar Google en este momento.');
          callbacksRef.current.onError?.(error.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, label]);

  return (
    <div className="space-y-3">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
        O continúa con Google
      </p>
      <div className="transition-all flex justify-center w-full">
        <div ref={buttonRef} className="w-full max-w-[320px] sm:max-w-[440px] [&>div]:!mx-auto [&>div]:!block" />
        {status !== 'ready' && (
          <p
            className={`px-1 pt-1 text-center text-xs ${
              status === 'error' || status === 'missing-config'
                ? 'text-destructive'
                : 'text-muted-foreground'
            }`}
          >
            {statusMessage}
          </p>
        )}
      </div>
    </div>
  );
}
