const DepartmentModel = require('../models/department.model');
const ActivityLogModel = require('../models/activityLog.model');

// Create a new department
const createDepartment = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Check if department already exists
    const existing = await DepartmentModel.findByName(name);
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Department already exists'
      });
    }

    const department = await DepartmentModel.create({ name, description });

    // Log activity
    await ActivityLogModel.create({
      user_id: req.user.id,
      asset_id: null,
      action: 'CREATE_DEPARTMENT',
      details: `Created department: ${name}`,
      ip_address: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: { department }
    });
  } catch (error) {
    next(error);
  }
};

// Get all departments
const getDepartments = async (req, res, next) => {
  try {
    const includeCount = req.query.include_count === 'true';
    
    let departments;
    if (includeCount) {
      departments = await DepartmentModel.findAllWithAssetCount();
    } else {
      departments = await DepartmentModel.findAll();
    }

    res.json({
      success: true,
      data: { departments }
    });
  } catch (error) {
    next(error);
  }
};

// Get single department by ID
const getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const department = await DepartmentModel.findById(id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.json({
      success: true,
      data: { department }
    });
  } catch (error) {
    next(error);
  }
};

// Update department
const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if department exists
    const existing = await DepartmentModel.findById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const department = await DepartmentModel.update(id, { name, description });

    // Log activity
    await ActivityLogModel.create({
      user_id: req.user.id,
      asset_id: null,
      action: 'UPDATE_DEPARTMENT',
      details: `Updated department: ${name}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Department updated successfully',
      data: { department }
    });
  } catch (error) {
    next(error);
  }
};

// Delete department
const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if department exists
    const department = await DepartmentModel.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    await DepartmentModel.delete(id);

    // Log activity
    await ActivityLogModel.create({
      user_id: req.user.id,
      asset_id: null,
      action: 'DELETE_DEPARTMENT',
      details: `Deleted department: ${department.name}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
};
