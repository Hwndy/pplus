import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Download, Upload, FileSpreadsheet, CheckCircle, Loader2 } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { apiService } from '@/services/apiService';

const EditorialBatchUploadPage = () => {
  const navigate = useNavigate();
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadStats, setUploadStats] = useState<{
    total: number;
    processed: number;
    errors: number;
  } | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
      setUploadSuccess(false);
    }
  };

  // Handle batch upload
  const handleBatchUpload = async () => {
    if (!uploadFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);

    try {
      const response = await apiService.batchUploadEditorials(uploadFile);

      setIsUploading(false);
      setUploadSuccess(true);
      setUploadStats({
        total: response.data?.total || 0,
        processed: response.data?.processed || 0,
        errors: response.data?.errors || 0
      });

      toast.success(`File ${uploadFile.name} processed successfully`);
    } catch (error) {
      console.error('Batch upload error:', error);
      setIsUploading(false);
      toast.error('Failed to process file. Please check the format and try again.');
    }
  };

  // Handle template download
  const handleDownloadTemplate = async () => {
    try {
      const blob = await apiService.downloadEditorialTemplate();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'editorial_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Template download error:', error);
      toast.error('Failed to download template');
    }
  };

  // Go back to editorial page
  const handleBack = () => {
    navigate('/dashboard/editorial');
  };

  // View processed data
  const handleViewData = () => {
    navigate('/dashboard/editorial');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/editorial">Editorial</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>Batch Upload</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Batch Upload Editorials</h1>
        </div>
      </div>

      <div className="grid gap-6">
        {uploadSuccess ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                Upload Successful
              </CardTitle>
              <CardDescription>
                Your file has been processed successfully.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadStats && (
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Records</p>
                    <p className="text-2xl font-bold">{uploadStats.total}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Processed</p>
                    <p className="text-2xl font-bold text-green-600">{uploadStats.processed}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Errors</p>
                    <p className="text-2xl font-bold text-red-500">{uploadStats.errors}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setUploadFile(null);
                setUploadSuccess(false);
                setUploadStats(null);
              }}>
                Upload Another File
              </Button>
              <Button onClick={handleViewData}>
                View Processed Data
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Upload Excel File
                </CardTitle>
                <CardDescription>
                  Upload multiple editorials at once using an Excel file.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Select Excel File</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleFileChange}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Accepted formats: Excel (.xlsx, .xls)
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleDownloadTemplate}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
                <Button
                  onClick={handleBatchUpload}
                  disabled={!uploadFile || isUploading}
                  className="bg-indigo-950"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload & Process
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>File Format Requirements</CardTitle>
                <CardDescription>
                  Your Excel file must contain the following columns:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-4">
                  <div>
                    <p className="font-medium mb-2">Required Columns:</p>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>date (YYYY-MM-DD format)</li>
                      <li>company (Company name)</li>
                      <li>industry (Industry category)</li>
                      <li>brand (Brand name)</li>
                      <li>publication (Publication name)</li>
                      <li>title (Editorial title)</li>
                      <li>mediaType (Print or Online)</li>
                      <li>sentiment (Positive, Negative, or Neutral)</li>
                    </ul>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-2">Optional Columns:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1">
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>subSector (Sub-sector within industry)</li>
                        <li>placement (Headline, Photo, etc.)</li>
                        <li>page (Page number)</li>
                        <li>link (URL for online content)</li>
                        <li>reporter (Reporter name)</li>
                        <li>country (Country name)</li>
                      </ul>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>language (Language)</li>
                        <li>spokesperson (Spokesperson name)</li>
                        <li>activity (Activity type)</li>
                        <li>onlineChannel (For online media type)</li>
                        <li>mediaSentimentIndex (Numeric value)</li>
                        <li>advertSpend (Numeric value)</li>
                      </ul>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>circulation (Numeric value)</li>
                        <li>audienceReach (Numeric value)</li>
                        <li>pageSize (Full Page, Half Page, etc.)</li>
                        <li>analystNote (Text)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                    <p className="font-medium text-amber-800 mb-2">Tips for successful upload:</p>
                    <ul className="list-disc pl-5 space-y-1 text-amber-700">
                      <li>Make sure your Excel file has a header row with the column names</li>
                      <li>Dates should be in YYYY-MM-DD format (e.g., 2023-05-15)</li>
                      <li>Use consistent naming for companies, publications, etc.</li>
                      <li>For mediaType, use only "Print" or "Online"</li>
                      <li>For sentiment, use only "Positive", "Negative", or "Neutral"</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default EditorialBatchUploadPage;
