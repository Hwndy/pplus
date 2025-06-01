import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookOpen, Search, Filter } from 'lucide-react';
import { glossaryData } from '@/utils/glossaryData';

export function GlossaryPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredGlossary = glossaryData.filter(
    item =>
      item.metric.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Beautiful Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/10 transform translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 transform -translate-x-24 translate-y-24"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Glossary</h1>
            <p className="text-emerald-100 text-lg">Comprehensive definitions of metrics and terminology</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
              <BookOpen size={32} className="text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-gray-100">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search metrics and definitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 text-lg border-0 bg-white shadow-md focus:shadow-lg transition-all duration-200"
            />
          </div>
        </CardContent>
      </Card>

      {/* Glossary Table */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-0">
          <div className="grid grid-cols-2 gap-0">
            <div className="p-6 border-r border-white/20">
              <CardTitle className="text-xl font-bold text-center">METRIC</CardTitle>
            </div>
            <div className="p-6">
              <CardTitle className="text-xl font-bold text-center">DEFINITION</CardTitle>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="max-h-[600px] overflow-y-auto">
            {filteredGlossary.map((item, index) => (
              <div 
                key={index}
                className={`grid grid-cols-2 gap-0 border-b border-gray-200 hover:bg-blue-50/50 transition-colors duration-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
              >
                <div className="p-6 border-r border-gray-200">
                  <h3 className="font-semibold text-blue-700 leading-relaxed">
                    {item.metric}
                  </h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed text-justify">
                    {item.definition}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Filter size={16} />
          <span>
            Showing {filteredGlossary.length} of {glossaryData.length} definitions
          </span>
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear search
          </button>
        )}
      </div>
    </div>
  );
}
