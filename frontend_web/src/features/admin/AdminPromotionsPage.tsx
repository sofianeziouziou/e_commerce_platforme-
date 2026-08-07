import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Calendar, Loader2, Pencil, Percent, Plus, Tag, Trash2, X } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '../auth/AuthContext';
import {
  createPromotion,
  deletePromotion,
  getCategories,
  getProducts,
  getPromotionDetail,
  getPromotions,
  updatePromotion,
  type CategoryItem,
  type ProductItem,
  type PromotionItem,
  type PromotionRequest,
} from './adminApi';

type FormState = {
  name: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: string;
  startsAt: string;
  endsAt: string;
  active: boolean;
  categoryId: string;
  productIds: number[];
};

const emptyForm: FormState = {
  name: '',
  description: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  startsAt: '',
  endsAt: '',
  active: true,
  categoryId: '',
  productIds: [],
};

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function AdminPromotionsPage() {
  const { token } = useAuth();
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<PromotionItem | null>(null);

  const load = () => {
    if (!token) return;
    getPromotions(token).then(setPromotions).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [token]);

  useEffect(() => {
    if (!token || !modalOpen) return;
    Promise.all([getCategories(token), getProducts(token)])
      .then(([c, p]) => { setCategories(c); setProducts(p); })
      .catch(() => {});
  }, [token, modalOpen]);

  const now = new Date();

  const isActive = (p: PromotionItem) =>
    p.active && new Date(p.startsAt) <= now && new Date(p.endsAt) >= now;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (promotion: PromotionItem) => {
    if (!token) return;
    setEditingId(promotion.id);
    setError('');
    getPromotionDetail(token, promotion.id)
      .then((detail) => {
        setForm({
          name: detail.name,
          description: detail.description ?? '',
          discountType: detail.discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FIXED_AMOUNT',
          discountValue: String(detail.discountValue),
          startsAt: toLocalInput(detail.startsAt),
          endsAt: toLocalInput(detail.endsAt),
          active: detail.active,
          categoryId: detail.categoryId != null ? String(detail.categoryId) : '',
          productIds: detail.productIds ?? [],
        });
        setModalOpen(true);
      })
      .catch((e) => setError((e as Error).message));
  };

  const set = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }));

  const toggleProduct = (productId: number) => {
    set((f) => ({
      productIds: f.productIds.includes(productId)
        ? f.productIds.filter((id) => id !== productId)
        : [...f.productIds, productId],
    }));
  };

  const selectedCategoryName = useMemo(
    () => categories.find((c) => c.id === Number(form.categoryId))?.name ?? '',
    [categories, form.categoryId],
  );

  const categoryProducts = useMemo(
    () => form.categoryId ? products.filter((p) => p.categoryId === Number(form.categoryId) && p.active) : [],
    [form.categoryId, products],
  );

  const handleSave = async () => {
    if (!token) return;
    setError('');
    if (!form.name.trim()) { setError('Le nom de la promotion est requis.'); return; }
    const value = Number(form.discountValue);
    if (!Number.isFinite(value) || value <= 0) { setError('La valeur de la remise doit etre superieure a 0.'); return; }
    if (form.discountType === 'PERCENTAGE' && value > 100) { setError('Le pourcentage de remise ne peut pas depasser 100%.'); return; }
    if (!form.startsAt || !form.endsAt) { setError('Les dates de debut et de fin sont requises.'); return; }
    if (new Date(form.endsAt) <= new Date(form.startsAt)) { setError('La date de fin doit etre posterieure a la date de debut.'); return; }

    const payload: PromotionRequest = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      discountType: form.discountType,
      discountValue: value,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      active: form.active,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      productIds: form.productIds,
    };

    setSaving(true);
    try {
      if (editingId != null) {
        await updatePromotion(token, editingId, payload);
      } else {
        await createPromotion(token, payload);
      }
      setModalOpen(false);
      load();
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!token || !confirmDelete) return;
    setError('');
    try {
      await deletePromotion(token, confirmDelete.id);
      setConfirmDelete(null);
      load();
    } catch (e) { setError((e as Error).message); }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-brand-ink">Promotions</h1>
          <p className="mt-1 text-sm text-slate-500">Creez et gerez vos offres promotionnelles.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5" type="button" onClick={openCreate}>
          <Plus size={18} /> Nouvelle promotion
        </button>
      </div>

      {error ? (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
          <AlertCircle size={18} /> {error}
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="size-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-soft">
          <Percent size={40} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-500">Aucune promotion pour le moment.</p>
          <button className="mt-3 text-sm font-black text-brand-green" type="button" onClick={openCreate}>
            Creer votre premiere promotion
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((p) => (
            <div key={p.id} className={`rounded-xl border p-5 shadow-soft transition hover:shadow-md ${
              isActive(p) ? 'border-green-200 bg-green-50/50' : 'border-slate-200 bg-white'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Tag size={18} className={isActive(p) ? 'text-green-600' : 'text-slate-400'} />
                  <h3 className="font-black text-brand-ink">{p.name}</h3>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                  isActive(p) ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {isActive(p) ? 'Active' : 'Inactive'}
                </span>
              </div>
              {p.description && <p className="mt-2 text-xs text-slate-500">{p.description}</p>}
              <div className="mt-3 flex items-center gap-3 text-xs font-bold text-slate-500">
                <span className="rounded bg-brand-green/10 px-2 py-0.5 text-brand-green">
                  {p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `${p.discountValue.toFixed(3)} TND`}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(p.endsAt).toLocaleDateString('fr-FR')}
                </span>
                <span>{p.productCount} produit(s)</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-brand-green hover:text-brand-green" type="button" onClick={() => openEdit(p)}>
                  <Pencil size={13} /> Modifier
                </button>
                <button className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-black text-slate-600 transition hover:border-red-300 hover:text-red-600" type="button" onClick={() => setConfirmDelete(p)}>
                  <Trash2 size={13} /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen ? (
        <div className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm">
          <div className="ml-auto flex h-full w-full max-w-2xl flex-col bg-white shadow-soft">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <h2 className="text-xl font-black">{editingId != null ? 'Modifier la promotion' : 'Nouvelle promotion'}</h2>
              <button aria-label="Fermer" className="grid size-10 place-items-center rounded-lg border border-slate-200" type="button" onClick={() => setModalOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {error ? (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
                  <AlertCircle size={16} /> {error}
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-black text-slate-700" htmlFor="promo-name">Nom</label>
                  <input id="promo-name" className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-green" value={form.name} onChange={(e) => set({ name: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-black text-slate-700" htmlFor="promo-desc">Description</label>
                  <textarea id="promo-desc" className="mt-1 h-20 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-green" value={form.description} onChange={(e) => set({ description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700" htmlFor="promo-type">Type de remise</label>
                  <select id="promo-type" className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold" value={form.discountType} onChange={(e) => set({ discountType: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT' })}>
                    <option value="PERCENTAGE">Pourcentage (%)</option>
                    <option value="FIXED_AMOUNT">Montant fixe (TND)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700" htmlFor="promo-value">Valeur de la remise</label>
                  <input id="promo-value" className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-green" inputMode="decimal" placeholder={form.discountType === 'PERCENTAGE' ? '15' : '2.000'} type="number" value={form.discountValue} onChange={(e) => set({ discountValue: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700" htmlFor="promo-start">Date de debut</label>
                  <input id="promo-start" className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-green" type="datetime-local" value={form.startsAt} onChange={(e) => set({ startsAt: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700" htmlFor="promo-end">Date de fin</label>
                  <input id="promo-end" className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-green" type="datetime-local" value={form.endsAt} onChange={(e) => set({ endsAt: e.target.value })} />
                </div>
                <label className="flex cursor-pointer items-center gap-3 self-end pb-2 text-sm font-black text-slate-700">
                  <input className="size-5 accent-brand-green" type="checkbox" checked={form.active} onChange={(e) => set({ active: e.target.checked })} />
                  Promotion active
                </label>
                <div>
                  <label className="block text-sm font-black text-slate-700" htmlFor="promo-category">Categorie (optionnel)</label>
                  <select id="promo-category" className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold" value={form.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
                    <option value="">Aucune (selection manuelle des produits)</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {form.categoryId ? (
                <div className="mt-4 rounded-lg border border-brand-green/20 bg-brand-green/5 p-4 text-sm font-bold text-brand-green">
                  Tous les produits actifs de la categorie &quot;{selectedCategoryName}&quot; ({categoryProducts.length} produit(s)) seront inclus dans cette promotion.
                </div>
              ) : (
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-black text-slate-700">Produits concernes ({form.productIds.length} selectionne(s))</p>
                    <div className="flex gap-3 text-xs font-black text-brand-green">
                      <button type="button" onClick={() => set({ productIds: products.filter((p) => p.active).map((p) => p.id) })}>Tout selectionner</button>
                      <button type="button" onClick={() => set({ productIds: [] })}>Tout deselec.</button>
                    </div>
                  </div>
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-slate-200">
                    {products.map((p) => (
                      <label key={p.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0 hover:bg-slate-50">
                        <input className="size-4 accent-brand-green" type="checkbox" checked={form.productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                        <span className="min-w-0 flex-1 truncate font-bold">{p.name}</span>
                        <span className="text-xs text-slate-500">{p.price.toFixed(3)} TND</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-slate-200 p-5">
              <div className="flex gap-3">
                <button className="h-12 flex-1 rounded-lg border border-slate-200 text-sm font-black" type="button" onClick={() => setModalOpen(false)}>
                  Annuler
                </button>
                <button className="h-12 flex-1 rounded-lg bg-brand-green text-sm font-black text-white transition hover:-translate-y-0.5 disabled:opacity-50" disabled={saving} type="button" onClick={handleSave}>
                  {saving ? <Loader2 className="mx-auto animate-spin" size={20} /> : editingId != null ? 'Enregistrer les modifications' : 'Creer la promotion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {confirmDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/30 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-soft">
            <h2 className="text-lg font-black text-brand-ink">Supprimer la promotion ?</h2>
            <p className="mt-2 text-sm text-slate-600">
              La promotion &quot;{confirmDelete.name}&quot; sera definitivement supprimee. Cette action est irreversible.
            </p>
            <div className="mt-6 flex gap-3">
              <button className="h-11 flex-1 rounded-lg border border-slate-200 text-sm font-black" type="button" onClick={() => setConfirmDelete(null)}>
                Annuler
              </button>
              <button className="h-11 flex-1 rounded-lg bg-red-600 text-sm font-black text-white" type="button" onClick={handleDelete}>
                Supprimer
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
