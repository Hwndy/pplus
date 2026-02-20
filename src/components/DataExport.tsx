import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText, Database, BarChart3, Users, Newspaper, TrendingUp, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthContext' 
import { toast } from 'sonner';

interface ExportFilters {
  format: 'json' | 'csv';
  startDate?: Date;
  endDate?: Date;
  companyId?: string;
  search?: string;
}

type ExportType =
  | 'companies'
  | 'publications'
  | 'editorials'
  | 'daily-mentions'
  | 'swot-analysis'
  | 'outcome-insights'
  | 'social-media-mentions';

const API_BASE_URL = 'https://pplus-g19c.onrender.com/api/v1/export';

export function DataExport() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({
    format: 'csv',
  });

  const handleExport = async (exportType: ExportType) => {
    if (!token) {
      toast.error('You must be logged in to export data');
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.append('format', filters.format);

      if (filters.startDate) {
        params.append('date_from', format(filters.startDate, 'yyyy-MM-dd'));
      }
      if (filters.endDate) {
        params.append('date_to', format(filters.endDate, 'yyyy-MM-dd'));
      }
      if (filters.companyId) {
        params.append('company_id', filters.companyId);
      }
      if (filters.search) {
        params.append('search', filters.search);
      }

      const endpointMap: Record<ExportType, string> = {
        'companies': '/companies',
        'publications': '/publications',
        'editorials': '/editorials',
        'daily-mentions': '/daily-mentions',
        'swot-analysis': '/swot-analysis',
        'outcome-insights': '/outcome-insights',
        'social-media-mentions': '/social-media-mentions',
      };

      const url = `${API_BASE_URL}${endpointMap[exportType]}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Export failed');
      }

      const contentType = response.headers.get('content-type') || '';
      const filename = `${exportType.replace(/-/g, '_')}_${format(new Date(), 'yyyy-MM-dd')}.${filters.format}`;

      let blob: Blob;
      let downloadUrl: string;

      if (contentType.includes('text/csv') || filters.format === 'csv') {
        // Handle CSV: response is plain text
        const csvText = await response.text();
        blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      } else {
        // Handle JSON: parse and re-stringify for pretty print
        const jsonData = await response.json();
        const prettyJson = JSON.stringify(jsonData.data || jsonData, null, 2);
        blob = new Blob([prettyJson], { type: 'application/json' });
      }

      downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`${exportType.replace(/-/g, ' ')} exported successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to export data: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportCards: Array<{ type: ExportType; title: string; description: string; icon: React.ReactNode }> = [
    {
      type: 'companies',
      title: 'Companies Data',
      icon: <Database className="h-5 w-5" />,
      description: 'Export all registered companies with industry, contact info, and metadata.',
    },
    {
      type: 'publications',
      title: 'Publications',
      icon: <Newspaper className="h-5 w-5" />,
      description: 'Export list of media publications (newspapers, websites, etc.).',
    },
    {
      type: 'editorials',
      title: 'Editorial Content',
      icon: <FileText className="h-5 w-5" />,
      description: 'Export editorial articles with sentiment, company mentions, and dates.',
    },
    {
      type: 'daily-mentions',
      title: 'Daily Mentions',
      icon: <TrendingUp className="h-5 w-5" />,
      description: 'Export daily media mentions including uploads, analysts, and status.',
    },
    {
      type: 'swot-analysis',
      title: 'SWOT Analyses',
      icon: <BarChart3 className="h-5 w-5" />,
      description: 'Export SWOT reports with analyst and supervisor notes.',
    },
    {
      type: 'outcome-insights',
      title: 'Outcome Insights',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'Export outcome insights including brand awareness and media coverage.',
    },
    {
      type: 'social-media-mentions',
      title: 'Social Media Mentions',
      icon: <MessageSquare className="h-5 w-5" />,
      description: 'Export social media posts from Facebook, Instagram, and X.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Data Export</h1>
      </div>

      {/* Export Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Export Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Format */}
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select
                value={filters.format}
                onValueChange={(value: 'json' | 'csv') => setFilters(prev => ({ ...prev, format: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !filters.startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, startDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !filters.endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(filters.endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => setFilters(prev => ({ ...prev, endDate: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Company ID */}
            <div className="space-y-2">
              <Label htmlFor="companyId">Company ID (Optional)</Label>
              <Input
                id="companyId"
                placeholder="e.g. 123"
                value={filters.companyId || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, companyId: e.target.value }))}
              />
            </div>
          </div>

          {/* Search Term */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Term (Optional)</Label>
            <Input
              id="search"
              placeholder="Search in titles, notes, etc."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exportCards.map(({ type, title, description, icon }) => (
          <Card key={type}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {icon}
                {title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{description}</p>
              <Button
                onClick={() => handleExport(type)}
                disabled={loading}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>JSON Format:</strong> Structured data ideal for developers and integrations</p>
            <p>• <strong>CSV Format:</strong> Spreadsheet-friendly format for Excel/Google Sheets</p>
            <p>• <strong>Date Range:</strong> Filter data by creation/publication date</p>
            <p>• <strong>Company ID:</strong> Limit export to a specific company</p>
            <p>• <strong>Search:</strong> Filter by keywords in content or notes (where supported)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}