import { Search, Bell, User as UserIcon, Menu, Sun, Moon, LogOut, Award, BookOpen, Settings, LineChart, GraduationCap, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { getRoleLabel, isInstructorOrAdmin } from '../../lib/roles';

interface HeaderProps {
  onMenuToggle: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [searchValue, setSearchValue] = useState(searchQuery);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync search input with query params
  useEffect(() => {
    setSearchValue(searchQuery);
  }, [searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    navigate(`/explore?q=${encodeURIComponent(val)}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 sm:h-16 bg-card border-b border-border flex items-center justify-between px-3 sm:px-6 shrink-0 relative z-30">
      {/* Left side: hamburger + search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <button
          className="p-2 rounded-lg hover:bg-secondary text-muted-foreground lg:hidden flex-shrink-0"
          onClick={onMenuToggle}
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1 max-w-xl hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar cursos por título, categoría, instructor o tecnologías..."
              value={searchValue}
              onChange={handleSearchChange}
              className="w-full bg-secondary text-foreground rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Right side: theme, notifications + user dropdown */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Mobile search button */}
        <button
          onClick={() => navigate('/explore')}
          className="p-2 text-muted-foreground hover:text-foreground transition-colors sm:hidden"
        >
          <Search className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </button>

        {/* User profile dropdown */}
        <div className="flex items-center gap-2 sm:gap-3 border-l border-border pl-2 sm:pl-4 relative" ref={dropdownRef}>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium truncate max-w-[120px]">{user?.name || 'Usuario'}</span>
            <span className="text-xs text-muted-foreground">{getRoleLabel(user?.roleName)}</span>
          </div>

          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary/20 transition-colors flex-shrink-0"
            aria-label="Menú de usuario"
          >
            <UserIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl py-2 flex flex-col text-sm animate-in fade-in slide-in-from-top-2 duration-150 z-50">
              <div className="px-4 py-3 border-b border-border mb-1">
                <p className="font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="px-4 py-2 hover:bg-secondary flex items-center gap-3 transition-colors text-foreground"
              >
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                Ver Perfil
              </Link>

              {user?.roleName === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setDropdownOpen(false)}
                  className="px-4 py-2 hover:bg-secondary flex items-center gap-3 transition-colors text-foreground"
                >
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  Panel Admin
                </Link>
              )}

              {isInstructorOrAdmin(user?.roleName) && (
                <Link
                  to="/instructor"
                  onClick={() => setDropdownOpen(false)}
                  className="px-4 py-2 hover:bg-secondary flex items-center gap-3 transition-colors text-foreground"
                >
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  Panel Formador
                </Link>
              )}

              {user?.roleName === 'STUDENT' && (
                <>
                  <Link
                    to="/dashboard/courses"
                    onClick={() => setDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-secondary flex items-center gap-3 transition-colors text-foreground"
                  >
                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                    Mis Cursos
                  </Link>

                  <Link
                    to="/dashboard/certificates"
                    onClick={() => setDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-secondary flex items-center gap-3 transition-colors text-foreground"
                  >
                    <Award className="w-4 h-4 text-muted-foreground" />
                    Certificados
                  </Link>

                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="px-4 py-2 hover:bg-secondary flex items-center gap-3 transition-colors text-foreground"
                  >
                    <LineChart className="w-4 h-4 text-muted-foreground" />
                    Progreso de Aprendizaje
                  </Link>
                </>
              )}

              <Link
                to="/dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                className="px-4 py-2 hover:bg-secondary flex items-center gap-3 transition-colors text-foreground"
              >
                <Settings className="w-4 h-4 text-muted-foreground" />
                Configuración
              </Link>

              <div className="h-px bg-border my-1" />

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  handleLogout();
                }}
                className="px-4 py-2 hover:bg-secondary flex items-center gap-3 transition-colors w-full text-left text-destructive font-medium"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
