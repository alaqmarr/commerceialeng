'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Edit, Plus, CheckCircle, Loader } from 'lucide-react';

export function AdminUserManager() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ id: '', name: '', email: '', password: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const url = isEditing ? `/api/admin/users/${formData.id}` : '/api/admin/users';
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save user');
      
      setFormData({ id: '', name: '', email: '', password: '' });
      setIsEditing(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      fetchUsers();
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500"><Loader className="w-6 h-6 animate-spin mx-auto mb-2" />Loading users...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase text-gray-900 tracking-tight">Admin Users</h1>
          <p className="text-xs text-gray-600 mt-1">Manage access to the admin dashboard.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-4">{isEditing ? 'Edit User' : 'Add New User'}</h3>
        {error && <div className="p-3 mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" required disabled={isEditing} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500 disabled:bg-gray-100" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Password {isEditing && '(leave blank to keep current)'}</label>
            <input type="password" required={!isEditing} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full text-sm border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500" />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            {isEditing && <button type="button" onClick={() => { setIsEditing(false); setFormData({ id: '', name: '', email: '', password: '' }); }} className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>}
            <button type="submit" disabled={saving} className="px-4 py-2 text-xs font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2">
              {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : (isEditing ? <CheckCircle className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />)}
              {isEditing ? 'Update User' : 'Add User'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-sm">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{u.name || '-'}</td>
                <td className="px-4 py-3 text-gray-600">{u.email}</td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setIsEditing(true); setFormData({ id: u.id, name: u.name || '', email: u.email, password: '' }); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(u.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
