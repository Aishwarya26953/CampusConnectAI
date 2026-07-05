import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, School, Search } from 'lucide-react';
import { classroomService } from '../../services';
import { Button, Modal, Input, PageHeader, EmptyState, SkeletonCard, ConfirmDialog } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function Classrooms() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchClassrooms(); }, []);

  const fetchClassrooms = async () => {
    try {
      const res = await classroomService.list();
      setClassrooms(res.data);
    } catch { toast.error('Failed to load classrooms'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { reset({ facilities: [] }); setModal({ open: true, editing: null }); };
  const openEdit = (room) => {
    reset({ ...room, facilities: room.facilities || [] });
    setModal({ open: true, editing: room });
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (modal.editing) {
        await classroomService.update(modal.editing.id, data);
        toast.success('Classroom updated');
      } else {
        await classroomService.create(data);
        toast.success('Classroom created');
      }
      setModal({ open: false, editing: null });
      fetchClassrooms();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await classroomService.delete(deleting.id);
      toast.success(`Classroom "${deleting.room_number}" deleted`);
      setDeleting(null);
      fetchClassrooms();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  const filtered = classrooms.filter(r =>
    r.room_number.toLowerCase().includes(search.toLowerCase()) ||
    r.building.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Classrooms" subtitle={`${classrooms.length} classrooms available`}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search rooms..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 w-48"
            />
          </div>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Classroom</Button>
        </div>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon={School} title="No classrooms found" action={<Button onClick={openCreate}>Add First Classroom</Button>} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((room, i) => (
            <div key={room.id} className="card p-5 card-hover group">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold text-sm mb-3">
                  {room.building.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(room)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleting(room)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-800">{room.room_number}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{room.building} • Floor {room.floor || 'N/A'}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                <span>👥 Capacity: {room.capacity}</span>
                <span className={`px-2 py-0.5 rounded-full ${room.is_available ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                  {room.is_available ? 'Available' : 'Unavailable'}
                </span>
              </div>
              {room.facilities && room.facilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {room.facilities.map(f => (
                    <span key={f} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{f}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Edit Classroom' : 'Add Classroom'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Building" placeholder="Block A" error={errors.building?.message} {...register('building', { required: 'Building is required' })} />
          <Input label="Room Number" placeholder="101" error={errors.room_number?.message} {...register('room_number', { required: 'Room number is required' })} />
          <Input label="Capacity" type="number" placeholder="50" error={errors.capacity?.message} {...register('capacity', { required: 'Capacity is required', min: { value: 1, message: 'Must be at least 1' } })} />
          <Input label="Floor (Optional)" type="number" placeholder="1" {...register('floor')} />
          <div className="form-group">
            <label className="label">Facilities (comma-separated)</label>
            <input className="input" placeholder="Projector, AC, WiFi" {...register('facilities', {
              setValueAs: v => v ? v.split(',').map(s => s.trim()).filter(Boolean) : []
            })} />
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('is_available')} className="rounded" />
              <span className="text-sm text-slate-700">Available for booking</span>
            </label>
          </div>
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
        title="Delete Classroom"
        message={`Are you sure you want to delete room "${deleting?.room_number}"? This action cannot be undone.`}
      />
    </div>
  );
}