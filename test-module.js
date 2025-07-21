// Test script to verify module system compatibility
console.log('=== Module System Test ===');
console.log('Node.js version:', process.version);
console.log('__filename:', __filename);
console.log('__dirname:', __dirname);
console.log('require:', typeof require);
console.log('import.meta.url:', import.meta?.url);

// Test CommonJS require
try {
  const path = require('path');
  console.log('CommonJS require works');
  console.log('Path module:', path.basename(__filename));
} catch (error) {
  console.error('CommonJS require failed:', error.message);
}

// Test ESM dynamic import
(async () => {
  try {
    const path = await import('path');
    console.log('ESM dynamic import works');
    console.log('Path module (ESM):', path.basename(import.meta.url));
  } catch (error) {
    console.error('ESM dynamic import failed:', error.message);
  }
})();
