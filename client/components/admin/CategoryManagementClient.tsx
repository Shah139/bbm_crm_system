'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import Toast from '@/components/Toast';

interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export default function CategoryManagementClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    name: '',
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const show = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  const fetchCategories = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      const res = await fetch(`${baseUrl}/api/user/categories?ts=${Date.now()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store'
        }
      );
      if (!res.ok) throw new Error('ক্যাটাগরি লোড করতে ব্যর্থ হয়েছে');
      const data = await res.json();
      const cats: Category[] = (data.categories || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        createdAt: c.createdAt,
      }));
      setCategories(cats);
    } catch (e: any) {
      show(e.message || 'ক্যাটাগরি লোড করতে সমস্যা হয়েছে');
    }
  };

  useEffect(() => {
    fetchCategories();

  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = formData.name.trim();
    if (!name) {
      return show('অনুগ্রহ করে একটি ক্যাটাগরির নাম লিখুন');
    }

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return show('অনুগ্রহ করে লগইন করুন');

      if (editingId) {
        const res = await fetch(`${baseUrl}/api/user/categories/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `ক্যাটাগরি আপডেট করতে ব্যর্থ হয়েছে (স্ট্যাটাস ${res.status})`);
        }
        const data = await res.json().catch(() => ({} as any));
        const updated = (data?.category as any) || { id: editingId, name };

        setCategories((prev) => prev.map((c) => (c.id === updated.id ? { ...c, name: updated.name, createdAt: (updated as any).createdAt || c.createdAt } : c)));
        show(`ক্যাটাগরি "${name}" সফলভাবে আপডেট হয়েছে!`);
        setEditingId(null);
      } else {
        const res = await fetch(`${baseUrl}/api/user/create-categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `ক্যাটাগরি যোগ করতে ব্যর্থ হয়েছে (স্ট্যাটাস ${res.status})`);
        }
        const data = await res.json().catch(() => ({} as any));
        const created = (data?.category as any) || null;

        if (created) {
          setCategories((prev) => [{ id: created.id, name: created.name, createdAt: created.createdAt }, ...prev]);
        }
        show(`ক্যাটাগরি "${name}" সফলভাবে যোগ হয়েছে!`);
      }

      setFormData({ name: '' });
      setIsModalOpen(false);

      fetchCategories();
    } catch (err: any) {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.message) return show(parsed.message);
      } catch (_) {}
      return show(err.message || 'ক্যাটাগরি সংরক্ষণ করতে সমস্যা হয়েছে');
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingId(category.id);
    setFormData({ name: category.name });
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return show('অনুগ্রহ করে লগইন করুন');
    try {
      const res = await fetch(`${baseUrl}/api/user/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`ক্যাটাগরি মুছতে ব্যর্থ হয়েছে (স্ট্যাটাস ${res.status})`);

      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteConfirmId(null);
      show('ক্যাটাগরি সফলভাবে মুছে ফেলা হয়েছে!');

      fetchCategories();
    } catch (e: any) {
      show(e.message || 'ক্যাটাগরি মুছতে সমস্যা হয়েছে');
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '' });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ক্যাটাগরি ম্যানেজমেন্ট</h1>
            <p className="text-gray-600">আপনার প্রোডাক্টের ক্যাটাগরি সমূহ ম্যানেজ করুন</p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            নতুন ক্যাটাগরি যোগ করুন
          </button>
        </div>

        <div className="bg-white  rounded-lg shadow p-6 mb-8">
          <input
            type="text"
            placeholder="ক্যাটাগরি খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              ক্যাটাগরি ({filteredCategories.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ক্যাটাগরির নাম</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">তৈরির তারিখ</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{category.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(category.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit category"
                          >
                            <Edit2 size={18} />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() => setDeleteConfirmId(deleteConfirmId === category.id ? null : category.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete category"
                            >
                              <Trash2 size={18} />
                            </button>
                            {deleteConfirmId === category.id && (
                              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 whitespace-nowrap">
                                <p className="text-sm font-medium text-gray-900 mb-2">এই ক্যাটাগরিটি মুছবেন?</p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                                  >
                                    মুছুন
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirmId(null)}
                                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                                  >
                                    বাতিল
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                      {searchQuery ? 'আপনার অনুসন্ধানের সাথে মিলিয়ে কোন ক্যাটাগরি পাওয়া যায়নি' : 'এখনও কোন ক্যাটাগরি নেই। শুরু করতে একটি ক্যাটাগরি তৈরি করুন!'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-opacity-50" onClick={() => setIsModalOpen(false)}>
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close modal">
              <X className="w-5 h-5 text-gray-500" />
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {editingId !== null ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি যোগ করুন'}
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              {editingId !== null ? 'নিচে ক্যাটাগরির তথ্য আপডেট করুন' : 'নিচে ক্যাটাগরির নাম লিখুন'}
            </p>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ক্যাটাগরির নাম</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., PACKAGING MACHINERIES"
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  {editingId !== null ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} duration={3000} />
    </div>
  );
}


