// scripts/refresh-pinterest-tokens.js
// Script to refresh Pinterest tokens for Amplify deployment

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.PINTEREST_REFRESH_TOKEN;

console.log('🔄 Pinterest Token Refresh for Amplify');
console.log('=====================================');

async function refreshTokensForAmplify() {
    // Validate required credentials
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
        console.error('❌ Missing required credentials');
        console.error('Required environment variables:');
        console.error('- PINTEREST_CLIENT_ID');
        console.error('- PINTEREST_CLIENT_SECRET'); 
        console.error('- PINTEREST_REFRESH_TOKEN');
        process.exit(1);
    }
    
    console.log('✅ All credentials found');
    console.log(`Client ID: ${CLIENT_ID}`);
    console.log(`Refresh token: ${REFRESH_TOKEN.substring(0, 20)}...`);
    
    try {
        console.log('\n🔄 Calling Pinterest API...');
        
        // Use basic auth (the method that works with Pinterest)
        const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        
        const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: REFRESH_TOKEN,
            })
        });

        console.log(`API Response Status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Pinterest API Error:', errorText);
            throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
        }

        const tokens = await response.json();
        
        console.log('\n✅ SUCCESS! Pinterest tokens refreshed');
        console.log(`Access token expires in: ${Math.round(tokens.expires_in / 86400)} days`);
        
        if (tokens.refresh_token_expires_in) {
            console.log(`Refresh token expires in: ${Math.round(tokens.refresh_token_expires_in / 86400)} days`);
        }
        
        console.log(`Token scopes: ${tokens.scope || 'boards:read,pins:read'}`);
        
        // Output tokens for GitHub Actions to capture
        console.log('\n📝 NEW TOKENS FOR AMPLIFY:');
        console.log('=' .repeat(50));
        console.log(`PINTEREST_ACCESS_TOKEN=${tokens.access_token}`);
        console.log(`PINTEREST_REFRESH_TOKEN=${tokens.refresh_token || REFRESH_TOKEN}`);
        console.log('=' .repeat(50));
        
        console.log('\n🚀 NEXT STEPS:');
        console.log('1. Copy the tokens above');
        console.log('2. Go to AWS Amplify Console > Your App > Environment Variables');
        console.log('3. Update PINTEREST_ACCESS_TOKEN and PINTEREST_REFRESH_TOKEN');
        console.log('4. Redeploy your app (or wait for auto-deploy)');
        
        // Calculate next refresh date
        const nextRefreshDate = new Date();
        nextRefreshDate.setDate(nextRefreshDate.getDate() + 25);
        console.log(`\n⏰ Next refresh needed: ${nextRefreshDate.toDateString()}`);
        
        // Test the new token
        console.log('\n🧪 Testing new access token...');
        await testNewToken(tokens.access_token);
        
        return tokens;
        
    } catch (error) {
        console.error('\n❌ REFRESH FAILED:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('- Check if refresh token has expired (valid for 1 year)');
        console.error('- Verify CLIENT_ID and CLIENT_SECRET are correct');
        console.error('- Try manual OAuth flow: npm run pinterest-setup');
        process.exit(1);
    }
}

async function testNewToken(accessToken) {
    try {
        const response = await fetch('https://api.pinterest.com/v5/boards?page_size=1', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ New token works! Can access boards.');
            console.log(`Found ${data.items?.length || 0} boards`);
        } else {
            console.log(`⚠️  Token test failed: ${response.status}`);
            const error = await response.text();
            console.log(`Error: ${error}`);
        }
    } catch (error) {
        console.log(`⚠️  Token test error: ${error.message}`);
    }
}

// Run the refresh
refreshTokensForAmplify();