
import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/DataTable';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';

interface Editorial {
  id: number;
  date: string;
  company: string;
  industry: string;
  brand: string;
  subSector: string;
  publication: string;
  placement: string;
  title: string;
  page: number;
  link: string;
  reporter: string;
  country: string;
  language: string;
  spokesperson: string;
  activity: string;
  mediaType: string;
  onlineChannel?: string;
  sentiment: string;
  mediaSentimentIndex: number;
  advertSpend?: number;
  circulation?: number;
  audienceReach?: number;
  pageSize?: string;
  status?: string;
  analystNote?: string;
  supervisorNote?: string;
  adminNote?: string;
}

// Mock data for editorials
const mockEditorials: Editorial[] = [
  {
    id: 1,
    date: '2023-05-10',
    company: 'Stanbic IBTC Holdings',
    industry: 'Financial Services',
    brand: 'Stanbic IBTC Bank',
    subSector: 'Commercial Banking',
    publication: 'BusinessDay',
    placement: 'Headline',
    title: 'Stanbic IBTC Digital Innovation Unlocks Growth',
    page: 4,
    link: 'https://businessday.ng/article/stanbic-ibtc-digital-innovation',
    reporter: 'Eniola Olatunji',
    country: 'Nigeria',
    language: 'English',
    spokesperson: 'Wole Adeniyi (CEO, Stanbic IBTC Bank)',
    activity: 'Innovation',
    mediaType: 'Print',
    sentiment: 'Positive',
    mediaSentimentIndex: 2,
    advertSpend: 150000,
    circulation: 50000,
    audienceReach: 120000,
    pageSize: 'Half Page',
    status: 'Approved'
  },
  {
    id: 2,
    date: '2023-05-15',
    company: 'Stanbic IBTC Holdings',
    industry: 'Financial Services',
    brand: 'Stanbic IBTC Pension',
    subSector: 'Pension',
    publication: 'The Guardian',
    placement: 'Photo',
    title: 'Stanbic IBTC Pension Launches New Retirement Solution',
    page: 8,
    link: 'https://guardian.ng/business/stanbic-ibtc-pension-solution',
    reporter: 'Joseph Inokotong',
    country: 'Nigeria',
    language: 'English',
    spokesperson: 'Olumide Oyetan (CEO, Stanbic IBTC Pension)',
    activity: 'Corporate',
    mediaType: 'Print',
    sentiment: 'Positive',
    mediaSentimentIndex: 1,
    advertSpend: 80000,
    circulation: 60000,
    audienceReach: 150000,
    pageSize: 'Quarter Page',
    status: 'Approved'
  },
  {
    id: 3,
    date: '2023-05-20',
    company: 'Stanbic IBTC Holdings',
    industry: 'Financial Services',
    brand: 'Stanbic IBTC Asset Management',
    subSector: 'Asset Management',
    publication: 'ThisDay',
    placement: 'Headline',
    title: 'Stanbic IBTC Asset Management Wins Industry Award',
    page: 12,
    link: 'https://thisdaylive.com/stanbic-ibtc-asset-award',
    reporter: 'Michael Olaitan',
    country: 'Nigeria',
    language: 'English',
    spokesperson: 'Oladele Sotubo (CEO, Stanbic IBTC Asset Management)',
    activity: 'Awards',
    mediaType: 'Print',
    sentiment: 'Positive',
    mediaSentimentIndex: 2,
    advertSpend: 120000,
    circulation: 70000,
    audienceReach: 180000,
    pageSize: 'Full Page',
    status: 'Pending'
  },
  {
    id: 4,
    date: '2023-05-25',
    company: 'Stanbic IBTC Holdings',
    industry: 'Financial Services',
    brand: 'Stanbic IBTC Insurance Limited',
    subSector: 'Insurance',
    publication: 'Leadership',
    placement: 'Headline',
    title: 'Stanbic IBTC Insurance Partners with Healthcare Providers',
    page: 6,
    link: 'https://leadership.ng/stanbic-ibtc-insurance-partnership',
    reporter: 'Adebayo Olufemi',
    country: 'Nigeria',
    language: 'English',
    spokesperson: 'Akinjide Orimolade (CEO, Stanbic IBTC Insurance)',
    activity: 'Partnership',
    mediaType: 'Online',
    onlineChannel: 'Online Newspaper',
    sentiment: 'Positive',
    mediaSentimentIndex: 1,
    advertSpend: 90000,
    audienceReach: 200000,
    status: 'Rejected'
  },
  {
    id: 5,
    date: '2023-06-02',
    company: 'Stanbic IBTC Holdings',
    industry: 'Financial Services',
    brand: 'Stanbic IBTC Holdings',
    subSector: 'Financial Services',
    publication: 'Vanguard',
    placement: 'Photo',
    title: 'Stanbic IBTC Donates to Schools in Rural Communities',
    page: 10,
    link: 'https://vanguardngr.com/stanbic-ibtc-csr-education',
    reporter: 'Funmi Johnson',
    country: 'Nigeria',
    language: 'English',
    spokesperson: 'Demola Sogunle (CEO, Stanbic IBTC Holdings)',
    activity: 'CSR/CSI',
    mediaType: 'Print',
    sentiment: 'Positive',
    mediaSentimentIndex: 2,
    advertSpend: 100000,
    circulation: 80000,
    audienceReach: 220000,
    pageSize: 'Half Page',
    status: 'Approved'
  }
];

const EditorialPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [editorials, setEditorials] = useState<Editorial[]>(mockEditorials);

  useEffect(() => {
    if (location.state?.savedEditorials) {
      if (location.state.isEditMode) {
        const updatedEditorials = editorials.map(editorial =>
          editorial.id === location.state.savedEditorials[0].id
            ? location.state.savedEditorials[0]
            : editorial
        );
        setEditorials(updatedEditorials);
      } else {
        setEditorials([...editorials, ...location.state.savedEditorials]);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Reordered columns according to the requirements
  const columns = [
    {
      accessorKey: 'brand',
      header: 'Brand',
    },
    {
      accessorKey: 'title',
      header: 'Title',
    },
    {
      accessorKey: 'mediaType',
      header: 'Media Type',
    },
    {
      accessorKey: 'sentiment',
      header: 'Sentiment',
    },
    {
      accessorKey: 'date',
      header: 'Date',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status') || 'Pending';
        let statusColor = '';

        switch(status) {
          case 'Approved':
            statusColor = 'bg-green-100 text-green-800';
            break;
          case 'Rejected':
            statusColor = 'bg-red-100 text-red-800';
            break;
          case 'Pending':
          default:
            statusColor = 'bg-yellow-100 text-yellow-800';
        }

        return (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
            {status}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => {
        const editorial = row.original;

        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(editorial)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(editorial.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const handleDelete = (id: number) => {
    setEditorials(editorials.filter(p => p.id !== id));
    toast.success('Editorial deleted successfully');
  };

  const handleEdit = (editorial: Editorial) => {
    navigate('/dashboard/editorial/create', {
      state: { editorialData: editorial }
    });
  };

  const handleCreate = () => {
    navigate('/dashboard/editorial/create');
  };

  // Navigate to batch upload page
  const handleBatchUpload = () => {
    navigate('/dashboard/editorial/batch-upload');
  };

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Editorial</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleBatchUpload}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Batch Upload
          </Button>

          <Button
            onClick={handleCreate}
            className="bg-indigo-950"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Editorial
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <DataTable
          columns={columns}
          data={editorials}
        />
      </div>
    </div>
  );
};

export default EditorialPage;
