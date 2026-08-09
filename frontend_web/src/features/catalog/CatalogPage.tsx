import {
  ArrowDownUp,
  BadgePercent,
  ChevronRight,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Star,
  X,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell } from '../../shared/ui/PageShell';
import { useAuth } from '../auth/AuthContext';
import { getCatalogData } from './catalogApi';
import { discountLabel, formatPrice, hasPromotion, isAvailable, sortProducts } from './catalogUtils';
import type { Category, Product, Promotion, SortMode } from './types';
import { addCartItem, getCart, removeCartItem, updateCartItem, type CartResponse } from '../client/clientApi';

const persistedFavorites = 'freshmarket:favorites';

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function CatalogPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [brand, setBrand] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [priceLimit, setPriceLimit] = useState(40);
  const [onlyPromo, setOnlyPromo] = useState(false);
  const [sort, setSort] = useState<SortMode>('featured');
  const [favorites, setFavorites] = useState<number[]>(() => readJson<number[]>(persistedFavorites, []));
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);

  const loadCart = useCallback(() => {
    if (!token) { setCart(null); return; }
    setCartLoading(true);
    getCart(token).then(setCart).catch(() => setCart(null)).finally(() => setCartLoading(false));
  }, [token]);

  useEffect(() => { loadCart(); }, [loadCart]);

  useEffect(() => {
    getCatalogData(sort).then((data) => {
      setCategories(data.categories);
      setProducts(data.products);
      setPromotions(data.promotions);
      setLoading(false);
    });
  }, [sort]);

  useEffect(() => {
    localStorage.setItem(persistedFavorites, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    if (searchParams.get('favorites') === '1') {
      setOnlyPromo(false);
    }
  }, [searchParams]);

  const brands = useMemo(() => Array.from(new Set(products.map((product) => product.brand).filter(Boolean))).sort() as string[], [products]);
  const maxPrice = useMemo(() => Math.max(10, Math.ceil(Math.max(...products.map((product) => product.price), 40))), [products]);

  const visibleProducts = useMemo(() => {
    const showFavorites = searchParams.get('favorites') === '1';
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesQuery =
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.brand?.toLowerCase().includes(normalizedQuery) ||
        product.categoryName.toLowerCase().includes(normalizedQuery);
      const matchesCategory = category === 'all' || product.categoryName === categories.find((item) => item.slug === category)?.name;
      const matchesBrand = brand === 'all' || product.brand === brand;
      const matchesStock = availability === 'all' || (availability === 'available' ? isAvailable(product) : !isAvailable(product));
      const matchesPromo = !onlyPromo || hasPromotion(product, promotions);
      const matchesPrice = product.price <= priceLimit;
      const matchesFavorites = !showFavorites || favorites.includes(product.id);
      return matchesQuery && matchesCategory && matchesBrand && matchesStock && matchesPromo && matchesPrice && matchesFavorites;
    });

    return sortProducts(filtered, sort);
  }, [availability, brand, categories, category, favorites, onlyPromo, priceLimit, products, promotions, query, searchParams, sort]);

  const recommendedProducts = useMemo(
    () => sortProducts(products.filter((product) => product.featured || hasPromotion(product, promotions)), 'featured').slice(0, 6),
    [products, promotions],
  );
  const newestProducts = useMemo(() => sortProducts(products, 'newest').slice(0, 6), [products]);
  const bestSellers = useMemo(() => sortProducts(products.filter(isAvailable), 'featured').slice(0, 6), [products]);
  const recentProducts = useMemo(() => readJson<Product[]>('freshmarket:recent', []).slice(0, 6), []);

  const addToCart = (product: Product) => {
    if (!isAvailable(product)) return;
    if (!token) { navigate('/connexion'); return; }
    addCartItem(token, product.id, 1)
      .then((updated) => { setCart(updated); setCartOpen(true); })
      .catch(() => {});
  };

  const handleQuantity = (itemId: number, delta: number) => {
    if (!token || !cart) return;
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return;
    const newQty = item.quantity + delta;
    if (newQty <= 0) { handleRemove(itemId); return; }
    updateCartItem(token, itemId, newQty).then(setCart).catch(() => {});
  };

  const handleRemove = (itemId: number) => {
    if (!token) return;
    removeCartItem(token, itemId).then(setCart).catch(() => {});
  };

  const toggleFavorite = (productId: number) => {
    setFavorites((current) => (current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]));
  };

  const itemCount = cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0;

  return (
    <PageShell cartCount={itemCount} favoriteCount={favorites.length}>
      <section className="bg-[#f4f7f2]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8 lg:py-12">
          <div>
            <div className="mb-6 flex flex-wrap items-center gap-3 text-sm font-bold text-brand-green">
              <Link to="/">Accueil</Link>
              <ChevronRight aria-hidden="true" size={16} />
              <span>Catalogue</span>
            </div>
            <h1 className="max-w-4xl text-4xl font-black leading-tight text-brand-ink sm:text-5xl lg:text-6xl">
              Catalogue premium pour vos courses du quotidien
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">
              Recherche instantanee, filtres avances, promotions visibles, favoris et panier rapide dans une interface fluide.
            </p>
          </div>
          <div id="promotions" className="grid gap-3">
            {promotions.slice(0, 2).map((promotion) => (
              <div key={promotion.id} className="rounded-lg border border-brand-green/15 bg-white p-5 shadow-soft">
                <div className="mb-3 flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-lg bg-brand-orange/15 text-brand-orange">
                    <BadgePercent aria-hidden="true" size={20} />
                  </span>
                  <span className="rounded-full bg-brand-green px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-white">
                    Offre active
                  </span>
                </div>
                <h2 className="text-lg font-black text-brand-ink">{promotion.name}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{promotion.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="categories" className="border-y border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
          <button className={category === 'all' ? 'category-pill-active' : 'category-pill'} type="button" onClick={() => setCategory('all')}>
            Tous les rayons
          </button>
          {categories.map((item) => (
            <button key={item.slug} className={category === item.slug ? 'category-pill-active' : 'category-pill'} type="button" onClick={() => setCategory(item.slug)}>
              {item.name}
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="h-max rounded-lg border border-slate-200 bg-white p-5 shadow-soft lg:sticky lg:top-24">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal aria-hidden="true" size={20} />
            <h2 className="text-lg font-black">Filtres</h2>
          </div>
          <label className="block text-sm font-black text-slate-800" htmlFor="search">
            Recherche
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
            <Search aria-hidden="true" className="text-slate-500" size={18} />
            <input id="search" className="h-11 w-full bg-transparent text-sm outline-none" placeholder="Produit, marque, rayon..." value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>

          <label className="mt-5 block text-sm font-black text-slate-800" htmlFor="brand">
            Marque
          </label>
          <select id="brand" className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold" value={brand} onChange={(event) => setBrand(event.target.value)}>
            <option value="all">Toutes les marques</option>
            {brands.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="mt-5 block text-sm font-black text-slate-800" htmlFor="availability">
            Disponibilite
          </label>
          <select id="availability" className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold" value={availability} onChange={(event) => setAvailability(event.target.value)}>
            <option value="all">Tous</option>
            <option value="available">En stock</option>
            <option value="out">Indisponible</option>
          </select>

          <label className="mt-5 block text-sm font-black text-slate-800" htmlFor="price">
            Prix max : {formatPrice(priceLimit)}
          </label>
          <input id="price" className="mt-3 w-full accent-brand-green" max={maxPrice} min={1} type="range" value={priceLimit} onChange={(event) => setPriceLimit(Number(event.target.value))} />

          <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm font-black text-slate-800">
            <input className="size-5 accent-brand-green" type="checkbox" checked={onlyPromo} onChange={(event) => setOnlyPromo(event.target.checked)} />
            Promotions uniquement
          </label>
        </aside>

        <div>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500">{loading ? 'Chargement du catalogue...' : `${visibleProducts.length} produits trouves`}</p>
              <h2 className="text-2xl font-black text-brand-ink">Rayon en ligne</h2>
            </div>
            <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black">
              <ArrowDownUp aria-hidden="true" size={18} />
              <select className="bg-transparent outline-none" value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
                <option value="featured">Recommandes</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix decroissant</option>
                <option value="name">Nom A-Z</option>
                <option value="newest">Nouveautes</option>
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} promotions={promotions} favorite={favorites.includes(product.id)} onFavorite={toggleFavorite} onAdd={addToCart} />
            ))}
          </div>

          {!visibleProducts.length && !loading ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
              <h3 className="text-xl font-black">Aucun produit ne correspond aux filtres.</h3>
              <button className="mt-4 rounded-lg bg-brand-green px-5 py-3 text-sm font-black text-white" type="button" onClick={() => { setQuery(''); setBrand('all'); setAvailability('all'); setOnlyPromo(false); setCategory('all'); setPriceLimit(maxPrice); }}>
                Reinitialiser
              </button>
            </div>
          ) : null}

          <ProductRail title="Recommandations" products={recommendedProducts} promotions={promotions} />
          <ProductRail title="Nouveautes" products={newestProducts} promotions={promotions} />
          <ProductRail title="Meilleures ventes" products={bestSellers} promotions={promotions} />
          {recentProducts.length ? <ProductRail title="Recemment consultes" products={recentProducts} promotions={promotions} /> : null}
        </div>
      </section>

      {cartOpen && cart ? <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onQuantity={handleQuantity} onRemove={handleRemove} /> : null}
    </PageShell>
  );
}

function ProductCard({ product, promotions, favorite, onFavorite, onAdd }: { product: Product; promotions: Promotion[]; favorite: boolean; onFavorite: (id: number) => void; onAdd: (product: Product) => void }) {
  const label = discountLabel(product, promotions);
  return (
    <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
      <Link className="block" to={`/produits/${product.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
          {product.imageUrl ? <img alt={product.name} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" src={product.imageUrl} /> : null}
          {label ? <span className="absolute left-3 top-3 rounded-full bg-brand-orange px-3 py-1 text-xs font-black text-white">{label}</span> : null}
          {!isAvailable(product) ? <span className="absolute right-3 top-3 rounded-full bg-slate-900 px-3 py-1 text-xs font-black text-white">Rupture</span> : null}
        </div>
      </Link>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-black uppercase tracking-[0.12em] text-brand-green">{product.categoryName}</span>
          <button aria-label={favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'} className={favorite ? 'text-brand-orange' : 'text-slate-400 hover:text-brand-orange'} type="button" onClick={() => onFavorite(product.id)}>
            <Heart aria-hidden="true" fill={favorite ? 'currentColor' : 'none'} size={19} />
          </button>
        </div>
        <Link to={`/produits/${product.slug}`}>
          <h3 className="min-h-12 text-base font-black leading-6 text-brand-ink">{product.name}</h3>
        </Link>
        <p className="mt-1 text-sm font-bold text-slate-500">{product.brand ?? 'FreshMarket'} · {product.unitLabel}</p>
        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <strong className="block text-xl font-black text-brand-ink">{formatPrice(product.price)}</strong>
            {product.oldPrice ? <span className="text-sm font-bold text-slate-400 line-through">{formatPrice(product.oldPrice)}</span> : null}
          </div>
          <button className="grid size-11 place-items-center rounded-lg bg-brand-green text-white transition hover:-translate-y-0.5 disabled:bg-slate-300" disabled={!isAvailable(product)} type="button" onClick={() => onAdd(product)}>
            <ShoppingCart aria-hidden="true" size={19} />
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductRail({ title, products, promotions }: { title: string; products: Product[]; promotions: Promotion[] }) {
  if (!products.length) return null;
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-2">
        <Star aria-hidden="true" className="text-brand-orange" size={20} />
        <h2 className="text-xl font-black text-brand-ink">{title}</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Link key={`${title}-${product.id}`} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-brand-green" to={`/produits/${product.slug}`}>
            <img alt="" className="size-16 rounded-lg object-cover" loading="lazy" src={product.imageUrl} />
            <span className="min-w-0">
              <span className="block truncate text-sm font-black text-brand-ink">{product.name}</span>
              <span className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-500">
                {formatPrice(product.price)}
                {hasPromotion(product, promotions) ? <BadgePercent aria-hidden="true" className="text-brand-orange" size={15} /> : null}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function CartDrawer({ cart, onClose, onQuantity, onRemove }: { cart: CartResponse; onClose: () => void; onQuantity: (itemId: number, delta: number) => void; onRemove: (itemId: number) => void }) {
  const navigate = useNavigate();
  const total = cart.items.reduce((s, i) => s + i.lineTotal, 0);
  return (
    <div className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm">
      <aside className="ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-soft">
        <div className="flex items-center justify-between border-b border-slate-200 p-5">
          <div>
            <h2 className="text-xl font-black">Panier</h2>
            <p className="text-sm font-bold text-slate-500">{cart.items.length} ligne(s)</p>
          </div>
          <button aria-label="Fermer le panier" className="grid size-10 place-items-center rounded-lg border border-slate-200" type="button" onClick={onClose}>
            <X aria-hidden="true" size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {cart.items.map((item) => (
            <div key={item.id} className="mb-4 flex gap-3 rounded-lg border border-slate-200 p-3">
              <img alt="" className="size-16 rounded-lg object-cover" src={item.imageUrl} />
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-black">{item.productName}</h3>
                <p className="text-sm font-bold text-slate-500">{formatPrice(item.unitPrice)}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button className="grid size-8 place-items-center rounded-lg border border-slate-200" type="button" onClick={() => onQuantity(item.id, -1)}>
                    <Minus aria-hidden="true" size={16} />
                  </button>
                  <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                  <button className="grid size-8 place-items-center rounded-lg border border-slate-200" type="button" onClick={() => onQuantity(item.id, 1)}>
                    <Plus aria-hidden="true" size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!cart.items.length ? (
            <div className="grid place-items-center rounded-lg border border-dashed border-slate-300 p-10 text-center">
              <PackageCheck aria-hidden="true" className="mb-3 text-brand-green" size={34} />
              <p className="font-black">Votre panier est vide.</p>
            </div>
          ) : null}
        </div>
        <div className="border-t border-slate-200 p-5">
          <div className="mb-4 flex items-center justify-between text-lg font-black">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex gap-2">
            <button className="h-12 flex-1 rounded-lg border border-slate-200 text-sm font-black" type="button" onClick={() => { navigate('/panier'); onClose(); }}>
              Voir le panier
            </button>
            <button className="h-12 flex-1 rounded-lg bg-brand-ink text-sm font-black text-white" type="button" onClick={() => { navigate('/checkout'); onClose(); }}>
              Commander
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
