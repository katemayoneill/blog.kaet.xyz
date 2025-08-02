// scripts/pinterest-basic-auth.js
// Test with basic authentication format

const CLIENT_ID = '1526279';
const CLIENT_SECRET = '22b8dc6eb18a34108282166af8e30232d51e9ca6';
const REDIRECT_URI = 'https://blog.kaet.xyz/pinterest-callback';

async function testBasicAuth(authCode) {
    console.log('🧪 Testing with basic auth format...');
    
    // Create basic auth header
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    try {
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
        
        console.log('Status:', response.status);
        const result = await response.text();
        console.log('Response:', result);
        
        if (response.ok) {
            console.log('✅ Basic auth worked!');
            return JSON.parse(result);
        }
    } catch (error) {
        console.log('❌ Basic auth failed:', error.message);
    }
    
    // Try without redirect_uri (some APIs don't require it in token exchange)
    console.log('\n🧪 Testing without redirect_uri...');
    
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
        
        console.log('Status:', response.status);
        const result = await response.text();
        console.log('Response:', result);
        
        if (response.ok) {
            console.log('✅ Without redirect_uri worked!');
            return JSON.parse(result);
        }
    } catch (error) {
        console.log('❌ Without redirect_uri failed:', error.message);
    }
    
    return null;
}

const authCode = process.argv[2];
if (!authCode) {
    console.log('Usage: node scripts/pinterest-basic-auth.js YOUR_AUTH_CODE');
    process.exit(1);
}

testBasicAuth(authCode);