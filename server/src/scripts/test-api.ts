// Comprehensive API testing script to verify all endpoints are working
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  error?: string;
}

class ApiTester {
  private token: string | null = null;
  private results: TestResult[] = [];

  async makeRequest(endpoint: string, method: string = 'GET', body?: any, requireAuth: boolean = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (requireAuth && this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();

      const result: TestResult = {
        endpoint,
        method,
        status: response.status,
        success: response.ok,
      };

      if (!response.ok) {
        result.error = data.error || 'Unknown error';
      }

      this.results.push(result);
      return { response, data };
    } catch (error) {
      const result: TestResult = {
        endpoint,
        method,
        status: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };

      this.results.push(result);
      throw error;
    }
  }

  async testLogin() {
    console.log('🔐 Testing authentication...');
    
    try {
      const { data } = await this.makeRequest('/api/auth/login', 'POST', {
        email: 'admin@mediamonitor.com',
        password: 'admin123',
      });

      if (data.data?.token) {
        this.token = data.data.token;
        console.log('✅ Login successful');
        return true;
      } else {
        console.log('❌ Login failed - no token received');
        return false;
      }
    } catch (error) {
      console.log('❌ Login failed:', error);
      return false;
    }
  }

  async testPublicEndpoints() {
    console.log('🌐 Testing public endpoints...');

    const endpoints = [
      { path: '/', method: 'GET' },
      { path: '/health', method: 'GET' },
      { path: '/test', method: 'GET' },
    ];

    for (const endpoint of endpoints) {
      try {
        await this.makeRequest(endpoint.path, endpoint.method);
        console.log(`✅ ${endpoint.method} ${endpoint.path}`);
      } catch (error) {
        console.log(`❌ ${endpoint.method} ${endpoint.path}:`, error);
      }
    }
  }

  async testProtectedEndpoints() {
    console.log('🔒 Testing protected endpoints...');

    if (!this.token) {
      console.log('❌ No authentication token available');
      return;
    }

    const endpoints = [
      { path: '/api/auth/me', method: 'GET' },
      { path: '/api/users', method: 'GET' },
      { path: '/api/companies', method: 'GET' },
      { path: '/api/publications', method: 'GET' },
      { path: '/api/media-channels', method: 'GET' },
      { path: '/api/data-parameters', method: 'GET' },
      { path: '/api/data-entries', method: 'GET' },
      { path: '/api/editorials', method: 'GET' },
      { path: '/api/swot-analysis', method: 'GET' },
      { path: '/api/daily-mentions', method: 'GET' },
      { path: '/api/analytics/dashboard-summary', method: 'GET' },
      { path: '/api/audit-logs', method: 'GET' },
    ];

    for (const endpoint of endpoints) {
      try {
        await this.makeRequest(endpoint.path, endpoint.method, undefined, true);
        console.log(`✅ ${endpoint.method} ${endpoint.path}`);
      } catch (error) {
        console.log(`❌ ${endpoint.method} ${endpoint.path}:`, error);
      }
    }
  }

  async testCRUDOperations() {
    console.log('📝 Testing CRUD operations...');

    if (!this.token) {
      console.log('❌ No authentication token available');
      return;
    }

    try {
      // Test company creation
      const { data: companyData } = await this.makeRequest('/api/companies', 'POST', {
        name: 'Test Company API',
        industry: 'Technology',
        website: 'https://testcompany.com',
        description: 'A test company created via API',
      }, true);

      if (companyData.data?.id) {
        console.log('✅ Company created successfully');

        // Test company update
        await this.makeRequest(`/api/companies/${companyData.data.id}`, 'PUT', {
          description: 'Updated description via API',
        }, true);
        console.log('✅ Company updated successfully');

        // Test company deletion
        await this.makeRequest(`/api/companies/${companyData.data.id}`, 'DELETE', undefined, true);
        console.log('✅ Company deleted successfully');
      }
    } catch (error) {
      console.log('❌ CRUD operations failed:', error);
    }
  }

  printResults() {
    console.log('\n📊 Test Results Summary:');
    console.log('========================');

    const successful = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;

    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Success Rate: ${((successful / this.results.length) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`   ${r.method} ${r.endpoint} - Status: ${r.status} - ${r.error}`);
        });
    }
  }

  async runAllTests() {
    console.log('🚀 Starting API tests...\n');

    await this.testPublicEndpoints();
    
    const loginSuccess = await this.testLogin();
    if (loginSuccess) {
      await this.testProtectedEndpoints();
      await this.testCRUDOperations();
    }

    this.printResults();
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new ApiTester();
  tester.runAllTests()
    .then(() => {
      console.log('\n🎉 API testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 API testing failed:', error);
      process.exit(1);
    });
}

export { ApiTester };
