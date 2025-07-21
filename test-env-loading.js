import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from project root
const envPath = path.resolve(__dirname, '../.env');
console.log('Testing environment loading from:', envPath);

// Check if file exists
import fs from 'fs';

try {
  // Check if file exists
  const fileExists = fs.existsSync(envPath);
  console.log('Environment file exists:', fileExists);
  
  if (fileExists) {
    // Read file content
    const fileContent = fs.readFileSync(envPath, 'utf8');
    console.log('File content (first 100 chars):', fileContent.substring(0, 100) + '...');
    
    // Check for BOM (Byte Order Mark)
    const hasBOM = fileContent.charCodeAt(0) === 0xFEFF;
    console.log('File has BOM:', hasBOM);
    
    // Check line endings
    const hasCRLF = /\r\n/.test(fileContent);
    console.log('File uses CRLF line endings:', hasCRLF);
    
    // Check file encoding
    const isUtf8 = Buffer.from(fileContent).equals(Buffer.from(fileContent.toString('utf8'), 'utf8'));
    console.log('File is valid UTF-8:', isUtf8);
    
    // Load environment variables
    console.log('\nEnvironment variables before loading .env:');
    console.log(Object.keys(process.env).filter(k => k.includes('SUPABASE') || k.includes('NODE_ENV') || k.includes('PORT')));
    
    // Load .env file
    const result = dotenv.config({ path: envPath });
    
    if (result.error) {
      console.error('Error loading .env file:', result.error);
    } else {
      console.log('\nSuccessfully loaded .env file');
      console.log('Loaded variables:', Object.keys(result.parsed || {}));
      
      // Log important variables (mask sensitive data)
      console.log('\nImportant environment variables:');
      console.log('- NODE_ENV:', process.env.NODE_ENV);
      console.log('- PORT:', process.env.PORT);
      console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? '***' + process.env.SUPABASE_URL.slice(-10) : 'undefined');
      console.log('- SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '***' + process.env.SUPABASE_ANON_KEY.slice(-4) : 'undefined');
      console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '***' + process.env.GEMINI_API_KEY.slice(-4) : 'undefined');
      
      // Check if required variables are set
      const requiredVars = [
        'SUPABASE_URL',
        'SUPABASE_ANON_KEY',
        'GEMINI_API_KEY'
      ];
      
      const missingVars = requiredVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        console.error('\n❌ Missing required environment variables:', missingVars);
      } else {
        console.log('\n✅ All required environment variables are set');
      }
    }
  } else {
    console.error('Error: .env file not found at', envPath);
    console.log('Please create a .env file based on .env.example');
  }
} catch (error) {
  console.error('Error during environment test:', error);
}
