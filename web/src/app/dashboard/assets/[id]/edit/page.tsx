'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { assetAPI, departmentAPI } from '@/lib/api'
import { ArrowLeft, Upload } from 'lucide-react'

interface AssetFormData {
  name: string
  serial_number: string
  department_id: string
  location: string
  status: string
  purchase_date: string
  description: string
}

export default function EditAssetPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [departments, setDepartments] = useState<any[]>([])
  const [asset, setAsset] = useState<any>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AssetFormData>()

  useEffect(() => {
    Promise.all([fetchAsset(), fetchDepartments()])
  }, [params.id])

  const fetchAsset = async () => {
    try {
      const response = await assetAPI.getById(parseInt(params.id))
      const assetData = response.data.data.asset
      setAsset(assetData)
      setImagePreview(assetData.image_url || '')
      
      // Reset form with asset data
      reset({
        name: assetData.name,
        serial_number: assetData.serial_number,
        department_id: assetData.department_id?.toString() || '',
        location: assetData.location || '',
        status: assetData.status,
        purchase_date: assetData.purchase_date ? assetData.purchase_date.split('T')[0] : '',
        description: assetData.description || '',
      })
    } catch (error) {
      toast.error('Failed to load asset')
      router.push('/dashboard/assets')
    } finally {
      setLoading(false)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll()
      setDepartments(response.data.data.departments)
    } catch (error) {
      toast.error('Failed to load departments')
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const onSubmit = async (data: AssetFormData) => {
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('name', data.name)
      formData.append('serial_number', data.serial_number)
      formData.append('department_id', data.department_id)
      formData.append('location', data.location)
      formData.append('status', data.status)
      formData.append('purchase_date', data.purchase_date)
      formData.append('description', data.description)
      
      if (imageFile) {
        formData.append('image', imageFile)
      }

      await assetAPI.update(parseInt(params.id), formData)
      toast.success('Asset updated successfully!')
      router.push(`/dashboard/assets/${params.id}`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update asset')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold">Edit Asset</h1>
        <p className="text-gray-600 mt-2">Update asset information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Asset Image</label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null)
                      setImagePreview('')
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <label className="cursor-pointer text-blue-600 hover:text-blue-700">
                    <span>Click to upload image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Asset Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Asset Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
          </div>

          {/* Serial Number */}
          <div>
            <label className="block text-sm font-medium mb-2">Serial Number *</label>
            <input
              {...register('serial_number', { required: 'Serial number is required' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {errors.serial_number && <p className="text-red-600 text-sm mt-1">{errors.serial_number.message}</p>}
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-2">Department *</label>
            <select
              {...register('department_id', { required: 'Department is required' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department_id && <p className="text-red-600 text-sm mt-1">{errors.department_id.message}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-2">Location</label>
            <input
              {...register('location')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status *</label>
            <select
              {...register('status', { required: 'Status is required' })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="under_repair">Under Repair</option>
              <option value="disposed">Disposed</option>
              <option value="missing">Missing</option>
            </select>
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Purchase Date</label>
            <input
              type="date"
              {...register('purchase_date')}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Asset'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
