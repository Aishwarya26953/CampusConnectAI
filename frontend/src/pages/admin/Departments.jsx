import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import { departmentService } from '../../services';
import { Button, Modal, Input, Textarea, PageHeader, EmptyState, SkeletonCard, ConfirmDialog } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => { fetchDepts(); }, []);

  const fetchDepts = async () => {
    try {
      const res = await departmentService.list();
      setDepartments(res.data);
    } catch { toast.error('Failed to load departments'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { reset({}); setModal({ open: true, editing: null }); };
  const openEdit = (dept) => {
    reset({ name: dept.name, code: dept.code, description: dept.description });
    setModal({ open: true, editing: dept });
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      if (modal.editing) {
        await departmentService.update(modal.editing.id, data);
        toast.success('Department updated');
      } else {
        await departmentService.create(data);
        toast.success('Department created');
      }
      setModal({ open: false, editing: null });
      fetchDepts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await departmentService.delete(deleting.id);
      toast.success(`Department "${deleting.name}" deleted`);
      setDeleting(null);
      fetchDepts();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Departments" subtitle={`${departments.length} departments in the system`}>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add Department</Button>
      </PageHeader>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} lines={3} />)}
        </div>
      ) : departments.length === 0 ? (
        <div className="card"><EmptyState icon={Building2} title="No departments" action={<Button onClick={openCreate}>Create First Department</Button>} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept, i) => (
            <div key={dept.id} className="card p-5 card-hover group">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-700 font-bold text-sm mb-3">
                  {dept.code.slice(0, 2)}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(dept)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => setDeleting(dept)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <h3 className="font-semibold text-slate-800">{dept.name}</h3>
              <p className="text-xs text-primary-600 font-medium mt-0.5">{dept.code}</p>
              {dept.description && <p className="text-xs text-slate-500 mt-2 line-clamp-2">{dept.description}</p>}
              <p className="text-[10px] text-slate-400 mt-3">Created {format(new Date(dept.created_at), 'MMM dd, yyyy')}</p>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, editing: null })}
        title={modal.editing ? 'Edit Department' : 'Add Department'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Department Name" placeholder="Computer Science & Engineering" error={errors.name?.message}
            {...register('name', { required: 'Name is required' })} />
          <Input label="Department Code" placeholder="CSE" error={errors.code?.message}
            {...register('code', { required: 'Code is required' })} />
          <Textarea label="Description (Optional)" placeholder="Brief description of the department..." {...register('description')} />
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
        title="Delete Department"
        message={`Are you sure you want to delete "${deleting?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
