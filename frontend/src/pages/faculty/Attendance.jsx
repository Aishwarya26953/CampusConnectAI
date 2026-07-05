import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Users, Search } from 'lucide-react';
import { attendanceService, timetableService } from '../../services';
import { Button, Card, Select, SkeletonCard, Badge, StatusBadge } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function FacultyAttendance() {
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    fetchTimetables();
  }, []);

  useEffect(() => {
    if (selectedTimetable) {
      fetchStudents();
    }
  }, [selectedTimetable, selectedDate]);

  const fetchTimetables = async () => {
    try {
      const res = await timetableService.list();
      setTimetables(res.data);
    } catch { toast.error('Failed to load timetables'); }
    finally { setLoading(false); }
  };

  const fetchStudents = async () => {
    try {
      const res = await attendanceService.getByTimetable(selectedTimetable, { date: selectedDate });
      setStudents(res.data);
    } catch { toast.error('Failed to load students'); }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const records = Object.entries(data)
        .filter(([key]) => key.startsWith('student_'))
        .map(([key, value]) => {
          const studentId = parseInt(key.replace('student_', ''));
          return { student_id: studentId, status: value };
        });

      await attendanceService.mark({
        timetable_id: parseInt(selectedTimetable),
        date: selectedDate,
        records,
      });
      toast.success('Attendance marked successfully');
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to mark attendance');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Mark Attendance</h1>
          <p className="page-subtitle">Select a class and mark attendance</p>
        </div>
        <SkeletonCard lines={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Mark Attendance</h1>
        <p className="page-subtitle">Select a class and mark attendance</p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Select label="Select Class" {...register('timetable_id')} onChange={(e) => setSelectedTimetable(e.target.value)}>
            <option value="">Choose a class...</option>
            {timetables.map(tt => (
              <option key={tt.id} value={tt.id}>
                {tt.subject} - {tt.department?.name} - {tt.day}
              </option>
            ))}
          </Select>
          <div className="form-group">
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {selectedTimetable && students.length > 0 && (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">
                Students ({students.length})
              </h3>
              <Button type="submit" loading={saving}>
                <CheckSquare className="w-4 h-4" /> Save Attendance
              </Button>
            </div>

            <div className="space-y-2">
              {students.map((record, i) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-sm font-semibold">
                      {record.student?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {record.student?.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {record.student?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {['present', 'absent', 'late'].map(status => (
                      <label
                        key={status}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                          record.status === status
                            ? status === 'present'
                              ? 'bg-emerald-100 text-emerald-700'
                              : status === 'absent'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <input
                          type="radio"
                          {...register(`student_${record.student_id}`, { required: true })}
                          value={status}
                          defaultChecked={record.status === status}
                          className="hidden"
                        />
                        <span className="text-xs font-medium capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </form>
        </Card>
      )}

      {!selectedTimetable && (
        <Card>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">Select a class to mark attendance</p>
          </div>
        </Card>
      )}
    </div>
  );
}