import { motion } from 'framer-motion';
import { Code2, ChevronRight, CheckCircle2, MessageCircle, Mail, MapPin, Phone, Quote, Star, Database, MonitorPlay, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// --- DATA ---
const featuredCourses = [
  {
    title: 'Desarrollo Web Full Stack',
    desc: 'Domina React, Node.js y bases de datos construyendo proyectos reales.',
    level: 'Intermedio',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
    icon: <MonitorPlay className="w-5 h-5" />
  },
  {
    title: 'Inteligencia Artificial aplicada',
    desc: 'Aprende a integrar modelos de IA y Machine Learning en tus aplicaciones.',
    level: 'Avanzado',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
    icon: <Database className="w-5 h-5" />
  },
  {
    title: 'Desarrollo Mobile con React Native',
    desc: 'Crea aplicaciones nativas para iOS y Android con una sola base de código.',
    level: 'Principiante',
    image: 'https://images.unsplash.com/photo-1526498460520-4c246339dccb?q=80&w=800&auto=format&fit=crop',
    icon: <Smartphone className="w-5 h-5" />
  }
];

const testimonials = [
  {
    name: 'Carlos Ruiz',
    role: 'Desarrollador Frontend',
    content: 'La academia transformó por completo mi carrera. Los proyectos prácticos me prepararon para el mundo real y conseguí mi primer trabajo tech en meses.',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop'
  },
  {
    name: 'Laura Gómez',
    role: 'Ingeniera de Software',
    content: 'El nivel de los instructores es sobresaliente. La flexibilidad de la plataforma me permitió estudiar a mi propio ritmo sin descuidar mi trabajo.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
  },
  {
    name: 'Andrés Felipe',
    role: 'Estudiante',
    content: 'Un enfoque totalmente distinto a la universidad tradicional. Fui directo al código y aprendí las tecnologías que realmente demanda el mercado.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
  }
];

const galleryImages = [
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=600&auto=format&fit=crop'
];

export function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-primary/30">
      
      {/* NAVBAR */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border/50 py-3 shadow-sm' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <a href="#inicio" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <Code2 className="w-8 h-8" />
            <span className="text-xl font-bold tracking-tight text-foreground">SarriaTech</span>
          </a>
          <nav className="hidden md:flex items-center gap-8">
            {[{label:'Inicio',href:'#inicio'},{label:'Cursos',href:'#cursos'},{label:'Reseñas',href:'#resenas'},{label:'Galería',href:'#galeria'},{label:'Nosotros',href:'#nosotros'},{label:'Contacto',href:'#contacto'}].map((item) => (
              <a key={item.label} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline-flex px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors">
              Iniciar sesión
            </Link>
            <Link to="/register" className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5">
              Registrarme
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section id="inicio" className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 inset-x-0 h-screen bg-gradient-to-b from-primary/5 via-background to-background -z-10" />
          <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10" />
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] -z-10" />
          
          {/* Floating background icons */}
          <motion.div animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} className="absolute top-1/4 right-1/3 text-primary/10 -z-10">
            <Code2 className="w-32 h-32" />
          </motion.div>
          <motion.div animate={{ y: [0, 40, 0], rotate: [0, -15, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }} className="absolute bottom-1/4 left-1/4 text-blue-500/10 -z-10">
            <Database className="w-40 h-40" />
          </motion.div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                La academia del futuro
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
                Forja tu carrera en <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Desarrollo de Software</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
                Aprende creando proyectos reales. Domina las tecnologías más demandadas por la industria y lleva tus habilidades al siguiente nivel con mentores expertos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register" className="px-8 py-3.5 bg-primary text-primary-foreground text-base font-bold rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 text-center flex items-center justify-center gap-2">
                  Empezar ahora <ChevronRight className="w-5 h-5" />
                </Link>
                <a href="#cursos" className="px-8 py-3.5 bg-secondary text-secondary-foreground text-base font-bold rounded-xl hover:bg-secondary/80 border border-border transition-all text-center flex items-center justify-center">
                  Ver cursos
                </a>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 40 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-card">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent z-10 mix-blend-overlay" />
                <img src="https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=1200&auto=format&fit=crop" alt="Estudiantes programando" className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700" />
              </div>
              {/* Floating badges */}
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute -left-6 top-10 bg-background/90 backdrop-blur-sm border border-border p-4 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><CheckCircle2 className="w-6 h-6" /></div>
                <div><p className="text-sm font-bold">Proyectos Reales</p><p className="text-xs text-muted-foreground">Portfolio listo</p></div>
              </motion.div>
              <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute -right-6 bottom-10 bg-background/90 backdrop-blur-sm border border-border p-4 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Code2 className="w-6 h-6" /></div>
                <div><p className="text-sm font-bold">+50 Tecnologías</p><p className="text-xs text-muted-foreground">Actualizadas</p></div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CURSOS */}
        <section id="cursos" className="py-24 px-6 bg-secondary/30 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Cursos Destacados</h2>
              <p className="text-muted-foreground">Rutas de aprendizaje diseñadas para llevarte desde los fundamentos hasta el dominio profesional.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCourses.map((course, idx) => (
                <motion.div 
                  key={idx} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }} 
                  variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { delay: idx * 0.1 } } }}
                  className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-border flex items-center gap-1.5 shadow-sm">
                      {course.icon} {course.level}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="text-sm text-muted-foreground mb-6 flex-1">{course.desc}</p>
                    <Link to="/register" className="w-full py-3 bg-secondary text-foreground font-semibold rounded-xl hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-2 border border-border hover:border-primary">
                      Comenzar ahora <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS / RESEÑAS */}
        <section id="resenas" className="py-24 px-6 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Lo que dicen nuestros estudiantes</h2>
              <p className="text-muted-foreground">Únete a cientos de profesionales que ya han transformado su futuro con nosotros.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testi, idx) => (
                <motion.div 
                  key={idx} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }}
                  variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { delay: idx * 0.1 } } }}
                  className="bg-card p-8 rounded-3xl border border-border shadow-sm relative"
                >
                  <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-primary text-primary" />)}
                  </div>
                  <p className="text-muted-foreground italic mb-6">"{testi.content}"</p>
                  <div className="flex items-center gap-4">
                    <img src={testi.avatar} alt={testi.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                    <div>
                      <h4 className="font-bold text-sm">{testi.name}</h4>
                      <p className="text-xs text-muted-foreground">{testi.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* GALERÍA */}
        <section id="galeria" className="py-24 px-6 bg-secondary/30 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Vida Estudiantil</h2>
                <p className="text-muted-foreground">Un entorno dinámico donde la teoría se encuentra con la práctica.</p>
              </div>
            </div>
            
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
              {galleryImages.map((img, idx) => (
                <motion.div 
                  key={idx} 
                  initial="hidden" 
                  whileInView="visible" 
                  viewport={{ once: true }}
                  variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: idx * 0.1 } } }}
                  className="break-inside-avoid relative rounded-2xl overflow-hidden group cursor-pointer border border-border shadow-sm"
                >
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 flex items-center justify-center">
                    <span className="text-white font-semibold flex items-center gap-2"><MonitorPlay className="w-5 h-5" /> Explorar</span>
                  </div>
                  <img src={img} alt="Galería" className="w-full h-auto object-cover transform group-hover:scale-110 transition-transform duration-700" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SOBRE NOSOTROS */}
        <section id="nosotros" className="py-24 px-6 relative overflow-hidden border-t border-border">
          <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute right-0 top-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 -translate-y-1/2" />
          
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Revolucionando la educación tecnológica</h2>
              <p className="text-lg text-muted-foreground mb-6">
                En SarriaTech, nuestra misión es democratizar el acceso a educación técnica de primer nivel. Creemos que la mejor manera de aprender a programar es construyendo, rompiendo y solucionando problemas del mundo real.
              </p>
              <div className="space-y-6 mt-10">
                {[
                  { title: 'Mentores Expertos', desc: 'Aprende de profesionales activos en la industria con experiencia comprobada.' },
                  { title: 'Aprendizaje Práctico', desc: 'No más tutoriales aburridos. Desarrolla proyectos para tu portafolio desde el día 1.' },
                  { title: 'Comunidad Activa', desc: 'Conecta con otros estudiantes, colabora y crece en un entorno enriquecedor.' }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <div className="grid grid-cols-2 gap-4">
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="space-y-4">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop" className="rounded-3xl object-cover h-64 w-full shadow-lg border border-border/50" alt="Team" />
                <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
                  <h3 className="text-3xl font-black text-primary mb-1">+5,000</h3>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Estudiantes</p>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="space-y-4 pt-12">
                <div className="bg-primary p-6 rounded-3xl shadow-xl shadow-primary/20 text-primary-foreground">
                  <h3 className="text-3xl font-black mb-1">98%</h3>
                  <p className="text-sm font-medium uppercase tracking-wider opacity-90">Tasa de empleabilidad</p>
                </div>
                <img src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=600&auto=format&fit=crop" className="rounded-3xl object-cover h-64 w-full shadow-lg border border-border/50" alt="Code" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* CONTACTO */}
        <section id="contacto" className="py-24 px-6 bg-secondary/30 relative">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">¿Listo para empezar?</h2>
              <p className="text-muted-foreground mb-8">Déjanos un mensaje o visítanos. Nuestro equipo está listo para ayudarte a dar el siguiente paso en tu carrera.</p>
              
              <div className="space-y-6 mb-12">
                <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4 cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-primary shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all"><Mail className="w-5 h-5" /></div>
                  <div><p className="font-semibold group-hover:text-primary transition-colors">Email</p><p className="text-muted-foreground text-sm">contacto@sarriatech.com</p></div>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4 cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-primary shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all"><Phone className="w-5 h-5" /></div>
                  <div><p className="font-semibold group-hover:text-primary transition-colors">Teléfono</p><p className="text-muted-foreground text-sm">+57 300 123 4567</p></div>
                </motion.div>
                <motion.div whileHover={{ x: 5 }} className="flex items-center gap-4 cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-card border border-border flex items-center justify-center text-primary shadow-sm group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all"><MapPin className="w-5 h-5" /></div>
                  <div><p className="font-semibold group-hover:text-primary transition-colors">Ubicación</p><p className="text-muted-foreground text-sm">Bogotá, Colombia</p></div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="bg-card p-8 sm:p-10 rounded-3xl border border-border shadow-xl">
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Nombre Completo</label>
                  <input type="text" placeholder="Tu nombre" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 transition-shadow" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Correo Electrónico</label>
                  <input type="email" placeholder="tu@email.com" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 transition-shadow" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Mensaje</label>
                  <textarea rows={4} placeholder="¿En qué podemos ayudarte?" className="w-full bg-secondary border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/45 transition-shadow resize-none" />
                </div>
                <button type="submit" className="w-full py-3.5 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/20">
                  Enviar Mensaje
                </button>
              </form>
            </motion.div>
          </div>
        </section>
      </main>

      {/* FOOTER LANDING PAGE */}
      <footer className="bg-card border-t border-border pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 text-primary mb-4">
              <Code2 className="w-6 h-6" />
              <span className="text-xl font-bold tracking-tight text-foreground">SarriaTech</span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
              Formando a la próxima generación de desarrolladores de software con educación práctica, moderna y orientada al mercado laboral.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4">Enlaces</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#inicio" className="hover:text-primary transition-colors">Inicio</a></li>
              <li><a href="#galeria" className="hover:text-primary transition-colors">Galería</a></li>
              <li><a href="#nosotros" className="hover:text-primary transition-colors">Sobre Nosotros</a></li>
              <li><a href="#contacto" className="hover:text-primary transition-colors">Contacto</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">Síguenos</h4>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-primary-foreground hover:scale-110 transition-all shadow-sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-border pt-8 text-center text-xs text-muted-foreground font-medium">
          © Todos los derechos reservados
        </div>
      </footer>

      {/* WHATSAPP FLOATING BUTTON */}
      <a 
        href="https://api.whatsapp.com/send?phone=573229088736&text=%C2%A1Hola!%20%F0%9F%91%8B%0A%0AEstoy%20interesado(a)%20en%20conocer%20m%C3%A1s%20sobre%20los%20cursos%20de%20*SarriaTech%20Software%20Dev%20Academy*.%0A%0AMe%20gustar%C3%ADa%20recibir%20informaci%C3%B3n%20sobre:%0A%0A%F0%9F%93%9A%20Cursos%20disponibles.%0A%F0%9F%92%BB%20Modalidad%20de%20estudio.%0A%F0%9F%92%B0%20Costos.%0A%F0%9F%93%85%20Fechas%20de%20inicio.%0A%F0%9F%8E%93%20Certificaci%C3%B3n.%0A%0AQuedo%20atento(a).%20%C2%A1Muchas%20gracias!" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed w-[60px] h-[60px] bottom-10 right-10 bg-[#25d366] text-white rounded-full text-center shadow-[1px_1px_2px_#888] z-[1000] flex items-center justify-center hover:scale-110 transition-transform"
      >
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
