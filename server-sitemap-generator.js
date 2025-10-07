import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

const SITE_URL = 'https://alfakhama.com';

/**
 * Dynamic Sitemap Generator for Al-Fakhama Car Rental
 * Generates XML sitemap with all static pages and dynamic car pages
 */

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'alfakhama_rental',
};

/**
 * Static pages configuration
 */
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/cars', priority: '0.9', changefreq: 'daily' },
  { url: '/booking', priority: '0.8', changefreq: 'weekly' },
  { url: '/contact-us', priority: '0.7', changefreq: 'monthly' },
  { url: '/about-us', priority: '0.6', changefreq: 'monthly' },
  { url: '/terms-of-service', priority: '0.5', changefreq: 'yearly' },
];

/**
 * Format date to YYYY-MM-DD
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Generate URL entry for sitemap
 */
const generateUrlEntry = ({ url, lastmod, changefreq, priority, hreflang = true }) => {
  const entry = `  <url>
    <loc>${SITE_URL}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>`;

  if (hreflang) {
    return entry + `
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${url}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${SITE_URL}${url}?lang=ar" />
  </url>`;
  }

  return entry + `
  </url>`;
};

/**
 * Fetch all active cars from database
 */
const fetchCars = async () => {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.execute(
      'SELECT id, car_barnd, car_type, car_model, updated_at FROM cars WHERE status = "available" ORDER BY id DESC'
    );
    return rows;
  } catch (error) {
    console.error('Error fetching cars:', error);
    return [];
  } finally {
    if (connection) await connection.end();
  }
};

/**
 * Generate complete sitemap XML
 */
const generateSitemap = async () => {
  const today = formatDate(new Date());
  const cars = await fetchCars();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Static Pages -->
`;

  // Add static pages
  staticPages.forEach(page => {
    xml += generateUrlEntry({
      url: page.url,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    });
    xml += '\n\n';
  });

  // Add dynamic car pages
  if (cars.length > 0) {
    xml += `  <!-- Dynamic Car Pages (${cars.length} cars) -->\n`;

    cars.forEach(car => {
      const lastmod = car.updated_at ? formatDate(new Date(car.updated_at)) : today;
      xml += generateUrlEntry({
        url: `/booking/${car.id}`,
        lastmod,
        changefreq: 'weekly',
        priority: '0.8',
      });
      xml += '\n';
    });
  }

  xml += '\n</urlset>';

  return xml;
};

/**
 * Save sitemap to file
 */
const saveSitemap = async (xml) => {
  const filePath = './public/sitemap.xml';
  try {
    await fs.writeFile(filePath, xml, 'utf8');
    console.log(`✅ Sitemap generated successfully: ${filePath}`);
    console.log(`📊 Total URLs: ${(xml.match(/<url>/g) || []).length}`);
    console.log(`📅 Last updated: ${new Date().toISOString()}`);
  } catch (error) {
    console.error('❌ Error saving sitemap:', error);
    throw error;
  }
};

/**
 * Main execution
 */
const main = async () => {
  console.log('🚀 Starting sitemap generation...\n');

  try {
    const xml = await generateSitemap();
    await saveSitemap(xml);

    console.log('\n✨ Sitemap generation completed!');
    console.log(`🔗 View at: ${SITE_URL}/sitemap.xml`);
  } catch (error) {
    console.error('\n❌ Sitemap generation failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateSitemap, saveSitemap };
