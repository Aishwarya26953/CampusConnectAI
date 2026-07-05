import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { notificationService } from '../../services';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchCount = async () => {
    try {
      const res = await notificationService.unreadCount();
      setCount(res.data.count);
    } catch {}
  };

  const handleOpen = async () => {
    setOpen(!open);
    if (!open) {
      try {
        const res = await notificationService.list({ limit: 8 });
        setNotifications(res.data);
      } catch {}
    }
  };

  const markRead = async (id) => {
    await notificationService.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    setCount(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
      >
        <Bell className="w-4 h-4" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold min-w-[18px] px-1">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
              <button
                onClick={() => notificationService.markAllRead().then(() => { setCount(0); fetchCount(); })}
                className="text-xs text-primary-600 hover:underline"
              >
                Mark all read
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">No notifications</p>
              ) : notifications.map(n => (
                <div
                  key={n.id}
                  className={`p-3 hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                  onClick={() => markRead(n.id)}
                >
                  <p className={`text-xs font-medium text-slate-800 ${!n.is_read ? 'font-semibold' : ''}`}>{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                  </p>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-slate-100">
              <button
                onClick={() => { setOpen(false); navigate('notifications'); }}
                className="w-full text-xs text-primary-600 hover:underline text-center"
              >
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
