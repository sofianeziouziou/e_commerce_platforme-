import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { PageShell } from '../../shared/ui/PageShell';
import { resetPassword } from './authApi';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres.');
      return;
    }
    if (!token) {
      setError('Token de reinitialisation manquant.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setMessage('Mot de passe reinitialise avec succes !');
      setTimeout(() => navigate('/connexion'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center px-4 py-12">
        <div className="w-full">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-brand-green text-white shadow-soft">
              <Lock aria-hidden="true" size={28} />
            </span>
            <h1 className="text-3xl font-black text-brand-ink">Nouveau mot de passe</h1>
            <p className="mt-2 text-sm text-slate-600">
              Choisissez un nouveau mot de passe.
            </p>
          </div>

          {message && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {!message && (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-black text-slate-800" htmlFor="newPassword">
                  Nouveau mot de passe
                </label>
                <div className="relative mt-2">
                  <input
                    id="newPassword"
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-12 text-sm outline-none focus:border-brand-green"
                    placeholder="Minimum 6 caracteres"
                    required
                    minLength={6}
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    aria-label={showPassword ? 'Masquer' : 'Afficher'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              <button
                className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-ink text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-50"
                disabled={loading}
                type="submit"
              >
                {loading ? (
                  <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Sparkles aria-hidden="true" size={18} />
                )}
                {loading ? 'Reinitialisation...' : 'Reinitialiser'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link className="inline-flex items-center gap-2 text-sm font-bold text-brand-green hover:underline" to="/connexion">
              <ArrowLeft size={16} />
              Retour a la connexion
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}