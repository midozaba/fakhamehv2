import { query, testConnection } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function updateForeignKey() {
  try {
    console.log('Testing database connection...');
    await testConnection();

    console.log('\nUpdating foreign key constraint...');

    // Drop existing constraint
    await query('ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_car_id_fkey');
    console.log('✓ Dropped existing constraint');

    // Add new constraint with ON DELETE SET NULL
    await query(`
      ALTER TABLE bookings
      ADD CONSTRAINT bookings_car_id_fkey
      FOREIGN KEY (car_id)
      REFERENCES cars(car_id)
      ON DELETE SET NULL
    `);
    console.log('✓ Added new constraint with ON DELETE SET NULL');

    console.log('\n✅ Foreign key constraint updated successfully!');
    console.log('Cars can now be deleted. Bookings will have car_id set to NULL but will preserve all other data.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating foreign key:', error);
    process.exit(1);
  }
}

updateForeignKey();
