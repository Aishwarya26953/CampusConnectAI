import { useState, useEffect } from 'react';
import { Bell, CheckCircle, Trash2 } from 'lucide-react';
import { notificationService } from '../../services';
import { Card, SkeletonCard, EmptyState, PageHeader } from '../../components/ui';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function FacultyNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.list({ limit: 50 });
      setNotifications(res.data);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  const handleMarkRead = async (id) => {
    await notificationService.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleDelete = async (id) => {
    await notificationService.delete(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Notifications" subtitle={`${notifications.filter(n => !n.is_read).length} unread`} />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
        </Card>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-slate-50">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-4 hover:bg-slate-50 transition-colors ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!notif.is_read ? 'bg-primary-100' : 'bg-slate-100'}`}>
                    <Bell className={`w-5 h-5 ${!notif.is_read ? 'text-primary-600' : 'text-slate-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`text-sm font-medium ${!notif.is_read ? 'text-slate-900 font-semibold' : 'text-slate-700'}`}>
                        {notif.title}
                      </h4>
                      {!notif.is_read && <span className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />}
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{notif.message}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    {!notif.is_read && (
                      <button
                        onClick={() => handleMarkRead(notif.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}