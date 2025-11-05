import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

const API_URL = 'http://localhost:3001/api';

async function testAdminCarUpload() {
  try {
    console.log('🔐 Step 1: Logging in as admin...');

    // Login as admin
    const loginResponse = await axios.post(`${API_URL}/admin/login`, {
      username: 'admin',
      password: 'admin123'
    }, {
      withCredentials: true
    });

    console.log('✅ Login successful!');
    console.log('User:', loginResponse.data.user);

    const token = loginResponse.data.token;
    const cookies = loginResponse.headers['set-cookie'];

    console.log('\n🚗 Step 2: Creating a test car...');

    // Create FormData for car upload
    const formData = new FormData();
    formData.append('car_barnd', 'Test Brand');
    formData.append('car_type', 'Test Type');
    formData.append('car_model', '2024');
    formData.append('car_num', 'TEST-123');
    formData.append('price_per_day', '50');
    formData.append('price_per_week', '300');
    formData.append('price_per_month', '1000');
    formData.append('car_color', 'Blue');
    formData.append('mileage', '0');
    formData.append('status', 'available');
    formData.append('car_category', 'Economy');

    // Create car with authentication
    const carResponse = await axios.post(`${API_URL}/cars`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${token}`,
        'Cookie': cookies ? cookies.join('; ') : ''
      },
      withCredentials: true
    });

    console.log('✅ Car created successfully!');
    console.log('Response:', carResponse.data);

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    console.error('Headers:', error.response?.headers);
  }
}

testAdminCarUpload();
