import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tags, Box, Percent, ShoppingCart,
  Users, BarChart3, Settings, LogOut, Bell,
  Sparkles, Menu, X, ShieldAlert
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useAuth } from '../auth/AuthContext';
import { getNotificationCount } from './adminApi';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Tableau de bord', exact: true },
  { to: '/admin/produits', icon: Package, label: 'Produits' },
  { to: '/admin/categories', icon: Tags, label: 'Categories' },
  { to: '/admin/stocks', icon: Box, label: 'Stock' },
  { to: '/admin/promotions', icon: Percent, label: 'Promotions' },
  { to: '/admin/commandes', icon: ShoppingCart, label: 'Commandes' },
  { to: '/admin/clients', icon: Users, label: 'Clients' },
  { to: '/admin/statistiques', icon: BarChart3, label: 'Statistiques' },
  { to: '/admin/parametres', icon: Settings, label: 'Parametres' },
];

export function AdminLayout({ children }: PropsWithChildren) {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    getNotificationCount(token).then((r) => setNotifCount(r.count)).catch(() => {});
    const interval = setInterval(() => {
      getNotificationCount(token).then((r) => setNotifCount(r.count)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5">
          <Link className="flex items-center gap-2 text-lg font-black text-brand-ink" to="/admin/dashboard">
            <ShieldAlert size={20} className="text-brand-green" />
            <span>Administration</span>
          </Link>
          <button className="text-slate-400 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => (
            <Link
              key={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                isActive(item.to, item.exact)
                  ? 'bg-brand-green/10 text-brand-green'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-4">
          <button
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-bold text-red-500 transition hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Deconnexion
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex flex-1 flex-col lg:ml-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 shadow-soft sm:px-6">
          <button className="text-slate-500 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>

          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-brand-green" />
            <span className="text-sm font-black text-brand-ink">Espace Administration</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500">
              <Bell size={18} />
              {notifCount > 0 && (
                <span className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">
                  {notifCount > 9 ? '9+' : notifCount}
                </span>
              )}
            </div>
            <span className="hidden text-right text-xs leading-tight sm:block">
              <span className="block font-black text-brand-ink">{user?.firstName} {user?.lastName}</span>
              <span className="block text-[10px] font-semibold text-slate-400">Administrateur</span>
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
