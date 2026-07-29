import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, Sparkles } from 'lucide-react';
import { PageShell } from '../../shared/ui/PageShell';
import { forgotPassword } from './authApi';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      setMessage('Si un compte existe avec cet email, un lien de reinitialisation a ete envoye.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Erreur.');
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
              <KeyRound aria-hidden="true" size={28} />
            </span>
            <h1 className="text-3xl font-black text-brand-ink">Mot de passe oublie</h1>
            <p className="mt-2 text-sm text-slate-600">
              Saisissez votre email pour reinitialiser votre mot de passe.
            </p>
          </div>

          {message && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-700">
              {message}
            </div>
          )}

          {!sent && (
            <form className="space-y-5" onSubmit={handleSubmit}>
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
                {loading ? 'Envoi...' : 'Envoyer le lien'}
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