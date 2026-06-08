import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { getUsers, createUser, deleteUser, updateUser } from '../../api/usersApi';
import type { UserRole } from '../../types/user';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';

export default function ManageUsers() {
  const { data: users, loading, refetch } = useApi(() => getUsers(), []);
  const [showModal, setShowModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [form, setForm] = useState({ id: '', name: '', phone: '', password: '1234', role: 'student' as UserRole });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser(form);
      setShowModal(false);
      setForm({ id: '', name: '', phone: '', password: '1234', role: 'student' });
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to create user');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Delete user ${id}?`)) return;
    await deleteUser(id);
    refetch();
  };

  const handleResetPassword = async (id: string) => {
    const newPass = prompt('Enter new password:', '1234');
    if (!newPass) return;
    await updateUser(id, { password: newPass });
    alert('Password reset successfully');
  };

  const filtered = roleFilter ? users?.filter((u) => u.role === roleFilter) : users;

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Manage Users</h1>
        <div className="flex gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Roles</option>
            <option value="teacher">Teachers</option>
            <option value="student">Students</option>
          </select>
          <Button onClick={() => setShowModal(true)}>Add User</Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered?.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs">{u.id}</td>
                  <td className="px-4 py-3 font-medium">{u.name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      u.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.phone || '-'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button
                      onClick={() => handleResetPassword(u.id)}
                      className="text-primary hover:underline text-xs"
                    >
                      Reset PW
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-red-500 hover:underline text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add New User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <input
              type="text"
              value={form.id}
              onChange={(e) => setForm({ ...form, id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="text"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5"
              required
            />
          </div>
          <Button type="submit" className="w-full">Create User</Button>
        </form>
      </Modal>
    </div>
  );
}
