import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown, ChevronUp, Users, BookOpen, TrendingUp, GraduationCap,
  Search, Filter, ArrowUpDown
} from 'lucide-react';
import api from '../../lib/axios';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

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

type SortField = 'name' | 'email' | 'roleName' | 'createdAt';
type SortDir = 'asc' | 'desc';

function formatDate(value: string | null) {
  if (!value) return 'Sin datos';
  return new Date(value).toLocaleDateString('es-CO', {
    year: 'numeric', month: 'short', day: '2-digit',
  });
}

const ROLE_LABELS: Record<string, string> = {
  STUDENT: 'Estudiante',
  INSTRUCTOR: 'Instructor',
  ADMIN: 'Administrador',
};

const ROLE_COLORS: Record<string, string> = {
  STUDENT: 'bg-blue-500/10 text-blue-500',
  INSTRUCTOR: 'bg-violet-500/10 text-violet-500',
  ADMIN: 'bg-amber-500/10 text-amber-600',
};

const PAGE_SIZE = 10;

export function AdminDashboard() {
  const [data, setData] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  // Users table state
  const [showUserSection, setShowUserSection] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Courses accordion
  const [expandedCourses, setExpandedCourses] = useState<Record<number, boolean>>({});
  const [showCoursesSection, setShowCoursesSection] = useState(true);

  const toggleCourse = (courseId: number) =>
    setExpandedCourses((prev) => ({ ...prev, [courseId]: !prev[courseId] }));

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.get('/admin/overview'), api.get('/admin/users')])
      .then(([overviewRes, usersRes]) => {
        if (!cancelled) {
          setData(overviewRes.data);
          setUsers(usersRes.data);
        }
      })
      .catch((error) => {
        if (!cancelled)
          setErrorMsg(error.response?.data?.error || 'No se pudo cargar el panel de admin.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleRoleChange = async (userId: number, roleName: string) => {
    setUpdatingUserId(userId);
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { roleName });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, roleName: response.data.roleName, roleId: response.data.roleId }
            : u
        )
      );
      MySwal.fire({
        icon: 'success',
        title: 'Rol actualizado',
        text: `El rol del usuario fue cambiado a ${ROLE_LABELS[roleName]}.`,
        toast: true,
        position: 'top-end',
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      MySwal.fire({
        icon: 'error',
        title: 'Error al actualizar rol',
        text: error.response?.data?.error || 'No se pudo actualizar el rol',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  // Filtered + sorted + paginated users
  const filteredUsers = useMemo(() => {
    let result = users;
    if (roleFilter !== 'ALL') result = result.filter((u) => u.roleName === roleFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    result = [...result].sort((a, b) => {
      const av = a[sortField] ?? '';
      const bv = b[sortField] ?? '';
      const cmp = String(av).localeCompare(String(bv), 'es');
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [users, roleFilter, searchQuery, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const pagedUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (errorMsg || !data) {
    return (
      <div className="p-6 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm">
        {errorMsg || 'No se encontraron datos.'}
      </div>
    );
  }

  const summaryCards = [
    { label: 'Estudiantes únicos', value: data.totals.totalStudents, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Inscripciones totales', value: data.totals.totalEnrollments, icon: GraduationCap, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: 'Cursos', value: data.totals.totalCourses, icon: BookOpen, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Avance promedio', value: `${data.totals.averageCourseProgress}%`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  const SortIcon = ({ field }: { field: SortField }) => (
    <ArrowUpDown
      className={`w-3 h-3 inline ml-1 ${sortField === field ? 'text-primary' : 'text-muted-foreground/40'}`}
    />
  );

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Page Title */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold">Panel de Administración</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona usuarios, roles y revisa el progreso de los cursos.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-xl p-4 sm:p-5 shadow-sm flex items-center gap-4"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{card.label}</p>
                  <p className="text-2xl font-bold mt-0.5">{card.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Gestión de Usuarios ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
        >
          {/* Accordion Header */}
          <button
            onClick={() => setShowUserSection((v) => !v)}
            className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-secondary/20 transition-colors"
          >
            <div>
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Gestión de Usuarios y Roles
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {users.length} usuarios registrados
              </p>
            </div>
            <motion.div
              animate={{ rotate: showUserSection ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {showUserSection && (
              <motion.div
                key="users-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="border-t border-border">
                  {/* Filters Row */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3 border-b border-border bg-secondary/10">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                    </div>
                    {/* Role filter */}
                    <div className="relative flex-shrink-0">
                      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                        className="bg-background border border-border rounded-lg pl-9 pr-8 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="ALL">Todos los roles</option>
                        <option value="STUDENT">Estudiante</option>
                        <option value="INSTRUCTOR">Instructor</option>
                        <option value="ADMIN">Administrador</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="bg-secondary/30 border-b border-border">
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                              Usuario <SortIcon field="name" />
                            </button>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                            <button onClick={() => handleSort('email')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                              Email <SortIcon field="email" />
                            </button>
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                            Cursos
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <button onClick={() => handleSort('roleName')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                              Rol <SortIcon field="roleName" />
                            </button>
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden xl:table-cell">
                            <button onClick={() => handleSort('createdAt')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                              Registro <SortIcon field="createdAt" />
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {pagedUsers.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                              No se encontraron usuarios con los filtros aplicados.
                            </td>
                          </tr>
                        ) : (
                          pagedUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-secondary/10 transition-colors">
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                                    {u.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{u.name}</p>
                                    <p className="text-xs text-muted-foreground md:hidden truncate">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                                <span className="truncate block max-w-[200px]">{u.email}</span>
                              </td>
                              <td className="px-4 py-3 hidden lg:table-cell">
                                <div className="flex items-center justify-center gap-3 text-xs text-center">
                                  <span className="flex flex-col items-center">
                                    <span className="font-semibold text-sm">{u.coursesCreated}</span>
                                    <span className="text-muted-foreground">creados</span>
                                  </span>
                                  <span className="text-border">|</span>
                                  <span className="flex flex-col items-center">
                                    <span className="font-semibold text-sm">{u.coursesEnrolled}</span>
                                    <span className="text-muted-foreground">inscritos</span>
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${ROLE_COLORS[u.roleName] || 'bg-secondary text-muted-foreground'}`}>
                                    {ROLE_LABELS[u.roleName] || u.roleName}
                                  </span>
                                  <select
                                    value={u.roleName}
                                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                    disabled={updatingUserId === u.id}
                                    className="bg-secondary border border-border rounded-lg px-2 py-1 text-xs focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50 cursor-pointer"
                                  >
                                    <option value="STUDENT">Estudiante</option>
                                    <option value="INSTRUCTOR">Instructor</option>
                                    <option value="ADMIN">Administrador</option>
                                  </select>
                                  {updatingUserId === u.id && (
                                    <span className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">
                                {formatDate(u.createdAt)}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t border-border bg-secondary/5">
                      <p className="text-xs text-muted-foreground">
                        Mostrando {((currentPage - 1) * PAGE_SIZE) + 1}–{Math.min(currentPage * PAGE_SIZE, filteredUsers.length)} de {filteredUsers.length}
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="px-2.5 py-1 text-xs rounded-lg border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          ‹ Anterior
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                          .reduce<(number | '...')[]>((acc, p, idx, arr) => {
                            if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push('...');
                            acc.push(p);
                            return acc;
                          }, [])
                          .map((p, i) =>
                            p === '...' ? (
                              <span key={`ellipsis-${i}`} className="px-2 text-xs text-muted-foreground">…</span>
                            ) : (
                              <button
                                key={p}
                                onClick={() => setCurrentPage(p as number)}
                                className={`w-7 h-7 text-xs rounded-lg border transition-colors ${
                                  currentPage === p
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'border-border hover:bg-secondary'
                                }`}
                              >
                                {p}
                              </button>
                            )
                          )}
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="px-2.5 py-1 text-xs rounded-lg border border-border hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          Siguiente ›
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Cursos ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden"
        >
          <button
            onClick={() => setShowCoursesSection((v) => !v)}
            className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-secondary/20 transition-colors"
          >
            <div>
              <h2 className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Cursos y Estudiantes Inscritos
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {data.courses.length} cursos en la plataforma
              </p>
            </div>
            <motion.div
              animate={{ rotate: showCoursesSection ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </button>

          <AnimatePresence initial={false}>
            {showCoursesSection && (
              <motion.div
                key="courses-content"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <div className="border-t border-border divide-y divide-border">
                  {data.courses.length === 0 ? (
                    <p className="p-6 text-sm text-muted-foreground text-center">No hay cursos disponibles.</p>
                  ) : (
                    data.courses.map((course) => (
                      <div key={course.id}>
                        {/* Course Row */}
                        <button
                          onClick={() => toggleCourse(course.id)}
                          className="w-full flex items-center justify-between p-4 sm:p-5 text-left hover:bg-secondary/10 transition-colors"
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-start gap-3">
                              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <BookOpen className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-sm sm:text-base truncate">{course.title}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {course.category.name} · {course.instructor.name}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="hidden sm:flex gap-2 text-xs">
                              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                {course.enrolledStudents} est.
                              </span>
                              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                                {course.averageProgress}%
                              </span>
                            </div>
                            <motion.div
                              animate={{ rotate: expandedCourses[course.id] ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            </motion.div>
                          </div>
                        </button>

                        {/* Course Students */}
                        <AnimatePresence initial={false}>
                          {expandedCourses[course.id] && (
                            <motion.div
                              key={`course-${course.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div className="bg-secondary/5 border-t border-border">
                                {course.students.length === 0 ? (
                                  <p className="px-6 py-4 text-sm text-muted-foreground">Sin estudiantes inscritos.</p>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full">
                                      <thead>
                                        <tr className="border-b border-border">
                                          <th className="px-6 py-2 text-left text-xs font-medium text-muted-foreground">Estudiante</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Progreso</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">Inscrito</th>
                                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">Último avance</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border/50">
                                        {course.students.map((s) => (
                                          <tr key={s.studentId} className="hover:bg-secondary/10 transition-colors">
                                            <td className="px-6 py-2.5 text-sm font-medium">{s.name}</td>
                                            <td className="px-4 py-2.5 text-xs text-muted-foreground hidden sm:table-cell">{s.email}</td>
                                            <td className="px-4 py-2.5">
                                              <div className="flex items-center gap-2">
                                                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden min-w-[60px]">
                                                  <div
                                                    className="h-full bg-primary rounded-full transition-all"
                                                    style={{ width: `${Math.min(100, s.progress)}%` }}
                                                  />
                                                </div>
                                                <span className="text-xs font-medium w-8 text-right">{s.progress}%</span>
                                              </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-xs text-muted-foreground hidden md:table-cell">{formatDate(s.enrolledAt)}</td>
                                            <td className="px-4 py-2.5 text-xs text-muted-foreground hidden lg:table-cell">{formatDate(s.lastProgressAt)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </ErrorBoundary>
  );
}
