import { useState, useEffect } from 'react';
import { User, Mail, Phone, Building2, Save } from 'lucide-react';
import { authService, departmentService } from '../../services';
import { Button, Card, Input } from '../../components/ui';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

export default function FacultyProfile() {
  const [user, setUser] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    fetchProfile();
    departmentService.list().then(res => setDepartments(res.data)).catch(() => {});
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authService.getMe();
      setUser(res.data);
      reset({
        name: res.data.name,
        phone: res.data.phone || '',
        address: res.data.address || '',
        department_id: res.data.department_id || '',
      });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const res = await authService.updateProfile(data);
      setUser(res.data);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Update failed');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account settings</p>
      </div>

      <Card>
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
            <p className="text-sm text-slate-500 capitalize">{user?.role} • {user?.email}</p>
            <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${user?.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
              {user?.status}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input pl-10" {...register('name', { required: 'Name is required' })} />
              </div>
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
            </div>

            <div className="form-group">
              <label className="label">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input pl-10 bg-slate-50" value={user?.email} disabled />
              </div>
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>

            <div className="form-group">
              <label className="label">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input className="input pl-10" placeholder="+91-9000000000" {...register('phone')} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Department</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select className="input pl-10" {...register('department_id')}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Address</label>
            <textarea className="input resize-none" rows={3} placeholder="Your address..." {...register('address')} />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <Button type="submit" loading={saving}><Save className="w-4 h-4" /> Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}