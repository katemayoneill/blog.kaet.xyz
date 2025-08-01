// scripts/pinterest-oauth.js
// Run this once to get your initial refresh token

const CLIENT_ID = process.env.PINTEREST_APP_ID;
const CLIENT_SECRET = process.env.PINTEREST_APP_SECRET;
const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI || 'https://localhost:3000/callback';

// Validate required environment variables
if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error('❌ Missing required environment variables:');
    console.error('   PINTEREST_CLIENT_ID and PINTEREST_CLIENT_SECRET must be set');
    console.error('\nYou can run this script with:');
    console.error('   PINTEREST_CLIENT_ID=your_id PINTEREST_CLIENT_SECRET=your_secret node pinterest-oauth.js');
    process.exit(1);
}

// Step 1: Visit this URL in your browser
const authURL = `https://www.pinterest.com/oauth/?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=boards:read,pins:read`;

console.log('🔗 Step 1: Visit this URL in your browser:');
console.log(authURL);
console.log('\n📍 Step 2: After authorization, you\'ll be redirected to your callback URL with a code parameter');
console.log('📋 Step 3: Extract the code from the URL and run: exchangeCodeForTokens("your_code_here")');

// Step 2: Exchange the authorization code for tokens
async function exchangeCodeForTokens(authorizationCode) {
    if (!authorizationCode) {
        console.error('❌ Authorization code is required');
        return;
    }

    try {
        console.log('🔄 Exchanging authorization code for tokens...');
        
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

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
        }

        const tokens = await response.json();
        
        console.log('✅ SUCCESS! Here are your tokens:');
        console.log('Access Token:', tokens.access_token?.substring(0, 20) + '...');
        console.log('Refresh Token:', tokens.refresh_token?.substring(0, 20) + '...');
        console.log('Expires in:', tokens.expires_in, 'seconds');
        
        console.log('\n📝 Add these to your .env file:');
        console.log(`PINTEREST_ACCESS_TOKEN=${tokens.access_token}`);
        console.log(`PINTEREST_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log(`PINTEREST_CLIENT_ID=${CLIENT_ID}`);
        console.log(`PINTEREST_CLIENT_SECRET=${CLIENT_SECRET}`);
        
        return tokens;
    } catch (error) {
        console.error('❌ Error exchanging code for tokens:', error.message);
    }
}

// Make function available globally for easy use
global.exchangeCodeForTokens = exchangeCodeForTokens;

// Auto-run if code is provided as argument
const codeArg = process.argv[2];
if (codeArg) {
    exchangeCodeForTokens(codeArg);
}