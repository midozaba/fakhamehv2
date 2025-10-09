import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const verifyUsers = async () => {
  let connection;

  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'alfakhama_rental',
    });

    console.log('✓ Connected to database\n');

    // Query all users
    const [users] = await connection.execute(
      'SELECT id, username, email, full_name, role, phone, is_active, created_at FROM users ORDER BY id'
    );

    if (users.length === 0) {
      console.log('❌ No users found in database');
    } else {
      console.log(`✓ Found ${users.length} users in the database:\n`);

      users.forEach((user, index) => {
        console.log(`User #${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Username: ${user.username}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Full Name: ${user.full_name}`);
        console.log(`  Role: ${user.role}`);
        console.log(`  Phone: ${user.phone}`);
        console.log(`  Active: ${user.is_active ? 'Yes' : 'No'}`);
        console.log(`  Created: ${user.created_at}`);
        console.log('');
      });

      console.log('=== Summary ===');
      console.log(`Total Users: ${users.length}`);
      console.log(`Active Users: ${users.filter(u => u.is_active).length}`);
      console.log(`Admins: ${users.filter(u => u.role === 'admin').length}`);
      console.log(`Managers: ${users.filter(u => u.role === 'manager').length}`);
      console.log(`Regular Users: ${users.filter(u => u.role === 'user').length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

verifyUsers();
