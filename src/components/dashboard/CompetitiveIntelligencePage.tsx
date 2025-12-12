import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DataCard } from '@/components/ui/DataCard';
import { BarChart2 } from 'lucide-react';

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

export function CompetitiveIntelligencePage() {
  const { user, token, isAuthenticated, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()} ${currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short', hour12: true })}`;

  useEffect(() => {
    if (authLoading || !isAuthenticated || !user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://backend-55pc.onrender.com/api/report/competitive-intelligence', {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch competitive intelligence');
        }
      } catch (err) {
        console.error('Error fetching competitive intelligence:', err);
        toast.error('Error fetching competitive intelligence');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, isAuthenticated, user, token]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!data || !data.competitive_intelligence) {
    return <div className="text-center text-gray-500">No data available</div>;
  }

  // Prepare media share data
  const mediaShareData = Object.entries(data.competitive_intelligence).flatMap(([_, sector]) =>
    sector.analysis.competitive_media_share.shares.map(share => ({
      name: share.company,
      value: parseFloat(share.percentage),
    }))
  );

  // Prepare media prominence data for each prominence
  const mediaProminenceData = {};
  const prominences = data.monitoring_summary.media_prominences;
  Object.entries(data.competitive_intelligence).forEach(([_, sector]) => {
    prominences.forEach((prominence: string) => {
      const prominenceAnalysis = sector.analysis.media_prominence_analysis[prominence];
      if (prominenceAnalysis) {
        const prominenceData = prominenceAnalysis.companies.map(company => ({
          name: company.company,
          value: parseFloat(company.percentage),
        }));
        mediaProminenceData[prominence] = prominenceData;
      }
    });
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Competitive Intelligence</h1>
            <p className="text-indigo-100">Insights across monitored sub-sectors</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-indigo-100">Last Updated</div>
            <div className="text-white font-medium">{formattedDate}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Competitive Media Share */}
        <DataCard title="Top - Competitive Media Share" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={mediaShareData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={0}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <CompanyIcon company={payload.value} />
                        <text x={10} y={4} textAnchor="start" fill="#666" fontSize={12}>
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="value" fill="#0088FE" name="Percentage" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DataCard>

        {/* Media Prominence on Market Share */}
        {mediaProminenceData['Market Share'] && (
          <DataCard title="Top - Media Prominence On Market Share" variant="glass" icon={<BarChart2 size={24} />}>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mediaProminenceData['Market Share']}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={0}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <CompanyIcon company={payload.value} />
                          <text x={10} y={4} textAnchor="start" fill="#666" fontSize={12}>
                            {payload.value}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" fill="#0088FE" name="Percentage" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DataCard>
        )}

        {/* Media Prominence on Customer Engagement */}
        {mediaProminenceData['Customer Engagement'] && (
          <DataCard title="Top - Media Prominence On Customer Engagement" variant="glass" icon={<BarChart2 size={24} />}>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={mediaProminenceData['Customer Engagement']}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={0}
                    tick={(props) => {
                      const { x, y, payload } = props;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <CompanyIcon company={payload.value} />
                          <text x={10} y={4} textAnchor="start" fill="#666" fontSize={12}>
                            {payload.value}
                          </text>
                        </g>
                      );
                    }}
                  />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Bar dataKey="value" fill="#0088FE" name="Percentage" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </DataCard>
        )}
      </div>

      {/* <div className="text-xs text-gray-500 mt-8 border-t pt-4">
        <p>Copyright © 2023, P+ Measurement Services. All rights reserved. This audit report, including all its methodologies, contents, and analysis, is the intellectual property of P+ Measurement Services. It is intended solely for the use of the specifically named clients. Any unauthorized use is strictly prohibited.</p>
      </div> */}
    </div>
  );
}