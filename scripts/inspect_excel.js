const XLSX = require('xlsx');
const path = require('path');

try {
    const filePath = path.resolve('SOOOP.xlsx');
    console.log("Reading:", filePath);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    console.log("Headers:", JSON.stringify(data[0]));
    if (data.length > 1) {
        console.log("First Row:", JSON.stringify(data[1]));
    }
    console.log("Total Rows:", data.length);

} catch (e) {
    console.error("Error:", e.message);
}
