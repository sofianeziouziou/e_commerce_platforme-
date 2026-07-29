import { Heart, LogIn, Menu, Search, ShoppingCart, Sparkles, User, PackageCheck, Bell } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';

type PageShellProps = PropsWithChildren<{
  cartCount?: number;
  favoriteCount?: number;
}>;

export function PageShell({ children, cartCount = 0, favoriteCount = 0 }: PageShellProps) {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-brand-surface text-brand-ink">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link className="flex items-center gap-3" to="/">
            <span className="grid size-10 place-items-center rounded-lg bg-brand-green text-white shadow-soft">
              <Sparkles aria-hidden="true" size={20} />
            </span>
            <span>
              <span className="block text-lg font-black tracking-normal text-brand-ink">FreshMarket</span>
              <span className="hidden text-xs font-semibold uppercase tracking-[0.16em] text-brand-green sm:block">
                Premium grocery
              </span>
            </span>
          </Link>
          <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm font-bold text-slate-700 lg:flex">
            <Link className="transition hover:text-brand-green" to="/">
              Accueil
            </Link>
            <Link className="transition hover:text-brand-green" to="/produits">
              Catalogue
            </Link>
            <a className="transition hover:text-brand-green" href="/produits#promotions">
              Promotions
            </a>
            <a className="transition hover:text-brand-green" href="/produits#categories">
              Categories
            </a>
            {isAuthenticated ? (
              <Link className="transition hover:text-brand-green" to="/commandes">
                Mes commandes
              </Link>
            ) : null}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              aria-label="Rechercher dans le catalogue"
              className="hidden size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-brand-green hover:text-brand-green md:grid"
              to="/produits"
            >
              <Search aria-hidden="true" size={19} />
            </Link>
            <Link
              aria-label={`${favoriteCount} favoris`}
              className="relative grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-brand-green hover:text-brand-green"
              to="/produits?favorites=1"
            >
              <Heart aria-hidden="true" size={19} />
              {favoriteCount > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-brand-orange px-1 text-center text-xs font-black text-white">{favoriteCount}</span> : null}
            </Link>
            {isAuthenticated ? (
              <Link
                aria-label={`${cartCount} articles dans le panier`}
                className="relative grid size-10 place-items-center rounded-lg bg-brand-ink text-white shadow-soft transition hover:-translate-y-0.5"
                to="/panier"
              >
                <ShoppingCart aria-hidden="true" size={19} />
                {cartCount > 0 ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-brand-orange px-1 text-center text-xs font-black text-white">{cartCount}</span> : null}
              </Link>
            ) : (
              <Link
                aria-label="Se connecter"
                className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-brand-green hover:text-brand-green"
                to="/connexion"
              >
                <LogIn aria-hidden="true" size={19} />
              </Link>
            )}

            {isAuthenticated ? (
              <>
                <Link
                  aria-label="Notifications"
                  className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-brand-green hover:text-brand-green"
                  to="/notifications"
                >
                  <Bell aria-hidden="true" size={19} />
                </Link>
                <Link
                  aria-label="Mon profil"
                  className="grid size-10 place-items-center rounded-lg border border-brand-green bg-brand-green/5 text-brand-green transition hover:bg-brand-green/10"
                  to="/profil"
                >
                  <User aria-hidden="true" size={19} />
                </Link>
              </>
            ) : null}

            <Link
              aria-label="Ouvrir le menu"
              className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 lg:hidden"
              to="/produits"
            >
              <Menu aria-hidden="true" size={20} />
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}