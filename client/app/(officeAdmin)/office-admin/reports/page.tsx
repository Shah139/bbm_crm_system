'use client';

import React, { useState, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Download, FileText, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Toast from '@/components/Toast';

interface ChartData {
  day: string;
  visitors: number;
  accuracy: number;
  performance: number;
  sales: number;
}

interface ShowroomData {
  id: number;
  name: string;
  data: ChartData[];
}

// Mock data generator
const generateShowroomReportData = (): ShowroomData[] => {
  const showrooms = ['Showroom A', 'Showroom B', 'Showroom C', 'Showroom D', 'Showroom E'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return showrooms.map((name, idx) => ({
    id: idx + 1,
    name,
    data: days.map((day) => ({
      day,
      visitors: Math.floor(Math.random() * 400) + 100,
      accuracy: Math.floor(Math.random() * 25) + 75,
      performance: Math.floor(Math.random() * 35) + 65,
      sales: Math.floor(Math.random() * 5000) + 1000,
    })),
  }));
};

export default function ReportsPage() {
  const [reportData] = useState<ShowroomData[]>(generateShowroomReportData());
  const [selectedShowroom, setSelectedShowroom] = useState<string>(reportData[0]?.name || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get selected showroom data
  const currentShowroomData = useMemo(() => {
    return reportData.find((s) => s.name === selectedShowroom);
  }, [reportData, selectedShowroom]);

  // Calculate statistics for selected showroom
  const stats = useMemo(() => {
    if (!currentShowroomData) return null;

    const data = currentShowroomData.data;
    return {
      totalVisitors: data.reduce((sum, d) => sum + d.visitors, 0),
      avgAccuracy: (data.reduce((sum, d) => sum + d.accuracy, 0) / data.length).toFixed(1),
      avgPerformance: (data.reduce((sum, d) => sum + d.performance, 0) / data.length).toFixed(1),
      totalSales: data.reduce((sum, d) => sum + d.sales, 0),
    };
  }, [currentShowroomData]);

  const handleGenerateReport = async () => {
    if (!selectedShowroom) {
      setToastMessage('Please select a showroom');
      setShowToast(true);
      return;
    }

    setIsGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setToastMessage('Report generated successfully!');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Failed to generate report');
      setShowToast(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadExcel = () => {
    if (!currentShowroomData) return;

    const worksheetData: any[] = [];

    worksheetData.push(['Showroom Report']);
    worksheetData.push([currentShowroomData.name]);
    worksheetData.push([`Generated on: ${new Date().toLocaleDateString()}`]);
    worksheetData.push(['', '', '', '', '']);

    // Add summary
    worksheetData.push(['Summary Statistics', '', '', '', '']);
    worksheetData.push(['Total Visitors', stats?.totalVisitors]);
    worksheetData.push(['Average Accuracy', `${stats?.avgAccuracy}%`]);
    worksheetData.push(['Average Performance', `${stats?.avgPerformance}%`]);
    worksheetData.push(['Total Sales', `$${stats?.totalSales}`]);
    worksheetData.push(['', '', '', '', '']);

    // Add detail data
    worksheetData.push(['Day', 'Visitors', 'Accuracy %', 'Performance %', 'Sales']);
    currentShowroomData.data.forEach((day) => {
      worksheetData.push([
        day.day,
        day.visitors,
        day.accuracy,
        day.performance,
        `$${day.sales}`,
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.writeFile(workbook, `${currentShowroomData.name}-report-${new Date().toISOString().split('T')[0]}.xlsx`);
    setToastMessage('Excel file downloaded successfully!');
    setShowToast(true);
  };

  const handleDownloadPDF = () => {
    if (!currentShowroomData || !stats) return;

    const pdf = new jsPDF();

    // Title
    pdf.setFontSize(18);
    pdf.text('Showroom Performance Report', 14, 15);

    // Showroom Name
    pdf.setFontSize(14);
    pdf.text(currentShowroomData.name, 14, 25);

    // Date
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

    let yPosition = 42;

    // Add summary section
    pdf.setFontSize(12);
    pdf.text('Summary Statistics', 14, yPosition);
    yPosition += 8;

    const summaryData = [
      ['Total Visitors', stats.totalVisitors.toString()],
      ['Average Accuracy', `${stats.avgAccuracy}%`],
      ['Average Performance', `${stats.avgPerformance}%`],
      ['Total Sales', `$${stats.totalSales}`],
    ];

    autoTable(pdf, {
      head: [['Metric', 'Value']],
      body: summaryData,
      startY: yPosition,
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      bodyStyles: { textColor: 50 },
      margin: { left: 14, right: 14 },
    });

    yPosition = (pdf as any).lastAutoTable.finalY + 15;

    // Add detailed data table
    pdf.setFontSize(12);
    pdf.text('Daily Performance', 14, yPosition);
    yPosition += 8;

    const tableData = currentShowroomData.data.map((day) => [
      day.day,
      day.visitors.toString(),
      `${day.accuracy}%`,
      `${day.performance}%`,
      `$${day.sales}`,
    ]);

    autoTable(pdf, {
      head: [['Day', 'Visitors', 'Accuracy', 'Performance', 'Sales']],
      body: tableData,
      startY: yPosition,
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      bodyStyles: { textColor: 50 },
      margin: { left: 14, right: 14 },
    });

    pdf.save(`${currentShowroomData.name}-report-${new Date().toISOString().split('T')[0]}.pdf`);
    setToastMessage('PDF file downloaded successfully!');
    setShowToast(true);
  };

  return (
    <div className="min-h-screen p-8 bg--white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Reports</h1>
          <p className="text-slate-600 text-lg">Generate and analyze showroom performance reports</p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 mb-10">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Filter size={20} />
            Filters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
            {/* Showroom Dropdown */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">Select Showroom</label>
              <select
                value={selectedShowroom}
                onChange={(e) => setSelectedShowroom(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition bg-white text-slate-900 font-medium"
              >
                {reportData.map((showroom) => (
                  <option key={showroom.id} value={showroom.name}>
                    {showroom.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                <Calendar size={16} className="inline mr-2" />
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-bold text-slate-900 mb-3">
                <Calendar size={16} className="inline mr-2" />
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 transition"
              />
            </div>

            {/* Generate Report Button */}
            <button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm"
            >
              <FileText size={16} />
              {isGenerating ? 'Generating...' : 'Generate'}
            </button>

            {/* Download Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleDownloadExcel}
                className="flex-1 px-3 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition text-sm"
                title="Download Excel"
              >
                <Download size={16} />
                Excel
              </button>
              <button
                onClick={handleDownloadPDF}
                className="flex-1 px-3 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold flex items-center justify-center gap-1 transition text-sm"
                title="Download PDF"
              >
                <Download size={16} />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Visitors</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalVisitors}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Avg Accuracy</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.avgAccuracy}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Avg Performance</p>
              <p className="text-3xl font-bold text-blue-600">{stats.avgPerformance}%</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Total Sales</p>
              <p className="text-3xl font-bold text-purple-600">${stats.totalSales}</p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {currentShowroomData && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
            {/* Visitors Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Visitors Trend</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={currentShowroomData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="visitors"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Performance %</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={currentShowroomData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="performance" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Accuracy Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Accuracy %</h3>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={currentShowroomData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Sales Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Sales</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={currentShowroomData.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any) => `$${value}`}
                  />
                  <Bar dataKey="sales" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
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