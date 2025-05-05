const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

function exportToMarkdown(content, filename) {
  const filePath = path.join(__dirname, '../exports', `${filename}.md`);
  fs.writeFileSync(filePath, content);
  console.log(`✅ Markdown exportiert: ${filePath}`);
}

function exportToPDF(content, filename) {
  const filePath = path.join(__dirname, '../exports', `${filename}.pdf`);
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));
  doc.text(content);
  doc.end();
  console.log(`✅ PDF exportiert: ${filePath}`);
}

function exportToCSV(data, filename) {
  const filePath = path.join(__dirname, '../exports', `${filename}.csv`);
  const csvContent = data.map(row => row.join(',')).join('\n');
  fs.writeFileSync(filePath, csvContent);
  console.log(`✅ CSV exportiert: ${filePath}`);
}

module.exports = { exportToMarkdown, exportToPDF, exportToCSV };