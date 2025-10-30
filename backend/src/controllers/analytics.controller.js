const AssetModel = require('../models/asset.model');
const ActivityLogModel = require('../models/activityLog.model');
const { query } = require('../config/database');

// Get dashboard statistics
const getDashboardStats = async (req, res, next) => {
  try {
    // Get total asset count
    const totalAssets = await AssetModel.getTotalCount();

    // Get asset count by status
    const assetsByStatus = await AssetModel.getCountByStatus();

    // Get asset count by department
    const assetsByDepartment = await AssetModel.getCountByDepartment();

    // Get recently added assets
    const recentAssets = await AssetModel.getRecentAssets(5);

    // Get recent activity logs
    const recentActivity = await ActivityLogModel.getRecentLogs(10);

    // Calculate status percentages
    const statusStats = assetsByStatus.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalAssets,
        statusStats,
        assetsByStatus,
        assetsByDepartment,
        recentAssets,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get asset statistics
const getAssetStats = async (req, res, next) => {
  try {
    // Total assets
    const totalResult = await query('SELECT COUNT(*) as total FROM assets');
    const total = parseInt(totalResult.rows[0].total);

    // Active assets
    const activeResult = await query("SELECT COUNT(*) as count FROM assets WHERE status = 'active'");
    const active = parseInt(activeResult.rows[0].count);

    // Under repair
    const repairResult = await query("SELECT COUNT(*) as count FROM assets WHERE status = 'under_repair'");
    const underRepair = parseInt(repairResult.rows[0].count);

    // Disposed
    const disposedResult = await query("SELECT COUNT(*) as count FROM assets WHERE status = 'disposed'");
    const disposed = parseInt(disposedResult.rows[0].count);

    // Missing
    const missingResult = await query("SELECT COUNT(*) as count FROM assets WHERE status = 'missing'");
    const missing = parseInt(missingResult.rows[0].count);

    // Assets added this month
    const thisMonthResult = await query(`
      SELECT COUNT(*) as count 
      FROM assets 
      WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
    `);
    const addedThisMonth = parseInt(thisMonthResult.rows[0].count);

    res.json({
      success: true,
      data: {
        total,
        active,
        underRepair,
        disposed,
        missing,
        addedThisMonth,
        percentages: {
          active: total > 0 ? ((active / total) * 100).toFixed(1) : 0,
          underRepair: total > 0 ? ((underRepair / total) * 100).toFixed(1) : 0,
          disposed: total > 0 ? ((disposed / total) * 100).toFixed(1) : 0,
          missing: total > 0 ? ((missing / total) * 100).toFixed(1) : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get department statistics
const getDepartmentStats = async (req, res, next) => {
  try {
    const stats = await AssetModel.getCountByDepartment();

    res.json({
      success: true,
      data: { departments: stats }
    });
  } catch (error) {
    next(error);
  }
};

// Get activity timeline
const getActivityTimeline = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const logs = await ActivityLogModel.getRecentLogs(limit);

    res.json({
      success: true,
      data: { logs }
    });
  } catch (error) {
    next(error);
  }
};

// Get asset trends (assets created over time)
const getAssetTrends = async (req, res, next) => {
  try {
    const period = req.query.period || 'month'; // day, week, month, year

    let dateFormat;
    switch (period) {
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        dateFormat = 'YYYY-IW';
        break;
      case 'year':
        dateFormat = 'YYYY';
        break;
      default:
        dateFormat = 'YYYY-MM';
    }

    const sql = `
      SELECT 
        TO_CHAR(created_at, $1) as period,
        COUNT(*) as count
      FROM assets
      WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY period
      ORDER BY period ASC
    `;

    const result = await query(sql, [dateFormat]);

    res.json({
      success: true,
      data: { trends: result.rows }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAssetStats,
  getDepartmentStats,
  getActivityTimeline,
  getAssetTrends
};
