import { useEffect, useState } from 'react';
import { Bell, CheckCheck, Info } from 'lucide-react';
import { PageShell } from '../../shared/ui/PageShell';
import { useAuth } from '../auth/AuthContext';
import { getNotifications, markAllNotificationsRead, type NotificationItem } from './clientApi';

export function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  const load = () => {
    if (!token) return;
    setLoading(true);
    getNotifications(token, page)
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [token, page]);

  const handleMarkAllRead = async () => {
    if (!token) return;
    await markAllNotificationsRead(token);
    load();
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  };

  const typeIcon = (type: string) => {
    if (type === 'ORDER_STATUS') return <Bell size={16} />;
    if (type === 'PROMOTION') return <Info size={16} />;
    return <Bell size={16} />;
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-2xl bg-brand-green text-white shadow-soft">
              <Bell size={24} />
            </span>
            <div>
              <h1 className="text-3xl font-black text-brand-ink">Notifications</h1>
              <p className="text-sm text-slate-500">Suivez l&apos;evolution de vos commandes</p>
            </div>
          </div>
          <button
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            onClick={handleMarkAllRead}
          >
            <CheckCheck size={16} />
            Tout marquer comme lu
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <span className="size-8 animate-spin rounded-full border-4 border-brand-green border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-400">
                <Bell size={32} className="mx-auto mb-2 opacity-50" />
                <p className="font-bold">Aucune notification</p>
              </div>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`flex items-start gap-4 rounded-xl border p-4 shadow-soft transition hover:shadow-md ${n.readAt ? 'border-slate-100 bg-white' : 'border-brand-green/20 bg-brand-green/5'}`}
              >
                <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${n.readAt ? 'bg-slate-100 text-slate-500' : 'bg-brand-green/10 text-brand-green'}`}>
                  {typeIcon(n.type)}
                </span>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <h3 className={`font-bold ${n.readAt ? 'text-slate-600' : 'text-brand-ink'}`}>{n.title}</h3>
                    <span className="whitespace-nowrap text-xs text-slate-400">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-center gap-2">
          <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30" disabled={page === 0} onClick={() => setPage(page - 1)}>Precedent</button>
          <span className="text-sm font-bold text-slate-500">Page {page + 1}</span>
          <button className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 disabled:opacity-30" disabled={notifications.length < 20} onClick={() => setPage(page + 1)}>Suivant</button>
        </div>
      </div>
    </PageShell>
  );
}
