import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/axios';

type AdminStudent = {
  studentId: number;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
  lastProgressAt: string | null;
};

type AdminCourse = {
  id: number;
  title: string;
  category: { id: number; name: string };
  instructor: { id: number; name: string; email: string };
  enrolledStudents: number;
  averageProgress: number;
  students: AdminStudent[];
};

type AdminOverview = {
  totals: {
    totalStudents: number;
    totalEnrollments: number;
    totalCourses: number;
    averageCourseProgress: number;
  };
  courses: AdminCourse[];
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  roleId: number;
  roleName: string;
  coursesCreated: number;
  coursesEnrolled: number;
  createdAt: string;
};

function formatDate(value: string | null) {
  if (!value) {
    return 'Sin datos';
  }

  return new Date(value).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function AdminDashboard() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      api.get('/admin/overview'),
      api.get('/admin/users'),
    ])
      .then(([overviewRes, usersRes]) => {
        if (!cancelled) {
          setData(overviewRes.data);
          setUsers(usersRes.data);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setErrorMsg(error.response?.data?.error || 'No se pudo cargar el panel de admin.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleRoleChange = async (userId: number, roleName: string) => {
    setUpdatingUserId(userId);
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { roleName });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, roleName: response.data.roleName, roleId: response.data.roleId } : u))
      );
    } catch (error: any) {
      alert(error.response?.data?.error || 'No se pudo actualizar el rol');
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Cargando panel de administración...</div>;
  }

  if (errorMsg || !data) {
    return (
      <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm">
        {errorMsg || 'No se encontraron datos.'}
      </div>
    );
  }

  const summaryCards = [
    { label: 'Estudiantes únicos', value: data.totals.totalStudents },
    { label: 'Inscripciones totales', value: data.totals.totalEnrollments },
    { label: 'Cursos', value: data.totals.totalCourses },
    { label: 'Avance promedio', value: `${data.totals.averageCourseProgress}%` },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold">Panel de Administración</h1>
        <p className="text-sm text-muted-foreground">
          Revisa estudiantes inscritos, fecha de registro y porcentaje de avance por curso.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{card.label}</p>
            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
      >
        <div className="p-4 sm:p-5 border-b border-border">
          <h2 className="text-lg sm:text-xl font-semibold">Gestión de Usuarios y Roles</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Asigna roles de Estudiante, Formador o Administrador a cada usuario.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-secondary/40 border-b border-border">
              <tr>
                <th className="p-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Usuario</th>
                <th className="p-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Email</th>
                <th className="p-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Rol</th>
                <th className="p-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Cursos creados</th>
                <th className="p-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Inscripciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-border/70 last:border-b-0">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-sm text-muted-foreground">{user.email}</td>
                  <td className="p-4">
                    <select
                      value={user.roleName}
                      disabled={updatingUserId === user.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="STUDENT">Estudiante</option>
                      <option value="INSTRUCTOR">Formador</option>
                      <option value="ADMIN">Administrador</option>
                    </select>
                  </td>
                  <td className="p-4 text-sm text-muted-foreground">{user.coursesCreated}</td>
                  <td className="p-4 text-sm text-muted-foreground">{user.coursesEnrolled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>

      <div className="space-y-4">
        {data.courses.map((course) => (
          <motion.section
            key={course.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm"
          >
            <div className="p-4 sm:p-5 border-b border-border flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">{course.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {course.category.name} · {course.instructor.name}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {course.enrolledStudents} estudiantes
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                  {course.averageProgress}% avance
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[760px]">
                <thead className="bg-secondary/40 border-b border-border">
                  <tr>
                    <th className="p-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Estudiante</th>
                    <th className="p-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Email</th>
                    <th className="p-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Fecha</th>
                    <th className="p-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Avance</th>
                    <th className="p-4 text-xs uppercase tracking-[0.15em] text-muted-foreground">Última actualización</th>
                  </tr>
                </thead>
                <tbody>
                  {course.students.map((student) => (
                    <tr key={student.studentId} className="border-b border-border/70 last:border-b-0">
                      <td className="p-4 font-medium">{student.name}</td>
                      <td className="p-4 text-sm text-muted-foreground">{student.email}</td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(student.enrolledAt)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 max-w-40 rounded-full bg-secondary overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(student.progress, 100)}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">{formatDate(student.lastProgressAt)}</td>
                    </tr>
                  ))}
                  {course.students.length === 0 && (
                    <tr>
                      <td className="p-4 text-sm text-muted-foreground" colSpan={5}>
                        Todavía no hay estudiantes inscritos en este curso.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.section>
        ))}
      </div>
    </div>
  );
}
