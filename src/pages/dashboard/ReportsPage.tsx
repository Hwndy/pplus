import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { BarChart, Download, Filter, FileSpreadsheet, Loader2 } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';

// Base URL for the API, as identified from the Postman file
const API_BASE = "https://pplus-alde.onrender.com/api";

// Helper function to handle API calls
async function jsonFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  const isJson = res.headers.get?.("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => ({})) : undefined;

  if (!res.ok) {
    const message = (body && body.message) || res.statusText || "Request failed";
    throw new Error(message);
  }
  return body;
}

// Define data types for clarity
type RecentReport = {
  _id: string;
  reportName: string;
  client: string;
  dateGenerated: string;
  reportType: string;
};

type ReportTemplate = {
  _id: string;
  name: string;
  description: string;
};

type ScheduledReport = {
  _id: string;
  reportName: string;
  schedule: string;
  client: string;
};

export default function ReportsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('recent');
  const [loading, setLoading] = useState(false);

  // State for each tab's data
  const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([]);

  // Function to fetch data based on the active tab
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      // Fetching based on the active tab, using the correct API endpoints
      switch (activeTab) {
        case 'recent':
          data = await jsonFetch('/report');
          setRecentReports(data?.data?.reports || []);
          break;
        case 'templates':
          data = await jsonFetch('/report-template/all');
          setReportTemplates(data?.data?.report_templates || []);
          break;
        case 'scheduled':
          data = await jsonFetch('/scheduled-report/all');
          setScheduledReports(data?.data?.scheduled_reports || []);
          break;
        default:
          break;
      }
    } catch (error) {
      toast({
        title: "Failed to fetch data",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [activeTab, toast]);

  // Fetch data whenever the active tab changes
  useEffect(() => {
    fetchData();
  }, [activeTab, fetchData]);

  // Column definitions for each data set, based on assumed API response structure
  const recentReportColumns = useMemo<ColumnDef<RecentReport>[]>(() => [
    { accessorKey: 'reportName', header: 'Report Name' },
    { accessorKey: 'client', header: 'Client' },
    { accessorKey: 'dateGenerated', header: 'Date Generated' },
    { accessorKey: 'reportType', header: 'Report Type' },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Download</Button>
          <Button variant="outline" size="sm"><FileSpreadsheet className="mr-2 h-4 w-4" /> Export</Button>
        </div>
      )
    }
  ], []);

  const templateColumns = useMemo<ColumnDef<ReportTemplate>[]>(() => [
    { accessorKey: 'name', header: 'Template Name' },
    { accessorKey: 'description', header: 'Description' },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex space-x-2">
          <Button size="sm">Generate from Template</Button>
        </div>
      )
    }
  ], []);

  const scheduledReportColumns = useMemo<ColumnDef<ScheduledReport>[]>(() => [
    { accessorKey: 'reportName', header: 'Report Name' },
    { accessorKey: 'client', header: 'Client' },
    { accessorKey: 'schedule', header: 'Schedule' },
    {
      id: 'actions',
      header: 'Actions',
      cell: () => (
        <div className="flex space-x-2">
          <Button variant="outline" size="sm"><Edit3 className="mr-2 h-4 w-4" /> Edit</Button>
          <Button variant="destructive" size="sm"><Trash2 className="mr-2 h-4 w-4" /> Delete</Button>
        </div>
      )
    }
  ], []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex space-x-2">
          <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
          <Button><BarChart className="mr-2 h-4 w-4" /> Generate New Report</Button>
        </div>
      </div>
      
      <Tabs defaultValue="recent" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent">
          <DataCard title="Recent Reports" description="Access and download recently generated reports" variant="glass">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <DataTable columns={recentReportColumns} data={recentReports} />
            )}
          </DataCard>
        </TabsContent>
        
        <TabsContent value="templates">
          <DataCard title="Report Templates" description="Standardized report templates for quick generation" variant="glass">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {reportTemplates.map((template) => (
                  <div key={template._id} className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                    <h3 className="font-medium mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                    <div className="flex justify-end mt-2"><Button size="sm">Generate</Button></div>
                  </div>
                ))}
              </div>
            )}
          </DataCard>
        </TabsContent>
        
        <TabsContent value="scheduled">
          <DataCard title="Scheduled Reports" description="Manage automated report generation schedules" variant="glass">
            {loading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <DataTable columns={scheduledReportColumns} data={scheduledReports} />
            )}
          </DataCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
