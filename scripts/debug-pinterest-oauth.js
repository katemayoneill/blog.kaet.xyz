// scripts/debug-pinterest-oauth.js
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI || 'https://blog.kaet.xyz/pinterest-callback';

async function debugTokenExchange(authorizationCode) {
    console.log('🔍 Debug Token Exchange:');
    console.log('Authorization Code:', authorizationCode);
    console.log('Code Length:', authorizationCode?.length);
    console.log('Client ID:', CLIENT_ID);
    console.log('Redirect URI:', REDIRECT_URI);
    
    // Validate the authorization code format
    if (!authorizationCode || authorizationCode.length < 10) {
        console.error('❌ Authorization code seems too short or invalid');
        return;
    }
    
    const requestBody = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        code: authorizationCode
    });
    
    console.log('\n📤 Request Body:');
    console.log(requestBody.toString());
    
    try {
        console.log('\n🔄 Making request to Pinterest...');
        
        const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: requestBody
        });
        
        console.log('\n📥 Response:');
        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers.entries()));
        
        const responseText = await response.text();
        console.log('Body:', responseText);
        
        if (response.ok) {
            const tokens = JSON.parse(responseText);
            console.log('\n✅ SUCCESS! Tokens:');
            console.log('Access Token:', tokens.access_token?.substring(0, 20) + '...');
            console.log('Refresh Token:', tokens.refresh_token?.substring(0, 20) + '...');
            console.log('Expires in:', tokens.expires_in);
        } else {
            console.log('\n❌ Token exchange failed');
            
            // Try to parse error response
            try {
                const errorData = JSON.parse(responseText);
                console.log('Error details:', errorData);
            } catch {
                console.log('Could not parse error response');
            }
        }
        
    } catch (error) {
        console.error('\n💥 Request failed:', error.message);
    }
}

// Get authorization code from command line
const authCode = process.argv[2];
if (!authCode) {
    console.error('❌ Please provide an authorization code');
    console.log('Usage: node scripts/debug-pinterest-oauth.js YOUR_AUTH_CODE');
    process.exit(1);
}

debugTokenExchange(authCode);