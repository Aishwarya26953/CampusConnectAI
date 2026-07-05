import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, User, Calendar } from 'lucide-react';
import { adminService } from '../../services';
import { Button, PageHeader, SkeletonCard, Badge } from '../../components/ui';
import { format } from 'date-fns';

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 50;

  useEffect(() => { fetchLogs(); }, [page]);

  const fetchLogs = async () => {
    try {
      const res = await adminService.getActivityLogs({ skip: (page - 1) * limit, limit });
      setLogs(res.data);
      setTotal(res.data.length);
    } catch { toast.error('Failed to load activity logs'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Activity Logs" subtitle={`${total} recent activities`} />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      ) : logs.length === 0 ? (
        <div className="card">
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No activity logs yet</p>
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>IP Address</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-xs font-semibold">
                          {log.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{log.user?.name || 'System'}</p>
                          <p className="text-xs text-slate-500">{log.user?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-sm text-slate-700">{log.action}</td>
                    <td>
                      {log.entity_type && (
                        <Badge color="gray">{log.entity_type}</Badge>
                      )}
                    </td>
                    <td className="text-xs text-slate-500 font-mono">{log.ip_address || 'N/A'}</td>
                    <td className="text-xs text-slate-500 whitespace-nowrap">
                      {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}