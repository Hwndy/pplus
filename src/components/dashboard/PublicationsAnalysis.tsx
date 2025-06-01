import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Users, FileText, Globe, User, Quote } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define types for our publications data
interface Publication {
  name: string;
  value: number;
  percentage: number;
}

interface Reporter {
  name: string;
  publication: string;
  value: number;
  percentage: number;
}

interface Spokesperson {
  id: string;
  name: string;
  title: string;
  photoUrl: string;
  quote: string;
}

interface PublicationsAnalysisProps {
  printPublications: Publication[];
  onlinePublications: Publication[];
  printReporters: Reporter[];
  onlineReporters: Reporter[];
  spokespersons: Spokesperson[];
}

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{label}</p>
        <p className="text-blue-600">
          {`${payload[0].value}%`}
        </p>
      </div>
    );
  }
  return null;
};

export function PublicationsAnalysis({
  printPublications,
  onlinePublications,
  printReporters,
  onlineReporters,
  spokespersons
}: PublicationsAnalysisProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* Left side - Charts (3 columns) */}
      <div className="xl:col-span-3 space-y-8">
        {/* Publications Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Print Publications */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-2 rounded-lg">
                  <FileText size={20} className="text-white" />
                </div>
                Print Publications
                <span className="text-sm font-normal text-gray-500">(Volume)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={printPublications}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                  >
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#374151' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="percentage"
                      fill="url(#blueGradient)"
                      radius={[0, 4, 4, 0]}
                    />
                    <defs>
                      <linearGradient id="blueGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#1D4ED8" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Online Publications */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-2 rounded-lg">
                  <Globe size={20} className="text-white" />
                </div>
                Online Publications
                <span className="text-sm font-normal text-gray-500">(Volume)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={onlinePublications}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                  >
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={100}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#374151' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="percentage"
                      fill="url(#greenGradient)"
                      radius={[0, 4, 4, 0]}
                    />
                    <defs>
                      <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reporters Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Print Reporters */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-lg">
                  <User size={20} className="text-white" />
                </div>
                Print Reporters
                <span className="text-sm font-normal text-gray-500">(Volume)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={printReporters}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                  >
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#374151' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="percentage"
                      fill="url(#orangeGradient)"
                      radius={[0, 4, 4, 0]}
                    />
                    <defs>
                      <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D97706" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Online Reporters */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                  <Users size={20} className="text-white" />
                </div>
                Online Reporters
                <span className="text-sm font-normal text-gray-500">(Volume)</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={onlineReporters}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                  >
                    <XAxis
                      type="number"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#6B7280' }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={120}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: '#374151' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="percentage"
                      fill="url(#purpleGradient)"
                      radius={[0, 4, 4, 0]}
                    />
                    <defs>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#7C3AED" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Spokespersons (1 column) */}
      <div className="xl:col-span-1">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 hover:shadow-xl transition-all duration-300 h-full">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-3">
              <div className="bg-gradient-to-br from-slate-600 to-gray-600 p-2 rounded-lg">
                <Quote size={20} className="text-white" />
              </div>
              Spokespersons
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {spokespersons.map((person) => (
              <div key={person.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-200">
                    <img
                      src={person.photoUrl}
                      alt={person.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=6366f1&color=fff&size=64`;
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm leading-tight">{person.name}</h4>
                    <p className="text-xs text-blue-600 font-medium mt-1 leading-tight">{person.title}</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full"></div>
                  <p className="text-xs text-gray-700 leading-relaxed pl-4 italic">"{person.quote}"</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
