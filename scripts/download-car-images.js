import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// MySQL connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'car_rental',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Download image from URL
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file if error
      reject(err);
    });
  });
}

// Get random car image from Unsplash
async function getCarImageUrl(carBrand, carType) {
  return new Promise((resolve, reject) => {
    // Use Unsplash Source API - no API key required
    // We'll search for the specific car or fallback to generic car
    const queries = [
      `${carBrand} ${carType}`,
      carBrand,
      carType,
      'car'
    ];

    // Try with specific search term
    const searchTerm = encodeURIComponent(queries[0]);

    // Unsplash Source API - returns random image based on search
    // Size: 800x600 is good for car listings
    const url = `https://source.unsplash.com/800x600/?${searchTerm}`;

    // Make a request to get the actual image URL (it redirects)
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Get the redirected URL
        resolve(response.headers.location);
      } else if (response.statusCode === 200) {
        resolve(url);
      } else {
        reject(new Error(`Failed to get image URL: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

// Main function
async function downloadCarImages() {
  console.log('🚗 Starting car image download process...\n');

  try {
    // Get all cars without images
    const [cars] = await pool.query(
      'SELECT id, car_barnd, car_type, car_model, car_num, image_url FROM cars WHERE image_url IS NULL OR image_url = ""'
    );

    if (cars.length === 0) {
      console.log('✅ All cars already have images!');
      process.exit(0);
    }

    console.log(`📋 Found ${cars.length} cars without images\n`);

    const results = {
      success: [],
      failed: []
    };

    // Process each car
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      console.log(`[${i + 1}/${cars.length}] Processing: ${car.car_barnd} ${car.car_type} (Car #${car.car_num})`);

      try {
        // Get image URL from Unsplash
        console.log(`  → Searching for image...`);
        const imageUrl = await getCarImageUrl(car.car_barnd, car.car_type);

        // Download image
        const filename = `car-${car.car_num}-${Date.now()}.jpg`;
        const filepath = path.join(uploadsDir, filename);

        console.log(`  → Downloading image...`);
        await downloadImage(imageUrl, filepath);

        // Update database
        const dbImagePath = `/uploads/${filename}`;
        await pool.query(
          'UPDATE cars SET image_url = ? WHERE id = ?',
          [dbImagePath, car.id]
        );

        console.log(`  ✅ Success! Saved as: ${filename}\n`);

        results.success.push({
          car_num: car.car_num,
          car: `${car.car_barnd} ${car.car_type}`,
          filename
        });

        // Add a small delay to be nice to Unsplash servers
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.log(`  ❌ Failed: ${error.message}\n`);
        results.failed.push({
          car_num: car.car_num,
          car: `${car.car_barnd} ${car.car_type}`,
          error: error.message
        });
      }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully downloaded: ${results.success.length} images`);
    console.log(`❌ Failed: ${results.failed.length} images`);

    if (results.failed.length > 0) {
      console.log('\n❌ Failed cars:');
      results.failed.forEach(item => {
        console.log(`  - Car #${item.car_num} (${item.car}): ${item.error}`);
      });
    }

    console.log('\n✨ Done! Images have been downloaded and added to the database.');
    console.log('⚠️  Note: These are stock photos from Unsplash. Replace with actual car photos when possible.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
downloadCarImages();
