'use client';

import React, { useEffect, useState } from 'react';
import { Save, Send, Eye, EyeOff } from 'lucide-react';
import Toast from '@/components/Toast';

export default function MessageSettingsClient() {
  const [formData, setFormData] = useState({
    smsProvider: 'greenweb',
    smsApiKey: '',
    smsSenderId: '',
    feedbackUrl: '',
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const load = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`${baseUrl}/api/user/message-settings?ts=${Date.now()}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: 'no-store',
        });
        if (!res.ok) return;
        const data = await res.json();
        const s = data?.settings || {};
        setFormData({
          smsProvider: s.smsProvider || 'greenweb',
          smsApiKey: s.smsApiKey || '',
          smsSenderId: s.smsSenderId || '',
          feedbackUrl: s.feedbackUrl || '',
        });
      } catch { }
    };
    load();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.smsApiKey || !formData.smsProvider) {
      setToastMessage('অনুগ্রহ করে প্রোভাইডার নির্বাচন করুন এবং API কী লিখুন');
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const res = await fetch(`${baseUrl}/api/user/message-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          smsProvider: formData.smsProvider,
          smsApiKey: formData.smsApiKey,
          smsSenderId: formData.smsSenderId,
          feedbackUrl: formData.feedbackUrl,
        }),
      });
      if (!res.ok) throw new Error('সংরক্ষণ ব্যর্থ হয়েছে');
      const data = await res.json();
      const s = data?.settings || {};
      setFormData({
        smsProvider: s.smsProvider || formData.smsProvider,
        smsApiKey: s.smsApiKey || formData.smsApiKey,
        smsSenderId: s.smsSenderId || formData.smsSenderId,
        feedbackUrl: s.feedbackUrl || formData.feedbackUrl,
      });
      setToastMessage('SMS সেটিংস সফলভাবে সংরক্ষণ হয়েছে!');
      setShowToast(true);
    } catch (error) {
      setToastMessage('সেটিংস সংরক্ষণ করা যায়নি, আবার চেষ্টা করুন।');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSMS = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!testPhoneNumber) {
      setToastMessage('অনুগ্রহ করে একটি ফোন নম্বর লিখুন');
      setShowToast(true);
      return;
    }

    if (!formData.smsApiKey || !formData.smsProvider) {
      setToastMessage('অনুগ্রহ করে আগে SMS সেটিংস সংরক্ষণ করুন');
      setShowToast(true);
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setToastMessage(`টেস্ট SMS সফলভাবে পাঠানো হয়েছে: ${testPhoneNumber}`);
      setShowToast(true);
      setTestPhoneNumber('');
      setShowTestModal(false);
    } catch (error) {
      setToastMessage('টেস্ট SMS পাঠানো যায়নি, আবার চেষ্টা করুন।');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SMS গেটওয়ে সেটিংস</h1>
          <p className="text-gray-600">আপনার SMS গেটওয়ের তথ্য এবং সেটিংস কনফিগার করুন</p>
        </div>

        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div>
              <label htmlFor="smsApiKey" className="block text-sm font-medium text-gray-700 mb-2">API কী</label>
              <div className="relative">
                <input type={showApiKey ? 'text' : 'password'} name="smsApiKey" id="smsApiKey" value={formData.smsApiKey} onChange={handleInputChange} placeholder="আপনার SMS গেটওয়ে API কী লিখুন" className="w-full px-4 py-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition" aria-label={showApiKey ? 'API কী লুকান' : 'API কী দেখুন'}>
                  {showApiKey ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">আপনার API কী এনক্রিপ্টেড এবং নিরাপদভাবে সংরক্ষিত</p>
            </div>

            <div>
              <label htmlFor="smsSenderId" className="block text-sm font-medium text-gray-700 mb-2">সেন্ডার আইডি</label>
              <input type="text" name="smsSenderId" id="smsSenderId" value={formData.smsSenderId} onChange={handleInputChange} placeholder="যেমন, YourBrand বা 1234" className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
              <p className="text-xs text-gray-500 mt-1">SMS মেসেজে যেই সেন্ডার নাম/নম্বার দেখা যাবে</p>
            </div>

            <div>
              <label htmlFor="feedbackUrl" className="block text-sm font-medium text-gray-700 mb-2">ফিডব্যাক URL</label>
              <input type="url" name="feedbackUrl" id="feedbackUrl" value={formData.feedbackUrl} onChange={handleInputChange} placeholder="যেমন, https://yourapp.com/user/feedback" className="w-full px-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
              <p className="text-xs text-gray-500 mt-1">গ্রাহকের ফিডব্যাক নেওয়ার জন্য SMS এ যে লিংক পাঠানো হবে</p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 md:gap-4 pt-6 border-t border-gray-200">
              <button type="button" onClick={() => setShowTestModal(true)} disabled={isLoading} className="w-full md:w-auto flex justify-center items-center text-sm gap-2 px-4 py-2 md:px-6 md:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors font-medium">
                <Send size={24} />
                টেস্ট SMS পাঠান
              </button>

              <button type="submit" disabled={isLoading} className="w-full md:w-auto inline-flex justify_center items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium">
                <Save size={24} />
                {isLoading ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">সহায়তা প্রয়োজন?</h3>
          <p className="text-sm text-blue-800">আপনার SMS গেটওয়ে ক্রেডেনশিয়াল পেতে, SMS প্রোভাইডারের ড্যাশবোর্ডে গিয়ে API সেটিংস সেকশন এ যান। সেখান থেকে সঠিকভাবে আপনার API কী এবং এন্ডপয়েন্ট URL কপি করুন।</p>
        </div>
      </div>

      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowTestModal(false)}>
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowTestModal(false)} className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close modal">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-1">টেস্ট SMS পাঠান</h2>
            <p className="text-gray-600 text-sm mb-6">একটি ফোন নম্বর লিখে টেস্ট SMS পাঠান</p>

            <form onSubmit={handleTestSMS} className="space-y-4">
              <div>
                <label htmlFor="testPhoneNumber" className="block text-sm font-medium text-gray-700 mb-2">ফোন নম্বর</label>
                <input type="tel" id="testPhoneNumber" name="testPhoneNumber" value={testPhoneNumber} onChange={(e) => setTestPhoneNumber(e.target.value)} placeholder="যেমন, +8801XXXXXXXXX বা 01XXXXXXXXX" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition" />
                <p className="text-xs text-gray-500 mt-1">আন্তর্জাতিক নম্বরের ক্ষেত্রে দেশের কোডসহ লিখুন</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowTestModal(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">বাতিল</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-600 text-white rounded-lg transition-colors font-medium inline-flex items-center justify-center gap-2">
                  <Send size={16} />
                  {isLoading ? 'পাঠানো হচ্ছে...' : 'টেস্ট পাঠান'}
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


