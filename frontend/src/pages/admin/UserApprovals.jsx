import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { adminService } from '../../services';
import { Button, Badge, PageHeader, EmptyState, SkeletonCard } from '../../components/ui';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function UserApprovals() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actioning, setActioning] = useState({});

  useEffect(() => { fetchPending(); }, []);

  const fetchPending = async () => {
    try {
      const res = await adminService.getPendingUsers();
      setUsers(res.data);
    } catch { toast.error('Failed to load pending users'); }
    finally { setLoading(false); }
  };

  const handleAction = async (id, status, userName) => {
    setActioning(prev => ({ ...prev, [id]: status }));
    try {
      await adminService.updateUserStatus(id, status);
      toast.success(`${userName} ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed');
    } finally {
      setActioning(prev => { const n = { ...prev }; delete n[id]; return n; });
    }
  };

  const filtered = users.filter(u => {
    const matchName = u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchName && matchRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="User Approvals" subtitle={`${users.length} pending registration${users.length !== 1 ? 's' : ''}`}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search users..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="input pl-9 w-48"
            />
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input w-36">
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
          </select>
        </div>
      </PageHeader>

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={CheckCircle} title="No pending approvals" description="All registration requests have been processed." />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((user, i) => (
            <motion.div
              key={user.id}
              className="card p-5 flex items-center gap-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 text-primary-700 font-bold text-lg">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-800">{user.name}</p>
                  <Badge color={user.role === 'faculty' ? 'purple' : 'blue'}>
                    {user.role === 'faculty' ? '👨‍🏫 Faculty' : '🎓 Student'}
                  </Badge>
                  <Badge color="yellow"><Clock className="w-3 h-3" /> Pending</Badge>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{user.email}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  {user.department && <span>🏢 {user.department.name}</span>}
                  {user.student_id && <span>ID: {user.student_id}</span>}
                  {user.faculty_id && <span>ID: {user.faculty_id}</span>}
                  {user.semester && <span>Sem: {user.semester}</span>}
                  <span>📅 {format(new Date(user.created_at), 'MMM dd, yyyy')}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button
                  variant="success"
                  size="sm"
                  loading={actioning[user.id] === 'approved'}
                  disabled={actioning[user.id]}
                  onClick={() => handleAction(user.id, 'approved', user.name)}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approve
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={actioning[user.id] === 'rejected'}
                  disabled={actioning[user.id]}
                  onClick={() => handleAction(user.id, 'rejected', user.name)}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
