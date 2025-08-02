// scripts/debug-env.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');

console.log('🔍 Environment Debug:');
console.log('Current directory:', __dirname);
console.log('Looking for .env at:', envPath);
console.log('.env file exists:', existsSync(envPath));

// Try to load .env
const result = dotenv.config({ path: envPath });
console.log('Dotenv load result:', result);

console.log('\n📋 Environment Variables:');
console.log('PINTEREST_CLIENT_ID:', process.env.PINTEREST_CLIENT_ID || 'NOT FOUND');
console.log('PINTEREST_CLIENT_SECRET:', process.env.PINTEREST_CLIENT_SECRET ? 'FOUND (hidden)' : 'NOT FOUND');
console.log('PINTEREST_REDIRECT_URI:', process.env.PINTEREST_REDIRECT_URI || 'NOT FOUND');
console.log('PINTEREST_ACCESS_TOKEN:', process.env.PINTEREST_ACCESS_TOKEN ? 'FOUND (hidden)' : 'NOT FOUND');
console.log('PINTEREST_REFRESH_TOKEN:', process.env.PINTEREST_REFRESH_TOKEN ? 'FOUND (hidden)' : 'NOT FOUND');

// Also check if variables were passed inline
console.log('\n🔄 Checking for inline variables:');
const inlineVars = ['PINTEREST_CLIENT_ID', 'PINTEREST_CLIENT_SECRET', 'PINTEREST_CLIENT_ID', 'PINTEREST_CLIENT_SECRET'];
inlineVars.forEach(varName => {
    if (process.env[varName]) {
        console.log(`${varName}:`, process.env[varName]);
    }
});