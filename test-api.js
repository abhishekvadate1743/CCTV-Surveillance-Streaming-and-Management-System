import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const testAPI = async () => {
  try {
    console.log('🔍 Testing CCTV Surveillance API...\n');

    // Test 1: Health check
    console.log('1️⃣  Testing server health...');
    const healthRes = await axios.get(`${API_URL}/health`);
    console.log('✅ Server is running!');
    console.log(`   Status: ${healthRes.data.status}\n`);

    // Test 2: Register user
    console.log('2️⃣  Registering test user...');
    const registerRes = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test Admin',
      email: `admin-${Date.now()}@test.com`,
      password: 'testpass123',
      role: 'admin'
    });
    const token = registerRes.data.token;
    console.log('✅ User registered successfully!');
    console.log(`   Token: ${token.substring(0, 20)}...\n`);

    // Test 3: Get current user
    console.log('3️⃣  Getting current user...');
    const userRes = await axios.get(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ User fetched successfully!');
    console.log(`   Name: ${userRes.data.user.name}`);
    console.log(`   Email: ${userRes.data.user.email}`);
    console.log(`   Role: ${userRes.data.user.role}\n`);

    // Test 4: Get cameras (should be empty)
    console.log('4️⃣  Fetching cameras...');
    const camerasRes = await axios.get(`${API_URL}/cameras`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Cameras fetched successfully!');
    console.log(`   Total cameras: ${camerasRes.data.cameras.length}\n`);

    // Test 5: Create a camera
    console.log('5️⃣  Creating a test camera...');
    const cameraRes = await axios.post(`${API_URL}/cameras`, {
      name: 'Front Gate Camera',
      location: 'Main Gate',
      streamUrl: 'http://camera1.local:8080/stream',
      rtspUrl: 'rtsp://192.168.1.100:554/stream',
      cameraType: 'ip'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Camera created successfully!');
    console.log(`   Camera ID: ${cameraRes.data.camera._id}`);
    console.log(`   Camera Name: ${cameraRes.data.camera.name}\n`);

    // Test 6: Get cameras again
    console.log('6️⃣  Fetching cameras again...');
    const camerasRes2 = await axios.get(`${API_URL}/cameras`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Cameras fetched successfully!');
    console.log(`   Total cameras: ${camerasRes2.data.cameras.length}\n`);

    console.log('✅✅✅ All tests passed! API is working correctly! ✅✅✅\n');
    console.log('🚀 Server is ready to use!');
    console.log(`📍 API Base URL: ${API_URL}`);
    console.log('📚 Check README.md for API documentation');

  } catch (error) {
    console.error('❌ Test failed!');
    if (error.response) {
      console.error('Error:', error.response.data);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Cannot connect to server. Is it running on http://localhost:5000?');
      console.error('Run: npm run dev');
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
};

testAPI();
