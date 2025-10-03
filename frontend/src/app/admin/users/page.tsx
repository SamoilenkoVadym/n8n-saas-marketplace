'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Edit, Ban, Check, Shield, User as UserIcon } from 'lucide-react';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  credits: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateCredits = async (userId: string, credits: number) => {
    const newCredits = prompt(`Enter new credit amount for user:`, credits.toString());
    if (newCredits === null) return;

    try {
      await api.patch(`/api/admin/users/${userId}/credits`, { credits: parseInt(newCredits) });
      await fetchUsers();
    } catch (error) {
      alert('Failed to update credits');
    }
  };

  if (loading) {
    return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-20 bg-card rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage users, roles, and credits</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-gradient flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Create User
        </button>
      </div>

      <div className="card-premium overflow-hidden">
        <table className="w-full">
          <thead className="bg-accent/50">
            <tr className="text-left text-sm">
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Credits</th>
              <th className="p-4 font-semibold">Joined</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-accent/30 transition-colors">
                <td className="p-4">
                  <div>
                    <p className="font-medium">{user.name || 'No name'}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin'
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => updateCredits(user.id, user.credits)}
                    className="text-primary hover:underline font-medium"
                  >
                    {user.credits} credits
                  </button>
                </td>
                <td className="p-4 text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-accent rounded-lg" title="Edit role">
                      <Shield className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-destructive/10 text-destructive rounded-lg" title="Ban user">
                      <Ban className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && <CreateUserModal onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); fetchUsers(); }} />}
    </div>
  );
}

function CreateUserModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({ email: '', password: '', name: '', role: 'user', credits: 50 });
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/api/admin/users', formData);
      onSuccess();
    } catch (error) {
      alert('Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl max-w-md w-full shadow-xl">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-bold">Create New User</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email *</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password *</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Initial Credits</label>
            <input type="number" value={formData.credits} onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})} className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={creating} className="px-4 py-2 border border-border rounded-lg hover:bg-accent">Cancel</button>
            <button type="submit" disabled={creating} className="btn-gradient px-6 py-2">{creating ? 'Creating...' : 'Create User'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
