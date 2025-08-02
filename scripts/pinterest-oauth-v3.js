// scripts/pinterest-oauth-v3.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI || 'https://blog.kaet.xyz/pinterest-callback';

console.log('🔍 Environment Check:');
console.log('CLIENT_ID:', CLIENT_ID);
console.log('CLIENT_SECRET:', CLIENT_SECRET ? 'Found ✅' : 'Missing ❌');
console.log('REDIRECT_URI:', REDIRECT_URI);

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Missing credentials');
    process.exit(1);
}

// Generate authorization URL for v3 API
const authURL = `https://www.pinterest.com/oauth/?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=read_public,write_public,read_relationships,write_relationships`;

console.log('\n🔗 Step 1: Visit this URL (v3 API scopes):');
console.log(authURL);
console.log('\n📋 Step 2: After authorization, run:');
console.log(`node scripts/pinterest-oauth-v3.js YOUR_CODE_HERE`);

async function exchangeCodeForTokensV3(authorizationCode) {
    console.log('\n🔄 Trying Pinterest v3 API...');
    
    try {
        // Try v3 endpoint
        const response = await fetch('https://api.pinterest.com/v1/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: authorizationCode
            })
        });
        
        console.log('v3 API Response:', response.status);
        const v3Result = await response.text();
        console.log('v3 API Body:', v3Result);
        
        if (response.ok) {
            const tokens = JSON.parse(v3Result);
            console.log('\n✅ v3 API SUCCESS!');
            console.log('Access Token:', tokens.access_token?.substring(0, 20) + '...');
            return tokens;
        }
    } catch (error) {
        console.log('v3 API Error:', error.message);
    }
    
    // If v3 fails, try v5 with different format
    console.log('\n🔄 Trying v5 API with alternative format...');
    
    try {
        const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'blog.kaet.xyz/1.0',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                code: authorizationCode
            }).toString()
        });
        
        console.log('v5 API Response:', response.status);
        const v5Result = await response.text();
        console.log('v5 API Body:', v5Result);
        
        if (response.ok) {
            const tokens = JSON.parse(v5Result);
            console.log('\n✅ v5 API SUCCESS!');
            console.log('Access Token:', tokens.access_token?.substring(0, 20) + '...');
            console.log('Refresh Token:', tokens.refresh_token?.substring(0, 20) + '...');
            
            console.log('\n📝 Add to your .env file:');
            console.log(`PINTEREST_ACCESS_TOKEN=${tokens.access_token}`);
            if (tokens.refresh_token) {
                console.log(`PINTEREST_REFRESH_TOKEN=${tokens.refresh_token}`);
            }
            return tokens;
        }
    } catch (error) {
        console.log('v5 API Error:', error.message);
    }
    
    return null;
}

// Check for authorization code
const authCode = process.argv[2];
if (authCode) {
    exchangeCodeForTokensV3(authCode);
}