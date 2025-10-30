'use client'

import { useEffect, useState } from 'react'
import { analyticsAPI, assetAPI } from '@/lib/api'
import { Package, Wrench, Trash2, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatDateTime } from '@/lib/utils'

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await analyticsAPI.getDashboard()
      setStats(response.data.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const statusCards = [
    { 
      label: 'Total Assets', 
      value: stats?.totalAssets || 0, 
      icon: Package, 
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    { 
      label: 'Active', 
      value: stats?.statusStats?.active || 0, 
      icon: TrendingUp, 
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    { 
      label: 'Under Repair', 
      value: stats?.statusStats?.under_repair || 0, 
      icon: Wrench, 
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    { 
      label: 'Missing', 
      value: stats?.statusStats?.missing || 0, 
      icon: AlertTriangle, 
      color: 'bg-red-500',
      textColor: 'text-red-600'
    },
  ]

  const COLORS = ['#10b981', '#f59e0b', '#6b7280', '#ef4444']

  const pieData = stats?.assetsByStatus?.map((item: any, index: number) => ({
    name: item.status.replace('_', ' ').toUpperCase(),
    value: parseInt(item.count),
    color: COLORS[index % COLORS.length]
  })) || []

  const barData = stats?.assetsByDepartment?.map((item: any) => ({
    department: item.department,
    assets: parseInt(item.count)
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your asset management system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Status Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Asset Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Assets by Department */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Assets by Department</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="assets" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity & Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Assets */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Added Assets</h2>
          <div className="space-y-3">
            {stats?.recentAssets?.slice(0, 5).map((asset: any) => (
              <div key={asset.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{asset.name}</p>
                  <p className="text-sm text-gray-500">{asset.serial_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">{asset.department_name || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {stats?.recentActivity?.slice(0, 5).map((log: any) => (
              <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{log.action.replace('_', ' ')}</p>
                  <p className="text-xs text-gray-500">{log.user_name || 'System'}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(log.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
