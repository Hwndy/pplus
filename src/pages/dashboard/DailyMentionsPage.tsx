
import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Send, Download, Eye, PlusCircle, Trash2, Copy, RefreshCcw, Filter, X, CalendarIcon, FileUp, Link } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  DailyMediaReport,
  MentionSection,
  MediaMention,
  SentimentType,
  SectionType,
  createEmptyMention,
  createEmptySection,
  createEmptyReport
} from '@/types/dailyMentions';

const DailyMentionsPage = () => {
  // Session storage key for daily mentions form
  const sessionKey = 'daily_mentions_form_data';

  // Initialize state with data from session storage or create empty report
  const getInitialReport = (): DailyMediaReport => {
    try {
      const savedData = sessionStorage.getItem(sessionKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        return parsedData.report;
      }
    } catch (error) {
      console.error('Error loading saved daily mentions data:', error);
    }
    return createEmptyReport();
  };

  const [report, setReport] = useState<DailyMediaReport>(getInitialReport());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedMentions, setExpandedMentions] = useState<Record<string, boolean>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [headerColor, setHeaderColor] = useState("#0066cc"); // Default blue color for headers
  // We need to keep setLogoFile for the handleLogoChange function
  const [, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const { toast } = useToast();

  // Load expanded sections and mentions from session storage
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem(sessionKey);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        if (parsedData.expandedSections) {
          setExpandedSections(parsedData.expandedSections);
        }
        if (parsedData.expandedMentions) {
          setExpandedMentions(parsedData.expandedMentions);
        }
        if (parsedData.headerColor) {
          setHeaderColor(parsedData.headerColor);
        }
        if (parsedData.logoPreview) {
          setLogoPreview(parsedData.logoPreview);
        }

        toast({
          title: "Data Restored",
          description: "Your previously entered data has been restored."
        });
      }
    } catch (error) {
      console.error('Error loading saved daily mentions data:', error);
    }
  }, [toast]);

  // Save data to session storage whenever it changes
  useEffect(() => {
    const saveToSessionStorage = () => {
      const dataToSave = {
        report,
        expandedSections,
        expandedMentions,
        headerColor,
        logoPreview,
        lastUpdated: new Date().toISOString()
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(dataToSave));
    };

    // Save data when it changes
    saveToSessionStorage();

    // Also set up an interval to save periodically (every 10 seconds)
    const saveInterval = setInterval(saveToSessionStorage, 10000);

    // Clean up interval on unmount
    return () => clearInterval(saveInterval);
  }, [report, expandedSections, expandedMentions, headerColor, logoPreview]);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [publicationFilter, setPublicationFilter] = useState<string>("");
  const [companyFilter, setCompanyFilter] = useState<string>("");

  // Extract unique publications and companies/brands from the report
  const uniquePublications = useMemo(() => {
    const publications = new Set<string>();
    report.sections.forEach(section => {
      section.mentions.forEach(mention => {
        if (mention.publication) {
          publications.add(mention.publication);
        }
      });
    });
    return Array.from(publications).sort();
  }, [report.sections]);

  const uniqueCompanies = useMemo(() => {
    return Array.from(new Set(report.sections.map(section => section.title))).filter(Boolean).sort();
  }, [report.sections]);

  // Apply filters to get filtered sections
  const filteredSections = useMemo(() => {
    if (!dateFilter && !publicationFilter && !companyFilter) {
      return report.sections; // No filters applied, return all sections
    }

    // Create a deep copy of sections to avoid mutating the original data
    const sectionsCopy = JSON.parse(JSON.stringify(report.sections)) as MentionSection[];

    return sectionsCopy.filter((section) => {
      // Filter by company/brand (section title)
      if (companyFilter && !section.title.includes(companyFilter)) {
        return false;
      }

      // Filter mentions within each section
      const filteredMentions = section.mentions.filter(mention => {
        // Filter by publication
        if (publicationFilter && mention.publication !== publicationFilter) {
          return false;
        }

        // Filter by date
        if (dateFilter && mention.publicationDate) {
          // Simple date check - this could be improved with proper date parsing
          if (!mention.publicationDate.includes(format(dateFilter, 'PPP'))) {
            return false;
          }
        }

        return true;
      });

      // If we're filtering by publication or date and no mentions match, hide the section
      if ((publicationFilter || dateFilter) && filteredMentions.length === 0) {
        return false;
      }

      // Update the section with filtered mentions
      section.mentions = filteredMentions;
      return true;
    });
  }, [report.sections, companyFilter, publicationFilter, dateFilter]);


  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // Toggle mention expansion
  const toggleMention = (mentionId: string) => {
    setExpandedMentions(prev => ({
      ...prev,
      [mentionId]: !prev[mentionId]
    }));
  };

  // Add a new section
  const addSection = (type: SectionType = 'OTHER') => {
    const newSection = createEmptySection(type);
    setReport(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    // Auto-expand the new section
    setExpandedSections(prev => ({
      ...prev,
      [newSection.id]: true
    }));
  };

  // Add a new mention to a section
  const addMention = (sectionId: string) => {
    const newMention = createEmptyMention();
    setReport(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, mentions: [...section.mentions, newMention] }
          : section
      )
    }));
    // Auto-expand the new mention
    setExpandedMentions(prev => ({
      ...prev,
      [newMention.id]: true
    }));
  };

  // Clone an existing mention
  const cloneMention = (sectionId: string, mentionId: string) => {
    const sectionIndex = report.sections.findIndex(s => s.id === sectionId);
    if (sectionIndex === -1) return;

    const mentionIndex = report.sections[sectionIndex].mentions.findIndex(m => m.id === mentionId);
    if (mentionIndex === -1) return;

    const mentionToClone = { ...report.sections[sectionIndex].mentions[mentionIndex] };
    const newMention: MediaMention = {
      ...mentionToClone,
      id: `mention-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    };

    setReport(prev => ({
      ...prev,
      sections: prev.sections.map((section, idx) =>
        idx === sectionIndex
          ? { ...section, mentions: [...section.mentions, newMention] }
          : section
      )
    }));

    // Auto-expand the cloned mention
    setExpandedMentions(prev => ({
      ...prev,
      [newMention.id]: true
    }));
  };

  // Remove a section
  const removeSection = (sectionId: string) => {
    setReport(prev => ({
      ...prev,
      sections: prev.sections.filter(section => section.id !== sectionId)
    }));
  };

  // Remove a mention
  const removeMention = (sectionId: string, mentionId: string) => {
    setReport(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, mentions: section.mentions.filter(mention => mention.id !== mentionId) }
          : section
      )
    }));
  };

  // Add a new link to a mention
  const addLink = (sectionId: string, mentionId: string) => {
    setReport(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              mentions: section.mentions.map(mention =>
                mention.id === mentionId
                  ? { ...mention, links: [...mention.links, { url: '' }] }
                  : mention
              )
            }
          : section
      )
    }));
  };

  // Remove a link from a mention
  const removeLink = (sectionId: string, mentionId: string, linkIndex: number) => {
    setReport(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              mentions: section.mentions.map(mention =>
                mention.id === mentionId
                  ? {
                      ...mention,
                      links: mention.links.filter((_, idx) => idx !== linkIndex)
                    }
                  : mention
              )
            }
          : section
      )
    }));
  };

  // Update section title
  const updateSectionTitle = (sectionId: string, title: string) => {
    setReport(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? { ...section, title }
          : section
      )
    }));
  };

  // Update mention field
  const updateMention = (
    sectionId: string,
    mentionId: string,
    field: keyof MediaMention,
    value: string | SentimentType | boolean | string[]
  ) => {
    setReport(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              mentions: section.mentions.map(mention =>
                mention.id === mentionId
                  ? { ...mention, [field]: value }
                  : mention
              )
            }
          : section
      )
    }));
  };

  // Update link
  const updateLink = (sectionId: string, mentionId: string, linkIndex: number, url: string) => {
    setReport(prev => ({
      ...prev,
      sections: prev.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              mentions: section.mentions.map(mention =>
                mention.id === mentionId
                  ? {
                      ...mention,
                      links: mention.links.map((link, idx) =>
                        idx === linkIndex ? { ...link, url } : link
                      )
                    }
                  : mention
              )
            }
          : section
      )
    }));
  };

  // Update report date
  const updateReportDate = (date: string) => {
    setReport(prev => ({ ...prev, date }));
  };

  // Add expecting publication
  const addExpectingPublication = () => {
    setReport(prev => ({
      ...prev,
      expectingPublications: [...(prev.expectingPublications || []), '']
    }));
  };

  // Update expecting publication
  const updateExpectingPublication = (index: number, value: string) => {
    setReport(prev => ({
      ...prev,
      expectingPublications: (prev.expectingPublications || []).map((pub, idx) =>
        idx === index ? value : pub
      )
    }));
  };

  // Remove expecting publication
  const removeExpectingPublication = (index: number) => {
    setReport(prev => ({
      ...prev,
      expectingPublications: (prev.expectingPublications || []).filter((_, idx) => idx !== index)
    }));
  };

  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send report
  const sendReport = () => {
    // This would typically involve sending the data to an API or email service
    console.log('Sending report:', report);

    // Clear session storage after successful submission
    sessionStorage.removeItem(sessionKey);

    toast({
      title: "Report Sent",
      description: "Your daily media highlights report has been sent successfully.",
    });
  };

  // Download report
  const downloadReport = () => {
    // This would typically generate a PDF or other file format
    console.log('Downloading report:', report);
    toast({
      title: "Report Downloaded",
      description: "Your daily media highlights report has been downloaded.",
    });
  };

  // Generate preview
  const generatePreview = () => {
    console.log('Generating preview for report:', report);
    setShowPreview(true);
    toast({
      title: "Preview Generated",
      description: "Your daily media highlights report preview is ready.",
    });
  };

  // Reset form
  const resetForm = () => {
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
      setReport(createEmptyReport());
      setExpandedSections({});
      setExpandedMentions({});
      setShowPreview(false);
      setHeaderColor("#0066cc");
      setLogoFile(null);
      setLogoPreview(null);
      toast({
        title: "Form Reset",
        description: "The form has been reset to its initial state.",
      });
    }
  };

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Daily Media Highlights</h1>
        <div className="flex gap-2 flex-wrap justify-end">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant={showFilters ? "secondary" : "outline"}
            className="flex items-center gap-1 w-full md:w-auto relative"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            {!showFilters && (dateFilter || publicationFilter || companyFilter) && (
              <Badge
                variant="secondary"
                className="ml-1 text-xs absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full"
              >
                {[dateFilter, publicationFilter, companyFilter].filter(Boolean).length}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => document.getElementById('batch-upload')?.click()}
          >
            <FileUp className="h-4 w-4" />
            Batch Upload
          </Button>
          <input
            type="file"
            id="batch-upload"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                toast({
                  title: "Excel Upload",
                  description: `File '${e.target.files[0].name}' selected. This feature is not yet implemented.`,
                });
              }
            }}
          />
          <Button
            onClick={resetForm}
            variant="outline"
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button
            onClick={generatePreview}
            variant="outline"
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button
            onClick={sendReport}
            variant="outline"
            className="flex items-center gap-1"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
          <Button
            onClick={downloadReport}
            className="flex items-center gap-1"
          >
            <Download className="h-4 w-4" />
            Download
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
                    onSelect={setDateFilter}
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
                  <SelectItem value="">All Publications</SelectItem>
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
                  <SelectItem value="">All Companies/Brands</SelectItem>
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
          {(dateFilter || publicationFilter || companyFilter) && (
            <div className="flex flex-wrap gap-2 mt-4 w-full">
              <span className="text-sm font-medium">Active Filters:</span>
              {dateFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Date: {format(dateFilter, 'MMM d, yyyy')}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setDateFilter(undefined)} />
                </Badge>
              )}
              {publicationFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Publication: {publicationFilter}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setPublicationFilter('')} />
                </Badge>
              )}
              {companyFilter && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Company/Brand: {companyFilter}
                  <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setCompanyFilter('')} />
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDateFilter(undefined);
                  setPublicationFilter('');
                  setCompanyFilter('');
                }}
                className="ml-auto"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </Card>
      )}

      <div className="grid gap-6">
        {/* Report Header Information */}
        <Card className="p-4">
          <h2 className="text-lg font-medium mb-4">Report Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="report-date">Report Date</Label>
              <Input
                id="report-date"
                type="date"
                value={report.date}
                onChange={(e) => updateReportDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Expecting Publications</Label>
              {report.expectingPublications?.map((pub, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    value={pub}
                    onChange={(e) => updateExpectingPublication(idx, e.target.value)}
                    placeholder="Publication name"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExpectingPublication(idx)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={addExpectingPublication}
                className="mt-2"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Publication
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="logo-upload">Company Logo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="flex-1"
                  />
                  {logoPreview && (
                    <div className="h-10 w-10 rounded-full border border-gray-200 overflow-hidden">
                      <img
                        src={logoPreview}
                        alt="Logo Preview"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="header-color">Header Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="header-color"
                    type="color"
                    value={headerColor}
                    onChange={(e) => setHeaderColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={headerColor}
                    onChange={(e) => setHeaderColor(e.target.value)}
                    placeholder="#0066cc"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Sections - Use filteredSections instead of report.sections */}
        {filteredSections.map((section) => (
          <Card key={section.id} className="p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between" style={{ backgroundColor: headerColor }}>
                <div className="flex-1 p-2">
                  <Input
                    value={section.title}
                    onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                    placeholder={`${section.type} (e.g., STANBIC IBTC SUBSIDIARIES)`}
                    className="font-medium text-lg text-white bg-transparent border-none focus:ring-0 focus:border-none"
                  />
                </div>
                <div className="flex gap-2 p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-white hover:bg-blue-700"
                    onClick={() => toggleSection(section.id)}
                  >
                    {expandedSections[section.id] ? "Collapse" : "Expand"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:text-white hover:bg-blue-700"
                    onClick={() => removeSection(section.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                Section Type: {section.type}
              </div>
            </div>

            {(expandedSections[section.id] || section.mentions.length === 0) && (
              <div className="space-y-4">
                {section.mentions.map((mention) => (
                  <Card key={mention.id} className="p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1">
                        <Input
                          value={mention.title}
                          onChange={(e) => updateMention(section.id, mention.id, 'title', e.target.value)}
                          placeholder="News Headline"
                          className="font-medium"
                        />
                      </div>
                      <div className="flex gap-1">
                        <select
                          value={mention.sentiment}
                          onChange={(e) => updateMention(section.id, mention.id, 'sentiment', e.target.value as SentimentType)}
                          className="h-8 rounded-md border border-input px-3 py-1 text-sm bg-background"
                        >
                          <option value="Positive">Positive</option>
                          <option value="Neutral">Neutral</option>
                          <option value="Negative">Negative</option>
                          <option value="N/A">N/A</option>
                        </select>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleMention(mention.id)}
                        >
                          {expandedMentions[mention.id] ? "Collapse" : "Expand"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cloneMention(section.id, mention.id)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMention(section.id, mention.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {expandedMentions[mention.id] && (
                      <div className="space-y-3 mt-3">
                        <div>
                          <Label htmlFor={`content-${mention.id}`}>Content</Label>
                          <Textarea
                            id={`content-${mention.id}`}
                            value={mention.content}
                            onChange={(e) => updateMention(section.id, mention.id, 'content', e.target.value)}
                            placeholder="News content..."
                            rows={4}
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            Format content as shown in the template: Start with headline, followed by content, then add sentiment and reporter at the end.
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`reporter-${mention.id}`}>Reporter</Label>
                            <Input
                              id={`reporter-${mention.id}`}
                              value={mention.reporter || ''}
                              onChange={(e) => updateMention(section.id, mention.id, 'reporter', e.target.value)}
                              placeholder="Reporter Name"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`source-${mention.id}`}>Source</Label>
                            <Input
                              id={`source-${mention.id}`}
                              value={mention.source || ''}
                              onChange={(e) => updateMention(section.id, mention.id, 'source', e.target.value)}
                              placeholder="Source (e.g., BusinessDay)"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor={`publication-${mention.id}`}>Publication</Label>
                            <Input
                              id={`publication-${mention.id}`}
                              value={mention.publication || ''}
                              onChange={(e) => updateMention(section.id, mention.id, 'publication', e.target.value)}
                              placeholder="Publication Name"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`page-${mention.id}`}>Page</Label>
                            <Input
                              id={`page-${mention.id}`}
                              value={mention.publicationPage || ''}
                              onChange={(e) => updateMention(section.id, mention.id, 'publicationPage', e.target.value)}
                              placeholder="Page Number (e.g., Page 39)"
                            />
                          </div>
                          <div>
                            <Label htmlFor={`pub-date-${mention.id}`}>Publication Date</Label>
                            <Input
                              id={`pub-date-${mention.id}`}
                              value={mention.publicationDate || ''}
                              onChange={(e) => updateMention(section.id, mention.id, 'publicationDate', e.target.value)}
                              placeholder="Date (e.g., 8th January)"
                            />
                          </div>
                        </div>

                        <div>
                          <Label>Links</Label>
                          {mention.links.map((link, linkIndex) => (
                            <div key={linkIndex} className="flex gap-2 items-center mt-2">
                              <Input
                                value={link.url}
                                onChange={(e) => updateLink(section.id, mention.id, linkIndex, e.target.value)}
                                placeholder="URL (e.g., Punchng.com)"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeLink(section.id, mention.id, linkIndex)}
                                className="shrink-0"
                                disabled={mention.links.length <= 1}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addLink(section.id, mention.id)}
                            className="mt-2"
                          >
                            <Link className="h-4 w-4 mr-2" />
                            Add Link
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}

                <Button
                  variant="outline"
                  onClick={() => addMention(section.id)}
                  className="w-full"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add News Item
                </Button>
              </div>
            )}
          </Card>
        ))}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Button
            variant="outline"
            onClick={() => addSection('COMPETITORS')}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Competitors Section
          </Button>
          <Button
            variant="outline"
            onClick={() => addSection('INDUSTRY')}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Industry Section
          </Button>
          <Button
            variant="outline"
            onClick={() => addSection('SUBSIDIARIES')}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Subsidiaries Section
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => addSection('PHOTO')}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Photo Section
          </Button>
          <Button
            variant="outline"
            onClick={() => addSection('ADVERT')}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Advert Section
          </Button>
          <Button
            variant="outline"
            onClick={() => addSection('PASSIVE')}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Passive Section
          </Button>
        </div>
        <Button
          variant="outline"
          onClick={() => addSection('OTHER')}
          className="w-full mt-4"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Other Section
        </Button>

        {/* Footer Note */}
        <Card className="p-4">
          <div className="space-y-2">
            <Label htmlFor="footer-note">Footer Note</Label>
            <Textarea
              id="footer-note"
              value={report.footerNote || ''}
              onChange={(e) => setReport(prev => ({ ...prev, footerNote: e.target.value }))}
              placeholder="P+ Measurement Services Daily Media Briefs cover all relevant news reports, features and photo stories in major Nigerian newspapers, magazines, online news sites & blogs."
              rows={2}
            />
          </div>
        </Card>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <Card className="mt-6 p-4">
          <h2 className="text-lg font-medium mb-4">Preview</h2>
          <div className="border rounded p-4 bg-white">
            <div className="max-w-4xl mx-auto border border-gray-300">
              {/* Header */}
              <div className="flex items-center justify-between" style={{ backgroundColor: headerColor }}>
                <h1 className="text-white text-2xl font-bold p-4">DAILY MEDIA HIGHLIGHTS</h1>
                {logoPreview && (
                  <div className="bg-white rounded-full h-20 w-20 flex items-center justify-center p-2 mr-4">
                    <img src={logoPreview} alt="Company Logo" className="max-h-full max-w-full" />
                  </div>
                )}
              </div>

              {/* Date and intro */}
              <div className="p-4 bg-white">
                <p className="font-semibold">{format(new Date(report.date), 'MMM d, yyyy')}</p>
                <p className="text-sm mt-2">
                  This daily digest provides a summary of discovered news material, and other
                  resources related to your search terms, with a focus on coverage featured in
                  National/Regional Print Publications and Online media. Alert covers online media for
                  keywords from the first edition on the day of the media alert(weekly).
                </p>
              </div>

              {/* Sections */}
              {report.sections.map((section) => (
                <div key={section.id} className="mt-2">
                  {/* Section Header */}
                  <div style={{ backgroundColor: headerColor }} className="p-2">
                    <h2 className="text-white font-bold">{section.title || section.type}</h2>
                  </div>

                  {/* Section Content */}
                  <div className="p-4 bg-white">
                    {section.mentions.map((mention) => (
                      <div key={mention.id} className="mb-4">
                        <p className="font-bold">{mention.title || 'News headline'}: - </p>
                        <p className="text-sm">{mention.content || 'News content will appear here...'}</p>

                        {mention.links.some(link => link.url) && (
                          <p className="text-sm mt-1">
                            {mention.links.map((link, lIndex) =>
                              link.url ? (
                                <span key={lIndex}>
                                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                    {link.url}
                                  </a>
                                  {lIndex < mention.links.length - 1 ? ' / ' : ''}
                                </span>
                              ) : null
                            )}
                          </p>
                        )}

                        <p className="text-sm mt-1">
                          <span className="font-semibold">Sentiment:</span> {mention.sentiment || 'N/A'}<br />
                          <span className="font-semibold">Reporter:</span> {mention.reporter || 'Not specified'}
                          {mention.publicationPage && <><br /><span className="font-semibold">Page:</span> {mention.publicationPage}</>}
                          {mention.publicationDate && <><br /><span className="font-semibold">Date:</span> {mention.publicationDate}</>}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Expecting publications */}
              {report.expectingPublications && report.expectingPublications.length > 0 && (
                <div className="p-4 bg-gray-100">
                  <p className="font-semibold">Expecting: {report.expectingPublications.join(', ')}</p>
                </div>
              )}

              {/* Footer */}
              <div className="p-4 bg-white text-xs text-center">
                <p>{report.footerNote || 'P+ Measurement Services Daily Media Briefs cover all relevant news reports, features and photo stories in major Nigerian newspapers, magazines, online news sites & blogs.'}</p>
                <p className="mt-1 text-gray-500">(Clippings of specific stories/reports are available on request)</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DailyMentionsPage;
