import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Shield, 
  Package, 
  Boxes, 
  Bell, 
  LogOut,
  User
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { username, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { to: '/admin', label: 'Expiry Rules', icon: Shield },
  ];

  const managerLinks = [
    { to: '/manager', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/manager/products', label: 'Products', icon: Package },
    { to: '/manager/inventory', label: 'Inventory', icon: Boxes },
    { to: '/alerts', label: 'Alerts', icon: Bell },
  ];

  const links = role === 'admin' ? adminLinks : managerLinks;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar flex flex-col fixed h-full">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            Inventory Manager
          </h1>
          <p className="text-sm text-sidebar-muted mt-1 capitalize">{role} Panel</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {username}
              </p>
              <p className="text-xs text-sidebar-muted capitalize">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 bg-background min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
