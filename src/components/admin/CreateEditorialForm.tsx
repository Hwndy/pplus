
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Copy, Plus, Trash, X } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

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
  page: number;
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
}

interface CreateEditorialFormProps {
  onSave: (editorials: Editorial[]) => void;
  onCancel: () => void;
  initialData?: Editorial | null;
}

// Dropdown options
const COMPANIES = ['Stanbic IBTC Holdings'];
const BRANDS = [
  'Stanbic IBTC Bank',
  'Stanbic IBTC Capital',
  'Stanbic IBTC Insurance Limited',
  'Stanbic IBTC Asset Management',
  'Stanbic IBTC Pension',
  'Stanbic IBTC Holdings',
  'Stanbic IBTC Nominees',
];

// Industry-Subsector relationship
const INDUSTRIES = [
  'Agriculture',
  'Financial Services',
  'Real Estate',
  'Transportation',
  'Tobacco',
  'Non-Governmental Organization',
  'Online Streaming Platforms'
];

const INDUSTRY_SUBSECTORS: Record<string, string[]> = {
  "Agriculture": [
    "Agricultural Chemical Services", "Agricultural Product Services", "Agricultural Equipment Services",
    "Agricultural Farms", "Agro Allied Services", "Animal Farms", "Botanical Garden & Horticulture",
    "Fish Farms", "Poultry Farms"
  ],
  "Financial Services": [
    "Commercial Banks", "Microfinance Banks", "Investment Banks", "Insurance Companies", "Asset Management",
    "Financial Technology (Fintech)", "Pension Fund Administrators", "Mortgage Banks", "Stockbroking Firms"
  ],
  "Real Estate": [
    "Property Development", "Property Management", "Facility Management", "Real Estate Investment Trusts (REITs)"
  ],
  "Transportation": [
    "Air Transport Services", "Rail Transport Services", "Road Transport Services",
    "Water Transport Services", "Logistics & Courier Services"
  ],
  "Tobacco": [
    "Tobacco Manufacturing", "Tobacco Retailing"
  ],
  "Non-Governmental Organization": [
    "Humanitarian Services", "Environmental Advocacy", "Health and Medical Support", "Education & Skill Development"
  ],
  "Online Streaming Platforms": [
    "Video Streaming Services", "Music Streaming Services"
  ]
};

const PUBLICATIONS = [
  'BusinessDay',
  'Nigerian Tribune',
  'Leadership',
  'New Telegraph',
  'The Guardian',
  'Vanguard',
  'The Punch',
  'ThisDay',
];
const PLACEMENTS = [
  'Headline',
  'Photo',
];
const REPORTERS = [
  'Eniola Olatunji',
  'Joseph Inokotong',
  'Michael Olaitan',
  'Adebayo Olufemi',
  'Funmi Johnson',
];
const COUNTRIES = [
  'Nigeria',
  'Canada',
  'U.S.A',
  'France',
  'Japan',
  'Germany',
];
const LANGUAGES = [
  'English',
  'Hausa',
];
const SPOKESPERSONS = [
  'Wole Adeniyi (CEO, Stanbic IBTC Bank)',
  'Olumide Oyetan (CEO, Stanbic IBTC Pension)',
  'Oladele Sotubo (CEO, Stanbic IBTC Asset Management)',
  'Akinjide Orimolade (CEO, Stanbic IBTC Insurance)',
  'Demola Sogunle (CEO, Stanbic IBTC Holdings)',
];
const ACTIVITIES = [
  'Innovation',
  'Awards',
  'Industry Report',
  'Partnership',
  'CSR/CSI',
  'Sponsorship',
  'Corporate',
];
const MEDIA_TYPES = [
  'Print',
  'Online',
];
const ONLINE_CHANNELS = [
  'Online Newspaper',
  'Online News Site',
  'Financial Site',
  'Blog',
  'Online Broadcast',
];
const SENTIMENTS = [
  'Positive',
  'Negative',
  'Neutral',
];

// Default editorial template
const defaultEditorial = {
  id: 0,
  date: new Date().toISOString().split('T')[0],
  company: 'Stanbic IBTC Holdings',
  industry: 'Financial Services',
  brand: '',
  subSector: '',
  publication: '',
  placement: '',
  title: '',
  page: 0,
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
  advertSpend: undefined,
  circulation: undefined,
  audienceReach: undefined,
  pageSize: '',
};

export const CreateEditorialForm: React.FC<CreateEditorialFormProps> = ({
  onSave,
  onCancel,
  initialData
}) => {
  // Array of editorial entries for batch creation
  const [editorials, setEditorials] = useState<Array<{
    entry: Partial<Editorial>;
    date: Date | undefined;
    availableSubSectors: string[];
  }>>([]);
  
  useEffect(() => {
    // Initialize with either the initialData or a default editorial
    if (initialData) {
      setEditorials([{
        entry: { ...initialData },
        date: initialData.date ? new Date(initialData.date) : undefined,
        availableSubSectors: INDUSTRY_SUBSECTORS[initialData.industry] || []
      }]);
    } else {
      // Start with one empty form
      setEditorials([{
        entry: { ...defaultEditorial },
        date: new Date(),
        availableSubSectors: INDUSTRY_SUBSECTORS['Financial Services'] || []
      }]);
    }
  }, [initialData]);

  // Handle updates to a specific editorial entry
  const updateEditorial = (index: number, field: string, value: any) => {
    const updatedEditorials = [...editorials];
    
    // Update the field
    updatedEditorials[index].entry = {
      ...updatedEditorials[index].entry,
      [field]: value
    };
    
    // Special handling for date
    if (field === 'date' && value instanceof Date) {
      updatedEditorials[index].date = value;
      updatedEditorials[index].entry.date = value.toISOString().split('T')[0];
    }
    
    // Special handling for industry to update available subsectors
    if (field === 'industry') {
      updatedEditorials[index].availableSubSectors = INDUSTRY_SUBSECTORS[value] || [];
      
      // Reset subsector if it's not in the new list of available subsectors
      if (
        updatedEditorials[index].entry.subSector && 
        !INDUSTRY_SUBSECTORS[value]?.includes(updatedEditorials[index].entry.subSector)
      ) {
        updatedEditorials[index].entry.subSector = '';
      }
    }
    
    setEditorials(updatedEditorials);
  };

  // Add a new editorial entry
  const addEditorial = () => {
    // Create a new editorial with the same values as the last one
    const lastEditorial = editorials[editorials.length - 1];
    
    setEditorials([
      ...editorials,
      {
        entry: { ...lastEditorial.entry, id: Date.now() },
        date: lastEditorial.date ? new Date(lastEditorial.date) : new Date(),
        availableSubSectors: lastEditorial.availableSubSectors
      }
    ]);
  };

  // Clone an editorial entry
  const cloneEditorial = (index: number) => {
    const editorialToClone = editorials[index];
    
    setEditorials([
      ...editorials,
      {
        entry: { ...editorialToClone.entry, id: Date.now() },
        date: editorialToClone.date ? new Date(editorialToClone.date) : new Date(),
        availableSubSectors: editorialToClone.availableSubSectors
      }
    ]);
  };

  // Remove an editorial entry
  const removeEditorial = (index: number) => {
    // Don't remove if it's the only entry
    if (editorials.length <= 1) return;
    
    const updatedEditorials = editorials.filter((_, i) => i !== index);
    setEditorials(updatedEditorials);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate essential fields for each editorial
    const allValid = editorials.every(editorial => 
      editorial.date && 
      editorial.entry.title && 
      editorial.entry.brand
    );
    
    if (!allValid) {
      return;
    }
    
    // Prepare editorials for submission
    const finalEditorials = editorials.map(editorial => ({
      id: editorial.entry.id || Date.now(),
      date: editorial.entry.date || '',
      company: editorial.entry.company || 'Stanbic IBTC Holdings',
      industry: editorial.entry.industry || 'Financial Services',
      brand: editorial.entry.brand || '',
      subSector: editorial.entry.subSector || '',
      publication: editorial.entry.publication || '',
      placement: editorial.entry.placement || '',
      title: editorial.entry.title || '',
      page: editorial.entry.page || 0,
      link: editorial.entry.link || '',
      reporter: editorial.entry.reporter || '',
      country: editorial.entry.country || 'Nigeria',
      language: editorial.entry.language || 'English',
      spokesperson: editorial.entry.spokesperson || '',
      activity: editorial.entry.activity || '',
      mediaType: editorial.entry.mediaType || 'Print',
      onlineChannel: editorial.entry.mediaType === 'Online' ? editorial.entry.onlineChannel : undefined,
      sentiment: editorial.entry.sentiment || '',
      mediaSentimentIndex: editorial.entry.mediaSentimentIndex || 0,
      advertSpend: editorial.entry.advertSpend,
      circulation: editorial.entry.circulation,
      audienceReach: editorial.entry.audienceReach,
      pageSize: editorial.entry.pageSize || '',
    }));
    
    onSave(finalEditorials);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {editorials.map((editorial, index) => (
        <div key={index} className="relative border p-4 rounded-md bg-white dark:bg-gray-800">
          <div className="absolute right-2 top-2 flex space-x-2">
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              onClick={() => cloneEditorial(index)}
              title="Clone this entry"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              type="button" 
              size="icon" 
              variant="ghost" 
              onClick={() => removeEditorial(index)}
              disabled={editorials.length <= 1}
              title="Remove this entry"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex w-full justify-between mb-4">
                <span>Editorial #{index + 1}: {editorial.entry.title || 'New Editorial'}</span>
                <span className="text-xs">Click to expand/collapse</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="grid grid-cols-1 gap-4">
                {/* Row 1 - Essential fields */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor={`date-${index}`}>Date*</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !editorial.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editorial.date ? format(editorial.date, "PPP") : <span>Select date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={editorial.date}
                          onSelect={(newDate) => updateEditorial(index, 'date', newDate)}
                          initialFocus
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label htmlFor={`title-${index}`}>Title*</Label>
                    <Input
                      id={`title-${index}`}
                      value={editorial.entry.title || ''}
                      onChange={(e) => updateEditorial(index, 'title', e.target.value)}
                      placeholder="Enter title"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`brand-${index}`}>Brand*</Label>
                    <Select
                      value={editorial.entry.brand || ''}
                      onValueChange={(value) => updateEditorial(index, 'brand', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRANDS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor={`publication-${index}`}>Publication*</Label>
                    <Select
                      value={editorial.entry.publication || ''}
                      onValueChange={(value) => updateEditorial(index, 'publication', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select publication" />
                      </SelectTrigger>
                      <SelectContent>
                        {PUBLICATIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor={`industry-${index}`}>Industry*</Label>
                    <Select
                      value={editorial.entry.industry || 'Financial Services'}
                      onValueChange={(value) => updateEditorial(index, 'industry', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor={`subSector-${index}`}>Sub-Sector</Label>
                    <Select
                      value={editorial.entry.subSector || ''}
                      onValueChange={(value) => updateEditorial(index, 'subSector', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sub-sector" />
                      </SelectTrigger>
                      <SelectContent>
                        {editorial.availableSubSectors.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor={`mediaType-${index}`}>Media Type*</Label>
                    <Select
                      value={editorial.entry.mediaType || 'Print'}
                      onValueChange={(value) => updateEditorial(index, 'mediaType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select media type" />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDIA_TYPES.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {editorial.entry.mediaType === 'Online' && (
                    <div>
                      <Label htmlFor={`onlineChannel-${index}`}>Online Channel</Label>
                      <Select
                        value={editorial.entry.onlineChannel || ''}
                        onValueChange={(value) => updateEditorial(index, 'onlineChannel', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select online channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {ONLINE_CHANNELS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                {/* Additional fields - hidden by default in collapsible sections */}
                <div className="mt-2">
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="outline" type="button" className="w-full">
                        Show Additional Fields
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
                        <div>
                          <Label htmlFor={`placement-${index}`}>Placement</Label>
                          <Select
                            value={editorial.entry.placement || ''}
                            onValueChange={(value) => updateEditorial(index, 'placement', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select placement" />
                            </SelectTrigger>
                            <SelectContent>
                              {PLACEMENTS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor={`page-${index}`}>Page</Label>
                          <Input
                            id={`page-${index}`}
                            type="number"
                            value={editorial.entry.page === undefined ? '' : editorial.entry.page}
                            onChange={(e) => updateEditorial(index, 'page', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="Enter page number"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`link-${index}`}>Link</Label>
                          <Input
                            id={`link-${index}`}
                            type="url"
                            value={editorial.entry.link || ''}
                            onChange={(e) => updateEditorial(index, 'link', e.target.value)}
                            placeholder="Enter URL"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`reporter-${index}`}>Reporter</Label>
                          <Select
                            value={editorial.entry.reporter || ''}
                            onValueChange={(value) => updateEditorial(index, 'reporter', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select reporter" />
                            </SelectTrigger>
                            <SelectContent>
                              {REPORTERS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
                        <div>
                          <Label htmlFor={`country-${index}`}>Country</Label>
                          <Select
                            value={editorial.entry.country || 'Nigeria'}
                            onValueChange={(value) => updateEditorial(index, 'country', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {COUNTRIES.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor={`language-${index}`}>Language</Label>
                          <Select
                            value={editorial.entry.language || 'English'}
                            onValueChange={(value) => updateEditorial(index, 'language', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                              {LANGUAGES.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor={`spokesperson-${index}`}>Spokesperson</Label>
                          <Select
                            value={editorial.entry.spokesperson || ''}
                            onValueChange={(value) => updateEditorial(index, 'spokesperson', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select spokesperson" />
                            </SelectTrigger>
                            <SelectContent>
                              {SPOKESPERSONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor={`activity-${index}`}>Activity</Label>
                          <Select
                            value={editorial.entry.activity || ''}
                            onValueChange={(value) => updateEditorial(index, 'activity', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select activity" />
                            </SelectTrigger>
                            <SelectContent>
                              {ACTIVITIES.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
                        <div>
                          <Label htmlFor={`sentiment-${index}`}>Sentiment</Label>
                          <Select
                            value={editorial.entry.sentiment || ''}
                            onValueChange={(value) => updateEditorial(index, 'sentiment', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select sentiment" />
                            </SelectTrigger>
                            <SelectContent>
                              {SENTIMENTS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor={`mediaSentimentIndex-${index}`}>Media Sentiment Index (-3 to 2)</Label>
                          <Input
                            id={`mediaSentimentIndex-${index}`}
                            type="number"
                            min="-3"
                            max="2"
                            value={editorial.entry.mediaSentimentIndex === undefined ? '' : editorial.entry.mediaSentimentIndex}
                            onChange={(e) => updateEditorial(index, 'mediaSentimentIndex', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="Enter index (-3 to 2)"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`advertSpend-${index}`}>Advert Spend (₦)</Label>
                          <Input
                            id={`advertSpend-${index}`}
                            type="number"
                            value={editorial.entry.advertSpend === undefined ? '' : editorial.entry.advertSpend}
                            onChange={(e) => updateEditorial(index, 'advertSpend', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="Enter amount"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`circulation-${index}`}>Circulation</Label>
                          <Input
                            id={`circulation-${index}`}
                            type="number"
                            value={editorial.entry.circulation === undefined ? '' : editorial.entry.circulation}
                            onChange={(e) => updateEditorial(index, 'circulation', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="Enter circulation"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
                        <div>
                          <Label htmlFor={`audienceReach-${index}`}>Audience Reach</Label>
                          <Input
                            id={`audienceReach-${index}`}
                            type="number"
                            value={editorial.entry.audienceReach === undefined ? '' : editorial.entry.audienceReach}
                            onChange={(e) => updateEditorial(index, 'audienceReach', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="Enter audience reach"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor={`pageSize-${index}`}>Page Size</Label>
                          <Input
                            id={`pageSize-${index}`}
                            value={editorial.entry.pageSize || ''}
                            onChange={(e) => updateEditorial(index, 'pageSize', e.target.value)}
                            placeholder="Enter page size"
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      ))}
      
      <Button 
        type="button" 
        variant="outline" 
        onClick={addEditorial}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Another Editorial
      </Button>

      <div className="flex justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
        >
          Discard
        </Button>
        <Button 
          type="submit"
          className="bg-indigo-950"
        >
          Save All Editorials
        </Button>
      </div>
    </form>
  );
};
