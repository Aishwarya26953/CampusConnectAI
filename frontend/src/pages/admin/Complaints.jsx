import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, ClipboardList, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { complaintService } from '../../services';
import { Button, Modal, Input, Textarea, Select, PageHeader, EmptyState, SkeletonCard, ConfirmDialog, Badge, StatusBadge, PriorityBadge } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const COMPLAINT_CATEGORIES = ['electrical', 'wifi', 'furniture', 'water', 'cleaning', 'other'];
const COMPLAINT_STATUSES = ['pending', 'in_progress', 'resolved'];

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      const res = await complaintService.list(params);
      setComplaints(res.data);
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchComplaints(); }, [statusFilter, categoryFilter]);

  const openCreate = () => { reset({}); setModal({ open: true, editing: null }); };
  const openEdit = (comp) => {
    reset({
      ...comp,
      status: comp.status,
      assigned_to: comp.assigned_to || '',
      resolution_note: comp.resolution_note || '',
    });
    setModal({ open: true, editing: comp });
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (modal.editing) {
        await complaintService.update(modal.editing.id, data);
        toast.success('Complaint updated');
      } else {
        await complaintService.create(data);
        toast.success('Complaint created');
      }
      setModal({ open: false, editing: null });
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await complaintService.delete(deleting.id);
      toast.success('Complaint deleted');
      setDeleting(null);
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Complaints" subtitle={`${complaints.length} total complaints`}>
        <div className="flex items-center gap-2">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input w-40">
            <option value="">All Status</option>
            {COMPLAINT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="input w-40">
            <option value="">All Categories</option>
            {COMPLAINT_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
          </select>
          <Button onClick={openCreate}><Plus className="w-4 h-4" /> New Complaint</Button>
        </div>
      </PageHeader>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : complaints.length === 0 ? (
        <div className="card"><EmptyState icon={ClipboardList} title="No complaints found" /></div>
      ) : (
        <div className="space-y-3">
          {complaints.map((comp, i) => (
            <div key={comp.id} className="card p-5 card-hover group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">{comp.title}</h3>
                    <Badge color="gray">{comp.category}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">by {comp.student?.name} • {comp.student?.email}</p>
                </div>
                <div className="flex gap-2">
                  <PriorityBadge priority={comp.ai_priority} />
                  <StatusBadge status={comp.status} />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">{comp.description}</p>
              {comp.location && <p className="text-xs text-slate-500 mb-2">📍 {comp.location}</p>}
              {comp.ai_priority_reason && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800">{comp.ai_priority_reason}</p>
                </div>
              )}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <Button size="sm" onClick={() => openEdit(comp)}><Edit2 className="w-3.5 h-3.5" /> Update</Button>
                <div className="flex-1" />
                <button onClick={() => setDeleting(comp)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Update Complaint' : 'New Complaint'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!modal.editing && (
            <>
              <Select label="Category" error={errors.category?.message} {...register('category', { required: 'Category is required' })}>
                <option value="">Select Category</option>
                {COMPLAINT_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </Select>
              <Input label="Title" placeholder="Short complaint title" error={errors.title?.message} {...register('title', { required: 'Title is required' })} />
              <Textarea label="Description" placeholder="Describe the issue in detail..." error={errors.description?.message} {...register('description', { required: 'Description is required' })} />
              <Input label="Location (Optional)" placeholder="Block A, Room 101" {...register('location')} />
            </>
          )}
          {modal.editing && (
            <>
              <Select label="Status" error={errors.status?.message} {...register('status', { required: 'Status is required' })}>
                {COMPLAINT_STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </Select>
              <Input label="Assign To (User ID)" type="number" placeholder="Optional" {...register('assigned_to')} />
              <Textarea label="Resolution Note" placeholder="Add resolution details..." {...register('resolution_note')} />
            </>
          )}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal({ open: false, editing: null })}>Cancel</Button>
            <Button type="submit" loading={saving}>{modal.editing ? 'Update' : 'Submit'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Complaint"
        message={`Are you sure you want to delete "${deleting?.title}"?`}
      />
    </div>
  );
}