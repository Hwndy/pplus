import React from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Search, BarChart2 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { competitiveIntelligenceData } from '@/utils/competitiveIntelligenceData';

// Company logos/icons mapping
const CompanyIcon = ({ company }: { company: string }) => {
  if (company.includes('First Bank') || company.includes('UBA')) {
    return <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs">FB</div>;
  } else if (company.includes('Stanbic')) {
    return <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">SI</div>;
  } else if (company.includes('FCMB')) {
    return <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white font-bold text-xs">FC</div>;
  } else if (company.includes('GTCO')) {
    return <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xs">GT</div>;
  } else if (company.includes('HoldCo')) {
    return <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold text-xs">FH</div>;
  }
  return <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xs">?</div>;
};

export function CompetitiveIntelligencePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Competitive Intelligence - Holdings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top - Competitive Media Share */}
        <DataCard title="Top - Competitive Media Share" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={competitiveIntelligenceData.mediaShare}
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

        {/* Top - Media Prominence On CSR/ESG */}
        <DataCard title="Top - Media Prominence On CSR/ESG" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={competitiveIntelligenceData.mediaProminenceCSR}
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

        {/* Top - Media Prominence On Corporate */}
        <DataCard title="Top - Media Prominence On Corporate" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={competitiveIntelligenceData.mediaProminenceCorporate}
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

        {/* Top - Media Prominence On Financial Report */}
        <DataCard title="Top - Media Prominence On Financial Report" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={competitiveIntelligenceData.mediaProminenceFinancial}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 45]} />
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

        {/* Top - Media Prominence On Partnership */}
        <DataCard title="Top - Media Prominence On Partnership" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={competitiveIntelligenceData.mediaProminencePartnership}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 80]} />
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

        {/* Top - Media Prominence On Sponsorship */}
        <DataCard title="Top - Media Prominence On Sponsorship" variant="glass" icon={<BarChart2 size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={competitiveIntelligenceData.mediaProminenceSponsorship}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 80]} />
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
      </div>

      {/* <div className="text-xs text-gray-500 mt-8 border-t pt-4">
        <p>Copyright © 2023, P+ Measurement Services. All rights reserved. This audit report, including all its methodologies, contents, and analysis, is the intellectual property of P+ Measurement Services. It is intended solely for the use of the specifically named clients. Any unauthorized use is strictly prohibited.</p>
      </div> */}
    </div>
  );
}
