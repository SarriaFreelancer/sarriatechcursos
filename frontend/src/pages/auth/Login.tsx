// import { useState } from 'react';
// import { useForm as useHookForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import * as z from 'zod';
// import { Link, useNavigate } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import api from '../../lib/axios';
// import { useAuthStore } from '../../store/useAuthStore';

// const loginSchema = z.object({
//   email: z.string().email({ message: 'Correo inválido' }),
//   password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
// });

// type LoginForm = z.infer<typeof loginSchema>;

// export function Login() {
//   const { register, handleSubmit, formState: { errors } } = useHookForm<LoginForm>({
//     resolver: zodResolver(loginSchema)
//   });
//   const navigate = useNavigate();
//   const setAuth = useAuthStore(state => state.setAuth);
//   const [loading, setLoading] = useState(false);
//   const [errorMsg, setErrorMsg] = useState('');

//   const onSubmit = async (data: LoginForm) => {
//     setLoading(true);
//     setErrorMsg('');
//     try {
//       const response = await api.post('/auth/login', {
//         email: data.email,
//         password: data.password
//       });
      
//       setAuth(response.data.user, response.data.token);
//       navigate('/dashboard');
//     } catch (error: any) {
//       if (error.response?.data?.message) {
//         setErrorMsg(error.response.data.message);
//       } else {
//         setErrorMsg('Error al iniciar sesión. Intente nuevamente.');
//       }
//     } finally {
//       setLoading(false);
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
//           <p className="text-muted-foreground mt-2">Bienvenido de nuevo a SarriaTech</p>
//         </div>

//         {errorMsg && (
//           <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center mb-6">
//             {errorMsg}
//           </div>
//         )}

//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-2">Correo Electrónico</label>
//             <input 
//               {...register('email')}
//               className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//               placeholder="correo@ejemplo.com"
//             />
//             {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">Contraseña</label>
//             <input 
//               type="password"
//               {...register('password')}
//               className="w-full px-4 py-2 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
//               placeholder="••••••••"
//             />
//             {errors.password && <p className="text-destructive text-sm mt-1">{errors.password.message}</p>}
//           </div>

//           <button 
//             disabled={loading}
//             className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg hover:bg-primary/90 transition-colors flex justify-center items-center"
//           >
//             {loading ? <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : 'Ingresar'}
//           </button>
//         </form>

//         <p className="text-center mt-6 text-sm text-muted-foreground">
//           ¿No tienes una cuenta? <Link to="/register" className="text-primary hover:underline">Regístrate</Link>
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
import api from '../../lib/axios';
import { useAuthStore } from '../../store/useAuthStore';
import { GoogleAuthButton } from '../../components/auth/GoogleAuthButton';
import { getDefaultRoute } from '../../lib/roles';

const loginSchema = z.object({
  email: z.string().email({ message: 'Correo inválido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

type LoginForm = z.infer<typeof loginSchema>;

export function Login() {
  const { register, handleSubmit, formState: { errors } } = useHookForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSuccess = async (credential: string) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const response = await api.post('/auth/google', { credential });
      setAuth(response.data.user, response.data.token);
      navigate(getDefaultRoute(response.data.user.roleName));
    } catch (error: any) {
      const message = error.response?.data?.message || 'No se pudo iniciar sesión con Google.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password
      });
      
      setAuth(response.data.user, response.data.token);
      navigate(getDefaultRoute(response.data.user.roleName));
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg('Error al iniciar sesión. Intente nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background font-sans selection:bg-primary/30">
      
      {/* SECCIÓN IZQUIERDA: Panel Inspiracional (Oculto en móviles, visible desde LG) */}
      <div className="hidden lg:flex lg:col-span-5 relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 items-center justify-center p-12 border-r border-border/40">
        {/* Patrón de Red Tecnológica / Grid de fondo */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
        
        {/* Destellos de luz difusos de fondo */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-[100px]" />

        <div className="relative z-10 w-full max-w-sm space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-semibold tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full uppercase">
              Impulsa tu Futuro
            </span>
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-none">
              Domina la <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">Tecnología</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Inicia sesión para acceder a tus rutas de aprendizaje personalizadas.
            </p>
          </div>

          {/* Tarjetas de Categorías del Sitio Interactivas */}
          <div className="space-y-4">
            {/* Tarjeta IA */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4 p-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-xl hover:border-indigo-500/40 transition-colors"
            >
              <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-400 font-mono text-xl">🧠</div>
              <div>
                <h4 className="text-white text-sm font-semibold">Inteligencia Artificial</h4>
                <p className="text-slate-400 text-xs">Modelos LLM, Prompt Engineering y Automatización.</p>
              </div>
            </motion.div>

            {/* Tarjeta Programación */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-4 p-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-xl hover:border-blue-500/40 transition-colors"
            >
              <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400 font-mono text-xl">&lt;/&gt;</div>
              <div>
                <h4 className="text-white text-sm font-semibold">Desarrollo de Software</h4>
                <p className="text-slate-400 text-xs">React, Node.js, Arquitectura y Código Limpio.</p>
              </div>
            </motion.div>

            {/* Tarjeta Excel / Data */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4 p-4 bg-white/[0.03] backdrop-blur-md border border-white/[0.05] rounded-xl hover:border-emerald-500/40 transition-colors"
            >
              <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 font-mono text-xl">📊</div>
              <div>
                <h4 className="text-white text-sm font-semibold">Análisis de Datos & Excel</h4>
                <p className="text-slate-400 text-xs">Fórmulas avanzadas, Dashboards y PowerBI.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Formulario de Login */}
      <div className="col-span-1 lg:col-span-7 flex items-center justify-center p-6 md:p-12 bg-background">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Encabezado */}
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
              Sarria<span className="text-primary">Tech</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              Qué bueno verte de nuevo. Introduce tus credenciales para continuar.
            </p>
          </div>

          {/* Manejo de Errores del Servidor */}
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-destructive/10 border border-destructive/20 text-destructive p-3.5 rounded-xl text-sm font-medium text-center"
            >
              {errorMsg}
            </motion.div>
          )}

          <div className="w-full flex justify-center">
            <GoogleAuthButton
              label="Continuar con Google"
              onSuccess={handleGoogleSuccess}
              onError={setErrorMsg}
            />
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Correo Electrónico
              </label>
              <input 
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl transition-all duration-200 focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm placeholder:text-muted-foreground/50"
                placeholder="nombre@ejemplo.com"
              />
              {errors.email && (
                <p className="text-destructive text-xs font-medium mt-1 pl-1">
                  ⚠️ {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Contraseña
                </label>
                <Link to="/forgot-password" className="text-xs text-primary/80 hover:text-primary font-medium transition-colors">
                  ¿La olvidaste?
                </Link>
              </div>
              <input 
                type="password"
                {...register('password')}
                autoComplete="current-password"
                className="w-full px-4 py-3 bg-secondary/50 border border-border rounded-xl transition-all duration-200 focus:outline-none focus:bg-background focus:ring-2 focus:ring-primary/40 focus:border-primary text-sm placeholder:text-muted-foreground/50"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-destructive text-xs font-medium mt-1 pl-1">
                  ⚠️ {errors.password.message}
                </p>
              )}
            </div>

            {/* Botón de Submit */}
            <button 
              disabled={loading}
              className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:bg-primary/90 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 transition-all flex justify-center items-center gap-2 text-sm"
            >
              {loading ? (
                <span className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
              ) : (
                'Iniciar Sesión →'
              )}
            </button>
          </form>

          {/* Registro */}
          <p className="text-center text-sm text-muted-foreground pt-2">
            ¿Nuevo en SarriaTech?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline underline-offset-4">
              Crea una cuenta gratis
            </Link>
          </p>
        </motion.div>
      </div>

    </div>
  );
}
