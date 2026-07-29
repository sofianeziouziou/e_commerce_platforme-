import { useEffect, useState } from 'react';
import { Search, Save, AlertTriangle, X, Filter } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '../auth/AuthContext';
import { getProducts, updateInventory, type ProductItem } from './adminApi';

type StockFilter = 'all' | 'low' | 'out' | 'ok';

export function AdminInventoryPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [saving, setSaving] = useState<number | null>(null);
  const [editStock, setEditStock] = useState<{ id: number; quantity: number; threshold: number } | null>(null);
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');

  const load = () => {
    if (!token) return;
    setLoading(true);
    getProducts(token, search || undefined, page)
      .then(setProducts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token, page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const openEdit = (p: ProductItem) => {
    setEditStock({ id: p.id, quantity: p.stock ?? 0, threshold: 5 });
  };

  const handleSave = async () => {
    if (!token || !editStock) return;
    setSaving(editStock.id);
    await updateInventory(token, editStock.id, { quantity: editStock.quantity, lowStockThreshold: editStock.threshold });
    setSaving(null);
    setEditStock(null);
    load();
  };

  const filtered = products.filter((p) => {
    if (stockFilter === 'out') return p.stock != null && p.stock <= 0;
    if (stockFilter === 'low') return p.stock != null && p.stock > 0 && p.stock <= 10;
    if (stockFilter === 'ok') return p.stock == null || p.stock > 10;
    return true;
  });

  const lowStockProducts = products.filter((p) => p.stock != null && p.stock <= 10);

  const filterBtns: { key: StockFilter; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'low', label: 'Stock bas' },
    { key: 'out', label: 'Rupture' },
    { key: 'ok', label: 'OK' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-brand-ink">Gestion des stocks</h1>
        <p className="mt-1 text-sm text-slate-500">Suivez et mettez a jour les niveaux de stock.</p>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <div className="flex items-center gap-2 text-orange-700">
            <AlertTriangle size={18} />
            <span className="font-bold">{lowStockProducts.length} produit(s) en stock bas (&le;10)</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {lowStockProducts.slice(0, 8).map((p) => (
              <span key={p.id} className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-bold text-orange-700">
                {p.name} ({p.stock})
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <form className="flex flex-1 gap-3" onSubmit={handleSearch}>
          <input
            className="h-11 flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-green"
            placeholder="Rechercher un produit..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="flex h-11 items-center gap-2 rounded-lg bg-brand-ink px-5 text-sm font-black text-white" type="submit">
            <Search size={18} /> Chercher
          </button>
        </form>
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1">
          <Filter size={15} className="ml-2 text-slate-400" />
          {filterBtns.map(({ key, label }) => (
            <button
              key={key}
              className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition ${stockFilter === key ? 'bg-brand-ink text-white' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setStockFilter(key)}
            >
              {label}
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
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Produit</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Stock actuel</th>
                <th className="px-4 py-3">Seuil</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const isOut = p.stock != null && p.stock <= 0;
                const isLow = p.stock != null && p.stock > 0 && p.stock <= 10;
                return (
                  <tr key={p.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                    <td className="px-4 py-3">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.name} className="size-10 rounded-lg object-cover" />
                      ) : (
                        <span className="grid size-10 place-items-center rounded-lg bg-slate-100 text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-bold text-brand-ink" title={p.name}>{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.sku || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-lg font-black ${isOut ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-slate-700'}`}>
                        {p.stock != null ? p.stock : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">5</td>
                    <td className="px-4 py-3">
                      {isOut ? (
                        <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-black text-red-700">Rupture</span>
                      ) : isLow ? (
                        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-black text-orange-700">Stock bas</span>
                      ) : p.stock != null ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-black text-green-700">OK</span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-black text-slate-500">Non defini</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-brand-green hover:text-brand-green"
                        onClick={() => openEdit(p)}
                      >
                        Ajuster
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td className="px-4 py-8 text-center text-slate-400" colSpan={7}>Aucun produit trouve.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30"
          disabled={page === 0}
          onClick={() => setPage(page - 1)}
        >
          Precedent
        </button>
        <span className="text-sm font-bold text-slate-500">Page {page + 1}</span>
        <button
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30"
          disabled={products.length < 50}
          onClick={() => setPage(page + 1)}
        >
          Suivant
        </button>
      </div>

      {editStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setEditStock(null)}>
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-brand-ink">Ajuster le stock</h2>
              <button className="text-slate-400" onClick={() => setEditStock(null)}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700">Nouvelle quantite</label>
                <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-green" type="number" min="0" value={editStock.quantity} onChange={(e) => setEditStock({ ...editStock, quantity: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700">Seuil d&apos;alerte</label>
                <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-green" type="number" min="0" value={editStock.threshold} onChange={(e) => setEditStock({ ...editStock, threshold: Number(e.target.value) })} />
              </div>
              <button
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-ink text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-50"
                disabled={saving === editStock.id}
                onClick={handleSave}
              >
                {saving === editStock.id ? <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={18} />}
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
