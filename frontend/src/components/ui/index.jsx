import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export function Button({ children, variant = 'primary', size = 'md', loading, className = '', ...props }) {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    ghost: 'btn bg-transparent text-slate-600 hover:bg-slate-100',
  };
  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

export function Card({ children, className = '', animate = false, ...props }) {
  const Comp = animate ? motion.div : 'div';
  const animProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};
  return (
    <Comp className={`card p-6 ${className}`} {...animProps} {...props}>
      {children}
    </Comp>
  );
}

export function Badge({ children, color = 'gray', className = '' }) {
  const colors = {
    gray: 'badge-gray',
    blue: 'badge-blue',
    green: 'badge-green',
    yellow: 'badge-yellow',
    red: 'badge-red',
    purple: 'badge-purple',
  };
  return <span className={`${colors[color]} ${className}`}>{children}</span>;
}

export function StatusBadge({ status }) {
  const map = {
    pending: { color: 'yellow', label: 'Pending' },
    approved: { color: 'green', label: 'Approved' },
    rejected: { color: 'red', label: 'Rejected' },
    in_progress: { color: 'blue', label: 'In Progress' },
    resolved: { color: 'green', label: 'Resolved' },
    completed: { color: 'gray', label: 'Completed' },
    present: { color: 'green', label: 'Present' },
    absent: { color: 'red', label: 'Absent' },
    late: { color: 'yellow', label: 'Late' },
  };
  const s = map[status] || { color: 'gray', label: status };
  return <Badge color={s.color}>{s.label}</Badge>;
}

export function PriorityBadge({ priority }) {
  const map = {
    high: { color: 'red', label: '🔴 High' },
    medium: { color: 'yellow', label: '🟡 Medium' },
    low: { color: 'green', label: '🟢 Low' },
  };
  const p = map[priority] || { color: 'gray', label: priority };
  return <Badge color={p.color}>{p.label}</Badge>;
}

export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <input className={`input ${error ? 'input-error' : ''} ${className}`} {...props} />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

export function Select({ label, error, children, className = '', ...props }) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <select className={`input ${error ? 'input-error' : ''} ${className}`} {...props}>
        {children}
      </select>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

export function Textarea({ label, error, className = '', ...props }) {
  return (
    <div className="form-group">
      {label && <label className="label">{label}</label>}
      <textarea
        className={`input resize-none ${error ? 'input-error' : ''} ${className}`}
        rows={4}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
}

export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return <Loader2 className={`${sizes[size]} animate-spin text-primary-600 ${className}`} />;
}

export function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white text-2xl font-bold">C</span>
        </div>
        <Spinner size="md" className="mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading CampusConnect AI...</p>
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-400 mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

export function StatCard({ title, value, icon: Icon, color = 'blue', change, subtitle }) {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', border: 'border-blue-100' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', border: 'border-emerald-100' },
    yellow: { bg: 'bg-amber-50', icon: 'text-amber-600', border: 'border-amber-100' },
    red: { bg: 'bg-red-50', icon: 'text-red-600', border: 'border-red-100' },
    purple: { bg: 'bg-purple-50', icon: 'text-purple-600', border: 'border-purple-100' },
  };
  const c = colors[color] || colors.blue;

  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className={`${c.bg} ${c.border} border rounded-xl p-3 flex-shrink-0`}>
        <Icon className={`w-6 h-6 ${c.icon}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        {change !== undefined && (
          <p className={`text-xs mt-1 font-medium ${change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
          </p>
        )}
      </div>
    </motion.div>
  );
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.div
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${maxWidth} z-10 max-h-[90vh] overflow-y-auto`}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

export function SkeletonCard({ lines = 3 }) {
  return (
    <div className="card p-5 animate-pulse">
      <div className="skeleton h-4 w-1/3 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`skeleton h-3 mb-2 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
      ))}
    </div>
  );
}

export function AttendanceProgress({ percentage }) {
  const isLow = percentage < 75;
  const color = percentage >= 75 ? 'bg-emerald-500' : percentage >= 60 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-500">Attendance</span>
        <span className={`text-sm font-bold ${isLow ? 'text-red-600' : 'text-emerald-600'}`}>
          {percentage?.toFixed(1)}%
        </span>
      </div>
      <div className="progress-bar">
        <div
          className={`progress-fill ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isLow && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          ⚠️ Below 75% minimum
        </p>
      )}
    </div>
  );
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header flex items-start justify-between gap-4">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 flex-shrink-0">{children}</div>}
    </div>
  );
}

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-sm">
      <p className="text-sm text-slate-600 mb-6">{message}</p>
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading}>Delete</Button>
      </div>
    </Modal>
  );
}
