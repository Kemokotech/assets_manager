const express = require('express');
const router = express.Router();
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} = require('../controllers/department.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createDepartmentValidation, idValidation } = require('../middleware/validator');

// All users can view departments
router.get('/', authenticateToken, getDepartments);
router.get('/:id', authenticateToken, idValidation, getDepartmentById);

// Admin only
router.post('/', authenticateToken, requireAdmin, createDepartmentValidation, createDepartment);
router.put('/:id', authenticateToken, requireAdmin, idValidation, updateDepartment);
router.delete('/:id', authenticateToken, requireAdmin, idValidation, deleteDepartment);

module.exports = router;
