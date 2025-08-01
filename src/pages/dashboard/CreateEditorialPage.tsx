
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Copy, Save, Send, Loader2 } from 'lucide-react';
import { useCreateEditorial, useUpdateEditorial, useCompanies, usePublications } from '@/hooks/useApi';
import { Company, Publication } from '@/services/apiService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
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
import { Calendar } from '@/components/ui/calendar';

interface Editorial {
  id: number;
  serialNumber?: number; // Auto-generated, not in form
  date: string;
  company: string;
  industry: string;
  brand: string;
  subIndustry: string; // Updated from subSector
  source: string; // Updated from publication
  placement: string;
  title: string;
  printWebClips: string; // New field
  reporter: string;
  country: string;
  language: string;
  spokesperson: string;
  ceoMediaPresence: string; // New field
  ceoThoughtLeadership: string; // New field
  activity: string;
  circulation?: number;
  audienceReach?: number;
  mediaType: string;
  onlineChannel?: string;
  sentiment: string;
  sentimentClassification: string; // New field
  sentimentScore: number; // Updated from mediaSentimentIndex
  advertSpend?: number;
  pageSize?: string;
  status?: string; // DRAFT, PENDING, APPROVED, REJECTED
  analystNote?: string;
  supervisorNote?: string;
  adminNote?: string;
}

const industries = [
  'Agriculture',
  'Financial Services',
  'Real Estate',
  'Transportation',
  'Tobacco',
  'Non-Governmental Organization',
  'Online Streaming Platforms'
];

const subIndustries = {
  'Financial Services': [
    'Commercial Banks', 'Microfinance Banks', 'Investment Banks', 'Insurance Companies', 'Asset Management',
    'Financial Technology (Fintech)', 'Pension Fund Administrators', 'Mortgage Banks', 'Stockbroking Firms'
  ],
  'Agriculture': [
    'Crop Production', 'Livestock', 'Fisheries', 'Forestry', 'Agricultural Technology'
  ],
  'Real Estate': [
    'Residential', 'Commercial', 'Industrial', 'Property Management', 'Real Estate Investment'
  ],
  'Transportation': [
    'Aviation', 'Maritime', 'Road Transport', 'Rail Transport', 'Logistics'
  ],
  'Tobacco': [
    'Cigarettes', 'Cigars', 'Smokeless Tobacco', 'E-cigarettes'
  ],
  'Non-Governmental Organization': [
    'Healthcare NGO', 'Education NGO', 'Environmental NGO', 'Human Rights NGO', 'Development NGO'
  ],
  'Online Streaming Platforms': [
    'Video Streaming', 'Music Streaming', 'Gaming Streaming', 'Live Streaming'
  ]
};

const mediaTypes = ['Print', 'Online', 'TV', 'Radio', 'Social Media'];
const companies = ['Stanbic IBTC Holdings', 'MTN Nigeria', 'Dangote Group', 'Access Bank', 'Zenith Bank'];
const brands = [
  'Stanbic IBTC Bank',
  'Stanbic IBTC Capital',
  'Stanbic IBTC Insurance Limited',
  'Stanbic IBTC Asset Management',
  'Stanbic IBTC Pension',
  'Stanbic IBTC Holdings',
];
const sources = ['ThisDay', 'The Punch', 'Vanguard', 'BusinessDay', 'Guardian', 'Channels TV', 'BBC', 'CNN'];
const placements = ['Headline', 'Photo', 'Feature Story', 'Opinion', 'Editorial', 'News Brief'];
const countries = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Morocco'];
const activities = ['Innovation', 'Corporate', 'Partnership', 'CSR/CSI', 'Sponsorship', 'Awards', 'Product Launch', 'Merger & Acquisition'];
const sentiments = ['Positive', 'Negative', 'Neutral'];
const sentimentClassifications = ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative'];
const statuses = ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED'];
const reporters = ['Eniola Olatunji', 'Joseph Inokotong', 'Michael Olaitan', 'Adebayo Olufemi', 'Funmi Johnson'];
const spokespersons = [
  'Wole Adeniyi (CEO, Stanbic IBTC Bank)',
  'Olumide Oyetan (CEO, Stanbic IBTC Pension)',
  'Oladele Sotubo (CEO, Stanbic IBTC Asset Management)',
  'Akinjide Orimolade (CEO, Stanbic IBTC Insurance)',
  'Demola Sogunle (CEO, Stanbic IBTC Holdings)',
];
const ceoMediaPresenceOptions = ['High', 'Medium', 'Low', 'None'];
const ceoThoughtLeadershipOptions = ['Strong', 'Moderate', 'Weak', 'None'];
const printWebClipsOptions = ['Print Only', 'Web Only', 'Both Print and Web', 'Social Media'];
const onlineChannels = ['Website', 'Social Media', 'Mobile App', 'Email Newsletter', 'Podcast'];
const pageSizes = ['Full Page', 'Half Page', 'Quarter Page', 'Banner', 'Small Ad'];

const CreateEditorialPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!location.state?.editorialData;

  // API hooks
  const createEditorial = useCreateEditorial();
  const updateEditorial = useUpdateEditorial();
  const { data: companiesResponse } = useCompanies({ limit: 100 });
  const { data: publicationsResponse } = usePublications({ limit: 100 });

  // Extract real data from API
  const apiCompanies = companiesResponse?.data || [];
  const apiPublications = publicationsResponse?.data || [];

  // Detect user role - this would normally come from authentication
  // For demo purposes, we'll use a hardcoded role
  const userRole = 'analyst'; // Options: 'analyst', 'supervisor', 'admin'

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionType, setSubmissionType] = useState<'draft' | 'send'>('draft');

  // Default initial form data
  const defaultFormData: Editorial = {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    company: '',
    industry: 'Financial Services',
    brand: '',
    subIndustry: '',
    source: '',
    placement: '',
    title: '',
    printWebClips: '',
    reporter: '',
    country: 'Nigeria',
    language: 'English',
    spokesperson: '',
    ceoMediaPresence: '',
    ceoThoughtLeadership: '',
    activity: '',
    circulation: 0,
    audienceReach: 0,
    mediaType: 'Print',
    onlineChannel: '',
    sentiment: '',
    sentimentClassification: '',
    sentimentScore: 0,
    advertSpend: 0,
    pageSize: '',
    status: 'DRAFT',
    analystNote: '',
    supervisorNote: '',
    adminNote: '',
  };

  // Generate a unique session key for this form
  const getSessionKey = () => {
    // If editing, use the editorial ID to ensure we don't mix up different editorials
    if (location.state?.editorialData) {
      return `editorial_form_${location.state.editorialData.id}`;
    }
    // For new editorials, use a consistent key
    return 'editorial_form_new';
  };

  const sessionKey = getSessionKey();

  // Initialize form data from location state, session storage, or default
  const getInitialFormData = (): Editorial => {
    // If we're in edit mode, use the provided editorial data
    if (location.state?.editorialData) {
      return location.state.editorialData;
    }

    // Try to get data from session storage
    const savedData = sessionStorage.getItem(sessionKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // If we have saved editorials, return them
        if (parsedData.editorials && parsedData.editorials.length > 0) {
          return parsedData.editorials[0];
        }
      } catch (error) {
        console.error('Error parsing saved editorial data:', error);
      }
    }

    // Fall back to default data
    return defaultFormData;
  };

  const initialFormData = getInitialFormData();

  // Initialize state
  const [editorials, setEditorials] = useState<Editorial[]>([initialFormData]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dates, setDates] = useState<(Date | undefined)[]>(
    [initialFormData.date ? new Date(initialFormData.date) : new Date()]
  );

  // Load saved data from session storage
  useEffect(() => {
    const savedData = sessionStorage.getItem(sessionKey);
    if (savedData && !location.state?.editorialData) {
      try {
        const parsedData = JSON.parse(savedData);
        if (parsedData.editorials && parsedData.editorials.length > 0) {
          setEditorials(parsedData.editorials);

          // Reconstruct dates array from editorials
          const newDates = parsedData.editorials.map((editorial: Editorial) =>
            editorial.date ? new Date(editorial.date) : undefined
          );
          setDates(newDates);

          // Set active index (default to 0 if not saved)
          if (parsedData.activeIndex !== undefined) {
            setActiveIndex(parsedData.activeIndex);
          }

          toast({
            title: "Data Restored",
            description: "Your previously entered data has been restored."
          });
        }
      } catch (error) {
        console.error('Error loading saved editorial data:', error);
      }
    }
  }, [sessionKey, location.state, toast]);

  // Save data to session storage whenever it changes
  useEffect(() => {
    // Save current state to session storage
    const saveToSessionStorage = () => {
      const dataToSave = {
        editorials,
        activeIndex,
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
  }, [editorials, activeIndex, sessionKey]);

  // Handle changes to form inputs for the active editorial
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    const updatedEditorials = [...editorials];
    updatedEditorials[activeIndex] = {
      ...updatedEditorials[activeIndex],
      [name]: value
    };

    setEditorials(updatedEditorials);

    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle select changes for the active editorial
  const handleSelectChange = (name: string, value: string) => {
    const updatedEditorials = [...editorials];
    updatedEditorials[activeIndex] = {
      ...updatedEditorials[activeIndex],
      [name]: value
    };

    setEditorials(updatedEditorials);

    // Clear error when field is modified
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Handle date change for the active editorial
  const handleDateChange = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const updatedDates = [...dates];
      updatedDates[activeIndex] = selectedDate;
      setDates(updatedDates);

      const updatedEditorials = [...editorials];
      updatedEditorials[activeIndex] = {
        ...updatedEditorials[activeIndex],
        date: selectedDate.toISOString().split('T')[0]
      };

      setEditorials(updatedEditorials);
    }
  };

  // Add a new editorial
  const addEditorial = () => {
    const newId = Date.now();
    setEditorials([...editorials, { ...initialFormData, id: newId }]);
    setDates([...dates, new Date()]);
    setActiveIndex(editorials.length);
  };

  // Clone the current editorial
  const cloneEditorial = () => {
    const currentEditorial = editorials[activeIndex];
    const clonedEditorial = { ...currentEditorial, id: Date.now() };

    setEditorials([...editorials, clonedEditorial]);
    setDates([...dates, dates[activeIndex] ? new Date(dates[activeIndex]!) : new Date()]);
    setActiveIndex(editorials.length);
  };

  // Switch to a different editorial
  const switchEditorial = (index: number) => {
    setActiveIndex(index);
  };

  // Form validation
  const validateForm = (isDraft: boolean = false) => {
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    // Required fields - less strict for drafts
    const requiredFields = isDraft
      ? ['title', 'company', 'date'] // Minimal requirements for draft
      : ['title', 'company', 'brand', 'source', 'date', 'industry', 'country', 'language', 'mediaType'];

    requiredFields.forEach(field => {
      const value = editorials[activeIndex][field as keyof Editorial];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  // Handle form submission
  const handleSubmit = async (type: 'draft' | 'send') => {
    const isDraft = type === 'draft';

    if (!validateForm(isDraft)) {
      toast({
        title: "Validation Error",
        description: isDraft
          ? "Please fill in the basic required fields to save as draft."
          : "Please fill in all required fields to send for approval.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    setSubmissionType(type);

    try {
      // Prepare editorial data for API
      const editorialData = {
        ...editorials[activeIndex],
        status: isDraft ? 'DRAFT' : 'PENDING',
        // Map form fields to API expected fields
        subIndustry: editorials[activeIndex].subIndustry,
        source: editorials[activeIndex].source,
        printWebClips: editorials[activeIndex].printWebClips,
        ceoMediaPresence: editorials[activeIndex].ceoMediaPresence,
        ceoThoughtLeadership: editorials[activeIndex].ceoThoughtLeadership,
        sentimentClassification: editorials[activeIndex].sentimentClassification,
        sentimentScore: editorials[activeIndex].sentimentScore,
      };

      let result;
      if (isEditMode && location.state?.editorialData?.id) {
        result = await updateEditorial.mutate({
          id: location.state.editorialData.id,
          data: editorialData
        });
      } else {
        result = await createEditorial.mutate(editorialData);
      }

      // Clear session storage after successful submission
      sessionStorage.removeItem(sessionKey);

      navigate('/dashboard/editorial', {
        state: {
          savedEditorials: [result],
          isEditMode
        }
      });

      toast.success(
        isDraft
          ? (isEditMode ? "Editorial draft updated successfully" : "Editorial saved as draft")
          : (isEditMode ? "Editorial updated and sent for approval" : "Editorial sent for approval")
      );

    } catch (error) {
      console.error('Error saving editorial:', error);
      toast.error(
        isDraft
          ? "Failed to save draft"
          : "Failed to send for approval"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Cancel and go back
  const handleCancel = () => {
    // Check if there are unsaved changes by comparing with the initial data
    const hasChanges = JSON.stringify(editorials) !== JSON.stringify([initialFormData]);

    if (hasChanges) {
      // Show confirmation dialog
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        // User confirmed, navigate away
        navigate('/dashboard/editorial');
      }
      // If user cancels, stay on the page
    } else {
      // No changes, navigate away directly
      navigate('/dashboard/editorial');
    }
  };

  // Determine if a field should be read-only based on user role
  const isFieldReadOnly = (fieldName: string): boolean => {
    if (fieldName === 'analystNote' && userRole !== 'analyst') {
      return true;
    }
    if (fieldName === 'supervisorNote' && userRole !== 'supervisor') {
      return true;
    }
    if (fieldName === 'adminNote' && userRole !== 'admin') {
      return true;
    }
    return false;
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? 'Edit Editorial' : 'Create Editorial'}
        </h1>
        <div className="flex space-x-2">
          <Button
            onClick={cloneEditorial}
            variant="outline"
            className="flex items-center gap-1"
          >
            <Copy className="h-4 w-4" />
            Clone
          </Button>
          <Button
            onClick={addEditorial}
            variant="outline"
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            New
          </Button>
        </div>
      </div>

      {/* Editorial tabs */}
      {editorials.length > 1 && (
        <div className="flex overflow-x-auto space-x-2 mb-4 pb-2">
          {editorials.map((editorial, index) => (
            <Button
              key={editorial.id}
              variant={activeIndex === index ? "default" : "outline"}
              className="whitespace-nowrap"
              onClick={() => switchEditorial(index)}
            >
              Editorial {index + 1}
            </Button>
          ))}
        </div>
      )}

      <form className="w-full">
        <Card className="w-full">
          <CardContent className="p-6 w-full">
            {/* First row - Date, Company, Industry, Brand */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dates[activeIndex] && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dates[activeIndex] ? format(dates[activeIndex]!, "MM/dd/yyyy") : <span>Select date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dates[activeIndex]}
                      onSelect={handleDateChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
              </div>

              <div>
                <Label htmlFor="company">Company <span className="text-red-500">*</span></Label>
                <Select
                  value={editorials[activeIndex].company}
                  onValueChange={(value) => handleSelectChange('company', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(apiCompanies) && apiCompanies.map((company: Company) => (
                      <SelectItem key={company.id} value={company.name}>
                        {company.name}
                      </SelectItem>
                    ))}
                    {companies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
              </div>

              <div>
                <Label htmlFor="industry">Industry <span className="text-red-500">*</span></Label>
                <Select
                  value={editorials[activeIndex].industry}
                  onValueChange={(value) => handleSelectChange('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && <p className="text-red-500 text-sm">{errors.industry}</p>}
              </div>

              <div>
                <Label htmlFor="brand">Brand <span className="text-red-500">*</span></Label>
                <Select
                  value={editorials[activeIndex].brand}
                  onValueChange={(value) => handleSelectChange('brand', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand} value={brand}>
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
              </div>
            </div>

            {/* Second row - Sub-Industry, Source, Placement, Title */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <Label htmlFor="subIndustry">Sub-Industry</Label>
                <Select
                  value={editorials[activeIndex].subIndustry}
                  onValueChange={(value) => handleSelectChange('subIndustry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {(subIndustries[editorials[activeIndex].industry as keyof typeof subIndustries] || []).map((subIndustry) => (
                      <SelectItem key={subIndustry} value={subIndustry}>
                        {subIndustry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="source">Source <span className="text-red-500">*</span></Label>
                <Select
                  value={editorials[activeIndex].source}
                  onValueChange={(value) => handleSelectChange('source', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {apiPublications.map((publication: Publication) => (
                      <SelectItem key={publication.id} value={publication.name}>
                        {publication.name}
                      </SelectItem>
                    ))}
                    {sources.map((source) => (
                      <SelectItem key={source} value={source}>
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.source && <p className="text-red-500 text-sm">{errors.source}</p>}
              </div>

              <div>
                <Label htmlFor="placement">Placement</Label>
                <Select
                  value={editorials[activeIndex].placement}
                  onValueChange={(value) => handleSelectChange('placement', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent>
                    {placements.map((placement) => (
                      <SelectItem key={placement} value={placement}>
                        {placement}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                <Input
                  id="title"
                  name="title"
                  value={editorials[activeIndex].title}
                  onChange={handleChange}
                  className={errors.title ? "border-red-500" : ""}
                  placeholder="Enter article title"
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
              </div>
            </div>

            {/* Third row - Print/Web Clips, Reporter, Country, Language */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <Label htmlFor="printWebClips">Print/Web Clips</Label>
                <Select
                  value={editorials[activeIndex].printWebClips}
                  onValueChange={(value) => handleSelectChange('printWebClips', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {printWebClipsOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reporter">Reporter</Label>
                <Select
                  value={editorials[activeIndex].reporter}
                  onValueChange={(value) => handleSelectChange('reporter', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reporter" />
                  </SelectTrigger>
                  <SelectContent>
                    {reporters.map((reporter) => (
                      <SelectItem key={reporter} value={reporter}>
                        {reporter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>
                <Select
                  value={editorials[activeIndex].country}
                  onValueChange={(value) => handleSelectChange('country', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
              </div>

              <div>
                <Label htmlFor="language">Language <span className="text-red-500">*</span></Label>
                <Input
                  id="language"
                  name="language"
                  value={editorials[activeIndex].language}
                  onChange={handleChange}
                  className={errors.language ? "border-red-500" : ""}
                  placeholder="e.g., English"
                />
                {errors.language && <p className="text-red-500 text-sm">{errors.language}</p>}
              </div>
            </div>

            {/* Fourth row - Spokesperson, CEO Media Presence, CEO Thought Leadership, Activity */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <Label htmlFor="spokesperson">Spokesperson</Label>
                <Select
                  value={editorials[activeIndex].spokesperson}
                  onValueChange={(value) => handleSelectChange('spokesperson', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select spokesperson" />
                  </SelectTrigger>
                  <SelectContent>
                    {spokespersons.map((spokesperson) => (
                      <SelectItem key={spokesperson} value={spokesperson}>
                        {spokesperson}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ceoMediaPresence">CEO Media Presence</Label>
                <Select
                  value={editorials[activeIndex].ceoMediaPresence}
                  onValueChange={(value) => handleSelectChange('ceoMediaPresence', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select presence level" />
                  </SelectTrigger>
                  <SelectContent>
                    {ceoMediaPresenceOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ceoThoughtLeadership">CEO Thought Leadership</Label>
                <Select
                  value={editorials[activeIndex].ceoThoughtLeadership}
                  onValueChange={(value) => handleSelectChange('ceoThoughtLeadership', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select leadership level" />
                  </SelectTrigger>
                  <SelectContent>
                    {ceoThoughtLeadershipOptions.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="activity">Activity</Label>
                <Select
                  value={editorials[activeIndex].activity}
                  onValueChange={(value) => handleSelectChange('activity', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select activity" />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.map((activity) => (
                      <SelectItem key={activity} value={activity}>
                        {activity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Fifth row - Circulation, Audience Reach, Media Type, Online Channel */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <Label htmlFor="circulation">Circulation</Label>
                <Input
                  id="circulation"
                  name="circulation"
                  type="number"
                  value={editorials[activeIndex].circulation?.toString() || ''}
                  onChange={handleChange}
                  placeholder="Enter circulation number"
                />
              </div>

              <div>
                <Label htmlFor="audienceReach">Audience Reach</Label>
                <Input
                  id="audienceReach"
                  name="audienceReach"
                  type="number"
                  value={editorials[activeIndex].audienceReach?.toString() || ''}
                  onChange={handleChange}
                  placeholder="Enter audience reach"
                />
              </div>

              <div>
                <Label htmlFor="mediaType">Media Type <span className="text-red-500">*</span></Label>
                <Select
                  value={editorials[activeIndex].mediaType}
                  onValueChange={(value) => handleSelectChange('mediaType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select media type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mediaTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.mediaType && <p className="text-red-500 text-sm">{errors.mediaType}</p>}
              </div>

              <div>
                <Label htmlFor="onlineChannel">Online Channel</Label>
                <Select
                  value={editorials[activeIndex].onlineChannel || ''}
                  onValueChange={(value) => handleSelectChange('onlineChannel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select online channel" />
                  </SelectTrigger>
                  <SelectContent>
                    {onlineChannels.map((channel) => (
                      <SelectItem key={channel} value={channel}>
                        {channel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sixth row - Sentiment, Sentiment Classification, Sentiment Score, Advert Spend */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <Label htmlFor="sentiment">Sentiment</Label>
                <Select
                  value={editorials[activeIndex].sentiment}
                  onValueChange={(value) => handleSelectChange('sentiment', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    {sentiments.map((sentiment) => (
                      <SelectItem key={sentiment} value={sentiment}>
                        {sentiment}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sentimentClassification">Sentiment Classification</Label>
                <Select
                  value={editorials[activeIndex].sentimentClassification}
                  onValueChange={(value) => handleSelectChange('sentimentClassification', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {sentimentClassifications.map((classification) => (
                      <SelectItem key={classification} value={classification}>
                        {classification}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="sentimentScore">Sentiment Score</Label>
                <Input
                  id="sentimentScore"
                  name="sentimentScore"
                  type="number"
                  min="-3"
                  max="3"
                  step="0.1"
                  value={editorials[activeIndex].sentimentScore?.toString() || ''}
                  onChange={handleChange}
                  placeholder="Enter score (-3 to 3)"
                />
              </div>

              <div>
                <Label htmlFor="advertSpend">Advert Spend</Label>
                <Input
                  id="advertSpend"
                  name="advertSpend"
                  type="number"
                  value={editorials[activeIndex].advertSpend?.toString() || ''}
                  onChange={handleChange}
                  placeholder="Enter amount"
                />
              </div>
            </div>

            {/* Seventh row - Page Size */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <Label htmlFor="pageSize">Page Size</Label>
                <Select
                  value={editorials[activeIndex].pageSize || ''}
                  onValueChange={(value) => handleSelectChange('pageSize', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select page size" />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>



            {/* Third row - Notes (Analyst, Supervisor, Admin) with role-based access */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <Label htmlFor="analystNote" className="flex items-center">
                  Analyst Note
                  {isFieldReadOnly('analystNote') && <span className="ml-2 text-xs text-gray-500">(Read-only)</span>}
                </Label>
                <Textarea
                  id="analystNote"
                  name="analystNote"
                  value={editorials[activeIndex].analystNote || ''}
                  onChange={handleChange}
                  className="h-32"
                  readOnly={isFieldReadOnly('analystNote')}
                  disabled={isFieldReadOnly('analystNote')}
                />
              </div>

              <div>
                <Label htmlFor="supervisorNote" className="flex items-center">
                  Supervisor Note
                  {isFieldReadOnly('supervisorNote') && <span className="ml-2 text-xs text-gray-500">(Read-only)</span>}
                </Label>
                <Textarea
                  id="supervisorNote"
                  name="supervisorNote"
                  value={editorials[activeIndex].supervisorNote || ''}
                  onChange={handleChange}
                  className="h-32"
                  readOnly={isFieldReadOnly('supervisorNote')}
                  disabled={isFieldReadOnly('supervisorNote')}
                />
              </div>

              <div>
                <Label htmlFor="adminNote" className="flex items-center">
                  Admin Note
                  {isFieldReadOnly('adminNote') && <span className="ml-2 text-xs text-gray-500">(Read-only)</span>}
                </Label>
                <Textarea
                  id="adminNote"
                  name="adminNote"
                  value={editorials[activeIndex].adminNote || ''}
                  onChange={handleChange}
                  className="h-32"
                  readOnly={isFieldReadOnly('adminNote')}
                  disabled={isFieldReadOnly('adminNote')}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSubmit('draft')}
                disabled={isSubmitting}
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                {isSubmitting && submissionType === 'draft' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save as Draft
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => handleSubmit('send')}
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {isSubmitting && submissionType === 'send' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Save & Send for Approval
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateEditorialPage;
