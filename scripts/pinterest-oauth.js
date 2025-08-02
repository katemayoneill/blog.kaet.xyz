// scripts/pinterest-oauth.js
// Clean Pinterest OAuth script using working basic auth method

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI || 'https://blog.kaet.xyz/pinterest-callback';

// Validate credentials
if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Missing Pinterest credentials in .env file');
    console.error('Required: PINTEREST_CLIENT_ID and PINTEREST_CLIENT_SECRET');
    process.exit(1);
}

// Generate authorization URL
const authURL = `https://www.pinterest.com/oauth/?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=boards:read,pins:read`;

console.log('🔗 Step 1: Visit this URL to authorize:');
console.log(authURL);
console.log('\n📋 Step 2: After authorization, run:');
console.log(`node scripts/pinterest-oauth.js YOUR_AUTHORIZATION_CODE`);

// Exchange authorization code for tokens
async function exchangeCodeForTokens(authCode) {
    console.log('🔄 Exchanging code for tokens...');
    
    try {
        // Use basic auth (the method that works with Pinterest)
        // This is what we learned from pinterest-basic-auth.js
        const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        
        const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                redirect_uri: REDIRECT_URI,
                code: authCode
            })
        });
        
        console.log('Response Status:', response.status);
        
        if (!response.ok) {
            const error = await response.text();
            console.error('Pinterest API Response:', error);
            
            // Fallback: try without redirect_uri (sometimes works)
            console.log('🔄 Trying without redirect_uri...');
            const fallbackResponse = await fetch('https://api.pinterest.com/v5/oauth/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: authCode
                })
            });
            
            if (!fallbackResponse.ok) {
                const fallbackError = await fallbackResponse.text();
                throw new Error(`Pinterest API error: ${response.status} - ${error}`);
            }
            
            const tokens = await fallbackResponse.json();
            console.log('✅ Success with fallback method!');
            displayTokens(tokens);
            return tokens;
        }
        
        const tokens = await response.json();
        console.log('✅ Success! Pinterest tokens received:');
        displayTokens(tokens);
        return tokens;
        
    } catch (error) {
        console.error('❌ Token exchange failed:', error.message);
        console.error('Try getting a fresh authorization code if this persists.');
    }
}

// Helper function to display token information
function displayTokens(tokens) {
    console.log(`Access token expires in: ${Math.round(tokens.expires_in / 86400)} days`);
    console.log(`Refresh token expires in: ${Math.round(tokens.refresh_token_expires_in / 86400)} days`);
    console.log(`Scopes: ${tokens.scope}`);
    
    console.log('\n📝 Add these to your .env file:');
    console.log(`PINTEREST_ACCESS_TOKEN=${tokens.access_token}`);
    console.log(`PINTEREST_REFRESH_TOKEN=${tokens.refresh_token}`);
}

// Handle command line arguments
const authCode = process.argv[2];
if (authCode) {
    exchangeCodeForTokens(authCode);
}