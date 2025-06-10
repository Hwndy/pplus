import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Download, FileText, Database, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

interface ExportFilters {
  format: 'json' | 'csv';
  startDate?: Date;
  endDate?: Date;
  companyId?: string;
  type?: string;
}

export function DataExport() {
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ExportFilters>({
    format: 'json',
  });

  const handleExport = async (exportType: 'companies' | 'editorials' | 'analytics') => {
    try {
      setLoading(true);
      
      const params: Record<string, string> = {
        format: filters.format,
      };

      if (filters.startDate) {
        params.startDate = format(filters.startDate, 'yyyy-MM-dd');
      }
      if (filters.endDate) {
        params.endDate = format(filters.endDate, 'yyyy-MM-dd');
      }
      if (filters.companyId) {
        params.companyId = filters.companyId;
      }
      if (filters.type && exportType === 'analytics') {
        params.type = filters.type;
      }

      let response;
      let filename;

      switch (exportType) {
        case 'companies':
          response = await apiService.exportCompanies(params);
          filename = `companies-export-${format(new Date(), 'yyyy-MM-dd')}.${filters.format}`;
          break;
        case 'editorials':
          response = await apiService.exportEditorials(params);
          filename = `editorials-export-${format(new Date(), 'yyyy-MM-dd')}.${filters.format}`;
          break;
        case 'analytics':
          response = await apiService.exportAnalytics(params);
          filename = `analytics-export-${format(new Date(), 'yyyy-MM-dd')}.${filters.format}`;
          break;
        default:
          throw new Error('Invalid export type');
      }

      // Handle CSV downloads
      if (filters.format === 'csv' && typeof response === 'string') {
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        // Handle JSON downloads
        const blob = new Blob([JSON.stringify(response.data, null, 2)], { 
          type: 'application/json' 
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      toast.success(`${exportType} data exported successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`Failed to export ${exportType} data`);
    } finally {
      setLoading(false);
    }
  };

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
            {/* Format Selection */}
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select
                value={filters.format}
                onValueChange={(value: 'json' | 'csv') => 
                  setFilters(prev => ({ ...prev, format: value }))
                }
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
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.startDate && "text-muted-foreground"
                    )}
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
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.endDate && "text-muted-foreground"
                    )}
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
                placeholder="Enter company ID"
                value={filters.companyId || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, companyId: e.target.value }))}
              />
            </div>
          </div>

          {/* Analytics Type (only for analytics export) */}
          <div className="space-y-2">
            <Label htmlFor="analyticsType">Analytics Type (for analytics export)</Label>
            <Select
              value={filters.type || 'summary'}
              onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select analytics type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary</SelectItem>
                <SelectItem value="sentiment">Sentiment Analysis</SelectItem>
                <SelectItem value="mentions">Mentions Analysis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Companies Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Companies Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export all companies data including industry, website, and metadata.
            </p>
            <Button
              onClick={() => handleExport('companies')}
              disabled={loading}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Companies
            </Button>
          </CardContent>
        </Card>

        {/* Editorials Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Editorial Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export editorial data including sentiment analysis and media coverage.
            </p>
            <Button
              onClick={() => handleExport('editorials')}
              disabled={loading}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Editorials
            </Button>
          </CardContent>
        </Card>

        {/* Analytics Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Export analytics reports including trends and performance metrics.
            </p>
            <Button
              onClick={() => handleExport('analytics')}
              disabled={loading}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Export Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>JSON Format:</strong> Structured data suitable for programmatic use</p>
            <p>• <strong>CSV Format:</strong> Spreadsheet-compatible format for analysis</p>
            <p>• <strong>Date Filters:</strong> Optional date range to limit exported data</p>
            <p>• <strong>Company Filter:</strong> Export data for specific company only</p>
            <p>• <strong>Analytics Types:</strong> Choose between summary, sentiment, or mentions analysis</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
