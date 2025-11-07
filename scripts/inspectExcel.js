import XLSX from 'xlsx';

// Read the Excel file
const workbook = XLSX.readFile('Long_EUR.xlsx');

// Get all sheet names
const sheetNames = workbook.SheetNames;

console.log('Inspecting all sheets...\n');

// Process each sheet
sheetNames.forEach(sheetName => {
  const worksheet = workbook.Sheets[sheetName];

  // Get the range of the sheet
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

  console.log(`\n=== ${sheetName} ===`);
  console.log(`Range: ${worksheet['!ref']}`);
  console.log(`Rows: ${range.e.r + 1}, Cols: ${range.e.c + 1}`);

  // Try different methods to read the data
  const jsonData = XLSX.utils.sheet_to_json(worksheet);
  const jsonDataWithHeader = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  const jsonDataRaw = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  console.log(`JSON rows (auto-detect): ${jsonData.length}`);
  console.log(`JSON rows (as array): ${jsonDataWithHeader.length}`);
  console.log(`JSON rows (raw with defaults): ${jsonDataRaw.length}`);

  // Show first few rows of raw data
  if (jsonDataRaw.length > 0) {
    console.log('First 3 rows (raw):');
    jsonDataRaw.slice(0, 3).forEach((row, idx) => {
      console.log(`  Row ${idx}:`, row);
    });
  }

  // Check for merged cells
  if (worksheet['!merges']) {
    console.log(`Merged cells: ${worksheet['!merges'].length}`);
  }
});
