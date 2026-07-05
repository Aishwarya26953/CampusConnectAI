import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Users, ClipboardList, Calendar, Bell, BookOpen } from 'lucide-react';
import { Card, StatCard, SkeletonCard } from '../../components/ui';
import { timetableService, attendanceService, eventService, complaintService, notificationService } from '../../services';

export default function FacultyDashboard() {
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    pendingComplaints: 0,
    upcomingEvents: 0,
    unreadNotifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [timetables, notifications] = await Promise.all([
        timetableService.list(),
        notificationService.list({ limit: 1 }),
      ]);
      
      setStats({
        classes: timetables.data.length,
        students: 156,
        pendingComplaints: 3,
        upcomingEvents: 2,
        unreadNotifications: notifications.data.filter(n => !n.is_read).length,
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
          <h1 className="page-title">Faculty Dashboard</h1>
          <p className="page-subtitle">Welcome back! Manage your classes and activities.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={2} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Faculty Dashboard</h1>
        <p className="page-subtitle">Welcome back! Manage your classes and activities.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Classes" value={stats.classes} icon={CalendarDays} color="blue" />
        <StatCard title="Total Students" value={stats.students} icon={Users} color="green" />
        <StatCard title="Pending Complaints" value={stats.pendingComplaints} icon={ClipboardList} color="yellow" />
        <StatCard title="Upcoming Events" value={stats.upcomingEvents} icon={Calendar} color="purple" />
        <StatCard title="Notifications" value={stats.unreadNotifications} icon={Bell} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card animate>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <p className="text-sm text-slate-600">📋 Mark Attendance</p>
            <p className="text-sm text-slate-600">📅 View Timetable</p>
            <p className="text-sm text-slate-600">📝 Create Event</p>
            <p className="text-sm text-slate-600">💬 View Complaints</p>
          </div>
        </Card>

        <Card animate>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Recent Notifications</h3>
          <p className="text-sm text-slate-500">You have {stats.unreadNotifications} unread notifications</p>
        </Card>
      </div>
    </div>
  );
}