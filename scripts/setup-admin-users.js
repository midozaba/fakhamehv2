import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const setupAdminUsers = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('Creating admin_users table...');

    // Create admin_users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role ENUM('admin', 'manager', 'viewer') DEFAULT 'viewer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    console.log('Admin_users table created successfully!');

    // Check if users already exist
    const [existing] = await connection.execute('SELECT COUNT(*) as count FROM admin_users');
    if (existing[0].count > 0) {
      console.log('Users already exist. Skipping user creation.');
      await connection.end();
      return;
    }

    // Create 3 admin users with hashed passwords
    const users = [
      {
        username: 'admin',
        password: 'admin123',
        full_name: 'Administrator',
        role: 'admin'
      },
      {
        username: 'manager',
        password: 'manager123',
        full_name: 'Manager User',
        role: 'manager'
      },
      {
        username: 'viewer',
        password: 'viewer123',
        full_name: 'Viewer User',
        role: 'viewer'
      }
    ];

    console.log('Creating admin users...');

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await connection.execute(
        'INSERT INTO admin_users (username, password, full_name, role) VALUES (?, ?, ?, ?)',
        [user.username, hashedPassword, user.full_name, user.role]
      );
      console.log(`✓ Created user: ${user.username} (${user.role})`);
    }

    console.log('\n✅ Setup complete! Admin users created:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username: admin     | Password: admin123    | Role: admin');
    console.log('Username: manager   | Password: manager123  | Role: manager');
    console.log('Username: viewer    | Password: viewer123   | Role: viewer');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('Error setting up admin users:', error);
  } finally {
    await connection.end();
  }
};

setupAdminUsers();
