const { query } = require('../config/database');

class DepartmentModel {
  // Create a new department
  static async create(departmentData) {
    const { name, description } = departmentData;

    const sql = `
      INSERT INTO departments (name, description)
      VALUES ($1, $2)
      RETURNING *
    `;

    const result = await query(sql, [name, description]);
    return result.rows[0];
  }

  // Find department by ID
  static async findById(id) {
    const sql = 'SELECT * FROM departments WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Find department by name
  static async findByName(name) {
    const sql = 'SELECT * FROM departments WHERE name = $1';
    const result = await query(sql, [name]);
    return result.rows[0];
  }

  // Get all departments
  static async findAll() {
    const sql = 'SELECT * FROM departments ORDER BY name ASC';
    const result = await query(sql);
    return result.rows;
  }

  // Get departments with asset count
  static async findAllWithAssetCount() {
    const sql = `
      SELECT 
        d.*,
        COUNT(a.id) as asset_count
      FROM departments d
      LEFT JOIN assets a ON d.id = a.department_id
      GROUP BY d.id
      ORDER BY d.name ASC
    `;

    const result = await query(sql);
    return result.rows;
  }

  // Update department
  static async update(id, departmentData) {
    const { name, description } = departmentData;

    const sql = `
      UPDATE departments
      SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;

    const result = await query(sql, [name, description, id]);
    return result.rows[0];
  }

  // Delete department
  static async delete(id) {
    const sql = 'DELETE FROM departments WHERE id = $1 RETURNING id';
    const result = await query(sql, [id]);
    return result.rows[0];
  }
}

module.exports = DepartmentModel;
