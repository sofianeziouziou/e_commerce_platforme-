import { ArrowRight, BadgePercent, Clock, ShieldCheck, ShoppingBasket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { env } from '../../shared/config/env';
import { PageShell } from '../../shared/ui/PageShell';

export function HomePage() {
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-[#eef5ef]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1800&q=80')",
          }}
        />
        <div className="relative mx-auto grid min-h-[calc(100vh-64px)] max-w-7xl content-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.04fr_0.96fr] lg:px-8">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-3 rounded-full border border-brand-green/20 bg-white/85 px-4 py-2 text-sm font-bold text-brand-green shadow-soft">
              <ShoppingBasket aria-hidden="true" size={18} />
              Courses premium, prix intelligents
            </div>
            <h1 className="text-4xl font-black leading-tight text-brand-ink sm:text-5xl lg:text-7xl">
              FreshMarket
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              Un supermarche en ligne moderne pour explorer les rayons, comparer les offres et remplir votre panier avec une experience rapide et elegante.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-green px-6 py-4 text-sm font-black text-white shadow-soft transition hover:-translate-y-0.5" to="/produits">
                Explorer le catalogue
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <a className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white/80 px-6 py-4 text-sm font-black text-slate-800 transition hover:border-brand-green hover:text-brand-green" href="/produits#promotions">
                Voir les promotions
              </a>
            </div>
          </div>
          <div className="grid content-end gap-4">
            {[
              { icon: BadgePercent, label: 'Promotions visibles', value: 'Offres actives et prix barres' },
              { icon: Clock, label: 'Navigation rapide', value: 'Recherche instantanee et filtres fluides' },
              { icon: ShieldCheck, label: 'Catalogue connecte', value: `API ${env.apiBaseUrl}` },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-4 rounded-lg border border-white/70 bg-white/85 p-4 shadow-soft backdrop-blur">
                <span className="grid size-12 place-items-center rounded-lg bg-brand-green/10 text-brand-green">
                  <item.icon aria-hidden="true" size={22} />
                </span>
                <span>
                  <span className="block text-sm font-black text-brand-ink">{item.label}</span>
                  <span className="text-sm text-slate-600">{item.value}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
