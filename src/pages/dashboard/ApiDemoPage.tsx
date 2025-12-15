import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Users, 
  Building2, 
  FileText, 
  BarChart3, 
  Upload, 
  Download,
  Search,
  Shield,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { 
  useUsers, 
  useCompanies, 
  useEditorials, 
  useDataEntries,
  usePublications,
  useDataParameters,
  useSwotAnalyses,
  useDailyMentions,
  useFiles,
  useAuditLogs,
  useCreateUser,
  useCreateCompany,
  useCreateEditorial,
  useFileUpload,
  usePasswordReset
} from '@/hooks/useApi';
import { GlobalSearch } from '@/components/GlobalSearch';
import { DataExport } from '@/components/DataExport';
import { FileUpload } from '@/components/FileUpload';
import { UserManagement } from '@/components/UserManagement';
import { AuditLogViewer } from '@/components/AuditLogViewer';
import { toast } from 'sonner';

export default function ApiDemoPage() {
  const [activeTab, setActiveTab] = useState('overview');

  // Data fetching hooks
  const { data: users, loading: usersLoading, refetch: refetchUsers } = useUsers();
  const { data: companies, loading: companiesLoading, refetch: refetchCompanies } = useCompanies();
  const { data: editorials, loading: editorialsLoading } = useEditorials();
  const { data: dataEntries, loading: dataEntriesLoading } = useDataEntries();
  const { data: publications, loading: publicationsLoading } = usePublications();
  const { data: dataParameters, loading: dataParametersLoading } = useDataParameters();
  const { data: swotAnalyses, loading: swotLoading } = useSwotAnalyses();
  const { data: dailyMentions, loading: dailyMentionsLoading } = useDailyMentions();
  const { data: files, loading: filesLoading } = useFiles();
  const { data: auditLogs, loading: auditLoading } = useAuditLogs();

  // Mutation hooks
  const { mutate: createUser, loading: creatingUser } = useCreateUser();
  const { mutate: createCompany, loading: creatingCompany } = useCreateCompany();
  const { mutate: createEditorial, loading: creatingEditorial } = useCreateEditorial();
  const { mutate: uploadFile, loading: uploadingFile } = useFileUpload();
  const { forgotPassword, resetPassword } = usePasswordReset();

  const handleCreateTestUser = async () => {
    try {
      await createUser({
        name: 'Test User API Demo',
        email: `testuser${Date.now()}@example.com`,
        password: 'testpass123',
        role: 'Analyst',
        mobileContact: '+1234567890',
      });
      toast.success('Test user created successfully');
      refetchUsers();
    } catch (error) {
      toast.error('Failed to create test user');
    }
  };

  const handleCreateTestCompany = async () => {
    try {
      await createCompany({
        name: `Test Company ${Date.now()}`,
        industry: 'Technology',
        website: 'https://testcompany.com',
        description: 'A test company created via API demo',
      });
      toast.success('Test company created successfully');
      refetchCompanies();
    } catch (error) {
      toast.error('Failed to create test company');
    }
  };

  const handleSearchResult = (result: any) => {
    toast.success(`Selected: ${result.title} (${result.type})`);
  };

  const getStatusIcon = (loading: boolean, data: any) => {
    if (loading) return <Clock className="h-4 w-4 text-yellow-500" />;
    if (data) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = (loading: boolean, data: any) => {
    if (loading) return 'Loading...';
    if (data) return 'Loaded';
    return 'Failed';
  };

  const apiEndpoints = [
    { name: 'Users', data: users, loading: usersLoading, icon: <Users className="h-4 w-4" /> },
    { name: 'Companies', data: companies, loading: companiesLoading, icon: <Building2 className="h-4 w-4" /> },
    { name: 'Editorials', data: editorials, loading: editorialsLoading, icon: <FileText className="h-4 w-4" /> },
    { name: 'Data Entries', data: dataEntries, loading: dataEntriesLoading, icon: <Database className="h-4 w-4" /> },
    { name: 'Publications', data: publications, loading: publicationsLoading, icon: <FileText className="h-4 w-4" /> },
    { name: 'Data Parameters', data: dataParameters, loading: dataParametersLoading, icon: <Database className="h-4 w-4" /> },
    { name: 'SWOT Analyses', data: swotAnalyses, loading: swotLoading, icon: <BarChart3 className="h-4 w-4" /> },
    { name: 'Daily Mentions', data: dailyMentions, loading: dailyMentionsLoading, icon: <FileText className="h-4 w-4" /> },
    { name: 'Files', data: files, loading: filesLoading, icon: <Upload className="h-4 w-4" /> },
    { name: 'Audit Logs', data: auditLogs, loading: auditLoading, icon: <Shield className="h-4 w-4" /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Endpoints Demo</h1>
          <p className="text-muted-foreground">Comprehensive demonstration of all API endpoints</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {apiEndpoints.filter(endpoint => endpoint.data).length}/{apiEndpoints.length} Endpoints Active
        </Badge>
      </div>

      {/* Global Search Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Global Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GlobalSearch 
            onResultSelect={handleSearchResult}
            placeholder="Search across all entities (companies, users, editorials, publications)..."
          />
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="files">File Management</TabsTrigger>
          <TabsTrigger value="export">Data Export</TabsTrigger>
          <TabsTrigger value="audit">Audit & Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Endpoints Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apiEndpoints.map((endpoint) => (
                  <div key={endpoint.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      {endpoint.icon}
                      <span className="font-medium">{endpoint.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(endpoint.loading, endpoint.data)}
                      <span className="text-sm text-muted-foreground">
                        {getStatusText(endpoint.loading, endpoint.data)}
                      </span>
                      {endpoint.data && Array.isArray(endpoint.data) && (
                        <Badge variant="secondary" className="text-xs">
                          {endpoint.data.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={handleCreateTestUser} 
                  disabled={creatingUser}
                  className="w-full"
                >
                  <Users className="mr-2 h-4 w-4" />
                  {creatingUser ? 'Creating...' : 'Create Test User'}
                </Button>
                <Button 
                  onClick={handleCreateTestCompany} 
                  disabled={creatingCompany}
                  className="w-full"
                  variant="outline"
                >
                  <Building2 className="mr-2 h-4 w-4" />
                  {creatingCompany ? 'Creating...' : 'Create Test Company'}
                </Button>
                <Button 
                  onClick={() => toast.info('Password reset demo - check console')}
                  className="w-full"
                  variant="outline"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Test Password Reset
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Users:</span>
                    <span className="font-medium">{users?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Companies:</span>
                    <span className="font-medium">{companies?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Editorials:</span>
                    <span className="font-medium">{editorials?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Files:</span>
                    <span className="font-medium">{files?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Audit Log Entries:</span>
                    <span className="font-medium">{auditLogs?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : dashboardSummary ? (
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-32">
                    {JSON.stringify(dashboardSummary, null, 2)}
                  </pre>
                ) : (
                  <p className="text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {sentimentLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : sentimentAnalysis ? (
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-32">
                    {JSON.stringify(sentimentAnalysis, null, 2)}
                  </pre>
                ) : (
                  <p className="text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <FileUpload 
            uploadType="general"
            multiple={true}
            onUploadComplete={(uploadedFiles) => {
              toast.success(`Uploaded ${uploadedFiles.length} files successfully`);
            }}
          />
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <DataExport />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AuditLogViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
