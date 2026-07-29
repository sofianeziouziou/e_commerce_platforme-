import { useEffect, useState } from 'react';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '../auth/AuthContext';
import { getCategories, createCategory, updateCategory, deleteCategory, type CategoryItem } from './adminApi';

export function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: '', description: '', imageUrl: '', displayOrder: 0, active: true });

  const load = () => {
    if (!token) return;
    setLoading(true);
    getCategories(token).then(setCategories).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', imageUrl: '', displayOrder: 0, active: true });
    setShowForm(true);
  };

  const openEdit = (c: CategoryItem) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '', imageUrl: c.imageUrl || '', displayOrder: c.displayOrder, active: c.active });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      if (editing) {
        await updateCategory(token, editing.id, { name: form.name, description: form.description || undefined, imageUrl: form.imageUrl || undefined, active: form.active, displayOrder: form.displayOrder });
      } else {
        await createCategory(token, { name: form.name, description: form.description || undefined, imageUrl: form.imageUrl || undefined, displayOrder: form.displayOrder });
      }
      setShowForm(false);
      load();
    } catch { /* ignore */ } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!token || !window.confirm('Supprimer cette categorie ?')) return;
    await deleteCategory(token, id);
    load();
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-black text-brand-ink">Categories</h1>
        <button className="flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5" onClick={openCreate}>
          <Plus size={18} /> Nouvelle categorie
        </button>
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
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Ordre</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-brand-ink">{c.name}</td>
                  <td className="px-4 py-3 text-slate-500">{c.slug}</td>
                  <td className="px-4 py-3 text-slate-600">{c.displayOrder}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${c.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="flex gap-2 px-4 py-3">
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-brand-green hover:text-brand-green" onClick={() => openEdit(c)}>
                      <Edit3 size={16} />
                    </button>
                    <button className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-300 hover:text-red-600" onClick={() => handleDelete(c.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td className="px-4 py-8 text-center text-slate-400" colSpan={5}>Aucune categorie trouvee.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-black text-brand-ink">{editing ? 'Modifier' : 'Nouvelle'} categorie</h2>
              <button className="text-slate-400" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form className="space-y-4" onSubmit={handleSave}>
              <div>
                <label className="block text-xs font-black text-slate-700">Nom</label>
                <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-green" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700">Description</label>
                <textarea className="mt-1 h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-green" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700">Image URL</label>
                <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-green" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700">Ordre d&apos;affichage</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-brand-green" type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
                </div>
                <div className="flex items-end pb-3">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                    Active
                  </label>
                </div>
              </div>
              <button
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-brand-ink text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-50"
                disabled={saving}
              >
                {saving ? <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save size={18} />}
                {saving ? 'Enregistrement...' : editing ? 'Mettre a jour' : 'Creer la categorie'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
