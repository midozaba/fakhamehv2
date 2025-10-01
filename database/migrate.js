import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection, closePool } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run database migration
 */
async function migrate() {
  console.log('🚀 Starting database migration...\n');

  try {
    // Test database connection
    console.log('1. Testing database connection...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database. Please check your .env configuration.');
    }
    console.log('   ✓ Database connection successful\n');

    // Read and execute schema.sql
    console.log('2. Creating database schema...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    await query(schema);
    console.log('   ✓ Schema created successfully\n');

    // Import cars data from JSON
    console.log('3. Importing car data from JSON...');
    const carsJsonPath = path.join(__dirname, '..', 'src', 'data', 'cars.json');

    if (fs.existsSync(carsJsonPath)) {
      const carsData = JSON.parse(fs.readFileSync(carsJsonPath, 'utf8'));

      console.log(`   Found ${carsData.length} cars to import`);

      let imported = 0;
      let skipped = 0;

      for (const car of carsData) {
        try {
          // Check if car already exists by car_num
          const checkQuery = 'SELECT car_id FROM cars WHERE car_num = $1';
          const existing = await query(checkQuery, [car.CAR_NUM]);

          if (existing.rows.length > 0) {
            console.log(`   - Skipping car ${car.car_barnd} ${car.CAR_TYPE} (${car.CAR_NUM}) - already exists`);
            skipped++;
            continue;
          }

          // Insert car
          const insertQuery = `
            INSERT INTO cars (
              car_barnd, car_type, car_model, car_num,
              price_per_day, price_per_week, price_per_month,
              car_color, mileage, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING car_id
          `;

          const values = [
            car.car_barnd,
            car.CAR_TYPE,
            car.CAR_MODEL,
            car.CAR_NUM,
            car.PRICEPERDAY,
            car.priceperweek,
            car.pricepermonth,
            car.car_color,
            car.MILEAGE,
            car.status || 'available'
          ];

          const result = await query(insertQuery, values);
          console.log(`   ✓ Imported: ${car.car_barnd} ${car.CAR_TYPE} (ID: ${result.rows[0].car_id})`);
          imported++;

        } catch (error) {
          console.error(`   ✗ Error importing car ${car.car_barnd} ${car.CAR_TYPE}:`, error.message);
        }
      }

      console.log(`\n   Summary: ${imported} imported, ${skipped} skipped\n`);
    } else {
      console.log('   ⚠ cars.json not found, skipping car data import\n');
    }

    // Verify tables were created
    console.log('4. Verifying tables...');
    const tablesQuery = `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    const tables = await query(tablesQuery);
    console.log('   Created tables:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Get row counts
    console.log('\n5. Checking data...');
    const carsCount = await query('SELECT COUNT(*) FROM cars');
    const bookingsCount = await query('SELECT COUNT(*) FROM bookings');
    const messagesCount = await query('SELECT COUNT(*) FROM contact_messages');

    console.log(`   - Cars: ${carsCount.rows[0].count}`);
    console.log(`   - Bookings: ${bookingsCount.rows[0].count}`);
    console.log(`   - Contact Messages: ${messagesCount.rows[0].count}`);

    console.log('\n✅ Migration completed successfully!\n');
    console.log('You can now start your server with: npm run dev\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nPlease check:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database credentials in .env are correct');
    console.error('3. Database "alfakhama_rental" exists\n');
    process.exit(1);
  } finally {
    await closePool();
  }
}

// Run migration
migrate();
