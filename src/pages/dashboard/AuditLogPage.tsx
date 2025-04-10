
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Search, FileText, User, Calendar } from 'lucide-react';

// Define the AuditLog interface
interface AuditLog {
  id: number;
  user: string;
  action: string;
  resource: string;
  details: string;
  timestamp: string;
}

// Mock data for audit logs
const mockAuditLogs: AuditLog[] = [
  {
    id: 1,
    user: 'admin@example.com',
    action: 'Created',
    resource: 'User',
    details: 'Created user john.doe@example.com',
    timestamp: '2023-06-15 09:45:12'
  },
  {
    id: 2,
    user: 'admin@example.com',
    action: 'Updated',
    resource: 'Company',
    details: 'Updated company AXA Mansard Insurance',
    timestamp: '2023-06-14 14:22:05'
  },
  {
    id: 3,
    user: 'john.doe@example.com',
    action: 'Deleted',
    resource: 'Report',
    details: 'Deleted report Q1 2023 Financial Analysis',
    timestamp: '2023-06-13 11:05:34'
  },
  {
    id: 4,
    user: 'jane.smith@example.com',
    action: 'Created',
    resource: 'Campaign',
    details: 'Created new marketing campaign "Summer 2023"',
    timestamp: '2023-06-12 16:30:22'
  },
  {
    id: 5,
    user: 'admin@example.com',
    action: 'Logged in',
    resource: 'System',
    details: 'User login from 192.168.1.1',
    timestamp: '2023-06-12 08:15:47'
  },
  {
    id: 6,
    user: 'john.doe@example.com',
    action: 'Exported',
    resource: 'Report',
    details: 'Exported data as CSV',
    timestamp: '2023-06-11 15:42:19'
  },
  {
    id: 7,
    user: 'jane.smith@example.com',
    action: 'Updated',
    resource: 'User',
    details: 'Updated own profile',
    timestamp: '2023-06-10 10:33:58'
  },
  {
    id: 8,
    user: 'admin@example.com',
    action: 'Created',
    resource: 'Publication',
    details: 'Added new publication "The Daily News"',
    timestamp: '2023-06-09 13:20:14'
  },
  {
    id: 9,
    user: 'john.doe@example.com',
    action: 'Logged out',
    resource: 'System',
    details: 'User logout',
    timestamp: '2023-06-08 17:55:02'
  },
  {
    id: 10,
    user: 'admin@example.com',
    action: 'Reset password',
    resource: 'User',
    details: 'Reset password for jane.smith@example.com',
    timestamp: '2023-06-07 09:10:41'
  }
];

export default function AuditLogPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Log</h1>
      </div>
      {/* Add your audit log content here */}
    </div>
  );
}
