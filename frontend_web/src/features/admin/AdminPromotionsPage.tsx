import { useEffect, useState } from 'react';
import { Plus, Percent, Tag, Calendar } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '../auth/AuthContext';
import { getPromotions, type PromotionItem } from './adminApi';

export function AdminPromotionsPage() {
  const { token } = useAuth();
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    getPromotions(token)
      .then(setPromotions)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const now = new Date();

  const isActive = (p: PromotionItem) =>
    p.active && new Date(p.startsAt) <= now && new Date(p.endsAt) >= now;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-brand-ink">Promotions</h1>
          <p className="mt-1 text-sm text-slate-500">Creez et gerez vos offres promotionnelles.</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2.5 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5">
          <Plus size={18} /> Nouvelle promotion
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="size-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
        </div>
      ) : promotions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-soft">
          <Percent size={40} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-500">Aucune promotion pour le moment.</p>
          <p className="text-xs text-slate-400">La creation de promotions sera bientot disponible.</p>
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
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-black text-brand-ink">Creation de promotions</h2>
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 p-4">
          <Percent size={20} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-500">
            La creation et la gestion avancee des promotions arrivent dans une prochaine mise a jour.
          </span>
        </div>
      </div>
    </AdminLayout>
  );
}
