import { useEffect, useState } from 'react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '../auth/AuthContext';
import { getOrders, updateOrderStatus, getOrderDetail, type OrderItem, type AdminOrderDetail } from './adminApi';

const statuses = ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'ANNULEE'] as const;

const statusLabels: Record<string, string> = {
  EN_ATTENTE: 'En attente', CONFIRMEE: 'Confirmee', EN_PREPARATION: 'En preparation',
  EXPEDIEE: 'Expediee', LIVREE: 'Livree', ANNULEE: 'Annulee',
};

const statusColors: Record<string, string> = {
  EN_ATTENTE: 'bg-yellow-100 text-yellow-700', CONFIRMEE: 'bg-blue-100 text-blue-700',
  EN_PREPARATION: 'bg-purple-100 text-purple-700', EXPEDIEE: 'bg-indigo-100 text-indigo-700',
  LIVREE: 'bg-green-100 text-green-700', ANNULEE: 'bg-red-100 text-red-700',
};

const statusSteps = ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE'];

export function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(0);

  const load = () => {
    if (!token) return;
    setLoading(true);
    getOrders(token, filter || undefined, page)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token, filter, page]);

  const handleStatusChange = async (id: number, status: string) => {
    if (!token) return;
    setUpdatingId(id);
    await updateOrderStatus(token, id, status);
    setUpdatingId(null);
    load();
  };

  const openDetail = async (id: number) => {
    if (!token) return;
    setDetailLoading(true);
    try {
      const d = await getOrderDetail(token, id);
      setDetail(d);
    } catch { /* ignore */ } finally { setDetailLoading(false); }
  };

  const currentStepIndex = (status: string) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : -1;
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black text-brand-ink">Commandes</h1>
        <div className="flex flex-wrap gap-1.5">
          {['', ...statuses].map((s) => (
            <button
              key={s}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${filter === s ? 'bg-brand-ink text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
              onClick={() => { setFilter(s); setPage(0); }}
            >
              {s ? statusLabels[s] : 'Toutes'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="size-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-soft">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">N°</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-brand-ink">{o.orderNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-700">{o.customerName}</div>
                    <div className="text-xs text-slate-400">{o.customerEmail}</div>
                  </td>
                  <td className="px-4 py-3 font-bold">{o.totalAmount.toFixed(3)} TND</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${statusColors[o.status] || 'bg-slate-100 text-slate-600'}`}>
                      {statusLabels[o.status] || o.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3">
                    <select
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none focus:border-brand-green"
                      value={o.status}
                      disabled={updatingId === o.id}
                      onChange={(e) => handleStatusChange(o.id, e.target.value)}
                    >
                      {statuses.map((s) => <option key={s} value={s}>{statusLabels[s]}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
                      onClick={() => openDetail(o.id)}
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td className="px-4 py-8 text-center text-slate-400" colSpan={7}>Aucune commande trouvee.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-2">
        <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30" disabled={page === 0} onClick={() => setPage(page - 1)}>Precedent</button>
        <span className="text-sm font-bold text-slate-500">Page {page + 1}</span>
        <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30" disabled={orders.length < 50} onClick={() => setPage(page + 1)}>Suivant</button>
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-8" onClick={() => setDetail(null)}>
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-brand-ink">Commande {detail.orderNumber}</h2>
                <p className="text-sm text-slate-500">
                  {detail.customerFirstName} {detail.customerLastName} &middot; {detail.customerEmail}
                </p>
              </div>
              <button className="text-slate-400 hover:text-slate-600" onClick={() => setDetail(null)}>Fermer</button>
            </div>

            {detail.status !== 'ANNULEE' && (
              <div className="mb-6">
                <div className="flex items-center gap-0">
                  {statusSteps.map((s, i) => {
                    const step = currentStepIndex(detail.status);
                    const done = i <= step;
                    const current = i === step;
                    return (
                      <div key={s} className="flex items-center">
                        <div className={`flex items-center gap-1.5 ${current ? 'text-brand-green' : done ? 'text-green-600' : 'text-slate-300'}`}>
                          <span className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-black ${current ? 'bg-brand-green text-white' : done ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                            {done ? '\u2713' : i + 1}
                          </span>
                          <span className={`text-xs font-bold ${current ? 'text-brand-green' : done ? 'text-green-600' : 'text-slate-400'}`}>{statusLabels[s]}</span>
                        </div>
                        {i < statusSteps.length - 1 && <div className={`mx-1 h-0.5 w-8 sm:w-12 ${done && i < step ? 'bg-green-400' : current ? 'bg-brand-green' : 'bg-slate-200'}`} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm">
              <div>
                <span className="text-xs font-black text-slate-500">Sous-total</span>
                <p className="font-bold">{detail.subtotalAmount.toFixed(3)} TND</p>
              </div>
              <div>
                <span className="text-xs font-black text-slate-500">Frais de livraison</span>
                <p className="font-bold">{detail.deliveryFee.toFixed(3)} TND</p>
              </div>
              <div>
                <span className="text-xs font-black text-slate-500">Remise</span>
                <p className="font-bold">{detail.discountAmount.toFixed(3)} TND</p>
              </div>
              <div>
                <span className="text-xs font-black text-slate-500">Total</span>
                <p className="text-lg font-black text-brand-green">{detail.totalAmount.toFixed(3)} TND</p>
              </div>
            </div>

            {detail.customerNote && (
              <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-700">
                <span className="text-xs font-black">Note client :</span> {detail.customerNote}
              </div>
            )}

            <h3 className="mb-3 text-sm font-black text-brand-ink uppercase tracking-wider">
              Articles ({detail.items.length})
            </h3>
            <div className="mb-6 space-y-2">
              {detail.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="size-12 rounded-lg object-cover" />
                  ) : (
                    <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs text-slate-400">N/A</span>
                  )}
                  <div className="flex-1">
                    <div className="font-bold text-brand-ink">{item.productName}</div>
                    <div className="text-xs text-slate-500">{item.unitPrice.toFixed(3)} TND / {item.unitLabel}</div>
                  </div>
                  <div className="text-sm text-slate-600">x{item.quantity}</div>
                  <div className="min-w-[80px] text-right font-bold">{item.lineTotal.toFixed(3)} TND</div>
                </div>
              ))}
            </div>

            <h3 className="mb-3 text-sm font-black text-brand-ink uppercase tracking-wider">Adresse de livraison</h3>
            <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm">
              <p className="font-bold">{detail.address.recipientName}</p>
              <p className="text-slate-600">{detail.address.phoneNumber}</p>
              <p className="text-slate-600">{detail.address.streetLine}</p>
              <p className="text-slate-600">
                {detail.address.city}, {detail.address.governorate}
                {detail.address.postalCode ? ` ${detail.address.postalCode}` : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {detailLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <span className="size-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
        </div>
      )}
    </AdminLayout>
  );
}
