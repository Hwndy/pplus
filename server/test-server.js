// Simple test to check if server is running and CORS is working
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:3001';

async function testServer() {
  console.log('🔍 Testing server connectivity and CORS...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(healthResponse.headers), null, 2)}`);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log(`   Response: ${JSON.stringify(healthData, null, 2)}`);
      console.log('   ✅ Health endpoint working\n');
    } else {
      console.log('   ❌ Health endpoint failed\n');
    }

    // Test CORS preflight
    console.log('2. Testing CORS preflight...');
    const corsResponse = await fetch(`${API_BASE_URL}/api/companies`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8080',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    
    console.log(`   Status: ${corsResponse.status}`);
    console.log(`   CORS Headers:`);
    console.log(`     Access-Control-Allow-Origin: ${corsResponse.headers.get('Access-Control-Allow-Origin')}`);
    console.log(`     Access-Control-Allow-Methods: ${corsResponse.headers.get('Access-Control-Allow-Methods')}`);
    console.log(`     Access-Control-Allow-Headers: ${corsResponse.headers.get('Access-Control-Allow-Headers')}`);
    console.log(`     Access-Control-Allow-Credentials: ${corsResponse.headers.get('Access-Control-Allow-Credentials')}`);
    
    if (corsResponse.ok) {
      console.log('   ✅ CORS preflight working\n');
    } else {
      console.log('   ❌ CORS preflight failed\n');
    }

    // Test actual API endpoint (should fail without auth, but should not be CORS error)
    console.log('3. Testing API endpoint without auth...');
    const apiResponse = await fetch(`${API_BASE_URL}/api/companies`, {
      method: 'GET',
      headers: {
        'Origin': 'http://localhost:8080',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   Status: ${apiResponse.status}`);
    console.log(`   Headers: ${JSON.stringify(Object.fromEntries(apiResponse.headers), null, 2)}`);
    
    if (apiResponse.status === 401) {
      console.log('   ✅ API endpoint reachable (401 expected without auth)\n');
    } else {
      const responseText = await apiResponse.text();
      console.log(`   Response: ${responseText}`);
      console.log('   ⚠️ Unexpected response\n');
    }

    // Test login endpoint
    console.log('4. Testing login endpoint...');
    const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Origin': 'http://localhost:8080',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@mediamonitor.com',
        password: 'admin123'
      })
    });
    
    console.log(`   Status: ${loginResponse.status}`);
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('   ✅ Login endpoint working');
      console.log(`   Token received: ${loginData.data?.token ? 'Yes' : 'No'}\n`);
      
      if (loginData.data?.token) {
        // Test authenticated request
        console.log('5. Testing authenticated request...');
        const authResponse = await fetch(`${API_BASE_URL}/api/companies`, {
          method: 'GET',
          headers: {
            'Origin': 'http://localhost:8080',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.data.token}`
          }
        });
        
        console.log(`   Status: ${authResponse.status}`);
        
        if (authResponse.ok) {
          const companiesData = await authResponse.json();
          console.log('   ✅ Authenticated request working');
          console.log(`   Companies count: ${companiesData.data?.length || 0}\n`);
        } else {
          const errorText = await authResponse.text();
          console.log(`   ❌ Authenticated request failed: ${errorText}\n`);
        }
      }
    } else {
      const errorText = await loginResponse.text();
      console.log(`   ❌ Login failed: ${errorText}\n`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Server appears to be down. Please start the server with:');
      console.log('   cd server && npm run dev');
    }
  }
}

testServer();
