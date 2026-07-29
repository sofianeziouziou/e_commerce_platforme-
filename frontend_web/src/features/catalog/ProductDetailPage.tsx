import { ArrowLeft, BadgePercent, CheckCircle2, Heart, Minus, Plus, ShoppingCart, Star } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PageShell } from '../../shared/ui/PageShell';
import { useAuth } from '../auth/AuthContext';
import { addCartItem, getCart } from '../client/clientApi';
import { getCatalogData, getProductBySlug, getSimilarProducts } from './catalogApi';
import { discountLabel, formatPrice, hasPromotion, isAvailable } from './catalogUtils';
import type { Product, Promotion } from './types';

const persistedFavorites = 'freshmarket:favorites';

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function ProductDetailPage() {
  const { token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { slug = '' } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState<number[]>(() => readJson<number[]>(persistedFavorites, []));
  const [cartItemCount, setCartItemCount] = useState(0);

  const loadCart = useCallback(() => {
    if (!token) { setCartItemCount(0); return; }
    getCart(token).then((data) => setCartItemCount(data.items.reduce((s, i) => s + i.quantity, 0))).catch(() => setCartItemCount(0));
  }, [token]);

  useEffect(() => { loadCart(); }, [loadCart]);

  useEffect(() => {
    Promise.all([getProductBySlug(slug), getSimilarProducts(slug), getCatalogData()]).then(([productData, similarData, catalogData]) => {
      setProduct(productData);
      setSimilar(similarData);
      setPromotions(catalogData.promotions);
      const recent = readJson<Product[]>('freshmarket:recent', []);
      const nextRecent = [productData, ...recent.filter((item) => item.id !== productData.id)].slice(0, 8);
      localStorage.setItem('freshmarket:recent', JSON.stringify(nextRecent));
    });
  }, [slug]);

  useEffect(() => {
    localStorage.setItem(persistedFavorites, JSON.stringify(favorites));
  }, [favorites]);

  const favorite = product ? favorites.includes(product.id) : false;
  const promoLabel = product ? discountLabel(product, promotions) : null;
  const promo = useMemo(() => (product ? promotions.find((item) => item.productIds.includes(product.id)) : undefined), [product, promotions]);

  const addToCart = () => {
    if (!product || !isAvailable(product)) return;
    if (!token) { navigate('/connexion'); return; }
    addCartItem(token, product.id, quantity).then(loadCart).catch(() => {});
  };

  if (!product) {
    return (
      <PageShell>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-lg font-black">Chargement du produit...</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell cartCount={cartItemCount} favoriteCount={favorites.length}>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm font-black text-brand-green" to="/produits">
          <ArrowLeft aria-hidden="true" size={18} />
          Retour au catalogue
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.92fr]">
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
            <div className="relative aspect-[5/4] bg-slate-100">
              {product.imageUrl ? <img alt={product.name} className="size-full object-cover" src={product.imageUrl} /> : null}
              {promoLabel ? <span className="absolute left-5 top-5 rounded-full bg-brand-orange px-4 py-2 text-sm font-black text-white">{promoLabel}</span> : null}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-brand-green/10 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-brand-green">{product.categoryName}</span>
              {product.featured ? <span className="rounded-full bg-brand-orange/15 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-brand-orange">Top vente</span> : null}
              {isAvailable(product) ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-emerald-700">En stock</span> : null}
            </div>
            <h1 className="text-3xl font-black leading-tight text-brand-ink sm:text-5xl">{product.name}</h1>
            <p className="mt-3 text-base font-bold text-slate-500">{product.brand ?? 'FreshMarket'} · {product.unitLabel} · SKU {product.sku}</p>
            <p className="mt-5 text-lg leading-8 text-slate-700">{product.description}</p>

            <div className="mt-7 rounded-lg bg-slate-50 p-5">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <strong className="block text-4xl font-black text-brand-ink">{formatPrice(product.price)}</strong>
                  {product.oldPrice ? <span className="text-base font-bold text-slate-400 line-through">{formatPrice(product.oldPrice)}</span> : null}
                </div>
                {promo ? (
                  <span className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-black text-brand-orange">
                    <BadgePercent aria-hidden="true" size={18} />
                    {promo.name}
                  </span>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <div className="flex h-12 w-full items-center justify-between rounded-lg border border-slate-200 px-3 sm:w-36">
                <button aria-label="Diminuer la quantite" type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>
                  <Minus aria-hidden="true" size={18} />
                </button>
                <span className="font-black">{quantity}</span>
                <button aria-label="Augmenter la quantite" type="button" onClick={() => setQuantity((value) => value + 1)}>
                  <Plus aria-hidden="true" size={18} />
                </button>
              </div>
              <button className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-brand-green text-sm font-black text-white shadow-soft disabled:bg-slate-300" disabled={!isAvailable(product)} type="button" onClick={addToCart}>
                <ShoppingCart aria-hidden="true" size={19} />
                Ajouter au panier
              </button>
              <button
                aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                className={favorite ? 'grid size-12 place-items-center rounded-lg bg-brand-orange text-white' : 'grid size-12 place-items-center rounded-lg border border-slate-200 text-slate-600'}
                type="button"
                onClick={() => setFavorites((current) => (current.includes(product.id) ? current.filter((id) => id !== product.id) : [...current, product.id]))}
              >
                <Heart aria-hidden="true" fill={favorite ? 'currentColor' : 'none'} size={20} />
              </button>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              {['Retrait rapide', 'Paiement securise', 'Prix mis a jour'].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-lg border border-slate-200 p-3 text-sm font-black">
                  <CheckCircle2 aria-hidden="true" className="text-brand-green" size={18} />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <section className="mt-10">
          <div className="mb-5 flex items-center gap-2">
            <Star aria-hidden="true" className="text-brand-orange" size={20} />
            <h2 className="text-2xl font-black">Produits similaires</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {similar.map((item) => (
              <Link key={item.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-soft" to={`/produits/${item.slug}`}>
                <img alt={item.name} className="aspect-[4/3] w-full rounded-lg object-cover" src={item.imageUrl} />
                <span className="mt-3 block text-sm font-black text-brand-ink">{item.name}</span>
                <span className="mt-1 block text-sm font-bold text-slate-500">{formatPrice(item.price)}</span>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </PageShell>
  );
}
