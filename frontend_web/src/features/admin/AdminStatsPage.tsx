import { BarChart3 } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '../auth/AuthContext';
import { useEffect, useState } from 'react';
import { getDashboard, getOrders, type DashboardSummary, type OrderItem } from './adminApi';

export function AdminStatsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([getDashboard(token), getOrders(token, 'LIVREE', 0, 50)])
      .then(([d, o]) => { setData(d); setRecentOrders(o); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-brand-ink">Statistiques</h1>
        <p className="mt-1 text-sm text-slate-500">Analysez les performances de votre magasin.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-black text-brand-ink">Vue d&apos;ensemble</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <span className="size-6 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
            </div>
          ) : data ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-600">Revenus totaux</span>
                <span className="text-xl font-black text-brand-green">
                  {new Intl.NumberFormat('fr-TN', { style: 'currency', currency: 'TND' }).format(data.totalRevenue)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-600">Produits vendus</span>
                <span className="text-xl font-black text-brand-ink">A venir</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-600">Taux de conversion</span>
                <span className="text-xl font-black text-brand-ink">A venir</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-bold text-slate-600">Panier moyen</span>
                <span className="text-xl font-black text-brand-ink">A venir</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600">Commandes livrees</span>
                <span className="text-xl font-black text-brand-ink">{data.deliveredOrders}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">Impossible de charger les donnees.</p>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="mb-4 text-lg font-black text-brand-ink">Tendances</h2>
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
            <BarChart3 size={20} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-500">
              Les graphiques d&apos;evolution et tendances arrivent dans une prochaine mise a jour.
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="mb-4 text-lg font-black text-brand-ink">Commandes livrees (recentes)</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-slate-400">Aucune commande livree.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentOrders.slice(0, 10).map((o) => (
              <div key={o.id} className="flex items-center justify-between py-2">
                <span className="font-bold text-brand-ink">{o.orderNumber}</span>
                <span className="font-bold text-brand-green">{o.totalAmount.toFixed(3)} TND</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
