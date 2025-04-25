import React from 'react';
import { DataCard } from '@/components/ui/DataCard';
import { Newspaper, Users } from 'lucide-react';
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

export function PublicationsAnalysis({ 
  printPublications, 
  onlinePublications, 
  printReporters, 
  onlineReporters,
  spokespersons
}: PublicationsAnalysisProps) {
  return (
    <DataCard title="Publications / Reporters / Spokespersons Analysis" variant="glass" icon={<Newspaper size={24} />}>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Print Publications */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Print Publications (Volume)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={printPublications}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Bar dataKey="percentage" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Online Publications */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Online Publications (Volume)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={onlinePublications}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Bar dataKey="percentage" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Print Reporters */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Print Reporters (Volume)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={printReporters}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Bar dataKey="percentage" fill="#FFBB28" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Online Reporters */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Online Reporters (Volume)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={onlineReporters}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Bar dataKey="percentage" fill="#FF8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Spokespersons */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Spokespersons</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {spokespersons.map((person) => (
              <div key={person.id} className="border rounded-lg p-4 bg-muted/10">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden mr-4">
                    <img 
                      src={person.photoUrl} 
                      alt={person.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold">{person.name}</h4>
                    <p className="text-sm text-muted-foreground">{person.title}</p>
                  </div>
                </div>
                <p className="text-sm">{person.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DataCard>
  );
}
