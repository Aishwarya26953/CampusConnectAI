import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { GraduationCap, User, Mail, Lock, Phone, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { authService, departmentService } from '../../services';
import toast from 'react-hot-toast';

export default function Register() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [success, setSuccess] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { role: 'student' } });
  const role = watch('role');

  useEffect(() => {
    departmentService.list().then(res => setDepartments(res.data)).catch(() => {});
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authService.register({
        ...data,
        department_id: data.department_id ? parseInt(data.department_id) : null,
        semester: data.semester ? parseInt(data.semester) : null,
      });
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-6">
        <motion.div
          className="card p-10 max-w-md w-full text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Registration Successful!</h2>
          <p className="text-slate-500 mb-6">
            Your account is <strong>pending admin approval</strong>. You'll be able to login once your account has been approved.
          </p>
          <Link to="/login" className="btn-primary w-full justify-center">Go to Login</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-6">
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="text-slate-500 text-sm mt-1">Join CampusConnect AI today</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Role Selection */}
            <div className="form-group">
              <label className="label">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {['student', 'faculty'].map((r) => (
                  <label
                    key={r}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      role === r ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-primary-200'
                    }`}
                  >
                    <input type="radio" value={r} className="hidden" {...register('role')} />
                    <span className="capitalize font-medium text-sm">{r === 'student' ? '🎓 Student' : '👨‍🏫 Faculty'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Full Name */}
              <div className="form-group">
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Dr. John Smith"
                    className={`input pl-10 ${errors.name ? 'input-error' : ''}`}
                    {...register('name', { required: 'Full name is required', minLength: { value: 2, message: 'Name too short' } })}
                  />
                </div>
                {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="label">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="you@campusconnect.edu"
                    className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
                    {...register('email', { required: 'Email is required' })}
                  />
                </div>
                {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                    {...register('password', { required: 'Password required', minLength: { value: 6, message: 'Minimum 6 characters' } })}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
              </div>

              {/* Phone */}
              <div className="form-group">
                <label className="label">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" placeholder="+91-9000000000" className="input pl-10" {...register('phone')} />
                </div>
              </div>

              {/* Department */}
              <div className="form-group">
                <label className="label">Department</label>
                <select className={`input ${errors.department_id ? 'input-error' : ''}`} {...register('department_id', { required: 'Please select a department' })}>
                  <option value="">Select Department</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                {errors.department_id && <p className="text-xs text-danger mt-1">{errors.department_id.message}</p>}
              </div>

              {/* Role-specific */}
              {role === 'student' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label className="label">Student ID</label>
                    <input type="text" placeholder="STU2025001" className="input" {...register('student_id')} />
                  </div>
                  <div className="form-group">
                    <label className="label">Semester</label>
                    <select className="input" {...register('semester')}>
                      <option value="">Select</option>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {role === 'faculty' && (
                <div className="form-group">
                  <label className="label">Faculty ID</label>
                  <input type="text" placeholder="FAC2025001" className="input" {...register('faculty_id')} />
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-4">
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          ⚠️ New accounts require admin approval before login
        </p>
      </motion.div>
    </div>
  );
}
