import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Sparkles } from 'lucide-react';
import { PageShell } from '../../shared/ui/PageShell';
import { useAuth } from './AuthContext';

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={from || '/'} replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      navigate(from || '/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion.');
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
              <LogIn aria-hidden="true" size={28} />
            </span>
            <h1 className="text-3xl font-black text-brand-ink">Connexion</h1>
            <p className="mt-2 text-sm text-slate-600">
              Accede a votre espace client ou administrateur.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-black text-slate-800" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className="mt-2 h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-sm outline-none focus:border-brand-green"
                placeholder="vous@exemple.com"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-black text-slate-800" htmlFor="password">
                Mot de passe
              </label>
              <div className="relative mt-2">
                <input
                  id="password"
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 pr-12 text-sm outline-none focus:border-brand-green"
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
              disabled={loading}
              type="submit"
            >
              {loading ? (
                <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Sparkles aria-hidden="true" size={18} />
              )}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <Link className="font-bold text-brand-green hover:underline" to="/mot-de-passe-oublie">
              Mot de passe oublie ?
            </Link>
          </div>
          <div className="mt-4 text-center text-sm text-slate-600">
            Pas encore de compte ?{' '}
            <Link className="font-bold text-brand-green hover:underline" to="/inscription">
              Creer un compte
            </Link>
          </div>
        </div>
      </div>
    </PageShell>
  );
}