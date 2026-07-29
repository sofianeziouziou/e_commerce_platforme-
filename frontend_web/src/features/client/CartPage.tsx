import { Minus, Plus, ShoppingCart, Trash2, ArrowLeft, PackageCheck, Loader2, AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../../shared/ui/PageShell';
import { useAuth } from '../auth/AuthContext';
import { formatPrice } from '../catalog/catalogUtils';
import { getCart, removeCartItem, updateCartItem, clearCart, type CartResponse } from './clientApi';

export function CartPage() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState<number | null>(null);

  const loadCart = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    getCart(token)
      .then(setCart)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { loadCart(); }, [loadCart]);

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <PackageCheck className="mx-auto mb-4 text-slate-300" size={64} />
          <h1 className="text-2xl font-black">Connectez-vous pour voir votre panier</h1>
          <p className="mt-2 text-slate-600">Votre panier est synchronise avec votre compte.</p>
          <Link className="mt-6 inline-block rounded-lg bg-brand-green px-6 py-3 text-sm font-black text-white" to="/connexion">
            Se connecter
          </Link>
        </div>
      </PageShell>
    );
  }

  const handleQuantity = async (itemId: number, delta: number) => {
    if (!cart || !token) return;
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) { handleRemove(itemId); return; }
    setUpdating(itemId);
    try {
      const updated = await updateCartItem(token, itemId, newQty);
      setCart(updated);
    } catch (e) { setError((e as Error).message); }
    finally { setUpdating(null); }
  };

  const handleRemove = async (itemId: number) => {
    if (!token) return;
    setUpdating(itemId);
    try {
      const updated = await removeCartItem(token, itemId);
      setCart(updated);
    } catch (e) { setError((e as Error).message); }
    finally { setUpdating(null); }
  };

  const handleClear = async () => {
    if (!token) return;
    try { await clearCart(token); setCart({ id: 0, items: [], subtotal: 0 }); }
    catch (e) { setError((e as Error).message); }
  };

  const itemCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <PageShell cartCount={itemCount}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm font-black text-brand-green" to="/produits">
          <ArrowLeft size={18} /> Continuer les achats
        </Link>

        <h1 className="text-3xl font-black text-brand-ink">Mon panier</h1>
        {error ? (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            <AlertCircle size={18} /> {error}
            <button className="ml-auto underline" type="button" onClick={loadCart}>Reessayer</button>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-16 flex items-center justify-center gap-3 text-lg font-bold text-slate-500">
            <Loader2 className="animate-spin" size={24} /> Chargement du panier...
          </div>
        ) : !cart || cart.items.length === 0 ? (
          <div className="mt-16 rounded-lg border border-dashed border-slate-300 p-16 text-center">
            <ShoppingCart className="mx-auto mb-4 text-slate-300" size={56} />
            <h2 className="text-xl font-black">Votre panier est vide</h2>
            <p className="mt-2 text-slate-600">Decouvrez nos produits frais et de saison.</p>
            <Link className="mt-6 inline-block rounded-lg bg-brand-green px-6 py-3 text-sm font-black text-white" to="/produits">
              Decouvrir le catalogue
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 sm:gap-6">
                  <img alt="" className="size-20 rounded-lg bg-slate-100 object-cover sm:size-24" src={item.imageUrl || '/placeholder.svg'} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-black text-brand-ink">{item.productName}</h3>
                    <p className="text-sm font-bold text-slate-500">{item.unitLabel}</p>
                    <p className="mt-1 text-lg font-black text-brand-green">{formatPrice(item.unitPrice)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="grid size-9 place-items-center rounded-lg border border-slate-200 transition hover:bg-slate-100 disabled:opacity-50"
                      disabled={updating === item.id}
                      type="button"
                      onClick={() => handleQuantity(item.id, -1)}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="flex h-9 w-10 items-center justify-center rounded-lg bg-slate-50 text-sm font-black">
                      {updating === item.id ? <Loader2 className="animate-spin" size={14} /> : item.quantity}
                    </span>
                    <button
                      className="grid size-9 place-items-center rounded-lg border border-slate-200 transition hover:bg-slate-100 disabled:opacity-50"
                      disabled={updating === item.id}
                      type="button"
                      onClick={() => handleQuantity(item.id, 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="min-w-[80px] text-right">
                    <p className="font-black text-brand-ink">{formatPrice(item.lineTotal)}</p>
                    <button
                      className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-red-500 transition hover:text-red-700 disabled:opacity-50"
                      disabled={updating === item.id}
                      type="button"
                      onClick={() => handleRemove(item.id)}
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <button className="inline-flex items-center gap-2 text-sm font-bold text-red-500 transition hover:text-red-700" type="button" onClick={handleClear}>
                <Trash2 size={16} /> Vider le panier
              </button>
              <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
                <div className="flex items-center justify-between gap-8 text-lg font-black">
                  <span>Sous-total ({itemCount} article{itemCount > 1 ? 's' : ''})</span>
                  <span className="text-brand-green">{formatPrice(cart.subtotal)}</span>
                </div>
                <p className="mt-1 text-right text-sm text-slate-500">Frais de livraison calcules a l-etape suivante</p>
                <button className="mt-4 h-12 w-full rounded-lg bg-brand-ink text-sm font-black text-white transition hover:-translate-y-0.5" type="button" onClick={() => navigate('/checkout')}>
                  Passer la commande
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </PageShell>
  );
}
