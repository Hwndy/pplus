
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, ArrowUpRight, AlertTriangle, PlusCircle, ChevronRight, Building, Target, Calendar, FileText } from 'lucide-react';
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
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">SWOT Analysis</h1>
            <p className="text-blue-100 text-lg">Strategic insights for informed decision making</p>
          </div>
          <div className="flex items-center gap-4">
            {canCreateSwot && (
              <Link to={`/dashboard/swot/create?companyId=${selectedCompany}`}>
                <Button size="lg" className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm gap-3 shadow-lg">
                  <PlusCircle size={20} />
                  Create New Analysis
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {/* Company Selection Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Building size={20} className="text-indigo-600" />
                  Select Company
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                  <SelectTrigger className="border-gray-200 bg-white shadow-sm">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(company => (
                      <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Analysis List Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <FileText size={20} className="text-indigo-600" />
                  Available Analyses
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredSwots.length > 0 ? (
                  <div className="space-y-3">
                    {filteredSwots.map(swot => (
                      <div
                        key={swot.id}
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 flex justify-between items-center ${
                          selectedSwot?.id === swot.id
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                            : 'bg-white hover:bg-gray-50 border border-gray-200 hover:shadow-md'
                        }`}
                        onClick={() => handleSelectSwot(swot)}
                      >
                        <div>
                          <div className={`font-semibold ${selectedSwot?.id === swot.id ? 'text-white' : 'text-gray-800'}`}>
                            {swot.title}
                          </div>
                          <div className={`text-sm ${selectedSwot?.id === swot.id ? 'text-indigo-100' : 'text-gray-500'}`}>
                            {format(swot.date, 'dd MMM yyyy')}
                          </div>
                        </div>
                        <ChevronRight size={16} className={selectedSwot?.id === swot.id ? 'text-white' : 'text-gray-400'} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <FileText size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No analyses available for this company.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            {selectedSwot ? (
              <div className="space-y-8">
                {/* Analysis Header */}
                <Card className="border-0 shadow-lg bg-gradient-to-r from-white to-gray-50">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{selectedSwot.title}</h2>
                        <div className="flex items-center gap-4 text-gray-600">
                          <div className="flex items-center gap-2">
                            <Building size={16} className="text-indigo-600" />
                            <span className="font-medium">{companyName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-indigo-600" />
                            <span>{format(selectedSwot.date, 'dd MMM yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                        Strategic Analysis
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SWOT Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
              <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-slate-50">
                <CardContent className="flex items-center justify-center h-[500px]">
                  <div className="text-center">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                      <Target size={32} className="text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No SWOT Analysis Selected</h3>
                    <p className="text-gray-500 mb-6 max-w-md">
                      {canCreateSwot
                        ? "Choose an analysis from the sidebar or create a new one to get started with strategic insights."
                        : "Choose an analysis from the sidebar to view strategic insights and recommendations."
                      }
                    </p>
                    {canCreateSwot && (
                      <Link to={`/dashboard/swot/create?companyId=${selectedCompany}`}>
                        <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg gap-3">
                          <PlusCircle size={20} />
                          Create New Analysis
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
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

  // Modern gradient backgrounds for each SWOT category
  const getGradientClass = (title: string) => {
    switch (title) {
      case 'Strengths':
        return 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50';
      case 'Weaknesses':
        return 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-50';
      case 'Opportunities':
        return 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50';
      case 'Threats':
        return 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50';
      default:
        return 'bg-gradient-to-br from-gray-50 to-slate-50';
    }
  };

  const getIconBgClass = (title: string) => {
    switch (title) {
      case 'Strengths':
        return 'bg-gradient-to-br from-emerald-500 to-teal-500';
      case 'Weaknesses':
        return 'bg-gradient-to-br from-red-500 to-rose-500';
      case 'Opportunities':
        return 'bg-gradient-to-br from-blue-500 to-indigo-500';
      case 'Threats':
        return 'bg-gradient-to-br from-amber-500 to-orange-500';
      default:
        return 'bg-gradient-to-br from-gray-500 to-slate-500';
    }
  };

  return (
    <Card className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full ${getGradientClass(title)} relative overflow-hidden`}>
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white transform translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white transform -translate-x-12 translate-y-12"></div>
      </div>

      <CardContent className="pt-8 pb-6 relative z-10">
        {/* Icon and Title Section */}
        <div className="flex flex-col items-center mb-6">
          <div className={`w-16 h-16 rounded-2xl ${getIconBgClass(title)} shadow-lg flex items-center justify-center mb-4 transform hover:scale-105 transition-transform duration-200`}>
            <Icon className="h-8 w-8 text-white drop-shadow-sm" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 text-center tracking-tight">{title}</h3>
        </div>

        {/* Description */}
        <div className="mb-6">
          <p className="text-gray-700 text-sm leading-relaxed text-center px-2">{description}</p>
        </div>

        {/* Bullet Points */}
        {bullets.length > 0 && (
          <div className="space-y-3">
            {bullets.map((item, index) => (
              <div key={index} className="flex items-start bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40">
                <div className={`w-2 h-2 rounded-full ${getIconBgClass(title)} mt-2 mr-3 flex-shrink-0`}></div>
                <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        )}

        {/* Empty state for no bullets */}
        {bullets.length === 0 && (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/60 flex items-center justify-center">
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <p className="text-xs text-gray-500 italic">No specific points identified</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
