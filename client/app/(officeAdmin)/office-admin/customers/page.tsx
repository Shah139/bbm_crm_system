'use client';

import React, { useState, useMemo } from 'react';
import { Users, Search, Edit2, Save, X, FileText } from 'lucide-react';
import Toast from '@/components/Toast';

interface Customer {
  id: number;
  name: string;
  phone: string;
  interest: string;
  status: 'Interested' | 'Not Interested' | 'Follow-up';
  notes: string;
}

// Mock data generator
const generateMockCustomers = (): Customer[] => {
  const interests = ['Electronics', 'Furniture', 'Clothing', 'Home & Garden', 'Sports', 'Beauty'];
  const statuses: ('Interested' | 'Not Interested' | 'Follow-up')[] = ['Interested', 'Not Interested', 'Follow-up'];
  const customers: Customer[] = [];

  for (let i = 1; i <= 50; i++) {
    customers.push({
      id: i,
      name: `Customer ${i}`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      interest: interests[Math.floor(Math.random() * interests.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      notes: `Notes for customer ${i}. ${Math.random() > 0.5 ? 'Customer showed interest in our products.' : ''}`,
    });
  }

  return customers;
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Interested':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'Follow-up':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'Not Interested':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
};

const getStatusBgColor = (status: string): string => {
  switch (status) {
    case 'Interested':
      return 'bg-emerald-100 border-emerald-300 text-emerald-900';
    case 'Follow-up':
      return 'bg-amber-100 border-amber-300 text-amber-900';
    case 'Not Interested':
      return 'bg-rose-100 border-rose-300 text-rose-900';
    default:
      return 'bg-slate-100 border-slate-300 text-slate-900';
  }
};

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>(generateMockCustomers());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [key: number]: string }>({});
  const [notesModalId, setNotesModalId] = useState<number | null>(null);
  const [notesModalContent, setNotesModalContent] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'status'>('name');

  // Filter and sort customers
  const filteredCustomers = useMemo(() => {
    let filtered = customers.filter((customer) => {
      const searchMatch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.interest.toLowerCase().includes(searchQuery.toLowerCase());

      const statusMatch = filterStatus === 'all' || customer.status === filterStatus;

      return searchMatch && statusMatch;
    });

    if (sortBy === 'status') {
      const statusOrder = { 'Follow-up': 0, 'Interested': 1, 'Not Interested': 2 };
      filtered.sort(
        (a, b) => statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
      );
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [customers, searchQuery, filterStatus, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const interested = customers.filter((c) => c.status === 'Interested').length;
    const followUp = customers.filter((c) => c.status === 'Follow-up').length;
    const notInterested = customers.filter((c) => c.status === 'Not Interested').length;

    return { interested, followUp, notInterested, total: customers.length };
  }, [customers]);

  const handleStatusChange = (id: number, newStatus: 'Interested' | 'Not Interested' | 'Follow-up') => {
    setCustomers(
      customers.map((customer) =>
        customer.id === id ? { ...customer, status: newStatus } : customer
      )
    );
  };

  const handleNotesChange = (id: number, newNotes: string) => {
    setEditingNotes({ ...editingNotes, [id]: newNotes });
  };

  const handleSaveNotes = (id: number) => {
    if (editingNotes[id] !== undefined) {
      setCustomers(
        customers.map((customer) =>
          customer.id === id ? { ...customer, notes: editingNotes[id] } : customer
        )
      );
      const { [id]: _, ...rest } = editingNotes;
      setEditingNotes(rest);
      setToastMessage('Notes saved successfully!');
      setShowToast(true);
    }
  };

  const handleOpenNotesModal = (customer: Customer) => {
    setNotesModalId(customer.id);
    setNotesModalContent(editingNotes[customer.id] !== undefined ? editingNotes[customer.id] : customer.notes);
  };

  const handleSaveModalNotes = () => {
    if (notesModalId !== null) {
      handleNotesChange(notesModalId, notesModalContent);
      handleSaveNotes(notesModalId);
      setNotesModalId(null);
      setNotesModalContent('');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Customer List</h1>
          <p className="text-slate-600 text-lg">Manage customer information and follow-up status</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {/* Total Customers */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Total Customers</p>
                <p className="text-4xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Interested */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Interested</p>
                <p className="text-4xl font-bold text-emerald-600">{stats.interested}</p>
                <p className="text-xs text-slate-400 mt-2">{((stats.interested / stats.total) * 100).toFixed(0)}% of total</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                <Users className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* Follow-up */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Follow-up</p>
                <p className="text-4xl font-bold text-amber-600">{stats.followUp}</p>
                <p className="text-xs text-slate-400 mt-2">{((stats.followUp / stats.total) * 100).toFixed(0)}% of total</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
                <Users className="w-8 h-8 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Not Interested */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Not Interested</p>
                <p className="text-4xl font-bold text-rose-600">{stats.notInterested}</p>
                <p className="text-xs text-slate-400 mt-2">{((stats.notInterested / stats.total) * 100).toFixed(0)}% of total</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl">
                <Users className="w-8 h-8 text-rose-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Search</label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Name, phone, or interest..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-white text-slate-900 font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="Interested">Interested</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Not Interested">Not Interested</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'status')}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-white text-slate-900 font-medium"
              >
                <option value="name">Name (A-Z)</option>
                <option value="status">Status (Priority)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Table Header */}
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">
              Customers ({filteredCustomers.length})
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Customer Name</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Phone</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Interest</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Status</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer, idx) => (
                    <tr
                      key={customer.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition ${
                        idx === filteredCustomers.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="px-8 py-5 text-sm font-semibold text-slate-900">
                        {customer.name}
                      </td>

                      {/* Phone */}
                      <td className="px-8 py-5 text-sm text-slate-600 font-medium">
                        {customer.phone}
                      </td>

                      {/* Interest */}
                      <td className="px-8 py-5 text-sm">
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                          {customer.interest}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-8 py-5 text-sm">
                        <select
                          value={customer.status}
                          onChange={(e) =>
                            handleStatusChange(customer.id, e.target.value as 'Interested' | 'Not Interested' | 'Follow-up')
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 focus:outline-none focus:ring-2 focus:ring-slate-900 transition cursor-pointer ${getStatusBgColor(customer.status)}`}
                        >
                          <option value="Interested">Interested</option>
                          <option value="Follow-up">Follow-up</option>
                          <option value="Not Interested">Not Interested</option>
                        </select>
                      </td>

                      {/* Notes */}
                      <td className="px-8 py-5 text-sm">
                        <button
                          onClick={() => handleOpenNotesModal(customer)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-semibold text-xs border border-slate-300"
                        >
                          <FileText size={16} />
                          Edit Notes
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-slate-500">
                      No customers found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Notes Modal */}
      {notesModalId !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setNotesModalId(null)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between border-b border-blue-500 rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold text-white">Edit Notes</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {customers.find((c) => c.id === notesModalId)?.name}
                </p>
              </div>
              <button
                onClick={() => setNotesModalId(null)}
                className="p-2 hover:bg-blue-500 rounded-lg transition text-white"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <label className="block text-sm font-bold text-slate-900 mb-4">Notes</label>
              <textarea
                value={notesModalContent}
                onChange={(e) => setNotesModalContent(e.target.value)}
                placeholder="Add or edit customer notes..."
                rows={6}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition resize-none text-slate-900 font-medium"
              />
              <p className="text-xs text-slate-400 mt-2">{notesModalContent.length} characters</p>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setNotesModalId(null)}
                  className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModalNotes}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-bold flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  );
}