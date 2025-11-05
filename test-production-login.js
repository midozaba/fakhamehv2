import axios from 'axios';

// Test production login endpoint
async function testProductionLogin() {
  const PROD_URL = 'https://al-fakhamah-car-rent.com/api';

  console.log('🔍 Testing production login endpoint...\n');

  try {
    console.log(`📡 Attempting login at: ${PROD_URL}/admin/login`);

    const response = await axios.post(`${PROD_URL}/admin/login`, {
      username: 'abood',
      password: 'admin123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true,
      validateStatus: () => true // Don't throw on any status
    });

    console.log('\n✅ Response received:');
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Data:', typeof response.data === 'string' ? response.data.substring(0, 200) : response.data);

    if (response.status === 500) {
      console.log('\n❌ SERVER ERROR (500)');
      console.log('The server is crashing. Common causes:');
      console.log('1. Missing database table (admin_action_logs)');
      console.log('2. Database connection failed');
      console.log('3. Environment variables not set');
      console.log('4. Node server not running or crashed');
      console.log('\nCheck server logs with: pm2 logs');
    }

  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n⚠️ Connection refused - server might not be running');
    }
  }
}

testProductionLogin();
