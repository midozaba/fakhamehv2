import XLSX from 'xlsx';
import fs from 'fs';

// Read the Excel file
const workbook = XLSX.readFile('Long_EUR.xlsx');

// Get all sheet names
const sheetNames = workbook.SheetNames;

console.log('Found sheets:', sheetNames);

let sqlOutput = '';

// Process each sheet
sheetNames.forEach(sheetName => {
  console.log(`\nProcessing sheet: ${sheetName}`);

  const worksheet = workbook.Sheets[sheetName];

  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet);

  if (data.length === 0) {
    console.log(`  - No data in sheet ${sheetName}`);
    return;
  }

  console.log(`  - Found ${data.length} rows`);

  // Get column names from first row
  const columns = Object.keys(data[0]);
  console.log(`  - Columns:`, columns);

  // Generate SQL INSERT statements
  sqlOutput += `-- ================================================\n`;
  sqlOutput += `-- Data from sheet: ${sheetName}\n`;
  sqlOutput += `-- ================================================\n\n`;

  // Sanitize table name (remove spaces, special chars)
  const tableName = sheetName.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  data.forEach(row => {
    const columnNames = columns.map(col => col.toLowerCase().replace(/[^a-z0-9_]/g, '_')).join(', ');
    const values = columns.map(col => {
      const value = row[col];

      // Handle NULL values
      if (value === null || value === undefined || value === '') {
        return 'NULL';
      }

      // Handle numbers
      if (typeof value === 'number') {
        return value;
      }

      // Handle strings - escape single quotes
      if (typeof value === 'string') {
        return `'${value.replace(/'/g, "''")}'`;
      }

      // Handle booleans
      if (typeof value === 'boolean') {
        return value ? 1 : 0;
      }

      // Default: convert to string
      return `'${String(value).replace(/'/g, "''")}'`;
    }).join(', ');

    sqlOutput += `INSERT INTO ${tableName} (${columnNames}) VALUES (${values});\n`;
  });

  sqlOutput += '\n\n';
});

// Write to file
fs.writeFileSync('excel_to_sql_output.sql', sqlOutput, 'utf8');

console.log('\n✓ SQL file generated: excel_to_sql_output.sql');
console.log(`✓ Total sheets processed: ${sheetNames.length}`);
