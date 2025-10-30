const { body, param, query, validationResult } = require('express-validator');

// Validation middleware to check for errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'staff']).withMessage('Invalid role'),
  validate
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

// Asset validation rules
const createAssetValidation = [
  body('name').trim().notEmpty().withMessage('Asset name is required'),
  body('serial_number').trim().notEmpty().withMessage('Serial number is required'),
  body('department_id').optional().isInt().withMessage('Department ID must be an integer'),
  body('location').optional().trim(),
  body('status').optional().isIn(['active', 'under_repair', 'disposed', 'missing']).withMessage('Invalid status'),
  body('purchase_date').optional().isISO8601().withMessage('Invalid date format'),
  body('description').optional().trim(),
  validate
];

const updateAssetValidation = [
  param('id').isInt().withMessage('Invalid asset ID'),
  body('name').optional().trim().notEmpty().withMessage('Asset name cannot be empty'),
  body('serial_number').optional().trim().notEmpty().withMessage('Serial number cannot be empty'),
  body('department_id').optional().isInt().withMessage('Department ID must be an integer'),
  body('location').optional().trim(),
  body('status').optional().isIn(['active', 'under_repair', 'disposed', 'missing']).withMessage('Invalid status'),
  body('purchase_date').optional().isISO8601().withMessage('Invalid date format'),
  body('description').optional().trim(),
  validate
];

// Department validation rules
const createDepartmentValidation = [
  body('name').trim().notEmpty().withMessage('Department name is required'),
  body('description').optional().trim(),
  validate
];

// ID parameter validation
const idValidation = [
  param('id').isInt().withMessage('Invalid ID'),
  validate
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  createAssetValidation,
  updateAssetValidation,
  createDepartmentValidation,
  idValidation
};
