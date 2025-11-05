'use client';

import React, { useState, useMemo, useEffect } from 'react';

import { Calendar, Eye, X } from 'lucide-react';
import Toast from '@/components/Toast';

interface Feedback {
  id: string;
  customerName: string;
  showroom: string;
  category: string;
  rating: number;
  message: string;
  date: string; // ISO string from backend
  email?: string;
  phone?: string;
}

const getRatingColor = (rating: number): string => {
  if (rating >= 4) return 'bg-green-100 text-green-800';
  if (rating >= 3) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getRatingLabel = (rating: number): string => {
  const labels: Record<number, string> = {
    5: 'Excellent',
    4: 'Good',
    3: 'Average',
    2: 'Poor',
    1: 'Very Poor',
  };
  return labels[rating] || 'Unknown';
};

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [dateRange, setDateRange] = useState<'last7' | 'last30' | 'all'>('last30');
  const [selectedShowroom, setSelectedShowroom] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const show = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
  };

  const fetchFeedbacks = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) return show('Not authenticated');
      const res = await fetch(`${baseUrl}/api/user/feedbacks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load feedbacks');
      const data = await res.json();
      const mapped: Feedback[] = (data.feedbacks || []).map((d: any) => ({
        id: d.id,
        customerName: d.name,
        showroom: d.showroom || 'N/A',
        category: d.category || 'General',
        rating: 0,
        message: d.message,
        date: d.createdAt,
        email: d.email,
        phone: d.phone,
      }));
      setFeedbacks(mapped);
    } catch (e: any) {
      show(e.message || 'Error loading feedbacks');
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get unique values for filters
  const showrooms = useMemo(() => {
    return Array.from(new Set(feedbacks.map((f) => f.showroom)));
  }, [feedbacks]);

  const categories = useMemo(() => {
    return Array.from(new Set(feedbacks.map((f) => f.category)));
  }, [feedbacks]);

  // Filter feedbacks
  const filteredFeedbacks = useMemo(() => {
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return feedbacks.filter((feedback) => {
      // Date filter
      let dateMatch = true;
      if (dateRange === 'last7') {
        dateMatch = new Date(feedback.date) >= last7Days;
      } else if (dateRange === 'last30') {
        dateMatch = new Date(feedback.date) >= last30Days;
      }

      // Showroom filter
      const showroomMatch =
        selectedShowroom === 'all' || feedback.showroom === selectedShowroom;

      // Category filter
      const categoryMatch =
        selectedCategory === 'all' || feedback.category === selectedCategory;

      // Rating filter
      const ratingMatch =
        selectedRating === 'all' || feedback.rating === parseInt(selectedRating);

      return dateMatch && showroomMatch && categoryMatch && ratingMatch;
    });
  }, [feedbacks, dateRange, selectedShowroom, selectedCategory, selectedRating]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalFeedbacks = filteredFeedbacks.length;
    const averageRating =
      totalFeedbacks > 0
        ? (
            filteredFeedbacks.reduce((sum, f) => sum + f.rating, 0) /
            totalFeedbacks
          ).toFixed(1)
        : 0;
    const excellentCount = filteredFeedbacks.filter((f) => f.rating >= 4).length;

    return { totalFeedbacks, averageRating, excellentCount };
  }, [filteredFeedbacks]);

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback Management</h1>
          <p className="text-gray-600">View and manage customer feedbacks</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'last7' | 'last30' | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="last7">Last 7 Days</option>
                <option value="last30">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Showroom Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Showroom
              </label>
              <select
                value={selectedShowroom}
                onChange={(e) => setSelectedShowroom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="all">All Showrooms</option>
                {showrooms.map((showroom) => (
                  <option key={showroom} value={showroom}>
                    {showroom}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Feedbacks Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Table Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              Feedbacks ({filteredFeedbacks.length})
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Showroom
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.length > 0 ? (
                  filteredFeedbacks.map((feedback) => (
                    <tr
                      key={feedback.id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {feedback.customerName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {feedback.showroom}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {feedback.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(feedback.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setSelectedFeedback(feedback)}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium text-xs"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No feedbacks found for the selected filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Feedback Details Modal */}
      {selectedFeedback && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center "
          onClick={() => setSelectedFeedback(null)}
        >
          {/* Modal Content */}
          <div
            className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedFeedback(null)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Feedback Details</h2>
            <p className="text-gray-600 text-sm mb-6">
              Received on{' '}
              {new Date(selectedFeedback.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>

            {/* Content */}
            <div className="space-y-4">
              {/* Customer Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name
                </label>
                <p className="text-gray-900">{selectedFeedback.customerName}</p>
              </div>

              {/* Email */}
              {selectedFeedback.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-gray-900 break-all">{selectedFeedback.email}</p>
                </div>
              )}

              {/* Phone */}
              {selectedFeedback.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <p className="text-gray-900">{selectedFeedback.phone}</p>
                </div>
              )}

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback Message
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {selectedFeedback.message}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex gap-3 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => setSelectedFeedback(null)}
                className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Close
              </button>
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