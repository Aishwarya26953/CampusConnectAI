import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { eventService } from '../../services';
import { Button, Modal, Input, Textarea, Select, PageHeader, EmptyState, SkeletonCard, ConfirmDialog, Badge, StatusBadge } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EVENT_STATUSES = ['pending', 'approved', 'rejected', 'completed'];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await eventService.list(params);
      setEvents(res.data);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [statusFilter]);

  const openCreate = () => { reset({}); setModal({ open: true, editing: null }); };
  const openEdit = (ev) => {
    reset({
      ...ev,
      event_date: ev.event_date?.slice(0, 16),
      registration_deadline: ev.registration_deadline?.slice(0, 16),
    });
    setModal({ open: true, editing: ev });
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (modal.editing) {
        await eventService.update(modal.editing.id, data);
        toast.success('Event updated');
      } else {
        await eventService.create(data);
        toast.success('Event created');
      }
      setModal({ open: false, editing: null });
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await eventService.updateStatus(id, status);
      toast.success(`Event ${status}`);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Action failed');
    }
  };

  const handleDelete = async () => {
    try {
      await eventService.delete(deleting.id);
      toast.success('Event deleted');
      setDeleting(null);
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  const filtered = statusFilter ? events.filter(e => e.status === statusFilter) : events;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Events" subtitle={`${events.length} total events`}>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-40">
            <option value="">All Status</option>
            {EVENT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Create Event</Button>
        </div>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={Calendar} title="No events found" action={<Button onClick={openCreate}>Create First Event</Button>} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((ev, i) => (
            <div key={ev.id} className="card p-5 card-hover group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 line-clamp-2">{ev.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">by {ev.faculty?.name}</p>
                </div>
                <StatusBadge status={ev.status} />
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 mb-3">{ev.description}</p>
              <div className="space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{format(new Date(ev.event_date), 'MMM dd, yyyy • hh:mm a')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{ev.venue}</span>
                </div>
                {ev.max_participants && (
                  <div className="flex items-center gap-2">
                    <span>👥</span>
                    <span>{ev.registration_count || 0} / {ev.max_participants} registered</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                {ev.status === 'pending' && (
                  <>
                    <Button size="sm" variant="success" onClick={() => handleStatusUpdate(ev.id, 'approved')}><CheckCircle className="w-3.5 h-3.5" /> Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => handleStatusUpdate(ev.id, 'rejected')}><XCircle className="w-3.5 h-3.5" /> Reject</Button>
                  </>
                )}
                <div className="flex-1" />
                <button onClick={() => openEdit(ev)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => setDeleting(ev)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Edit Event' : 'Create Event'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Event Title" placeholder="National Hackathon 2025" error={errors.title?.message} {...register('title', { required: 'Title is required' })} />
          <Textarea label="Description" placeholder="Event description..." error={errors.description?.message} {...register('description', { required: 'Description is required' })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Venue" placeholder="Auditorium" error={errors.venue?.message} {...register('venue', { required: 'Venue is required' })} />
            <Input label="Category (Optional)" placeholder="Technical, Cultural, etc." {...register('category')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Event Date & Time" type="datetime-local" error={errors.event_date?.message} {...register('event_date', { required: 'Event date is required' })} />
            <Input label="Registration Deadline" type="datetime-local" {...register('registration_deadline')} />
          </div>
          <Input label="Max Participants (Optional)" type="number" placeholder="100" {...register('max_participants')} />
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
        title="Delete Event"
        message={`Are you sure you want to delete "${deleting?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}