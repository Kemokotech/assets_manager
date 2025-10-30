const { query } = require('../config/database');

class ActivityLogModel {
  // Create a new activity log entry
  static async create(logData) {
    const { user_id, asset_id, action, details, ip_address } = logData;

    const sql = `
      INSERT INTO activity_log (user_id, asset_id, action, details, ip_address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await query(sql, [user_id, asset_id, action, details, ip_address]);
    return result.rows[0];
  }

  // Get activity logs with filters
  static async findAll(filters = {}) {
    let sql = `
      SELECT 
        al.*,
        u.name as user_name,
        a.name as asset_name,
        a.serial_number as asset_serial
      FROM activity_log al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN assets a ON al.asset_id = a.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (filters.user_id) {
      paramCount++;
      sql += ` AND al.user_id = $${paramCount}`;
      params.push(filters.user_id);
    }

    if (filters.asset_id) {
      paramCount++;
      sql += ` AND al.asset_id = $${paramCount}`;
      params.push(filters.asset_id);
    }

    if (filters.action) {
      paramCount++;
      sql += ` AND al.action = $${paramCount}`;
      params.push(filters.action);
    }

    sql += ' ORDER BY al.timestamp DESC';

    if (filters.limit) {
      paramCount++;
      sql += ` LIMIT $${paramCount}`;
      params.push(filters.limit);

      if (filters.offset) {
        paramCount++;
        sql += ` OFFSET $${paramCount}`;
        params.push(filters.offset);
      }
    }

    const result = await query(sql, params);
    return result.rows;
  }

  // Get recent activity logs
  static async getRecentLogs(limit = 10) {
    const sql = `
      SELECT 
        al.*,
        u.name as user_name,
        a.name as asset_name,
        a.serial_number as asset_serial
      FROM activity_log al
      LEFT JOIN users u ON al.user_id = u.id
      LEFT JOIN assets a ON al.asset_id = a.id
      ORDER BY al.timestamp DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }

  // Get activity logs for specific asset
  static async getAssetLogs(assetId, limit = 20) {
    const sql = `
      SELECT 
        al.*,
        u.name as user_name
      FROM activity_log al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.asset_id = $1
      ORDER BY al.timestamp DESC
      LIMIT $2
    `;

    const result = await query(sql, [assetId, limit]);
    return result.rows;
  }
}

module.exports = ActivityLogModel;
