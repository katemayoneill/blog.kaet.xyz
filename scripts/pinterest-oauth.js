// scripts/pinterest-oauth.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');

// Try to load .env file
if (existsSync(envPath)) {
    const result = dotenv.config({ path: envPath });
    if (result.error) {
        console.warn('⚠️  Warning: Could not load .env file:', result.error.message);
    } else {
        console.log('✅ Loaded .env file successfully');
    }
} else {
    console.log('ℹ️  No .env file found, using inline environment variables');
}

// Get credentials (from .env file or inline)
const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI || 'https://blog.kaet.xyz/pinterest-callback';

// Debug info
console.log('\n🔍 Environment Check:');
console.log('CLIENT_ID:', CLIENT_ID ? `Found: ${CLIENT_ID}` : 'Missing ❌');
console.log('CLIENT_SECRET:', CLIENT_SECRET ? 'Found ✅' : 'Missing ❌');
console.log('REDIRECT_URI:', REDIRECT_URI);

// Validate required environment variables
if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('\n❌ Missing required environment variables!');
    console.error('\nOption 1: Add to .env file (recommended):');
    console.error('PINTEREST_CLIENT_ID=1526279');
    console.error('PINTEREST_CLIENT_SECRET=22b8dc6eb18a34108282166af8e30232d51e9ca6');
    console.error('\nOption 2: Pass inline:');
    console.error('PINTEREST_CLIENT_ID=1526279 PINTEREST_CLIENT_SECRET=22b8dc6eb18a34108282166af8e30232d51e9ca6 npm run pinterest-setup');
    process.exit(1);
}

// Generate authorization URL
const authURL = `https://www.pinterest.com/oauth/?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=boards:read,pins:read`;

console.log('\n🔗 Step 1: Visit this URL in your browser:');
console.log(authURL);
console.log('\n📍 Step 2: After authorization, you\'ll be redirected to:');
console.log(REDIRECT_URI);
console.log('\n📋 Step 3: Copy the code from the callback page and run:');
console.log(`node scripts/pinterest-oauth.js YOUR_CODE_HERE`);

// Function to exchange authorization code for tokens
async function exchangeCodeForTokens(authorizationCode) {
    if (!authorizationCode) {
        console.error('\n❌ No authorization code provided');
        console.log('Usage: node scripts/pinterest-oauth.js YOUR_AUTH_CODE');
        return;
    }

    try {
        console.log('\n🔄 Exchanging authorization code for tokens...');
        
        const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                code: authorizationCode
            })
        });

        const responseText = await response.text();
        
        if (!response.ok) {
            console.error('❌ Token exchange failed:');
            console.error('Status:', response.status);
            console.error('Response:', responseText);
            return;
        }

        const tokens = JSON.parse(responseText);
        
        console.log('\n✅ SUCCESS! Tokens received:');
        console.log('Access Token:', tokens.access_token ? `${tokens.access_token.substring(0, 20)}...` : 'Not provided');
        console.log('Refresh Token:', tokens.refresh_token ? `${tokens.refresh_token.substring(0, 20)}...` : 'Not provided');
        console.log('Expires in:', tokens.expires_in || 'Unknown', 'seconds');
        
        console.log('\n📝 Add these lines to your .env file:');
        console.log(`PINTEREST_CLIENT_ID=${CLIENT_ID}`);
        console.log(`PINTEREST_CLIENT_SECRET=${CLIENT_SECRET}`);
        console.log(`PINTEREST_ACCESS_TOKEN=${tokens.access_token}`);
        if (tokens.refresh_token) {
            console.log(`PINTEREST_REFRESH_TOKEN=${tokens.refresh_token}`);
        }
        console.log(`PINTEREST_REDIRECT_URI=${REDIRECT_URI}`);
        
        return tokens;
    } catch (error) {
        console.error('❌ Error exchanging code for tokens:', error.message);
    }
}

// Check if authorization code was provided as argument
const authCode = process.argv[2];
if (authCode) {
    exchangeCodeForTokens(authCode);
}