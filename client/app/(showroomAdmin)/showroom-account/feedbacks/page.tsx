'use client';

import React, { useState, useMemo } from 'react';
import { MessageSquare, Calendar, Phone, Search } from 'lucide-react';
import Link from 'next/link';
import Toast from '@/components/Toast';

interface Feedback {
  id: number;
  customerName: string;
  phone: string;
  feedback: string;
  rating: number;
  date: Date;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
}

// Mock data generator
const generateFeedbackData = (): Feedback[] => {
  const feedbackMessages = [
    'Great experience! The staff was very helpful.',
    'Good products but could improve the checkout process.',
    'Excellent quality and fast delivery.',
    'The showroom was clean and well-organized.',
    'Need more variety in product selection.',
    'Outstanding customer service!',
    'Average experience, nothing special.',
    'Very satisfied with my purchase.',
    'The product quality exceeded my expectations.',
    'Staff was knowledgeable and friendly.',
    'Could use better pricing.',
    'Highly recommend this showroom!',
    'Disappointed with the service.',
    'Product arrived damaged.',
    'Amazing! Will come back again.',
  ];

  const sentiments: ('Positive' | 'Neutral' | 'Negative')[] = ['Positive', 'Neutral', 'Negative'];
  const feedback: Feedback[] = [];

  for (let i = 1; i <= 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    feedback.push({
      id: i,
      customerName: `Customer ${i}`,
      phone: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      feedback: feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)],
      rating: Math.floor(Math.random() * 5) + 1,
      date,
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
    });
  }

  return feedback;
};

const getSentimentColor = (sentiment: string): string => {
  switch (sentiment) {
    case 'Positive':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'Neutral':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'Negative':
      return 'bg-rose-50 text-rose-700 border border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border border-slate-200';
  }
};

const getRatingStars = (rating: number): string => {
  return '⭐'.repeat(rating);
};

export default function FeedbackSummaryPage() {
  const [feedbackData] = useState<Feedback[]>(generateFeedbackData());
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [phoneSearch, setPhoneSearch] = useState<string>('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Get unique dates for filter
  const uniqueDates = useMemo(() => {
    return Array.from(new Set(feedbackData.map((f) => f.date.toISOString().split('T')[0]))).sort().reverse();
  }, [feedbackData]);

  // Filter feedback based on date and phone search
  const filteredFeedback = useMemo(() => {
    return feedbackData.filter((item) => {
      const dateMatch = !selectedDate || item.date.toISOString().split('T')[0] === selectedDate;
      const phoneMatch = !phoneSearch || item.phone.includes(phoneSearch);
      return dateMatch && phoneMatch;
    });
  }, [feedbackData, selectedDate, phoneSearch]);

  // Calculate statistics
  const stats = useMemo(() => {
    const positive = filteredFeedback.filter((f) => f.sentiment === 'Positive').length;
    const neutral = filteredFeedback.filter((f) => f.sentiment === 'Neutral').length;
    const negative = filteredFeedback.filter((f) => f.sentiment === 'Negative').length;
    const avgRating =
      filteredFeedback.length > 0
        ? (filteredFeedback.reduce((sum, f) => sum + f.rating, 0) / filteredFeedback.length).toFixed(1)
        : 0;

    return { positive, neutral, negative, total: filteredFeedback.length, avgRating };
  }, [filteredFeedback]);

  const handleClearFilters = () => {
    setSelectedDate('');
    setPhoneSearch('');
    setToastMessage('Filters cleared!');
    setShowToast(true);
  };

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">

          <h1 className="text-4xl font-bold text-slate-900 mb-2">Feedback Summary</h1>
          <p className="text-slate-600 text-lg">View and analyze customer feedback and reviews</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {/* Total Feedback */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Total Feedback</p>
                <p className="text-4xl font-bold text-slate-900">{stats.total}</p>
                <p className="text-xs text-slate-400 mt-2">customer reviews</p>
              </div>
              <div className="p-4 gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                <Calendar size={16} className="inline mr-2" />
                Select Date
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-white text-slate-900 font-medium"
              >
                <option value="">All Dates</option>
                {uniqueDates.map((date) => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Search */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                <Phone size={16} className="inline mr-2" />
                Search by Phone
              </label>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter phone number..."
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="w-full px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>


        {/* Feedback Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Table Header */}
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">
              Customer Feedback ({stats.total})
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Customer Name</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Phone</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Feedback</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedback.length > 0 ? (
                  filteredFeedback.map((feedback, idx) => (
                    <tr
                      key={feedback.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition ${
                        idx === filteredFeedback.length - 1 ? 'border-b-0' : ''
                      }`}
                    >
                      {/* Name */}
                      <td className="px-8 py-5 text-sm font-semibold text-slate-900">
                        {feedback.customerName}
                      </td>

                      {/* Phone */}
                      <td className="px-8 py-5 text-sm text-slate-600 font-medium">
                        {feedback.phone}
                      </td>

                      {/* Feedback */}
                      <td className="px-8 py-5 text-sm text-slate-600 max-w-xs">
                        <div className="truncate hover:text-clip" title={feedback.feedback}>
                          {feedback.feedback}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-8 py-5 text-sm text-slate-600 font-medium">
                        {feedback.date.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-8 py-12 text-center text-slate-500">
                      <p className="text-lg font-semibold">No feedback found</p>
                      <p className="text-sm mt-2">Try adjusting your filters to see feedback entries.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filteredFeedback.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-sm text-slate-600 font-medium">
                Showing <span className="font-bold text-slate-900">{filteredFeedback.length}</span> of{' '}
                <span className="font-bold text-slate-900">{feedbackData.length}</span> feedback entries
              </p>
            </div>
          )}
        </div>
      </div>

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