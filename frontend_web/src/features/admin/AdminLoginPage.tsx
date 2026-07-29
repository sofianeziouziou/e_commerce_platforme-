import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Sparkles, ShieldAlert } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export function AdminLoginPage() {
  const { login, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <span className="size-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (isAuthenticated && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login({ email, password });
      if (!user.roles.includes('ROLE_ADMIN')) {
        setError('Acces refuse. Ce compte n\'a pas les droits d\'administration.');
        return;
      }
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="m-auto flex w-full max-w-md flex-col items-center px-4">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-brand-ink text-white shadow-soft">
            <ShieldAlert aria-hidden="true" size={28} />
          </span>
          <h1 className="text-3xl font-black text-brand-ink">Administration</h1>
          <p className="mt-2 text-sm text-slate-600">
            Espace reserve aux administrateurs.
          </p>
        </div>

        <form className="w-full space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-black text-slate-800" htmlFor="admin-email">
              Email
            </label>
            <input
              id="admin-email"
              className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-ink"
              placeholder="admin@example.com"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-black text-slate-800" htmlFor="admin-password">
              Mot de passe
            </label>
            <div className="relative mt-2">
              <input
                id="admin-password"
                className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-12 text-sm outline-none focus:border-brand-ink"
                placeholder="Votre mot de passe"
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            disabled={submitting}
            type="submit"
          >
            {submitting ? (
              <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Sparkles aria-hidden="true" size={18} />
            )}
            {submitting ? 'Connexion...' : 'Acceder a l\'administration'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          <Link className="font-bold text-brand-green hover:underline" to="/connexion">
            Espace client
          </Link>
        </div>
      </div>
    </div>
  );
}
