
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, ArrowUpRight, AlertTriangle, PlusCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuth } from '@/components/auth/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock data for companies
const companies = [
  { id: '1', name: 'VFD Group' },
  { id: '2', name: 'ABC Corporation' },
  { id: '3', name: 'XYZ Enterprises' }
];

// Mock data for SWOT analyses
const swotAnalyses = [
  {
    id: '1',
    companyId: '1',
    date: new Date(2023, 9, 15), // Oct 15, 2023
    title: 'Q4 2023 Analysis',
    strengths: {
      title: 'Strengths',
      icon: ThumbsUp,
      color: 'text-teal-500',
      borderColor: 'border-teal-200',
      bgColor: 'bg-teal-50',
      description: 'VFD Group gained media attention when the brand restated its commitment to the NGX Group after the appointment of Kwairanga as new chairman and also when Vbank got positive reviews on its on V App.',
      bullets: [
        'Firm Projects Higher Interest Income, Increased Earnings For Banks',
        'Rising Interest Rate Will Benefit Banks, Says Cowry Asset Boss'
      ]
    },
    weaknesses: {
      title: 'Weaknesses',
      icon: ThumbsDown,
      color: 'text-red-500',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
      description: 'There was no weakness observed in October.',
      bullets: []
    },
    opportunities: {
      title: 'Opportunities',
      icon: ArrowUpRight,
      color: 'text-blue-500',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      description: 'We advise the brand to lend its voice on the importance of fintech in financial inclusion and also create more awareness on the best investment areas for real estate in the country.',
      bullets: []
    },
    threats: {
      title: 'Threats',
      icon: AlertTriangle,
      color: 'text-amber-500',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50',
      description: 'The rise in inflation in the country and its negative effect on all sectors of the economy and the recent flood which will raise the value of housing in some part of the country.',
      bullets: []
    }
  },
  {
    id: '2',
    companyId: '1',
    date: new Date(2023, 11, 20), // Dec 20, 2023
    title: 'End of Year Analysis',
    strengths: {
      title: 'Strengths',
      icon: ThumbsUp,
      color: 'text-teal-500',
      borderColor: 'border-teal-200',
      bgColor: 'bg-teal-50',
      description: 'Strong financial performance in Q4 with growth in all key metrics.',
      bullets: [
        'Year-over-year revenue increase of 15%',
        'Successful launch of new mobile app features'
      ]
    },
    weaknesses: {
      title: 'Weaknesses',
      icon: ThumbsDown,
      color: 'text-red-500',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
      description: 'Customer service response times increased during holiday season.',
      bullets: [
        'Staff shortages in customer support department'
      ]
    },
    opportunities: {
      title: 'Opportunities',
      icon: ArrowUpRight,
      color: 'text-blue-500',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      description: 'New market expansion possibilities in neighboring countries.',
      bullets: [
        'Growing demand for financial services in rural areas'
      ]
    },
    threats: {
      title: 'Threats',
      icon: AlertTriangle,
      color: 'text-amber-500',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50',
      description: 'Increasing competition from fintech startups.',
      bullets: [
        'Regulatory changes expected in Q1 2024'
      ]
    }
  },
  {
    id: '3',
    companyId: '2',
    date: new Date(2023, 10, 5), // Nov 5, 2023
    title: 'Q4 Strategic Review',
    strengths: {
      title: 'Strengths',
      icon: ThumbsUp,
      color: 'text-teal-500',
      borderColor: 'border-teal-200',
      bgColor: 'bg-teal-50',
      description: 'Market leader in corporate banking segment with strong brand recognition.',
      bullets: [
        'High customer retention rate of 92%',
        'Award-winning corporate banking platform'
      ]
    },
    weaknesses: {
      title: 'Weaknesses',
      icon: ThumbsDown,
      color: 'text-red-500',
      borderColor: 'border-red-200',
      bgColor: 'bg-red-50',
      description: 'Limited presence in retail banking compared to competitors.',
      bullets: [
        'Aging IT infrastructure requiring updates'
      ]
    },
    opportunities: {
      title: 'Opportunities',
      icon: ArrowUpRight,
      color: 'text-blue-500',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50',
      description: 'Emerging demand for sustainable financing products.',
      bullets: [
        'Potential partnership with fintech companies'
      ]
    },
    threats: {
      title: 'Threats',
      icon: AlertTriangle,
      color: 'text-amber-500',
      borderColor: 'border-amber-200',
      bgColor: 'bg-amber-50',
      description: 'Economic slowdown affecting business lending.',
      bullets: [
        'Stringent new regulations on capital requirements'
      ]
    }
  }
];

export default function SwotAnalysisPage() {
  const [selectedCompany, setSelectedCompany] = useState<string>('1');
  const [filteredSwots, setFilteredSwots] = useState(swotAnalyses.filter(swot => swot.companyId === '1'));
  const [selectedSwot, setSelectedSwot] = useState(filteredSwots[0]);
  const { user } = useAuth();
  const canCreateSwot = ['admin', 'analyst'].includes(user?.role || '');

  useEffect(() => {
    const filtered = swotAnalyses.filter(swot => swot.companyId === selectedCompany);
    setFilteredSwots(filtered);
    setSelectedSwot(filtered.length > 0 ? filtered[0] : null);
  }, [selectedCompany]);

  const handleSelectSwot = (swot: any) => {
    setSelectedSwot(swot);
  };

  const companyName = companies.find(company => company.id === selectedCompany)?.name || '';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">SWOT Analysis</h1>
        <div className="flex items-center gap-4">
          {canCreateSwot && (
            <Link to={`/dashboard/swot/create?companyId=${selectedCompany}`}>
              <Button size="sm" className="gap-2">
                <PlusCircle size={16} />
                Create New Analysis
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="p-4 border rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-2">Companies</h2>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map(company => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 border rounded-lg shadow-sm">
              <h2 className="text-lg font-medium mb-2">Available Analyses</h2>
              {filteredSwots.length > 0 ? (
                <div className="space-y-2">
                  {filteredSwots.map(swot => (
                    <div 
                      key={swot.id}
                      className={`p-3 border rounded-lg cursor-pointer flex justify-between items-center ${
                        selectedSwot?.id === swot.id ? 'bg-primary/5 border-primary/20' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleSelectSwot(swot)}
                    >
                      <div>
                        <div className="font-medium">{swot.title}</div>
                        <div className="text-sm text-gray-500">
                          {format(swot.date, 'dd MMM yyyy')}
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">
                  No analyses available for this company.
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-3">
            {selectedSwot ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedSwot.title}</h2>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{companyName}</span>
                      <span>•</span>
                      <span>{format(selectedSwot.date, 'dd MMM yyyy')}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strengths */}
                  <SWOTCard data={selectedSwot.strengths} />
                  
                  {/* Weaknesses */}
                  <SWOTCard data={selectedSwot.weaknesses} />
                  
                  {/* Opportunities */}
                  <SWOTCard data={selectedSwot.opportunities} />
                  
                  {/* Threats */}
                  <SWOTCard data={selectedSwot.threats} />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] border rounded-lg">
                <div className="text-center">
                  <p className="text-gray-500">No SWOT analysis selected</p>
                  {canCreateSwot && (
                    <Link to={`/dashboard/swot/create?companyId=${selectedCompany}`}>
                      <Button size="sm" className="mt-4 gap-2">
                        <PlusCircle size={16} />
                        Create New Analysis
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface SWOTCardProps {
  data: {
    title: string;
    icon: any;
    color: string;
    borderColor: string;
    bgColor: string;
    description: string;
    bullets: string[];
  };
}

const SWOTCard = ({ data }: SWOTCardProps) => {
  const { title, icon: Icon, color, borderColor, bgColor, description, bullets } = data;
  
  return (
    <Card className="border shadow-sm h-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center mb-4">
          <div className={`rounded-full p-4 ${bgColor} border ${borderColor} dashed inline-flex items-center justify-center mb-3`}>
            <Icon className={`h-6 w-6 ${color}`} />
          </div>
          <h3 className="text-lg font-semibold text-center">{title}</h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 text-center">{description}</p>
        
        {bullets.length > 0 && (
          <ul className="space-y-2">
            {bullets.map((item, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block h-2 w-2 rounded-full bg-gray-400 mt-1.5 mr-2"></span>
                <span className="text-sm text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
