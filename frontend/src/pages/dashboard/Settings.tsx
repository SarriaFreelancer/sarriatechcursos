import { useState } from 'react';
import { Save, User, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/axios';

export function Settings() {
  const { user, updateUser } = useAuthStore();

  // Profile Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');

    try {
      const response = await api.put('/auth/profile', { name, email });
      // Update store
      updateUser({
        id: response.data.id,
        name: response.data.name,
        email: response.data.email,
        roleId: response.data.roleId,
        roleName: response.data.roleName,
      });
      setProfileSuccess('Información personal actualizada con éxito.');
    } catch (err: any) {
      setProfileError(err.response?.data?.error || 'Error al actualizar la información.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden.');
      setPasswordSaving(false);
      return;
    }

    try {
      await api.put('/auth/password', { currentPassword, newPassword });
      setPasswordSuccess('Contraseña actualizada con éxito.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || 'Error al actualizar la contraseña.');
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Ajustes de Perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestiona tu información personal y la seguridad de tu cuenta.</p>
      </div>

      {/* Personal Info Form */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold border-b border-border pb-3 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> Información Personal
        </h2>

        {profileSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-xl p-3.5 text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {profileSuccess}
          </div>
        )}

        {profileError && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-3.5 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {profileError}
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre Completo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 text-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 text-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={profileSaving}
            className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary/95 transition-all text-xs sm:text-sm disabled:opacity-50"
          >
            {profileSaving ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Cambios
          </button>
        </form>
      </div>

      {/* Security Form */}
      <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-bold border-b border-border pb-3 flex items-center gap-2">
          <Key className="w-5 h-5 text-primary" /> Seguridad
        </h2>

        {passwordSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-xl p-3.5 text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {passwordSuccess}
          </div>
        )}

        {passwordError && (
          <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-3.5 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {passwordError}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Contraseña Actual</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 text-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Nueva Contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 text-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirmar Nueva Contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 text-foreground"
            />
          </div>
          <button
            type="submit"
            disabled={passwordSaving}
            className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary/95 transition-all text-xs sm:text-sm disabled:opacity-50"
          >
            {passwordSaving ? (
              <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Actualizar Contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
