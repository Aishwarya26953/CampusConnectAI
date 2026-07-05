import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, GraduationCap, Calendar, ClipboardList } from 'lucide-react';
import { adminService } from '../../services';
import { Card, SkeletonCard } from '../../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Analytics() {
  const [data, setData] = useState({
    attendanceByDept: [],
    complaintsByCategory: [],
    complaintsByStatus: [],
    eventsByStatus: [],
    usersByDept: [],
    monthlyReg: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminService.getAttendanceByDept(),
      adminService.getComplaintsByCategory(),
      adminService.getComplaintsByStatus(),
      adminService.getEventsByStatus(),
      adminService.getUsersByDept(),
      adminService.getMonthlyRegistrations(),
    ]).then(([att, compCat, compStat, evStat, users, monthly]) => {
      setData({
        attendanceByDept: att.data,
        complaintsByCategory: compCat.data,
        complaintsByStatus: compStat.data,
        eventsByStatus: evStat.data,
        usersByDept: users.data,
        monthlyReg: monthly.data,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
      </div>
    </div>
  );

  const complaintStatusColors = { pending: '#f59e0b', in_progress: '#3b82f6', resolved: '#10b981' };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Comprehensive insights and statistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card animate>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Attendance by Department</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.attendanceByDept} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                data={data.complaintsByStatus}
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
                {data.complaintsByStatus.map((entry, i) => (
                  <Cell key={i} fill={complaintStatusColors[entry.status] || COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card animate>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Students by Department</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.usersByDept} layout="vertical" margin={{ left: 60, right: 10 }}>
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
            <LineChart data={data.monthlyReg} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
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