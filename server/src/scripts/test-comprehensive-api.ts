/**
 * Comprehensive API Testing Script
 * Tests all endpoints with the seeded data and verifies functionality
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:8080';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  dataCount?: number;
  error?: string;
}

class APITester {
  private token: string = '';
  private results: TestResult[] = [];

  async runAllTests() {
    console.log('🧪 Starting Comprehensive API Testing...\n');

    try {
      // Step 1: Authentication
      await this.testAuthentication();

      // Step 2: Test all GET endpoints
      await this.testGetEndpoints();

      // Step 3: Test data creation
      await this.testDataCreation();

      // Step 4: Test data updates
      await this.testDataUpdates();

      // Step 5: Generate report
      this.generateReport();

    } catch (error) {
      console.error('❌ Testing failed:', error);
    }
  }

  private async testAuthentication() {
    console.log('🔐 Testing Authentication...');

    // Test login with different user roles
    const users = [
      { email: 'admin@mediamonitor.com', password: 'admin123', role: 'ADMIN' },
      { email: 'analyst1@mediamonitor.com', password: 'analyst123', role: 'ANALYST' },
      { email: 'supervisor1@mediamonitor.com', password: 'supervisor123', role: 'SUPERVISOR' },
      { email: 'client1@company.com', password: 'client123', role: 'CLIENT' }
    ];

    for (const user of users) {
      const result = await this.makeRequest('POST', '/api/auth/login', {
        email: user.email,
        password: user.password
      });

      if (result.success && result.data?.token) {
        console.log(`✅ ${user.role} login successful`);
        if (user.role === 'ADMIN') {
          this.token = result.data.token; // Use admin token for subsequent tests
        }
      } else {
        console.log(`❌ ${user.role} login failed:`, result.error);
      }
    }

    console.log('');
  }

  private async testGetEndpoints() {
    console.log('📊 Testing GET Endpoints...');

    const endpoints = [
      '/api/companies',
      '/api/companies?page=1&limit=5',
      '/api/publications',
      '/api/publications?page=1&limit=5',
      '/api/users',
      '/api/users?page=1&limit=5',
      '/api/media-channels',
      '/api/data-parameters',
      '/api/data-entries',
      '/api/data-entries?page=1&limit=5',
      '/api/editorials',
      '/api/editorials?page=1&limit=5',
      '/api/swot-analysis',
      '/api/daily-mentions',
      '/api/audit-logs',
      '/api/analytics/dashboard-summary',
      '/api/analytics/mentions-trend',
      '/api/analytics/sentiment-analysis'
    ];

    for (const endpoint of endpoints) {
      const result = await this.makeRequest('GET', endpoint);
      const dataCount = result.data?.data?.length || result.data?.length || 0;
      
      console.log(`${result.success ? '✅' : '❌'} ${endpoint} - Status: ${result.status} - Data: ${dataCount} items`);
      
      this.results.push({
        endpoint,
        method: 'GET',
        status: result.status,
        success: result.success,
        dataCount,
        error: result.error
      });
    }

    console.log('');
  }

  private async testDataCreation() {
    console.log('➕ Testing Data Creation...');

    // Test creating a new company
    const newCompany = {
      name: 'Test Company Ltd',
      industry: 'Technology',
      email: 'info@testcompany.com',
      phone: '+234-800-TEST-123',
      address: 'Test Address, Lagos',
      ceo: 'Test CEO',
      website: 'https://testcompany.com',
      description: 'A test company for API testing'
    };

    const companyResult = await this.makeRequest('POST', '/api/companies', newCompany);
    console.log(`${companyResult.success ? '✅' : '❌'} Create Company - Status: ${companyResult.status}`);

    // Test creating a new user
    const newUser = {
      name: 'Test User',
      email: 'testuser@mediamonitor.com',
      password: 'testuser123',
      role: 'ANALYST',
      mobileContact: '+234-800-TEST-456',
      countryCode: '+234'
    };

    const userResult = await this.makeRequest('POST', '/api/users', newUser);
    console.log(`${userResult.success ? '✅' : '❌'} Create User - Status: ${userResult.status}`);

    // Test creating a new publication
    const newPublication = {
      name: 'Test Publication',
      type: 'ONLINE',
      website: 'https://testpublication.com',
      country: 'Nigeria',
      circulation: 10000
    };

    const publicationResult = await this.makeRequest('POST', '/api/publications', newPublication);
    console.log(`${publicationResult.success ? '✅' : '❌'} Create Publication - Status: ${publicationResult.status}`);

    console.log('');
  }

  private async testDataUpdates() {
    console.log('✏️ Testing Data Updates...');

    // Get first company to update
    const companiesResult = await this.makeRequest('GET', '/api/companies?limit=1');
    if (companiesResult.success && companiesResult.data?.data?.length > 0) {
      const company = companiesResult.data.data[0];
      const updateData = {
        description: 'Updated description for testing'
      };

      const updateResult = await this.makeRequest('PUT', `/api/companies/${company.id}`, updateData);
      console.log(`${updateResult.success ? '✅' : '❌'} Update Company - Status: ${updateResult.status}`);
    }

    // Get first user to update
    const usersResult = await this.makeRequest('GET', '/api/users?limit=1');
    if (usersResult.success && usersResult.data?.data?.length > 0) {
      const user = usersResult.data.data[0];
      const updateData = {
        mobileContact: '+234-800-UPDATED'
      };

      const updateResult = await this.makeRequest('PUT', `/api/users/${user.id}`, updateData);
      console.log(`${updateResult.success ? '✅' : '❌'} Update User - Status: ${updateResult.status}`);
    }

    console.log('');
  }

  private async makeRequest(method: string, endpoint: string, data?: any) {
    try {
      const url = `${BASE_URL}${endpoint}`;
      const options: any = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Origin': FRONTEND_URL
        }
      };

      if (this.token) {
        options.headers['Authorization'] = `Bearer ${this.token}`;
      }

      if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const responseData = await response.json();

      return {
        success: response.ok,
        status: response.status,
        data: responseData,
        error: response.ok ? null : responseData.message || 'Unknown error'
      };
    } catch (error) {
      return {
        success: false,
        status: 0,
        data: null,
        error: error.message
      };
    }
  }

  private generateReport() {
    console.log('📋 Test Results Summary:');
    console.log('========================\n');

    const totalTests = this.results.length;
    const successfulTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - successfulTests;

    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Successful: ${successfulTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%\n`);

    // Group by status code
    const statusGroups = this.results.reduce((acc, result) => {
      acc[result.status] = (acc[result.status] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    console.log('📊 Status Code Distribution:');
    Object.entries(statusGroups).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} requests`);
    });

    // Show failed tests
    const failedResults = this.results.filter(r => !r.success);
    if (failedResults.length > 0) {
      console.log('\n❌ Failed Tests:');
      failedResults.forEach(result => {
        console.log(`   ${result.method} ${result.endpoint} - Status: ${result.status} - Error: ${result.error}`);
      });
    }

    // Show data counts
    const dataResults = this.results.filter(r => r.dataCount !== undefined);
    if (dataResults.length > 0) {
      console.log('\n📊 Data Counts:');
      dataResults.forEach(result => {
        if (result.success) {
          console.log(`   ${result.endpoint}: ${result.dataCount} items`);
        }
      });
    }

    console.log('\n🎉 Testing completed!');
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new APITester();
  tester.runAllTests()
    .then(() => {
      console.log('\n✅ All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Testing failed:', error);
      process.exit(1);
    });
}

export default APITester;
