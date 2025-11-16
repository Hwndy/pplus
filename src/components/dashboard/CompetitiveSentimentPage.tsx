import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { DataCard } from '@/components/ui/DataCard';
import { TrendingUp, BarChart2 } from 'lucide-react';

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

export function CompetitiveSentimentPage() {
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
        const response = await fetch('https://pplus-e31a.onrender.com/api/report/competitive-intelligence', {
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

  // Calculate sentiment score (-1 to +1) based on percentage differences
  const calculateSentimentScore = (companyData: any) => {
    const { positive, negative, neutral } = companyData;
    const total = positive.frequency + negative.frequency + neutral.frequency;
    if (total === 0) return 0;
    const positiveWeight = (positive.frequency / total) * (positive.percentage / 100);
    const negativeWeight = (negative.frequency / total) * (negative.percentage / 100);
    return (positiveWeight - negativeWeight).toFixed(2);
  };

  // Prepare sentiment score data
  const sentimentScoreData = Object.entries(data.competitive_intelligence).flatMap(([_, sector]) =>
    Object.entries(sector.analysis.media_sentiment_index).map(([company, sentiment]) => ({
      name: company,
      value: parseFloat(calculateSentimentScore(sentiment)),
    }))
  );

  // Prepare sentiment frequency data
  const sentimentFrequencyData = Object.entries(data.competitive_intelligence).flatMap(([_, sector]) =>
    Object.entries(sector.analysis.media_sentiment_index).map(([company, sentiment]) => ({
      name: company,
      positive: sentiment.positive.frequency,
      negative: sentiment.negative.frequency,
      neutral: sentiment.neutral.frequency,
    }))
  );

  // Colors for sentiment bars
  const positiveColor = "#10b981"; // Green
  const negativeColor = "#ef4444"; // Red
  const neutralColor = "#9ca3af"; // Gray

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Competitive Sentiment Intelligence</h1>
            <p className="text-indigo-100">Insights across monitored sub-sectors</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-indigo-100">Last Updated</div>
            <div className="text-white font-medium">{formattedDate}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Competitive Media Sentiment Score */}
        <DataCard title="Competitive Media Sentiment Score" variant="glass" icon={<TrendingUp size={24} />}>
          <div className="p-2 text-xs text-center text-gray-500">Sentiment Score (-1 to +1)</div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sentimentScoreData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[-1, 1]} tickCount={11} />
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
                <Tooltip formatter={(value) => value.toFixed(2)} />
                <Bar dataKey="value" name="Score">
                  {sentimentScoreData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.value >= 0 ? positiveColor : negativeColor}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DataCard>

        {/* Competitive Media Sentiment Frequency */}
        <DataCard title="Competitive Media Sentiment Frequency" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sentimentFrequencyData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, Math.max(...sentimentFrequencyData.map(d => d.positive + d.negative + d.neutral)) * 1.2]} />
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
                <Tooltip />
                <Bar dataKey="positive" stackId="a" fill={positiveColor} name="Positive" />
                <Bar dataKey="negative" stackId="a" fill={negativeColor} name="Negative" />
                <Bar dataKey="neutral" stackId="a" fill={neutralColor} name="Neutral" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-2 space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 mr-1"></div>
              <span className="text-xs">Positive</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 mr-1"></div>
              <span className="text-xs">Negative</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-400 mr-1"></div>
              <span className="text-xs">Neutral</span>
            </div>
          </div>
        </DataCard>
      </div>

      <div className="text-xs text-gray-500 mt-8 border-t pt-4">
         </div>
    </div>
  );
}