"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import OverviewCards, { OverviewStat } from "@/components/OverviewCards";

export default function DashboardContent() {
  const [period, setPeriod] = useState("daily");

  const activityData = [
    { day: "Mon", visitors: 180 },
    { day: "Tue", visitors: 220 },
    { day: "Wed", visitors: 260 },
    { day: "Thu", visitors: 200 },
    { day: "Fri", visitors: 290 },
    { day: "Sat", visitors: 320 },
    { day: "Sun", visitors: 280 },
  ];

  const interestData = [
    { name: "Furniture", value: 35, color: "#8B9F7E" },
    { name: "Electronics", value: 25, color: "#D4C5A9" },
    { name: "Lighting", value: 20, color: "#9FA8C5" },
    { name: "Decor", value: 20, color: "#B8A8D8" },
  ];

  const overviewStats: OverviewStat[] = [
    { title: "Total Customers", value: "12,450", change: "+5%", lastMonth: "Last month 11,850" },
    { title: "Total Showrooms", value: "24", change: "+2%", lastMonth: "Last year 23" },
    { title: "Today’s Visitors", value: "320", change: "+8%", lastMonth: "Yesterday 296" },
    { title: "Overall Performance", value: "96%", change: "+4%", lastMonth: "Last quarter 92%" },
  ];

  const recentActivities = [
    { id: 1, event: "New customer visit at Dhaka showroom", time: "01 Nov 2025, 10:30 AM", icon: "👥" },
    { id: 2, event: "New customer visit at Chattogram showroom", time: "31 Oct 2025, 6:00 PM", icon: "👥" },
    { id: 3, event: "New customer visit at Banani showroom", time: "30 Oct 2025, 4:00 PM", icon: "👥" },
  ];

  const feedbacks = [
    { id: "FB-301", user: "Aisha", comment: "Loved the new furniture designs at Gulshan showroom.", color: "bg-blue-500" },
    { id: "FB-302", user: "Kamal", comment: "Staff were very helpful in product selection.", color: "bg-green-500" },
    { id: "FB-303", user: "Rafi", comment: "Would love more electronics variety.", color: "bg-purple-500" },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-8">
      <OverviewCards stats={overviewStats} />

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Graph (Daily Footfall)</h2>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#999" />
                <YAxis stroke="#999" />
                <Tooltip contentStyle={{ background: "#fff", borderRadius: "8px" }} />
                <Bar dataKey="visitors" fill="#8B9F7E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Interest by Category</h2>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">See Details</a>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={interestData} innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value">
                  {interestData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-2">Top Category</p>
            <p className="text-3xl font-bold text-gray-900">Furniture (35%)</p>
          </div>
          <div className="mt-4 space-y-2">
            {interestData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Activities</h2>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">See All</a>
          </div>
          <div className="space-y-4">
            {recentActivities.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-xl">{item.icon}</div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{item.event}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Feedbacks Overview</h2>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">See All</a>
          </div>
          <div className="space-y-4">
            {feedbacks.map((fb) => (
              <div key={fb.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full ${fb.color} flex items-center justify-center text-white font-bold text-xs`}>
                    {fb.user[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{fb.user}</p>
                    <p className="text-sm text-gray-600 mt-1">{fb.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
