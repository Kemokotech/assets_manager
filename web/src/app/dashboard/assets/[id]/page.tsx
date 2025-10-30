'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { assetAPI } from '@/lib/api'
import { toast } from 'sonner'
import { ArrowLeft, Edit, Download, Trash2, MapPin, Calendar, Package } from 'lucide-react'
import { formatDate, getStatusLabel, getStatusColor } from '@/lib/utils'

export default function AssetDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [asset, setAsset] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchAsset()
  }, [params.id])

  const fetchAsset = async () => {
    try {
      const response = await assetAPI.getById(parseInt(params.id))
      setAsset(response.data.data.asset)
    } catch (error) {
      toast.error('Failed to load asset')
      router.push('/dashboard/assets')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadQR = async () => {
    try {
      const response = await assetAPI.downloadQR(parseInt(params.id))
      const blob = new Blob([response.data], { type: 'image/png' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `QR-${asset.serial_number}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('QR code downloaded')
    } catch (error) {
      toast.error('Failed to download QR code')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      await assetAPI.delete(parseInt(params.id))
      toast.success('Asset deleted successfully')
      router.push('/dashboard/assets')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete asset')
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!asset) {
    return null
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Assets
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{asset.name}</h1>
            <p className="text-gray-600 mt-2">Serial: {asset.serial_number}</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/dashboard/assets/${params.id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={handleDownloadQR}
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              QR Code
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          {asset.image_url && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Asset Image</h2>
              <img
                src={asset.image_url}
                alt={asset.name}
                className="w-full max-h-96 object-contain rounded-lg"
              />
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(asset.status)}`}>
                    {getStatusLabel(asset.status)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-medium">{asset.location || 'Not specified'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Purchase Date</p>
                  <p className="font-medium">
                    {asset.purchase_date ? formatDate(asset.purchase_date) : 'Not specified'}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Department</p>
                <p className="font-medium">{asset.department_name || 'Not assigned'}</p>
              </div>

              {asset.description && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Description</p>
                  <p className="text-gray-700">{asset.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* QR Code */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">QR Code</h2>
            {asset.qr_code_path ? (
              <div className="text-center">
                <img
                  src={asset.qr_code_path}
                  alt="QR Code"
                  className="w-full max-w-xs mx-auto"
                />
                <button
                  onClick={handleDownloadQR}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-center">QR code not available</p>
            )}
          </div>

          {/* Metadata */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Metadata</h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Created</p>
                <p className="font-medium">{formatDate(asset.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-600">Last Updated</p>
                <p className="font-medium">{formatDate(asset.updated_at)}</p>
              </div>
              <div>
                <p className="text-gray-600">Asset ID</p>
                <p className="font-mono font-medium">#{asset.id}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
