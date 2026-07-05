import { useState, useEffect } from 'react';
import { CheckSquare, TrendingUp, AlertTriangle } from 'lucide-react';
import { attendanceService } from '../../services';
import { Card, SkeletonCard, PageHeader, AttendanceProgress, Badge } from '../../components/ui';
import { format } from 'date-fns';

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAttendance(); }, []);

  const fetchAttendance = async () => {
    try {
      const [attRes, summaryRes] = await Promise.all([
        attendanceService.getMyAttendance(),
        attendanceService.getSummary(),
      ]);
      setAttendance(attRes.data);
      setSummary(summaryRes.data);
    } catch { toast.error('Failed to load attendance'); }
    finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">My Attendance</h1>
          <p className="page-subtitle">View your attendance records</p>
        </div>
        <SkeletonCard lines={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Attendance</h1>
        <p className="page-subtitle">View your attendance records</p>
      </div>

      {summary && (
        <Card animate>
          <h3 className="text-base font-semibold text-slate-800 mb-4">Attendance Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-2xl font-bold text-slate-900">{summary.total_classes}</p>
              <p className="text-xs text-slate-500">Total Classes</p>
            </div>
            <div className="text-center p-3 bg-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-emerald-700">{summary.present}</p>
              <p className="text-xs text-slate-500">Present</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{summary.absent}</p>
              <p className="text-xs text-slate-500">Absent</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-700">{summary.late}</p>
              <p className="text-xs text-slate-500">Late</p>
            </div>
          </div>
          <AttendanceProgress percentage={summary.percentage} />
          {summary.percentage < 75 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Low Attendance Warning</p>
                <p className="text-xs text-red-600 mt-1">
                  You need {summary.classes_needed_for_75} more classes to reach 75% attendance.
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      <Card>
        <h3 className="text-base font-semibold text-slate-800 mb-4">Attendance History</h3>
        {attendance.length === 0 ? (
          <p className="text-center text-slate-500 py-8">No attendance records yet</p>
        ) : (
          <div className="space-y-2">
            {attendance.map(record => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">{record.timetable?.subject}</p>
                  <p className="text-xs text-slate-500">
                    {record.timetable?.department?.name} • {format(new Date(record.date), 'MMM dd, yyyy')}
                  </p>
                </div>
                <Badge color={record.status === 'present' ? 'green' : record.status === 'absent' ? 'red' : 'yellow'}>
                  {record.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}