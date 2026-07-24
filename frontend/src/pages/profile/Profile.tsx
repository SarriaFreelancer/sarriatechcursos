import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Award, Clock, BarChart3, Mail, Calendar, Key, CheckCircle, GraduationCap, Shield, Edit, Save, User, AlertCircle, Camera, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import type { User as UserType } from '../../types';

// This is the full profile data structure from the API
interface ProfileData {
  profile: UserType & {
    createdAt: string;
    lastAccess: string;
  };
  stats: {
    coursesEnrolled: number;
    coursesCompleted: number;
    certificatesCount: number;
    studyHours: number;
    averageProgress: number;
  };
  enrollments: Array<{
    id: number;
    courseId: number;
    title: string;
    imageUrl: string | null;
    instructorName: string;
    category: string;
    progress: number;
    courseProgress?: number;
    enrolledAt: string;
  }>;
  instructorStats?: {
    coursesCreated: number;
    publishedCourses: number;
    draftCourses: number;
    totalEnrollments: number;
    totalModules: number;
  };
  teachingCourses?: Array<{
    id: number;
    title: string;
    status: string;
    category: string;
    enrollments: number;
    createdAt: string;
  }>;
  adminStats?: {
    totalUsers: number;
    totalCourses: number;
    totalEnrollments: number;
  };
}


export function Profile() {
  const { user, updateUser } = useAuthStore();
  
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'in_progress' | 'completed'>('all');

  const [isEditing, setIsEditing] = useState(false);

  // Form States
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadProfile = () => {
    setLoading(true);
    api.get('/auth/profile')
      .then((res) => {
        setData(res.data);
        // Sync auth store with latest profile data from API
        updateUser(res.data.profile);
      })
      .catch((err) => setErrorMsg(err.response?.data?.error || 'No se pudo cargar el perfil.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
    const onProgressUpdate = () => loadProfile();
    window.addEventListener('course-progress-updated', onProgressUpdate as EventListener);
    return () => window.removeEventListener('course-progress-updated', onProgressUpdate as EventListener);
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const response = await api.put('/auth/profile', { name, email });
      updateUser({ name: response.data.name, email: response.data.email });
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

  const handlePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    
    setProfileSaving(true);
    try {
      // Step 1: Upload image to get URL
      const uploadResponse = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = uploadResponse.data.url || uploadResponse.data.secure_url;

      // Step 2: Update profile with the new image URL
      const profileResponse = await api.put('/auth/profile', { profilePicture: imageUrl });
      updateUser({ profilePicture: profileResponse.data.profilePicture });
      setProfileSuccess('Foto de perfil actualizada.');

    } catch (err: any) {
      setProfileError(err.response?.data?.error || 'Error al subir la imagen.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleDeletePicture = async () => {
    setProfileSaving(true);
    try {
      const profileResponse = await api.put('/auth/profile', { profilePicture: '' });
      updateUser({ profilePicture: profileResponse.data.profilePicture });
      setProfileSuccess('Foto de perfil eliminada.');
    } catch (err: any) {
      setProfileError(err.response?.data?.error || 'Error al eliminar la foto.');
    } finally {
      setProfileSaving(false);
    }
  };


  if (loading && !data) return <div className="p-8 text-center text-muted-foreground">Cargando perfil...</div>;
  if (errorMsg || !data) return <div className="p-6 m-6 rounded-2xl border border-destructive/20 bg-destructive/10 text-destructive text-sm max-w-2xl mx-auto">{errorMsg || 'No se encontraron datos del perfil.'}</div>;

  const { profile, stats, enrollments, instructorStats, teachingCourses, adminStats } = data;
  const filteredEnrollments = enrollments.filter((enroll) => {
    const progress = Math.max(enroll.courseProgress ?? 0, enroll.progress ?? 0);
    if (activeTab === 'in_progress') return progress < 100;
    if (activeTab === 'completed') return progress === 100;
    return true;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        <div className="relative group w-28 h-28 shrink-0">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" className="hidden" />
          {user?.profilePicture ? (
            <img src={user.profilePicture} alt={user.name} className="w-full h-full rounded-full object-cover border-2 border-primary/20"/>
          ) : (
            <div className="w-full h-full rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-4xl border border-primary/20 shadow-inner">
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
          <button onClick={handlePictureClick} className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="w-6 h-6" />
          </button>
          {user?.profilePicture && (
            <button onClick={handleDeletePicture} className="absolute top-0 right-0 p-1.5 bg-destructive text-destructive-foreground rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="space-y-3 flex-1 text-center md:text-left min-w-0">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{user?.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 text-sm text-muted-foreground">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary text-foreground text-xs font-semibold uppercase tracking-wider">{profile.roleName === 'ADMIN' ? 'Administrador' : profile.roleName === 'INSTRUCTOR' ? 'Formador' : 'Estudiante'}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user?.email}</span>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-muted-foreground border-t border-border/60 pt-3">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />Miembro desde: {new Date(profile.createdAt).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="flex items-center gap-1.5"><Key className="w-4 h-4" />Último acceso: {new Date(profile.lastAccess).toLocaleDateString('es-CO')}</span>
          </div>
        </div>
        <div className="flex-shrink-0 flex gap-2">
           <button onClick={() => setIsEditing(!isEditing)} className="px-5 py-2.5 bg-background text-foreground hover:bg-secondary transition-all text-xs font-bold rounded-xl flex items-center gap-2 border border-border">
              <Edit className="w-4 h-4" /> {isEditing ? 'Cancelar Edición' : 'Editar Perfil'}
           </button>
        </div>
      </motion.div>
      
      {isEditing && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Info Form */}
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold border-b border-border pb-3 flex items-center gap-2"><User className="w-5 h-5 text-primary" /> Información Personal</h2>
            {profileSuccess && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-xl p-3.5 text-sm font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" />{profileSuccess}</div>}
            {profileError && <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-3.5 text-sm font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{profileError}</div>}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Nombre Completo</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 text-foreground"/>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Correo Electrónico</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 text-foreground"/>
              </div>
              <button type="submit" disabled={profileSaving} className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary/95 transition-all text-xs sm:text-sm disabled:opacity-50">
                {profileSaving ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />} Guardar Cambios
              </button>
            </form>
          </div>
          {/* Security Form */}
          <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-xl font-bold border-b border-border pb-3 flex items-center gap-2"><Key className="w-5 h-5 text-primary" /> Seguridad</h2>
            {passwordSuccess && <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-xl p-3.5 text-sm font-medium flex items-center gap-2"><CheckCircle className="w-4 h-4 shrink-0" />{passwordSuccess}</div>}
            {passwordError && <div className="bg-destructive/10 border border-destructive/30 text-destructive rounded-xl p-3.5 text-sm font-medium flex items-center gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{passwordError}</div>}
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Contraseña Actual</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 text-foreground"/>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Nueva Contraseña</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 text-foreground"/>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Confirmar Nueva Contraseña</label>
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="w-full bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 text-foreground"/>
              </div>
              <button type="submit" disabled={passwordSaving} className="bg-primary text-primary-foreground font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-primary/95 transition-all text-xs sm:text-sm disabled:opacity-50">
                {passwordSaving ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" /> : <Save className="w-4 h-4" />} Actualizar Contraseña
              </button>
            </form>
          </div>
        </motion.div>
      )}

            {/* Admin Global Stats */}
      {profile.roleName === 'ADMIN' && adminStats && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary" /> Estadísticas Globales del Sistema (Admin)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Usuarios Registrados', value: adminStats.totalUsers, color: 'text-indigo-500 bg-indigo-500/10' },
              { label: 'Cursos Creados', value: adminStats.totalCourses, color: 'text-sky-500 bg-sky-500/10' },
              { label: 'Matrículas Totales', value: adminStats.totalEnrollments, color: 'text-emerald-500 bg-emerald-500/10' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-[0.08em] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructor Stats */}
      {(profile.roleName === 'INSTRUCTOR' || profile.roleName === 'ADMIN') && instructorStats && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-primary" /> Estadísticas de Cursos Creados (Formador)
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: 'Cursos Creados', value: instructorStats.coursesCreated },
              { label: 'Cursos Publicados', value: instructorStats.publishedCourses },
              { label: 'Borradores', value: instructorStats.draftCourses },
              { label: 'Estudiantes Inscritos', value: instructorStats.totalEnrollments },
              { label: 'Módulos Totales', value: instructorStats.totalModules },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
                <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.08em] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructor Courses / Cursos Creados */}
      {(profile.roleName === 'INSTRUCTOR' || profile.roleName === 'ADMIN') && teachingCourses && (
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold border-b border-border pb-3">Cursos que Impartes</h2>
          {teachingCourses.length === 0 ? (
            <div className="text-center py-10 rounded-2xl border border-dashed border-border bg-card text-muted-foreground text-sm">
              Aún no has creado ningún curso. Ve al panel de instructor para empezar.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {teachingCourses.map((c) => (
                <div key={c.id} className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        {c.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
                      </span>
                      <span className="text-xs text-muted-foreground">{c.category}</span>
                    </div>
                    <h3 className="font-bold text-sm sm:text-base leading-snug text-foreground">{c.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">Inscripciones: <span className="font-semibold text-foreground">{c.enrollments}</span></p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-border/60 flex justify-between items-center">
                    <span className="text-[11px] text-muted-foreground">Creado el: {new Date(c.createdAt).toLocaleDateString()}</span>
                    <Link
                      to={`/instructor/edit-course/${c.id}`}
                      className="px-3.5 py-1.5 bg-primary text-primary-foreground hover:bg-primary/95 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <Edit className="w-3.5 h-3.5" /> Editar Curso
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Student stats & list (only show if student or admin) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border pb-4 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold">Mi Progreso de Aprendizaje</h2>
          <div className="flex rounded-xl bg-secondary/60 p-1 text-xs sm:text-sm font-medium self-start sm:self-auto border border-border">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'in_progress', label: 'En progreso' },
              { id: 'completed', label: 'Completados' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Learning statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Cursos Inscritos', value: stats.coursesEnrolled, icon: BookOpen, color: 'text-blue-500 bg-blue-500/10' },
            { label: 'Cursos Completados', value: stats.coursesCompleted, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' },
            { label: 'Certificados', value: stats.certificatesCount, icon: Award, color: 'text-amber-500 bg-amber-500/10' },
            { label: 'Horas de Estudio', value: `${stats.studyHours}h`, icon: Clock, color: 'text-purple-500 bg-purple-500/10' },
            { label: 'Progreso Promedio', value: `${stats.averageProgress}%`, icon: BarChart3, color: 'text-rose-500 bg-rose-500/10' },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm"
            >
              <div>
                <span className={`inline-flex p-2 rounded-xl ${item.color} mb-3`}>
                  <item.icon className="w-4 h-4" />
                </span>
                <p className="text-xl sm:text-2xl font-bold tracking-tight">{item.value}</p>
              </div>
              <p className="text-[10px] font-semibold text-muted-foreground mt-2 uppercase tracking-[0.08em]">{item.label}</p>
            </div>
          ))}
        </div>

        {filteredEnrollments.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-border bg-card/50 text-muted-foreground text-sm">
            No tienes cursos en esta sección.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredEnrollments.map((enrollment) => (
              <motion.div
                key={enrollment.id}
                layout
                className="bg-card border border-border rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-primary text-xl font-bold shrink-0 overflow-hidden border border-border">
                    {enrollment.imageUrl ? (
                      <img src={enrollment.imageUrl} alt={enrollment.title} className="w-full h-full object-cover" />
                    ) : (
                      enrollment.title.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">{enrollment.category}</p>
                    <h3 className="font-bold text-sm sm:text-base leading-snug text-foreground line-clamp-2">{enrollment.title}</h3>
                    <p className="text-xs text-muted-foreground">Por {enrollment.instructorName}</p>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-muted-foreground">
                      Inscrito el: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                    </span>
                    <span className={Math.max(enrollment.courseProgress ?? 0, enrollment.progress ?? 0) === 100 ? 'text-emerald-500' : 'text-primary'}>
                      {Math.max(enrollment.courseProgress ?? 0, enrollment.progress ?? 0) === 100
                        ? 'Completado'
                        : `${Math.max(enrollment.courseProgress ?? 0, enrollment.progress ?? 0)}%`}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        Math.max(enrollment.courseProgress ?? 0, enrollment.progress ?? 0) === 100 ? 'bg-emerald-500' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.max(enrollment.courseProgress ?? 0, enrollment.progress ?? 0)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
