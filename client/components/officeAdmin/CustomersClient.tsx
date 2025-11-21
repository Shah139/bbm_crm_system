'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Users, Search, Save, X, FileText, Eye, EyeOff, Trash2 } from 'lucide-react';
import Toast from '@/components/Toast';

interface Customer {
  id: string;
  name: string;
  phone: string;
  interest: string;
  status: 'Interested' | 'Not Interested' | 'Follow-up';
  notes: string;
  visitCount?: number;
  email?: string;
  division?: string;
  zila?: string;
  interestLevel?: number;
  customerType?: string;
  businessName?: string;
  quotation?: string;
  rememberDate?: string;
  sellNote?: string;
  createdAt?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface CustomersClientProps {
  showDelete?: boolean;
  editableDetails?: boolean;
}

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Interested':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'Follow-up':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'Not Interested':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    default:
      return 'bg-slate-100 border-slate-300 text-slate-900';
  }
};

export default function CustomersClient({ showDelete, editableDetails }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{ [key: string]: string }>({});
  const [notesModalId, setNotesModalId] = useState<string | null>(null);
  const [notesModalContent, setNotesModalContent] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [sortBy, setSortBy] = useState<'dateDesc' | 'name' | 'status' | 'visitDesc' | 'visitAsc'>('dateDesc');
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [detailsOpen, setDetailsOpen] = useState<Record<string, boolean>>({});
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const normalizePhone = (p: string): string => {
    const digits = (p || '').replace(/\D+/g, '');
    if (digits.length >= 10) return digits.slice(-10);
    return digits;
  };

  const handleSaveDetails = async (customer: Customer) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${baseUrl}/api/user/showroom/customers/${customer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: customer.email,
          division: customer.division,
          upazila: customer.zila,
          interestLevel: customer.interestLevel,
          customerType: customer.customerType,
          businessName: customer.businessName,
          quotation: customer.quotation,
          rememberDate: customer.rememberDate,
          sellNote: customer.sellNote,
        }),
      });

      if (!res.ok) throw new Error('Failed to update details');
      await res.json();
      setToastMessage('Details updated successfully');
      setShowToast(true);
    } catch (e: any) {
      setToastMessage(e?.message || 'Failed to update details');
      setShowToast(true);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    const prev = customers;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(`${baseUrl}/api/user/showroom/customers/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Failed to delete customer');
      setCustomers((cur) => cur.filter((c) => c.id !== id));
      setDeleteConfirmId(null);
      setToastMessage('Customer deleted successfully');
      setShowToast(true);
    } catch (e: any) {
      setCustomers(prev);
      setToastMessage(e?.message || 'Failed to delete customer');
      setShowToast(true);
    }
  };

  const maskPhone = (p: string) => {
    const digits = (p || '').replace(/\D+/g, '');
    if (!digits) return '••••••••••';
    const last2 = digits.slice(-2);
    return `••••••••••${last2}`;
  };

  useEffect(() => {
    const load = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) return;
        const url = new URL(`${baseUrl}/api/user/showroom/customers`);
        url.searchParams.set('limit', '1000');
        url.searchParams.set('ts', String(Date.now()));
        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });
        if (res.status === 401) {
          try { await fetch(`${baseUrl}/api/user/logout`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }); } catch {}
          if (typeof window !== 'undefined') localStorage.removeItem('token');
          return;
        }
        if (!res.ok) throw new Error('Failed to load customers');
        const data = await res.json();
        const mapped: Customer[] = (data.customers || []).map((c: any) => ({
          id: String(c.id || c._id),
          name: c.customerName,
          phone: c.phoneNumber,
          interest: c.category,
          status: (c.status as any) || 'Interested',
          notes: (c.notes as any) || '',
          email: c.email || '',
          division: c.division || '',
          zila: c.upazila || '',
          interestLevel: typeof c.interestLevel === 'number' ? c.interestLevel : undefined,
          customerType: c.customerType || '',
          businessName: c.businessName || '',
          quotation: c.quotation || '',
          rememberDate: c.rememberDate || '',
          sellNote: c.sellNote || '',
          createdAt: c.createdAt || '',
        }));

        // Compute visit count per normalized phone across all loaded customers
        const visitCounts = new Map<string, number>();
        mapped.forEach((cust) => {
          const key = normalizePhone(cust.phone);
          if (!key) return;
          visitCounts.set(key, (visitCounts.get(key) || 0) + 1);
        });

        const withCounts = mapped.map((cust) => {
          const key = normalizePhone(cust.phone);
          const count = key ? visitCounts.get(key) || 0 : 0;
          return { ...cust, visitCount: count };
        });

        setCustomers(withCounts);
      } catch (e: any) {
        setToastMessage(e?.message || 'Failed to load');
        setShowToast(true);
      }
    };
    load();
  }, []);

  const filteredCustomers = useMemo(() => {
    // Precompute date anchors
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const msPerDay = 24 * 60 * 60 * 1000;

    const fromDate = customFrom ? new Date(customFrom) : null;
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
    const toDate = customTo ? new Date(customTo) : null;
    if (toDate) toDate.setHours(0, 0, 0, 0);

    let filtered = customers.filter((customer) => {
      const searchMatch =
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        customer.interest.toLowerCase().includes(searchQuery.toLowerCase());

      const statusMatch = filterStatus === 'all' || customer.status === filterStatus;

      if (!searchMatch || !statusMatch) return false;

      // Date filter based on createdAt
      if (dateFilter !== 'all') {
        if (!customer.createdAt) return false;
        const created = new Date(customer.createdAt);
        if (isNaN(created.getTime())) return false;
        created.setHours(0, 0, 0, 0);

        if (dateFilter === 'today') {
          if (created.getTime() !== today.getTime()) return false;
        } else if (dateFilter === 'week') {
          const diffDays = Math.floor((today.getTime() - created.getTime()) / msPerDay);
          // last 7 days including today
          if (diffDays < 0 || diffDays > 6) return false;
        } else if (dateFilter === 'month') {
          const diffDays = Math.floor((today.getTime() - created.getTime()) / msPerDay);
          if (diffDays < 0 || diffDays > 29) return false;
        } else if (dateFilter === 'custom') {
          if (fromDate && created < fromDate) return false;
          if (toDate && created > toDate) return false;
        }
      }

      return true;
    });

    // Sorting
    if (sortBy === 'status') {
      const statusOrder = { 'Follow-up': 0, 'Interested': 1, 'Not Interested': 2 };
      filtered.sort(
        (a, b) => statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder]
      );
    } else if (sortBy === 'visitDesc' || sortBy === 'visitAsc') {
      filtered.sort((a, b) => {
        const av = a.visitCount || 0;
        const bv = b.visitCount || 0;
        return sortBy === 'visitAsc' ? av - bv : bv - av;
      });
    } else if (sortBy === 'dateDesc') {
      filtered.sort((a, b) => {
        const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bt - at;
      });
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [customers, searchQuery, filterStatus, sortBy, dateFilter, customFrom, customTo]);

  const stats = useMemo(() => {
    const interested = customers.filter((c) => c.status === 'Interested').length;
    const followUp = customers.filter((c) => c.status === 'Follow-up').length;
    const notInterested = customers.filter((c) => c.status === 'Not Interested').length;

    return { interested, followUp, notInterested, total: customers.length };
  }, [customers]);

  const handleStatusChange = async (id: string, newStatus: 'Interested' | 'Not Interested' | 'Follow-up') => {
    const prev = customers;
    const next = customers.map((c) => (c.id === id ? { ...c, status: newStatus } : c));
    setCustomers(next);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`${baseUrl}/api/user/showroom/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setToastMessage('Status updated');
      setShowToast(true);
    } catch (e: any) {
      setCustomers(prev);
      setToastMessage(e?.message || 'Failed to update status');
      setShowToast(true);
    }
  };

  const handleNotesChange = (id: string, newNotes: string) => {
    setEditingNotes({ ...editingNotes, [id]: newNotes });
  };

  const handleSaveNotes = async (id: string, newNotes: string) => {
    const prev = customers;
    const next = customers.map((c) => (c.id === id ? { ...c, notes: newNotes } : c));
    setCustomers(next);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`${baseUrl}/api/user/showroom/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notes: newNotes }),
      });
      if (!res.ok) throw new Error('Failed to save notes');
      const { [id]: _, ...rest } = editingNotes;
      setEditingNotes(rest);
      setToastMessage('Notes saved successfully!');
      setShowToast(true);
    } catch (e: any) {
      setCustomers(prev);
      setToastMessage(e?.message || 'Failed to save notes');
      setShowToast(true);
    }
  };

  const handleOpenNotesModal = async (customer: Customer) => {
    setNotesModalId(customer.id);

    setNotesModalContent(editingNotes[customer.id] !== undefined ? editingNotes[customer.id] : customer.notes);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return;
      const ts = Date.now();
      const res = await fetch(`${baseUrl}/api/user/showroom/customers/${customer.id}?ts=${ts}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (!res.ok) return;
      const data = await res.json();
      const freshNotes = (data?.customer?.notes as string) ?? '';
      setNotesModalContent(freshNotes);

      setCustomers((prev) => prev.map(c => c.id === customer.id ? { ...c, notes: freshNotes } : c));
    } catch {}
  };

  const handleSaveModalNotes = () => {
    if (notesModalId !== null) {
      handleSaveNotes(notesModalId, notesModalContent);
      setNotesModalId(null);
      setNotesModalContent('');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Customer List</h1>
          <p className="text-slate-600 text-lg">Manage customer information and follow-up status</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
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

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-white text-slate-900 font-medium"
              >
                <option value="all">All Status</option>
                <option value="Interested">Interested</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Not Interested">Not Interested</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Sort By</label>
              <select
                value={sortBy === 'dateDesc' ? 'name' : sortBy}
                onChange={(e) =>
                  setSortBy(
                    (e.target.value as 'name' | 'status' | 'visitDesc' | 'visitAsc') || 'name'
                  )
                }
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-white text-slate-900 font-medium"
              >
                <option value="name">Name (A-Z)</option>
                <option value="status">Status (Priority)</option>
                <option value="visitDesc">Visit Count (High to Low)</option>
                <option value="visitAsc">Visit Count (Low to High)</option>
              </select>
            </div>
          </div>
          {/* Date filter row */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Filter by Date</label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-white text-slate-900 font-medium"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week (Last 7 days)</option>
                <option value="month">This Month (Last 30 days)</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateFilter === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">From</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-white text-slate-900 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-3">To</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-white text-slate-900 font-medium"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Customers ({filteredCustomers.length})</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Customer Name</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Phone</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Interest</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Visit Count</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Status</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Actions</th>
                  {showDelete && (
                    <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Delete</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((customer, idx) => (
                    <React.Fragment key={customer.id}>
                      <tr
                        className={`border-b border-slate-100 hover:bg-slate-50 transition ${idx === filteredCustomers.length - 1 && !detailsOpen[customer.id] ? 'border-b-0' : ''}`}
                      >
                        <td className="px-8 py-5 text-sm font-semibold text-slate-900">{customer.name}</td>
                        <td className="px-8 py-5 text-sm text-slate-600 font-medium">
                          <div className="flex items-center gap-2">
                            <span className="font-mono tracking-wide">
                              {revealed[customer.id] ? customer.phone : maskPhone(customer.phone)}
                            </span>
                            <button
                              type="button"
                              onClick={() => setRevealed((prev) => ({ ...prev, [customer.id]: !prev[customer.id] }))}
                              className="p-1.5 rounded hover:bg-slate-100 border border-slate-200"
                              aria-label={revealed[customer.id] ? 'Hide phone' : 'Show phone'}
                              title={revealed[customer.id] ? 'Hide phone' : 'Show phone'}
                            >
                              {revealed[customer.id] ? <EyeOff size={16} className="text-slate-700" /> : <Eye size={16} className="text-slate-700" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-sm">
                          <span className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">{customer.interest}</span>
                        </td>
                        <td className="px-8 py-5 text-sm text-slate-700 font-semibold">
                          {customer.visitCount ?? 0}
                        </td>
                        <td className="px-8 py-5 text-sm">
                          <select
                            value={customer.status}
                            onChange={(e) => handleStatusChange(customer.id, e.target.value as 'Interested' | 'Not Interested' | 'Follow-up')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 focus:outline-none focus:ring-2 focus:ring-slate-900 transition cursor-pointer ${getStatusColor(customer.status)}`}
                          >
                            <option value="Interested">Interested</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Not Interested">Not Interested</option>
                          </select>
                        </td>
                        <td className="px-8 py-5 text-sm">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => handleOpenNotesModal(customer)}
                              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-semibold text-xs border border-slate-300 min-w-[140px]"
                            >
                              <FileText size={16} />
                              Edit Notes
                            </button>
                            <button
                              type="button"
                              onClick={() => setDetailsOpen((prev) => ({ ...prev, [customer.id]: !prev[customer.id] }))}
                              className="inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-black rounded-lg border border-slate-300 hover:bg-slate-100 min-w-[140px]"
                            >
                              {detailsOpen[customer.id] ? 'Hide Details' : 'View Details'}
                            </button>
                          </div>
                        </td>
                        {showDelete && (
                          <td className="px-8 py-5 text-sm">
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmId(customer.id)}
                              className="inline-flex items-center justify-center px-3 py-2 text-xs font-semibold text-red-600 rounded-lg border border-red-200 hover:bg-red-50"
                            >
                              <Trash2 size={16} className="mr-1" />
                              Delete
                            </button>
                          </td>
                        )}
                      </tr>

                      {detailsOpen[customer.id] && (
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <td className="px-8 py-5 text-sm" colSpan={showDelete ? 7 : 6}>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-700">
                              <div>
                                <div className="text-xs font-bold text-slate-500">Email</div>
                                {editableDetails ? (
                                  <input
                                    type="email"
                                    value={customer.email || ''}
                                    onChange={(e) =>
                                      setCustomers((prev) =>
                                        prev.map((c) =>
                                          c.id === customer.id ? { ...c, email: e.target.value } : c
                                        )
                                      )
                                    }
                                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm"
                                  />
                                ) : (
                                  <div className="font-medium break-all">{customer.email || '-'}</div>
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-500">Division</div>
                                {editableDetails ? (
                                  <input
                                    type="text"
                                    value={customer.division || ''}
                                    onChange={(e) =>
                                      setCustomers((prev) =>
                                        prev.map((c) =>
                                          c.id === customer.id ? { ...c, division: e.target.value } : c
                                        )
                                      )
                                    }
                                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm"
                                  />
                                ) : (
                                  <div className="font-medium">{customer.division || '-'}</div>
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-500">Zila</div>
                                {editableDetails ? (
                                  <input
                                    type="text"
                                    value={customer.zila || ''}
                                    onChange={(e) =>
                                      setCustomers((prev) =>
                                        prev.map((c) =>
                                          c.id === customer.id ? { ...c, zila: e.target.value } : c
                                        )
                                      )
                                    }
                                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm"
                                  />
                                ) : (
                                  <div className="font-medium">{customer.zila || '-'}</div>
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-500">Interest Level</div>
                                {editableDetails ? (
                                  <input
                                    type="number"
                                    min={0}
                                    max={5}
                                    value={
                                      typeof customer.interestLevel === 'number'
                                        ? customer.interestLevel
                                        : ''
                                    }
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      const num = val === '' ? undefined : Number(val);
                                      setCustomers((prev) =>
                                        prev.map((c) =>
                                          c.id === customer.id
                                            ? { ...c, interestLevel: num as number | undefined }
                                            : c
                                        )
                                      );
                                    }}
                                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm"
                                  />
                                ) : (
                                  <div className="font-medium">
                                    {typeof customer.interestLevel === 'number'
                                      ? `${customer.interestLevel} / 5`
                                      : '-'}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-500">Customer Type</div>
                                {editableDetails ? (
                                  <input
                                    type="text"
                                    value={customer.customerType || ''}
                                    onChange={(e) =>
                                      setCustomers((prev) =>
                                        prev.map((c) =>
                                          c.id === customer.id
                                            ? { ...c, customerType: e.target.value }
                                            : c
                                        )
                                      )
                                    }
                                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm"
                                  />
                                ) : (
                                  <div className="font-medium">{customer.customerType || '-'}</div>
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-500">Business Name</div>
                                {editableDetails ? (
                                  <input
                                    type="text"
                                    value={customer.businessName || ''}
                                    onChange={(e) =>
                                      setCustomers((prev) =>
                                        prev.map((c) =>
                                          c.id === customer.id
                                            ? { ...c, businessName: e.target.value }
                                            : c
                                        )
                                      )
                                    }
                                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm"
                                  />
                                ) : (
                                  <div className="font-medium">{customer.businessName || '-'}</div>
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-500">Quotation</div>
                                {editableDetails ? (
                                  <input
                                    type="text"
                                    value={customer.quotation || ''}
                                    onChange={(e) =>
                                      setCustomers((prev) =>
                                        prev.map((c) =>
                                          c.id === customer.id
                                            ? { ...c, quotation: e.target.value }
                                            : c
                                        )
                                      )
                                    }
                                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm"
                                  />
                                ) : (
                                  <div className="font-medium">{customer.quotation || '-'}</div>
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-500">Reminder Date</div>
                                {editableDetails ? (
                                  <input
                                    type="date"
                                    value={customer.rememberDate ? new Date(customer.rememberDate).toISOString().slice(0, 10) : ''}
                                    onChange={(e) =>
                                      setCustomers((prev) =>
                                        prev.map((c) =>
                                          c.id === customer.id
                                            ? { ...c, rememberDate: e.target.value }
                                            : c
                                        )
                                      )
                                    }
                                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm"
                                  />
                                ) : (
                                  <div className="font-medium">
                                    {customer.rememberDate
                                      ? new Date(customer.rememberDate).toISOString().slice(0, 10)
                                      : '-'}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-500">Sell Note / Bill No</div>
                                {editableDetails ? (
                                  <textarea
                                    value={customer.sellNote || ''}
                                    onChange={(e) =>
                                      setCustomers((prev) =>
                                        prev.map((c) =>
                                          c.id === customer.id
                                            ? { ...c, sellNote: e.target.value }
                                            : c
                                        )
                                      )
                                    }
                                    className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm min-h-[60px]"
                                  />
                                ) : (
                                  <div className="font-medium">{customer.sellNote || '-'}</div>
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-500">Visit Dates</div>
                                <div className="font-medium">
                                  {(() => {
                                    const key = normalizePhone(customer.phone);
                                    if (!key) return '-';
                                    const dates = customers
                                      .filter((c) => normalizePhone(c.phone) === key && c.createdAt)
                                      .map((c) => {
                                        const d = new Date(c.createdAt as string);
                                        return isNaN(d.getTime())
                                          ? String(c.createdAt)
                                          : d.toISOString().slice(0, 10);
                                      });
                                    if (!dates.length) return '-';
                                    const unique = Array.from(new Set(dates));
                                    return unique.map((d, idx) => `${idx + 1}. ${d}`).join(' | ');
                                  })()}
                                </div>
                              </div>
                            </div>
                            {editableDetails && (
                              <div className="mt-6 flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setDetailsOpen((prev) => ({ ...prev, [customer.id]: false }))}
                                  className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 text-sm font-semibold"
                                >
                                  Close
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveDetails(customer)}
                                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-semibold"
                                >
                                  Save Details
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}

                      {showDelete && deleteConfirmId === customer.id && (
                        <tr className="bg-red-50 border-b border-red-100">
                          <td className="px-8 py-4 text-sm" colSpan={7}>
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-red-700 font-medium">
                                Are you sure you want to delete "{customer.name}"?
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-4 py-2 bg-white text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-100 text-sm font-semibold"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleDeleteConfirm(customer.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-semibold"
                                >
                                  Yes, Delete
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={showDelete ? 7 : 6}
                      className="px-8 py-12 text-center text-slate-500"
                    >
                      No customers found matching your search criteria
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {notesModalId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setNotesModalId(null)}>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 flex items-center justify-between border-b border-blue-500 rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold text-white">Edit Notes</h2>
                <p className="text-blue-100 text-sm mt-1">{customers.find((c) => c.id === notesModalId)?.name}</p>
              </div>
              <button onClick={() => setNotesModalId(null)} className="p-2 hover:bg-blue-500 rounded-lg transition text-white">
                <X size={24} />
              </button>
            </div>

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

              <div className="flex gap-3 mt-6">
                <button onClick={() => setNotesModalId(null)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition font-bold">
                  Cancel
                </button>
                <button onClick={handleSaveModalNotes} className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-bold flex items-center justify-center gap-2">
                  <Save size={18} />
                  Save Notes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} duration={3000} />
    </div>
  );
}


