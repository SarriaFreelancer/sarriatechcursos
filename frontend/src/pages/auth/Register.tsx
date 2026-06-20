// import { useState } from 'react';
// import { useForm as useHookForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { Link, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { Mail, Lock, User, Loader2 } from 'lucide-react';
// import { useAuthStore } from '../../store/useAuthStore';
// import api from '../../lib/axios';

// const registerSchema = z.object({
//   name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
//   email: z.string().email('Email inválido'),
//   password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
//   confirmPassword: z.string()
// }).refine((data) => data.password === data.confirmPassword, {
//   message: "Las contraseñas no coinciden",
//   path: ["confirmPassword"],
// });

// type RegisterForm = z.infer<typeof registerSchema>;

// export function Register() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState('');
//   const navigate = useNavigate();
//   const setAuth = useAuthStore(state => state.setAuth);

//   const { register, handleSubmit, formState: { errors } } = useHookForm<RegisterForm>({
//     resolver: zodResolver(registerSchema),
//   });

//   const onSubmit = async (data: RegisterForm) => {
//     setIsLoading(true);
//     setErrorMsg('');
//     try {
//       const response = await api.post('/auth/register', {
//         name: data.name,
//         email: data.email,
//         password: data.password,
//         roleId: 2
//       });
      
//       setAuth(response.data.user, response.data.token, response.data.token);
//       navigate('/dashboard');
//     } catch (error: any) {
//       if (error.response && error.response.data && error.response.data.message) {
//         setErrorMsg(error.response.data.message);
//       } else {
//         setErrorMsg('Error de conexión con el servidor. Verifica que el backend esté en línea.');
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background p-4">
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-xl"
//       >
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-primary mb-2">SarriaTech</h1>
//           <p className="text-muted-foreground mt-2">Crea tu cuenta para empezar a aprender</p>
//         </div>
      
//         {errorMsg && (
//           <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center mb-6">
//             {errorMsg}
//           </div>
//         )}

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Nombre Completo</label>
//             <input 
//               {...register('name')}
//               className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//             />
//             {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Correo Electrónico</label>
//             <input 
//               {...register('email')}
//               className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//             />
//             {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Contraseña</label>
//             <input 
//               type="password"
//               {...register('password')}
//               className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//             />
//             {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Confirmar Contraseña</label>
//             <input 
//               type="password"
//               {...register('confirmPassword')}
//               className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//             />
//             {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>}
//           </div>

//           <button 
//             disabled={isLoading}
//             className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors flex justify-center items-center mt-2"
//           >
//             {isLoading ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : 'Registrarse'}
//           </button>
//         </form>

//         <p className="text-center mt-6 text-sm text-muted-foreground">
//           ¿Ya tienes una cuenta? <Link to="/login" className="text-primary hover:underline">Inicia Sesión</Link>
//         </p>
//       </motion.div>
//     </div>
//   );
// }
import { useState } from 'react';
import { useForm as useHookForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import api from '../../lib/axios';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { getDefaultRoute } from '../../lib/roles';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterForm = z.infer<typeof registerSchema>;

export function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const { register, handleSubmit, formState: { errors } } = useHookForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const handleGoogleSuccess = async (credential: string) => {
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/auth/google', { credential });
      setAuth(response.data.user, response.data.token);
      navigate(getDefaultRoute(response.data.user.roleName));
    } catch (error: any) {
      const message = error.response?.data?.message || 'No se pudo registrar con Google.';
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      
      // Mantenemos tu lógica de autenticación exacta
      setAuth(response.data.user, response.data.token);
      navigate(getDefaultRoute(response.data.user.roleName));
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg('Error de conexión con el servidor. Verifica que el backend esté en línea.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background font-sans selection:bg-primary/30">
      
      {/* SECCIÓN IZQUIERDA: Panel Inspiracional (Consistente con el Login) */}
      <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 items-center justify-center p-12 border-r border-border/40">
        {/* Grid de fondo geométrico */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        
        {/* Luces de neón difusas */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 w-full max-w-sm space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-semibold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">
              Comienza hoy
            </span>
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-none">
              Únete a <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">SarriaTech</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Crea tu cuenta en menos de un minuto y desbloquea el acceso a la comunidad de aprendizaje tecnológico.
            </p>
          </div>

          {/* Tarjetas informativas breves */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 p-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-xl hover:border-emerald-500/40 transition-colors"
            >
              <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 font-mono text-xl">🚀</div>
              <div>
                <h4 className="text-white text-sm font-semibold">Rutas guiadas de IA, Programación y Datos.</h4>
                <p className="text-slate-400 text-xs">Avanza paso a paso con contenido práctico y estructurado.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 p-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-xl hover:border-blue-500/40 transition-colors"
            >
              <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400 font-mono text-xl">💻</div>
              <div>
                <h4 className="text-white text-sm font-semibold">Proyectos reales con código desplegable.</h4>
                <p className="text-slate-400 text-xs">Construye portfolio mientras aprendes con entregables concretos.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Formulario de Registro */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 md:p-12 bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-6"
        >
          {/* Encabezado */}
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              Sarria<span className="text-primary">Tech</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Crea tu cuenta para empezar a aprender.
            </p>
          </div>

          {/* Manejo de Errores */}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl text-sm font-medium text-center"
            >
              {errorMsg}
            </motion.div>
          )}

          <GoogleAuthButton
            label="Registrarse con Google"
            onSuccess={handleGoogleSuccess}
            onError={setErrorMsg}
          />

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Campo: Nombre */}
            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input 
                  {...register('name')}
                  type="text"
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl transition-all focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                />
              </div>
              {errors.name && <p className="text-destructive text-xs font-medium mt-1 pl-1">⚠️ {errors.name.message}</p>}
            </div>

            {/* Campo: Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input 
                  {...register('email')}
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl transition-all focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                />
              </div>
              {errors.email && <p className="text-destructive text-xs font-medium mt-1 pl-1">⚠️ {errors.email.message}</p>}
            </div>

            {/* Campo: Contraseña */}
            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input 
                  type="password"
                  {...register('password')}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl transition-all focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                />
              </div>
              {errors.password && <p className="text-destructive text-xs font-medium mt-1 pl-1">⚠️ {errors.password.message}</p>}
            </div>

            {/* Campo: Confirmar Contraseña */}
            <div className="space-y-1">
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                <input 
                  type="password"
                  {...register('confirmPassword')}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl transition-all focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm"
                />
              </div>
              {errors.confirmPassword && <p className="text-destructive text-xs font-medium mt-1 pl-1">⚠️ {errors.confirmPassword.message}</p>}
            </div>

            {/* Botón de Registro */}
            <button 
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 transition-all flex justify-center items-center gap-2 text-sm mt-2"
            >
              {isLoading ? (
                <Loader2 className="animate-spin w-4 h-4 text-primary-foreground" />
              ) : (
                'Crear mi Cuenta →'
              )}
            </button>
          </form>

          {/* Enlace hacia el Login */}
          <p className="text-center text-sm text-muted-foreground pt-1">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-4">
              Inicia Sesión
            </Link>
          </p>
        </motion.div>
      </div>

    </div>
  );
}
