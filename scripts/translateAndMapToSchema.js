import fs from 'fs';

// Read the extracted data
const carsData = JSON.parse(fs.readFileSync('FINAL_all_cars_data.json', 'utf8'));

console.log('Translating and mapping data to database schema...\n');

// Translation mappings
const brandTranslations = {
  'هونداي': 'Hyundai',
  'هوتداي': 'Hyundai', // Typo in original data
  'تويوتا': 'Toyota',
  'كيا': 'Kia',
  'فورد': 'Ford',
  'شفروليه': 'Chevrolet',
  'دونغ فينج': 'Dongfeng',
  // Handle cases where color was mistakenly in brand field
  'فيراني': 'Hyundai',
  'اسود': 'Hyundai',
  'خمري': 'Kia',
  'سلفر': 'Hyundai'
};

const modelTranslations = {
  'H 1': 'H1',
  'H1': 'H1',
  'h1': 'H1',
  'I10': 'i10',
  'i10': 'i10',
  'اكسنت': 'Accent',
  'النترا': 'Elantra',
  'اﻻلنترا': 'Elantra',
  'فيوجن': 'Fusion',
  'كامري': 'Camry',
  'سيراتو': 'Cerato',
  'سيلتوس': 'Seltos',
  'سونيت': 'Sonet',
  'بيجاس': 'Pegas',
  'كورو': 'Corolla',
  'بيكانتو': 'Picanto',
  'سوناتا': 'Sonata',
  'ستاريا': 'Staria',
  'ايلوس شاين': 'Aeolus Shine',
  'كابتيفا': 'Captiva'
};

const colorTranslations = {
  'فيراني': 'Burgundy',
  'فيراني ميتالك': 'Burgundy Metallic',
  'فيراني ميتاليك': 'Burgundy Metallic',
  'فيراني‎': 'Burgundy',
  'اسود': 'Black',
  'اسود‎': 'Black',
  'ابيض': 'White',
  'كحلي': 'Navy Blue',
  'سلفر ميتالك': 'Silver Metallic',
  'احمر': 'Red',
  'شمباني': 'Champagne',
  'خمري': 'Maroon',
  'خمري‎.': 'Maroon',
  'لؤلؤي': 'Pearl',
  'لؤلؤي ميتالك': 'Pearl Metallic',
  'بحري ميتالك': 'Marine Metallic',
  'فضي': 'Silver',
  'بني': 'Brown',
  'بني‎': 'Brown',
  'ازرق': 'Blue',
  'بترولي': 'Petrol',
  'زيتي': 'Olive',
  // Handle cases where color contains brand info
  'شفروليه‎': 'Black',
  'هونداي‎': 'Burgundy',
  'كيا‎': 'Maroon'
};

// Price defaults based on car type (you can adjust these)
const priceDefaults = {
  'i10': { day: 15, week: 90, month: 300 },
  'Picanto': { day: 15, week: 90, month: 300 },
  'Pegas': { day: 18, week: 108, month: 360 },
  'Accent': { day: 20, week: 120, month: 400 },
  'Elantra': { day: 25, week: 150, month: 500 },
  'Cerato': { day: 25, week: 150, month: 500 },
  'Corolla': { day: 25, week: 150, month: 500 },
  'Fusion': { day: 30, week: 180, month: 600 },
  'Camry': { day: 40, week: 240, month: 800 },
  'Sonata': { day: 35, week: 210, month: 700 },
  'Seltos': { day: 35, week: 210, month: 700 },
  'Sonet': { day: 30, week: 180, month: 600 },
  'Captiva': { day: 40, week: 240, month: 800 },
  'H1': { day: 50, week: 300, month: 1000 },
  'Staria': { day: 55, week: 330, month: 1100 },
  'Aeolus Shine': { day: 35, week: 210, month: 700 }
};

// Process each car
const mappedCars = carsData.map((car, index) => {
  const brand = brandTranslations[car.type] || car.type;
  const model = modelTranslations[car.group] || car.group;
  const color = colorTranslations[car.color] || car.color;
  const status = car.carCase === 'Available' ? 'available' : 'rented';

  // Get price defaults based on model
  const prices = priceDefaults[model] || { day: 25, week: 150, month: 500 };

  return {
    car_num: car.carNo,
    car_barnd: brand,
    car_type: model,
    car_model: car.model,
    car_color: color,
    price_per_day: prices.day,
    price_per_week: prices.week,
    price_per_month: prices.month,
    status: status,
    mileage: null,
    image_url: null
  };
});

console.log(`✓ Translated and mapped ${mappedCars.length} cars\n`);

// Generate SQL INSERT statements
let sqlOutput = `-- ================================================\n`;
sqlOutput += `-- Cars data from Long_EUR.xlsx\n`;
sqlOutput += `-- Translated to English and mapped to database schema\n`;
sqlOutput += `-- Total cars: ${mappedCars.length}\n`;
sqlOutput += `-- ================================================\n\n`;

mappedCars.forEach(car => {
  const columns = [
    'car_num',
    'car_barnd',
    'car_type',
    'car_model',
    'car_color',
    'price_per_day',
    'price_per_week',
    'price_per_month',
    'status',
    'mileage',
    'image_url'
  ].join(', ');

  const values = [
    car.car_num,
    `'${car.car_barnd}'`,
    `'${car.car_type}'`,
    car.car_model,
    `'${car.car_color}'`,
    car.price_per_day,
    car.price_per_week,
    car.price_per_month,
    `'${car.status}'`,
    'NULL',
    'NULL'
  ].join(', ');

  sqlOutput += `INSERT INTO cars (${columns}) VALUES (${values});\n`;
});

// Save files
fs.writeFileSync('cars_import.sql', sqlOutput, 'utf8');
fs.writeFileSync('cars_import.json', JSON.stringify(mappedCars, null, 2), 'utf8');

console.log('✓ Files generated:');
console.log('  - cars_import.sql (ready to import)');
console.log('  - cars_import.json (for reference)\n');

// Summary
console.log('=== Summary ===');
console.log(`Total cars: ${mappedCars.length}`);

const byBrand = mappedCars.reduce((acc, car) => {
  acc[car.car_barnd] = (acc[car.car_barnd] || 0) + 1;
  return acc;
}, {});

console.log('\nBy Brand:');
Object.entries(byBrand).sort((a, b) => b[1] - a[1]).forEach(([brand, count]) => {
  console.log(`  ${brand.padEnd(20)}: ${count} cars`);
});

const byStatus = mappedCars.reduce((acc, car) => {
  acc[car.status] = (acc[car.status] || 0) + 1;
  return acc;
}, {});

console.log('\nBy Status:');
Object.entries(byStatus).forEach(([status, count]) => {
  console.log(`  ${status.padEnd(20)}: ${count} cars`);
});

const byModel = mappedCars.reduce((acc, car) => {
  acc[car.car_type] = (acc[car.car_type] || 0) + 1;
  return acc;
}, {});

console.log('\nBy Model:');
Object.entries(byModel).sort((a, b) => b[1] - a[1]).forEach(([model, count]) => {
  console.log(`  ${model.padEnd(20)}: ${count} cars`);
});
