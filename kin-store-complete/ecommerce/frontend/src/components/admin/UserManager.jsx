// frontend/src/components/admin/UserManager.jsx
import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert, UserX, UserCheck, Loader2, Search } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const ROLE_CONFIG = {
  customer: { label: 'Customer', icon: Shield, color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
  inventory_manager: { label: 'Inv. Manager', icon: ShieldCheck, color: 'text-kin-600 bg-kin-50 dark:bg-kin-900/20' },
  super_admin: { label: 'Super Admin', icon: ShieldAlert, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
};

export default function UserManager() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users?limit=100');
      setUsers(res.data.data.users);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const changeRole = async (userId, newRole) => {
    setUpdating(userId);
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      toast.success('Role updated!');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(null); }
  };

  const toggleStatus = async (userId) => {
    setUpdating(userId + '_status');
    try {
      await api.patch(`/users/${userId}/toggle`);
      toast.success('Status updated');
      fetchUsers();
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-bold">User Management</h2>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search users…"
            className="pl-8 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-kin-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-kin-500" size={32} /></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                {['User', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
              {filtered.map(u => {
                const roleConf = ROLE_CONFIG[u.role] || ROLE_CONFIG.customer;
                const RoleIcon = roleConf.icon;
                const isSelf = u._id === me?._id;

                return (
                  <tr key={u._id} className={`transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/30 ${!u.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{u.name} {isSelf && <span className="text-xs text-gray-400">(you)</span>}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${roleConf.color}`}>
                        <RoleIcon size={11} />
                        {roleConf.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${u.isActive ? 'text-green-500' : 'text-red-400'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('en-BD', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!isSelf && (
                          <>
                            <select
                              value={u.role}
                              onChange={e => changeRole(u._id, e.target.value)}
                              disabled={updating === u._id}
                              className="text-xs py-1 px-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-kin-500"
                            >
                              <option value="customer">Customer</option>
                              <option value="inventory_manager">Inv. Manager</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                            <button
                              onClick={() => toggleStatus(u._id)}
                              disabled={updating === u._id + '_status'}
                              className={`p-1.5 rounded-lg transition-colors ${u.isActive ? 'text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'}`}
                              title={u.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {updating === u._id + '_status' ? <Loader2 size={13} className="animate-spin" /> : u.isActive ? <UserX size={13} /> : <UserCheck size={13} />}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-sm text-gray-400">No users found</div>
          )}
        </div>
      )}
    </div>
  );
}
