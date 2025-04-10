
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Plus, ExternalLink, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DailyMediaReport, createMockReport } from '@/types/dailyMentions';
import { format } from 'date-fns';

const DailyMentionsViewPage = () => {
  const [report, setReport] = useState<DailyMediaReport | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll use our mock data
    setReport(createMockReport());
  }, []);

  const handleCreateNew = () => {
    navigate('/dashboard/daily-mentions/create');
  };

  if (!report) {
    return (
      <div className="p-6 flex justify-center items-center">
        <p>Loading report...</p>
      </div>
    );
  }

  // Helper function to get badge color based on sentiment
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-green-100 text-green-800 hover:bg-green-100/80';
      case 'Negative':
        return 'bg-red-100 text-red-800 hover:bg-red-100/80';
      case 'Neutral':
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100/80';
      default:
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100/80';
    }
  };

  const formattedDate = new Date(report.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Media Highlights</h1>
        <Button onClick={handleCreateNew} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          Create New Report
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold">
            Media Highlights Report
          </CardTitle>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">{formattedDate}</span>
          </div>
        </CardHeader>
        <CardContent>
          {report.expectingPublications && report.expectingPublications.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Expecting from publications:</p>
              <div className="flex flex-wrap gap-2">
                {report.expectingPublications.map((pub, index) => (
                  <Badge key={index} variant="outline" className="bg-amber-50">
                    {pub}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {report.sections.map((section) => (
            <div key={section.id} className="mt-6">
              <h2 className="text-lg font-semibold uppercase tracking-tight mb-3">
                {section.title}
              </h2>
              <Separator className="mb-4" />

              <div className="space-y-4">
                {section.mentions.map((mention) => (
                  <Card key={mention.id} className="p-4 border-l-4 border-l-indigo-500">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{mention.title}</h3>
                      <Badge className={getSentimentColor(mention.sentiment)}>
                        {mention.sentiment}
                      </Badge>
                    </div>

                    <p className="text-gray-700 mb-3 text-sm">{mention.content}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                      {mention.reporter && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Reporter:</span> {mention.reporter}
                        </div>
                      )}
                      {mention.source && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Source:</span> {mention.source}
                        </div>
                      )}
                      {mention.publication && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Publication:</span> {mention.publication}
                          {mention.publicationPage && `, Page ${mention.publicationPage}`}
                          {mention.publicationDate && ` (${mention.publicationDate})`}
                        </div>
                      )}
                    </div>

                    {mention.links && mention.links.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {mention.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-3 w-3" />
                            {link.label || 'View Source'}
                          </a>
                        ))}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {report.footerNote && (
            <div className="mt-8 text-xs text-gray-500 italic border-t pt-4">
              {report.footerNote}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DailyMentionsViewPage;
