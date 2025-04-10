
import { DataCard } from '@/components/ui/DataCard';
import { DataTable } from '@/components/ui/DataTable';
import { Button } from '@/components/ui/button';
import { BarChart, Download, Filter, FileSpreadsheet } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample reports data
const reports = [
  { id: '1', name: 'Monthly Media Summary', client: 'ABC Corporation', date: '2023-09-01', type: 'Media Performance' },
  { id: '2', name: 'Quarterly Sentiment Analysis', client: 'XYZ Inc.', date: '2023-07-15', type: 'Sentiment' },
  { id: '3', name: 'Social Media Engagement', client: 'Tech Partners', date: '2023-08-20', type: 'Engagement' },
  { id: '4', name: 'PR Campaign Impact', client: 'Global Media', date: '2023-09-05', type: 'Campaign Analysis' },
  { id: '5', name: 'Competitor Benchmarking', client: 'ABC Corporation', date: '2023-08-10', type: 'Competitive' },
];

// Define columns for reports table
const reportColumns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: 'Report Name',
  },
  {
    accessorKey: 'client',
    header: 'Client',
  },
  {
    accessorKey: 'date',
    header: 'Date Generated',
  },
  {
    accessorKey: 'type',
    header: 'Report Type',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: () => (
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button variant="outline" size="sm">
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    )
  }
];

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <Button>
            <BarChart className="mr-2 h-4 w-4" />
            Generate New Report
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Reports</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="recent">
          <DataCard
            title="Recent Reports"
            description="Access and download recently generated reports"
            variant="glass"
          >
            <DataTable columns={reportColumns} data={reports} />
          </DataCard>
        </TabsContent>
        
        <TabsContent value="templates">
          <DataCard
            title="Report Templates"
            description="Standardized report templates for quick generation"
            variant="glass"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
              <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <h3 className="font-medium mb-2">Media Performance Summary</h3>
                <p className="text-sm text-muted-foreground">Comprehensive overview of media performance metrics</p>
              </div>
              <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <h3 className="font-medium mb-2">Sentiment Analysis</h3>
                <p className="text-sm text-muted-foreground">Detailed breakdown of sentiment across media channels</p>
              </div>
              <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <h3 className="font-medium mb-2">Competitor Comparison</h3>
                <p className="text-sm text-muted-foreground">Side-by-side analysis with major competitors</p>
              </div>
              <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <h3 className="font-medium mb-2">Campaign Impact</h3>
                <p className="text-sm text-muted-foreground">Measure the effectiveness of media campaigns</p>
              </div>
              <div className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors">
                <h3 className="font-medium mb-2">Executive Summary</h3>
                <p className="text-sm text-muted-foreground">Condensed overview for executive stakeholders</p>
              </div>
            </div>
          </DataCard>
        </TabsContent>
        
        <TabsContent value="scheduled">
          <DataCard
            title="Scheduled Reports"
            description="Manage automated report generation schedules"
            variant="glass"
          >
            <div className="p-4">
              <p className="text-muted-foreground mb-6">Configure reports to be automatically generated and sent to stakeholders on a schedule.</p>
              <Button>Set Up New Schedule</Button>
            </div>
          </DataCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
