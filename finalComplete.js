import fs from 'fs';

// Read the existing data
const existingData = JSON.parse(fs.readFileSync('complete_cars_data.json', 'utf8'));

// Add the 3 missing cars manually extracted from Table 8 and Table 18
const missingCars = [
  {
    ser: 30,
    carNo: 58018,
    type: 'تويوتا',
    group: 'كامري',
    color: 'فيراني ميتاليك',
    model: 2022,
    carCase: 'Rented'
  },
  {
    ser: 31,
    carNo: 49265,
    type: 'شفروليه',
    group: 'كابتيفا',
    color: 'اسود',
    model: 2023,
    carCase: 'Rented'
  },
  {
    ser: 43,
    carNo: 49175,
    type: 'تويوتا',
    group: 'كورو',
    color: 'بحري ميتالك',
    model: 2023,
    carCase: 'Rented'
  }
];

console.log('Adding missing cars...');
missingCars.forEach(car => {
  existingData.push(car);
  console.log(`  ✓ Added car #${car.ser}: ${car.type} ${car.group} (${car.carNo})`);
});

// Sort by serial number
existingData.sort((a, b) => a.ser - b.ser);

console.log(`\n✓ Total cars: ${existingData.length}`);

// Verify no gaps
const serNumbers = existingData.map(c => c.ser);
const missing = [];
for (let i = 1; i <= Math.max(...serNumbers); i++) {
  if (!serNumbers.includes(i)) {
    missing.push(i);
  }
}

if (missing.length > 0) {
  console.log(`⚠️  Still missing: ${missing.join(', ')}`);
} else {
  console.log(`✓ Complete! All serial numbers from 1 to ${Math.max(...serNumbers)} present.`);
}

// Generate final SQL
let sqlOutput = `-- ================================================\n`;
sqlOutput += `-- COMPLETE cars data from Long_EUR.xlsx\n`;
sqlOutput += `-- Total cars: ${existingData.length}\n`;
sqlOutput += `-- All serial numbers from 1 to ${Math.max(...serNumbers)}\n`;
sqlOutput += `-- ================================================\n\n`;

existingData.forEach(car => {
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

// Save final files
fs.writeFileSync('FINAL_all_cars_data.sql', sqlOutput, 'utf8');
fs.writeFileSync('FINAL_all_cars_data.json', JSON.stringify(existingData, null, 2), 'utf8');

console.log('\n✓ Final files saved:');
console.log('  - FINAL_all_cars_data.sql');
console.log('  - FINAL_all_cars_data.json');

// Summary
console.log('\n=== Final Summary by Brand ===');
const byBrand = existingData.reduce((acc, car) => {
  acc[car.type] = (acc[car.type] || 0) + 1;
  return acc;
}, {});

Object.entries(byBrand)
  .sort((a, b) => b[1] - a[1])
  .forEach(([brand, count]) => {
    console.log(`${brand.padEnd(20)} : ${count} cars`);
  });

console.log('\n=== Status Summary ===');
const byStatus = existingData.reduce((acc, car) => {
  acc[car.carCase] = (acc[car.carCase] || 0) + 1;
  return acc;
}, {});

Object.entries(byStatus).forEach(([status, count]) => {
  console.log(`${status.padEnd(20)} : ${count} cars`);
});
