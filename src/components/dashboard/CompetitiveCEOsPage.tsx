import React from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Users, BarChart2, TrendingUp } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { competitiveCEOsData } from '@/utils/competitiveIntelligenceData';

// Company logos/icons mapping
const CompanyIcon = ({ name }: { name: string }) => {
  if (name.includes('Alawuba') || name.includes('UBA')) {
    return <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs">UB</div>;
  } else if (name.includes('Adedeji') || name.includes('Stanbic')) {
    return <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">SI</div>;
  } else if (name.includes('Edun') || name.includes('FCMB')) {
    return <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs">FC</div>;
  } else if (name.includes('Agbaje') || name.includes('GTCO')) {
    return <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">GT</div>;
  } else if (name.includes('Oyedeji') || name.includes('HoldCo')) {
    return <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold text-xs">FH</div>;
  }
  return <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xs">?</div>;
};

export function CompetitiveCEOsPage() {
  // Colors for sentiment bars
  const positiveColor = "#10b981"; // Green
  const negativeColor = "#ef4444"; // Red
  const neutralColor = "#9ca3af"; // Gray

  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Competitive CEOs Intelligence - Holdings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top - Competitive Media Share */}
        <DataCard title="Top – Competitive Media Share" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={competitiveCEOsData.mediaShare}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 40]} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={0}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <CompanyIcon name={payload.value} />
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

        {/* Top - Thought Leadership */}
        <DataCard title="Top – Thought Leadership" variant="glass" icon={<Users size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={competitiveCEOsData.thoughtLeadership}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 60]} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={0}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <CompanyIcon name={payload.value} />
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

        {/* Top - Competitive Media Sentiment Score */}
        <DataCard title="Top – Competitive Media Sentiment Score" variant="glass" icon={<TrendingUp size={24} />}>
          <div className="p-2 text-xs text-center text-gray-500">
            Sentiment Score (-1 to +1)
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={competitiveCEOsData.sentimentScore}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  domain={[-0.3, 0.4]} 
                  tickCount={8}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={0}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <CompanyIcon name={payload.value} />
                        <text x={10} y={4} textAnchor="start" fill="#666" fontSize={12}>
                          {payload.value}
                        </text>
                      </g>
                    );
                  }}
                />
                <Tooltip formatter={(value) => value.toFixed(2)} />
                <Bar dataKey="value" name="Score">
                  {competitiveCEOsData.sentimentScore.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.value >= 0 ? "#10b981" : "#ef4444"} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DataCard>

        {/* Top - Competitive Media Sentiment Frequency */}
        <DataCard title="Top – Competitive Media Sentiment Frequency" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={competitiveCEOsData.sentimentFrequency}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 35]} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={0}
                  tick={(props) => {
                    const { x, y, payload } = props;
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <CompanyIcon name={payload.value} />
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
        <p>Copyright © 2023, P+ Measurement Services. All rights reserved. This audit report, including all its methodologies, contents, and analysis, is the intellectual property of P+ Measurement Services. It is intended solely for the use of the specifically named clients. Any unauthorized use is strictly prohibited.</p>
      </div>
    </div>
  );
}
