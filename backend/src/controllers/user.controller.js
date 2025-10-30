const UserModel = require('../models/user.model');
const ActivityLogModel = require('../models/activityLog.model');

// Get all users (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const users = await UserModel.findAll();

    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

// Get user by ID (Admin only)
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Update user (Admin only)
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    // Check if user exists
    const existingUser = await UserModel.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const updatedUser = await UserModel.update(id, { name, email, role });

    // Log activity
    await ActivityLogModel.create({
      user_id: req.user.id,
      asset_id: null,
      action: 'UPDATE_USER',
      details: `Updated user: ${updatedUser.name}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent deleting own account
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Check if user exists
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await UserModel.delete(id);

    // Log activity
    await ActivityLogModel.create({
      user_id: req.user.id,
      asset_id: null,
      action: 'DELETE_USER',
      details: `Deleted user: ${user.name}`,
      ip_address: req.ip
    });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user activity logs
const getUserActivity = async (req, res, next) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    const logs = await ActivityLogModel.findAll({
      user_id: id,
      limit
    });

    res.json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserActivity
};
