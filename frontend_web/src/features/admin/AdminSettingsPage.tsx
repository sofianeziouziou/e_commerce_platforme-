import { Settings } from 'lucide-react';
import { AdminLayout } from './AdminLayout';

export function AdminSettingsPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-brand-ink">Parametres</h1>
        <p className="mt-1 text-sm text-slate-500">Configurez les parametres de votre magasin.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
          <Settings size={20} className="text-slate-400" />
          <span className="text-sm font-bold text-slate-500">
            La page de parametres est en cours de developpement. Vous pourrez bientot configurer les informations de votre magasin, les methodes de livraison et de paiement.
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="mb-3 text-lg font-black text-brand-ink">Informations du magasin</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-black text-slate-700">Nom du magasin</label>
              <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none" disabled value="FreshMarket Central" />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700">Adresse</label>
              <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none" disabled value="Tunis, Tunisie" />
            </div>
            <p className="text-xs text-slate-400">La modification sera disponible prochainement.</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="mb-3 text-lg font-black text-brand-ink">Livraison et paiement</h2>
          <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-4">
            <Settings size={18} className="text-slate-400" />
            <span className="text-sm font-bold text-slate-500">Configuration a venir</span>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
