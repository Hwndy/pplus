import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DataCard } from '@/components/ui/DataCard';
import { BarChart2, AlertCircle, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const CompanyIcon = ({ company }: { company: string }) => {
  if (company.includes('MTN') || company.includes('Airtel')) {
    return <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">T</div>;
  } else if (company.includes('Ecobank')) {
    return <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-xs">E</div>;
  } else if (company.includes('Interswitch')) {
    return <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-xs">I</div>;
  } else if (company.includes('Flutterwave')) {
    return <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-xs">F</div>;
  }
  return <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xs">?</div>;
};

const EmptyChartState = ({ title }: { title: string }) => (
  <div className="h-full flex flex-col items-center justify-center text-gray-400">
    <AlertCircle size={48} className="mb-4 opacity-50" />
    <p className="text-sm font-medium">No data to display</p>
    <p className="text-xs mt-1">{title}</p>
  </div>
);

export function CompetitiveIntelligencePage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filter states - always visible
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [selectedProminence, setSelectedProminence] = useState<string>('all');

  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()} ${currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short', hour12: true })}`;

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://pplus-ec37.onrender.com/api/report/competitive-intelligence', {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch data');
        }
      } catch (err) {
        console.error('Error:', err);
        toast.error('Failed to load competitive intelligence');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isAuthenticated, user, token]);

  // Extract sectors and prominences for filters
  const sectors = useMemo(() => {
    if (!data?.competitive_intelligence) return [];
    return Object.keys(data.competitive_intelligence);
  }, [data]);

  const prominences = useMemo(() => {
    return data?.monitoring_summary?.media_prominences || [];
  }, [data]);

  // Prepare filtered data
  const { mediaShareData, mediaProminenceData } = useMemo(() => {
    if (!data?.competitive_intelligence) {
      return { mediaShareData: [], mediaProminenceData: {} };
    }

    let filteredSectors = sectors;
    if (selectedSector !== 'all') {
      filteredSectors = [selectedSector];
    }

    // Media Share
    const shareData = Object.entries(data.competitive_intelligence)
      .filter(([sector]) => filteredSectors.includes(sector))
      .flatMap(([_, sector]: any) =>
        (sector.analysis?.competitive_media_share?.shares || [])
          .map((share: any) => ({
            name: share.company,
            value: parseFloat(share.percentage) || 0,
          }))
          .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );

    // Media Prominence
    const prominenceData: Record<string, any[]> = {};

    prominences.forEach((prominence: string) => {
      if (selectedProminence !== 'all' && selectedProminence !== prominence) return;

      const companies: any[] = [];
      filteredSectors.forEach(sectorName => {
        const sector = (data.competitive_intelligence as any)[sectorName];
        const analysis = sector?.analysis?.media_prominence_analysis?.[prominence];
        if (analysis?.companies) {
          companies.push(...analysis.companies);
        }
      });

      const map = new Map<string, number>();
      companies.forEach((c: any) => {
        const val = parseFloat(c.percentage) || 0;
        const key = c.company;
        if (key.toLowerCase().includes(searchQuery.toLowerCase())) {
          map.set(key, (map.get(key) || 0) + val);
        }
      });

      prominenceData[prominence] = Array.from(map.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 15);
    });

    return { mediaShareData: shareData, mediaProminenceData: prominenceData };
  }, [data, selectedSector, selectedProminence, searchQuery, sectors, prominences]);

  const hasAnyData = mediaShareData.length > 0 || Object.values(mediaProminenceData).some(arr => arr.length > 0);

  if (loading || authLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading competitive intelligence...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Competitive Intelligence</h1>
            <p className="text-indigo-100">Real-time insights across monitored sub-sectors</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-indigo-100">Last Updated</div>
            <div className="text-white font-medium">{formattedDate}</div>
          </div>
        </div>
      </div>

      {/* FILTER BAR - ALWAYS VISIBLE */}
      <div className="bg-white rounded-xl shadow-sm border p-5 sticky top-4 z-40">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[300px]">
            <Search className="w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-gray-200"
            />
          </div>

          <Select value={selectedSector} onValueChange={setSelectedSector}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              {sectors.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedProminence} onValueChange={setSelectedProminence}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="All Prominence Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prominence Types</SelectItem>
              {prominences.map((p: string) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setSelectedSector('all');
              setSelectedProminence('all');
            }}
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>

          {hasAnyData && (
            <Badge variant="secondary" className="ml-auto">
              {mediaShareData.length + Object.values(mediaProminenceData).flat().length} companies
            </Badge>
          )}
        </div>
      </div>

      {/* No data full-screen message */}
      {!hasAnyData && !loading && (
        <div className="text-center py-20">
          <AlertCircle className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No competitive data found</h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Try adjusting your filters or wait for new monitoring data to be processed.
          </p>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Competitive Media Share */}
        <DataCard title="Top - Competitive Media Share" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            {mediaShareData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mediaShareData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={140}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <CompanyIcon company={payload.value} />
                          <text x={34} y={4} textAnchor="start" fill="#374151" fontSize={12} className="font-medium">
                            {payload.value.length > 18 ? payload.value.slice(0, 16) + '...' : payload.value}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState title="Competitive Media Share" />
            )}
          </div>
        </DataCard>

        {/* Market Share Prominence */}
        <DataCard title="Top - Media Prominence On Market Share" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            {mediaProminenceData['Market Share']?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mediaProminenceData['Market Share']} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={140}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <CompanyIcon company={payload.value} />
                          <text x={34} y={4} textAnchor="start" fill="#374151" fontSize={12} className="font-medium">
                            {payload.value.length > 18 ? payload.value.slice(0, 16) + '...' : payload.value}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState title="Market Share Prominence" />
            )}
          </div>
        </DataCard>

        {/* Customer Engagement */}
        <DataCard title="Top - Media Prominence On Customer Engagement" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            {mediaProminenceData['Customer Engagement']?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mediaProminenceData['Customer Engagement']} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={140}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <CompanyIcon company={payload.value} />
                          <text x={34} y={4} textAnchor="start" fill="#374151" fontSize={12} className="font-medium">
                            {payload.value.length > 18 ? payload.value.slice(0, 16) + '...' : payload.value}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                  <Bar dataKey="value" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState title="Customer Engagement" />
            )}
          </div>
        </DataCard>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-500 mt-12 border-t pt-6 text-center">
        <p>Copyright © 2023, P+ Measurement Services. All rights reserved.</p>
      </div>
    </div>
  );
}