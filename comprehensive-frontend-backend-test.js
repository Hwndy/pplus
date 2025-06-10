/**
 * Comprehensive Frontend & Backend Integration Test
 * Tests all major functionality including form handling, API calls, and data flow
 */

const API_BASE_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:8080';

class ComprehensiveTester {
  constructor() {
    this.token = null;
    this.results = {
      backend: { successful: 0, failed: 0, tests: [] },
      frontend: { successful: 0, failed: 0, tests: [] },
      integration: { successful: 0, failed: 0, tests: [] }
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

  logTest(category, name, success, details = '') {
    const status = success ? '✅' : '❌';
    console.log(`${status} [${category}] ${name}${details ? ' - ' + details : ''}`);
    
    this.results[category].tests.push({ name, success, details });
    if (success) {
      this.results[category].successful++;
    } else {
      this.results[category].failed++;
    }
  }

  async testAuthentication() {
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
      this.logTest('backend', 'Admin Login', true, 'Token received');
      return true;
    } else {
      this.logTest('backend', 'Admin Login', false, `Status: ${response.status}`);
      return false;
    }
  }

  async testBackendAPIs() {
    console.log('\n📡 Testing Backend APIs...');

    const backendTests = [
      // Empty search parameters (previously failing)
      { name: 'Users empty search', endpoint: '/users?search=' },
      { name: 'Companies empty search', endpoint: '/companies?search=' },
      { name: 'Publications empty search', endpoint: '/publications?search=' },
      { name: 'Data Entries empty search', endpoint: '/data-entries?search=' },
      { name: 'Editorials empty search', endpoint: '/editorials?search=' },
      
      // Filter parameters (previously failing)
      { name: 'Users role filter', endpoint: '/users?role=ADMIN' },
      { name: 'Publications type filter', endpoint: '/publications?type=PRINT' },
      { name: 'Data Entries status filter', endpoint: '/data-entries?status=APPROVED' },
      { name: 'Editorials sentiment filter', endpoint: '/editorials?sentiment=POSITIVE' },
      
      // Companies search (previously failing)
      { name: 'Company search empty', endpoint: '/companies/search?q=&limit=10' },
      { name: 'Company search query', endpoint: '/companies/search?q=Dangote&limit=10' },
      
      // Core endpoints
      { name: 'Dashboard Summary', endpoint: '/analytics/dashboard-summary' },
      { name: 'Users List', endpoint: '/users' },
      { name: 'Companies List', endpoint: '/companies' },
      { name: 'Publications List', endpoint: '/publications' },
      
      // Pagination
      { name: 'Users pagination', endpoint: '/users?page=1&limit=5' },
      { name: 'Companies pagination', endpoint: '/companies?page=1&limit=5' },
      
      // Combined filters
      { name: 'Users search + role', endpoint: '/users?search=admin&role=ADMIN' },
      { name: 'Companies search + active', endpoint: '/companies?search=&isActive=true' },
    ];

    for (const test of backendTests) {
      const response = await this.makeRequest(test.endpoint);
      
      if (response.ok && response.data?.success) {
        this.logTest('backend', test.name, true, `Status: ${response.status}`);
      } else {
        this.logTest('backend', test.name, false, `Status: ${response.status}, Error: ${response.data?.message || response.error}`);
      }
    }
  }

  async testUserCRUD() {
    console.log('\n👤 Testing User CRUD Operations...');

    // Test user creation
    const createUserData = {
      name: 'Test User ' + Date.now(),
      email: `testuser${Date.now()}@example.com`,
      password: 'password123',
      role: 'ANALYST',
      mobileContact: '+1234567890'
    };

    const createResponse = await this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(createUserData)
    });

    if (createResponse.ok && createResponse.data?.success) {
      const userId = createResponse.data.data.id;
      this.logTest('integration', 'User Creation', true, `User ID: ${userId}`);

      // Test user retrieval
      const getResponse = await this.makeRequest(`/users/${userId}`);
      if (getResponse.ok && getResponse.data?.success) {
        this.logTest('integration', 'User Retrieval', true, 'User found');

        // Test user update
        const updateData = { name: 'Updated Test User' };
        const updateResponse = await this.makeRequest(`/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify(updateData)
        });

        if (updateResponse.ok && updateResponse.data?.success) {
          this.logTest('integration', 'User Update', true, 'User updated');
        } else {
          this.logTest('integration', 'User Update', false, `Status: ${updateResponse.status}`);
        }

        // Test user deletion
        const deleteResponse = await this.makeRequest(`/users/${userId}`, {
          method: 'DELETE'
        });

        if (deleteResponse.ok && deleteResponse.data?.success) {
          this.logTest('integration', 'User Deletion', true, 'User deleted');
        } else {
          this.logTest('integration', 'User Deletion', false, `Status: ${deleteResponse.status}`);
        }
      } else {
        this.logTest('integration', 'User Retrieval', false, `Status: ${getResponse.status}`);
      }
    } else {
      this.logTest('integration', 'User Creation', false, `Status: ${createResponse.status}, Error: ${createResponse.data?.message}`);
    }
  }

  async testFormValidation() {
    console.log('\n📝 Testing Form Validation...');

    const validationTests = [
      {
        name: 'Missing required fields',
        data: { name: 'Test' },
        shouldFail: true
      },
      {
        name: 'Invalid email format',
        data: { name: 'Test', email: 'invalid-email', password: 'password123', role: 'ANALYST' },
        shouldFail: true
      },
      {
        name: 'Short password',
        data: { name: 'Test', email: 'test@example.com', password: '123', role: 'ANALYST' },
        shouldFail: true
      },
      {
        name: 'Valid user data',
        data: { name: 'Valid User', email: `valid${Date.now()}@example.com`, password: 'password123', role: 'ANALYST' },
        shouldFail: false
      }
    ];

    for (const test of validationTests) {
      const response = await this.makeRequest('/users', {
        method: 'POST',
        body: JSON.stringify(test.data)
      });

      const success = test.shouldFail ? !response.ok : response.ok;
      this.logTest('integration', `Validation: ${test.name}`, success, 
        test.shouldFail ? `Expected failure, got ${response.status}` : `Expected success, got ${response.status}`);

      // Clean up if user was created
      if (response.ok && response.data?.data?.id) {
        await this.makeRequest(`/users/${response.data.data.id}`, { method: 'DELETE' });
      }
    }
  }

  async testDataConsistency() {
    console.log('\n🔄 Testing Data Consistency...');

    // Test that all endpoints return consistent data structures
    const consistencyTests = [
      { name: 'Users data structure', endpoint: '/users' },
      { name: 'Companies data structure', endpoint: '/companies' },
      { name: 'Publications data structure', endpoint: '/publications' },
      { name: 'Dashboard data structure', endpoint: '/analytics/dashboard-summary' }
    ];

    for (const test of consistencyTests) {
      const response = await this.makeRequest(test.endpoint);
      
      if (response.ok && response.data?.success) {
        const hasData = response.data.data !== undefined;
        const isValidStructure = hasData && (
          Array.isArray(response.data.data) || 
          typeof response.data.data === 'object'
        );
        
        this.logTest('frontend', test.name, isValidStructure, 
          `Data type: ${Array.isArray(response.data.data) ? 'Array' : typeof response.data.data}`);
      } else {
        this.logTest('frontend', test.name, false, `API call failed: ${response.status}`);
      }
    }
  }

  printResults() {
    console.log('\n📊 Comprehensive Test Results:');
    console.log('================================');

    for (const [category, result] of Object.entries(this.results)) {
      const total = result.successful + result.failed;
      const successRate = total > 0 ? ((result.successful / total) * 100).toFixed(1) : '0.0';
      
      console.log(`\n${category.toUpperCase()}:`);
      console.log(`✅ Successful: ${result.successful}`);
      console.log(`❌ Failed: ${result.failed}`);
      console.log(`📈 Success Rate: ${successRate}%`);

      if (result.failed > 0) {
        console.log('Failed tests:');
        result.tests
          .filter(test => !test.success)
          .forEach(test => console.log(`   ${test.name} - ${test.details}`));
      }
    }

    const totalSuccessful = Object.values(this.results).reduce((sum, r) => sum + r.successful, 0);
    const totalFailed = Object.values(this.results).reduce((sum, r) => sum + r.failed, 0);
    const overallSuccessRate = ((totalSuccessful / (totalSuccessful + totalFailed)) * 100).toFixed(1);

    console.log('\n🎯 OVERALL SUMMARY:');
    console.log(`✅ Total Successful: ${totalSuccessful}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    console.log(`📈 Overall Success Rate: ${overallSuccessRate}%`);
    console.log(`📊 Total Tests: ${totalSuccessful + totalFailed}`);

    if (totalFailed === 0) {
      console.log('\n🎉 ALL TESTS PASSED! Frontend and Backend are fully functional!');
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive Frontend & Backend Tests...\n');

    const loginSuccess = await this.testAuthentication();
    if (loginSuccess) {
      await this.testBackendAPIs();
      await this.testUserCRUD();
      await this.testFormValidation();
      await this.testDataConsistency();
    }

    this.printResults();
  }
}

// Run tests if called directly
if (typeof require !== 'undefined' && require.main === module) {
  const tester = new ComprehensiveTester();
  tester.runAllTests()
    .then(() => {
      console.log('\n🎉 Comprehensive testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Comprehensive testing failed:', error);
      process.exit(1);
    });
}

// For browser usage
if (typeof window !== 'undefined') {
  window.ComprehensiveTester = ComprehensiveTester;
}
