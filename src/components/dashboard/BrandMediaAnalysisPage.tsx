import React from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Stat } from '@/components/ui/Stat';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { brandMediaAnalysisData } from '@/utils/clientDashboardData';
import { 
  BarChart2, 
  LineChart as LineChartIcon, 
  PieChart as PieChartIcon, 
  Newspaper, 
  Image, 
  Video 
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function BrandMediaAnalysisPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold">Brand Media Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DataCard title="News Mentions" variant="glass" icon={<Newspaper size={24} />}>
          <Stat
            label="News"
            value={brandMediaAnalysisData.newsMentions}
            subtitle="mentions"
          />
        </DataCard>
        
        <DataCard title="Photo Mentions" variant="glass" icon={<Image size={24} />}>
          <Stat
            label="Photos"
            value={brandMediaAnalysisData.photoMentions}
            subtitle="mentions"
          />
        </DataCard>
        
        <DataCard title="Video Mentions" variant="glass" icon={<Video size={24} />}>
          <Stat
            label="Videos"
            value={brandMediaAnalysisData.videoMentions}
            subtitle="mentions"
          />
        </DataCard>
        
        <DataCard title="Potential Reach" variant="glass" icon={<BarChart2 size={24} />}>
          <Stat
            label="Reach"
            value={brandMediaAnalysisData.potentialReach.toLocaleString()}
            subtitle="potential audience"
          />
        </DataCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard title="Subsidiaries Exposure" variant="glass" icon={<PieChartIcon size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandMediaAnalysisData.subsidiariesExposure}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {brandMediaAnalysisData.subsidiariesExposure.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DataCard>

        <DataCard title="Message Placement" variant="glass" icon={<PieChartIcon size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandMediaAnalysisData.messagePlacement}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {brandMediaAnalysisData.messagePlacement.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DataCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard title="Weekly Trend" variant="glass" icon={<LineChartIcon size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={brandMediaAnalysisData.weeklyTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="onlineMedia" stroke="#8884d8" name="Online Media" />
                <Line type="monotone" dataKey="printMedia" stroke="#82ca9d" name="Print Media" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DataCard>

        <DataCard title="Monthly Trend" variant="glass" icon={<LineChartIcon size={24} />}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={brandMediaAnalysisData.monthlyTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="onlineMedia" stroke="#8884d8" name="Online Media" />
                <Line type="monotone" dataKey="printMedia" stroke="#82ca9d" name="Print Media" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DataCard>
      </div>
    </div>
  );
}
