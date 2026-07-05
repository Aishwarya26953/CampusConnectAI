import { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { eventService } from '../../services';
import { Button, Card, SkeletonCard, EmptyState, StatusBadge, PageHeader } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function FacultyEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, editing: null });
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const res = await eventService.list();
      setEvents(res.data);
    } catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { reset({}); setModal({ open: true, editing: null }); };

  const onSubmit = async (data) => {
    try {
      await eventService.create(data);
      toast.success('Event created successfully');
      setModal({ open: false, editing: null });
      fetchEvents();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create event');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Events" subtitle="Manage your events">
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Create Event</Button>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : events.length === 0 ? (
        <Card><EmptyState icon={Calendar} title="No events" action={<Button onClick={openCreate}>Create First Event</Button>} /></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map(ev => (
            <div key={ev.id} className="card p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-800 line-clamp-2">{ev.title}</h3>
                <StatusBadge status={ev.status} />
              </div>
              <p className="text-xs text-slate-500 mb-2">📅 {format(new Date(ev.event_date), 'MMM dd, yyyy')}</p>
              <p className="text-xs text-slate-500">📍 {ev.venue}</p>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create Event</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Title</label>
                <input className="input" {...register('title', { required: true })} />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea className="input" rows={4} {...register('description', { required: true })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Venue</label>
                  <input className="input" {...register('venue', { required: true })} />
                </div>
                <div>
                  <label className="label">Event Date</label>
                  <input type="datetime-local" className="input" {...register('event_date', { required: true })} />
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={() => setModal({ open: false, editing: null })}>Cancel</Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}