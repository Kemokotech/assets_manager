const AssetModel = require('../models/asset.model');
const ActivityLogModel = require('../models/activityLog.model');
const { generateAssetQRCode, generateQRCodeDataURL, deleteQRCode } = require('../utils/qrcode');
const { query } = require('../config/database');
const path = require('path');
const fs = require('fs');

// Create a new asset
const createAsset = async (req, res, next) => {
  try {
    const assetData = {
      ...req.body,
      created_by: req.user.id
    };

    // Handle image upload
    if (req.file) {
      assetData.image_url = `/uploads/images/${req.file.filename}`;
    }

    // Create asset first to get ID
    const asset = await AssetModel.create(assetData);

    // Generate QR code for the asset
    const qrCodePath = await generateAssetQRCode(asset.id);
    
    // Update asset with QR code path
    const updatedAsset = await AssetModel.update(asset.id, { qr_code_path: qrCodePath });

    // Log activity
    await ActivityLogModel.create({
      user_id: req.user.id,
      asset_id: asset.id,
      action: 'CREATE_ASSET',
      details: `Created asset: ${asset.name}`,
      ip_address: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Asset created successfully',
      data: { asset: updatedAsset }
    });
  } catch (error) {
    next(error);
  }
};

// Get all assets with filters
const getAssets = async (req, res, next) => {
  try {
    const filters = {
      status: req.query.status,
      department_id: req.query.department_id,
      search: req.query.search,
      limit: parseInt(req.query.limit) || undefined,
      offset: parseInt(req.query.offset) || undefined
    };

    const assetRows = await AssetModel.findAll(filters);

    // Map qr_code_path to qr_code_url for all assets
    const assets = assetRows.map(asset => ({
      ...asset,
      qr_code_url: asset.qr_code_path || null
    }));

    res.json({
      success: true,
      data: {
        assets,
        total: assets.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single asset by ID
const getAssetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const asset = await AssetModel.findById(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Map qr_code_path to qr_code_url for frontend consistency
    if (asset.qr_code_path) {
      asset.qr_code_url = asset.qr_code_path;
    }

    // Log activity
    await ActivityLogModel.create({
      user_id: req.user?.id || null,
      asset_id: asset.id,
      action: 'VIEW_ASSET',
      details: `Viewed asset: ${asset.name}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      data: { asset }
    });
  } catch (error) {
    next(error);
  }
};

// Get asset by serial number (for QR scanning)
const getAssetBySerial = async (req, res, next) => {
  try {
    const { serial } = req.params;
    const asset = await AssetModel.findBySerialNumber(serial);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found',
        code: 'ASSET_NOT_FOUND'
      });
    }

    // Log activity
    await ActivityLogModel.create({
      user_id: req.user?.id || null,
      asset_id: asset.id,
      action: 'SCAN_ASSET',
      details: `Scanned asset: ${asset.name}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      data: { asset }
    });
  } catch (error) {
    next(error);
  }
};

// Update asset
const updateAsset = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if asset exists
    const existingAsset = await AssetModel.findById(id);
    if (!existingAsset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    const updateData = { ...req.body };

    // Handle image upload
    if (req.file) {
      updateData.image_url = `/uploads/images/${req.file.filename}`;
      
      // Delete old image if exists
      if (existingAsset.image_url) {
        const oldImagePath = path.join(__dirname, '../../', existingAsset.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
    }

    const updatedAsset = await AssetModel.update(id, updateData);

    // Log activity
    await ActivityLogModel.create({
      user_id: req.user.id,
      asset_id: id,
      action: 'UPDATE_ASSET',
      details: `Updated asset: ${updatedAsset.name}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Asset updated successfully',
      data: { asset: updatedAsset }
    });
  } catch (error) {
    next(error);
  }
};

// Delete asset
const deleteAsset = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if asset exists
    const asset = await AssetModel.findById(id);
    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Log activity BEFORE deleting (so we can reference the asset_id)
    await ActivityLogModel.create({
      user_id: req.user.id,
      asset_id: id,
      action: 'DELETE_ASSET',
      details: `Deleted asset: ${asset.name}`,
      ip_address: req.ip
    });

    // Delete associated files
    if (asset.image_url) {
      const imagePath = path.join(__dirname, '../../', asset.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (asset.qr_code_path) {
      deleteQRCode(asset.qr_code_path);
    }

    // Delete all activity logs for this asset first
    await query('DELETE FROM activity_log WHERE asset_id = $1', [id]);

    // Now delete the asset
    await AssetModel.delete(id);

    res.json({
      success: true,
      message: 'Asset deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get QR code for asset
const getAssetQRCode = async (req, res, next) => {
  try {
    const { id } = req.params;
    const asset = await AssetModel.findById(id);

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: 'Asset not found'
      });
    }

    // Generate QR code as data URL
    const assetUrl = `${process.env.APP_URL || 'http://localhost:3000'}/asset/${id}`;
    const qrCodeDataURL = await generateQRCodeDataURL(assetUrl);

    res.json({
      success: true,
      data: {
        qrCode: qrCodeDataURL,
        assetUrl
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get asset activity log
const getAssetActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const logs = await ActivityLogModel.getAssetLogs(id);

    res.json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAsset,
  getAssets,
  getAssetById,
  getAssetBySerial,
  updateAsset,
  deleteAsset,
  getAssetQRCode,
  getAssetActivity
};
