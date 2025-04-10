import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThumbsUp, ThumbsDown, ArrowUpRight, AlertTriangle, Save, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Mock data for companies
const companies = [
  { id: '1', name: 'VFD Group' },
  { id: '2', name: 'ABC Corporation' },
  { id: '3', name: 'XYZ Enterprises' }
];

interface SwotItem {
  description: string;
  bullets: string[];
}

interface SwotFormData {
  companyId: string;
  title: string;
  date: string;
  strengths: SwotItem;
  weaknesses: SwotItem;
  opportunities: SwotItem;
  threats: SwotItem;
}

export default function SwotAnalysisEntryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const companyIdFromQuery = queryParams.get('companyId') || '1';
  
  // Initialize with current date and company from query param
  const [formData, setFormData] = useState<SwotFormData>({
    companyId: companyIdFromQuery,
    title: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    strengths: { description: '', bullets: [''] },
    weaknesses: { description: '', bullets: [''] },
    opportunities: { description: '', bullets: [''] },
    threats: { description: '', bullets: [''] }
  });

  // Handle company change
  const handleCompanyChange = (value: string) => {
    setFormData({
      ...formData,
      companyId: value
    });
  };

  // Handle title change
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      title: e.target.value
    });
  };

  // Handle form input changes for descriptions
  const handleDescriptionChange = (category: keyof Omit<SwotFormData, 'companyId' | 'title' | 'date'>, value: string) => {
    setFormData({
      ...formData,
      [category]: {
        ...formData[category],
        description: value
      }
    });
  };

  // Handle changes to bullet points
  const handleBulletChange = (
    category: keyof Omit<SwotFormData, 'companyId' | 'title' | 'date'>, 
    index: number, 
    value: string
  ) => {
    const updatedBullets = [...formData[category].bullets];
    updatedBullets[index] = value;
    
    setFormData({
      ...formData,
      [category]: {
        ...formData[category],
        bullets: updatedBullets
      }
    });
  };

  // Add a new bullet point to a category
  const addBullet = (category: keyof Omit<SwotFormData, 'companyId' | 'title' | 'date'>) => {
    setFormData({
      ...formData,
      [category]: {
        ...formData[category],
        bullets: [...formData[category].bullets, '']
      }
    });
  };

  // Remove a bullet point from a category
  const removeBullet = (category: keyof Omit<SwotFormData, 'companyId' | 'title' | 'date'>, index: number) => {
    const updatedBullets = formData[category].bullets.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      [category]: {
        ...formData[category],
        bullets: updatedBullets.length ? updatedBullets : ['']
      }
    });
  };

  // Handle date change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      date: e.target.value
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.date) {
      toast.error('Please select a date');
      return;
    }

    if (!formData.title) {
      toast.error('Please enter a title for the analysis');
      return;
    }
    
    // In a real app, we would save the data to the server
    // For now, we'll just show a success message and navigate back
    
    toast.success(
      isDraft 
        ? 'SWOT analysis saved as draft' 
        : 'SWOT analysis submitted successfully'
    );
    
    // Navigate back to the SWOT analysis page
    navigate('/dashboard/swot');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Create SWOT Analysis</h1>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Select 
                value={formData.companyId} 
                onValueChange={handleCompanyChange}
              >
                <SelectTrigger id="company">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="title">Analysis Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={handleTitleChange}
                placeholder="e.g. Q4 2023 Analysis"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={handleDateChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <SwotCategoryCard
            title="Strengths"
            description="Positive attributes or resources that give an advantage"
            icon={ThumbsUp}
            color="text-teal-500"
            borderColor="border-teal-200"
            bgColor="bg-teal-50"
            data={formData.strengths}
            onChange={(value) => handleDescriptionChange('strengths', value)}
            onBulletChange={(index, value) => handleBulletChange('strengths', index, value)}
            onAddBullet={() => addBullet('strengths')}
            onRemoveBullet={(index) => removeBullet('strengths', index)}
          />
          
          {/* Weaknesses */}
          <SwotCategoryCard
            title="Weaknesses"
            description="Negative attributes or limitations that could be improved"
            icon={ThumbsDown}
            color="text-red-500"
            borderColor="border-red-200"
            bgColor="bg-red-50"
            data={formData.weaknesses}
            onChange={(value) => handleDescriptionChange('weaknesses', value)}
            onBulletChange={(index, value) => handleBulletChange('weaknesses', index, value)}
            onAddBullet={() => addBullet('weaknesses')}
            onRemoveBullet={(index) => removeBullet('weaknesses', index)}
          />
          
          {/* Opportunities */}
          <SwotCategoryCard
            title="Opportunities"
            description="External factors that could be beneficial"
            icon={ArrowUpRight}
            color="text-blue-500"
            borderColor="border-blue-200"
            bgColor="bg-blue-50"
            data={formData.opportunities}
            onChange={(value) => handleDescriptionChange('opportunities', value)}
            onBulletChange={(index, value) => handleBulletChange('opportunities', index, value)}
            onAddBullet={() => addBullet('opportunities')}
            onRemoveBullet={(index) => removeBullet('opportunities', index)}
          />
          
          {/* Threats */}
          <SwotCategoryCard
            title="Threats"
            description="External factors that could be harmful"
            icon={AlertTriangle}
            color="text-amber-500"
            borderColor="border-amber-200"
            bgColor="bg-amber-50"
            data={formData.threats}
            onChange={(value) => handleDescriptionChange('threats', value)}
            onBulletChange={(index, value) => handleBulletChange('threats', index, value)}
            onAddBullet={() => addBullet('threats')}
            onRemoveBullet={(index) => removeBullet('threats', index)}
          />
        </div>
        
        <div className="flex justify-end space-x-3 mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={(e) => handleSubmit(e, true)}
            className="gap-2"
          >
            <Save size={18} />
            Save as Draft
          </Button>
          <Button type="submit" className="gap-2">
            <FileText size={18} />
            Submit Analysis
          </Button>
        </div>
      </form>
    </div>
  );
}

interface SwotCategoryCardProps {
  title: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  borderColor: string;
  bgColor: string;
  data: SwotItem;
  onChange: (value: string) => void;
  onBulletChange: (index: number, value: string) => void;
  onAddBullet: () => void;
  onRemoveBullet: (index: number) => void;
}

const SwotCategoryCard = ({ 
  title, 
  description, 
  icon: Icon, 
  color, 
  borderColor, 
  bgColor,
  data,
  onChange,
  onBulletChange,
  onAddBullet,
  onRemoveBullet
}: SwotCategoryCardProps) => {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`rounded-full p-2 ${bgColor} border ${borderColor} dashed inline-flex items-center justify-center`}>
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${title.toLowerCase()}-description`}>Description</Label>
          <Textarea
            id={`${title.toLowerCase()}-description`}
            value={data.description}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Describe the ${title.toLowerCase()}`}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Key Points</Label>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm" 
              onClick={onAddBullet}
              className="h-8 px-2 text-xs"
            >
              + Add Point
            </Button>
          </div>
          
          {data.bullets.map((bullet, index) => (
            <div key={index} className="flex gap-2 items-start">
              <div className="pt-2">
                <Checkbox id={`${title.toLowerCase()}-bullet-${index}`} />
              </div>
              <div className="flex-1">
                <Input
                  value={bullet}
                  onChange={(e) => onBulletChange(index, e.target.value)}
                  placeholder="Enter key point"
                />
              </div>
              {data.bullets.length > 1 && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onRemoveBullet(index)}
                  className="h-10 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
