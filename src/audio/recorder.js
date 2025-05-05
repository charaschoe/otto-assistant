// recorder.js
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function recordAudio(filename, duration) {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, '../recordings');
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const outputPath = path.join(outputDir, filename);
    
    console.log(`Recording to ${outputPath}`);
    
    // Modified to record for the full duration without silence detection
    const rec = spawn('rec', [
      '-c', '1', 
      outputPath, 
      'rate', '16k',
      'trim', '0', `${duration/1000}` // Record for exact duration in seconds
    ]);
    
    rec.stderr.on('data', (data) => {
      console.log(`rec stderr: ${data}`);
    });
    
    rec.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`Recording process exited with code ${code}`));
      }
    });
  });
}

module.exports = { recordAudio };
