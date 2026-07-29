import { Clock, Loader2, PackageCheck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../../shared/ui/PageShell';
import { useAuth } from '../auth/AuthContext';
import { formatPrice } from '../catalog/catalogUtils';
import { getOrders, type OrderResponse } from './clientApi';

const STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: 'En attente', CONFIRMEE: 'Confirmee', EN_PREPARATION: 'En preparation',
  EXPEDIEE: 'Expediee', LIVREE: 'Livree', ANNULEE: 'Annulee',
};

const STATUS_COLORS: Record<string, string> = {
  EN_ATTENTE: 'bg-amber-100 text-amber-800',
  CONFIRMEE: 'bg-blue-100 text-blue-800',
  EN_PREPARATION: 'bg-purple-100 text-purple-800',
  EXPEDIEE: 'bg-cyan-100 text-cyan-800',
  LIVREE: 'bg-green-100 text-green-800',
  ANNULEE: 'bg-red-100 text-red-800',
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function OrderHistoryPage() {
  const { token, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    getOrders(token).then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <PackageCheck className="mx-auto mb-4 text-slate-300" size={64} />
          <h1 className="text-2xl font-black">Connectez-vous pour voir vos commandes</h1>
          <Link className="mt-6 inline-block rounded-lg bg-brand-green px-6 py-3 text-sm font-black text-white" to="/connexion">Se connecter</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-brand-ink">Mes commandes</h1>
        <p className="mt-2 text-slate-600">Suivez vos commandes en temps reel.</p>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-lg font-bold text-slate-500">
            <Loader2 className="animate-spin" size={24} /> Chargement...
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-10 rounded-lg border border-dashed border-slate-300 p-16 text-center">
            <PackageCheck className="mx-auto mb-4 text-slate-300" size={56} />
            <h2 className="text-xl font-black">Aucune commande</h2>
            <p className="mt-2 text-slate-600">Vous n&apos;avez pas encore passe de commande.</p>
            <Link className="mt-6 inline-block rounded-lg bg-brand-green px-6 py-3 text-sm font-black text-white" to="/produits">
              Decouvrir le catalogue
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-4">
            {orders.map((order) => {
              const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);
              return (
                <Link key={order.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-brand-green sm:flex-row sm:items-center sm:justify-between" to={`/commandes/${order.id}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    {order.items.length > 0 && order.items[0].imageUrl && (
                      <img src={order.items[0].imageUrl} alt="" className="hidden sm:block size-12 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-black text-brand-ink">Commande {order.orderNumber}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        <span className="inline-flex items-center gap-1"><Clock size={14} /> {formatDate(order.createdAt)}</span>
                        <span>{itemCount} article{itemCount > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:flex-shrink-0">
                    <span className="font-black text-brand-ink">{formatPrice(order.totalAmount)}</span>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${STATUS_COLORS[order.status] || 'bg-slate-100 text-slate-800'}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
