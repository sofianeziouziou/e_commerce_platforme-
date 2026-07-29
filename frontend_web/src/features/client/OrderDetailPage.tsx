import { AlertCircle, ArrowLeft, CheckCircle2, Clock, CreditCard, Loader2, MapPin, PackageCheck, ShoppingBag, Truck, XCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PageShell } from '../../shared/ui/PageShell';
import { useAuth } from '../auth/AuthContext';
import { formatPrice } from '../catalog/catalogUtils';
import { getOrder, type OrderResponse } from './clientApi';

const STATUS_FLOW = ['EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE', 'LIVREE'];

const STATUS_META: Record<string, { label: string; icon: typeof CheckCircle2; desc: string }> = {
  EN_ATTENTE: { label: 'En attente', icon: Clock, desc: 'Commande recue, en attente de validation' },
  CONFIRMEE: { label: 'Confirmee', icon: CheckCircle2, desc: 'Commande validee par nos equipes' },
  EN_PREPARATION: { label: 'En preparation', icon: ShoppingBag, desc: 'Votre commande est en cours de preparation' },
  EXPEDIEE: { label: 'Expediee', icon: Truck, desc: 'Votre commande est en cours de livraison' },
  LIVREE: { label: 'Livree', icon: PackageCheck, desc: 'Commande livree avec succes' },
  ANNULEE: { label: 'Annulee', icon: XCircle, desc: 'Commande annulee' },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { token, isAuthenticated } = useAuth();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    if (!token || !id) return;
    setLoading(true);
    setError('');
    getOrder(token, Number(id))
      .then(setOrder)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, id]);

  useEffect(() => { load(); }, [load]);

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <PackageCheck className="mx-auto mb-4 text-slate-300" size={64} />
          <h1 className="text-2xl font-black">Connectez-vous pour voir cette commande</h1>
          <Link className="mt-6 inline-block rounded-lg bg-brand-green px-6 py-3 text-sm font-black text-white" to="/connexion">Se connecter</Link>
        </div>
      </PageShell>
    );
  }

  if (loading) {
    return (
      <PageShell>
        <div className="flex items-center justify-center gap-3 py-20 text-lg font-bold text-slate-500">
          <Loader2 className="animate-spin" size={24} /> Chargement de la commande...
        </div>
      </PageShell>
    );
  }

  if (error || !order) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={56} />
          <h1 className="text-2xl font-black">Commande introuvable</h1>
          <p className="mt-2 text-slate-600">{error || "Cette commande n'existe pas."}</p>
          <Link className="mt-6 inline-block text-sm font-black text-brand-green" to="/commandes">Mes commandes</Link>
        </div>
      </PageShell>
    );
  }

  const isCancelled = order.status === 'ANNULEE';
  const flowIndex = STATUS_FLOW.indexOf(order.status);
  const itemCount = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <PageShell>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm font-black text-brand-green" to="/commandes">
          <ArrowLeft size={18} /> Mes commandes
        </Link>

        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black text-brand-ink">Commande {order.orderNumber}</h1>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Clock size={14} /> {formatDate(order.createdAt)}
            </p>
          </div>
          <span className={`mt-2 self-start rounded-full px-4 py-1.5 text-sm font-black sm:mt-0 ${STATUS_META[order.status]?.label ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>
            {STATUS_META[order.status]?.label || order.status}
          </span>
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-black">Suivi de commande</h2>
          {isCancelled ? (
            <div className="mt-6 flex items-center gap-4 rounded-lg border border-red-200 bg-red-50 p-4">
              <XCircle className="shrink-0 text-red-500" size={32} />
              <div>
                <p className="font-black text-red-700">Commande annulee</p>
                <p className="text-sm text-red-600">Cette commande a ete annulee et ne sera pas livree.</p>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <div className="relative flex justify-between">
                {STATUS_FLOW.map((s, i) => {
                  const meta = STATUS_META[s];
                  const done = i <= flowIndex;
                  const Icon = meta.icon;
                  return (
                    <div key={s} className="flex flex-col items-center">
                      <div className={`z-10 grid size-10 place-items-center rounded-full ${done ? 'bg-brand-green text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {done && i < flowIndex ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                      </div>
                      <p className={`mt-2 text-center text-xs font-black ${done ? 'text-brand-green' : 'text-slate-400'}`}>{meta.label}</p>
                    </div>
                  );
                })}
                <div className="absolute left-0 right-0 top-5 h-0.5 -translate-y-1/2 bg-slate-200">
                  <div className="h-full bg-brand-green transition-all" style={{ width: `${(flowIndex / (STATUS_FLOW.length - 1)) * 100}%` }} />
                </div>
              </div>
              <p className="mt-6 text-center text-sm text-slate-600">{STATUS_META[order.status]?.desc}</p>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="flex items-center gap-2 text-lg font-black">
                <ShoppingBag size={20} /> Articles ({itemCount})
              </h2>
              <div className="mt-4 divide-y divide-slate-100">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-3">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.productName} className="size-12 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="grid size-12 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs text-slate-400">N/A</span>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black">{item.productName}</p>
                      <p className="text-xs text-slate-500">{item.unitLabel} · {formatPrice(item.unitPrice)}</p>
                    </div>
                    <span className="text-sm font-bold text-slate-500">x{item.quantity}</span>
                    <span className="min-w-[70px] text-right font-black">{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {order.address ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="flex items-center gap-2 text-lg font-black">
                  <MapPin size={20} /> Adresse de livraison
                </h2>
                <p className="mt-2 font-black">{order.address.recipientName}</p>
                <p className="text-sm text-slate-600">{order.address.phoneNumber}</p>
                <p className="text-sm text-slate-600">{order.address.streetLine}</p>
                <p className="text-sm text-slate-600">{order.address.city}, {order.address.governorate} {order.address.postalCode || ''}</p>
              </div>
            ) : null}

            {order.customerNote ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5">
                <p className="text-sm font-black text-slate-500">Note :</p>
                <p className="mt-1 text-sm text-slate-600">{order.customerNote}</p>
              </div>
            ) : null}
          </div>

          <div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <h3 className="flex items-center gap-2 text-lg font-black">
                <CreditCard size={20} /> Recapitulatif
              </h3>
              <div className="mt-4 divide-y divide-slate-200 text-sm">
                <div className="flex justify-between pb-2 font-bold">
                  <span>Sous-total</span>
                  <span>{formatPrice(order.subtotalAmount)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span>Livraison</span>
                  <span>{formatPrice(order.deliveryFee)}</span>
                </div>
                {order.discountAmount > 0 ? (
                  <div className="flex justify-between py-2 font-bold text-brand-green">
                    <span>Remise</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between pt-2 text-base font-black">
                  <span>Total</span>
                  <span className="text-brand-green">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Paiement a la livraison</p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
