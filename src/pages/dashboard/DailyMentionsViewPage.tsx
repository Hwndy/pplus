
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, ExternalLink, Filter, X, CalendarIcon, Calendar as CalendarIcon2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DailyMediaReport, MentionSection, createMockReport } from '@/types/dailyMentions';
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const DailyMentionsViewPage = () => {
  const [report, setReport] = useState<DailyMediaReport | null>(null);
  const navigate = useNavigate();

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [publicationFilter, setPublicationFilter] = useState<string>("all");
  const [companyFilter, setCompanyFilter] = useState<string>("all");

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, we'll use our mock data
    setReport(createMockReport());
  }, []);

  const handleCreateNew = () => {
    navigate('/dashboard/daily-mentions/create');
  };

  // Extract unique publications and companies/brands from the report
  const uniquePublications = useMemo(() => {
    if (!report) return [];

    const publications = new Set<string>();
    report.sections.forEach(section => {
      section.mentions.forEach(mention => {
        if (mention.publication) {
          publications.add(mention.publication);
        }
      });
    });
    return Array.from(publications).sort();
  }, [report]);

  const uniqueCompanies = useMemo(() => {
    if (!report) return [];

    return Array.from(new Set(report.sections.map(section => section.title))).filter(Boolean).sort();
  }, [report]);

  // Apply filters to get filtered sections
  const filteredSections = useMemo(() => {
    if (!report) return [];
    if ((!dateFilter && publicationFilter === "all" && companyFilter === "all")) {
      return report.sections; // No filters applied, return all sections
    }

    // Create a deep copy of sections to avoid mutating the original data
    const sectionsCopy = JSON.parse(JSON.stringify(report.sections)) as MentionSection[];

    return sectionsCopy.filter((section) => {
      // Filter by company/brand (section title)
      if (companyFilter !== "all" && !section.title.includes(companyFilter)) {
        return false;
      }

      // Filter mentions within each section
      const filteredMentions = section.mentions.filter(mention => {
        // Filter by publication
        if (publicationFilter !== "all" && mention.publication !== publicationFilter) {
          return false;
        }

        // Filter by date
        if (dateFilter && mention.publicationDate) {
          // Simple date check - this could be improved with proper date parsing
          const filterDate = format(dateFilter, 'do MMMM');
          if (!mention.publicationDate.includes(filterDate)) {
            return false;
          }
        }

        return true;
      });

      // If we're filtering by publication or date and no mentions match, hide the section
      if ((publicationFilter !== "all" || dateFilter) && filteredMentions.length === 0) {
        return false;
      }

      // Update the section with filtered mentions
      section.mentions = filteredMentions;
      return true;
    });
  }, [report, companyFilter, publicationFilter, dateFilter]);

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
        <div className="flex gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "secondary" : "outline"}
            className="flex items-center gap-1 w-full md:w-auto relative"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {!showFilters && (dateFilter || publicationFilter !== "all" || companyFilter !== "all") && (
              <Badge
                variant="secondary"
                className="ml-1 text-xs absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full"
              >
                {[dateFilter, publicationFilter !== "all" ? publicationFilter : null, companyFilter !== "all" ? companyFilter : null].filter(Boolean).length}
              </Badge>
            )}
          </Button>
          <Button onClick={handleCreateNew} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Create New Report
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      {showFilters && (
        <Card className="p-4 mb-6 w-full">
          <h2 className="text-lg font-medium mb-4">Filter Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {/* Date Filter */}
            <div>
              <Label htmlFor="date-filter">Filter by Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-filter"
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, 'PPP') : <span>Select date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={(date) => date ? setDateFilter(date) : setDateFilter(undefined)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {dateFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDateFilter(undefined)}
                  className="mt-1"
                >
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              )}
            </div>

            {/* Publication Filter */}
            <div>
              <Label htmlFor="publication-filter">Filter by Publication</Label>
              <Select
                value={publicationFilter}
                onValueChange={setPublicationFilter}
              >
                <SelectTrigger id="publication-filter" className="mt-1 w-full">
                  <SelectValue placeholder="Select publication" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Publications</SelectItem>
                  {uniquePublications.map(publication => (
                    <SelectItem key={publication} value={publication}>
                      {publication}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Company/Brand Filter */}
            <div>
              <Label htmlFor="company-filter">Filter by Company/Brand</Label>
              <Select
                value={companyFilter}
                onValueChange={setCompanyFilter}
              >
                <SelectTrigger id="company-filter" className="mt-1 w-full">
                  <SelectValue placeholder="Select company/brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies/Brands</SelectItem>
                  {uniqueCompanies.map(company => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active Filters */}
          {(dateFilter || publicationFilter !== "all" || companyFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4 w-full">
              <span className="text-sm font-medium">Active Filters:</span>
              {dateFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date: {format(dateFilter, 'MMM d, yyyy')}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setDateFilter(undefined)} />
                </Badge>
              )}
              {publicationFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Publication: {publicationFilter}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setPublicationFilter('all')} />
                </Badge>
              )}
              {companyFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Company/Brand: {companyFilter}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setCompanyFilter('all')} />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFilter(undefined);
                  setPublicationFilter('all');
                  setCompanyFilter('all');
                }}
                className="ml-auto"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </Card>
      )}

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold">
            Media Highlights Report
          </CardTitle>
          <div className="flex items-center gap-2">
            <CalendarIcon2 className="h-4 w-4 text-gray-500" />
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

          {filteredSections.map((section) => (
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
