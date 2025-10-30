const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserActivity
} = require('../controllers/user.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { idValidation } = require('../middleware/validator');

// Admin only routes
router.get('/', authenticateToken, requireAdmin, getUsers);
router.get('/:id', authenticateToken, requireAdmin, idValidation, getUserById);
router.put('/:id', authenticateToken, requireAdmin, idValidation, updateUser);
router.delete('/:id', authenticateToken, requireAdmin, idValidation, deleteUser);
router.get('/:id/activity', authenticateToken, requireAdmin, idValidation, getUserActivity);

module.exports = router;
