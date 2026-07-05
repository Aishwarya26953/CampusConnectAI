import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, CalendarDays, Filter } from 'lucide-react';
import { timetableService, departmentService } from '../../services';
import { Button, Modal, Input, Select, PageHeader, EmptyState, SkeletonCard, ConfirmDialog, Badge } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function Timetable() {
  const [timetables, setTimetables] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [filterDept, setFilterDept] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
  const selectedDept = watch('department_id');

  useEffect(() => {
    fetchTimetables();
    departmentService.list().then(res => setDepartments(res.data)).catch(() => {});
  }, []);

  const fetchTimetables = async () => {
    try {
      const params = {};
      if (filterDept) params.department_id = filterDept;
      if (filterDay) params.day = filterDay;
      const res = await timetableService.list(params);
      setTimetables(res.data);
    } catch { toast.error('Failed to load timetable'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTimetables(); }, [filterDept, filterDay]);

  const openCreate = () => { reset({}); setModal({ open: true, editing: null }); };
  const openEdit = (tt) => {
    reset({
      ...tt,
      start_time: tt.start_time?.substring(0, 5),
      end_time: tt.end_time?.substring(0, 5),
    });
    setModal({ open: true, editing: tt });
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (modal.editing) {
        await timetableService.update(modal.editing.id, data);
        toast.success('Timetable updated');
      } else {
        await timetableService.create(data);
        toast.success('Timetable created');
      }
      setModal({ open: false, editing: null });
      fetchTimetables();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await timetableService.delete(deleting.id);
      toast.success('Timetable entry deleted');
      setDeleting(null);
      fetchTimetables();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  const grouped = timetables.reduce((acc, tt) => {
    if (!acc[tt.day]) acc[tt.day] = [];
    acc[tt.day].push(tt);
    return acc;
  }, {});

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Timetable" subtitle={`${timetables.length} classes scheduled`}>
        <div className="flex items-center gap-2">
          <select value={filterDept} onChange={e => setFilterDept(e.target.value)} className="input w-40">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={filterDay} onChange={e => setFilterDay(e.target.value)} className="input w-36">
            <option value="">All Days</option>
            {DAYS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
          </select>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Class</Button>
        </div>
      </PageHeader>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} lines={4} />)}
        </div>
      ) : timetables.length === 0 ? (
        <div className="card"><EmptyState icon={CalendarDays} title="No timetable entries" action={<Button onClick={openCreate}>Create First Entry</Button>} /></div>
      ) : (
        <div className="space-y-6">
          {DAYS.filter(day => grouped[day]).map(day => (
            <div key={day} className="card p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 capitalize flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-primary-600" />
                {day}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {grouped[day].sort((a, b) => a.start_time.localeCompare(b.start_time)).map(tt => (
                  <div key={tt.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-primary-200 transition-colors group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-800 text-sm">{tt.subject}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{tt.faculty?.name} • {tt.department?.name}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(tt)} className="p-1 rounded hover:bg-slate-200 text-slate-500"><Edit2 className="w-3 h-3" /></button>
                        <button onClick={() => setDeleting(tt)} className="p-1 rounded hover:bg-red-50 text-red-500"><Trash2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span>🕐 {tt.start_time?.substring(0, 5)} - {tt.end_time?.substring(0, 5)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                      <span>🏫 {tt.classroom?.building} {tt.classroom?.room_number}</span>
                      <Badge color="blue">Sem {tt.semester}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Edit Timetable Entry' : 'Add Timetable Entry'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Subject" placeholder="Data Structures" error={errors.subject?.message} {...register('subject', { required: 'Subject is required' })} />
            <Select label="Department" error={errors.department_id?.message} {...register('department_id', { required: 'Department is required' })}>
              <option value="">Select Department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Day" error={errors.day?.message} {...register('day', { required: 'Day is required' })}>
              <option value="">Select Day</option>
              {DAYS.map(d => <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>)}
            </Select>
            <Select label="Semester" error={errors.semester?.message} {...register('semester', { required: 'Semester is required' })}>
              <option value="">Select</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" error={errors.start_time?.message} {...register('start_time', { required: 'Start time is required' })} />
            <Input label="End Time" type="time" error={errors.end_time?.message} {...register('end_time', { required: 'End time is required' })} />
          </div>
          <Input label="Academic Year" placeholder="2025-2026" {...register('academic_year')} />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal({ open: false, editing: null })}>Cancel</Button>
            <Button type="submit" loading={saving}>{modal.editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Timetable Entry"
        message={`Are you sure you want to delete "${deleting?.subject}"? This action cannot be undone.`}
      />
    </div>
  );
}