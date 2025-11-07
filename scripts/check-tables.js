import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function checkTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'alfakhama_rental'
    });

    console.log('✅ Connected to database\n');

    // Check if admin_action_logs table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'admin_action_logs'"
    );

    if (tables.length === 0) {
      console.log('❌ Table "admin_action_logs" does NOT exist!');
      console.log('\n📝 This is likely causing the 500 error.');
      console.log('Run this SQL file to create it:');
      console.log('   node database/create_action_logs_table.sql\n');
    } else {
      console.log('✅ Table "admin_action_logs" exists\n');

      // Show table structure
      const [columns] = await connection.query(
        'DESCRIBE admin_action_logs'
      );
      console.log('Table structure:');
      console.table(columns);
    }

    // Check uploads directory
    const fs = await import('fs');
    const path = await import('path');
    const uploadsDir = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadsDir)) {
      console.log('\n❌ Uploads directory does NOT exist!');
      console.log('Creating it now...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Created uploads directory\n');
    } else {
      console.log('\n✅ Uploads directory exists\n');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkTables();
