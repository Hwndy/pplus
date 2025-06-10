// Simple startup check script
const http = require('http');

const checkServer = () => {
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3001/health', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Server is running and healthy');
          console.log('📊 Health check response:', JSON.parse(data));
          resolve(true);
        } else {
          console.log('❌ Server health check failed');
          reject(new Error(`Health check failed with status: ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ Server is not running or not accessible');
      console.log('Error:', error.message);
      reject(error);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Health check timed out');
      req.destroy();
      reject(new Error('Health check timeout'));
    });
  });
};

const main = async () => {
  console.log('🔍 Checking server status...');
  
  try {
    await checkServer();
    console.log('\n🎉 Server is ready!');
    console.log('🌐 Access points:');
    console.log('   - API: http://localhost:3001');
    console.log('   - Health: http://localhost:3001/health');
    console.log('   - Docs: http://localhost:3001/api-docs');
    console.log('   - Test: http://localhost:3001/test');
  } catch (error) {
    console.log('\n💡 To start the server, run:');
    console.log('   npm run dev');
    process.exit(1);
  }
};

main();
