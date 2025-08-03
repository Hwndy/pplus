import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  File, 
  Image, 
  FileText, 
  Database, 
  X, 
  Check,
  AlertCircle,
  User,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { apiService } from '@/services/apiService';
import { toast } from 'sonner';

interface FileUploadProps {
  uploadType?: 'general' | 'avatar' | 'logo' | 'document' | 'data';
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  onUploadComplete?: (files: File[]) => void;
  className?: string;
}

interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
  result?: { id: string; url: string; name: string; size: number };
}

export function FileUpload({
  uploadType = 'general',
  multiple = false,
  accept,
  maxSize = 10,
  onUploadComplete,
  className
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getAcceptTypes = () => {
    if (accept) return accept;
    
    switch (uploadType) {
      case 'avatar':
      case 'logo':
        return 'image/*';
      case 'document':
        return '.pdf,.doc,.docx,.txt';
      case 'data':
        return '.csv,.xlsx,.xls,.json';
      default:
        return '*/*';
    }
  };

  const getUploadIcon = () => {
    switch (uploadType) {
      case 'avatar':
        return <User className="h-8 w-8" />;
      case 'logo':
        return <Building2 className="h-8 w-8" />;
      case 'document':
        return <FileText className="h-8 w-8" />;
      case 'data':
        return <Database className="h-8 w-8" />;
      default:
        return <Upload className="h-8 w-8" />;
    }
  };

  const getUploadTitle = () => {
    switch (uploadType) {
      case 'avatar':
        return 'Upload Avatar';
      case 'logo':
        return 'Upload Company Logo';
      case 'document':
        return 'Upload Document';
      case 'data':
        return 'Upload Data File';
      default:
        return 'Upload Files';
    }
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }

    const acceptTypes = getAcceptTypes();
    if (acceptTypes !== '*/*') {
      const allowedTypes = acceptTypes.split(',').map(type => type.trim());
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      const mimeType = file.type;

      const isAllowed = allowedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileExtension === type;
        }
        if (type.includes('/*')) {
          return mimeType.startsWith(type.replace('/*', ''));
        }
        return mimeType === type;
      });

      if (!isAllowed) {
        return `File type not allowed. Accepted types: ${acceptTypes}`;
      }
    }

    return null;
  };

  const addFiles = (newFiles: FileList) => {
    const validFiles: UploadFile[] = [];

    Array.from(newFiles).forEach(file => {
      const error = validateFile(file);
      if (error) {
        toast.error(`${file.name}: ${error}`);
        return;
      }

      if (!multiple && files.length > 0) {
        setFiles([]); // Clear existing files for single upload
      }

      validFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        progress: 0,
        status: 'pending',
      });
    });

    if (validFiles.length > 0) {
      setFiles(prev => multiple ? [...prev, ...validFiles] : validFiles);
    }
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { ...f, status: 'uploading', progress: 0 }
        : f
    ));

    try {
      console.log(`Starting upload for file: ${uploadFile.file.name}, type: ${uploadType}`);

      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setFiles(prev => prev.map(f =>
          f.id === uploadFile.id && f.progress < 90
            ? { ...f, progress: f.progress + 10 }
            : f
        ));
      }, 200);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', uploadFile.file);
      formData.append('type', uploadType || 'general');
      formData.append('category', uploadType || 'general');

      console.log('Uploading file with FormData:', {
        fileName: uploadFile.file.name,
        fileSize: uploadFile.file.size,
        fileType: uploadFile.file.type,
        uploadType: uploadType || 'general'
      });

      // Use the existing uploadFile method for all upload types
      const result = await apiService.uploadFile(formData);

      console.log('Upload successful:', result);

      clearInterval(progressInterval);

      setFiles(prev => prev.map(f =>
        f.id === uploadFile.id
          ? { ...f, status: 'success', progress: 100, result }
          : f
      ));

      toast.success(`${uploadFile.file.name} uploaded successfully`);
    } catch (error) {
      console.error(`Upload failed for file: ${uploadFile.file.name}`, error);

      const errorMessage = error instanceof Error ? error.message : 'Upload failed';

      setFiles(prev => prev.map(f =>
        f.id === uploadFile.id
          ? {
              ...f,
              status: 'error',
              progress: 0,
              error: errorMessage
            }
          : f
      ));

      toast.error(`Failed to upload ${uploadFile.file.name}: ${errorMessage}`);
    }
  };

  const uploadAll = async () => {
    const pendingFiles = files.filter(f => f.status === 'pending');

    if (pendingFiles.length === 0) {
      return;
    }

    try {
      if (multiple && pendingFiles.length > 1) {
        console.log(`Uploading ${pendingFiles.length} files using batch upload`);

        // Use batch upload for multiple files
        const formData = new FormData();
        pendingFiles.forEach((uploadFile, index) => {
          formData.append(`files`, uploadFile.file);
        });
        formData.append('type', uploadType || 'general');
        formData.append('category', uploadType || 'general');

        // Set all files to uploading status
        setFiles(prev => prev.map(f =>
          pendingFiles.some(pf => pf.id === f.id)
            ? { ...f, status: 'uploading', progress: 50 }
            : f
        ));

        const result = await apiService.uploadMultipleFiles(formData);
        console.log('Batch upload successful:', result);

        // Set all files to success status
        setFiles(prev => prev.map(f =>
          pendingFiles.some(pf => pf.id === f.id)
            ? { ...f, status: 'success', progress: 100, result }
            : f
        ));

        toast.success(`${pendingFiles.length} files uploaded successfully`);
      } else {
        // Upload files individually
        await Promise.all(pendingFiles.map(file => uploadFile(file)));
      }

      // Call completion callback
      const successfulUploads = files
        .filter(f => f.status === 'success')
        .map(f => f.result);

      if (successfulUploads.length > 0) {
        onUploadComplete?.(successfulUploads);
      }
    } catch (error) {
      console.error('Batch upload failed:', error);

      // Set all pending files to error status
      setFiles(prev => prev.map(f =>
        pendingFiles.some(pf => pf.id === f.id)
          ? {
              ...f,
              status: 'error',
              progress: 0,
              error: error instanceof Error ? error.message : 'Batch upload failed'
            }
          : f
      ));

      toast.error('Batch upload failed. Please try uploading files individually.');
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    }
    if (file.type.includes('pdf') || file.type.includes('document')) {
      return <FileText className="h-4 w-4" />;
    }
    if (file.type.includes('csv') || file.type.includes('spreadsheet')) {
      return <Database className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'success':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const pendingFiles = files.filter(f => f.status === 'pending');
  const hasFiles = files.length > 0;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getUploadIcon()}
          {getUploadTitle()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
            isDragOver 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          )}
        >
          <div className="flex flex-col items-center gap-2">
            {getUploadIcon()}
            <p className="text-sm font-medium">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              {getAcceptTypes()} • Max {maxSize}MB
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept={getAcceptTypes()}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4"
          >
            Browse Files
          </Button>
        </div>

        {/* File List */}
        {hasFiles && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Files ({files.length})</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {files.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadFile.file)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {uploadFile.status === 'uploading' && (
                      <Progress value={uploadFile.progress} className="mt-1" />
                    )}
                    
                    {uploadFile.error && (
                      <p className="text-xs text-red-600 mt-1">
                        {uploadFile.error}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      uploadFile.status === 'success' ? 'default' :
                      uploadFile.status === 'error' ? 'destructive' :
                      uploadFile.status === 'uploading' ? 'secondary' : 'outline'
                    }>
                      {uploadFile.status}
                    </Badge>
                    
                    {getStatusIcon(uploadFile.status)}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadFile.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        {pendingFiles.length > 0 && (
          <Button onClick={uploadAll} className="w-full">
            <Upload className="mr-2 h-4 w-4" />
            Upload {pendingFiles.length} {pendingFiles.length === 1 ? 'File' : 'Files'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
