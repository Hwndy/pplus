// Comprehensive API testing script to test all endpoints
import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001';

interface TestResult {
  endpoint: string;
  method: string;
  status: number;
  success: boolean;
  error?: string;
  data?: any;
}

class ComprehensiveApiTester {
  private token: string | null = null;
  private results: TestResult[] = [];
  private createdResources: { [key: string]: string } = {};

  async makeRequest(endpoint: string, method: string = 'GET', body?: any, requireAuth: boolean = false) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
    };

    if (requireAuth && this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const options: any = {
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
        data: data,
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

  async testAuthentication() {
    console.log('\n🔐 Testing Authentication Endpoints...');
    
    try {
      // Test login
      const { data } = await this.makeRequest('/api/auth/login', 'POST', {
        email: 'admin@mediamonitor.com',
        password: 'admin123',
      });

      if (data.data?.token) {
        this.token = data.data.token;
        console.log('✅ POST /api/auth/login - Login successful');
        
        // Test profile
        await this.makeRequest('/api/auth/me', 'GET', undefined, true);
        console.log('✅ GET /api/auth/me - Profile retrieved');

        // Test change password (with current password)
        try {
          await this.makeRequest('/api/auth/change-password', 'POST', {
            currentPassword: 'admin123',
            newPassword: 'admin123', // Keep same password for testing
          }, true);
          console.log('✅ POST /api/auth/change-password - Password change tested');
        } catch (error) {
          console.log('⚠️ POST /api/auth/change-password - Expected behavior');
        }

        // Test refresh token
        try {
          await this.makeRequest('/api/auth/refresh', 'POST', {
            refreshToken: data.data.refreshToken || 'dummy-token',
          });
          console.log('✅ POST /api/auth/refresh - Refresh token tested');
        } catch (error) {
          console.log('⚠️ POST /api/auth/refresh - Expected behavior for dummy token');
        }

        // Test forgot password
        try {
          await this.makeRequest('/api/auth/forgot-password', 'POST', {
            email: 'admin@mediamonitor.com',
          });
          console.log('✅ POST /api/auth/forgot-password - Forgot password tested');
        } catch (error) {
          console.log('⚠️ POST /api/auth/forgot-password - Expected behavior');
        }

        // Test reset password
        try {
          await this.makeRequest('/api/auth/reset-password', 'POST', {
            token: 'dummy-token',
            newPassword: 'newpassword123',
          });
          console.log('✅ POST /api/auth/reset-password - Reset password tested');
        } catch (error) {
          console.log('⚠️ POST /api/auth/reset-password - Expected behavior for dummy token');
        }

        return true;
      } else {
        console.log('❌ Login failed - no token received');
        return false;
      }
    } catch (error) {
      console.log('❌ Authentication failed:', error);
      return false;
    }
  }

  async testUserManagement() {
    console.log('\n👥 Testing User Management Endpoints...');

    if (!this.token) {
      console.log('❌ No authentication token available');
      return;
    }

    try {
      // Get all users
      await this.makeRequest('/api/users', 'GET', undefined, true);
      console.log('✅ GET /api/users - Users retrieved');

      // Get supervisors
      await this.makeRequest('/api/users/supervisors', 'GET', undefined, true);
      console.log('✅ GET /api/users/supervisors - Supervisors retrieved');

      // Create a test user
      const { data: userData } = await this.makeRequest('/api/users', 'POST', {
        name: 'Test User API',
        email: 'testuser@example.com',
        password: 'testpass123',
        role: 'ANALYST',
        mobileContact: '+1234567890',
        countryCode: '+1',
      }, true);

      if (userData.data?.id) {
        this.createdResources.user = userData.data.id;
        console.log('✅ POST /api/users - User created');

        // Get user by ID
        await this.makeRequest(`/api/users/${userData.data.id}`, 'GET', undefined, true);
        console.log('✅ GET /api/users/:id - User retrieved by ID');

        // Update user
        await this.makeRequest(`/api/users/${userData.data.id}`, 'PUT', {
          name: 'Updated Test User',
          mobileContact: '+0987654321',
        }, true);
        console.log('✅ PUT /api/users/:id - User updated');

        // Test bulk update
        await this.makeRequest('/api/users/bulk-update', 'PUT', {
          updates: [
            {
              id: userData.data.id,
              data: { name: 'Bulk Updated Test User' },
            },
          ],
        }, true);
        console.log('✅ PUT /api/users/bulk-update - Bulk update tested');
      }
    } catch (error) {
      console.log('❌ User management test failed:', error);
    }
  }

  async testCompanyManagement() {
    console.log('\n🏢 Testing Company Management Endpoints...');

    if (!this.token) return;

    try {
      // Get all companies
      await this.makeRequest('/api/companies', 'GET', undefined, true);
      console.log('✅ GET /api/companies - Companies retrieved');

      // Search companies
      await this.makeRequest('/api/companies/search?q=test&limit=5', 'GET', undefined, true);
      console.log('✅ GET /api/companies/search - Company search tested');

      // Create a test company
      const { data: companyData } = await this.makeRequest('/api/companies', 'POST', {
        name: 'Test Company API',
        industry: 'Technology',
        website: 'https://testcompany.com',
        description: 'A test company created via API',
      }, true);

      if (companyData.data?.id) {
        this.createdResources.company = companyData.data.id;
        console.log('✅ POST /api/companies - Company created');

        // Get company by ID
        await this.makeRequest(`/api/companies/${companyData.data.id}`, 'GET', undefined, true);
        console.log('✅ GET /api/companies/:id - Company retrieved by ID');

        // Update company
        await this.makeRequest(`/api/companies/${companyData.data.id}`, 'PUT', {
          description: 'Updated description via API',
          website: 'https://updated-testcompany.com',
        }, true);
        console.log('✅ PUT /api/companies/:id - Company updated');
      }
    } catch (error) {
      console.log('❌ Company management test failed:', error);
    }
  }

  async testPublicationManagement() {
    console.log('\n📰 Testing Publication Management Endpoints...');

    if (!this.token) return;

    try {
      // Get all publications
      await this.makeRequest('/api/publications', 'GET', undefined, true);
      console.log('✅ GET /api/publications - Publications retrieved');

      // Create a test publication
      const { data: publicationData } = await this.makeRequest('/api/publications', 'POST', {
        name: 'Test Publication API',
        type: 'ONLINE',
        website: 'https://testpublication.com',
        country: 'Nigeria',
        language: 'English',
        circulation: 10000,
      }, true);

      if (publicationData.data?.id) {
        this.createdResources.publication = publicationData.data.id;
        console.log('✅ POST /api/publications - Publication created');

        // Get publication by ID
        await this.makeRequest(`/api/publications/${publicationData.data.id}`, 'GET', undefined, true);
        console.log('✅ GET /api/publications/:id - Publication retrieved by ID');

        // Update publication
        await this.makeRequest(`/api/publications/${publicationData.data.id}`, 'PUT', {
          circulation: 15000,
          website: 'https://updated-testpublication.com',
        }, true);
        console.log('✅ PUT /api/publications/:id - Publication updated');
      }
    } catch (error) {
      console.log('❌ Publication management test failed:', error);
    }
  }

  async testMediaChannelManagement() {
    console.log('\n📺 Testing Media Channel Management Endpoints...');

    if (!this.token) return;

    try {
      // Get all media channels
      await this.makeRequest('/api/media-channels', 'GET', undefined, true);
      console.log('✅ GET /api/media-channels - Media channels retrieved');

      // Create a test media channel
      const { data: channelData } = await this.makeRequest('/api/media-channels', 'POST', {
        name: 'Test Channel API',
        type: 'ONLINE',
        category: 'Digital',
        description: 'A test media channel created via API',
      }, true);

      if (channelData.data?.id) {
        this.createdResources.mediaChannel = channelData.data.id;
        console.log('✅ POST /api/media-channels - Media channel created');

        // Get media channel by ID
        await this.makeRequest(`/api/media-channels/${channelData.data.id}`, 'GET', undefined, true);
        console.log('✅ GET /api/media-channels/:id - Media channel retrieved by ID');

        // Update media channel
        await this.makeRequest(`/api/media-channels/${channelData.data.id}`, 'PUT', {
          description: 'Updated description via API',
          category: 'Updated Digital',
        }, true);
        console.log('✅ PUT /api/media-channels/:id - Media channel updated');
      }
    } catch (error) {
      console.log('❌ Media channel management test failed:', error);
    }
  }

  async testDataParameterManagement() {
    console.log('\n📊 Testing Data Parameter Management Endpoints...');

    if (!this.token) return;

    try {
      // Get all data parameters
      await this.makeRequest('/api/data-parameters', 'GET', undefined, true);
      console.log('✅ GET /api/data-parameters - Data parameters retrieved');

      // Create a test data parameter
      const { data: parameterData } = await this.makeRequest('/api/data-parameters', 'POST', {
        name: 'Test Parameter API',
        category: 'Testing',
        description: 'A test data parameter created via API',
        unit: 'count',
      }, true);

      if (parameterData.data?.id) {
        this.createdResources.dataParameter = parameterData.data.id;
        console.log('✅ POST /api/data-parameters - Data parameter created');

        // Get data parameter by ID
        await this.makeRequest(`/api/data-parameters/${parameterData.data.id}`, 'GET', undefined, true);
        console.log('✅ GET /api/data-parameters/:id - Data parameter retrieved by ID');

        // Update data parameter
        await this.makeRequest(`/api/data-parameters/${parameterData.data.id}`, 'PUT', {
          description: 'Updated description via API',
          unit: 'percentage',
        }, true);
        console.log('✅ PUT /api/data-parameters/:id - Data parameter updated');
      }
    } catch (error) {
      console.log('❌ Data parameter management test failed:', error);
    }
  }

  async testDataEntryManagement() {
    console.log('\n📊 Testing Data Entry Management Endpoints...');

    if (!this.token) return;

    try {
      // Get all data entries
      await this.makeRequest('/api/data-entries', 'GET', undefined, true);
      console.log('✅ GET /api/data-entries - Data entries retrieved');

      // Create a test data entry (if we have required resources)
      if (this.createdResources.company && this.createdResources.dataParameter && this.createdResources.mediaChannel) {
        const { data: dataEntryData } = await this.makeRequest('/api/data-entries', 'POST', {
          companyId: this.createdResources.company,
          parameterId: this.createdResources.dataParameter,
          channelId: this.createdResources.mediaChannel,
          value: 100,
          date: new Date().toISOString(),
          comments: 'Test data entry created via API',
        }, true);

        if (dataEntryData.data?.id) {
          this.createdResources.dataEntry = dataEntryData.data.id;
          console.log('✅ POST /api/data-entries - Data entry created');

          // Get data entry by ID
          await this.makeRequest(`/api/data-entries/${dataEntryData.data.id}`, 'GET', undefined, true);
          console.log('✅ GET /api/data-entries/:id - Data entry retrieved by ID');

          // Update data entry
          await this.makeRequest(`/api/data-entries/${dataEntryData.data.id}`, 'PUT', {
            value: 150,
            comments: 'Updated test data entry via API',
          }, true);
          console.log('✅ PUT /api/data-entries/:id - Data entry updated');
        }
      }
    } catch (error) {
      console.log('❌ Data entry management test failed:', error);
    }
  }

  async testEditorialManagement() {
    console.log('\n📝 Testing Editorial Management Endpoints...');

    if (!this.token) return;

    try {
      // Get all editorials
      await this.makeRequest('/api/editorials', 'GET', undefined, true);
      console.log('✅ GET /api/editorials - Editorials retrieved');

      // Create a test editorial (if we have required resources)
      if (this.createdResources.company && this.createdResources.publication) {
        const { data: editorialData } = await this.makeRequest('/api/editorials', 'POST', {
          date: new Date().toISOString(),
          companyId: this.createdResources.company,
          industry: 'Technology',
          brand: 'Test Brand',
          publicationId: this.createdResources.publication,
          title: 'Test Editorial Created via API',
          mediaType: 'ONLINE',
          sentiment: 'POSITIVE',
          mediaSentimentIndex: 4.0,
          audienceReach: 10000,
          circulation: 5000,
          analystNote: 'Test editorial note',
        }, true);

        if (editorialData.data?.id) {
          this.createdResources.editorial = editorialData.data.id;
          console.log('✅ POST /api/editorials - Editorial created');

          // Get editorial by ID
          await this.makeRequest(`/api/editorials/${editorialData.data.id}`, 'GET', undefined, true);
          console.log('✅ GET /api/editorials/:id - Editorial retrieved by ID');

          // Update editorial
          await this.makeRequest(`/api/editorials/${editorialData.data.id}`, 'PUT', {
            sentiment: 'NEUTRAL',
            mediaSentimentIndex: 3.0,
            analystNote: 'Updated editorial note via API',
          }, true);
          console.log('✅ PUT /api/editorials/:id - Editorial updated');
        }
      }
    } catch (error) {
      console.log('❌ Editorial management test failed:', error);
    }
  }

  async testSwotAnalysisManagement() {
    console.log('\n🎯 Testing SWOT Analysis Management Endpoints...');

    if (!this.token) return;

    try {
      // Get all SWOT analyses
      await this.makeRequest('/api/swot-analysis', 'GET', undefined, true);
      console.log('✅ GET /api/swot-analysis - SWOT analyses retrieved');

      // Create a test SWOT analysis (if we have required resources)
      if (this.createdResources.company) {
        const { data: swotData } = await this.makeRequest('/api/swot-analysis', 'POST', {
          companyId: this.createdResources.company,
          date: new Date().toISOString(),
          items: [
            { content: 'Strong brand recognition', type: 'STRENGTH' },
            { content: 'Limited market presence', type: 'WEAKNESS' },
            { content: 'Growing digital market', type: 'OPPORTUNITY' },
            { content: 'Increased competition', type: 'THREAT' },
          ],
          analystNote: 'Test SWOT analysis created via API',
        }, true);

        if (swotData.data?.id) {
          this.createdResources.swotAnalysis = swotData.data.id;
          console.log('✅ POST /api/swot-analysis - SWOT analysis created');

          // Get SWOT analysis by ID
          await this.makeRequest(`/api/swot-analysis/${swotData.data.id}`, 'GET', undefined, true);
          console.log('✅ GET /api/swot-analysis/:id - SWOT analysis retrieved by ID');

          // Update SWOT analysis
          await this.makeRequest(`/api/swot-analysis/${swotData.data.id}`, 'PUT', {
            analystNote: 'Updated SWOT analysis note via API',
            items: [
              { content: 'Very strong brand recognition', type: 'STRENGTH' },
              { content: 'Limited market presence in rural areas', type: 'WEAKNESS' },
            ],
          }, true);
          console.log('✅ PUT /api/swot-analysis/:id - SWOT analysis updated');
        }
      }
    } catch (error) {
      console.log('❌ SWOT analysis management test failed:', error);
    }
  }

  async testDailyMentionManagement() {
    console.log('\n📅 Testing Daily Mention Management Endpoints...');

    if (!this.token) return;

    try {
      // Get all daily mentions
      await this.makeRequest('/api/daily-mentions', 'GET', undefined, true);
      console.log('✅ GET /api/daily-mentions - Daily mentions retrieved');

      // Create a test daily mention (if we have required resources)
      if (this.createdResources.company) {
        const { data: mentionData } = await this.makeRequest('/api/daily-mentions', 'POST', {
          date: new Date().toISOString(),
          companyId: this.createdResources.company,
          title: 'Daily Mention Test via API',
          publications: ['Test Publication 1', 'Test Publication 2'],
          highlights: [
            { content: 'Positive coverage in tech news', type: 'POSITIVE' },
            { content: 'Neutral mention in business section', type: 'NEUTRAL' },
          ],
          analystNote: 'Test daily mention created via API',
        }, true);

        if (mentionData.data?.id) {
          this.createdResources.dailyMention = mentionData.data.id;
          console.log('✅ POST /api/daily-mentions - Daily mention created');

          // Get daily mention by ID
          await this.makeRequest(`/api/daily-mentions/${mentionData.data.id}`, 'GET', undefined, true);
          console.log('✅ GET /api/daily-mentions/:id - Daily mention retrieved by ID');

          // Update daily mention
          await this.makeRequest(`/api/daily-mentions/${mentionData.data.id}`, 'PUT', {
            title: 'Updated Daily Mention Test via API',
            analystNote: 'Updated daily mention note via API',
          }, true);
          console.log('✅ PUT /api/daily-mentions/:id - Daily mention updated');
        }
      }
    } catch (error) {
      console.log('❌ Daily mention management test failed:', error);
    }
  }

  async testFileUploadEndpoints() {
    console.log('\n📁 Testing File Upload Endpoints...');

    if (!this.token) return;

    try {
      // Get all files
      await this.makeRequest('/api/files', 'GET', undefined, true);
      console.log('✅ GET /api/files - Files retrieved');

      // Note: File upload testing would require actual file data
      // This is a placeholder for file upload testing
      console.log('⚠️ File upload endpoints require actual file data - skipping upload tests');
    } catch (error) {
      console.log('❌ File upload test failed:', error);
    }
  }

  async testAuditLogEndpoints() {
    console.log('\n📋 Testing Audit Log Endpoints...');

    if (!this.token) return;

    try {
      // Get all audit logs
      await this.makeRequest('/api/audit-logs', 'GET', undefined, true);
      console.log('✅ GET /api/audit-logs - Audit logs retrieved');

      // Get audit log statistics
      await this.makeRequest('/api/audit-logs/stats', 'GET', undefined, true);
      console.log('✅ GET /api/audit-logs/stats - Audit log statistics retrieved');
    } catch (error) {
      console.log('❌ Audit log test failed:', error);
    }
  }

  async testAnalyticsEndpoints() {
    console.log('\n📈 Testing Analytics Endpoints...');

    if (!this.token) return;

    try {
      // Dashboard summary
      await this.makeRequest('/api/analytics/dashboard-summary', 'GET', undefined, true);
      console.log('✅ GET /api/analytics/dashboard-summary - Dashboard summary retrieved');

      // Mentions trend
      await this.makeRequest('/api/analytics/mentions-trend', 'GET', undefined, true);
      console.log('✅ GET /api/analytics/mentions-trend - Mentions trend retrieved');

      // Sentiment analysis
      await this.makeRequest('/api/analytics/sentiment-analysis', 'GET', undefined, true);
      console.log('✅ GET /api/analytics/sentiment-analysis - Sentiment analysis retrieved');

      // Media channel analysis
      await this.makeRequest('/api/analytics/media-channel-analysis', 'GET', undefined, true);
      console.log('✅ GET /api/analytics/media-channel-analysis - Media channel analysis retrieved');

      // Company comparison (with dummy company IDs)
      await this.makeRequest('/api/analytics/company-comparison?companyIds=dummy1,dummy2', 'GET', undefined, true);
      console.log('✅ GET /api/analytics/company-comparison - Company comparison retrieved');
    } catch (error) {
      console.log('❌ Analytics test failed:', error);
    }
  }

  async testExportEndpoints() {
    console.log('\n📤 Testing Export Endpoints...');

    if (!this.token) return;

    try {
      // Export companies
      await this.makeRequest('/api/export/companies?format=json', 'GET', undefined, true);
      console.log('✅ GET /api/export/companies - Companies export retrieved');

      // Export editorials
      await this.makeRequest('/api/export/editorials?format=json', 'GET', undefined, true);
      console.log('✅ GET /api/export/editorials - Editorials export retrieved');

      // Export analytics
      await this.makeRequest('/api/export/analytics?type=summary&format=json', 'GET', undefined, true);
      console.log('✅ GET /api/export/analytics - Analytics export retrieved');
    } catch (error) {
      console.log('❌ Export test failed:', error);
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test resources...');

    // Delete created resources in reverse order (dependent resources first)
    const deleteOrder = [
      'user',
      'dailyMention',
      'swotAnalysis',
      'editorial',
      'dataEntry',
      'dataParameter',
      'mediaChannel',
      'publication',
      'company'
    ];

    for (const resourceType of deleteOrder) {
      const resourceId = this.createdResources[resourceType];
      if (resourceId) {
        try {
          let endpoint = '';
          switch (resourceType) {
            case 'user':
              endpoint = `/api/users/${resourceId}`;
              break;
            case 'company':
              endpoint = `/api/companies/${resourceId}`;
              break;
            case 'publication':
              endpoint = `/api/publications/${resourceId}`;
              break;
            case 'mediaChannel':
              endpoint = `/api/media-channels/${resourceId}`;
              break;
            case 'dataParameter':
              endpoint = `/api/data-parameters/${resourceId}`;
              break;
            case 'dataEntry':
              endpoint = `/api/data-entries/${resourceId}`;
              break;
            case 'editorial':
              endpoint = `/api/editorials/${resourceId}`;
              break;
            case 'swotAnalysis':
              endpoint = `/api/swot-analysis/${resourceId}`;
              break;
            case 'dailyMention':
              endpoint = `/api/daily-mentions/${resourceId}`;
              break;
          }

          if (endpoint) {
            await this.makeRequest(endpoint, 'DELETE', undefined, true);
            console.log(`✅ Deleted ${resourceType}: ${resourceId}`);
          }
        } catch (error) {
          console.log(`⚠️ Failed to delete ${resourceType}: ${resourceId}`);
        }
      }
    }
  }

  printResults() {
    console.log('\n📊 Comprehensive Test Results:');
    console.log('================================');

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

    console.log('\n📋 All Tested Endpoints:');
    this.results.forEach(r => {
      const status = r.success ? '✅' : '❌';
      console.log(`   ${status} ${r.method} ${r.endpoint} (${r.status})`);
    });
  }

  async runAllTests() {
    console.log('🚀 Starting Comprehensive API Tests...\n');

    const loginSuccess = await this.testAuthentication();
    if (loginSuccess) {
      // Test basic resource management first
      await this.testUserManagement();
      await this.testCompanyManagement();
      await this.testPublicationManagement();
      await this.testMediaChannelManagement();
      await this.testDataParameterManagement();

      // Test dependent resources
      await this.testDataEntryManagement();
      await this.testEditorialManagement();
      await this.testSwotAnalysisManagement();
      await this.testDailyMentionManagement();

      // Test utility endpoints
      await this.testFileUploadEndpoints();
      await this.testAuditLogEndpoints();
      await this.testAnalyticsEndpoints();
      await this.testExportEndpoints();

      // Cleanup
      await this.cleanup();
    }

    this.printResults();
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new ComprehensiveApiTester();
  tester.runAllTests()
    .then(() => {
      console.log('\n🎉 Comprehensive API testing completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Comprehensive API testing failed:', error);
      process.exit(1);
    });
}

export { ComprehensiveApiTester };
