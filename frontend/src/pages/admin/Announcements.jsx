import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Megaphone, Pin } from 'lucide-react';
import { announcementService } from '../../services';
import { Button, Modal, Input, Textarea, Select, PageHeader, EmptyState, SkeletonCard, ConfirmDialog, Badge } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => { fetchAnnouncements(); }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await announcementService.list();
      setAnnouncements(res.data);
    } catch { toast.error('Failed to load announcements'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { reset({ target_role: 'all', is_pinned: false }); setModal({ open: true, editing: null }); };
  const openEdit = (ann) => {
    reset(ann);
    setModal({ open: true, editing: ann });
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (modal.editing) {
        await announcementService.update(modal.editing.id, data);
        toast.success('Announcement updated');
      } else {
        await announcementService.create(data);
        toast.success('Announcement created');
      }
      setModal({ open: false, editing: null });
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await announcementService.delete(deleting.id);
      toast.success('Announcement deleted');
      setDeleting(null);
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Announcements" subtitle={`${announcements.length} announcements`}>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> New Announcement</Button>
      </PageHeader>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : announcements.length === 0 ? (
        <div className="card"><EmptyState icon={Megaphone} title="No announcements" action={<Button onClick={openCreate}>Create First Announcement</Button>} /></div>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann, i) => (
            <div key={ann.id} className="card p-5 card-hover group">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">{ann.title}</h3>
                    {ann.is_pinned && <Pin className="w-4 h-4 text-primary-600" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color={ann.target_role === 'all' ? 'blue' : ann.target_role === 'student' ? 'green' : 'purple'}>
                      {ann.target_role === 'all' ? 'Everyone' : ann.target_role}
                    </Badge>
                    {ann.category && <Badge color="gray">{ann.category}</Badge>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(ann)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleting(ann)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-sm text-slate-600 line-clamp-3 mb-2">{ann.content}</p>
              <p className="text-xs text-slate-400">by {ann.admin?.name} • {new Date(ann.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Edit Announcement' : 'New Announcement'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" placeholder="Announcement title" error={errors.title?.message} {...register('title', { required: 'Title is required' })} />
          <Textarea label="Content" placeholder="Announcement content..." error={errors.content?.message} {...register('content', { required: 'Content is required' })} rows={5} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Target Role" error={errors.target_role?.message} {...register('target_role')}>
              <option value="all">Everyone</option>
              <option value="student">Students Only</option>
              <option value="faculty">Faculty Only</option>
            </Select>
            <Input label="Category (Optional)" placeholder="General, Academic, etc." {...register('category')} />
          </div>
          <div className="form-group">
            <label className="flex items-center gap-2">
              <input type="checkbox" {...register('is_pinned')} className="rounded" />
              <span className="text-sm text-slate-700">Pin this announcement</span>
            </label>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setModal({ open: false, editing: null })}>Cancel</Button>
            <Button type="submit" loading={saving}>{modal.editing ? 'Update' : 'Post'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        message={`Are you sure you want to delete "${deleting?.title}"?`}
      />
    </div>
  );
}