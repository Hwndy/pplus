import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Building, TrendingUp } from 'lucide-react';
import { competitivePRDriversData } from '@/utils/competitiveIntelligenceData';

export function CompetitivePRDriversPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Beautiful Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Competitive PR Drivers - Holdings</h1>
            <p className="text-blue-100 text-lg">Key PR initiatives and strategic communications from competitive holdings</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Target size={32} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Company Cards */}
      <div className="space-y-8">
        {competitivePRDriversData.companies.map((company, index) => (
          <Card 
            key={company.id} 
            className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${company.color}15 0%, ${company.color}05 100%)`,
              borderLeft: `4px solid ${company.color}`
            }}
          >
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-current transform translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-current transform -translate-x-12 translate-y-12"></div>
            </div>

            <CardHeader className="pb-4 relative z-10">
              <CardTitle className="text-2xl font-bold flex items-center gap-4" style={{ color: company.color }}>
                <div 
                  className="p-3 rounded-xl shadow-lg flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${company.color}, ${company.color}CC)` }}
                >
                  <Building size={24} className="text-white" />
                </div>
                {company.name}
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <div className="space-y-4">
                {company.drivers.map((driver, driverIndex) => (
                  <div 
                    key={driverIndex}
                    className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-white/40 hover:bg-white/90 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                        style={{ backgroundColor: company.color }}
                      ></div>
                      <p className="text-gray-700 leading-relaxed group-hover:text-gray-900 transition-colors">
                        {driver}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building size={24} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {competitivePRDriversData.companies.length}
            </h3>
            <p className="text-gray-600">Competitive Holdings</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target size={24} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {competitivePRDriversData.companies.reduce((total, company) => total + company.drivers.length, 0)}
            </h3>
            <p className="text-gray-600">Total PR Drivers</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6 text-center">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={24} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {Math.round(competitivePRDriversData.companies.reduce((total, company) => total + company.drivers.length, 0) / competitivePRDriversData.companies.length)}
            </h3>
            <p className="text-gray-600">Avg. Drivers per Company</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
