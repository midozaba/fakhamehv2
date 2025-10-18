import XLSX from 'xlsx';
import fs from 'fs';

// Read the Excel file
const workbook = XLSX.readFile('Long_EUR.xlsx');
const sheetNames = workbook.SheetNames;

console.log('Extracting all data from all sheets...\n');

let allCars = [];

sheetNames.forEach(sheetName => {
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  console.log(`Processing ${sheetName}...`);

  rawData.forEach((row, rowIndex) => {
    // Skip header rows
    if (rowIndex === 0 && row[0] === 'Ser.') {
      return;
    }

    // Skip empty rows
    if (row.every(cell => cell === '')) {
      return;
    }

    // Method 1: If row has 7 columns (standard format from Table 1)
    if (row.length === 7 && typeof row[0] === 'number') {
      allCars.push({
        ser: row[0],
        carNo: row[1],
        type: row[2],
        group: row[3],
        color: row[4],
        model: row[5],
        carCase: row[6]
      });
      console.log(`  - Found car #${row[0]}: ${row[2]} ${row[3]}`);
    }
    // Method 2: If first column has pattern "ser    carNo"
    else if (typeof row[0] === 'string' && row[0].match(/^\d+\s+\d+/)) {
      const parts = row[0].split(/\s+/);
      const ser = parseInt(parts[0]);
      const carNo = parseInt(parts[1]);

      // Get the rest of the data from other columns or parse from string
      if (row.length >= 6) {
        allCars.push({
          ser: ser,
          carNo: carNo,
          type: row[1] || '',
          group: row[2] || '',
          color: row[3] || '',
          model: row[4] || 0,
          carCase: row[5] || ''
        });
        console.log(`  - Found car #${ser}: ${row[1]} ${row[2]}`);
      }
    }
    // Method 3: If all data is in a single cell (concatenated)
    else if (typeof row[0] === 'string' && row[0].includes('Rented')) {
      // Split by newlines first (multiple entries in one cell)
      const entries = row[0].split('\n').filter(e => e.trim());

      entries.forEach(entry => {
        // Match pattern: ser  carNo  type  group  color  model  status
        const match = entry.match(/(\d+)\s+(\d+)\s+(.+?)\s+(.+?)\s+(.+?)\s+(\d+)\s+(Rented|Available)/);
        if (match) {
          allCars.push({
            ser: parseInt(match[1]),
            carNo: parseInt(match[2]),
            type: match[3].trim(),
            group: match[4].trim(),
            color: match[5].trim(),
            model: parseInt(match[6]),
            carCase: match[7]
          });
          console.log(`  - Found car #${match[1]}: ${match[3]} ${match[4]}`);
        }
      });
    }
  });
});

console.log(`\n✓ Total cars extracted: ${allCars.length}`);

// Sort by serial number
allCars.sort((a, b) => a.ser - b.ser);

// Generate SQL
let sqlOutput = `-- ================================================\n`;
sqlOutput += `-- All cars data from Long_EUR.xlsx\n`;
sqlOutput += `-- Total cars: ${allCars.length}\n`;
sqlOutput += `-- ================================================\n\n`;

allCars.forEach(car => {
  const values = [
    car.ser,
    car.carNo,
    `'${String(car.type).replace(/'/g, "''")}'`,
    `'${String(car.group).replace(/'/g, "''")}'`,
    `'${String(car.color).replace(/'/g, "''")}'`,
    car.model,
    `'${car.carCase}'`
  ].join(', ');

  sqlOutput += `INSERT INTO cars_long_eur (ser, car_no, type, car_group, color, model, car_case) VALUES (${values});\n`;
});

// Save SQL file
fs.writeFileSync('all_cars_data.sql', sqlOutput, 'utf8');

// Also save as JSON for reference
fs.writeFileSync('all_cars_data.json', JSON.stringify(allCars, null, 2), 'utf8');

console.log('\n✓ Files generated:');
console.log('  - all_cars_data.sql (SQL INSERT statements)');
console.log('  - all_cars_data.json (JSON format for reference)');

// Show summary
console.log('\n=== Summary by Brand ===');
const byBrand = allCars.reduce((acc, car) => {
  acc[car.type] = (acc[car.type] || 0) + 1;
  return acc;
}, {});
Object.entries(byBrand).forEach(([brand, count]) => {
  console.log(`${brand}: ${count} cars`);
});
