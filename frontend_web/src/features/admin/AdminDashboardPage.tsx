import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, AlertTriangle, Sparkles, Calendar, Megaphone, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '../auth/AuthContext';
import { getDashboard, getOrders, type DashboardSummary, type OrderItem } from './adminApi';

export function AdminDashboardPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      getDashboard(token),
      getOrders(token, undefined, 0, 5),
    ])
      .then(([d, o]) => { setData(d); setRecentOrders(o); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <span className="size-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
        </div>
      </AdminLayout>
    );
  }

  const maxVal = Math.max(
    data?.totalProducts ?? 1, data?.activeProducts ?? 1,
    data?.pendingOrders ?? 1, data?.deliveredOrders ?? 1,
    data?.totalCustomers ?? 1
  );

  const chartBars = data ? [
    { label: 'Produits', value: data.totalProducts, color: 'bg-blue-500' },
    { label: 'Actifs', value: data.activeProducts, color: 'bg-green-500' },
    { label: 'Attente', value: data.pendingOrders, color: 'bg-purple-500' },
    { label: 'Livrees', value: data.deliveredOrders, color: 'bg-emerald-500' },
    { label: 'Clients', value: data.totalCustomers, color: 'bg-indigo-500' },
  ] : [];

  const cards = [
    { label: 'Produits total', value: data?.totalProducts ?? 0, icon: Package, color: 'bg-blue-500' },
    { label: 'Produits actifs', value: data?.activeProducts ?? 0, icon: Sparkles, color: 'bg-green-500' },
    { label: 'Stock bas', value: data?.lowStockProducts ?? 0, icon: AlertTriangle, color: 'bg-orange-500' },
    { label: 'Commandes aujourd\'hui', value: data?.todayOrders ?? 0, icon: Calendar, color: 'bg-cyan-500' },
    { label: 'Commandes en attente', value: data?.pendingOrders ?? 0, icon: ShoppingCart, color: 'bg-purple-500' },
    { label: 'Commandes livrees', value: data?.deliveredOrders ?? 0, icon: TrendingUp, color: 'bg-emerald-500' },
    { label: 'Clients', value: data?.totalCustomers ?? 0, icon: Users, color: 'bg-indigo-500' },
    { label: 'Promotions actives', value: data?.activePromotions ?? 0, icon: Megaphone, color: 'bg-pink-500' },
  ];

  const statusLabels: Record<string, string> = {
    EN_ATTENTE: 'En attente', CONFIRMEE: 'Confirmee', EN_PREPARATION: 'En preparation',
    EXPEDIEE: 'Expediee', LIVREE: 'Livree', ANNULEE: 'Annulee',
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-brand-ink sm:text-3xl">Tableau de bord</h1>
        <span className="rounded-full bg-brand-green/10 px-3 py-1 text-xs font-black text-brand-green">
          En direct
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500">{card.label}</p>
                <p className="mt-1 text-2xl font-black text-brand-ink sm:text-3xl">{card.value}</p>
              </div>
              <span className={`grid size-11 place-items-center rounded-xl text-white ${card.color}`}>
                <card.icon size={22} />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft lg:col-span-2">
          <h2 className="mb-4 text-lg font-black text-brand-ink">Apercu des donnees</h2>
          <div className="flex items-end gap-3">
            {chartBars.map((bar) => (
              <div key={bar.label} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-500">{bar.value}</span>
                <div className="flex h-40 w-full items-end justify-center rounded-lg bg-slate-100">
                  <div
                    className={`w-8 rounded-t-lg transition-all ${bar.color}`}
                    style={{ height: `${(bar.value / maxVal) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-600">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
          {data && (
            <>
              <h2 className="mb-4 text-lg font-black text-brand-ink">Revenus</h2>
              <p className="text-3xl font-black text-brand-green">
                {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(data.totalRevenue)}
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-500">Marge estimee</span>
                  <span className="font-bold text-slate-700">A venir</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-slate-500">Objectif du mois</span>
                  <span className="font-bold text-slate-700">A venir</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {data && data.lowStockProducts > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <AlertTriangle size={20} className="text-orange-500" />
          <span className="text-sm font-bold text-orange-700">
            {data.lowStockProducts} produit(s) en stock bas.
          </span>
          <button className="ml-auto rounded-lg bg-orange-500 px-4 py-1.5 text-xs font-black text-white transition hover:bg-orange-600" onClick={() => navigate('/admin/stocks')}>
            Gerer les stocks
          </button>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-black text-brand-ink">Dernieres commandes</h2>
          <button className="text-xs font-bold text-brand-green transition hover:text-brand-green/80" onClick={() => navigate('/admin/commandes')}>
            Voir tout
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {recentOrders.length === 0 && (
            <p className="p-5 text-center text-sm text-slate-400">Aucune commande recette.</p>
          )}
          {recentOrders.map((o) => (
            <div key={o.id} className="flex items-center justify-between px-5 py-3 transition hover:bg-slate-50">
              <div>
                <p className="font-bold text-brand-ink">{o.orderNumber}</p>
                <p className="text-xs text-slate-400">{o.customerName}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{o.totalAmount.toFixed(3)} TND</p>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  o.status === 'LIVREE' ? 'bg-green-100 text-green-700' :
                  o.status === 'ANNULEE' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {statusLabels[o.status] || o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-soft">
        <h2 className="mb-3 text-lg font-black text-brand-ink">Produits les plus vendus</h2>
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
          <BarChart3 size={20} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-500">Module en cours de developpement</span>
        </div>
      </div>
    </AdminLayout>
  );
}
