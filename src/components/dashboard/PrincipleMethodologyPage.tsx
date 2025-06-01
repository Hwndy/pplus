import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Database, ShieldCheck, BarChart3, FileText, Award, Microscope } from 'lucide-react';
import { auditProcessSteps, principlesData, methodologyData } from '@/utils/methodologyData';

const iconMap = {
  monitor: Monitor,
  database: Database,
  'shield-check': ShieldCheck,
  'chart-bar': BarChart3,
  'document-report': FileText
};

export function PrincipleMethodologyPage() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Beautiful Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Principle & Methodology</h1>
            <p className="text-purple-100 text-lg">Our audit report process and analytical framework</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <Microscope size={32} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Principles and Methodology Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Principles Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-teal-50 to-cyan-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-cyan-500/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full transform translate-x-16 -translate-y-16"></div>
          
          <CardHeader className="relative z-10 pb-4">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white p-4 rounded-xl mb-4 inline-block">
              <CardTitle className="text-xl font-bold">Principles</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <Award className="text-teal-600" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{principlesData.title}</h3>
                <p className="text-teal-600 font-semibold text-lg">{principlesData.organization}</p>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-teal-200/50">
              <p className="text-gray-700 leading-relaxed text-lg">
                {principlesData.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Methodology Card */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-50 to-orange-50 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full transform translate-x-16 -translate-y-16"></div>
          
          <CardHeader className="relative z-10 pb-4">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 rounded-xl mb-4 inline-block">
              <CardTitle className="text-xl font-bold">Methodology</CardTitle>
            </div>
          </CardHeader>
          
          <CardContent className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white rounded-full p-3 shadow-lg">
                <Microscope className="text-amber-600" size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{methodologyData.title}</h3>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-amber-200/50">
              <p className="text-gray-700 leading-relaxed text-lg">
                {methodologyData.description}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Process Section */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold text-center">
            Our Audit Report Process – developed by P+ Measurement Services
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-8">
          <div className="space-y-8">
            {auditProcessSteps.map((step, index) => {
              const IconComponent = iconMap[step.icon as keyof typeof iconMap];
              const isEven = index % 2 === 0;
              
              return (
                <div key={step.id} className="relative">
                  {/* Process Flow Arrow */}
                  {index < auditProcessSteps.length - 1 && (
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-full mt-4 z-10">
                      <div 
                        className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-l-transparent border-r-transparent"
                        style={{ borderTopColor: step.color }}
                      ></div>
                    </div>
                  )}
                  
                  <div className={`flex items-center gap-8 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Content */}
                    <div className="flex-1">
                      <Card 
                        className="border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                        style={{ 
                          background: `linear-gradient(135deg, ${step.color}15 0%, ${step.color}05 100%)`,
                          borderLeft: `4px solid ${step.color}`
                        }}
                      >
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-3" style={{ color: step.color }}>
                            {step.title}
                          </h3>
                          <p className="text-gray-700 leading-relaxed">
                            {step.description}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Icon */}
                    <div className="flex-shrink-0">
                      <div 
                        className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                        style={{ background: `linear-gradient(135deg, ${step.color}, ${step.color}CC)` }}
                      >
                        <IconComponent size={32} className="text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
