import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Building2, School, CalendarDays, Calendar,
  ClipboardList, Megaphone, BarChart3, FileText, Bell, User,
  BookOpen, CheckSquare, Lightbulb, AlertCircle, Bot,
  LogOut, Menu, X, GraduationCap, ChevronRight
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const adminNavItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/approvals', label: 'User Approvals', icon: Users },
  { to: '/admin/departments', label: 'Departments', icon: Building2 },
  { to: '/admin/classrooms', label: 'Classrooms', icon: School },
  { to: '/admin/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/complaints', label: 'Complaints', icon: ClipboardList },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/activity-logs', label: 'Activity Logs', icon: FileText },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/profile', label: 'My Profile', icon: User },
];

const facultyNavItems = [
  { to: '/faculty', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/faculty/attendance', label: 'Mark Attendance', icon: CheckSquare },
  { to: '/faculty/timetable', label: 'My Timetable', icon: CalendarDays },
  { to: '/faculty/events', label: 'Events', icon: Calendar },
  { to: '/faculty/complaints', label: 'Complaints', icon: ClipboardList },
  { to: '/faculty/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/faculty/notifications', label: 'Notifications', icon: Bell },
  { to: '/faculty/profile', label: 'My Profile', icon: User },
];

const studentNavItems = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/attendance', label: 'My Attendance', icon: CheckSquare },
  { to: '/student/events', label: 'Events', icon: Calendar },
  { to: '/student/complaints', label: 'Complaints', icon: ClipboardList },
  { to: '/student/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
  { to: '/student/ai-assistant', label: 'AI Assistant', icon: Bot },
  { to: '/student/profile', label: 'My Profile', icon: User },
];

const NAV_MAP = {
  admin: adminNavItems,
  faculty: facultyNavItems,
  student: studentNavItems,
};

const ROLE_COLORS = {
  admin: 'from-primary-700 to-primary-600',
  faculty: 'from-indigo-700 to-indigo-600',
  student: 'from-violet-700 to-violet-600',
};

const ROLE_LABELS = {
  admin: 'Administrator',
  faculty: 'Faculty',
  student: 'Student',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = NAV_MAP[user?.role] || [];
  const roleColor = ROLE_COLORS[user?.role] || ROLE_COLORS.student;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`p-4 border-b border-white/10`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-white font-bold text-sm leading-tight">CampusConnect</p>
              <p className="text-white/60 text-xs">AI</p>
            </div>
          )}
        </div>
      </div>

      {/* User info */}
      <div className={`p-4 border-b border-white/10 ${collapsed ? 'px-3' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.name}</p>
              <p className="text-white/60 text-xs">{ROLE_LABELS[user?.role]}</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className={`hidden lg:flex flex-col bg-gradient-to-b ${roleColor} h-screen sticky top-0 transition-all duration-300 z-30`}
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.2 }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-slate-500 hover:text-primary-600 transition-colors z-10"
        >
          <ChevronRight className={`w-3 h-3 transition-transform ${collapsed ? '' : 'rotate-180'}`} />
        </button>
        <SidebarContent />
      </motion.aside>

      {/* Mobile Hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="lg:hidden fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-gradient-to-b ${roleColor} z-50 flex flex-col`}
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
