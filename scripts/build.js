const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'dash_openlayers');
const outFile = path.join(outDir, 'dash_openlayers.min.js');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Simple placeholder asset: re-export a minimal module
const content = `// dash-openlayers placeholder bundle\nmodule.exports = { version: '0.0.1' };\n`;

fs.writeFileSync(outFile, content, 'utf8');
console.log('Wrote', outFile);
