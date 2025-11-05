import React from "react";
import OfficeDashboardChartsClient, { VisitorTrendData } from "@/components/OfficeDashboardChartsClient";

function generateVisitorTrendData(): VisitorTrendData[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day) => ({
    day,
    visitors: Math.floor(Math.random() * 400) + 200,
    accuracy: Math.floor(Math.random() * 20) + 75,
  }));
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 90) return 'text-emerald-600';
  if (accuracy >= 80) return 'text-cyan-600';
  if (accuracy >= 70) return 'text-amber-600';
  return 'text-rose-600';
}

function getStatusColor(status: string): string {
  return status === 'Active'
    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    : 'bg-slate-50 text-slate-700 border border-slate-200';
}

interface ShowroomPerformance {
  id: number;
  showroomName: string;
  visitorsToday: number;
  accuracy: number;
  performance: number;
  status: 'Active' | 'Inactive';
}

function generateShowroomPerformanceData(): ShowroomPerformance[] {
  const showrooms = ['Showroom A', 'Showroom B', 'Showroom C', 'Showroom D', 'Showroom E'];
  return showrooms.map((name, index) => ({
    id: index + 1,
    showroomName: name,
    visitorsToday: Math.floor(Math.random() * 400) + 100,
    accuracy: Math.floor(Math.random() * 30) + 70,
    performance: Math.floor(Math.random() * 40) + 60,
    status: Math.random() > 0.2 ? 'Active' : 'Inactive',
  }));
}

export default async function OfficeDashboardServer() {
  const visitorTrendData = generateVisitorTrendData();
  const showroomPerformanceData = generateShowroomPerformanceData();

  const totalVisitors = visitorTrendData.reduce((sum, d) => sum + d.visitors, 0);
  const avgAccuracy = (
    visitorTrendData.reduce((sum, d) => sum + d.accuracy, 0) / visitorTrendData.length
  ).toFixed(1);
  const avgPerformance = (
    showroomPerformanceData.reduce((sum, s) => sum + s.performance, 0) / showroomPerformanceData.length
  ).toFixed(1);

  return (
    <div className="min-h-screen p-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
          <p className="text-slate-600 text-lg">Welcome back! Here's your business performance overview.</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Total Visitors Today */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Total Visitors Today</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-5xl font-bold text-slate-900">{totalVisitors}</p>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
                    <span className="text-sm font-semibold text-emerald-600">12%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3">vs previous week</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                {/* icon placeholder */}
                <span className="w-8 h-8 inline-block">👥</span>
              </div>
            </div>
          </div>

          {/* Data Accuracy */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Data Accuracy</p>
                <div className="flex items-baseline gap-3">
                  <p className={`text-5xl font-bold ${getAccuracyColor(parseFloat(avgAccuracy))}`}>
                    {avgAccuracy}%
                  </p>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
                    <span className="text-sm font-semibold text-emerald-600">2%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3">system wide average</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl">
                <span className="w-8 h-8 inline-block">📈</span>
              </div>
            </div>
          </div>

          {/* Avg Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 hover:shadow-md transition-shadow duration-300">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Avg Performance</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-5xl font-bold text-slate-900">{avgPerformance}%</p>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg">
                    <span className="text-sm font-semibold text-emerald-600">5%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3">per showroom</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                <span className="w-8 h-8 inline-block">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts (client) */}
        <OfficeDashboardChartsClient visitorTrendData={visitorTrendData} />

        {/* Performance Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">Showroom Performance Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Showroom</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Visitors</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Accuracy</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Performance</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {showroomPerformanceData.map((showroom, idx) => (
                  <tr key={showroom.id} className={`border-b border-slate-100 hover:bg-slate-50 transition ${idx !== showroomPerformanceData.length - 1 ? '' : 'border-b-0'}`}>
                    <td className="px-8 py-5 text-sm font-semibold text-slate-900">{showroom.showroomName}</td>
                    <td className="px-8 py-5 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600">👥</span>
                        <span className="font-semibold text-slate-900">{showroom.visitorsToday}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getAccuracyColor(showroom.accuracy)}`}>{showroom.accuracy}%</span>
                    </td>
                    <td className="px-8 py-5 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-28 bg-slate-200 rounded-full h-2">
                          <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" style={{ width: `${showroom.performance}%` }} />
                        </div>
                        <span className="font-semibold text-slate-900 text-xs min-w-[40px]">{showroom.performance}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm">
                      <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getStatusColor(showroom.status)}`}>{showroom.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
