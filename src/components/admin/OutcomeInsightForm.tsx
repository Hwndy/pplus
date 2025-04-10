import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Textarea } from "@/components/ui/textarea";
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface OutcomeData {
  socialMediaEngagement: {
    percentage: number;
    description: string;
  };
  mediaCoverage: {
    percentage: number;
    description: string;
  };
  competitorComparison: {
    percentage: number;
    description: string;
  };
  recommendations: string[];
}

export function OutcomeInsightForm({ onClose }: { onClose?: () => void }) {
  const [date, setDate] = useState<Date>();
  const [selectedCompany, setSelectedCompany] = useState("");
  const [outcomeData, setOutcomeData] = useState<OutcomeData>({
    socialMediaEngagement: {
      percentage: 0,
      description: ''
    },
    mediaCoverage: {
      percentage: 0,
      description: ''
    },
    competitorComparison: {
      percentage: 0,
      description: ''
    },
    recommendations: ['']
  });

  const companies = [
    { value: "company-a", label: "Company A" },
    { value: "company-b", label: "Company B" },
  ];

  const updateMetric = (
    metric: keyof Omit<OutcomeData, 'recommendations'>,
    field: 'percentage' | 'description',
    value: string | number
  ) => {
    setOutcomeData(prev => ({
      ...prev,
      [metric]: {
        ...prev[metric],
        [field]: field === 'percentage' ? Number(value) : value
      }
    }));
  };

  const updateRecommendation = (index: number, value: string) => {
    setOutcomeData(prev => ({
      ...prev,
      recommendations: prev.recommendations.map((rec, i) => 
        i === index ? value : rec
      )
    }));
  };

  const addRecommendation = () => {
    setOutcomeData(prev => ({
      ...prev,
      recommendations: [...prev.recommendations, '']
    }));
  };

  const removeRecommendation = (index: number) => {
    if (outcomeData.recommendations.length > 1) {
      setOutcomeData(prev => ({
        ...prev,
        recommendations: prev.recommendations.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = () => {
    if (!selectedCompany || !date) {
      alert('Please select a company and date');
      return;
    }

    console.log({
      company: selectedCompany,
      date,
      outcomeData
    });
    onClose?.();
  };

  return (
    <div className="space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto p-4">
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
            <PopoverContent className="w-auto p-0" align="start">
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

      <div className="space-y-6">
        {Object.entries(outcomeData).map(([key, value]) => {
          if (key === 'recommendations') {
            return (
              <div key={key} className="space-y-3">
                <h3 className="text-lg font-semibold">Recommendations</h3>
                {outcomeData.recommendations.map((rec, index) => (
                  <div key={index} className="flex gap-2">
                    <Textarea
                      value={rec}
                      onChange={(e) => updateRecommendation(index, e.target.value)}
                      placeholder="Enter recommendation"
                      className="flex-1"
                    />
                    {outcomeData.recommendations.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRecommendation(index)}
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
                  onClick={addRecommendation}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Recommendation
                </Button>
              </div>
            );
          }

          return (
            <div key={key} className="space-y-3">
              <h3 className="text-lg font-semibold capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <div className="flex gap-4">
                <Input
                  type="number"
                  className="w-24"
                  value={value.percentage}
                  onChange={(e) => updateMetric(key as keyof Omit<OutcomeData, 'recommendations'>, 'percentage', e.target.value)}
                  placeholder="%"
                />
                <Textarea
                  value={value.description}
                  onChange={(e) => updateMetric(key as keyof Omit<OutcomeData, 'recommendations'>, 'description', e.target.value)}
                  placeholder={`Describe the ${key.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`}
                  className="flex-1"
                />
              </div>
            </div>
          );
        })}
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
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}