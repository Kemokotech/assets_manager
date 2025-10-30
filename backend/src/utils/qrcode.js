const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure QR code directory exists
const qrDir = path.join(process.env.UPLOAD_PATH || './uploads', 'qrcodes');
if (!fs.existsSync(qrDir)) {
  fs.mkdirSync(qrDir, { recursive: true });
}

/**
 * Generate QR code for an asset
 * @param {number} assetId - Asset ID
 * @returns {Promise<string>} - Path to generated QR code image
 */
const generateAssetQRCode = async (assetId) => {
  try {
    // Create unique filename
    const filename = `qr-${assetId}-${uuidv4()}.png`;
    const filepath = path.join(qrDir, filename);

    // Generate asset URL that the QR code will encode
    const assetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/asset/${assetId}`;

    // Generate QR code with options
    await QRCode.toFile(filepath, assetUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      quality: 0.95,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });

    // Return relative path for storage in database
    return `/uploads/qrcodes/${filename}`;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate QR code as data URL (base64)
 * @param {string} data - Data to encode
 * @returns {Promise<string>} - Base64 data URL
 */
const generateQRCodeDataURL = async (data) => {
  try {
    const dataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 300
    });

    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code data URL:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Delete QR code file
 * @param {string} qrCodePath - Path to QR code file
 */
const deleteQRCode = (qrCodePath) => {
  if (!qrCodePath) return;

  try {
    const fullPath = path.join(__dirname, '../../', qrCodePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  } catch (error) {
    console.error('Error deleting QR code:', error);
  }
};

module.exports = {
  generateAssetQRCode,
  generateQRCodeDataURL,
  deleteQRCode
};
