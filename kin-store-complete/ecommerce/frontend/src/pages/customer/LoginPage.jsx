// frontend/src/pages/customer/LoginPage.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const user = await login(form.email, form.password);
        toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
        navigate(['inventory_manager','super_admin'].includes(user.role) ? '/admin' : '/');
      } else {
        await register(form.name, form.email, form.password, form.phone);
        toast.success('Account created!');
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-kin-500 transition-all";

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-gray-100">
            {mode === 'login' ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-sm text-gray-400 mt-1.5">
            {mode === 'login' ? "Don't have an account? " : 'Already have one? '}
            <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-kin-600 dark:text-kin-400 font-semibold hover:underline">
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <input name="name" value={form.name} onChange={handle} required
                placeholder="Full name" className={inputClass} />
            )}
            <input name="email" type="email" value={form.email} onChange={handle} required
              placeholder="Email address" className={inputClass} />
            {mode === 'register' && (
              <input name="phone" type="tel" value={form.phone} onChange={handle}
                placeholder="Phone (optional)" className={inputClass} />
            )}
            <input name="password" type="password" value={form.password} onChange={handle} required
              placeholder="Password" minLength={6} className={inputClass} />
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-kin-700 hover:bg-kin-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-md shadow-kin-200/50 dark:shadow-none">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
