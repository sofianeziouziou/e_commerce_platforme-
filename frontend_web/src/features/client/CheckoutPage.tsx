import { AlertCircle, ArrowLeft, CheckCircle2, CreditCard, Loader2, MapPin, PackageCheck, ShoppingCart, Truck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../../shared/ui/PageShell';
import { useAuth } from '../auth/AuthContext';
import { formatPrice } from '../catalog/catalogUtils';
import { getCart, getAddresses, createOrder, type CartResponse, type AddressResponse } from './clientApi';

type Step = 'review' | 'address' | 'confirm' | 'done';

export function CheckoutPage() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('review');
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [customerNote, setCustomerNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

  const loadData = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    Promise.all([getCart(token), getAddresses(token)])
      .then(([c, a]) => {
        setCart(c);
        setAddresses(a);
        const def = a.find((ad) => ad.defaultAddress);
        if (def) setSelectedAddressId(def.id);
        else if (a.length > 0) setSelectedAddressId(a[0].id);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <PackageCheck className="mx-auto mb-4 text-slate-300" size={64} />
          <h1 className="text-2xl font-black">Connectez-vous pour passer commande</h1>
          <Link className="mt-6 inline-block rounded-lg bg-brand-green px-6 py-3 text-sm font-black text-white" to="/connexion">Se connecter</Link>
        </div>
      </PageShell>
    );
  }

  const handleCreateOrder = async () => {
    if (!token || !selectedAddressId) return;
    setCreating(true);
    setError('');
    try {
      const order = await createOrder(token, selectedAddressId, customerNote || undefined);
      setCreatedOrderId(order.id);
      setStep('done');
    } catch (e) { setError((e as Error).message); }
    finally { setCreating(false); }
  };

  const itemCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;
  const subtotal = cart?.subtotal ?? 0;
  const deliveryFee = cart?.deliveryFee ?? 0;
  const discount = cart?.discountAmount ?? 0;
  const total = cart?.totalAmount ?? 0;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  const STEP_LABELS: Record<Step, string> = { review: 'Panier', address: 'Adresse', confirm: 'Confirmation', done: 'Termine' };
  const STEPS: Step[] = ['review', 'address', 'confirm', 'done'];
  const currentIndex = STEPS.indexOf(step);

  return (
    <PageShell cartCount={itemCount}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link className="mb-4 inline-flex items-center gap-2 text-sm font-black text-brand-green" to="/panier">
          <ArrowLeft size={18} /> Retour au panier
        </Link>

        <div className="mb-8 flex items-center gap-1 sm:gap-3">
          {STEPS.slice(0, -1).map((s, i) => (
            <span key={s} className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-black">
              <span className={`grid size-7 sm:size-8 place-items-center rounded-full text-white ${i <= currentIndex ? 'bg-brand-green' : 'bg-slate-300'}`}>
                {i < currentIndex ? <CheckCircle2 size={16} /> : i + 1}
              </span>
              <span className={i <= currentIndex ? 'text-brand-ink' : 'text-slate-400'}>{STEP_LABELS[s]}</span>
              {i < STEPS.length - 2 ? <span className="text-slate-300">—</span> : null}
            </span>
          ))}
        </div>

        {error ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            <AlertCircle size={18} /> {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-lg font-bold text-slate-500">
            <Loader2 className="animate-spin" size={24} /> Preparation de la commande...
          </div>
        ) : step === 'done' ? (
          <div className="rounded-lg border border-brand-green/20 bg-brand-green/5 p-8 text-center sm:p-16">
            <CheckCircle2 className="mx-auto mb-4 text-brand-green" size={64} />
            <h2 className="text-2xl font-black text-brand-ink">Commande confirmee !</h2>
            <p className="mt-2 text-slate-600">Votre commande a ete creee avec succes. Vous recevrez une confirmation par email.</p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link className="rounded-lg bg-brand-green px-6 py-3 text-sm font-black text-white" to={`/commandes/${createdOrderId}`}>
                Voir le detail
              </Link>
              <Link className="rounded-lg border border-slate-200 px-6 py-3 text-sm font-black" to="/commandes">
                Mes commandes
              </Link>
              <Link className="rounded-lg border border-slate-200 px-6 py-3 text-sm font-black" to="/">
                Accueil
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div>
              {step === 'review' && cart ? (
                <div>
                  <h2 className="text-xl font-black">Verification du panier</h2>
                  {cart.items.length === 0 ? (
                    <div className="mt-4 rounded-lg border border-dashed border-slate-300 p-10 text-center">
                      <p className="font-black">Votre panier est vide.</p>
                      <Link className="mt-4 inline-block text-sm font-black text-brand-green" to="/produits">Decouvrir le catalogue</Link>
                    </div>
                  ) : (
                    <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
                      {cart.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4">
                          <img alt="" className="size-16 rounded-lg bg-slate-100 object-cover" src={item.imageUrl || '/placeholder.svg'} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black">{item.productName}</p>
                            <p className="text-xs font-bold text-slate-500">{item.unitLabel} · {formatPrice(item.unitPrice)}</p>
                          </div>
                          <span className="text-sm font-black">x{item.quantity}</span>
                          <span className="min-w-[70px] text-right font-black">{formatPrice(item.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {cart.items.length > 0 ? (
                    <button className="mt-6 h-12 w-full rounded-lg bg-brand-ink text-sm font-black text-white sm:w-auto sm:px-8" type="button" onClick={() => setStep('address')}>
                      Choisir l&apos;adresse de livraison
                    </button>
                  ) : null}
                </div>
              ) : step === 'address' ? (
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-black">Adresse de livraison</h2>
                    <Link className="inline-flex items-center gap-1 text-sm font-black text-brand-green" to="/adresses">
                      <MapPin size={16} /> Gerer mes adresses
                    </Link>
                  </div>
                  {addresses.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 p-10 text-center">
                      <MapPin className="mx-auto mb-3 text-slate-300" size={40} />
                      <p className="font-black">Aucune adresse enregistree</p>
                      <p className="mt-1 text-sm text-slate-600">Ajoutez une adresse avant de continuer.</p>
                      <Link className="mt-4 inline-block rounded-lg bg-brand-green px-5 py-2 text-sm font-black text-white" to="/adresses">
                        Ajouter une adresse
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          className={`w-full rounded-lg border bg-white p-4 text-left transition ${selectedAddressId === addr.id ? 'border-brand-green ring-2 ring-brand-green' : 'border-slate-200 hover:border-slate-300'}`}
                          type="button"
                          onClick={() => setSelectedAddressId(addr.id)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-black">{addr.label}</p>
                              <p className="mt-1 text-sm text-slate-600">{addr.recipientName} - {addr.phoneNumber}</p>
                              <p className="text-sm text-slate-600">{addr.streetLine}, {addr.city}</p>
                            </div>
                            {addr.defaultAddress ? <span className="text-xs font-black text-brand-green">Par defaut</span> : null}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedAddressId && (
                    <div className="mt-6">
                      <label className="block text-sm font-black text-slate-700">Note pour le livreur (optionnelle)</label>
                      <textarea className="mt-1 h-20 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-green" placeholder="Instructions de livraison, code d'acces, interphone..." value={customerNote} onChange={(e) => setCustomerNote(e.target.value)} />
                      <button className="mt-4 h-12 w-full rounded-lg bg-brand-ink text-sm font-black text-white sm:w-auto sm:px-8" type="button" onClick={() => setStep('confirm')}>
                        Continuer vers le resume
                      </button>
                    </div>
                  )}
                </div>
              ) : step === 'confirm' ? (
                <div>
                  <h2 className="text-xl font-black">Resume de la commande</h2>
                  <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-500">
                      <Truck size={16} /> Livraison
                    </div>
                    {selectedAddress ? (
                      <div className="mt-2">
                        <p className="font-black">{selectedAddress.label}</p>
                        <p className="text-sm text-slate-600">{selectedAddress.recipientName} - {selectedAddress.phoneNumber}</p>
                        <p className="text-sm text-slate-600">{selectedAddress.streetLine}, {selectedAddress.city}, {selectedAddress.governorate}</p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-500">
                      <ShoppingCart size={16} /> Articles ({itemCount})
                    </div>
                    <div className="mt-2 divide-y divide-slate-100">
                      {cart?.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between py-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black">{item.productName}</p>
                            <p className="text-xs text-slate-500">x{item.quantity}</p>
                          </div>
                          <span className="text-sm font-black">{formatPrice(item.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {customerNote ? (
                    <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                      <p className="text-sm font-black text-slate-500">Note :</p>
                      <p className="mt-1 text-sm text-slate-600">{customerNote}</p>
                    </div>
                  ) : null}

                  <button className="mt-6 h-12 w-full rounded-lg bg-brand-green text-sm font-black text-white transition hover:-translate-y-0.5 disabled:opacity-50 sm:w-auto sm:px-10" disabled={creating} type="button" onClick={handleCreateOrder}>
                    {creating ? <Loader2 className="mx-auto animate-spin" size={20} /> : 'Confirmer la commande'}
                  </button>
                </div>
              ) : null}
            </div>

            <div className="h-max rounded-lg border border-slate-200 bg-white p-5 shadow-soft lg:sticky lg:top-24">
              <h3 className="flex items-center gap-2 text-lg font-black">
                <CreditCard size={20} /> Recapitulatif
              </h3>
              <div className="mt-4 divide-y divide-slate-200 text-sm">
                <div className="flex justify-between pb-2 font-bold">
                  <span>Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span>Livraison</span>
                  <span>{formatPrice(deliveryFee)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold">
                  <span>Remise</span>
                  <span>{formatPrice(discount)}</span>
                </div>
                <div className="flex justify-between pt-2 text-base font-black">
                  <span>Total</span>
                  <span className="text-brand-green">{formatPrice(total)}</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">Paiement a la livraison (especes ou carte)</p>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
