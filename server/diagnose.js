// Diagnostic script to gather system and environment information
import { execSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== System and Environment Diagnostics ===\n');

// Basic system information
console.log('## System Information');
console.log(`- OS: ${os.platform()} ${os.release()} (${os.arch()})`);
console.log(`- CPU: ${os.cpus().length} cores`);
console.log(`- Total Memory: ${Math.round(os.totalmem() / (1024 * 1024 * 1024))} GB`);
console.log(`- Free Memory: ${Math.round(os.freemem() / (1024 * 1024 * 1024))} GB`);
console.log(`- Node.js: ${process.version}`);
console.log(`- NPM: ${getNpmVersion()}`);
console.log(`- Current directory: ${process.cwd()}`);
console.log(`- Script directory: ${__dirname}`);

// Environment variables
console.log('\n## Environment Variables');
console.log(`- NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
console.log(`- PORT: ${process.env.PORT || 'not set'}`);
console.log(`- PATH: ${process.env.PATH || 'not set'}`);
console.log(`- USERPROFILE: ${process.env.USERPROFILE || 'not set'}`);

// Check file system access
console.log('\n## File System Access');
checkFileAccess('package.json');
checkFileAccess('node_modules/express/package.json');
checkFileAccess('node_modules/.bin/express');

// Check network interfaces
console.log('\n## Network Interfaces');
Object.entries(os.networkInterfaces()).forEach(([name, ifaces]) => {
  ifaces?.forEach(iface => {
    if (iface.family === 'IPv4' && !iface.internal) {
      console.log(`- ${name}: ${iface.address} (${iface.netmask})`);
    }
  });
});

// Check running processes
console.log('\n## Running Node.js Processes');
try {
  const result = execSync('tasklist /FI "IMAGENAME eq node.exe" /FO LIST').toString();
  console.log(result || 'No Node.js processes found');
} catch (error) {
  console.error('Failed to check running processes:', error.message);
}

// Check Node.js permissions
try {
  console.log('\n## Node.js Permissions');
  const testFile = path.join(os.tmpdir(), 'node-permission-test.txt');
  fs.writeFileSync(testFile, 'test');
  fs.readFileSync(testFile);
  fs.unlinkSync(testFile);
  console.log('- File system access: OK');
} catch (error) {
  console.error('- File system access error:', error.message);
}

// Check port availability
console.log('\n## Port Availability');
await checkPort(4000);
await checkPort(3000);

// Helper functions
function getNpmVersion() {
  try {
    return execSync('npm --version').toString().trim();
  } catch (error) {
    return 'Error getting NPM version';
  }
}

function checkFile(filePath) {
  try {
    const fullPath = path.resolve(filePath);
    const stats = fs.statSync(fullPath);
    return {
      exists: true,
      path: fullPath,
      size: stats.size,
      modified: stats.mtime,
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

function checkFileAccess(filePath) {
  const result = checkFile(filePath);
  if (result.exists) {
    console.log(`- ${filePath}: OK (${result.size} bytes, modified ${result.modified})`);
  } else {
    console.log(`- ${filePath}: NOT FOUND (${result.error})`);
  }
}

async function checkPort(port) {
  const net = await import('net');
  const server = net.createServer();
  
  return new Promise((resolve) => {
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`- Port ${port}: IN USE`);
      } else {
        console.log(`- Port ${port}: ERROR (${err.code})`);
      }
      resolve();
    });
    
    server.once('listening', () => {
      console.log(`- Port ${port}: AVAILABLE`);
      server.close();
      resolve();
    });
    
    server.listen(port, '0.0.0.0');
  });
}

console.log('\n=== Diagnostics complete ===');
