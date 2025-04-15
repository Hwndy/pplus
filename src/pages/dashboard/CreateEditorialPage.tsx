
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Copy } from 'lucide-react';
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
  date: string;
  company: string;
  industry: string;
  brand: string;
  subSector: string;
  publication: string;
  placement: string;
  title: string;
  page: string;
  link: string;
  reporter: string;
  country: string;
  language: string;
  spokesperson: string;
  activity: string;
  mediaType: string;
  onlineChannel?: string;
  sentiment: string;
  mediaSentimentIndex: number;
  advertSpend?: number;
  circulation?: number;
  audienceReach?: number;
  pageSize?: string;
  status?: string;
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

const subSectors = {
  'Financial Services': [
    'Commercial Banks', 'Microfinance Banks', 'Investment Banks', 'Insurance Companies', 'Asset Management',
    'Financial Technology (Fintech)', 'Pension Fund Administrators', 'Mortgage Banks', 'Stockbroking Firms'
  ],
  // ... additional subsectors for other industries
};

const mediaTypes = ['Print', 'Online'];
const companies = ['Stanbic IBTC Holdings', 'MTN Nigeria', 'Dangote Group'];
const brands = [
  'Stanbic IBTC Bank',
  'Stanbic IBTC Capital',
  'Stanbic IBTC Insurance Limited',
  'Stanbic IBTC Asset Management',
  'Stanbic IBTC Pension',
  'Stanbic IBTC Holdings',
];
const publications = ['ThisDay', 'The Punch', 'Vanguard', 'BusinessDay', 'Guardian'];
const actions = ['Innovation', 'Corporate', 'Partnership', 'CSR/CSI', 'Sponsorship', 'Awards'];
const natures = ['Online News', 'Print', 'Online Newspaper', 'Social Media', 'TV', 'Radio'];
const placements = ['Headline', 'Photo'];
const countries = ['Nigeria', 'Ghana', 'Kenya', 'South Africa'];
const activities = ['Innovation', 'Corporate', 'Partnership', 'CSR/CSI', 'Sponsorship', 'Awards'];
const sentiments = ['Positive', 'Negative', 'Neutral'];
const statuses = ['Pending', 'Approved', 'Rejected'];
const reporters = ['Eniola Olatunji', 'Joseph Inokotong', 'Michael Olaitan', 'Adebayo Olufemi', 'Funmi Johnson'];
const spokespersons = [
  'Wole Adeniyi (CEO, Stanbic IBTC Bank)',
  'Olumide Oyetan (CEO, Stanbic IBTC Pension)',
  'Oladele Sotubo (CEO, Stanbic IBTC Asset Management)',
  'Akinjide Orimolade (CEO, Stanbic IBTC Insurance)',
  'Demola Sogunle (CEO, Stanbic IBTC Holdings)',
];
const spokespersonPositions = ['CEO', 'CFO', 'CTO', 'CMO', 'COO', 'President', 'Director'];
const spokespersonCompanies = ['Stanbic IBTC Holdings', 'Stanbic IBTC Bank', 'Stanbic IBTC Pension'];

const CreateEditorialPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = !!location.state?.editorialData;

  // Detect user role - this would normally come from authentication
  // For demo purposes, we'll use a hardcoded role
  const userRole = 'admin'; // Options: 'analyst', 'supervisor', 'admin'

  // Default initial form data
  const defaultFormData: Editorial = {
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    company: '',
    industry: 'Financial Services',
    brand: '',
    subSector: '',
    publication: '',
    placement: '',
    title: '',
    page: '',
    link: '',
    reporter: '',
    country: 'Nigeria',
    language: 'English',
    spokesperson: '',
    activity: '',
    mediaType: 'Print',
    onlineChannel: '',
    sentiment: '',
    mediaSentimentIndex: 0,
    advertSpend: 0,
    circulation: 0,
    audienceReach: 0,
    pageSize: '',
    status: 'Pending',
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
  const validateForm = () => {
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    // Required fields
    const requiredFields = ['title', 'brand', 'publication', 'date'];

    requiredFields.forEach(field => {
      if (!editorials[activeIndex][field as keyof Editorial]) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        hasErrors = true;
      }
    });

    setErrors(newErrors);
    return !hasErrors;
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Clear session storage after successful submission
    // This prevents old data from being loaded if the user creates a new editorial later
    sessionStorage.removeItem(sessionKey);

    navigate('/dashboard/editorial', {
      state: {
        savedEditorials: editorials,
        isEditMode
      }
    });

    toast({
      title: isEditMode ? "Editorial Updated" : "Editorial Created",
      description: isEditMode
        ? "The editorial has been updated successfully."
        : `${editorials.length} editorial(s) have been created successfully.`
    });
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

      <form onSubmit={handleSubmit} className="w-full">
        <Card className="w-full">
          <CardContent className="p-6 w-full">
            {/* First row - Company, Date, Media Type, Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div>
                <Label htmlFor="company">Search for a company</Label>
                <Select
                  value={editorials[activeIndex].company}
                  onValueChange={(value) => handleSelectChange('company', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company} value={company}>
                        {company}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">mm/dd/yyyy</Label>
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
                      {dates[activeIndex] ? format(dates[activeIndex]!, "MM/dd/yyyy") : <span>mm/dd/yyyy</span>}
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
              </div>

              <div>
                <Label htmlFor="mediaType">Media Type</Label>
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
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={editorials[activeIndex].status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Second row - Horizontally scrollable fields with visible scrollbar */}
            <div className="mb-6 relative">
              <div className="overflow-x-auto pb-4 custom-scrollbar">
                <div className="flex gap-4 min-w-max">
                  <div className="min-w-[150px]">
                    <Label htmlFor="activity">Action</Label>
                    <Select
                      value={editorials[activeIndex].activity}
                      onValueChange={(value) => handleSelectChange('activity', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        {actions.map((action) => (
                          <SelectItem key={action} value={action}>
                            {action}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-[150px]">
                    <Label htmlFor="publication">Publication</Label>
                    <Select
                      value={editorials[activeIndex].publication}
                      onValueChange={(value) => handleSelectChange('publication', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select publication" />
                      </SelectTrigger>
                      <SelectContent>
                        {publications.map((publication) => (
                          <SelectItem key={publication} value={publication}>
                            {publication}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.publication && <p className="text-red-500 text-sm">{errors.publication}</p>}
                  </div>

                  <div className="min-w-[150px]">
                    <Label htmlFor="nature">Nature</Label>
                    <Select
                      value={editorials[activeIndex].placement}
                      onValueChange={(value) => handleSelectChange('placement', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select nature" />
                      </SelectTrigger>
                      <SelectContent>
                        {natures.map((nature) => (
                          <SelectItem key={nature} value={nature}>
                            {nature}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-[220px]">
                    <Label htmlFor="title">Title<span className="text-red-500">*</span></Label>
                    <Input
                      id="title"
                      name="title"
                      value={editorials[activeIndex].title}
                      onChange={handleChange}
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
                  </div>

                  <div className="min-w-[100px]">
                    <Label htmlFor="page">Page<span className="text-red-500">*</span></Label>
                    <Input
                      id="page"
                      name="page"
                      type="number"
                      value={editorials[activeIndex].page}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="min-w-[150px]">
                    <Label htmlFor="reporter">Reporters<span className="text-red-500">*</span></Label>
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

                  <div className="min-w-[200px]">
                    <Label htmlFor="spokesperson">Spokesperson<span className="text-red-500">*</span></Label>
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

                  <div className="min-w-[150px]">
                    <Label htmlFor="spokespersonPosition">Spokesperson Position</Label>
                    <Select
                      value={editorials[activeIndex].subSector} // Reusing subSector field for spokesperson position
                      onValueChange={(value) => handleSelectChange('subSector', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {spokespersonPositions.map((position) => (
                          <SelectItem key={position} value={position}>
                            {position}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="min-w-[150px]">
                    <Label htmlFor="spokespersonCompany">Spokesperson Company</Label>
                    <Select
                      value={editorials[activeIndex].brand} // Reusing brand field for spokesperson company
                      onValueChange={(value) => handleSelectChange('brand', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {spokespersonCompanies.map((company) => (
                          <SelectItem key={company} value={company}>
                            {company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.brand && <p className="text-red-500 text-sm">{errors.brand}</p>}
                  </div>

                  <div className="min-w-[150px]">
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

                  <div className="min-w-[100px]">
                    <Label htmlFor="industry">Industry</Label>
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
                  </div>

                  <div className="min-w-[150px]">
                    <Label htmlFor="country">Country</Label>
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
                  </div>

                  <div className="min-w-[120px]">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      name="language"
                      value={editorials[activeIndex].language}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="min-w-[150px]">
                    <Label htmlFor="mediaSentimentIndex">Media Sentiment Index</Label>
                    <Input
                      id="mediaSentimentIndex"
                      name="mediaSentimentIndex"
                      type="number"
                      min="-3"
                      max="2"
                      value={editorials[activeIndex].mediaSentimentIndex.toString()}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="min-w-[120px]">
                    <Label htmlFor="advertSpend">Advert Spend</Label>
                    <Input
                      id="advertSpend"
                      name="advertSpend"
                      type="number"
                      value={editorials[activeIndex].advertSpend?.toString() || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="min-w-[120px]">
                    <Label htmlFor="circulation">Circulation</Label>
                    <Input
                      id="circulation"
                      name="circulation"
                      type="number"
                      value={editorials[activeIndex].circulation?.toString() || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="min-w-[120px]">
                    <Label htmlFor="audienceReach">Audience Reach</Label>
                    <Input
                      id="audienceReach"
                      name="audienceReach"
                      type="number"
                      value={editorials[activeIndex].audienceReach?.toString() || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="min-w-[120px]">
                    <Label htmlFor="pageSize">Page Size</Label>
                    <Input
                      id="pageSize"
                      name="pageSize"
                      value={editorials[activeIndex].pageSize || ''}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="min-w-[150px]">
                    <Label htmlFor="link">Link</Label>
                    <Input
                      id="link"
                      name="link"
                      value={editorials[activeIndex].link}
                      onChange={handleChange}
                    />
                  </div>
                </div>
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
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-indigo-950"
              >
                {isEditMode ? 'Update Editorial' : `Save ${editorials.length > 1 ? 'All Editorials' : 'Editorial'}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateEditorialPage;
