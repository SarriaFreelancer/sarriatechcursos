import { useState, useEffect } from 'react';
import { Palette, Bell, UserCheck, Moon, Sun, Save, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/axios';

type Theme = 'light' | 'dark' | 'system';

export function Settings() {
  const { user, updateUser } = useAuthStore();
  
  // State for settings - initialize from auth store or defaults
  const [theme, setTheme] = useState<Theme>((user?.theme as Theme) || 'system');
  const [emailNotifications, setEmailNotifications] = useState(user?.emailNotifications ?? true);
  const [privacy, setPrivacy] = useState(user?.isPrivate ?? false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Effect to apply theme dynamically
  useEffect(() => {
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleThemeChange = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
  };
  
  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const response = await api.put('/auth/profile', {
        theme,
        emailNotifications,
        isPrivate: privacy
      });
      updateUser({
        theme: response.data.theme,
        emailNotifications: response.data.emailNotifications,
        isPrivate: response.data.isPrivate
      });
      setSuccessMsg('Configuraciones guardadas con éxito.');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.error || 'Error al guardar las configuraciones.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Ajustes</h1>
          <p className="text-sm text-muted-foreground mt-1">Personaliza la apariencia y el comportamiento de la plataforma.</p>
        </div>
        <button 
          onClick={handleSaveSettings} 
          disabled={isSaving}
          className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary/95 transition-all text-sm disabled:opacity-50"
        >
          {isSaving ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />}
          Guardar Cambios
        </button>
      </div>

      {successMsg && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-xl p-3.5 text-sm font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" />{successMsg}</div>}
      {errorMsg && <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-3.5 text-sm font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{errorMsg}</div>}

      {/* Appearance Settings */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold border-b border-border pb-3 flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" /> Apariencia
        </h2>
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Tema</label>
          <p className="text-sm text-muted-foreground mb-3">Selecciona cómo te gustaría que se viera la plataforma.</p>
          <div className="grid grid-cols-3 gap-3">
            <button 
              onClick={() => handleThemeChange('light')}
              className={`text-center p-4 rounded-xl border-2 transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
              <Sun className="mx-auto mb-2 w-5 h-5"/>
              <span className="text-sm font-semibold">Claro</span>
            </button>
            <button 
              onClick={() => handleThemeChange('dark')}
              className={`text-center p-4 rounded-xl border-2 transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
              <Moon className="mx-auto mb-2 w-5 h-5"/>
              <span className="text-sm font-semibold">Oscuro</span>
            </button>
            <button 
              onClick={() => handleThemeChange('system')}
              className={`text-center p-4 rounded-xl border-2 transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}>
              <Palette className="mx-auto mb-2 w-5 h-5"/>
              <span className="text-sm font-semibold">Sistema</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold border-b border-border pb-3 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" /> Notificaciones
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <label className="font-semibold" htmlFor="email-notifications">Notificaciones por correo</label>
            <p className="text-sm text-muted-foreground">Recibir un correo cuando haya actualizaciones importantes.</p>
          </div>
          <label htmlFor="email-notifications" className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" id="email-notifications" className="sr-only" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
              <div className={`block w-12 h-6 rounded-full transition-all ${emailNotifications ? 'bg-primary' : 'bg-secondary'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-card w-4 h-4 rounded-full transition-all ${emailNotifications ? 'translate-x-6' : ''}`}></div>
            </div>
          </label>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold border-b border-border pb-3 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-primary" /> Privacidad
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <label className="font-semibold" htmlFor="privacy-setting">Perfil privado</label>
            <p className="text-sm text-muted-foreground">Ocultar tu perfil y progreso a otros estudiantes.</p>
          </div>
          <label htmlFor="privacy-setting" className="flex items-center cursor-pointer">
            <div className="relative">
              <input type="checkbox" id="privacy-setting" className="sr-only" checked={privacy} onChange={() => setPrivacy(!privacy)} />
              <div className={`block w-12 h-6 rounded-full transition-all ${privacy ? 'bg-primary' : 'bg-secondary'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-card w-4 h-4 rounded-full transition-all ${privacy ? 'translate-x-6' : ''}`}></div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
