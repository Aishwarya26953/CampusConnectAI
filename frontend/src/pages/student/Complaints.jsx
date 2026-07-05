import { useState, useEffect } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { complaintService } from '../../services';
import { Button, Card, SkeletonCard, EmptyState, PageHeader, Badge, StatusBadge, PriorityBadge, Modal, Input, Textarea, Select } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

const CATEGORIES = ['electrical', 'wifi', 'furniture', 'water', 'cleaning', 'other'];

export default function StudentComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false });
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      const res = await complaintService.myComplaints();
      setComplaints(res.data);
    } catch { toast.error('Failed to load complaints'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { reset({}); setModal({ open: true }); };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      await complaintService.create(data);
      toast.success('Complaint submitted successfully');
      setModal({ open: false });
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit complaint');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Complaints" subtitle="Submit and track your complaints">
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> New Complaint</Button>
      </PageHeader>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : complaints.length === 0 ? (
        <Card><EmptyState icon={AlertTriangle} title="No complaints" /></Card>
      ) : (
        <div className="space-y-3">
          {complaints.map(comp => (
            <div key={comp.id} className="card p-5 card-hover">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">{comp.title}</h3>
                    <Badge color="gray">{comp.category}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <PriorityBadge priority={comp.ai_priority} />
                  <StatusBadge status={comp.status} />
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-2">{comp.description}</p>
              {comp.location && <p className="text-xs text-slate-500 mb-2">📍 {comp.location}</p>}
              {comp.resolution_note && (
                <div className="p-3 bg-emerald-50 rounded-lg mt-2">
                  <p className="text-xs text-emerald-800"><strong>Resolution:</strong> {comp.resolution_note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">New Complaint</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Select label="Category" error={errors.category?.message} {...register('category', { required: true })}>
                <option value="">Select Category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </Select>
              <Input label="Title" placeholder="Short complaint title" error={errors.title?.message} {...register('title', { required: true })} />
              <Textarea label="Description" placeholder="Describe the issue..." error={errors.description?.message} {...register('description', { required: true })} rows={4} />
              <Input label="Location (Optional)" placeholder="Block A, Room 101" {...register('location')} />
              <div className="flex gap-3 justify-end">
                <Button type="button" variant="secondary" onClick={() => setModal({ open: false })}>Cancel</Button>
                <Button type="submit" loading={saving}>Submit</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}