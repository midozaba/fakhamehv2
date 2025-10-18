import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdminUser() {
  let connection;

  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'alfakhama_rental'
    });

    console.log('✓ Connected to database');

    // Get admin details from user
    console.log('\n=== Create Admin User ===\n');
    const username = await question('Enter username: ');
    const password = await question('Enter password: ');
    const fullName = await question('Enter full name: ');
    const role = await question('Enter role (admin/manager/staff) [admin]: ') || 'admin';

    // Validate inputs
    if (!username || !password || !fullName) {
      throw new Error('Username, password, and full name are required');
    }

    if (!['admin', 'manager', 'staff'].includes(role)) {
      throw new Error('Invalid role. Must be admin, manager, or staff');
    }

    // Check if user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM admin_users WHERE username = ?',
      [username]
    );

    if (existingUsers.length > 0) {
      throw new Error('Username already exists');
    }

    // Hash password
    console.log('\nHashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await connection.execute(
      'INSERT INTO admin_users (username, password, full_name, role, is_active) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, fullName, role, true]
    );

    console.log(`\n✓ Admin user created successfully!`);
    console.log(`  User ID: ${result.insertId}`);
    console.log(`  Username: ${username}`);
    console.log(`  Full Name: ${fullName}`);
    console.log(`  Role: ${role}`);
    console.log(`\nYou can now login with these credentials.\n`);

  } catch (error) {
    console.error('\n✗ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    rl.close();
  }
}

createAdminUser();
