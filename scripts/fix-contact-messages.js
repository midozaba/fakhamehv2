import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function fixContactMessagesTable() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'alfakhama_rental'
    });

    console.log('Connected to database...');

    // Check if status column exists
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'alfakhama_rental'}'
        AND TABLE_NAME = 'contact_messages'
        AND COLUMN_NAME = 'status'
    `);

    if (columns.length === 0) {
      console.log('Adding status column to contact_messages table...');

      await connection.query(`
        ALTER TABLE contact_messages
        ADD COLUMN status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new'
        AFTER message
      `);

      console.log('✅ Status column added successfully!');
    } else {
      console.log('✅ Status column already exists!');
    }

    // Test the table
    const [rows] = await connection.query('SELECT * FROM contact_messages LIMIT 1');
    console.log('✅ Table structure verified!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

fixContactMessagesTable();
