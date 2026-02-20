
import { useState } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Button } from '@/components/ui/button';
import { FileInput, Save, SendHorizontal, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/components/auth/AuthContext';
import { useCompanies, useCreateDataEntry } from '@/hooks/useApi';
import { apiService } from '@/services/apiService';

export default function DataEntryPage() {
  const { user } = useAuth();

  // API hooks
  const { data: companies = [], loading: companiesLoading, refetch: refetchCompanies } = useCompanies();
  const { mutate: createDataEntry, loading: creating } = useCreateDataEntry();

  // New entry form state
  const [newEntry, setNewEntry] = useState({
    clientId: '',
    parameterId: '',
    channelId: '',
    value: '',
    date: new Date().toISOString().split('T')[0],
  });
  
  // Batch upload state
  const [batchFile, setBatchFile] = useState<File | null>(null);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setNewEntry({
      ...newEntry,
      [field]: value
    });
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBatchFile(e.target.files[0]);
    }
  };

  // Submit new entry
  const submitEntry = async (asDraft: boolean = false) => {
    try {
      // Validate form
      if (!newEntry.clientId || !newEntry.parameterId || !newEntry.channelId || !newEntry.value) {
        toast.error('Please fill in all required fields');
        return;
      }

      console.log('Submitting data entry:', { ...newEntry, status: asDraft ? 'DRAFT' : 'PENDING' });

      // Prepare data entry payload
      const entryData = {
        companyId: newEntry.clientId,
        parameter: newEntry.parameterId,
        channel: newEntry.channelId,
        value: parseFloat(newEntry.value) || 0,
        date: newEntry.date,
        status: asDraft ? 'DRAFT' : 'PENDING',
        createdBy: user?.id || 'current-user'
      };

      // Call API to create data entry
      await createDataEntry(entryData);

      toast.success(asDraft
        ? 'Entry saved as draft'
        : 'Entry submitted successfully for review'
      );

      // Reset form
      setNewEntry({
        clientId: '',
        parameterId: '',
        channelId: '',
        value: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error submitting data entry:', error);
      toast.error('Failed to submit entry. Please try again.');
    }
  };
  
  // Submit batch upload
  const submitBatch = async () => {
    if (!batchFile) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      console.log('Uploading batch file:', batchFile.name);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', batchFile);
      formData.append('uploadedBy', user?.id || 'current-user');

      // Call API to upload batch file
      const response = await apiService.uploadBatchDataEntries(formData);

      console.log('Batch upload response:', response);
      toast.success('File uploaded successfully. Processing data...');
      setBatchFile(null);

      // Optionally refresh data or show processing status
      // You could add a polling mechanism here to check processing status
    } catch (error) {
      console.error('Error uploading batch file:', error);
      toast.error('Failed to upload file. Please try again.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Entry</h1>
      </div>
      
      <Tabs defaultValue="single">
        <TabsList>
          <TabsTrigger value="single">Single Entry</TabsTrigger>
          <TabsTrigger value="batch">Batch Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single">
          <DataCard 
            title="New Data Entry" 
            description="Enter media monitoring data for a client"
            variant="glass"
          >
            <div className="space-y-4 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select
                    value={newEntry.clientId}
                    onValueChange={(value) => handleInputChange('clientId', value)}
                    disabled={companiesLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={companiesLoading ? "Loading companies..." : "Select client"} />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {companiesLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Loading companies...
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parameter">Parameter</Label>
                  <Select 
                    value={newEntry.parameterId}
                    onValueChange={(value) => handleInputChange('parameterId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parameter" />
                    </SelectTrigger>
                    <SelectContent>
                      {dataParameters.map(param => (
                        <SelectItem key={param.id} value={param.id}>
                          {param.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="channel">Media Channel</Label>
                  <Select 
                    value={newEntry.channelId}
                    onValueChange={(value) => handleInputChange('channelId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaChannels.map(channel => (
                        <SelectItem key={channel.id} value={channel.id}>
                          {channel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newEntry.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="value">Value</Label>
                <Input
                  id="value"
                  type="number"
                  placeholder="Enter value"
                  value={newEntry.value}
                  onChange={(e) => handleInputChange('value', e.target.value)}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => submitEntry(true)}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save as Draft
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => submitEntry(false)}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <SendHorizontal className="mr-2 h-4 w-4" />
                      Submit for Review
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DataCard>
        </TabsContent>
        
        <TabsContent value="batch">
          <DataCard 
            title="Batch Data Upload" 
            description="Upload multiple data entries in CSV or Excel format"
            variant="glass"
          >
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <Label htmlFor="file">Upload File</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                  />
                  <Button
                    onClick={submitBatch}
                    disabled={!batchFile || creating}
                  >
                    {creating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <FileInput className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Accepted formats: CSV, Excel (.xlsx, .xls)
                </p>
              </div>
              
              <div className="border rounded-md p-4 bg-muted/50">
                <h3 className="font-medium mb-2">File Format Requirements</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Your file must contain the following columns:
                </p>
                <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                  <li>client_id (required): Client identifier</li>
                  <li>parameter_id (required): Parameter identifier</li>
                  <li>channel_id (required): Media channel identifier</li>
                  <li>value (required): Numeric value</li>
                  <li>date (required): Date in YYYY-MM-DD format</li>
                  <li>notes (optional): Additional notes</li>
                </ul>
                <div className="mt-4">
                  <Button variant="outline" size="sm">Download Template</Button>
                </div>
              </div>
            </div>
          </DataCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
