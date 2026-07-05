import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Building2, School, Calendar, ClipboardList, Clock, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { adminService } from '../../services';
import { StatCard, SkeletonCard, Card } from '../../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [attByDept, setAttByDept] = useState([]);
  const [complaintsByStatus, setComplaintsByStatus] = useState([]);
  const [usersByDept, setUsersByDept] = useState([]);
  const [monthlyReg, setMonthlyReg] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getDashboard(),
      adminService.getAttendanceByDept(),
      adminService.getComplaintsByStatus(),
      adminService.getUsersByDept(),
      adminService.getMonthlyRegistrations(),
    ]).then(([s, att, comp, users, monthly]) => {
      setStats(s.data);
      setAttByDept(att.data);
      setComplaintsByStatus(comp.data);
      setUsersByDept(users.data);
      setMonthlyReg(monthly.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
      </div>
    </div>
  );

  const statItems = [
    { title: 'Total Students', value: stats?.total_students || 0, icon: GraduationCap, color: 'blue' },
    { title: 'Total Faculty', value: stats?.total_faculty || 0, icon: Users, color: 'green' },
    { title: 'Departments', value: stats?.total_departments || 0, icon: Building2, color: 'purple' },
    { title: 'Classrooms', value: stats?.total_classrooms || 0, icon: School, color: 'yellow' },
    { title: 'Total Events', value: stats?.total_events || 0, icon: Calendar, color: 'blue' },
    { title: 'Total Complaints', value: stats?.total_complaints || 0, icon: ClipboardList, color: 'red' },
    { title: 'Pending Approvals', value: stats?.pending_approvals || 0, icon: Clock, color: 'yellow' },
    { title: 'Avg. Attendance', value: `${stats?.average_attendance || 0}%`, icon: TrendingUp, color: 'green' },
  ];

  const complaintStatusColors = { pending: '#f59e0b', in_progress: '#3b82f6', resolved: '#10b981' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of CampusConnect AI — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Pending alert */}
      {stats?.pending_approvals > 0 && (
        <motion.div
          className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{stats.pending_approvals} registration{stats.pending_approvals > 1 ? 's' : ''}</span> awaiting your approval.{' '}
            <a href="/admin/approvals" className="underline font-medium">Review now →</a>
          </p>
        </motion.div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((item, i) => (
          <motion.div key={item.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <StatCard {...item} />
          </motion.div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card animate>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Attendance by Department</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={attByDept} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="department" tick={{ fontSize: 10 }} tickFormatter={v => v.split(' ')[0]} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Bar dataKey="percentage" fill="#2563eb" radius={[4, 4, 0, 0]} name="Attendance %" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card animate>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Complaints by Status</h3>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={complaintsByStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                label={({ status, percent }) => `${status}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {complaintsByStatus.map((entry, i) => (
                  <Cell key={i} fill={complaintStatusColors[entry.status] || COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card animate>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Students by Department</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={usersByDept} layout="vertical" margin={{ left: 60, right: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="department" type="category" tick={{ fontSize: 10 }} tickFormatter={v => v.split(' ')[0]} width={80} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card animate>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Monthly Registrations</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyReg} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name="Registrations" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
