// import React, { useState, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Textarea } from '@/components/ui/textarea';
// import { Card, CardContent } from '@/components/ui/card';
// import { format } from 'date-fns';
// import { CalendarIcon, Plus } from 'lucide-react';
// import { Company, Publication } from '@/services/apiService';
// import { cn } from '@/lib/utils';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from '@/components/ui/popover';
// import { Calendar } from '@/components/ui/calendar';

// export interface Editorial {
//   id: number;
//   serialNumber?: number;
//   date: string;
//   company: string;
//   industry: string;
//   brand: string;
//   subIndustry: string;
//   source: string;
//   placement: string;
//   title: string;
//   printWebClips: string;
//   reporter: string;
//   country: string;
//   language: string;
//   spokesperson: string;
//   ceoMediaPresence: string;
//   ceoThoughtLeadership: string;
//   activity: string;
//   circulation?: number;
//   audienceReach?: number;
//   mediaType: string;
//   onlineChannel?: string;
//   sentiment: string;
//   sentimentClassification: string;
//   sentimentScore: number;
//   advertSpend?: number;
//   pageSize?: string;
//   status?: string;
//   analystNote?: string;
//   supervisorNote?: string;
//   adminNote?: string;
// }

// interface EditorialFormProps {
//   editorials: Editorial[];
//   activeIndex: number;
//   errors: Record<string, string>;
//   dates: (Date | undefined)[];
//   apiCompanies: Company[];
//   apiPublications: Publication[];
//   userRole: string;
//   onEditorialChange: (editorials: Editorial[]) => void;
//   onDateChange: (dates: (Date | undefined)[]) => void;
//   onAddEditorial: () => void;
//   onCloneEditorial: () => void;
//   onSwitchEditorial: (index: number) => void;
//   onFieldChange: (name: string, value: string | number) => void;
//   onSelectChange: (name: string, value: string) => void;
//   onDateSelect: (selectedDate: Date | undefined) => void;
//   onClearError: (fieldName: string) => void;
//   onReviewAction?: (action: 'approve' | 'reject') => void;
//   isFieldReadOnly?: (fieldName: string) => boolean;
// }

// // Static data arrays
// const industries = [
//   'Agriculture', 'Financial Services', 'Real Estate', 'Transportation', 'Tobacco',
//   'Non-Governmental Organization', 'Online Streaming Platforms'
// ];

// const subIndustries = {
//   'Financial Services': [
//     'Commercial Banks', 'Microfinance Banks', 'Investment Banks', 'Insurance Companies', 'Asset Management',
//     'Financial Technology (Fintech)', 'Pension Fund Administrators', 'Mortgage Banks', 'Stockbroking Firms'
//   ],
//   'Agriculture': ['Crop Production', 'Livestock', 'Fisheries', 'Forestry', 'Agricultural Technology'],
//   'Real Estate': ['Residential', 'Commercial', 'Industrial', 'Property Management', 'Real Estate Investment'],
//   'Transportation': ['Aviation', 'Maritime', 'Road Transport', 'Rail Transport', 'Logistics'],
//   'Tobacco': ['Cigarettes', 'Cigars', 'Smokeless Tobacco', 'E-cigarettes'],
//   'Non-Governmental Organization': ['Healthcare NGO', 'Education NGO', 'Environmental NGO', 'Human Rights NGO', 'Development NGO'],
//   'Online Streaming Platforms': ['Video Streaming', 'Music Streaming', 'Gaming Streaming', 'Live Streaming']
// };

// const mediaTypes = ['Print', 'Online', 'TV', 'Radio', 'Social Media'];
// const companies = ['Stanbic IBTC Holdings', 'MTN Nigeria', 'Dangote Group', 'Access Bank', 'Zenith Bank'];
// const brands = [
//   'Stanbic IBTC Bank', 'Stanbic IBTC Capital', 'Stanbic IBTC Insurance Limited',
//   'Stanbic IBTC Asset Management', 'Stanbic IBTC Pension', 'Stanbic IBTC Holdings'
// ];
// const sources = ['ThisDay', 'The Punch', 'Vanguard', 'BusinessDay', 'Guardian', 'Channels TV', 'BBC', 'CNN'];
// const placements = ['Headline', 'Photo', 'Feature Story', 'Opinion', 'Editorial', 'News Brief'];
// const countries = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Morocco'];
// const activities = ['Innovation', 'Corporate', 'Partnership', 'CSR/CSI', 'Sponsorship', 'Awards', 'Product Launch', 'Merger & Acquisition'];
// const sentiments = ['Positive', 'Negative', 'Neutral'];
// const sentimentClassifications = ['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative'];
// const reporters = ['Eniola Olatunji', 'Joseph Inokotong', 'Michael Olaitan', 'Adebayo Olufemi', 'Funmi Johnson'];
// const spokespersons = [
//   'Wole Adeniyi (CEO, Stanbic IBTC Bank)', 'Olumide Oyetan (CEO, Stanbic IBTC Pension)',
//   'Oladele Sotubo (CEO, Stanbic IBTC Asset Management)', 'Akinjide Orimolade (CEO, Stanbic IBTC Insurance)',
//   'Demola Sogunle (CEO, Stanbic IBTC Holdings)'
// ];
// const ceoMediaPresenceOptions = ['High', 'Medium', 'Low', 'None'];
// const ceoThoughtLeadershipOptions = ['Strong', 'Moderate', 'Weak', 'None'];
// const printWebClipsOptions = ['Print Only', 'Web Only', 'Both Print and Web', 'Social Media'];
// const onlineChannels = ['Website', 'Social Media', 'Mobile App', 'Email Newsletter', 'Podcast'];
// const pageSizes = ['Full Page', 'Half Page', 'Quarter Page', 'Banner', 'Small Ad'];

// const EditorialForm: React.FC<EditorialFormProps> = ({
//   editorials,
//   activeIndex,
//   errors,
//   dates,
//   apiCompanies = [],
//   apiPublications = [],
//   userRole,
//   onEditorialChange,
//   onDateChange,
//   onAddEditorial,
//   onCloneEditorial,
//   onSwitchEditorial,
//   onFieldChange,
//   onSelectChange,
//   onDateSelect,
//   onClearError,
//   onReviewAction,
//   isFieldReadOnly: propIsFieldReadOnly
// }) => {
//   const [dynamicRows, setDynamicRows] = useState<Editorial[]>([]);

//   // Search functionality state
//   const [companySearchTerm, setCompanySearchTerm] = useState('');
//   const [brandSearchTerm, setBrandSearchTerm] = useState('');
//   const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
//   const [showBrandDropdown, setShowBrandDropdown] = useState(false);

//   // Ensure we have safe arrays to work with
//   const safeApiCompanies = Array.isArray(apiCompanies) ? apiCompanies : [];
//   const safeApiPublications = Array.isArray(apiPublications) ? apiPublications : [];

//   // Initialize dynamic rows with the current editorial's data
//   useEffect(() => {
//     if (editorials && editorials[activeIndex]) {
//       setDynamicRows([editorials[activeIndex]]);
//     }
//   }, [editorials, activeIndex]);

//   // Filter companies based on search term
//   const filteredCompanies = React.useMemo(() => {
//     const allCompanies = [...safeApiCompanies, ...companies.map(name => ({ name, id: name }))];
//     if (!companySearchTerm) return allCompanies;
//     return allCompanies.filter(company =>
//       (typeof company === 'string' ? company : company.name)
//         .toLowerCase()
//         .includes(companySearchTerm.toLowerCase())
//     );
//   }, [companySearchTerm, safeApiCompanies]);

//   // Filter brands based on search term
//   const filteredBrands = React.useMemo(() => {
//     if (!brandSearchTerm) return brands;
//     return brands.filter(brand =>
//       brand.toLowerCase().includes(brandSearchTerm.toLowerCase())
//     );
//   }, [brandSearchTerm]);

//   // Close dropdowns when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as HTMLElement;
//       if (!target.closest('.relative')) {
//         setShowCompanyDropdown(false);
//         setShowBrandDropdown(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   // Use the prop function if provided, otherwise use default logic
//   const isFieldReadOnly = propIsFieldReadOnly || ((fieldName: string): boolean => {
//     // Default logic for when no prop is provided
//     // Note fields are restricted by role
//     if (fieldName === 'analystNote' && userRole !== 'analyst') {
//       return true;
//     }
//     if (fieldName === 'supervisorNote' && userRole !== 'supervisor') {
//       return true;
//     }
//     if (fieldName === 'adminNote' && userRole !== 'admin') {
//       return true;
//     }
//     // All other fields are editable by default
//     return false;
//   });

//   // Handle adding a new dynamic row
//   const addDynamicRow = () => {
//     const newRow: Editorial = {
//       ...editorials[activeIndex],
//       id: Date.now() + Math.random(),
//       title: '',
//       source: '',
//       placement: '',
//       printWebClips: '',
//       reporter: '',
//       spokesperson: '',
//       ceoMediaPresence: '',
//       ceoThoughtLeadership: '',
//       activity: '',
//       circulation: 0,
//       audienceReach: 0,
//       onlineChannel: '',
//       sentiment: '',
//       sentimentClassification: '',
//       sentimentScore: 0,
//       advertSpend: 0,
//       pageSize: '',
//       analystNote: '',
//       supervisorNote: '',
//       adminNote: ''
//     };
//     setDynamicRows([...dynamicRows, newRow]);
//   };

//   // Handle field changes in dynamic rows
//   const handleDynamicRowChange = (rowIndex: number, fieldName: string, value: string | number) => {
//     const updatedRows = [...dynamicRows];
//     updatedRows[rowIndex] = {
//       ...updatedRows[rowIndex],
//       [fieldName]: value
//     };
//     setDynamicRows(updatedRows);
    
//     // Update the main editorial if it's the first row
//     if (rowIndex === 0) {
//       onFieldChange(fieldName, value);
//     }
//   };

//   return (
//     <div className="w-full">
//       {/* Editorial tabs */}
//       {editorials.length > 1 && (
//         <div className="flex overflow-x-auto space-x-2 mb-4 pb-2">
//           {editorials.map((editorial, index) => (
//             <Button
//               key={editorial.id}
//               variant={activeIndex === index ? "default" : "outline"}
//               className="whitespace-nowrap"
//               onClick={() => onSwitchEditorial(index)}
//             >
//               Editorial {index + 1}
//             </Button>
//           ))}
//         </div>
//       )}

//       {/* Form with sticky notes section */}
//       <Card className="w-full flex flex-col h-full">
//         <CardContent className="p-0 flex flex-col h-full">
//           {/* Scrollable form content */}
//           <div className="flex-1 overflow-y-auto p-6">
//             <div className="space-y-6">

//             {/* ROW 1: Static fields - ONLY Auto Date, Company (with search), Media Type - NO SCROLL */}
//             <div className="flex gap-4 w-full">
//               <div className="flex-1">
//                 <Label htmlFor="date">Date (Auto-picked) <span className="text-red-500">*</span></Label>
//                 <Input
//                   id="date"
//                   name="date"
//                   type="date"
//                   value={editorials[activeIndex]?.date || new Date().toISOString().split('T')[0]}
//                   onChange={(e) => onFieldChange('date', e.target.value)}
//                   className={errors.date ? "border-red-500" : ""}
//                   readOnly={isFieldReadOnly('date')}
//                   disabled={isFieldReadOnly('date')}
//                 />
//                 {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
//               </div>

//               <div className="flex-1">
//                 <Label htmlFor="company">
//                   Company (Search) <span className="text-red-500">*</span>
//                   {isFieldReadOnly('company') && <span className="ml-2 text-xs text-gray-500">(Read-only)</span>}
//                 </Label>
//                 <div className="relative">
//                   <Input
//                     id="company"
//                     name="company"
//                     value={editorials[activeIndex]?.company || ''}
//                     onChange={(e) => {
//                       onFieldChange('company', e.target.value);
//                       setCompanySearchTerm(e.target.value);
//                       setShowCompanyDropdown(true);
//                     }}
//                     onFocus={() => !isFieldReadOnly('company') && setShowCompanyDropdown(true)}
//                     className={errors.company ? "border-red-500" : ""}
//                     placeholder="Search or type company name..."
//                     readOnly={isFieldReadOnly('company')}
//                     disabled={isFieldReadOnly('company')}
//                   />
//                   {showCompanyDropdown && !isFieldReadOnly('company') && (
//                     <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                       {filteredCompanies.length > 0 ? (
//                         filteredCompanies.map((company, index) => (
//                           <div
//                             key={typeof company === 'string' ? company : company.id}
//                             className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
//                             onClick={() => {
//                               const companyName = typeof company === 'string' ? company : company.name;
//                               onFieldChange('company', companyName);
//                               setShowCompanyDropdown(false);
//                               setCompanySearchTerm('');
//                             }}
//                           >
//                             {typeof company === 'string' ? company : company.name}
//                           </div>
//                         ))
//                       ) : (
//                         <div className="px-3 py-2 text-gray-500">No companies found</div>
//                       )}
//                     </div>
//                   )}
//                 </div>
//                 {errors.company && <p className="text-red-500 text-sm">{errors.company}</p>}
//               </div>

//               <div className="flex-1">
//                 <Label htmlFor="mediaType">Media Type <span className="text-red-500">*</span></Label>
//                 <Select
//                   value={editorials[activeIndex]?.mediaType || ''}
//                   onValueChange={(value) => onFieldChange('mediaType', value)}
//                   disabled={isFieldReadOnly('mediaType')}
//                 >
//                   <SelectTrigger className={errors.mediaType ? "border-red-500" : ""}>
//                     <SelectValue placeholder="Select media type" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     {mediaTypes.map((type) => (
//                       <SelectItem key={type} value={type}>
//                         {type}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//                 {errors.mediaType && <p className="text-red-500 text-sm">{errors.mediaType}</p>}
//               </div>
//             </div>

//             {/* ROW 2: Dynamic cloneable fields with horizontal scroll - ALL REMAINING FIELDS */}
//             <div className="overflow-x-auto">
//               <div className="min-w-max space-y-4">

//                 {/* ROW 2: Dynamic cloneable fields with plus button - ALL REMAINING FIELDS */}
//                 {dynamicRows.map((row, rowIndex) => (
//                   <div key={row.id} className="flex gap-4 min-w-max">
//                   {/* Plus button on the left for cloning rows */}
//                   {rowIndex === 0 && (
//                     <div className="flex flex-col items-center pt-6 min-w-[40px]">
//                       <Button
//                         type="button"
//                         variant="outline"
//                         size="sm"
//                         onClick={addDynamicRow}
//                         className="h-8 w-8 p-0 rounded-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50"
//                       >
//                         <Plus className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   )}

//                   {/* Industry field moved from row 1 */}
//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="industry">Industry <span className="text-red-500">*</span></Label>}
//                     <Select
//                       value={row.industry}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'industry', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select industry" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {industries.map((industry) => (
//                           <SelectItem key={industry} value={industry}>
//                             {industry}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {rowIndex === 0 && errors.industry && <p className="text-red-500 text-sm">{errors.industry}</p>}
//                   </div>

//                   {/* Sub-Industry field moved from row 1 */}
//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="subIndustry">Sub-Industry</Label>}
//                     <Select
//                       value={row.subIndustry}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'subIndustry', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select sub-industry" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {(subIndustries[row.industry as keyof typeof subIndustries] || []).map((subIndustry) => (
//                           <SelectItem key={subIndustry} value={subIndustry}>
//                             {subIndustry}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Source field moved from row 1 */}
//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="source">Source <span className="text-red-500">*</span></Label>}
//                     <Select
//                       value={row.source}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'source', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select source" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {safeApiPublications.map((publication: Publication) => (
//                           <SelectItem key={publication.id} value={publication.name}>
//                             {publication.name}
//                           </SelectItem>
//                         ))}
//                         {sources.map((source) => (
//                           <SelectItem key={source} value={source}>
//                             {source}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {rowIndex === 0 && errors.source && <p className="text-red-500 text-sm">{errors.source}</p>}
//                   </div>

//                   {/* Placement field moved from row 1 */}
//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && (
//                       <Label htmlFor="placement">
//                         Placement
//                         {isFieldReadOnly('placement') && <span className="ml-2 text-xs text-gray-500">(Read-only)</span>}
//                       </Label>
//                     )}
//                     <Select
//                       value={row.placement}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'placement', value)}
//                       disabled={isFieldReadOnly('placement')}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select placement" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {placements.map((placement) => (
//                           <SelectItem key={placement} value={placement}>
//                             {placement}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Title field moved from row 1 */}
//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && (
//                       <Label htmlFor="title">
//                         Title <span className="text-red-500">*</span>
//                         {isFieldReadOnly('title') && <span className="ml-2 text-xs text-gray-500">(Read-only)</span>}
//                       </Label>
//                     )}
//                     <Input
//                       id="title"
//                       name="title"
//                       value={row.title}
//                       onChange={(e) => handleDynamicRowChange(rowIndex, 'title', e.target.value)}
//                       className={rowIndex === 0 && errors.title ? "border-red-500" : ""}
//                       placeholder="Enter article title"
//                       readOnly={isFieldReadOnly('title')}
//                       disabled={isFieldReadOnly('title')}
//                     />
//                     {rowIndex === 0 && errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
//                   </div>

//                   {/* Print/Web Clips field moved from row 1 */}
//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="printWebClips">Print/Web Clips</Label>}
//                     <Select
//                       value={row.printWebClips}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'printWebClips', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {printWebClipsOptions.map((option) => (
//                           <SelectItem key={option} value={option}>
//                             {option}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Reporter field moved from row 1 */}
//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="reporter">Reporter</Label>}
//                     <Select
//                       value={row.reporter}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'reporter', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select reporter" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {reporters.map((reporter) => (
//                           <SelectItem key={reporter} value={reporter}>
//                             {reporter}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   {/* Country field moved from row 1 */}
//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="country">Country <span className="text-red-500">*</span></Label>}
//                     <Select
//                       value={row.country}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'country', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select country" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {countries.map((country) => (
//                           <SelectItem key={country} value={country}>
//                             {country}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {rowIndex === 0 && errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
//                   </div>

//                   {/* Language field moved from row 1 */}
//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="language">Language <span className="text-red-500">*</span></Label>}
//                     <Input
//                       id="language"
//                       name="language"
//                       value={row.language}
//                       onChange={(e) => handleDynamicRowChange(rowIndex, 'language', e.target.value)}
//                       className={rowIndex === 0 && errors.language ? "border-red-500" : ""}
//                       placeholder="e.g., English"
//                     />
//                     {rowIndex === 0 && errors.language && <p className="text-red-500 text-sm">{errors.language}</p>}
//                   </div>

//                   {/* Spokesperson field */}
//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="spokesperson">Spokesperson</Label>}
//                     <Select
//                       value={row.spokesperson}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'spokesperson', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select spokesperson" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {spokespersons.map((spokesperson) => (
//                           <SelectItem key={spokesperson} value={spokesperson}>
//                             {spokesperson}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="ceoMediaPresence">CEO Media Presence</Label>}
//                     <Select
//                       value={row.ceoMediaPresence}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'ceoMediaPresence', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select presence level" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {ceoMediaPresenceOptions.map((option) => (
//                           <SelectItem key={option} value={option}>
//                             {option}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="ceoThoughtLeadership">CEO Thought Leadership</Label>}
//                     <Select
//                       value={row.ceoThoughtLeadership}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'ceoThoughtLeadership', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select leadership level" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {ceoThoughtLeadershipOptions.map((option) => (
//                           <SelectItem key={option} value={option}>
//                             {option}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="activity">Activity</Label>}
//                     <Select
//                       value={row.activity}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'activity', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select activity" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {activities.map((activity) => (
//                           <SelectItem key={activity} value={activity}>
//                             {activity}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="circulation">Circulation</Label>}
//                     <Input
//                       id="circulation"
//                       name="circulation"
//                       type="number"
//                       value={row.circulation?.toString() || ''}
//                       onChange={(e) => handleDynamicRowChange(rowIndex, 'circulation', parseInt(e.target.value) || 0)}
//                       placeholder="Enter circulation number"
//                     />
//                   </div>

//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="audienceReach">Audience Reach</Label>}
//                     <Input
//                       id="audienceReach"
//                       name="audienceReach"
//                       type="number"
//                       value={row.audienceReach?.toString() || ''}
//                       onChange={(e) => handleDynamicRowChange(rowIndex, 'audienceReach', parseInt(e.target.value) || 0)}
//                       placeholder="Enter audience reach"
//                     />
//                   </div>

//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="mediaType">Media Type <span className="text-red-500">*</span></Label>}
//                     <Select
//                       value={row.mediaType}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'mediaType', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select media type" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {mediaTypes.map((type) => (
//                           <SelectItem key={type} value={type}>
//                             {type}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     {rowIndex === 0 && errors.mediaType && <p className="text-red-500 text-sm">{errors.mediaType}</p>}
//                   </div>

//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="onlineChannel">Online Channel</Label>}
//                     <Select
//                       value={row.onlineChannel || ''}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'onlineChannel', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select online channel" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {onlineChannels.map((channel) => (
//                           <SelectItem key={channel} value={channel}>
//                             {channel}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="sentiment">Sentiment</Label>}
//                     <Select
//                       value={row.sentiment}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'sentiment', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select sentiment" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {sentiments.map((sentiment) => (
//                           <SelectItem key={sentiment} value={sentiment}>
//                             {sentiment}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="sentimentClassification">Sentiment Classification</Label>}
//                     <Select
//                       value={row.sentimentClassification}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'sentimentClassification', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select classification" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {sentimentClassifications.map((classification) => (
//                           <SelectItem key={classification} value={classification}>
//                             {classification}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="sentimentScore">Sentiment Score</Label>}
//                     <Input
//                       id="sentimentScore"
//                       name="sentimentScore"
//                       type="number"
//                       min="-3"
//                       max="3"
//                       step="0.1"
//                       value={row.sentimentScore?.toString() || ''}
//                       onChange={(e) => handleDynamicRowChange(rowIndex, 'sentimentScore', parseFloat(e.target.value) || 0)}
//                       placeholder="Enter score (-3 to 3)"
//                     />
//                   </div>

//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="advertSpend">Advert Spend</Label>}
//                     <Input
//                       id="advertSpend"
//                       name="advertSpend"
//                       type="number"
//                       value={row.advertSpend?.toString() || ''}
//                       onChange={(e) => handleDynamicRowChange(rowIndex, 'advertSpend', parseInt(e.target.value) || 0)}
//                       placeholder="Enter amount"
//                     />
//                   </div>

//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="pageSize">Page Size</Label>}
//                     <Select
//                       value={row.pageSize || ''}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'pageSize', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select page size" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         {pageSizes.map((size) => (
//                           <SelectItem key={size} value={size}>
//                             {size}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                   </div>

//                   <div className="min-w-[160px]">
//                     {rowIndex === 0 && <Label htmlFor="status">Status</Label>}
//                     <Select
//                       value={row.status || 'DRAFT'}
//                       onValueChange={(value) => handleDynamicRowChange(rowIndex, 'status', value)}
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="DRAFT">Draft</SelectItem>
//                         <SelectItem value="PENDING">Pending Review</SelectItem>
//                         <SelectItem value="APPROVED">Approved</SelectItem>
//                         <SelectItem value="REJECTED">Rejected</SelectItem>
//                         <SelectItem value="PUBLISHED">Published</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>
//               ))}

//               </div>
//             </div>
//             </div>
//           </div>

//           {/* Sticky Notes Section */}
//           <div className="border-t border-gray-300 bg-gray-50 p-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <Label htmlFor="analystNote" className="flex items-center mb-2">
//                   Analyst Note
//                   {isFieldReadOnly('analystNote') && <span className="ml-2 text-xs text-gray-500">(Read-only)</span>}
//                 </Label>
//                 <Textarea
//                   id="analystNote"
//                   name="analystNote"
//                   value={editorials[activeIndex]?.analystNote || ''}
//                   onChange={(e) => onFieldChange('analystNote', e.target.value)}
//                   className="h-32 resize-none"
//                   placeholder="Add analyst notes here..."
//                   readOnly={isFieldReadOnly('analystNote')}
//                   disabled={isFieldReadOnly('analystNote')}
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="supervisorNote" className="flex items-center mb-2">
//                   Supervisor Note
//                   {isFieldReadOnly('supervisorNote') && <span className="ml-2 text-xs text-gray-500">(Read-only)</span>}
//                 </Label>
//                 <Textarea
//                   id="supervisorNote"
//                   name="supervisorNote"
//                   value={editorials[activeIndex]?.supervisorNote || ''}
//                   onChange={(e) => onFieldChange('supervisorNote', e.target.value)}
//                   className="h-32 resize-none"
//                   placeholder="Add supervisor notes here..."
//                   readOnly={isFieldReadOnly('supervisorNote')}
//                   disabled={isFieldReadOnly('supervisorNote')}
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="adminNote" className="flex items-center mb-2">
//                   Admin Note
//                   {isFieldReadOnly('adminNote') && <span className="ml-2 text-xs text-gray-500">(Read-only)</span>}
//                 </Label>
//                 <Textarea
//                   id="adminNote"
//                   name="adminNote"
//                   value={editorials[activeIndex]?.adminNote || ''}
//                   onChange={(e) => onFieldChange('adminNote', e.target.value)}
//                   className="h-32 resize-none"
//                   placeholder="Add admin notes here..."
//                   readOnly={isFieldReadOnly('adminNote')}
//                   disabled={isFieldReadOnly('adminNote')}
//                 />
//               </div>
//             </div>

//             {/* Review Actions for Supervisors */}
//             {onReviewAction && (
//               <div className="flex justify-center space-x-4 mt-6 pt-4 border-t border-gray-200">
//                 <Button
//                   onClick={() => onReviewAction('reject')}
//                   variant="destructive"
//                   className="bg-red-600 hover:bg-red-700 text-white px-8 py-2"
//                 >
//                   Reject
//                 </Button>
//                 <Button
//                   onClick={() => onReviewAction('approve')}
//                   className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
//                 >
//                   Approve
//                 </Button>
//               </div>
//             )}

//             {onReviewAction && (
//               <p className="text-sm text-gray-600 mt-2 text-center">
//                 Review the content above and add your notes before approving or rejecting.
//               </p>
//             )}
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default EditorialForm;
