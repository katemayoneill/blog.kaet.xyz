// scripts/pinterest-exact-spec.js
// Following Pinterest's exact API specification

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI;

async function testMultipleFormats(authCode) {
    console.log('🧪 Testing multiple Pinterest API formats...\n');
    
    // Format 1: Standard form-urlencoded (what we've been using)
    console.log('1️⃣ Testing standard format...');
    await testFormat1(authCode);
    
    // Format 2: JSON body
    console.log('\n2️⃣ Testing JSON format...');
    await testFormat2(authCode);
    
    // Format 3: Different headers
    console.log('\n3️⃣ Testing with different headers...');
    await testFormat3(authCode);
    
    // Format 4: Basic auth
    console.log('\n4️⃣ Testing basic authentication...');
    await testFormat4(authCode);
    
    // Format 5: Without redirect_uri (some APIs don't require it in token exchange)
    console.log('\n5️⃣ Testing without redirect_uri...');
    await testFormat5(authCode);
}

async function testFormat1(authCode) {
    try {
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
                code: authCode
            })
        });
        
        console.log(`   Status: ${response.status}`);
        const result = await response.text();
        console.log(`   Response: ${result}`);
        
        if (response.ok) {
            console.log('   ✅ SUCCESS with standard format!');
            return JSON.parse(result);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
}

async function testFormat2(authCode) {
    try {
        const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                code: authCode
            })
        });
        
        console.log(`   Status: ${response.status}`);
        const result = await response.text();
        console.log(`   Response: ${result}`);
        
        if (response.ok) {
            console.log('   ✅ SUCCESS with JSON format!');
            return JSON.parse(result);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
}

async function testFormat3(authCode) {
    try {
        const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'User-Agent': 'Pinterest-OAuth-Client/1.0'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                code: authCode
            })
        });
        
        console.log(`   Status: ${response.status}`);
        const result = await response.text();
        console.log(`   Response: ${result}`);
        
        if (response.ok) {
            console.log('   ✅ SUCCESS with custom headers!');
            return JSON.parse(result);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
}

async function testFormat4(authCode) {
    try {
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
        
        console.log(`   Status: ${response.status}`);
        const result = await response.text();
        console.log(`   Response: ${result}`);
        
        if (response.ok) {
            console.log('   ✅ SUCCESS with basic auth!');
            return JSON.parse(result);
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
}

async function testFormat5(authCode) {
    try {
        const response = await fetch('https://api.pinterest.com/v5/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: authCode
            })
        });
        
        console.log(`   Status: ${response.status}`);
        const result = await response.text();
        console.log(`   Response: ${result}`);
        
        if (response.ok) {
            console.log('   ✅ SUCCESS without redirect_uri!');
            const tokens = JSON.parse(result);
            
            console.log('\n🎉 TOKENS RECEIVED:');
            console.log('Access Token:', tokens.access_token?.substring(0, 20) + '...');
            console.log('Refresh Token:', tokens.refresh_token?.substring(0, 20) + '...');
            console.log('Expires in:', tokens.expires_in, 'seconds');
            
            console.log('\n📝 Add to your .env file:');
            console.log(`PINTEREST_ACCESS_TOKEN=${tokens.access_token}`);
            if (tokens.refresh_token) {
                console.log(`PINTEREST_REFRESH_TOKEN=${tokens.refresh_token}`);
            }
            
            return tokens;
        }
    } catch (error) {
        console.log(`   ❌ Error: ${error.message}`);
    }
}

// Run tests
const authCode = process.argv[2];
if (!authCode) {
    console.log('Usage: node scripts/pinterest-exact-spec.js YOUR_AUTH_CODE');
    process.exit(1);
}

testMultipleFormats(authCode);