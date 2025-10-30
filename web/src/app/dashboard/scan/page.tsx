'use client'

import { useState, useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { assetAPI } from '@/lib/api'
import { toast } from 'sonner'
import { QrCode, CheckCircle, XCircle } from 'lucide-react'
import { getStatusColor, getStatusLabel } from '@/lib/utils'

export default function ScanPage() {
  const [scanning, setScanning] = useState(false)
  const [asset, setAsset] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null
    let isCleanedUp = false

    // Small delay to prevent double initialization
    const timeoutId = setTimeout(() => {
      if (isCleanedUp) return

      try {
        // Clear any existing scanner first
        const existingElement = document.getElementById('qr-reader')
        if (existingElement) {
          existingElement.innerHTML = ''
        }

        // Initialize QR scanner
        scanner = new Html5QrcodeScanner(
          'qr-reader',
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            rememberLastUsedCamera: true
          },
          false
        )

        const onScanSuccess = async (decodedText: string) => {
          if (isCleanedUp) return

          if (scanner) {
            setScanning(false)
            scanner.clear().catch(() => {})
          }
          
          try {
            // Extract asset ID from URL
            const urlMatch = decodedText.match(/\/asset\/(\d+)/)
            if (!urlMatch) {
              setError('Invalid QR code format')
              toast.error('Invalid QR code')
              return
            }

            const assetId = urlMatch[1]
            
            // Fetch asset details
            const response = await assetAPI.getById(parseInt(assetId))
            setAsset(response.data.data.asset)
            setError(null)
            toast.success('Asset found!')
          } catch (err: any) {
            setError(err.response?.data?.message || 'Asset not found')
            toast.error('Asset not found')
            setAsset(null)
          }
        }

        const onScanError = (error: any) => {
          // Ignore scanning errors (they happen frequently during scanning)
          // Only log permission errors
          if (typeof error === 'string' && (error.includes('NotAllowedError') || error.includes('Permission'))) {
            setCameraError('Camera permission denied. Please allow camera access and refresh.')
          }
        }

        // Render scanner
        try {
          scanner.render(onScanSuccess, onScanError)
          setScanning(true)
          setCameraError(null)
        } catch (renderErr: any) {
          console.error('Scanner render error:', renderErr)
          setCameraError('Failed to start camera. Please check permissions.')
          setScanning(false)
        }
      } catch (err: any) {
        console.error('Scanner setup error:', err)
        setCameraError('Failed to initialize scanner. Please refresh the page.')
      }
    }, 100)

    return () => {
      isCleanedUp = true
      clearTimeout(timeoutId)
      if (scanner) {
        scanner.clear().catch(() => {})
      }
    }
  }, [])

  const handleReset = () => {
    setAsset(null)
    setError(null)
    window.location.reload()
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Scan QR Code</h1>
        <p className="text-gray-600 mt-1">Scan an asset QR code to view its details</p>
      </div>

      <style jsx global>{`
        #qr-reader {
          width: 100% !important;
          min-height: 400px;
        }
        #qr-reader video {
          width: 100% !important;
          height: auto !important;
          border-radius: 8px;
        }
        #qr-reader__dashboard {
          margin-top: 1rem;
        }
        #qr-reader__dashboard_section_csr button {
          background-color: #3b82f6 !important;
          color: white !important;
          padding: 8px 16px !important;
          border-radius: 6px !important;
          border: none !important;
        }
      `}</style>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <QrCode className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold">QR Scanner</h2>
          </div>
          
          <div id="qr-reader" className="rounded-lg overflow-hidden" style={{ minHeight: '400px' }}></div>
          
          {cameraError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{cameraError}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Refresh Page
              </button>
            </div>
          )}
          
          {scanning && !cameraError && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-500 text-center">
                Position the QR code within the frame to scan
              </p>
              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Camera active
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Scan Result</h2>
          
          {!asset && !error && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <QrCode className="w-16 h-16 mb-4" />
              <p>No asset scanned yet</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Scan Again
              </button>
            </div>
          )}

          {asset && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{asset.name}</h3>
                  <p className="text-sm text-gray-500">{asset.serial_number}</p>
                </div>
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(asset.status)}`}>
                  {getStatusLabel(asset.status)}
                </span>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Department</p>
                  <p className="text-gray-900">{asset.department_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 font-medium">Location</p>
                  <p className="text-gray-900">{asset.location || 'N/A'}</p>
                </div>
                {asset.purchase_date && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Purchase Date</p>
                    <p className="text-gray-900">{new Date(asset.purchase_date).toLocaleDateString()}</p>
                  </div>
                )}
                {asset.description && (
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Description</p>
                    <p className="text-gray-900">{asset.description}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <a
                  href={`/dashboard/assets/${asset.id}`}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-center"
                >
                  View Details
                </a>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Scan Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
