'use client'

import { useEffect, useState } from 'react'
import { assetAPI, departmentAPI } from '@/lib/api'
import { Plus, Search, Filter, Eye, Edit, Trash2, Download, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { getStatusColor, getStatusLabel } from '@/lib/utils'
import Image from 'next/image'

export default function AssetsPage() {
  const user = useAuthStore((state) => state.user)
  const [assets, setAssets] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')

  useEffect(() => {
    fetchAssets()
    fetchDepartments()
  }, [searchQuery, statusFilter, departmentFilter])

  const fetchAssets = async () => {
    try {
      const response = await assetAPI.getAll({
        search: searchQuery,
        status: statusFilter,
        department_id: departmentFilter
      })
      setAssets(response.data.data.assets)
    } catch (error) {
      toast.error('Failed to fetch assets')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll()
      setDepartments(response.data.data.departments)
    } catch (error) {
      console.error('Failed to fetch departments')
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      await assetAPI.delete(id)
      toast.success('Asset deleted successfully')
      fetchAssets()
    } catch (error) {
      toast.error('Failed to delete asset')
    }
  }

  const downloadQRCode = async (id: number, name: string) => {
    try {
      const response = await assetAPI.getQRCode(id)
      const { qrCode } = response.data.data
      
      const link = document.createElement('a')
      link.href = qrCode
      link.download = `qr-${name.replace(/\s+/g, '-')}.png`
      link.click()
      
      toast.success('QR Code downloaded')
    } catch (error) {
      toast.error('Failed to download QR code')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
          <p className="text-gray-600 mt-1">Manage all company assets</p>
        </div>
        {user?.role === 'admin' && (
          <a
            href="/dashboard/assets/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
          >
            <Plus className="w-5 h-5" />
            Add Asset
          </a>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="under_repair">Under Repair</option>
            <option value="disposed">Disposed</option>
            <option value="missing">Missing</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
            {/* Image */}
            <div className="relative h-48 bg-gray-100">
              {asset.image_url ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${asset.image_url}`}
                  alt={asset.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Package className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-lg">{asset.name}</h3>
                  <p className="text-sm text-gray-500">{asset.serial_number}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                  {getStatusLabel(asset.status)}
                </span>
              </div>

              <div className="space-y-1 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Department:</span> {asset.department_name || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Location:</span> {asset.location || 'N/A'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <a
                  href={`/dashboard/assets/${asset.id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  <Eye className="w-4 h-4" />
                  View
                </a>
                <button
                  onClick={() => downloadQRCode(asset.id, asset.name)}
                  className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                  title="Download QR"
                >
                  <Download className="w-4 h-4" />
                </button>
                {user?.role === 'admin' && (
                  <>
                    <a
                      href={`/dashboard/assets/${asset.id}/edit`}
                      className="px-3 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(asset.id, asset.name)}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {assets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No assets found</p>
        </div>
      )}
    </div>
  )
}
