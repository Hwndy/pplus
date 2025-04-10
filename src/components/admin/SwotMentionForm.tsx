import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, X } from "lucide-react";

interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export function SwotMentionForm({ onClose }: { onClose?: () => void }) {
  const [date, setDate] = useState<Date>();
  const [selectedCompany, setSelectedCompany] = useState("");
  const [swotData, setSwotData] = useState<SwotData>({
    strengths: [''],
    weaknesses: [''],
    opportunities: [''],
    threats: ['']
  });
  const [analystNote, setAnalystNote] = useState("");
  const [supervisorNote, setSupervisorNote] = useState("");

  const companies = [
    { label: "Company A", value: "company-a" },
    { label: "Company B", value: "company-b" },
  ];

  const addField = (category: keyof SwotData) => {
    setSwotData(prev => ({
      ...prev,
      [category]: [...prev[category], '']
    }));
  };

  const removeField = (category: keyof SwotData, index: number) => {
    if (swotData[category].length > 1) {
      setSwotData(prev => ({
        ...prev,
        [category]: prev[category].filter((_, i) => i !== index)
      }));
    }
  };

  const updateField = (category: keyof SwotData, index: number, value: string) => {
    setSwotData(prev => ({
      ...prev,
      [category]: prev[category].map((item, i) => i === index ? value : item)
    }));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!selectedCompany || !date) {
      alert('Please select a company and date');
      return;
    }

    // Check if at least one entry exists in each SWOT category
    const hasEmptyCategories = Object.entries(swotData).some(([_, items]) => 
      items.every(item => !item.trim())
    );

    if (hasEmptyCategories) {
      alert('Please add at least one entry for each SWOT category');
      return;
    }

    // Here you would typically send the data to your backend
    const formData = {
      company: selectedCompany,
      date,
      swotData,
      analystNote,
      supervisorNote,
      createdAt: new Date(),
      status: 'pending'
    };

    // TODO: Replace with actual API call
    console.log('Submitting SWOT mention:', formData);
    
    // Close the form after successful submission
    onClose?.();
  };

  const handleCancel = () => {
    // Show confirmation if form has been modified
    const isFormModified = selectedCompany || date || 
      Object.values(swotData).some(items => items.some(item => item.trim() !== '')) ||
      analystNote || supervisorNote;

    if (isFormModified) {
      if (window.confirm('Are you sure you want to discard your changes?')) {
        onClose?.();
      }
    } else {
      onClose?.();
    }
  };

  return (
    <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
      <div className="flex gap-4 sticky top-0 bg-white z-10 pb-4">
        <div className="w-1/2">
          <Combobox
            items={companies}
            placeholder="Search for a company"
            value={selectedCompany}
            onChange={setSelectedCompany}
          />
        </div>
        <div className="w-1/2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {Object.entries(swotData).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-700 capitalize sticky top-16 bg-white z-10">
              {category}
            </h3>
            {items.map((item, index) => (
              <div key={`${category}-${index}`} className="flex gap-2">
                <Textarea
                  value={item}
                  onChange={(e) => updateField(category as keyof SwotData, index, e.target.value)}
                  placeholder={`Enter ${category.slice(0, -1)}`}
                  className="min-h-[80px]"
                />
                {items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeField(category as keyof SwotData, index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addField(category as keyof SwotData)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add {category.slice(0, -1)}
            </Button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="mb-2 text-sm font-medium">Analyst Note</h3>
          <Textarea
            placeholder="Enter analyst note"
            value={analystNote}
            onChange={(e) => setAnalystNote(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
        <div>
          <h3 className="mb-2 text-sm font-medium">Supervisor Note</h3>
          <Textarea
            placeholder="Enter supervisor note"
            value={supervisorNote}
            onChange={(e) => setSupervisorNote(e.target.value)}
            className="min-h-[150px]"
          />
        </div>
      </div>

      <div className="flex gap-2 sticky bottom-0 bg-white pt-4">
        <Button 
          onClick={handleSubmit} 
          className="bg-indigo-950 hover:bg-indigo-900 text-white"
        >
          Save & Send
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}