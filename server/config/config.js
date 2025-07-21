import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from server directory
const envPath = path.resolve(__dirname, '../.env');
console.log('Loading environment from:', envPath);

// Check if file exists
import fs from 'fs';
try {
  const fileExists = fs.existsSync(envPath);
  console.log('Environment file exists:', fileExists);
  if (fileExists) {
    console.log('File content (first 100 chars):', fs.readFileSync(envPath, 'utf8').substring(0, 100) + '...');
  }
} catch (error) {
  console.error('Error checking .env file:', error);
}

// Load environment variables
console.log('Environment before loading .env:');
console.log(Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('NODE_ENV') || k.includes('DB_')));

try {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error('Error loading .env file:', result.error);
  } else {
    console.log('Successfully loaded .env file');
    console.log('Loaded variables:', Object.keys(result.parsed || {}));
  }
} catch (error) {
  console.error('Error in dotenv.config:', error);
}

// Log loaded environment variables (mask sensitive data)
console.log('Environment variables loaded:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '***' + process.env.SUPABASE_URL.slice(-10) : 'undefined');
console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '***' + process.env.SUPABASE_ANON_KEY.slice(-4) : 'undefined');

// Export configuration
export default {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Supabase
  supabase: {
    url: process.env.SUPABASE_URL,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // Database
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  
  // AI Services
  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  },
  
  // Frontend URL for CORS
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
};
