
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { PlusCircle, Trash2, Copy, ChevronDown, ChevronUp, FileText, RefreshCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  DailyMediaReport,
  MentionSection,
  MediaMention,
  SentimentType,
  createEmptyMention,
  createEmptySection,
  createEmptyReport
} from '@/types/dailyMentions';

const DailyMentionsPage = () => {
  const [report, setReport] = useState<DailyMediaReport>(createEmptyReport());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedMentions, setExpandedMentions] = useState<Record<string, boolean>>({});
  const [showPreview, setShowPreview] = useState(false);
  const { toast } = useToast();

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
  const addSection = () => {
    const newSection = createEmptySection();
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
    value: string | SentimentType | any
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

  // Generate report
  const generateReport = () => {
    // Here you would typically send the data to an API or generate a PDF
    console.log('Generated report:', report);
    toast({
      title: "Report Generated",
      description: "Your daily media highlights report has been generated successfully.",
    });
    setShowPreview(true);
  };

  // Reset form
  const resetForm = () => {
    if (confirm('Are you sure you want to reset the form? All entered data will be lost.')) {
      setReport(createEmptyReport());
      setExpandedSections({});
      setExpandedMentions({});
      setShowPreview(false);
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
        <div className="flex gap-2">
          <Button 
            onClick={resetForm}
            variant="outline"
            className="flex items-center gap-1"
          >
            <RefreshCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button 
            onClick={generateReport}
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Report Header Information */}
        <Card className="p-4">
          <h2 className="text-lg font-medium mb-4">Report Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>
        </Card>

        {/* Sections */}
        {report.sections.map((section, sectionIndex) => (
          <Card key={section.id} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <Input
                  value={section.title}
                  onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                  placeholder="Section Title (e.g., STANDARD BANK AFRICA)"
                  className="font-medium text-lg"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSection(section.id)}
                >
                  {expandedSections[section.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeSection(section.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {(expandedSections[section.id] || section.mentions.length === 0) && (
              <div className="space-y-4">
                {section.mentions.map((mention, mentionIndex) => (
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
                          {expandedMentions[mention.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
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
                              placeholder="Page Number"
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
                                placeholder="URL (e.g., https://example.com)"
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
                            <PlusCircle className="h-4 w-4 mr-2" />
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

        <Button
          variant="outline"
          onClick={addSection}
          className="w-full"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Section
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

      {/* Preview Section - would be implemented with actual styling */}
      {showPreview && (
        <Card className="mt-6 p-4">
          <h2 className="text-lg font-medium mb-4">Preview</h2>
          <div className="border rounded p-4 bg-white">
            <p className="text-sm text-gray-500">Preview would be implemented here with actual layout matching the template.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DailyMentionsPage;
