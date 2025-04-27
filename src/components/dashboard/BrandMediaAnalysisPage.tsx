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
  Line,
  Area,
  AreaChart
} from 'recharts';
import { brandMediaAnalysisData } from '@/utils/clientDashboardData';
import {
  BarChart2,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
  Newspaper,
  Image,
  Video,
  TrendingUp,
  Users
} from 'lucide-react';

// Enhanced color palette for better visual appeal
const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

export function BrandMediaAnalysisPage() {
  // Get current date for display
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate()} ${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()}`;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">Brand Media Analysis</h2>
        <div className="text-sm text-gray-500">{formattedDate}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DataCard
          title="News Mentions"
          variant="glass"
          icon={<Newspaper size={24} className="text-indigo-600" />}
          className="border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-indigo-600">{brandMediaAnalysisData.newsMentions}</div>
            <div className="text-sm text-gray-500">News mentions</div>
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              <span>+12% from last month</span>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Photo Mentions"
          variant="glass"
          icon={<Image size={24} className="text-cyan-600" />}
          className="border-cyan-100 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-cyan-600">{brandMediaAnalysisData.photoMentions}</div>
            <div className="text-sm text-gray-500">Photo mentions</div>
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              <span>+8% from last month</span>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Video Mentions"
          variant="glass"
          icon={<Video size={24} className="text-emerald-600" />}
          className="border-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-emerald-600">{brandMediaAnalysisData.videoMentions}</div>
            <div className="text-sm text-gray-500">Video mentions</div>
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              <span>+15% from last month</span>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Potential Reach"
          variant="glass"
          icon={<Users size={24} className="text-amber-600" />}
          className="border-amber-100 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="flex flex-col items-center justify-center p-4">
            <div className="text-3xl font-bold text-amber-600">{brandMediaAnalysisData.potentialReach.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Potential audience</div>
            <div className="mt-2 text-xs text-green-500 flex items-center">
              <TrendingUp size={14} className="mr-1" />
              <span>+23% from last month</span>
            </div>
          </div>
        </DataCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard
          title="Subsidiaries Exposure"
          variant="glass"
          icon={<PieChartIcon size={24} className="text-indigo-600" />}
          className="border-indigo-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandMediaAnalysisData.subsidiariesExposure}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {brandMediaAnalysisData.subsidiariesExposure.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {brandMediaAnalysisData.subsidiariesExposure[0].value}%
              </div>
              <div className="text-sm text-gray-500">
                {brandMediaAnalysisData.subsidiariesExposure[0].name}
              </div>
            </div>
          </div>
        </DataCard>

        <DataCard
          title="Message Placement"
          variant="glass"
          icon={<PieChartIcon size={24} className="text-cyan-600" />}
          className="border-cyan-100 hover:border-cyan-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandMediaAnalysisData.messagePlacement}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  innerRadius={50}
                  fill="#8884d8"
                  dataKey="value"
                  paddingAngle={2}
                >
                  {brandMediaAnalysisData.messagePlacement.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value}%`}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-3xl font-bold text-cyan-600">
                {brandMediaAnalysisData.messagePlacement[0].value}%
              </div>
              <div className="text-sm text-gray-500">
                {brandMediaAnalysisData.messagePlacement[0].name}
              </div>
            </div>
          </div>
        </DataCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DataCard
          title="Weekly Trend"
          variant="glass"
          icon={<LineChartIcon size={24} className="text-emerald-600" />}
          className="border-emerald-100 hover:border-emerald-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={brandMediaAnalysisData.weeklyTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorOnlineWeekly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPrintWeekly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend iconType="circle" />
                <Area
                  type="monotone"
                  dataKey="onlineMedia"
                  name="Online Media"
                  stroke={COLORS[0]}
                  fillOpacity={1}
                  fill="url(#colorOnlineWeekly)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="printMedia"
                  name="Print Media"
                  stroke={COLORS[2]}
                  fillOpacity={1}
                  fill="url(#colorPrintWeekly)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DataCard>

        <DataCard
          title="Monthly Trend"
          variant="glass"
          icon={<LineChartIcon size={24} className="text-amber-600" />}
          className="border-amber-100 hover:border-amber-300 transition-all shadow-sm hover:shadow-md"
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={brandMediaAnalysisData.monthlyTrend}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorOnlineMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPrintMonthly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[3]} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={COLORS[3]} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                />
                <Legend iconType="circle" />
                <Area
                  type="monotone"
                  dataKey="onlineMedia"
                  name="Online Media"
                  stroke={COLORS[1]}
                  fillOpacity={1}
                  fill="url(#colorOnlineMonthly)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="printMedia"
                  name="Print Media"
                  stroke={COLORS[3]}
                  fillOpacity={1}
                  fill="url(#colorPrintMonthly)"
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DataCard>
      </div>
    </div>
  );
}
