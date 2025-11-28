'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Eye, X } from 'lucide-react';
import Toast from '@/components/Toast';

interface Feedback {
  id: string;
  customerName: string;
  showroom: string;
  category: string;
  message: string;
  date: string;
  email?: string;
  phone?: string;
  status: 'new' | 'reviewed' | 'resolved';
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function FeedbacksClient() {
  const router = useRouter();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Bangla translations
  const [bn] = useState({
    feedbacks: 'ফিডব্যাকসমূহ',  // Added missing feedbacks translation
    error: 'ত্রুটি',
    success: 'সফল',
    warning: 'সতর্কতা',
    info: 'তথ্য',
    customerName: 'গ্রাহকের নাম',
    showroom: 'শোরুম',
    category: 'বিভাগ',
    message: 'বার্তা',
    date: 'তারিখ',
    email: 'ইমেইল',
    phone: 'ফোন',
    status: 'স্ট্যাটাস',
    new: 'নতুন',
    reviewed: 'পর্যালোচিত',
    resolved: 'সমাধানকৃত',
    noFeedbacks: 'কোন ফিডব্যাক পাওয়া যায়নি',
    noFeedbacksForSelectedFilter: 'নির্বাচিত ফিল্টারের জন্য কোন ফিডব্যাক পাওয়া যায়নি',
    noFeedbacksForSelectedShowroom: 'নির্বাচিত শোরুমের জন্য কোন ফিডব্যাক পাওয়া যায়নি',
    noFeedbacksForSelectedCategory: 'নির্বাচিত বিভাগের জন্য কোন ফিডব্যাক পাওয়া যায়নি',
    noFeedbacksForSelectedStatus: 'নির্বাচিত স্ট্যাটাসের জন্য কোন ফিডব্যাক পাওয়া যায়নি',
    noFeedbacksForSelectedDate: 'নির্বাচিত তারিখের জন্য কোন ফিডব্যাক পাওয়া যায়নি',
    noFeedbacksForSelectedRange: 'নির্বাচিত পরিসীমায় কোন ফিডব্যাক পাওয়া যায়নি',
    viewDetails: 'বিস্তারিত দেখুন',
    markAsReviewed: 'পর্যালোচিত হিসেবে চিহ্নিত করুন',
    markAsResolved: 'সমাধানকৃত হিসেবে চিহ্নিত করুন',
    deleteFeedback: 'ফিডব্যাক মুছুন',
    confirmDelete: 'আপনি কি নিশ্চিতভাবে এই ফিডব্যাকটি মুছতে চান?',
    yes: 'হ্যাঁ',
    no: 'না',
    cancel: 'বাতিল করুন',
    delete: 'মুছুন',
    feedbackDeleted: 'ফিডব্যাক মুছে ফেলা হয়েছে',
    failedToDelete: 'ফিডব্যাক মুছতে ব্যর্থ হয়েছে',
    statusUpdated: 'স্ট্যাটাস আপডেট করা হয়েছে',
    failedToUpdateStatus: 'স্ট্যাটাস আপডেট করতে ব্যর্থ হয়েছে',
    notAuthenticated: 'অনুমোদিত নয়',
    last7Days: 'গত ৭ দিন',
    last30Days: 'গত ৩০ দিন',
    allTime: 'সব সময়',
    selectCategory: 'বিভাগ নির্বাচন করুন',
    selectStatus: 'স্ট্যাটাস নির্বাচন করুন',
    selectDateRange: 'তারিখের পরিসীমা নির্বাচন করুন',
    from: 'থেকে',
    to: 'পর্যন্ত',
    applyFilters: 'ফিল্টার প্রয়োগ করুন',
    clearFilters: 'ফিল্টার মোছুন',
    noDataAvailable: 'কোন ডেটা পাওয়া যায়নি',
    loadingData: 'ডেটা লোড হচ্ছে...',
    failedToLoadData: 'ডেটা লোড করতে ব্যর্থ হয়েছে',
    noDataToShow: 'দেখানোর জন্য কোন ডেটা নেই',
    noDataForSelectedFilter: 'নির্বাচিত ফিল্টারের জন্য কোন ডেটা নেই',
    noDataForSelectedShowroom: 'নির্বাচিত শোরুমের জন্য কোন ডেটা নেই',
    noDataForSelectedCategory: 'নির্বাচিত বিভাগের জন্য কোন ডেটা নেই',
    noDataForSelectedStatus: 'নির্বাচিত স্ট্যাটাসের জন্য কোন ডেটা নেই',
    noDataForSelectedDate: 'নির্বাচিত তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedRange: 'নির্বাচিত পরিসীমায় কোন ডেটা নেই',
    noDataForSelectedFilterAndShowroom: 'নির্বাচিত ফিল্টার এবং শোরুমের জন্য কোন ডেটা নেই',
    noDataForSelectedFilterAndCategory: 'নির্বাচিত ফিল্টার এবং বিভাগের জন্য কোন ডেটা নেই',
    noDataForSelectedFilterAndStatus: 'নির্বাচিত ফিল্টার এবং স্ট্যাটাসের জন্য কোন ডেটা নেই',
    noDataForSelectedFilterAndDate: 'নির্বাচিত ফিল্টার এবং তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedShowroomAndCategory: 'নির্বাচিত শোরুম এবং বিভাগের জন্য কোন ডেটা নেই',
    noDataForSelectedShowroomAndStatus: 'নির্বাচিত শোরুম এবং স্ট্যাটাসের জন্য কোন ডেটা নেই',
    noDataForSelectedShowroomAndDate: 'নির্বাচিত শোরুম এবং তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedCategoryAndStatus: 'নির্বাচিত বিভাগ এবং স্ট্যাটাসের জন্য কোন ডেটা নেই',
    noDataForSelectedCategoryAndDate: 'নির্বাচিত বিভাগ এবং তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedStatusAndDate: 'নির্বাচিত স্ট্যাটাস এবং তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedFilterAndShowroomAndCategory: 'নির্বাচিত ফিল্টার, শোরুম এবং বিভাগের জন্য কোন ডেটা নেই',
    noDataForSelectedFilterAndShowroomAndStatus: 'নির্বাচিত ফিল্টার, শোরুম এবং স্ট্যাটাসের জন্য কোন ডেটা নেই',
    noDataForSelectedFilterAndShowroomAndDate: 'নির্বাচিত ফিল্টার, শোরুম এবং তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedFilterAndCategoryAndStatus: 'নির্বাচিত ফিল্টার, বিভাগ এবং স্ট্যাটাসের জন্য কোন ডেটা নেই',
    noDataForSelectedFilterAndCategoryAndDate: 'নির্বাচিত ফিল্টার, বিভাগ এবং তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedFilterAndStatusAndDate: 'নির্বাচিত ফিল্টার, স্ট্যাটাস এবং তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedShowroomAndCategoryAndStatus: 'নির্বাচিত শোরুম, বিভাগ এবং স্ট্যাটাসের জন্য কোন ডেটা নেই',
    noDataForSelectedShowroomAndCategoryAndDate: 'নির্বাচিত শোরুম, বিভাগ এবং তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedShowroomAndStatusAndDate: 'নির্বাচিত শোরুম, স্ট্যাটাস এবং তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedCategoryAndStatusAndDate: 'নির্বাচিত বিভাগ, স্ট্যাটাস এবং তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedFilterAndShowroomAndCategoryAndStatus: 'নির্বাচিত ফিল্টার, শোরুম, বিভাগ এবং স্ট্যাটাসের জন্য কোন ডেটা নেই',
    noDataForSelectedFilterAndShowroomAndCategoryAndDate: 'নির্বাচিত ফিল্টার, শোরুম, বিভাগ এবং তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedFilterAndShowroomAndStatusAndDate: 'নির্বাচিত ফিল্টার, শোরুম, স্ট্যাটাস এবং তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedFilterAndCategoryAndStatusAndDate: 'নির্বাচিত ফিল্টার, বিভাগ, স্ট্যাটাস এবং তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedShowroomAndCategoryAndStatusAndDate: 'নির্বাচিত শোরুম, বিভাগ, স্ট্যাটাস এবং তারিখের জন্য কোন ডেটা নেই',
    noDataForSelectedFilterAndShowroomAndCategoryAndStatusAndDate: 'নির্বাচিত ফিল্টার, শোরুম, বিভাগ, স্ট্যাটাস এবং তারিখের জন্য কোন ডেটা নেই',
  });
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [dateRange, setDateRange] = useState<'last7' | 'last30' | 'all'>('last30');
  const [selectedShowroom, setSelectedShowroom] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Show toast message
  const show = (msg: string) => {
    // Map English messages to Bangla translations
    const messageMap: Record<string, string> = {
      'Not authenticated': bn.notAuthenticated,
      'Failed to update status': bn.failedToUpdateStatus,
      'Failed to delete': bn.failedToDelete,
      'Failed to load feedbacks': bn.failedToLoadData,
      'Feedback deleted': bn.feedbackDeleted
    };
    
    setToastMessage(messageMap[msg] || msg);
    setShowToast(true);
  };

  // Handle status change for feedback
  const handleStatusChange = async (id: string, status: 'new' | 'reviewed' | 'resolved') => {
    try {
      setUpdatingId(id);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return show('Not authenticated');
      
      const res = await fetch(`${baseUrl}/api/user/feedbacks/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (res.status === 401) {
        try { 
          await fetch(`${baseUrl}/api/user/logout`, { 
            method: 'POST', 
            headers: { 
              'Content-Type': 'application/json', 
              Authorization: `Bearer ${token}` 
            } 
          }); 
        } catch {}
        
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        router.push('/');
        return;
      }

      if (!res.ok) throw new Error('Failed to update status');
      
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status } : f));
      show('Status updated');
    } catch (error: any) {
      show(error?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle feedback deletion
  const handleDelete = async (id: string) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return show('Not authenticated');
      
      const res = await fetch(`${baseUrl}/api/user/feedbacks/${id}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
      });

      if (res.status === 401) {
        try { 
          await fetch(`${baseUrl}/api/user/logout`, { 
            method: 'POST', 
            headers: { 
              'Content-Type': 'application/json', 
              Authorization: `Bearer ${token}` 
            } 
          }); 
        } catch {}
        
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        router.push('/');
        return;
      }

      if (!res.ok) throw new Error('Failed to delete');
      
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      setDeleteConfirmId(null);
      show('Feedback deleted');
    } catch (error: any) {
      show(error?.message || 'Failed to delete');
    }
  };

  // Fetch feedbacks from API
  const fetchFeedbacks = async () => {
    try {
      setIsLoading(true);
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return show('Not authenticated');
      
      const showroomParam = selectedShowroom !== 'all' ? `&showroom=${encodeURIComponent(selectedShowroom)}` : '';
      const res = await fetch(`${baseUrl}/api/user/feedbacks?page=1&limit=50${showroomParam}`, {
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        cache: 'no-store'
      });

      if (res.status === 401) {
        try { 
          await fetch(`${baseUrl}/api/user/logout`, { 
            method: 'POST', 
            headers: { 
              'Content-Type': 'application/json', 
              Authorization: `Bearer ${token}` 
            } 
          }); 
        } catch {}
        
        if (typeof window !== 'undefined') localStorage.removeItem('token');
        router.push('/');
        return;
      }

      if (!res.ok) throw new Error('Failed to load feedbacks');
      
      const data = await res.json();
      const mapped: Feedback[] = (data.feedbacks || []).map((d: any) => ({
        id: d.id,
        customerName: d.name || 'নাম নেই',
        showroom: d.showroom || 'N/A',
        category: d.category || 'General',
        message: d.message || '',
        date: d.createdAt || new Date().toISOString(),
        email: d.email || '',
        phone: d.phone || '',
        status: (d.status as 'new' | 'reviewed' | 'resolved') || 'new',
      }));
      
      setFeedbacks(mapped);
    } catch (error: any) {
      show(error.message || 'Error loading feedbacks');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch feedbacks on component mount and when selectedShowroom changes
  useEffect(() => {
    fetchFeedbacks();
  }, [selectedShowroom]);

  // Get unique showrooms for filter
  const showrooms = useMemo(() => {
    return ['all', ...Array.from(new Set(feedbacks.map((f) => f.showroom)))];
  }, [feedbacks]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    return ['all', ...Array.from(new Set(feedbacks.map((f) => f.category)))];
  }, [feedbacks]);

  // Filter feedbacks based on selected filters
  const filteredFeedbacks = useMemo(() => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return feedbacks.filter((feedback) => {
      // Filter by date range
      let dateMatch = true;
      if (dateRange === 'last7') {
        dateMatch = new Date(feedback.date) >= last7Days;
      } else if (dateRange === 'last30') {
        dateMatch = new Date(feedback.date) >= last30Days;
      }

      // Filter by showroom
      const showroomMatch = selectedShowroom === 'all' || feedback.showroom === selectedShowroom;
      
      // Filter by category
      const categoryMatch = selectedCategory === 'all' || feedback.category === selectedCategory;
      
      // Filter by status
      const statusMatch = selectedStatus === 'all' || feedback.status === selectedStatus;

      return dateMatch && showroomMatch && categoryMatch && statusMatch;
    });
  }, [feedbacks, dateRange, selectedShowroom, selectedCategory, selectedStatus]);

  // Calculate statistics
  const stats = useMemo(() => ({
    total: filteredFeedbacks.length,
    new: filteredFeedbacks.filter(f => f.status === 'new').length,
    reviewed: filteredFeedbacks.filter(f => f.status === 'reviewed').length,
    resolved: filteredFeedbacks.filter(f => f.status === 'resolved').length,
  }), [filteredFeedbacks]);

  // Merge translations
  const bnTranslations = useMemo(() => ({
    ...bn,
    actions: 'কার্যকলাপ',
    allShowrooms: 'সমস্ত শোরুম',
    allCategories: 'সব বিভাগ',
    view: 'দেখুন',
    feedbacksDetails: 'ফিডব্যাকের বিস্তারিত',
    receivedOn: 'পাওয়া গেছে',
    feedbacksManagement: 'ফিডব্যাক ব্যবস্থাপনা',
    delete: 'মুছুন',
    deleteFeedback: 'ফিডব্যাক মুছুন',
    confirmDelete: 'আপনি কি নিশ্চিতভাবে মুছতে চান?',
    yes: 'হ্যাঁ',
    no: 'না',
    cancel: 'বাতিল',
    close: 'বন্ধ',
    loading: 'লোড হচ্ছে...',
    error: 'ত্রুটি',
    success: 'সফল',
    statusNew: 'নতুন',
    statusReviewed: 'পর্যালোচিত',
    statusResolved: 'সমাধানকৃত',
    noFeedbacks: 'কোন ফিডব্যাক পাওয়া যায়নি',
    last7Days: 'গত ৭ দিন',
    last30Days: 'গত ৩০ দিন',
    allTime: 'সব সময়',
    selectDateRange: 'তারিখের পরিসীমা',
    selectShowroom: 'শোরুম নির্বাচন করুন',
    selectCategory: 'বিভাগ নির্বাচন করুন',
    selectStatus: 'স্ট্যাটাস নির্বাচন করুন',
    applyFilters: 'ফিল্টার প্রয়োগ করুন',
    clearFilters: 'ফিল্টার মোছুন',
    filter: 'ফিল্টার'
  }), [bn]);

  return (
    <div className="min-h-screen p-4 md:p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {bn.feedbacks}
          </h1>
          <p className="text-gray-600">{bnTranslations.feedbacksManagement}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">মোট ফিডব্যাক</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">নতুন</p>
            <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">পর্যালোচিত</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.reviewed}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">সমাধানকৃত</p>
            <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {bnTranslations.filter}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {bnTranslations.selectDateRange}
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'last7' | 'last30' | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="last7">{bnTranslations.last7Days}</option>
                <option value="last30">{bnTranslations.last30Days}</option>
                <option value="all">{bnTranslations.allTime}</option>
              </select>
            </div>

            {/* Showroom Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {bn.showroom}
              </label>
              <select
                value={selectedShowroom}
                onChange={(e) => setSelectedShowroom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="all">{bnTranslations.allShowrooms}</option>
                {showrooms.filter(s => s !== 'all').map((showroom) => (
                  <option key={showroom} value={showroom}>
                    {showroom}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {bn.category}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="all">{bnTranslations.allCategories}</option>
                {categories.filter(c => c !== 'all').map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {bn.status}
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="all">সব স্ট্যাটাস</option>
                <option value="new">{bnTranslations.statusNew}</option>
                <option value="reviewed">{bnTranslations.statusReviewed}</option>
                <option value="resolved">{bnTranslations.statusResolved}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedback Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-0">
                {bn.feedbacks} <span className="text-gray-500">({filteredFeedbacks.length})</span>
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedShowroom('all');
                    setSelectedCategory('all');
                    setSelectedStatus('all');
                    setDateRange('last30');
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  {bnTranslations.clearFilters}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {bn.customerName}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {bn.showroom}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {bn.category}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {bn.date}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {bn.status}
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {bnTranslations.actions}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                      <p className="mt-2">{bnTranslations.loading}</p>
                    </td>
                  </tr>
                ) : filteredFeedbacks.length > 0 ? (
                  filteredFeedbacks.map((feedback) => (
                    <tr key={feedback.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {feedback.customerName}
                        </div>
                        {feedback.email && (
                          <div className="text-xs text-gray-500">{feedback.email}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{feedback.showroom}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {feedback.category}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(feedback.date).toLocaleDateString('en-BD', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <select
                          value={feedback.status}
                          onChange={(e) =>
                            handleStatusChange(
                              feedback.id,
                              e.target.value as 'new' | 'reviewed' | 'resolved'
                            )
                          }
                          className={`text-sm rounded-md px-2 py-1 border ${
                            feedback.status === 'new'
                              ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                              : feedback.status === 'reviewed'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-green-50 text-green-800 border-green-200'
                          } focus:outline-none focus:ring-1 focus:ring-offset-1 ${
                            feedback.status === 'new'
                              ? 'focus:ring-yellow-500 focus:border-yellow-500'
                              : feedback.status === 'reviewed'
                              ? 'focus:ring-blue-500 focus:border-blue-500'
                              : 'focus:ring-green-500 focus:border-green-500'
                          }`}
                          disabled={updatingId === feedback.id}
                        >
                          <option value="new" className="bg-white">
                            {bnTranslations.statusNew}
                          </option>
                          <option value="reviewed" className="bg-white">
                            {bnTranslations.statusReviewed}
                          </option>
                          <option value="resolved" className="bg-white">
                            {bnTranslations.statusResolved}
                          </option>
                        </select>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedFeedback(feedback)}
                            className="text-gray-600 hover:text-gray-900"
                            title={bnTranslations.view}
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setDeleteConfirmId(
                                  deleteConfirmId === feedback.id ? null : feedback.id
                                )
                              }
                              className="text-red-600 hover:text-red-900"
                              title={bnTranslations.delete}
                            >
                              <X className="h-5 w-5" />
                            </button>
                            {deleteConfirmId === feedback.id && (
                              <div className="absolute right-0 mt-1 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1">
                                  <div className="px-4 py-2 text-sm text-gray-700">
                                    {bnTranslations.confirmDelete}
                                  </div>
                                  <div className="flex justify-end px-4 py-2 space-x-2 border-t border-gray-100">
                                    <button
                                      onClick={() => setDeleteConfirmId(null)}
                                      className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                    >
                                      {bnTranslations.no}
                                    </button>
                                    <button
                                      onClick={() => handleDelete(feedback.id)}
                                      className="px-3 py-1 text-sm text-white bg-red-600 rounded-md hover:bg-red-700"
                                    >
                                      {bnTranslations.yes}
                                    </button>
                                  </div>
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
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-gray-500 text-sm"
                    >
                      {bnTranslations.noFeedbacks}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Feedback Detail Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
              onClick={() => setSelectedFeedback(null)}
            >
              <div className="absolute inset-0 "></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {bnTranslations.feedbacksDetails}
                      </h3>
                      <button
                        type="button"
                        className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                        onClick={() => setSelectedFeedback(null)}
                      >
                        <span className="sr-only">{bnTranslations.close}</span>
                        <X className="h-6 w-6" />
                      </button>
                    </div>

                    <div className="mt-4 space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          {bn.customerName}
                        </h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedFeedback.customerName}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {selectedFeedback.email && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              {bn.email}
                            </h4>
                            <p className="mt-1 text-sm text-gray-900 break-all">
                              {selectedFeedback.email}
                            </p>
                          </div>
                        )}

                        {selectedFeedback.phone && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              {bn.phone}
                            </h4>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedFeedback.phone}
                            </p>
                          </div>
                        )}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          {bn.showroom}
                        </h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedFeedback.showroom}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            {bn.category}
                          </h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedFeedback.category}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-500">
                            {bn.status}
                          </h4>
                          <p className="mt-1 text-sm text-gray-900">
                            {selectedFeedback.status === 'new'
                              ? bnTranslations.statusNew
                              : selectedFeedback.status === 'reviewed'
                              ? bnTranslations.statusReviewed
                              : bnTranslations.statusResolved}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          {bnTranslations.receivedOn}
                        </h4>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedFeedback.date).toLocaleString('en-BD', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          {bn.message}
                        </h4>
                        <div className="mt-1 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm text-gray-900 whitespace-pre-line">
                            {selectedFeedback.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gray-800 text-base font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedFeedback(null)}
                >
                  {bnTranslations.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        show={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
    </div>
  );
}
