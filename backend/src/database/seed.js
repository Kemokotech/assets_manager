require('dotenv').config();
const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Hash the default admin password
    const adminPassword = await bcrypt.hash('admin123', 10);

    // Insert default departments
    await query(`
      INSERT INTO departments (name, description) VALUES
        ('IT', 'Information Technology Department'),
        ('HR', 'Human Resources Department'),
        ('Finance', 'Finance Department'),
        ('Operations', 'Operations Department'),
        ('Marketing', 'Marketing Department')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log('✅ Default departments created');

    // Insert default admin user
    await query(`
      INSERT INTO users (name, email, password, role) VALUES
        ($1, $2, $3, $4)
      ON CONFLICT (email) DO NOTHING;
    `, ['Admin User', 'admin@company.com', adminPassword, 'admin']);
    console.log('✅ Default admin user created');
    console.log('   Email: admin@company.com');
    console.log('   Password: admin123');
    console.log('   ⚠️  CHANGE THIS PASSWORD IN PRODUCTION!');

    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = { seedDatabase };
