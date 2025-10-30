const { query } = require('../config/database');

class AssetModel {
  // Create a new asset
  static async create(assetData) {
    const {
      name,
      serial_number,
      department_id,
      location,
      status = 'active',
      purchase_date,
      image_url,
      qr_code_path,
      description,
      created_by
    } = assetData;

    const sql = `
      INSERT INTO assets (
        name, serial_number, department_id, location, status,
        purchase_date, image_url, qr_code_path, description, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const result = await query(sql, [
      name,
      serial_number,
      department_id,
      location,
      status,
      purchase_date,
      image_url,
      qr_code_path,
      description,
      created_by
    ]);

    return result.rows[0];
  }

  // Find asset by ID with department info
  static async findById(id) {
    const sql = `
      SELECT 
        a.*,
        d.name as department_name,
        u.name as created_by_name
      FROM assets a
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Find asset by serial number
  static async findBySerialNumber(serialNumber) {
    const sql = `
      SELECT 
        a.*,
        d.name as department_name,
        u.name as created_by_name
      FROM assets a
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE a.serial_number = $1
    `;

    const result = await query(sql, [serialNumber]);
    return result.rows[0];
  }

  // Get all assets with filters
  static async findAll(filters = {}) {
    let sql = `
      SELECT 
        a.*,
        d.name as department_name,
        u.name as created_by_name
      FROM assets a
      LEFT JOIN departments d ON a.department_id = d.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    // Apply filters
    if (filters.status) {
      paramCount++;
      sql += ` AND a.status = $${paramCount}`;
      params.push(filters.status);
    }

    if (filters.department_id) {
      paramCount++;
      sql += ` AND a.department_id = $${paramCount}`;
      params.push(filters.department_id);
    }

    if (filters.search) {
      paramCount++;
      sql += ` AND (a.name ILIKE $${paramCount} OR a.serial_number ILIKE $${paramCount} OR a.location ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
    }

    sql += ' ORDER BY a.created_at DESC';

    // Add pagination
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

  // Update asset
  static async update(id, assetData) {
    const fields = [];
    const values = [];
    let paramCount = 0;

    // Build dynamic update query
    Object.keys(assetData).forEach(key => {
      if (assetData[key] !== undefined) {
        paramCount++;
        fields.push(`${key} = $${paramCount}`);
        values.push(assetData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    paramCount++;
    values.push(id);

    const sql = `
      UPDATE assets
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows[0];
  }

  // Delete asset
  static async delete(id) {
    const sql = 'DELETE FROM assets WHERE id = $1 RETURNING id';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get asset count by status
  static async getCountByStatus() {
    const sql = `
      SELECT status, COUNT(*) as count
      FROM assets
      GROUP BY status
    `;

    const result = await query(sql);
    return result.rows;
  }

  // Get asset count by department
  static async getCountByDepartment() {
    const sql = `
      SELECT 
        d.name as department,
        COUNT(a.id) as count
      FROM departments d
      LEFT JOIN assets a ON d.id = a.department_id
      GROUP BY d.id, d.name
      ORDER BY count DESC
    `;

    const result = await query(sql);
    return result.rows;
  }

  // Get total asset count
  static async getTotalCount(filters = {}) {
    let sql = 'SELECT COUNT(*) as total FROM assets WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (filters.status) {
      paramCount++;
      sql += ` AND status = $${paramCount}`;
      params.push(filters.status);
    }

    if (filters.department_id) {
      paramCount++;
      sql += ` AND department_id = $${paramCount}`;
      params.push(filters.department_id);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].total);
  }

  // Get recently added assets
  static async getRecentAssets(limit = 5) {
    const sql = `
      SELECT 
        a.*,
        d.name as department_name
      FROM assets a
      LEFT JOIN departments d ON a.department_id = d.id
      ORDER BY a.created_at DESC
      LIMIT $1
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }
}

module.exports = AssetModel;
