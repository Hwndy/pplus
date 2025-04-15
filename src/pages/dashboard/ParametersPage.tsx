
import { useState } from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { DataTable } from '@/components/ui/DataTable';
import { dataParameters } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import {
  PlusCircle, Settings, FileEdit, Trash2, Search, Filter,
  Building, Newspaper, Globe, Users, Activity, FileText,
  BarChart, Tag, MessageSquare, DollarSign, Percent
} from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

// Define parameter interface
interface Parameter {
  id: string;
  name: string;
  category: string;
  description: string;
  values?: string[];
  isActive?: boolean;
}

// Define columns for data parameters table
const parameterColumns: ColumnDef<Parameter>[] = [
  {
    accessorKey: 'name',
    header: 'Parameter Name',
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => {
      const category = row.getValue('category') as string;
      return <span className="capitalize">{category}</span>;
    },
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.original.isActive !== false; // Default to true if not specified
      return (
        <Badge variant={isActive ? "success" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Button variant="ghost" size="icon">
          <FileEdit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    )
  }
];

// Editorial parameters from the Create Editorial form
const editorialParameters: Parameter[] = [
  // Company & Organization Parameters
  { id: 'company-1', name: 'Companies', category: 'organization', description: 'List of companies for editorial entries', values: ['Stanbic IBTC Holdings', 'MTN Nigeria', 'Dangote Group'] },
  { id: 'brand-1', name: 'Brands', category: 'organization', description: 'List of brands associated with companies', values: [
    'Stanbic IBTC Bank',
    'Stanbic IBTC Capital',
    'Stanbic IBTC Insurance Limited',
    'Stanbic IBTC Asset Management',
    'Stanbic IBTC Pension',
    'Stanbic IBTC Holdings',
    'Stanbic IBTC Nominees',
  ]},

  // Industry Parameters
  { id: 'industry-1', name: 'Industries', category: 'industry', description: 'List of industries for classification', values: [
    'Agriculture',
    'Financial Services',
    'Real Estate',
    'Transportation',
    'Tobacco',
    'Non-Governmental Organization',
    'Online Streaming Platforms'
  ]},
  { id: 'subsector-1', name: 'Sub-Sectors', category: 'industry', description: 'List of sub-sectors within industries', values: [
    'Commercial Banks', 'Microfinance Banks', 'Investment Banks', 'Insurance Companies', 'Asset Management',
    'Financial Technology (Fintech)', 'Pension Fund Administrators', 'Mortgage Banks', 'Stockbroking Firms'
  ]},

  // Media Parameters
  { id: 'media-1', name: 'Media Types', category: 'media', description: 'Types of media for editorial content', values: ['Print', 'Online'] },
  { id: 'media-2', name: 'Online Channels', category: 'media', description: 'Types of online media channels', values: [
    'Online Newspaper',
    'Online News Site',
    'Financial Site',
    'Blog',
    'Online Broadcast',
  ]},
  { id: 'media-3', name: 'Publications', category: 'media', description: 'List of publications', values: [
    'BusinessDay',
    'Nigerian Tribune',
    'Leadership',
    'New Telegraph',
    'The Guardian',
    'Vanguard',
    'The Punch',
    'ThisDay',
  ]},
  { id: 'media-4', name: 'Placements', category: 'media', description: 'Types of content placement', values: ['Headline', 'Photo'] },

  // Geographic Parameters
  { id: 'geo-1', name: 'Countries', category: 'geographic', description: 'List of countries for editorial content', values: [
    'Nigeria',
    'Canada',
    'U.S.A',
    'France',
    'Japan',
    'Germany',
  ]},
  { id: 'geo-2', name: 'Languages', category: 'geographic', description: 'Languages used in editorial content', values: ['English', 'Hausa'] },

  // People Parameters
  { id: 'people-1', name: 'Reporters', category: 'people', description: 'List of reporters', values: [
    'Eniola Olatunji',
    'Joseph Inokotong',
    'Michael Olaitan',
    'Adebayo Olufemi',
    'Funmi Johnson',
  ]},
  { id: 'people-2', name: 'Spokespersons', category: 'people', description: 'List of company spokespersons', values: [
    'Wole Adeniyi (CEO, Stanbic IBTC Bank)',
    'Olumide Oyetan (CEO, Stanbic IBTC Pension)',
    'Oladele Sotubo (CEO, Stanbic IBTC Asset Management)',
    'Akinjide Orimolade (CEO, Stanbic IBTC Insurance)',
    'Demola Sogunle (CEO, Stanbic IBTC Holdings)',
  ]},

  // Activity Parameters
  { id: 'activity-1', name: 'Activities', category: 'activity', description: 'Types of company activities', values: [
    'Innovation',
    'Awards',
    'Industry Report',
    'Partnership',
    'CSR/CSI',
    'Sponsorship',
    'Corporate',
  ]},

  // Analysis Parameters
  { id: 'analysis-1', name: 'Sentiments', category: 'analysis', description: 'Types of sentiment analysis', values: ['Positive', 'Negative', 'Neutral'] },
  { id: 'analysis-2', name: 'Media Sentiment Index', category: 'analysis', description: 'Numerical index for sentiment strength', values: ['0', '1', '2', '3', '4', '5'] },

  // Metrics Parameters
  { id: 'metrics-1', name: 'Advert Spend', category: 'metrics', description: 'Amount spent on advertising' },
  { id: 'metrics-2', name: 'Circulation', category: 'metrics', description: 'Number of copies distributed' },
  { id: 'metrics-3', name: 'Audience Reach', category: 'metrics', description: 'Estimated audience size' },
  { id: 'metrics-4', name: 'Page Size', category: 'metrics', description: 'Size of the page for print media', values: ['Full Page', 'Half Page', 'Quarter Page'] },
];

// Combine all parameters
const allParameters = [...dataParameters, ...editorialParameters];

// Get unique categories
const categories = Array.from(new Set(allParameters.map(param => param.category)));

// Get icon for category
const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'mentions': return <MessageSquare className="h-5 w-5" />;
    case 'engagement': return <Activity className="h-5 w-5" />;
    case 'analysis': return <BarChart className="h-5 w-5" />;
    case 'organization': return <Building className="h-5 w-5" />;
    case 'industry': return <Tag className="h-5 w-5" />;
    case 'media': return <Newspaper className="h-5 w-5" />;
    case 'geographic': return <Globe className="h-5 w-5" />;
    case 'people': return <Users className="h-5 w-5" />;
    case 'activity': return <Activity className="h-5 w-5" />;
    case 'metrics': return <DollarSign className="h-5 w-5" />;
    default: return <Settings className="h-5 w-5" />;
  }
};

export default function ParametersPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newParameter, setNewParameter] = useState<Partial<Parameter>>({
    category: '',
    name: '',
    description: '',
    values: [],
    isActive: true
  });
  const [newValue, setNewValue] = useState('');

  // Filter parameters based on active category and search query
  const filteredParameters = allParameters.filter(param => {
    const matchesCategory = activeCategory === 'all' || param.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      param.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      param.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Add a new value to the parameter values array
  const addValue = () => {
    if (newValue.trim() === '') return;
    setNewParameter(prev => ({
      ...prev,
      values: [...(prev.values || []), newValue.trim()]
    }));
    setNewValue('');
  };

  // Remove a value from the parameter values array
  const removeValue = (index: number) => {
    setNewParameter(prev => ({
      ...prev,
      values: prev.values?.filter((_, i) => i !== index)
    }));
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!newParameter.name || !newParameter.category || !newParameter.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // In a real app, this would save to the backend
    toast.success(`Parameter "${newParameter.name}" added successfully`);
    setIsAddDialogOpen(false);
    setNewParameter({
      category: '',
      name: '',
      description: '',
      values: [],
      isActive: true
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Data Parameters</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Parameter
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Parameter</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category</Label>
                <Select
                  value={newParameter.category}
                  onValueChange={(value) => setNewParameter({...newParameter, category: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        <span className="capitalize">{category}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input
                  id="name"
                  value={newParameter.name}
                  onChange={(e) => setNewParameter({...newParameter, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input
                  id="description"
                  value={newParameter.description}
                  onChange={(e) => setNewParameter({...newParameter, description: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="values" className="text-right pt-2">Values</Label>
                <div className="col-span-3 space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="values"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      placeholder="Add a value"
                      className="flex-1"
                    />
                    <Button type="button" onClick={addValue} size="sm">
                      Add
                    </Button>
                  </div>
                  {newParameter.values && newParameter.values.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newParameter.values.map((value, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {value}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 ml-1"
                            onClick={() => removeValue(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>Save Parameter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search parameters..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="mb-4 flex flex-wrap h-auto p-1">
          <TabsTrigger value="all" className="rounded-md">
            All Parameters
          </TabsTrigger>
          {categories.map(category => (
            <TabsTrigger key={category} value={category} className="rounded-md flex items-center gap-1">
              {getCategoryIcon(category)}
              <span className="capitalize">{category}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-0">
          <DataCard
            title={activeCategory === 'all' ? "All Parameters" : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Parameters`}
            description={`Configure ${activeCategory === 'all' ? 'all' : activeCategory} parameters for data collection and reporting`}
            variant="glass"
            icon={getCategoryIcon(activeCategory)}
          >
            <DataTable
              columns={parameterColumns}
              data={filteredParameters}
              searchPlaceholder="Filter parameters..."
            />
          </DataCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
