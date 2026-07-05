import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ClipboardList, Bell, CheckSquare, TrendingUp } from 'lucide-react';
import { Card, StatCard, SkeletonCard } from '../../components/ui';
import { attendanceService, eventService, complaintService, notificationService } from '../../services';

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    attendance: 0,
    events: 0,
    complaints: 0,
    notifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [attendanceRes, eventsRes, complaintsRes, notificationsRes] = await Promise.all([
        attendanceService.getSummary(),
        eventService.list(),
        complaintService.myComplaints(),
        notificationService.list({ limit: 1 }),
      ]);

      setStats({
        attendance: attendanceRes.data.percentage || 0,
        events: eventsRes.data.length,
        complaints: complaintsRes.data.length,
        notifications: notificationsRes.data.filter(n => !n.is_read).length,
      });
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Student Dashboard</h1>
          <p className="page-subtitle">Welcome back! Track your academic progress.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Student Dashboard</h1>
        <p className="page-subtitle">Welcome back! Track your academic progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Attendance" value={`${stats.attendance}%`} icon={CheckSquare} color="green" />
        <StatCard title="Events" value={stats.events} icon={Calendar} color="blue" />
        <StatCard title="Complaints" value={stats.complaints} icon={ClipboardList} color="yellow" />
        <StatCard title="Notifications" value={stats.notifications} icon={Bell} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card animate>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">📋 View Attendance</p>
            <p className="text-sm text-slate-600">📅 Browse Events</p>
            <p className="text-sm text-slate-600">💬 Raise Complaint</p>
            <p className="text-sm text-slate-600">🔔 Check Notifications</p>
          </div>
        </Card>

        <Card animate>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Attendance Status</h3>
          <div className="flex items-center gap-4">
            <TrendingUp className={`w-12 h-12 ${stats.attendance >= 75 ? 'text-emerald-600' : 'text-red-600'}`} />
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.attendance}%</p>
              <p className={`text-sm ${stats.attendance >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.attendance >= 75 ? 'Good standing' : 'Below 75% - Warning!'}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}