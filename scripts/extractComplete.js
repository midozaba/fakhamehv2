import XLSX from 'xlsx';
import fs from 'fs';

// Read the Excel file
const workbook = XLSX.readFile('Long_EUR.xlsx');
const sheetNames = workbook.SheetNames;

console.log('Comprehensive data extraction...\n');

let allCars = [];

sheetNames.forEach(sheetName => {
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  console.log(`\nProcessing ${sheetName}...`);

  // Show what's in the first few cells
  if (rawData.length > 0) {
    console.log(`  First row data:`, rawData[0]);
  }

  rawData.forEach((row, rowIndex) => {
    // Skip header rows
    if (rowIndex === 0 && row[0] === 'Ser.') {
      return;
    }

    // Skip completely empty rows
    if (row.every(cell => cell === '' || cell === null || cell === undefined)) {
      return;
    }

    // Combine all cells into one string for comprehensive parsing
    const fullText = row.join('    ');

    // Method 1: Standard 7-column format
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
      console.log(`  ✓ Car #${row[0]}: ${row[2]} ${row[3]}`);
      return;
    }

    // Method 2: First column has "ser carNo" pattern
    if (typeof row[0] === 'string' && row[0].match(/^\d+\s+\d+/)) {
      const parts = row[0].split(/\s+/).filter(p => p);
      const ser = parseInt(parts[0]);
      const carNo = parseInt(parts[1]);

      if (row.length >= 6) {
        allCars.push({
          ser: ser,
          carNo: carNo,
          type: row[1] || '',
          group: row[2] || '',
          color: row[3] || '',
          model: parseInt(row[4]) || 0,
          carCase: row[5] || ''
        });
        console.log(`  ✓ Car #${ser}: ${row[1]} ${row[2]}`);
        return;
      }
    }

    // Method 3: Parse any text that matches the pattern
    // Pattern: number(ser) number(carNo) text(type) text(group) text(color) number(model) text(status)
    const patterns = [
      // Pattern with clear spacing
      /(\d+)\s+(\d+)\s+(.+?)\s+(.+?)\s+(.+?)\s+(\d{4})\s+(Rented|Available)/g,
      // Pattern with Arabic/mixed text
      /(\d+)\s+(\d+)\s+([\u0600-\u06FF\w]+)\s+([\u0600-\u06FF\w\s]+?)\s+([\u0600-\u06FF\w\s]+?)\s+(\d{4,5})\s+(Rented|Available)/g
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(fullText)) !== null) {
        const ser = parseInt(match[1]);
        const carNo = parseInt(match[2]);

        // Avoid duplicates
        if (!allCars.find(c => c.ser === ser && c.carNo === carNo)) {
          allCars.push({
            ser: ser,
            carNo: carNo,
            type: match[3].trim(),
            group: match[4].trim(),
            color: match[5].trim(),
            model: parseInt(match[6]),
            carCase: match[7]
          });
          console.log(`  ✓ Car #${ser}: ${match[3]} ${match[4]}`);
        }
      }
    });
  });
});

console.log(`\n=== Extraction Complete ===`);
console.log(`Total cars extracted: ${allCars.length}`);

// Sort by serial number
allCars.sort((a, b) => a.ser - b.ser);

// Find gaps in serial numbers
const serNumbers = allCars.map(c => c.ser);
const missing = [];
for (let i = 1; i <= Math.max(...serNumbers); i++) {
  if (!serNumbers.includes(i)) {
    missing.push(i);
  }
}

if (missing.length > 0) {
  console.log(`\n⚠️  Missing serial numbers: ${missing.join(', ')}`);
} else {
  console.log(`\n✓ All serial numbers from 1 to ${Math.max(...serNumbers)} are present!`);
}

// Generate SQL
let sqlOutput = `-- ================================================\n`;
sqlOutput += `-- Complete cars data from Long_EUR.xlsx\n`;
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

// Save files
fs.writeFileSync('complete_cars_data.sql', sqlOutput, 'utf8');
fs.writeFileSync('complete_cars_data.json', JSON.stringify(allCars, null, 2), 'utf8');

console.log('\n✓ Files saved:');
console.log('  - complete_cars_data.sql');
console.log('  - complete_cars_data.json');

// Summary by brand
console.log('\n=== Cars by Brand ===');
const byBrand = allCars.reduce((acc, car) => {
  acc[car.type] = (acc[car.type] || 0) + 1;
  return acc;
}, {});
Object.entries(byBrand).sort((a, b) => b[1] - a[1]).forEach(([brand, count]) => {
  console.log(`${brand}: ${count} cars`);
});
