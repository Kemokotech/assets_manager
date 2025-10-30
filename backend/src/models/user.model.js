const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  // Create a new user
  static async create(userData) {
    const { name, email, password, role = 'staff' } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO users (name, email, password, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at
    `;

    const result = await query(sql, [name, email, hashedPassword, role]);
    return result.rows[0];
  }

  // Find user by email
  static async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const result = await query(sql, [email]);
    return result.rows[0];
  }

  // Find user by ID
  static async findById(id) {
    const sql = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Get all users
  static async findAll() {
    const sql = 'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC';
    const result = await query(sql);
    return result.rows;
  }

  // Update user
  static async update(id, userData) {
    const { name, email, role } = userData;
    const sql = `
      UPDATE users
      SET name = $1, email = $2, role = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, email, role, updated_at
    `;

    const result = await query(sql, [name, email, role, id]);
    return result.rows[0];
  }

  // Update password
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const sql = `
      UPDATE users
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id
    `;

    const result = await query(sql, [hashedPassword, id]);
    return result.rows[0];
  }

  // Delete user
  static async delete(id) {
    const sql = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Verify password
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserModel;
