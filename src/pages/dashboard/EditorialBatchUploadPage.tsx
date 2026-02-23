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
      setUploadStats(null);
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

      // Correctly extract stats from backend response structure
      const summary = response.data?.summary || {};

      setUploadStats({
        total: summary.total_rows_processed || 0,
        processed: summary.successful_imports || 0,
        errors: summary.failed_imports || 0,
      });

      // Better success message
      if (summary.failed_imports > 0) {
        toast.success(
          `${summary.successful_imports} records imported successfully, ${summary.failed_imports} failed`
        );
      } else {
        toast.success(
          `Upload successful! All ${summary.successful_imports} records processed.`
        );
      }
    } catch (error: any) {
      console.error('Batch upload error:', error);
      setIsUploading(false);
      setUploadSuccess(false);

      const errorMessage =
        Array.isArray(error.response?.data?.message)
          ? error.response.data.message.map((m: any) => m.message || m).join('; ')
          : error.response?.data?.message || error.message || 'Unknown error occurred';

      toast.error(`Upload failed: ${errorMessage}`);
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
      link.download = 'editorial_template.csv';
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

  // Reset upload form
  const handleUploadAnother = () => {
    setUploadFile(null);
    setUploadSuccess(false);
    setUploadStats(null);
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
                <div className="grid grid-cols-3 gap-8 text-center">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Records</p>
                    <p className="text-3xl font-bold">{uploadStats.total.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Successfully Processed</p>
                    <p className="text-3xl font-bold text-green-600">
                      {uploadStats.processed.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Errors</p>
                    <p className="text-3xl font-bold text-red-600">
                      {uploadStats.errors.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleUploadAnother}>
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
                  Upload Data File
                </CardTitle>
                <CardDescription>
                  Upload multiple editorials at once using an Excel or CSV file.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="file-upload">Select File (.xlsx, .xls, .csv)</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        id="file-upload"
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        onChange={handleFileChange}
                        disabled={isUploading}
                      />
                      {uploadFile && (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          Selected: {uploadFile.name}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Accepted formats: Excel (.xlsx, .xls) or CSV (.csv)
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={handleDownloadTemplate} disabled={isUploading}>
                  <Download className="mr-2 h-4 w-4" />
                  Download Template
                </Button>
                <Button
                  onClick={handleBatchUpload}
                  disabled={!uploadFile || isUploading}
                  className="bg-indigo-950 hover:bg-indigo-800"
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
                  Your Excel or CSV file must contain the following columns:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-6">
                  <div>
                    <p className="font-medium mb-2">Required Columns:</p>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      <li>date (DD-MM-YYYY format)</li>
                      <li>source (Publication Name)</li>
                      <li>company (Company Name)</li>
                      <li>media type (Print or Online)</li>
                      <li>title (Editorial Title)</li>   
                      <li>sentiment (Positive, Negative, or Neutral)</li>
                      <li>print web clips (URL)</li>
                      <li>sentiment keyword indicator</li>
                      <li>advert spend (Numeric)</li>
                      <li>circulation (Numeric)</li>
                      <li>audience reach (Numeric)</li>
                      <li>page size (Full Page, Half Page, etc.)</li>
                      <li>language</li>
                      <li>placement (Headline, Front Page, etc.)</li>
                      <li>reporter (Reporter name)</li>
                      <li>country (Country name)</li>
                      <li>spokesperson (Spokesperson name)</li>
                      <li>activity (Activity type)</li>
                      <li>online channel (For online media)</li>
                    </ul>
                  </div>

                  <div>
                    <p className="font-medium mb-2">Optional Columns:</p>
                    <div>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {/* <li>placement (Headline, Front Page, etc.)</li>
                        <li>reporter (Reporter name)</li>
                        <li>country (Country name)</li>
                        <li>spokesperson (Spokesperson name)</li>
                        <li>activity (Activity type)</li>
                        <li>online channel (For online media)</li> */}
                      </ul>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        {/* <li>advert spend (Numeric)</li>
                        <li>circulation (Numeric)</li>
                        <li>audience reach (Numeric)</li>
                        <li>page size (Full Page, Half Page, etc.)</li> */}
                        <li>page number</li>
                        {/* <li>language</li> */}
                      </ul>
                      <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                        <li>ceo thought leadership (Yes/No)</li>
                        {/* <li>print web clips (URL)</li>
                        <li>sentiment keyword indicator</li> */}
                        <li>analyst note</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-md border border-amber-200 dark:border-amber-800">
                    <p className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                      Tips for successful upload:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-amber-700 dark:text-amber-400">
                      <li>First row must be headers matching column names exactly (case-insensitive)</li>
                      <li>Dates must be in DD-MM-YYYY format</li>
                      <li>Media Type: use only "Print" or "Online"</li>
                      <li>Sentiment: use only "Positive", "Negative", or "Neutral"</li>
                      <li>Ensure company names match exactly as in the system</li>
                      <li>CSV files should use comma as separator</li>
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