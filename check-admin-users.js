import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkAdminUsers() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'alfakhama_rental'
    });

    console.log('✅ Connected to database\n');

    const [users] = await connection.query(
      'SELECT id, username, role, is_active, created_at, last_login FROM admin_users'
    );

    console.log('📋 Admin Users:\n');
    console.table(users);

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAdminUsers();
