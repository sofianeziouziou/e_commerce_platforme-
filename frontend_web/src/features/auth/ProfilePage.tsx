import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, LogOut, Save, Package, MapPin, Bell, ShoppingCart } from 'lucide-react';
import { PageShell } from '../../shared/ui/PageShell';
import { useAuth } from './AuthContext';
import { updateProfile } from './authApi';
import { getOrders, getUnreadCount, type OrderResponse } from '../client/clientApi';
import { ORDER_STATUS_LABELS } from '../../shared/utils/orderStatus';

export function ProfilePage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [recentOrders, setRecentOrders] = useState<OrderResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    getOrders(token, 0, 5).then(setRecentOrders).catch(() => {});
    getUnreadCount(token).then(setUnreadCount).catch(() => {});
  }, [token]);

  if (!user || !token) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(token, { firstName, lastName, phoneNumber: phoneNumber || undefined });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const statusLabels = ORDER_STATUS_LABELS;
  const statusColors: Record<string, string> = {
    EN_ATTENTE: 'bg-yellow-100 text-yellow-700', CONFIRMEE: 'bg-blue-100 text-blue-700',
    EN_PREPARATION: 'bg-purple-100 text-purple-700', EXPEDIEE: 'bg-indigo-100 text-indigo-700',
    LIVREE: 'bg-green-100 text-green-700', ANNULEE: 'bg-red-100 text-red-700',
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-14 place-items-center rounded-2xl bg-brand-green text-white shadow-soft">
              <User aria-hidden="true" size={28} />
            </span>
            <div>
              <h1 className="text-3xl font-black text-brand-ink">Mon compte</h1>
              <p className="text-sm text-slate-600">{user.email}</p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-bold text-red-600 transition hover:bg-red-50"
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Deconnexion
          </button>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Link to="/commandes" className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
            <Package className="mb-2 text-brand-green" size={24} />
            <div className="text-2xl font-black text-brand-ink">{recentOrders.length}</div>
            <div className="text-xs font-bold text-slate-500">Commandes</div>
          </Link>
          <Link to="/notifications" className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative mb-2">
              <Bell className="text-brand-green" size={24} />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 grid min-w-[18px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">{unreadCount}</span>
              )}
            </div>
            <div className="text-2xl font-black text-brand-ink">{unreadCount}</div>
            <div className="text-xs font-bold text-slate-500">Notifications</div>
          </Link>
          <Link to="/adresses" className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
            <MapPin className="mb-2 text-brand-green" size={24} />
            <div className="text-2xl font-black text-brand-ink">&gt;</div>
            <div className="text-xs font-bold text-slate-500">Adresses</div>
          </Link>
          <Link to="/panier" className="rounded-xl border border-slate-200 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-md">
            <ShoppingCart className="mb-2 text-brand-green" size={24} />
            <div className="text-2xl font-black text-brand-ink">&gt;</div>
            <div className="text-xs font-bold text-slate-500">Panier</div>
          </Link>
        </div>

        {recentOrders.length > 0 && (
          <div className="mb-8 rounded-xl border border-slate-200 bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-black text-brand-ink">Commandes recentes</h2>
              <Link to="/commandes" className="text-sm font-bold text-brand-green hover:underline">Voir tout</Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentOrders.slice(0, 3).map((o) => (
                <Link key={o.id} to={`/commandes/${o.id}`} className="flex items-center justify-between px-6 py-3 transition hover:bg-slate-50">
                  <div>
                    <div className="font-bold text-brand-ink">{o.orderNumber}</div>
                    <div className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold">{o.totalAmount.toFixed(3)} TND</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${statusColors[o.status] || ''}`}>
                      {statusLabels[o.status] || o.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <h2 className="mb-1 text-lg font-black text-brand-ink">Roles</h2>
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <span key={role} className="rounded-full bg-brand-green/10 px-3 py-1 text-xs font-black text-brand-green">
                {role}
              </span>
            ))}
          </div>
        </div>

        <form className="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-soft" onSubmit={handleSave}>
          <h2 className="text-lg font-black text-brand-ink">Informations personnelles</h2>

          {saved && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">
              Profil mis a jour avec succes.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-black text-slate-800" htmlFor="firstName">Prenom</label>
              <input id="firstName" className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-green" required type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-800" htmlFor="lastName">Nom</label>
              <input id="lastName" className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-green" required type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-black text-slate-800" htmlFor="phoneNumber">Telephone <span className="font-normal text-slate-400">(optionnel)</span></label>
            <input id="phoneNumber" className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-green" type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
          </div>

          <button className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-ink text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-50" disabled={saving} type="submit">
            {saving ? <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save aria-hidden="true" size={18} />}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </PageShell>
  );
}
