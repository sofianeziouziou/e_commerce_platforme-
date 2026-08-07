import { useEffect, useState } from 'react';
import { Plus, Search, Edit3, Trash2, Save, X, Eye } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '../auth/AuthContext';
import { getProducts, createProduct, updateProduct, deleteProduct, updateInventory, getCategories, type ProductItem, type CategoryItem } from './adminApi';
import { useNavigate } from 'react-router-dom';

export function AdminProductsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  const [form, setForm] = useState({
    categoryId: 0, name: '', unitLabel: 'kg', price: 0, sku: '',
    description: '', brand: '', oldPrice: '', imageUrl: '', featured: false,
    active: true, initialQuantity: 100,
  });

  const load = () => {
    if (!token) return;
    setLoading(true);
    Promise.all([getProducts(token, search || undefined, page, 10), getCategories(token)])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token, page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const openCreate = () => {
    setEditing(null);
    setImagePreview('');
    setForm({ categoryId: categories[0]?.id || 0, name: '', unitLabel: 'kg', price: 0, sku: '', description: '', brand: '', oldPrice: '', imageUrl: '', featured: false, active: true, initialQuantity: 100 });
    setShowForm(true);
  };

  const openEdit = (p: ProductItem) => {
    setEditing(p);
    setImagePreview(p.imageUrl || '');
    setForm({
      categoryId: p.categoryId || categories.find(c => c.name === p.categoryName)?.id || 0,
      name: p.name, unitLabel: p.unitLabel, price: p.price, sku: p.sku || '',
      description: p.description || '', brand: p.brand || '', oldPrice: p.oldPrice?.toString() || '',
      imageUrl: p.imageUrl || '', featured: p.featured, active: p.active, initialQuantity: 100,
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const payload = { ...form, oldPrice: form.oldPrice ? Number(form.oldPrice) : undefined };
      if (editing) {
        await updateProduct(token, editing.id, { ...payload, active: form.active, featured: form.featured });
      } else {
        const prod = await createProduct(token, { ...payload, initialQuantity: form.initialQuantity });
        if (prod.id) {
          await updateInventory(token, prod.id, { quantity: form.initialQuantity, lowStockThreshold: 5 });
        }
      }
      setShowForm(false);
      load();
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!token || !window.confirm('Supprimer ce produit ?')) return;
    await deleteProduct(token, id);
    load();
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black text-brand-ink">Produits</h1>
        <button className="flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5" onClick={openCreate}>
          <Plus size={18} /> Nouveau produit
        </button>
      </div>

      <form className="mb-6 flex gap-3" onSubmit={handleSearch}>
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
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Marque</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Categorie</th>
                <th className="px-4 py-3">Prix</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-4 py-3">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="size-10 rounded-lg object-cover" />
                    ) : (
                      <span className="grid size-10 place-items-center rounded-lg bg-slate-100 text-xs text-slate-400">N/A</span>
                    )}
                  </td>
                  <td className="max-w-[180px] truncate px-4 py-3 font-bold text-brand-ink" title={p.name}>{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.brand || '-'}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{p.sku || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{p.categoryName}</td>
                  <td className="px-4 py-3 font-bold">
                    {p.price.toFixed(3)} TND
                    {p.oldPrice != null && p.oldPrice > 0 && (
                      <span className="ml-1.5 text-xs text-red-500 line-through">{p.oldPrice.toFixed(3)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold ${p.stock != null && p.stock <= (p.lowStockThreshold ?? 5) ? 'text-red-600' : p.stock != null && p.stock <= 10 ? 'text-orange-600' : 'text-slate-700'}`}>
                      {p.stock != null ? `${p.stock}` : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="flex gap-2 px-4 py-3">
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-blue-300 hover:text-blue-600" onClick={() => navigate(`/produits/${p.slug}`)} title="Voir sur le site">
                      <Eye size={16} />
                    </button>
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-brand-green hover:text-brand-green" onClick={() => openEdit(p)}>
                      <Edit3 size={16} />
                    </button>
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-300 hover:text-red-600" onClick={() => handleDelete(p.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td className="px-4 py-8 text-center text-slate-400" colSpan={9}>Aucun produit trouve.</td></tr>
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
          disabled={products.length < 10}
          onClick={() => setPage(page + 1)}
        >
          Suivant
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-brand-ink">{editing ? 'Modifier' : 'Nouveau'} produit</h2>
              <button className="text-slate-400" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="block text-xs font-black text-slate-700">Categorie</label>
                <select className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-green" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: Number(e.target.value) })}>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700">Nom</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-green" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700">Marque</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-green" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700">Prix (TND)</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-green" required type="number" step="0.001" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700">Ancien prix</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-green" type="number" step="0.001" value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700">Unite</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-green" required value={form.unitLabel} onChange={(e) => setForm({ ...form, unitLabel: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700">SKU</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-green" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700">Image URL</label>
                <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-green" value={form.imageUrl} onChange={(e) => { setForm({ ...form, imageUrl: e.target.value }); setImagePreview(e.target.value); }} />
                {imagePreview && (
                  <img src={imagePreview} alt="" className="mt-2 h-20 w-20 rounded-lg border object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
              </div>
              {!editing && (
                <div>
                  <label className="block text-xs font-black text-slate-700">Stock initial</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-green" type="number" value={form.initialQuantity} onChange={(e) => setForm({ ...form, initialQuantity: Number(e.target.value) })} />
                </div>
              )}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  Actif
                </label>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                  A la une
                </label>
              </div>
              <button
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-ink text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={18} />}
                {saving ? 'Enregistrement...' : editing ? 'Mettre a jour' : 'Creer le produit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
