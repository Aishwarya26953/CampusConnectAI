import { useState, useEffect } from 'react';
import { CalendarDays, Clock, MapPin } from 'lucide-react';
import { timetableService } from '../../services';
import { Card, SkeletonCard, Badge } from '../../components/ui';

export default function FacultyTimetable() {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      const res = await timetableService.list();
      setTimetables(res.data);
    } catch { toast.error('Failed to load timetable'); }
    finally { setLoading(false); }
  };

  const grouped = timetables.reduce((acc, tt) => {
    if (!acc[tt.day]) acc[tt.day] = [];
    acc[tt.day].push(tt);
    return acc;
  }, {});

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">My Timetable</h1>
          <p className="page-subtitle">View your class schedule</p>
        </div>
        <SkeletonCard lines={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Timetable</h1>
        <p className="page-subtitle">View your class schedule</p>
      </div>

      {timetables.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No timetable entries yet</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">
          {days.filter(day => grouped[day]).map(day => (
            <div key={day} className="card p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 capitalize flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary-600" />
                {day}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {grouped[day].sort((a, b) => a.start_time.localeCompare(b.start_time)).map(tt => (
                  <div key={tt.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="font-semibold text-slate-800 text-sm mb-1">{tt.subject}</h4>
                    <p className="text-xs text-slate-500 mb-2">{tt.department?.name}</p>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{tt.start_time?.substring(0, 5)} - {tt.end_time?.substring(0, 5)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{tt.classroom?.building} {tt.classroom?.room_number}</span>
                      </div>
                    </div>
                    <Badge color="blue" className="mt-2">Sem {tt.semester}</Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}