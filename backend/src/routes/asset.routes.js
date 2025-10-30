const express = require('express');
const router = express.Router();
const {
  createAsset,
  getAssets,
  getAssetById,
  getAssetBySerial,
  updateAsset,
  deleteAsset,
  getAssetQRCode,
  getAssetActivity
} = require('../controllers/asset.controller');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');
const { createAssetValidation, updateAssetValidation, idValidation } = require('../middleware/validator');
const upload = require('../middleware/upload');

// Public routes (with optional auth for logging)
router.get('/serial/:serial', optionalAuth, getAssetBySerial);

// Protected routes - All users
router.get('/', authenticateToken, getAssets);
router.get('/:id', authenticateToken, idValidation, getAssetById);
router.get('/:id/qrcode', authenticateToken, idValidation, getAssetQRCode);
router.get('/:id/activity', authenticateToken, idValidation, getAssetActivity);

// Protected routes - Admin only
router.post('/', authenticateToken, requireAdmin, upload.single('image'), createAssetValidation, createAsset);
router.put('/:id', authenticateToken, requireAdmin, upload.single('image'), updateAssetValidation, updateAsset);
router.delete('/:id', authenticateToken, requireAdmin, idValidation, deleteAsset);

module.exports = router;
