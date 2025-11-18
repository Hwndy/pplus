import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Download, Eye, PlusCircle, Trash2, Copy, RefreshCcw, Filter, X, CalendarIcon, FileUp, Link, ArrowLeft } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/components/auth/AuthContext';

// Backend expects this structure for DailyMention
interface MentionDetail {
  headline: string;
  content: string;
  reporter: string | null;
  source: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  page: string | null;
  publication_date: string;
  urls: string[];
}

interface DailyMentionPayload {
  company_id: number;
  publication_id: number;
  date: string;
  analyst_id?: number;
  status: 'draft' | 'published' | 'archived';
  industry: MentionDetail[];
  competitors: MentionDetail[];
  subsidiaries: MentionDetail[];
  passive: MentionDetail[];
  advert: MentionDetail[];
  filename?: string | null;
  original_name?: string | null;
  file_path?: string | null;
  file_size?: number | null;
  mime_type?: string | null;
  file_type?: 'doc' | 'docx' | null;
}

interface SectionType {
  id: string;
  title: string;
  type: 'INDUSTRY' | 'COMPETITORS' | 'SUBSIDIARIES' | 'PASSIVE' | 'ADVERT' | 'OTHER';
  mentions: MediaMention[];
}

interface MediaMention {
  id: string;
  title: string;
  content: string;
  reporter: string;
  publication: string;
  publicationPage: string;
  publicationDate: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  links: { url: string }[];
}

interface DailyMediaReport {
  date: string;
  expectingPublications: string[];
  sections: SectionType[];
  footerNote: string;
  companyId?: string;
  publicationId?: string;
}

const createEmptyMention = (): MediaMention => ({
  id: `mention-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  title: '',
  content: '',
  reporter: '',
  publication: '',
  publicationPage: '',
  publicationDate: '',
  sentiment: 'neutral',
  links: [{ url: '' }],
});

const createEmptySection = (type: string = 'OTHER'): SectionType => ({
  id: `section-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  title: '',
  type: type as any,
  mentions: [createEmptyMention()],
});

const createEmptyReport = (): DailyMediaReport => ({
  date: new Date().toISOString().split('T')[0],
  expectingPublications: [],
  sections: [createEmptySection('INDUSTRY')],
  footerNote: 'P+ Measurement Services Daily Media Briefs cover all relevant news reports, features and photo stories in major Nigerian newspapers, magazines, online news sites & blogs.',
  companyId: '',
  publicationId: '',
});

const DailyMentionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isSessionValidated } = useAuth();
  const { toast } = useToast();

  // Session storage key for daily mentions form
  const sessionKey = 'daily_mentions_form_data';

  // Check for edit mode
  const isEditMode = location.state?.mentionData && location.state.mode === 'edit';
  const mentionData = location.state?.mentionData as DailyMentionPayload | null;

  // Initialize state with data from session storage or create empty report
  const getInitialReport = (): DailyMediaReport => {
    try {
      const savedData = sessionStorage.getItem(sessionKey);
      if (savedData && !isEditMode) {
        const parsedData = JSON.parse(savedData);
        return parsedData.report;
      }
    } catch (error) {
      console.error('Error loading saved daily mentions data:', error);
    }

    // For edit mode, map backend data to form structure
    if (isEditMode && mentionData) {
      const sections: SectionType[] = [];

      // Map industry to section
      if (mentionData.industry && mentionData.industry.length > 0) {
        const industrySection: SectionType = {
          id: 'industry',
          title: 'Industry',
          type: 'INDUSTRY',
          mentions: mentionData.industry.map((item) => ({
            id: `mention-${item.headline}-${Date.now()}`,
            title: item.headline,
            content: item.content,
            reporter: item.reporter || '',
            publication: item.source,
            publicationPage: item.page || '',
            publicationDate: format(new Date(item.publication_date), 'MMM d, yyyy'),
            sentiment: item.sentiment,
            links: item.urls.map((url) => ({ url })),
          })),
        };
        sections.push(industrySection);
      }

      // Map competitors to section
      if (mentionData.competitors && mentionData.competitors.length > 0) {
        const competitorsSection: SectionType = {
          id: 'competitors',
          title: 'Competitors',
          type: 'COMPETITORS',
          mentions: mentionData.competitors.map((item) => ({
            id: `mention-${item.headline}-${Date.now()}`,
            title: item.headline,
            content: item.content,
            reporter: item.reporter || '',
            publication: item.source,
            publicationPage: item.page || '',
            publicationDate: format(new Date(item.publication_date), 'MMM d, yyyy'),
            sentiment: item.sentiment,
            links: item.urls.map((url) => ({ url })),
          })),
        };
        sections.push(competitorsSection);
      }

      // Map subsidiaries to section
      if (mentionData.subsidiaries && mentionData.subsidiaries.length > 0) {
        const subsidiariesSection: SectionType = {
          id: 'subsidiaries',
          title: 'Subsidiaries',
          type: 'SUBSIDIARIES',
          mentions: mentionData.subsidiaries.map((item) => ({
            id: `mention-${item.headline}-${Date.now()}`,
            title: item.headline,
            content: item.content,
            reporter: item.reporter || '',
            publication: item.source,
            publicationPage: item.page || '',
            publicationDate: format(new Date(item.publication_date), 'MMM d, yyyy'),
            sentiment: item.sentiment,
            links: item.urls.map((url) => ({ url })),
          })),
        };
        sections.push(subsidiariesSection);
      }

      // Map passive to section
      if (mentionData.passive && mentionData.passive.length > 0) {
        const passiveSection: SectionType = {
          id: 'passive',
          title: 'Passive',
          type: 'PASSIVE',
          mentions: mentionData.passive.map((item) => ({
            id: `mention-${item.headline}-${Date.now()}`,
            title: item.headline,
            content: item.content,
            reporter: item.reporter || '',
            publication: item.source,
            publicationPage: item.page || '',
            publicationDate: format(new Date(item.publication_date), 'MMM d, yyyy'),
            sentiment: item.sentiment,
            links: item.urls.map((url) => ({ url })),
          })),
        };
        sections.push(passiveSection);
      }

      // Map advert to section
      if (mentionData.advert && mentionData.advert.length > 0) {
        const advertSection: SectionType = {
          id: 'advert',
          title: 'Advert',
          type: 'ADVERT',
          mentions: mentionData.advert.map((item) => ({
            id: `mention-${item.headline}-${Date.now()}`,
            title: item.headline,
            content: item.content,
            reporter: item.reporter || '',
            publication: item.source,
            publicationPage: item.page || '',
            publicationDate: format(new Date(item.publication_date), 'MMM d, yyyy'),
            sentiment: item.sentiment,
            links: item.urls.map((url) => ({ url })),
          })),
        };
        sections.push(advertSection);
      }

      // Add empty sections for missing types
      const allTypes = ['INDUSTRY', 'COMPETITORS', 'SUBSIDIARIES', 'PASSIVE', 'ADVERT'];
      allTypes.forEach((type) => {
        if (!sections.some((s) => s.type === type)) {
          sections.push(createEmptySection(type));
        }
      });

      return {
        date: format(new Date(mentionData.date), 'MMM d, yyyy'),
        expectingPublications: [],
        sections,
        footerNote: 'P+ Measurement Services Daily Media Briefs cover all relevant news reports, features and photo stories in major Nigerian newspapers, magazines, online news sites & blogs.',
        companyId: mentionData.company_id?.toString(),
        publicationId: mentionData.publication_id?.toString(),
      };
    }

    return createEmptyReport();
  };

  const [report, setReport] = useState<DailyMediaReport>(getInitialReport());
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedMentions, setExpandedMentions] = useState<Record<string, boolean>>({});
  const [showPreview, setShowPreview] = useState(false);
  const [headerColor, setHeaderColor] = useState("#0066cc");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);

  const BASE_URL = 'https://pplus-07cr.onrender.com/api';

  // Axios interceptor for Bearer token
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  // Fetch companies and publications
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/companies`);
        setCompanies(response.data.data || []);
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch companies',
          variant: 'destructive',
        });
      }
    };

    const fetchPublications = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/publications`);
        setPublications(response.data.data || []);
      } catch (error) {
        console.error('Error fetching publications:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch publications',
          variant: 'destructive',
        });
      }
    };

    if (isSessionValidated) {
      fetchCompanies();
      fetchPublications();
    } else {
      toast({
        title: 'Session not validated',
        description: 'Please log in to continue.',
        variant: 'destructive',
      });
      navigate('/login');
    }
  }, [isSessionValidated, navigate, toast]);

  // Load expanded sections and mentions from session storage
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem(sessionKey);
      if (savedData && !isEditMode) {
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
          title: 'Data Restored',
          description: 'Your previously entered data has been restored.',
        });
      }
    } catch (error) {
      console.error('Error loading saved daily mentions data:', error);
    }
  }, [toast, isEditMode]);

  // Save data to session storage
  useEffect(() => {
    const saveToSessionStorage = () => {
      const dataToSave = {
        report,
        expandedSections,
        expandedMentions,
        headerColor,
        logoPreview,
        lastUpdated: new Date().toISOString(),
      };
      sessionStorage.setItem(sessionKey, JSON.stringify(dataToSave));
    };

    saveToSessionStorage();
    const saveInterval = setInterval(saveToSessionStorage, 10000);
    return () => clearInterval(saveInterval);
  }, [report, expandedSections, expandedMentions, headerColor, logoPreview]);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [publicationFilter, setPublicationFilter] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('');

  // Extract unique publications and companies/brands from the report
  const uniquePublications = useMemo(() => {
    const publications = new Set<string>();
    report.sections.forEach((section) => {
      section.mentions.forEach((mention) => {
        if (mention.publication) {
          publications.add(mention.publication);
        }
      });
    });
    return Array.from(publications).sort();
  }, [report.sections]);

  const uniqueCompanies = useMemo(() => {
    return Array.from(new Set(report.sections.map((section) => section.title))).filter(Boolean).sort();
  }, [report.sections]);

  // Apply filters to get filtered sections
  const filteredSections = useMemo(() => {
    if (!dateFilter && !publicationFilter && !companyFilter) {
      return report.sections;
    }

    const sectionsCopy = JSON.parse(JSON.stringify(report.sections)) as SectionType[];

    return sectionsCopy.filter((section) => {
      if (companyFilter && !section.title.includes(companyFilter)) {
        return false;
      }

      const filteredMentions = section.mentions.filter((mention) => {
        if (publicationFilter && mention.publication !== publicationFilter) {
          return false;
        }

        if (dateFilter && mention.publicationDate) {
          if (!mention.publicationDate.includes(format(dateFilter, 'PPP'))) {
            return false;
          }
        }

        return true;
      });

      if ((publicationFilter || dateFilter) && filteredMentions.length === 0) {
        return false;
      }

      section.mentions = filteredMentions;
      return true;
    });
  }, [report.sections, companyFilter, publicationFilter, dateFilter]);

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  // Toggle mention expansion
  const toggleMention = (mentionId: string) => {
    setExpandedMentions((prev) => ({
      ...prev,
      [mentionId]: !prev[mentionId],
    }));
  };

  // Add a new section
  const addSection = (type: SectionType['type']) => {
    const newSection = createEmptySection(type);
    setReport((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
    setExpandedSections((prev) => ({
      ...prev,
      [newSection.id]: true,
    }));
  };

  // Add a new mention to a section
  const addMention = (sectionId: string) => {
    const newMention = createEmptyMention();
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? { ...section, mentions: [...section.mentions, newMention] }
          : section
      ),
    }));
    setExpandedMentions((prev) => ({
      ...prev,
      [newMention.id]: true,
    }));
  };

  // Clone an existing mention
  const cloneMention = (sectionId: string, mentionId: string) => {
    const sectionIndex = report.sections.findIndex((s) => s.id === sectionId);
    if (sectionIndex === -1) return;

    const mentionIndex = report.sections[sectionIndex].mentions.findIndex((m) => m.id === mentionId);
    if (mentionIndex === -1) return;

    const mentionToClone = { ...report.sections[sectionIndex].mentions[mentionIndex] };
    const newMention: MediaMention = {
      ...mentionToClone,
      id: `mention-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };

    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section, idx) =>
        idx === sectionIndex
          ? { ...section, mentions: [...section.mentions, newMention] }
          : section
      ),
    }));

    setExpandedMentions((prev) => ({
      ...prev,
      [newMention.id]: true,
    }));
  };

  // Remove a section
  const removeSection = (sectionId: string) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.filter((section) => section.id !== sectionId),
    }));
  };

  // Remove a mention
  const removeMention = (sectionId: string, mentionId: string) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? { ...section, mentions: section.mentions.filter((mention) => mention.id !== mentionId) }
          : section
      ),
    }));
  };

  // Add a new link to a mention
  const addLink = (sectionId: string, mentionId: string) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              mentions: section.mentions.map((mention) =>
                mention.id === mentionId
                  ? { ...mention, links: [...mention.links, { url: '' }] }
                  : mention
              ),
            }
          : section
      ),
    }));
  };

  // Remove a link from a mention
  const removeLink = (sectionId: string, mentionId: string, linkIndex: number) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              mentions: section.mentions.map((mention) =>
                mention.id === mentionId
                  ? { ...mention, links: mention.links.filter((_, idx) => idx !== linkIndex) }
                  : mention
              ),
            }
          : section
      ),
    }));
  };

  // Update mention field
  const updateMention = (sectionId: string, mentionId: string, field: keyof MediaMention, value: string) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              mentions: section.mentions.map((mention) =>
                mention.id === mentionId ? { ...mention, [field]: value } : mention
              ),
            }
          : section
      ),
    }));
  };

  // Update link URL
  const updateLink = (sectionId: string, mentionId: string, linkIndex: number, url: string) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              mentions: section.mentions.map((mention) =>
                mention.id === mentionId
                  ? {
                      ...mention,
                      links: mention.links.map((link, idx) => (idx === linkIndex ? { url } : link)),
                    }
                  : mention
              ),
            }
          : section
      ),
    }));
  };

  // Update section title
  const updateSectionTitle = (sectionId: string, title: string) => {
    setReport((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId ? { ...section, title } : section
      ),
    }));
  };

  // Handle logo upload
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        toast({
          title: 'Invalid File Type',
          description: 'Only PNG and JPEG images are allowed.',
          variant: 'destructive',
        });
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle header color change
  const handleHeaderColorChange = (color: string) => {
    setHeaderColor(color);
  };

  // Handle form submission
  const handleSubmit = async () => {
    try {
      if (!report.companyId || !report.publicationId) {
        toast({
          title: 'Error',
          description: 'Please select a company and publication.',
          variant: 'destructive',
        });
        return;
      }

      // Map form data to backend payload
      const payload: DailyMentionPayload = {
        company_id: parseInt(report.companyId),
        publication_id: parseInt(report.publicationId),
        date: new Date(report.date).toISOString(),
        analyst_id: user?.role === 'Analyst' ? user.id : undefined,
        status: 'draft',
        industry: [],
        competitors: [],
        subsidiaries: [],
        passive: [],
        advert: [],
      };

      // Map sections to payload arrays
      report.sections.forEach((section) => {
        const mentionDetails = section.mentions
          .filter((mention) => mention.title.trim() || mention.content.trim())
          .map((mention): MentionDetail => ({
            headline: mention.title,
            content: mention.content,
            reporter: mention.reporter || null,
            source: mention.publication,
            sentiment: mention.sentiment,
            page: mention.publicationPage || null,
            publication_date: new Date(mention.publicationDate).toISOString(),
            urls: mention.links.map((link) => link.url).filter((url) => url.trim()),
          }));

        switch (section.type) {
          case 'INDUSTRY':
            payload.industry = mentionDetails;
            break;
          case 'COMPETITORS':
            payload.competitors = mentionDetails;
            break;
          case 'SUBSIDIARIES':
            payload.subsidiaries = mentionDetails;
            break;
          case 'PASSIVE':
            payload.passive = mentionDetails;
            break;
          case 'ADVERT':
            payload.advert = mentionDetails;
            break;
          default:
            break;
        }
      });

      // Handle file upload
      if (logoFile) {
        const formData = new FormData();
        formData.append('file', logoFile);
        const uploadResponse = await axios.post(`${BASE_URL}/daily-mentions/batch-upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        payload.filename = uploadResponse.data.data.filename;
        payload.original_name = uploadResponse.data.data.original_name;
        payload.file_path = uploadResponse.data.data.file_path;
        payload.file_size = uploadResponse.data.data.file_size;
        payload.mime_type = uploadResponse.data.data.mime_type;
        payload.file_type = uploadResponse.data.data.file_type;
      }

      const response = isEditMode
        ? await axios.put(`${BASE_URL}/daily-mentions/update/${mentionData?.id}`, payload)
        : await axios.post(`${BASE_URL}/daily-mentions/create`, payload);

      toast({
        title: 'Success',
        description: isEditMode ? 'Daily mention updated successfully!' : 'Daily mention created successfully!',
      });

      sessionStorage.removeItem(sessionKey);
      navigate('/dashboard/daily-mentions');
    } catch (error: any) {
      console.error('Error submitting daily mention:', error.response?.data || error.message);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to submit daily mention',
        variant: 'destructive',
      });
    }
  };

  // Handle preview
  const generatePreview = () => {
    setShowPreview(true);
  };

  // Handle cancel
  const handleCancel = () => {
    sessionStorage.removeItem(sessionKey);
    navigate('/dashboard/daily-mentions');
  };

  // Handle download PDF (placeholder)
  const downloadPDF = () => {
    toast({
      title: 'PDF Generation',
      description: 'PDF download functionality would be implemented here.',
    });
  };

  // Toggle filters
  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Apply filters
  const applyFilters = () => {
    toast({
      title: 'Filters Applied',
      description: 'Filter functionality would be implemented here.',
    });
    setShowFilters(false);
  };

  // Clear filters
  const clearFilters = () => {
    setDateFilter(undefined);
    setPublicationFilter('');
    setCompanyFilter('');
    toast({
      title: 'Filters Cleared',
      description: 'All filters have been cleared.',
    });
    setShowFilters(false);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={handleCancel} className="h-10 w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">
            {isEditMode ? 'Edit Daily Mention' : 'Create Daily Mention'}
          </h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={toggleFilters}>
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" onClick={generatePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={downloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={handleSubmit}>
            <Send className="h-4 w-4 mr-2" />
            {isEditMode ? 'Update' : 'Submit'}
          </Button>
        </div>
      </div>

      {/* Filters Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Daily Mentions</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Company/Brand</Label>
              <Select value={companyFilter} onValueChange={setCompanyFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueCompanies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Publication</Label>
              <Select value={publicationFilter} onValueChange={setPublicationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Select publication" />
                </SelectTrigger>
                <SelectContent>
                  {uniquePublications.map((pub) => (
                    <SelectItem key={pub} value={pub}>
                      {pub}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dateFilter} onSelect={setDateFilter} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
              <Button onClick={applyFilters}>
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Content */}
      <div className="space-y-6">
        {/* Company and Publication Selection */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-id">Company</Label>
                <Select
                  value={report.companyId}
                  onValueChange={(value) => setReport((prev) => ({ ...prev, companyId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="publication-id">Publication</Label>
                <Select
                  value={report.publicationId}
                  onValueChange={(value) => setReport((prev) => ({ ...prev, publicationId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select publication" />
                  </SelectTrigger>
                  <SelectContent>
                    {publications.map((pub) => (
                      <SelectItem key={pub.id} value={pub.id.toString()}>
                        {pub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header Color Picker */}
        <Card>
          <CardContent className="p-4">
            <Label className="mb-2 block">Header Color</Label>
            <Input
              type="color"
              value={headerColor}
              onChange={(e) => handleHeaderColorChange(e.target.value)}
              className="h-12 w-32"
            />
          </CardContent>
        </Card>

        {/* Logo Upload */}
        <Card>
          <CardContent className="p-4">
            <Label className="mb-2 block">Company Logo</Label>
            <div className="space-y-2">
              <Input
                id="logo-upload"
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleLogoChange}
                className="w-full"
              />
              {logoPreview && (
                <div className="flex items-center space-x-2">
                  <img src={logoPreview} alt="Logo preview" className="h-16 w-16 rounded" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setLogoPreview(null);
                      setLogoFile(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Date and Expecting Publications */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-date">Report Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {report.date ? format(new Date(report.date), 'PPP') : <span className="text-muted-foreground">Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={report.date ? new Date(report.date) : undefined}
                      onSelect={(date) => setReport((prev) => ({ ...prev, date: date ? date.toISOString().split('T')[0] : '' }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="expecting-publications">Expecting Publications</Label>
                <Input
                  id="expecting-publications"
                  value={report.expectingPublications.join(', ')}
                  onChange={(e) => setReport((prev) => ({ ...prev, expectingPublications: e.target.value.split(',').map((s) => s.trim()).filter((s) => s) }))}
                  placeholder="e.g., The Punch, Vanguard, ThisDay"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sections */}
        <div className="space-y-4">
          {filteredSections.map((section) => (
            <Card key={section.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleSection(section.id)}>
                      {expandedSections[section.id] ? '−' : '+'}
                    </Button>
                    <Input
                      value={section.title || section.type}
                      onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                      placeholder="Section Title"
                      className="w-64"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cloneMention(section.id, section.mentions[0]?.id || '')}
                      disabled={!section.mentions[0]}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeSection(section.id)}
                      disabled={report.sections.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {expandedSections[section.id] && (
                  <div className="space-y-4">
                    {section.mentions.map((mention) => (
                      <Card key={mention.id} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => toggleMention(mention.id)}>
                              {expandedMentions[mention.id] ? '−' : '+'}
                            </Button>
                            <Label className="font-semibold">{mention.title || 'News Item'}</Label>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cloneMention(section.id, mention.id)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeMention(section.id, mention.id)}
                              disabled={section.mentions.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {expandedMentions[mention.id] && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`headline-${mention.id}`}>Headline</Label>
                                <Input
                                  id={`headline-${mention.id}`}
                                  value={mention.title}
                                  onChange={(e) => updateMention(section.id, mention.id, 'title', e.target.value)}
                                  placeholder="Enter headline"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`publication-${mention.id}`}>Publication</Label>
                                <Input
                                  id={`publication-${mention.id}`}
                                  value={mention.publication}
                                  onChange={(e) => updateMention(section.id, mention.id, 'publication', e.target.value)}
                                  placeholder="e.g., The Punch"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`reporter-${mention.id}`}>Reporter</Label>
                                <Input
                                  id={`reporter-${mention.id}`}
                                  value={mention.reporter}
                                  onChange={(e) => updateMention(section.id, mention.id, 'reporter', e.target.value)}
                                  placeholder="Enter reporter name"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`sentiment-${mention.id}`}>Sentiment</Label>
                                <Select
                                  value={mention.sentiment}
                                  onValueChange={(value) => updateMention(section.id, mention.id, 'sentiment', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select sentiment" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="positive">Positive</SelectItem>
                                    <SelectItem value="negative">Negative</SelectItem>
                                    <SelectItem value="neutral">Neutral</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`page-${mention.id}`}>Page Number</Label>
                                <Input
                                  id={`page-${mention.id}`}
                                  value={mention.publicationPage}
                                  onChange={(e) => updateMention(section.id, mention.id, 'publicationPage', e.target.value)}
                                  placeholder="Page Number (e.g., Page 39)"
                                />
                              </div>
                              <div>
                                <Label htmlFor={`pub-date-${mention.id}`}>Publication Date</Label>
                                <Input
                                  id={`pub-date-${mention.id}`}
                                  value={mention.publicationDate}
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
                                    placeholder="URL (e.g., https://punchng.com)"
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
                            <div>
                              <Label htmlFor={`content-${mention.id}`}>Content</Label>
                              <Textarea
                                id={`content-${mention.id}`}
                                value={mention.content}
                                onChange={(e) => updateMention(section.id, mention.id, 'content', e.target.value)}
                                placeholder="Enter content summary"
                                rows={4}
                              />
                            </div>
                          </div>
                        )}
                      </Card>
                    ))}
                    <Button
                      variant="outline"
                      onClick={() => addMention(section.id)}
                      className="w-full mt-4"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add News Item
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Section Buttons */}
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
            onClick={() => addSection('PASSIVE')}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Passive Section
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
            onClick={() => addSection('OTHER')}
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Other Section
          </Button>
        </div>

        {/* Footer Note */}
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Label htmlFor="footer-note">Footer Note</Label>
              <Textarea
                id="footer-note"
                value={report.footerNote}
                onChange={(e) => setReport((prev) => ({ ...prev, footerNote: e.target.value }))}
                placeholder="Enter footer note"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview Section */}
        {showPreview && (
          <Card className="mt-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Preview</h2>
                <Button variant="ghost" onClick={() => setShowPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
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

                  {/* Date and Intro */}
                  <div className="p-4 bg-white">
                    <p className="font-semibold">{format(new Date(report.date), 'MMM d, yyyy')}</p>
                    <p className="text-sm mt-2">
                      This daily digest provides a summary of discovered news material, and other
                      resources related to your search terms, with a focus on coverage featured in
                      National/Regional Print Publications and Online media. Alert covers online media for
                      keywords from the first edition on the day of the media alert (weekly).
                    </p>
                  </div>

                  {/* Sections */}
                  {filteredSections.map((section) => (
                    <div key={section.id} className="mt-2">
                      <div style={{ backgroundColor: headerColor }} className="p-2">
                        <h2 className="text-white font-bold">{section.title || section.type}</h2>
                      </div>
                      <div className="p-4 bg-white">
                        {section.mentions.map((mention) => (
                          <div key={mention.id} className="mb-4">
                            <p className="font-bold">{mention.title || 'News headline'}: - </p>
                            <p className="text-sm">{mention.content || 'News content will appear here...'}</p>
                            {mention.links.some((link) => link.url) && (
                              <p className="text-sm mt-1">
                                {mention.links.map((link, lIndex) =>
                                  link.url ? (
                                    <span key={lIndex}>
                                      <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 underline"
                                      >
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
                              {mention.publicationPage && (
                                <>
                                  <br />
                                  <span className="font-semibold">Page:</span> {mention.publicationPage}
                                </>
                              )}
                              {mention.publicationDate && (
                                <>
                                  <br />
                                  <span className="font-semibold">Date:</span> {mention.publicationDate}
                                </>
                              )}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Expecting Publications */}
                  {report.expectingPublications && report.expectingPublications.length > 0 && (
                    <div className="p-4 bg-gray-100">
                      <p className="font-semibold">Expecting: {report.expectingPublications.join(', ')}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="p-4 bg-white text-xs text-center">
                    <p>{report.footerNote}</p>
                    <p className="mt-1 text-gray-500">(Clippings of specific stories/reports are available on request)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
export default DailyMentionsPage;
