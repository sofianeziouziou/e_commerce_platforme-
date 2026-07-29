import { useEffect, useState } from 'react';
import { Search, Mail, Phone } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { useAuth } from '../auth/AuthContext';
import { getCustomers, type CustomerItem } from './adminApi';

export function AdminCustomersPage() {
  const { token } = useAuth();
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = () => {
    if (!token) return;
    setLoading(true);
    getCustomers(token, search || undefined)
      .then(setCustomers)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); load(); };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-black text-brand-ink">Clients</h1>
        <p className="mt-1 text-sm text-slate-500">Consultez la liste de vos clients et leur historique.</p>
      </div>

      <form className="mb-6 flex gap-3" onSubmit={handleSearch}>
        <input
          className="h-11 flex-1 rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-green"
          placeholder="Rechercher un client (nom, email)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
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
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Commandes</th>
                <th className="px-4 py-3">Total depense</th>
                <th className="px-4 py-3">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-slate-100 transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-brand-ink">{c.firstName} {c.lastName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Mail size={12} /> <span className="text-xs">{c.email}</span>
                    </div>
                    {c.phoneNumber && (
                      <div className="mt-0.5 flex items-center gap-1 text-slate-400">
                        <Phone size={12} /> <span className="text-xs">{c.phoneNumber}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-700">{c.orderCount}</td>
                  <td className="px-4 py-3 font-bold">{c.totalSpent.toFixed(3)} TND</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td className="px-4 py-8 text-center text-slate-400" colSpan={5}>Aucun client trouve.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
