import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pexels API Key (free - sign up at https://www.pexels.com/api/)
// For now, we'll use a public endpoint approach
const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

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
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, (response) => {
      // Follow redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        downloadImage(response.headers.location, filepath)
          .then(resolve)
          .catch(reject);
        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    });

    request.on('error', (err) => {
      fs.unlink(filepath, () => {}); // Delete the file if error
      reject(err);
    });
  });
}

// Fetch from Pexels API
function searchPexels(query) {
  return new Promise((resolve, reject) => {
    if (!PEXELS_API_KEY) {
      reject(new Error('Pexels API key not found. Set PEXELS_API_KEY in .env'));
      return;
    }

    const options = {
      hostname: 'api.pexels.com',
      path: `/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    };

    https.get(options, (response) => {
      let data = '';

      response.on('data', (chunk) => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.photos && json.photos.length > 0) {
            // Get medium size image
            resolve(json.photos[0].src.large);
          } else {
            reject(new Error('No photos found'));
          }
        } catch (error) {
          reject(error);
        }
      });
    }).on('error', reject);
  });
}

// Fallback: Use Lorem Picsum (placeholder images)
function getPlaceholderImage() {
  // Random car-themed placeholder
  return `https://picsum.photos/seed/${Math.random()}/800/600`;
}

// Get car image URL
async function getCarImageUrl(carBrand, carType, carNum) {
  // Try Pexels first if API key is available
  if (PEXELS_API_KEY) {
    try {
      const queries = [
        `${carBrand} ${carType} car`,
        `${carBrand} car`,
        `${carType} car`,
        'car'
      ];

      for (const query of queries) {
        try {
          const url = await searchPexels(query);
          return url;
        } catch (err) {
          continue;
        }
      }
    } catch (error) {
      console.log(`    Warning: Pexels search failed, using placeholder`);
    }
  }

  // Fallback to Unsplash Source (no API key needed)
  const searchTerm = encodeURIComponent(`${carBrand} ${carType} car`);
  return `https://source.unsplash.com/800x600/?${searchTerm}`;
}

// Main function
async function downloadCarImages(limit = null) {
  console.log('🚗 Starting car image download process...\n');

  if (!PEXELS_API_KEY) {
    console.log('⚠️  No Pexels API key found. Using Unsplash fallback.');
    console.log('   To use Pexels: Get a free API key from https://www.pexels.com/api/');
    console.log('   Add it to .env as: PEXELS_API_KEY=your_key_here\n');
  }

  try {
    // Get all cars without images
    let query = 'SELECT id, car_barnd, car_type, car_model, car_num, image_url FROM cars WHERE image_url IS NULL OR image_url = ""';
    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    const [cars] = await pool.query(query);

    if (cars.length === 0) {
      console.log('✅ All cars already have images!');
      await pool.end();
      process.exit(0);
    }

    console.log(`📋 Found ${cars.length} cars without images${limit ? ' (limited)' : ''}\n`);

    const results = {
      success: [],
      failed: []
    };

    // Process each car
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i];
      console.log(`[${i + 1}/${cars.length}] Processing: ${car.car_barnd} ${car.car_type} (Car #${car.car_num})`);

      try {
        // Get image URL
        console.log(`  → Searching for image...`);
        const imageUrl = await getCarImageUrl(car.car_barnd, car.car_type, car.car_num);

        // Download image
        const filename = `car-${car.car_num}-${Date.now()}.jpg`;
        const filepath = path.join(uploadsDir, filename);

        console.log(`  → Downloading image...`);
        await downloadImage(imageUrl, filepath);

        // Verify file was created and has content
        const stats = fs.statSync(filepath);
        if (stats.size < 1000) {
          throw new Error('Downloaded file is too small (likely an error page)');
        }

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

        // Add a delay to be nice to servers and avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1500));

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
    console.log('\n⚠️  IMPORTANT DISCLAIMER:');
    console.log('   These are royalty-free stock photos, not your actual vehicles.');
    console.log('   Replace with real photos of your cars as soon as possible.');
    console.log('   Showing stock photos may mislead customers.\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

// Check command line arguments for limit
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null;

// Run the script
downloadCarImages(limit);
