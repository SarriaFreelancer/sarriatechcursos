import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Compass, Award, Settings, GraduationCap, X, Shield } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/useAuthStore';
import { isInstructorOrAdmin } from '../../lib/roles';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const roleName = user?.roleName;

  const studentLinks = [
    { name: 'Inicio', path: '/dashboard', icon: Home },
    { name: 'Mis Cursos', path: '/dashboard/courses', icon: BookOpen },
    { name: 'Explorar', path: '/explore', icon: Compass },
    { name: 'Certificados', path: '/dashboard/certificates', icon: Award },
    { name: 'Ajustes', path: '/dashboard/settings', icon: Settings },
  ];

  const instructorLinks = [
    { name: 'Panel Formador', path: '/instructor', icon: GraduationCap },
    { name: 'Explorar', path: '/explore', icon: Compass },
    { name: 'Mis Cursos', path: '/dashboard/courses', icon: BookOpen },
    { name: 'Ajustes', path: '/dashboard/settings', icon: Settings },
  ];

  const adminLinks = [
    { name: 'Panel Admin', path: '/admin', icon: Shield },
    { name: 'Panel Formador', path: '/instructor', icon: GraduationCap },
    { name: 'Explorar', path: '/explore', icon: Compass },
    { name: 'Ajustes', path: '/dashboard/settings', icon: Settings },
  ];

  const links =
    roleName === 'ADMIN'
      ? adminLinks
      : roleName === 'INSTRUCTOR'
        ? instructorLinks
        : studentLinks;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 lg:w-64",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-primary">SarriaTech</h2>
          <button
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground lg:hidden"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="truncate">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {isInstructorOrAdmin(roleName) && roleName !== 'ADMIN' && (
          <div className="px-4 pb-2">
            <Link
              to="/instructor/create-course"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
            >
              + Crear Curso
            </Link>
          </div>
        )}

        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">© 2026 SarriaTech</p>
        </div>
      </aside>
    </>
  );
}
