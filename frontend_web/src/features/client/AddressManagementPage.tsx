import { MapPin, Plus, Pencil, Trash2, CheckCircle2, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../../shared/ui/PageShell';
import { useAuth } from '../auth/AuthContext';
import { getAddresses, createAddress, updateAddress, deleteAddress, type AddressResponse, type AddressRequest } from './clientApi';

const emptyForm: AddressRequest = {
  label: '', recipientName: '', phoneNumber: '', streetLine: '',
  city: '', governorate: '', postalCode: '', defaultAddress: false,
};

export function AddressManagementPage() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AddressResponse | null>(null);
  const [form, setForm] = useState<AddressRequest>(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    setLoading(true);
    getAddresses(token).then(setAddresses).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true); setError(''); };

  const openEdit = (a: AddressResponse) => {
    setEditing(a);
    setForm({
      label: a.label, recipientName: a.recipientName, phoneNumber: a.phoneNumber,
      streetLine: a.streetLine, city: a.city, governorate: a.governorate,
      postalCode: a.postalCode || '', defaultAddress: a.defaultAddress,
    });
    setShowForm(true);
    setError('');
  };

  const handleSave = async () => {
    if (!token) return;
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const updated = await updateAddress(token, editing.id, form);
        setAddresses((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      } else {
        const created = await createAddress(token, form);
        setAddresses((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditing(null);
    } catch (e) { setError((e as Error).message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    try { await deleteAddress(token, id); setAddresses((prev) => prev.filter((a) => a.id !== id)); }
    catch (e) { setError((e as Error).message); }
  };

  const setDefault = async (addr: AddressResponse) => {
    if (!token || addr.defaultAddress) return;
    try {
      const data: AddressRequest = {
        label: addr.label, recipientName: addr.recipientName, phoneNumber: addr.phoneNumber,
        streetLine: addr.streetLine, city: addr.city, governorate: addr.governorate,
        postalCode: addr.postalCode || '', defaultAddress: true,
      };
      const updated = await updateAddress(token, addr.id, data);
      setAddresses((prev) => prev.map((a) => ({ ...a, defaultAddress: a.id === updated.id })));
    } catch (e) { setError((e as Error).message); }
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <Link className="mb-6 inline-flex items-center gap-2 text-sm font-black text-brand-green" to="/checkout">
          <ArrowLeft size={18} /> Retour au checkout
        </Link>
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-black text-brand-ink">Mes adresses</h1>
          <button className="inline-flex items-center gap-2 rounded-lg bg-brand-green px-4 py-2 text-sm font-black text-white" type="button" onClick={openNew}>
            <Plus size={18} /> Ajouter
          </button>
        </div>

        {error ? (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
            <AlertCircle size={18} /> {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-lg font-bold text-slate-500">
            <Loader2 className="animate-spin" size={24} /> Chargement...
          </div>
        ) : addresses.length === 0 && !showForm ? (
          <div className="rounded-lg border border-dashed border-slate-300 p-16 text-center">
            <MapPin className="mx-auto mb-4 text-slate-300" size={56} />
            <h2 className="text-xl font-black">Aucune adresse enregistree</h2>
            <p className="mt-2 text-slate-600">Ajoutez une adresse pour pouvoir passer commande.</p>
            <button className="mt-6 rounded-lg bg-brand-green px-6 py-3 text-sm font-black text-white" type="button" onClick={openNew}>
              Ajouter une adresse
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className={`relative rounded-lg border bg-white p-4 sm:p-5 ${addr.defaultAddress ? 'border-brand-green ring-1 ring-brand-green' : 'border-slate-200'}`}>
                {addr.defaultAddress ? (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-3 py-1 text-xs font-black text-brand-green">
                    <CheckCircle2 size={14} /> Par defaut
                  </span>
                ) : null}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-black">{addr.label}</p>
                    <p className="mt-1 text-sm text-slate-600">{addr.recipientName} - {addr.phoneNumber}</p>
                    <p className="text-sm text-slate-600">{addr.streetLine}</p>
                    <p className="text-sm text-slate-600">{addr.city}, {addr.governorate} {addr.postalCode ? `- ${addr.postalCode}` : ''}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm font-bold">
                  <button className="inline-flex items-center gap-1 text-brand-green transition hover:text-brand-green/70" type="button" onClick={() => openEdit(addr)}>
                    <Pencil size={15} /> Modifier
                  </button>
                  {!addr.defaultAddress ? (
                    <>
                      <button className="inline-flex items-center gap-1 text-slate-500 transition hover:text-brand-green" type="button" onClick={() => setDefault(addr)}>
                        <CheckCircle2 size={15} /> Definir par defaut
                      </button>
                      <button className="inline-flex items-center gap-1 text-red-500 transition hover:text-red-700" type="button" onClick={() => handleDelete(addr.id)}>
                        <Trash2 size={15} /> Supprimer
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        {showForm ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/30 backdrop-blur-sm p-4">
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-soft">
              <h2 className="text-xl font-black">{editing ? 'Modifier' : 'Nouvelle'} adresse</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-black text-slate-700">Libelle</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-green" placeholder="Domicile, Bureau..." value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700">Prenom</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-green" value={form.recipientName.split(' ')[1] || ''} onChange={(e) => setForm({ ...form, recipientName: `${form.recipientName.split(' ')[0] || ''} ${e.target.value}`.trim() })} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700">Nom</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-green" value={form.recipientName.split(' ')[0] || ''} onChange={(e) => setForm({ ...form, recipientName: `${e.target.value} ${form.recipientName.split(' ').slice(1).join(' ')}`.trim() })} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700">Telephone</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-green" placeholder="55123456" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700">Code postal</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-green" value={form.postalCode || ''} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-black text-slate-700">Adresse</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-green" placeholder="Rue, numero, residence..." value={form.streetLine} onChange={(e) => setForm({ ...form, streetLine: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700">Ville</label>
                  <input className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-green" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-black text-slate-700">Gouvernorat</label>
                  <select className="mt-1 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold outline-none focus:border-brand-green" value={form.governorate} onChange={(e) => setForm({ ...form, governorate: e.target.value })}>
                    <option value="">Choisir...</option>
                    {['Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Hammamet', 'Sousse', 'Monastir', 'Mahdia', 'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabes', 'Medenine', 'Tataouine', 'Gafsa', 'Tozeur', 'Kebili', 'Beja', 'Jendouba', 'Le Kef', 'Siliana', 'Zaghouan'].map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-3 text-sm font-black">
                    <input className="size-5 accent-brand-green" type="checkbox" checked={form.defaultAddress} onChange={(e) => setForm({ ...form, defaultAddress: e.target.checked })} />
                    Definir comme adresse par defaut
                  </label>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button className="h-11 flex-1 rounded-lg bg-brand-ink text-sm font-black text-white transition hover:-translate-y-0.5 disabled:opacity-50" disabled={saving || !form.label || !form.recipientName || !form.phoneNumber || !form.streetLine || !form.city || !form.governorate} type="button" onClick={handleSave}>
                  {saving ? <Loader2 className="mx-auto animate-spin" size={20} /> : (editing ? 'Enregistrer' : 'Ajouter')}
                </button>
                <button className="h-11 rounded-lg border border-slate-200 px-6 text-sm font-bold transition hover:bg-slate-50" type="button" onClick={() => { setShowForm(false); setEditing(null); setError(''); }}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </PageShell>
  );
}
