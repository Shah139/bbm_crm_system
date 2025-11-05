'use client'

import React, { useState } from 'react'
import { Search, Bell, X } from 'lucide-react'
import { useMenu } from '@/components/MenuContext'

interface NavbarProps {
  userName?: string
  subtitle?: string
}

interface Notification {
  id: string
  type: 'edit' | 'delete'
  userName: string
  action: string
  timestamp: string
}

export default function Navbar({
  userName = 'John',
  subtitle = 'Explore information and activity about your property',
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const { toggle } = useMenu()

  // Mock notifications data
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'edit',
      userName: 'Sarah Johnson',
      action: 'edited tenant information',
      timestamp: '2 minutes ago',
    },
    {
      id: '2',
      type: 'delete',
      userName: 'Mike Chen',
      action: 'deleted a maintenance record',
      timestamp: '15 minutes ago',
    },
    {
      id: '3',
      type: 'edit',
      userName: 'Emma Davis',
      action: 'updated lease details',
      timestamp: '1 hour ago',
    },
    {
      id: '4',
      type: 'delete',
      userName: 'Alex Rodriguez',
      action: 'removed a user account',
      timestamp: '3 hours ago',
    },
    {
      id: '5',
      type: 'edit',
      userName: 'Lisa Wang',
      action: 'edited property settings',
      timestamp: '5 hours ago',
    },
  ])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search query:', searchQuery)
  }

  const clearNotification = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const unreadCount = notifications.length

  return (
    <div className="bg-[#F7F7F7] border-gray-200 px-4 sm:px-6 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
        {/* Left Section - Greeting */}
        <div className="text-center sm:text-left w-full sm:w-auto flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            className="md:hidden inline-flex flex-col justify-center items-center w-10 h-10 bg-[#D3DDD7] rounded-lg hover:bg-[#c5cdc8] transition"
            aria-label="Open menu"
          >
            <span className="block w-6 h-0.5 bg-[#3E4C3A] mb-1" />
            <span className="block w-6 h-0.5 bg-[#3E4C3A] mb-1" />
            <span className="block w-6 h-0.5 bg-[#3E4C3A]" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Hello, {userName}!
            </h1>
            <p className="text-gray-600 text-sm mt-1 max-w-xs sm:max-w-none mx-auto sm:mx-0">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Right Section - Search & Notifications */}
        <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto">
          <form
            onSubmit={handleSearch}
            className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-auto"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Anything..."
              className="px-4 py-2 rounded-full bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 w-full sm:w-64 md:w-72 transition-all"
            />
            <button
              type="submit"
              className="p-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>

          {/* Notification Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full bg-gray-900 text-white hover:bg-gray-800 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-xs text-gray-500 hover:text-gray-700 transition"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-4 border-b border-gray-100 hover:bg-gray-50 transition flex items-start justify-between gap-3 group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 text-sm">
                              {notif.userName}
                            </p>
                            <span
                              className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                                notif.type === 'edit'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {notif.type === 'edit' ? 'Edited' : 'Deleted'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {notif.action}
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            {notif.timestamp}
                          </p>
                        </div>
                        <button
                          onClick={() => clearNotification(notif.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                          aria-label="Close notification"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center">
                      <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">
                        No notifications yet
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="p-3 border-t border-gray-200 text-center">
                    <a
                      href="#"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                    >
                      View all activity
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  )
}