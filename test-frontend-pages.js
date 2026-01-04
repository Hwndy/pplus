/**
 * Frontend Pages and API Integration Test Script
 * Tests all pages and their API calls to ensure they work properly
 */

const API_BASE_URL = 'http://localhost:3001/api/v1';
const FRONTEND_URL = 'http://localhost:8080';

class FrontendTester {
  constructor() {
    this.token = null;
    this.results = {
      successful: 0,
      failed: 0,
      tests: []
    };
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Origin': FRONTEND_URL,
    };

    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers
        }
      });

      const data = await response.json();
      return { status: response.status, data, ok: response.ok };
    } catch (error) {
      return { status: 0, error: error.message, ok: false };
    }
  }

  logTest(name, success, details = '') {
    const status = success ? '✅' : '❌';
    console.log(`${status} ${name}${details ? ' - ' + details : ''}`);
    
    this.results.tests.push({ name, success, details });
    if (success) {
      this.results.successful++;
    } else {
      this.results.failed++;
    }
  }

  async testLogin() {
    console.log('\n🔐 Testing Authentication...');
    
    const response = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'admin@mediamonitor.com',
        password: 'admin123'
      })
    });

    if (response.ok && response.data?.success && response.data?.data?.token) {
      this.token = response.data.data.token;
      this.logTest('Login', true, 'Admin login successful');
      return true;
    } else {
      this.logTest('Login', false, `Status: ${response.status}`);
      return false;
    }
  }

  async testPageAPIs() {
    console.log('\n📄 Testing Page-specific API Endpoints...');

    const pageTests = [
      // Admin Dashboard APIs
      { name: 'Dashboard Summary', endpoint: '/analytics/dashboard-summary' },
      { name: 'Users List', endpoint: '/users' },
      { name: 'Companies List', endpoint: '/companies' },
      { name: 'Audit Logs', endpoint: '/audit-logs' },
      
      // Companies Page APIs
      { name: 'Companies Search (empty)', endpoint: '/companies/search?q=&limit=10' },
      { name: 'Companies Search (query)', endpoint: '/companies/search?q=Dangote&limit=10' },
      
      // Publications Page APIs
      { name: 'Publications List', endpoint: '/publications' },
      
      // Media Channels APIs
      { name: 'Media Channels List', endpoint: '/media-channels' },
      
      // Data Parameters APIs
      { name: 'Data Parameters List', endpoint: '/data-parameters' },
      
      // Editorials APIs
      { name: 'Editorials List', endpoint: '/editorials' },
      
      // SWOT Analysis APIs
      { name: 'SWOT Analysis List', endpoint: '/swot-analysis' },
      
      // Daily Mentions APIs
      { name: 'Daily Mentions List', endpoint: '/daily-mentions' },
      
      // Analytics APIs
      { name: 'Mentions Trend', endpoint: '/analytics/mentions-trend' },
      { name: 'Sentiment Analysis', endpoint: '/analytics/sentiment-analysis' },
      { name: 'Media Channel Analysis', endpoint: '/analytics/media-channel-analysis' },
      { name: 'Company Comparison', endpoint: '/analytics/company-comparison?companyIds=dummy1,dummy2' },
      
      // File Management APIs
      { name: 'Files List', endpoint: '/files' },
      
      // Export APIs
      { name: 'Export Companies', endpoint: '/export/companies?format=json' },
      { name: 'Export Editorials', endpoint: '/export/editorials?format=json' },
      { name: 'Export Analytics', endpoint: '/export/analytics?type=summary&format=json' },
      
      // Supervisors for dropdowns
      { name: 'Supervisors List', endpoint: '/users/supervisors' },
    ];

    for (const test of pageTests) {
      const response = await this.makeRequest(test.endpoint);
      
      if (response.ok && response.data?.success) {
        // Check if data is properly structured for frontend consumption
        const hasData = response.data.data !== undefined;
        const isArray = Array.isArray(response.data.data);
        const isObject = typeof response.data.data === 'object' && response.data.data !== null;
        
        if (hasData && (isArray || isObject)) {
          this.logTest(test.name, true, `Status: ${response.status}, Data: ${isArray ? 'Array' : 'Object'}`);
        } else {
          this.logTest(test.name, false, `Invalid data structure: ${typeof response.data.data}`);
        }
      } else {
        this.logTest(test.name, false, `Status: ${response.status}, Error: ${response.data?.message || response.error}`);
      }
    }
  }

  async testCORSHeaders() {
    console.log('\n🌐 Testing CORS Configuration...');

    const corsTests = [
      { name: 'OPTIONS Preflight', endpoint: '/companies', method: 'OPTIONS' },
      { name: 'GET with Origin', endpoint: '/companies', method: 'GET' },
      { name: 'POST with Origin', endpoint: '/auth/login', method: 'POST', body: '{}' },
    ];

    for (const test of corsTests) {
      const response = await this.makeRequest(test.endpoint, {
        method: test.method,
        body: test.body,
        headers: {
          'Origin': FRONTEND_URL,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type, Authorization'
        }
      });

      if (test.method === 'OPTIONS') {
        // For OPTIONS requests, check if status is 200
        this.logTest(test.name, response.status === 200, `Status: ${response.status}`);
      } else {
        // For other requests, check if they're not blocked by CORS
        const notBlocked = response.status !== 0 && !response.error?.includes('CORS');
        this.logTest(test.name, notBlocked, `Status: ${response.status}`);
      }
    }
  }

  async testDataStructures() {
    console.log('\n📊 Testing Data Structure Compatibility...');

    // Test specific endpoints that are used by frontend components
    const structureTests = [
      {
        name: 'Companies for AdminDashboard',
        endpoint: '/companies',
        expectedStructure: 'array'
      },
      {
        name: 'Users for UserManagement',
        endpoint: '/users',
        expectedStructure: 'object_with_data_array'
      },
      {
        name: 'Dashboard Summary for stats',
        endpoint: '/analytics/dashboard-summary',
        expectedStructure: 'object'
      }
    ];

    for (const test of structureTests) {
      const response = await this.makeRequest(test.endpoint);
      
      if (response.ok && response.data?.success) {
        const data = response.data.data;
        let structureValid = false;
        
        switch (test.expectedStructure) {
          case 'array':
            structureValid = Array.isArray(data);
            break;
          case 'object':
            structureValid = typeof data === 'object' && data !== null && !Array.isArray(data);
            break;
          case 'object_with_data_array':
            structureValid = typeof data === 'object' && data !== null && Array.isArray(data.data || data.items);
            break;
        }
        
        this.logTest(test.name, structureValid, `Expected: ${test.expectedStructure}, Got: ${Array.isArray(data) ? 'array' : typeof data}`);
      } else {
        this.logTest(test.name, false, `API call failed: ${response.status}`);
      }
    }
  }

  printResults() {
    console.log('\n📊 Frontend Integration Test Results:');
    console.log('================================');
    console.log(`✅ Successful: ${this.results.successful}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📈 Success Rate: ${((this.results.successful / (this.results.successful + this.results.failed)) * 100).toFixed(1)}%`);

    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.tests
        .filter(test => !test.success)
        .forEach(test => console.log(`   ${test.name} - ${test.details}`));
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Frontend Integration Tests...\n');

    const loginSuccess = await this.testLogin();
    if (loginSuccess) {
      await this.testPageAPIs();
      await this.testCORSHeaders();
      await this.testDataStructures();
    }

    this.printResults();
  }
}

// Run tests if called directly
if (typeof require !== 'undefined' && require.main === module) {
  const tester = new FrontendTester();
  tester.runAllTests()
    .then(() => {
      console.log('\n🎉 Frontend integration testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Frontend integration testing failed:', error);
      process.exit(1);
    });
}

// For browser usage
if (typeof window !== 'undefined') {
  window.FrontendTester = FrontendTester;
}
