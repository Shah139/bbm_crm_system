'use client';

import { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Download, Calendar, Plus, X, Edit2, Trash2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Toast  from '@/components/Toast';

interface ReportItem {
  id: number;
  showroom: string;
  category: string;
  customerCount: number;
  feedbackCount: number;
  prevMonthPerformance: number;
  date: Date;
}

interface TableRow {
  showroom: string;
  customerCount: number;
  feedbackCount: number;
  performancePercentages: number[];
  avgPerformance: number;
}

interface ChartDatum {
  name: string;
  value: number;
  [key: string]: string | number;
}

// Mock data generator
const generateMockReportData = (): ReportItem[] => {
  const showrooms = ['Showroom A', 'Showroom B', 'Showroom C', 'Showroom D'];
  const categories = ['Electronics', 'Furniture', 'Clothing', 'Home & Garden'];
  const data: ReportItem[] = [];

  for (let i = 0; i < 50; i++) {
    data.push({
      id: i + 1,
      showroom: showrooms[Math.floor(Math.random() * showrooms.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      customerCount: Math.floor(Math.random() * 500) + 50,
      feedbackCount: Math.floor(Math.random() * 200) + 10,
      prevMonthPerformance: Math.floor(Math.random() * 40) + 60,
      date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    });
  }

  return data;
};

export default function ReportsPage() {
  const [allData, setAllData] = useState<ReportItem[]>(generateMockReportData());
  const [dateRange, setDateRange] = useState<'last30' | 'thisMonth' | 'lastMonth'>('last30');
  const [selectedShowroom, setSelectedShowroom] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    customerCount: '',
    feedbackCount: '',
    performancePercentage: '',
  });

  const categories = ['Electronics', 'Furniture', 'Clothing', 'Home & Garden'];
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  // Get all unique showrooms from data
  const showrooms = useMemo(() => {
    return Array.from(new Set(allData.map(item => item.showroom)));
  }, [allData]);

  // Filter data based on selected filters
  const filteredData = useMemo<ReportItem[]>(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return allData.filter((item: ReportItem) => {
      let dateMatch = true;

      if (dateRange === 'last30') {
        dateMatch = item.date >= thirtyDaysAgo;
      } else if (dateRange === 'thisMonth') {
        dateMatch =
          item.date.getMonth() === now.getMonth() &&
          item.date.getFullYear() === now.getFullYear();
      } else if (dateRange === 'lastMonth') {
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        dateMatch = item.date >= lastMonth && item.date <= lastMonthEnd;
      }

      const showroomMatch =
        selectedShowroom === 'all' || item.showroom === selectedShowroom;
      const categoryMatch =
        selectedCategory === 'all' || item.category === selectedCategory;

      return dateMatch && showroomMatch && categoryMatch;
    });
  }, [allData, dateRange, selectedShowroom, selectedCategory]);

  // Aggregate data by showroom
  const tableData = useMemo<TableRow[]>(() => {
    const aggregated: Record<string, Omit<TableRow, 'avgPerformance'>> = {};

    filteredData.forEach((item) => {
      if (!aggregated[item.showroom]) {
        aggregated[item.showroom] = {
          showroom: item.showroom,
          customerCount: 0,
          feedbackCount: 0,
          performancePercentages: [],
        };
      }

      aggregated[item.showroom].customerCount += item.customerCount;
      aggregated[item.showroom].feedbackCount += item.feedbackCount;
      aggregated[item.showroom].performancePercentages.push(
        item.prevMonthPerformance
      );
    });

    return Object.values(aggregated).map((item) => ({
      showroom: item.showroom,
      customerCount: item.customerCount,
      feedbackCount: item.feedbackCount,
      performancePercentages: item.performancePercentages,
      avgPerformance: Math.round(
        item.performancePercentages.reduce((a: number, b: number) => a + b, 0) /
        item.performancePercentages.length
      ),
    }));
  }, [filteredData]);

  // Prepare chart data - Category interest ratio
  const chartData = useMemo<ChartDatum[]>(() => {
    const categoryData: Record<string, number> = {};

    filteredData.forEach((item) => {
      if (!categoryData[item.category]) {
        categoryData[item.category] = 0;
      }
      categoryData[item.category] += item.customerCount;
    });

    return Object.entries(categoryData).map(([name, value]) => ({
      name,
      value: value as number,
    }));
  }, [filteredData]);

  // Handle input change for modal form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle add showroom
  const handleAddShowroom = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.customerCount ||
      !formData.feedbackCount ||
      !formData.performancePercentage
    ) {
      setToastMessage('Please fill in all fields');
      setShowToast(true);
      return;
    }

    if (editingId !== null) {
      // Edit existing showroom
      setAllData(allData.map(item => 
        item.id === editingId 
          ? {
              ...item,
              showroom: formData.name,
              customerCount: parseInt(formData.customerCount),
              feedbackCount: parseInt(formData.feedbackCount),
              prevMonthPerformance: parseInt(formData.performancePercentage),
            }
          : item
      ));
      setToastMessage(`Showroom "${formData.name}" updated successfully!`);
      setEditingId(null);
    } else {
      // Create mock report items for the new showroom
      const newReportItems: ReportItem[] = [
        {
          id: allData.length + 1,
          showroom: formData.name,
          category: categories[0],
          customerCount: parseInt(formData.customerCount),
          feedbackCount: parseInt(formData.feedbackCount),
          prevMonthPerformance: parseInt(formData.performancePercentage),
          date: new Date(),
        },
      ];

      setAllData([...allData, ...newReportItems]);
      setToastMessage(`Showroom "${formData.name}" added successfully!`);
    }

    setFormData({
      name: '',
      customerCount: '',
      feedbackCount: '',
      performancePercentage: '',
    });
    setIsModalOpen(false);
    setShowToast(true);
  };

  // Handle edit showroom
  const handleEditShowroom = (item: ReportItem) => {
    setEditingId(item.id);
    setFormData({
      name: item.showroom,
      customerCount: item.customerCount.toString(),
      feedbackCount: item.feedbackCount.toString(),
      performancePercentage: item.prevMonthPerformance.toString(),
    });
    setIsModalOpen(true);
  };

  // Handle delete showroom
  const handleDeleteShowroom = (id: number) => {
    setAllData(allData.filter(item => item.id !== id));
    setDeleteConfirmId(null);
    setToastMessage('Showroom deleted successfully!');
    setShowToast(true);
  };

  // Get the first item for each showroom to enable edit/delete
  const showroomMap = useMemo(() => {
    const map: Record<string, ReportItem> = {};
    filteredData.forEach(item => {
      if (!map[item.showroom]) {
        map[item.showroom] = item;
      }
    });
    return map;
  }, [filteredData]);

  // Export to Excel
  const handleExcelExport = () => {
    const worksheetData = tableData.map((item) => ({
      'Showroom Name': item.showroom,
      'Customer Count': item.customerCount,
      'Feedback Count': item.feedbackCount,
      'Performance %': item.avgPerformance,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');

    // Set column widths
    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    XLSX.writeFile(workbook, 'reports.xlsx');
  };

  // Export to PDF
  const handlePdfExport = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();

    // Title
    pdf.setFontSize(16);
    pdf.text('Report Summary', 14, 15);

    // Filters info
    pdf.setFontSize(10);
    pdf.text(
      `Filters: Date Range - ${dateRange}, Showroom - ${selectedShowroom}, Category - ${selectedCategory}`,
      14,
      25
    );

    // Table
    const tableColumn = ['Showroom Name', 'Customer Count', 'Feedback Count', 'Performance %'];
    const tableRows = tableData.map((item) => [
      item.showroom,
      item.customerCount,
      item.feedbackCount,
      `${item.avgPerformance}%`,
    ]);

    autoTable(pdf, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      bodyStyles: { textColor: 50 },
      margin: { left: 14, right: 14 },
    });

    // Save
    pdf.save('reports.pdf');
  };

  return (
    <div className="min-h-screen p-8 bg-white" >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
            <p className="text-gray-600">View and analyze showroom performance data</p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({ name: '', customerCount: '', feedbackCount: '', performancePercentage: '' });
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Showroom
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} className="inline mr-2" />
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as 'last30' | 'thisMonth' | 'lastMonth')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="last30">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Table Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {/* Table Header with Export Buttons */}
              <div className="p-6 border-b border-gray-200  flex justify-between items-center">
                <h2 className="hidden md:block text-xl  font-bold text-gray-900">Showroom Performance</h2>
                <div className="flex gap-3">
                  <button
                    onClick={handleExcelExport}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Download size={18} />
                    Excel
                  </button>
                  <button
                    onClick={handlePdfExport}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                  >
                    <Download size={18} />
                    PDF
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Showroom Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Customer Count
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Feedback Count
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Performance %
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.length > 0 ? (
                      tableData.map((item, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-gray-200 hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {item.showroom}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.customerCount}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {item.feedbackCount}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                              {item.avgPerformance}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditShowroom(showroomMap[item.showroom])}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit showroom"
                              >
                                <Edit2 size={18} />
                              </button>
                              <div className="relative">
                                <button
                                  onClick={() => setDeleteConfirmId(deleteConfirmId === showroomMap[item.showroom]?.id ? null : showroomMap[item.showroom]?.id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                  title="Delete showroom"
                                >
                                  <Trash2 size={18} />
                                </button>
                                {deleteConfirmId === showroomMap[item.showroom]?.id && (
                                  <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10 whitespace-nowrap">
                                    <p className="text-sm font-medium text-gray-900 mb-2">Delete this showroom?</p>
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleDeleteShowroom(showroomMap[item.showroom].id)}
                                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                                      >
                                        Delete
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmId(null)}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
                                      >
                                        Cancel
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
                        <td
                          colSpan={5}
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No data available for the selected filters
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl z-20 font-bold text-gray-900 mb-6">
              Category Interest Ratio
            </h2>

            {chartData.length > 0 ? (
              <div className="w-full z-20 h-96 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) =>
                        `${name} ${(((percent as unknown as number) || 0) * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => `${value} customers`}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-gray-500">
                No data available for the selected filters
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center " onClick={() => setIsModalOpen(false)}>
          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>

            {/* Header */}
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {editingId !== null ? 'Edit Showroom' : 'Add New Showroom'}
            </h2>
            <p className="text-gray-600 text-sm mb-6">
              {editingId !== null ? 'Update the showroom details below' : 'Fill in the showroom details below'}
            </p>

            {/* Form */}
            <form onSubmit={handleAddShowroom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Showroom Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Downtown Showroom"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Count
                </label>
                <input
                  type="number"
                  name="customerCount"
                  value={formData.customerCount}
                  onChange={handleInputChange}
                  placeholder="e.g., 250"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Feedback Count
                </label>
                <input
                  type="number"
                  name="feedbackCount"
                  value={formData.feedbackCount}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Performance Percentage
                </label>
                <input
                  type="number"
                  name="performancePercentage"
                  value={formData.performancePercentage}
                  onChange={handleInputChange}
                  placeholder="e.g., 85"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
                />
              </div>

              {/* Buttons */}
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
                  {editingId !== null ? 'Update Showroom' : 'Add Showroom'}
                </button>
              </div>
            </form>
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