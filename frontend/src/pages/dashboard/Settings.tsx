import { useState, useEffect } from 'react';
import { Palette, Bell, UserCheck, Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';

export function Settings() {
  // State for settings - initialize from localStorage or defaults
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
  const [emailNotifications, setEmailNotifications] = useState(() => localStorage.getItem('emailNotifications') === 'true');
  const [privacy, setPrivacy] = useState(() => localStorage.getItem('privacy') === 'true');

  // Effect to apply theme and save settings to localStorage
  useEffect(() => {
    // Theme logic
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);

    // Save other settings
    localStorage.setItem('emailNotifications', String(emailNotifications));
    localStorage.setItem('privacy', String(privacy));
  }, [theme, emailNotifications, privacy]);

  const handleThemeChange = (selectedTheme: Theme) => {
    setTheme(selectedTheme);
  };
  
  return (
    <div className="max-w-2xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Ajustes</h1>
        <p className="text-sm text-muted-foreground mt-1">Personaliza la apariencia y el comportamiento de la plataforma.</p>
      </div>

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
            <label className="font-semibold" htmlFor="privacy-setting">Perfil público</label>
            <p className="text-sm text-muted-foreground">Permitir que otros usuarios vean tu perfil y progreso.</p>
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
